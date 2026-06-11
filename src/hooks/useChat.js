import { useState, useCallback, useEffect } from 'react';
import {
  getMessages,
  addMessage,
  updateMessageContent,
  getMessagesUpTo,
  getConversation,
  updateConversationSummary,
  db,
} from '../db/db';
import { buildApiMessages } from '../utils/streamParser';
import { summarizeHistory } from '../utils/summarize';
import { generateTitle } from '../utils/titleGenerator';
import { useStreaming } from './useStreaming';
import { cloudAddMessage } from '../lib/cloudStorage';
import { useAuth } from '../context/AuthContext';

// Summarize in batches: every BATCH_SIZE messages, summarize completed batches, keep the rest fresh.
const BATCH_SIZE = 10;

export function useChat({ conversationId, provider, apiKey, accessToken, onTitleGenerated }) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);
  const { stream, cancel } = useStreaming();
  const { user, profile } = useAuth();
  const isPro = profile?.plan && profile.plan !== 'free';

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

    // Cloud sync: write user message for Pro users
    if (isPro && user) {
      const conv = await getConversation(conversationId);
      if (conv?.cloudId) {
        cloudAddMessage(conv.cloudId, user.id, 'user', userText.trim())
          .catch(e => console.warn('[cloud] addMessage(user) failed:', e));
      }
    }

    // Determine history to send
    let historyMessages;
    if (truncateAfterMessageId != null) {
      historyMessages = await getMessagesUpTo(conversationId, truncateAfterMessageId);
    } else {
      historyMessages = await getMessages(conversationId);
    }

    // Build API payload — summarize completed 10-message batches, keep the rest fresh
    let apiHistory;

    const completedBatches = Math.floor((historyMessages.length - 1) / BATCH_SIZE);

    if (
      accessToken &&
      truncateAfterMessageId == null &&
      completedBatches >= 1
    ) {
      const summarizableCount = completedBatches * BATCH_SIZE;
      const toSummarize = historyMessages.slice(0, summarizableCount);
      const fresh = historyMessages.slice(summarizableCount);

      // Load cached summary; regenerate only when more messages need summarizing
      const conv = await getConversation(conversationId);
      let summary = conv?.contextSummary ?? null;
      const summarizedCount = conv?.summarizedCount ?? 0;

      if (!summary || summarizedCount < toSummarize.length) {
        // Incremental: only send the new batch + existing summary, not all raw messages
        const newBatch = summary ? toSummarize.slice(summarizedCount) : toSummarize;
        summary = await summarizeHistory(newBatch, { accessToken, provider, existingSummary: summary });
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

    if (fullText) {
      await updateMessageContent(aiMsg.id, fullText);

      // Cloud sync: write completed AI message for Pro users
      if (isPro && user) {
        const conv = await getConversation(conversationId);
        if (conv?.cloudId) {
          cloudAddMessage(conv.cloudId, user.id, 'assistant', fullText)
            .catch(e => console.warn('[cloud] addMessage(assistant) failed:', e));
        }
      }
    }

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
