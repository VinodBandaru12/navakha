import { useState, useCallback, useEffect } from 'react';
import {
  getMessagesUpTo,
  addMessage,
  getSubchatMessages,
  getConversation,
  db,
} from '../db/db';
import { buildApiMessages } from '../utils/streamParser';
import { useStreaming } from './useStreaming';
import { useAuth } from '../context/AuthContext';
import {
  cloudAddSubchatMessage,
  cloudFetchSubchatMessages,
} from '../lib/cloudStorage';

/**
 * Inline reply sub-chat attached to a specific AI message.
 *
 * Persistence strategy:
 *   All users  → messages saved to IndexedDB with parentMessageId (survives page refresh)
 *   Paying     → also synced to Supabase messages table with parent_message_id
 *
 * Cross-device sync for paying users works because:
 *   - parentCloudMsgId is stored on the local DB message row (cloudMsgId field)
 *   - On a fresh device, cloud messages are pulled by useConversations + parent is matched
 */
export function useInlineReply({ conversationId, provider, apiKey, accessToken, truncateAfterMessageId }) {
  const [cardMessages, setCardMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);
  const { stream, cancel } = useStreaming();
  const { user, profile } = useAuth();
  const isPaying = profile?.plan && profile.plan !== 'free';

  // Load existing subchat messages from IndexedDB on mount
  useEffect(() => {
    if (!conversationId || !truncateAfterMessageId) return;
    getSubchatMessages(conversationId, truncateAfterMessageId)
      .then(rows => {
        if (rows.length) {
          setCardMessages(rows.map(m => ({ id: m.id, role: m.role, content: m.content })));
        }
      })
      .catch(() => {});
  }, [conversationId, truncateAfterMessageId]);

  const send = useCallback(async (text) => {
    if (!text.trim() || (!apiKey && !accessToken) || !conversationId) return;
    setError(null);

    // ── Save user message to IndexedDB ────────────────────────────────────────
    const userDbMsg = await addMessage({
      conversationId,
      role: 'user',
      content: text.trim(),
      parentMessageId: truncateAfterMessageId,
    });

    const updatedMessages = [...cardMessages, { id: userDbMsg.id, role: 'user', content: text.trim() }];
    setCardMessages(updatedMessages);

    // ── Cloud sync for paying users ────────────────────────────────────────────
    if (isPaying && user) {
      try {
        const conv = await getConversation(conversationId);
        const parentMsg = await db.messages.get(truncateAfterMessageId);
        if (conv?.cloudId && parentMsg?.cloudMsgId) {
          cloudAddSubchatMessage(conv.cloudId, user.id, 'user', text.trim(), parentMsg.cloudMsgId)
            .then(cloudMsgId => db.messages.update(userDbMsg.id, { cloudMsgId }))
            .catch(e => console.warn('[subchat] cloud user msg failed:', e.message));
        }
      } catch { /* cloud sync is non-fatal */ }
    }

    // Build context: DB history up to parent + all subchat messages so far
    const dbHistory = await getMessagesUpTo(conversationId, truncateAfterMessageId);
    const apiHistory = [
      ...dbHistory.map(m => ({ role: m.role, content: m.content })),
      ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
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
          setStreamingContent(prev => prev + delta);
        },
      });
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'Something went wrong');
    } finally {
      setStreaming(false);
      setStreamingContent('');
    }

    if (fullText) {
      // ── Save AI message to IndexedDB ──────────────────────────────────────────
      const aiDbMsg = await addMessage({
        conversationId,
        role: 'assistant',
        content: fullText,
        parentMessageId: truncateAfterMessageId,
      });

      setCardMessages(prev => [...prev, { id: aiDbMsg.id, role: 'assistant', content: fullText }]);

      // ── Cloud sync ─────────────────────────────────────────────────────────────
      if (isPaying && user) {
        try {
          const conv = await getConversation(conversationId);
          const parentMsg = await db.messages.get(truncateAfterMessageId);
          if (conv?.cloudId && parentMsg?.cloudMsgId) {
            cloudAddSubchatMessage(conv.cloudId, user.id, 'assistant', fullText, parentMsg.cloudMsgId)
              .then(cloudMsgId => db.messages.update(aiDbMsg.id, { cloudMsgId }))
              .catch(e => console.warn('[subchat] cloud ai msg failed:', e.message));
          }
        } catch { /* non-fatal */ }
      }
    }
  }, [conversationId, provider, apiKey, accessToken, truncateAfterMessageId, cardMessages, stream, isPaying, user]);

  const cancelStream = useCallback(() => {
    cancel();
    setStreaming(false);
    setStreamingContent('');
  }, [cancel]);

  return { send, cancel: cancelStream, streaming, streamingContent, cardMessages, error };
}
