import { useState, useCallback, useEffect } from 'react';
import {
  getMessages,
  addMessage,
  updateMessageContent,
  getMessagesUpTo,
} from '../db/db';
import { buildApiMessages } from '../utils/streamParser';
import { generateTitle } from '../utils/titleGenerator';
import { useStreaming } from './useStreaming';

export function useChat({ conversationId, provider, apiKey, accessToken, onTitleGenerated }) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);
  const { stream, cancel } = useStreaming();

  // Load messages whenever conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
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

    // Determine history to send: either truncated or full
    let historyMessages;
    if (truncateAfterMessageId != null) {
      // Truncated: get messages up to parent, then append new user message
      historyMessages = await getMessagesUpTo(conversationId, truncateAfterMessageId);
    } else {
      // Full history: already includes the user message we just saved
      historyMessages = await getMessages(conversationId);
    }

    // For truncated flow the new user msg isn't in historyMessages yet; for
    // normal flow it IS already there (we saved it above before fetching).
    const apiHistory = truncateAfterMessageId != null
      ? [
          ...historyMessages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userText.trim() },
        ]
      : historyMessages.map((m) => ({ role: m.role, content: m.content }));

    setMessages(await getMessages(conversationId));

    // Create a placeholder AI message in DB
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
      if (e.name !== 'AbortError') {
        setError(e.message);
      }
    } finally {
      setStreaming(false);
      setStreamingContent('');
    }

    // Persist full AI response
    if (fullText) {
      await updateMessageContent(aiMsg.id, fullText);
    }

    const finalMessages = await getMessages(conversationId);
    setMessages(finalMessages);

    // Auto-generate title for new conversations on first message
    if (finalMessages.filter((m) => m.role === 'user').length === 1) {
      try {
        const title = await generateTitle({ provider, apiKey, accessToken, firstUserMessage: userText });
        onTitleGenerated?.(title);
      } catch {
        // ignore title generation errors
      }
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
