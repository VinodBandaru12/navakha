import { useState, useCallback, useEffect } from 'react';
import {
  getMessages,
  addMessage,
  updateMessageContent,
  getMessagesUpTo,
  getConversation,
  updateConversationSummary,
} from '../db/db';
import { buildApiMessages } from '../utils/streamParser';
import { summarizeHistory } from '../utils/summarize';
import { generateTitle } from '../utils/titleGenerator';
import { useStreaming } from './useStreaming';

// Keep the most recent N messages (user+assistant pairs) fresh; summarize the rest.
const FRESH_WINDOW = 20; // 10 exchanges × 2 messages

export function useChat({ conversationId, provider, apiKey, accessToken, onTitleGenerated }) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);
  const { stream, cancel } = useStreaming();

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    getMessages(conversationId).then(setMessages);
  }, [conversationId]);

  const sendMessage = useCallback(async (userText, options = {}) => {
    const { parentMessageId = null, truncateAfterMessageId = null } = options;

    if (!conversationId || (!apiKey && !accessToken) || !userText.trim()) return;

    setError(null);

    // Save user message
    const userMsg = await addMessage({
      conversationId,
      role: 'user',
      content: userText.trim(),
      parentMessageId,
    });

    // Determine history to send
    let historyMessages;
    if (truncateAfterMessageId != null) {
      historyMessages = await getMessagesUpTo(conversationId, truncateAfterMessageId);
    } else {
      historyMessages = await getMessages(conversationId);
    }

    // Build API payload — apply rolling summary when conversation is long enough
    let apiHistory;

    if (
      accessToken &&
      truncateAfterMessageId == null &&
      historyMessages.length > FRESH_WINDOW
    ) {
      const toSummarize = historyMessages.slice(0, historyMessages.length - FRESH_WINDOW);
      const fresh = historyMessages.slice(historyMessages.length - FRESH_WINDOW);

      // Load cached summary; regenerate only when more messages need summarizing
      const conv = await getConversation(conversationId);
      let summary = conv?.contextSummary ?? null;
      const summarizedCount = conv?.summarizedCount ?? 0;

      if (!summary || summarizedCount < toSummarize.length) {
        summary = await summarizeHistory(toSummarize, { accessToken, provider });
        if (summary) {
          await updateConversationSummary(conversationId, summary, toSummarize.length);
        }
      }

      if (summary) {
        apiHistory = [
          { role: 'user', content: `[Earlier conversation summary]:\n${summary}` },
          { role: 'assistant', content: 'Understood, I have the full context.' },
          ...fresh.map(m => ({ role: m.role, content: m.content })),
        ];
      } else {
        // Fallback: send everything if summarization failed
        apiHistory = historyMessages.map(m => ({ role: m.role, content: m.content }));
      }
    } else if (truncateAfterMessageId != null) {
      apiHistory = [
        ...historyMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userText.trim() },
      ];
    } else {
      apiHistory = historyMessages.map(m => ({ role: m.role, content: m.content }));
    }

    setMessages(await getMessages(conversationId));

    // Create placeholder AI message
    const aiMsg = await addMessage({
      conversationId,
      role: 'assistant',
      content: '',
      parentMessageId: userMsg.id,
    });

    setMessages(await getMessages(conversationId));
    setStreaming(true);
    setStreamingContent('');

    let fullText = '';

    try {
      fullText = await stream({
        provider,
        apiKey,
        accessToken,
        messages: buildApiMessages(apiHistory),
        onDelta: (delta) => {
          fullText += delta;
          setStreamingContent((prev) => prev + delta);
        },
      });
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setStreaming(false);
      setStreamingContent('');
    }

    if (fullText) await updateMessageContent(aiMsg.id, fullText);

    const finalMessages = await getMessages(conversationId);
    setMessages(finalMessages);

    if (finalMessages.filter(m => m.role === 'user').length === 1) {
      try {
        const title = await generateTitle({ provider, apiKey, accessToken, firstUserMessage: userText });
        onTitleGenerated?.(title);
      } catch { /* ignore */ }
    }

    return aiMsg.id;
  }, [conversationId, provider, apiKey, accessToken, stream, onTitleGenerated]);

  const cancelStream = useCallback(() => {
    cancel();
    setStreaming(false);
    setStreamingContent('');
  }, [cancel]);

  return {
    messages,
    streaming,
    streamingContent,
    error,
    sendMessage,
    cancelStream,
    refreshMessages: () => conversationId && getMessages(conversationId).then(setMessages),
  };
}
