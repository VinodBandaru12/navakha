import { useState, useCallback } from 'react';
import { getMessagesUpTo } from '../db/db';
import { buildApiMessages } from '../utils/streamParser';
import { useStreaming } from './useStreaming';

/**
 * Self-contained hook for the floating inline reply card.
 * Messages are kept in local state only — they don't appear in the main chat feed.
 * The API receives the truncated DB history + all local card messages for context.
 */
export function useInlineReply({ conversationId, provider, apiKey, accessToken, truncateAfterMessageId }) {
  const [cardMessages, setCardMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);
  const { stream, cancel } = useStreaming();

  const send = useCallback(async (text) => {
    if (!text.trim() || (!apiKey && !accessToken) || !conversationId) return;
    setError(null);

    const userMsg = { id: Date.now(), role: 'user', content: text.trim() };
    const updatedMessages = [...cardMessages, userMsg];
    setCardMessages(updatedMessages);

    // Build context: DB history up to parent + all card messages so far + new user msg
    const dbHistory = await getMessagesUpTo(conversationId, truncateAfterMessageId);
    const apiHistory = [
      ...dbHistory.map((m) => ({ role: m.role, content: m.content })),
      ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

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
      if (e.name !== 'AbortError') setError(e.message || 'Something went wrong');
    } finally {
      setStreaming(false);
      setStreamingContent('');
    }

    if (fullText) {
      setCardMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: fullText }]);
    }
  }, [conversationId, provider, apiKey, accessToken, truncateAfterMessageId, cardMessages, stream]);

  const cancelStream = useCallback(() => {
    cancel();
    setStreaming(false);
    setStreamingContent('');
  }, [cancel]);

  return { send, cancel: cancelStream, streaming, streamingContent, cardMessages, error };
}
