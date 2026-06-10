import { useState, useEffect, useCallback } from 'react';
import {
  getConversations,
  createConversation,
  deleteConversation,
  updateConversationTitle,
  clearAllHistory,
  setConversationCloudId,
  db,
} from '../db/db';
import {
  cloudCreateConversation,
  cloudUpdateConversationTitle,
  cloudDeleteConversation,
  cloudFetchConversations,
  cloudFetchMessages,
} from '../lib/cloudStorage';
import { useAuth } from '../context/AuthContext';

export function useConversations() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const isPro = profile?.plan && profile.plan !== 'free';

  const refresh = useCallback(async () => {
    const convs = await getConversations();
    setConversations(convs);
  }, []);

  // Pull from cloud on first login for Pro users on a new device
  useEffect(() => {
    if (!isPro || !user) return;

    const pullIfEmpty = async () => {
      const local = await getConversations();
      if (local.length > 0) return; // already have data here

      const cloudConvs = await cloudFetchConversations(user.id).catch(() => []);
      if (!cloudConvs.length) return;

      for (const cc of cloudConvs) {
        const localId = await db.conversations.add({
          title: cc.title,
          createdAt: new Date(cc.created_at).getTime(),
          provider: cc.provider || 'anthropic',
          cloudId: cc.id,
        });
        const cloudMsgs = await cloudFetchMessages(cc.id).catch(() => []);
        for (const cm of cloudMsgs) {
          await db.messages.add({
            conversationId: localId,
            role: cm.role,
            content: cm.content,
            timestamp: new Date(cm.created_at).getTime(),
            cloudMsgId: cm.id,
            parentMessageId: null,
            isBlock: false,
            blockIndex: 0,
          });
        }
      }

      await refresh();
    };

    pullIfEmpty();
  }, [isPro, user, refresh]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const createNew = useCallback(async (provider = 'openai') => {
    const conv = await createConversation('New Chat', provider);

    if (isPro && user) {
      cloudCreateConversation(user.id, 'New Chat', provider)
        .then(cloudId => setConversationCloudId(conv.id, cloudId))
        .catch(e => console.warn('[cloud] createConversation failed:', e));
    }

    await refresh();
    return conv;
  }, [refresh, isPro, user]);

  const rename = useCallback(async (id, title) => {
    await updateConversationTitle(id, title);

    if (isPro) {
      const conv = await db.conversations.get(id);
      if (conv?.cloudId) {
        cloudUpdateConversationTitle(conv.cloudId, title)
          .catch(e => console.warn('[cloud] updateTitle failed:', e));
      }
    }

    await refresh();
  }, [refresh, isPro]);

  const remove = useCallback(async (id) => {
    if (isPro) {
      const conv = await db.conversations.get(id);
      if (conv?.cloudId) {
        cloudDeleteConversation(conv.cloudId)
          .catch(e => console.warn('[cloud] deleteConversation failed:', e));
      }
    }

    await deleteConversation(id);
    await refresh();
  }, [refresh, isPro]);

  const clearAll = useCallback(async () => {
    // For Pro users: also delete all cloud conversations
    if (isPro && user) {
      cloudFetchConversations(user.id)
        .then(cloudConvs =>
          Promise.all(cloudConvs.map(c => cloudDeleteConversation(c.id)))
        )
        .catch(e => console.warn('[cloud] clearAll failed:', e));
    }

    await clearAllHistory();
    setConversations([]);
  }, [isPro, user]);

  const grouped = groupByDate(conversations);

  return { conversations, grouped, loading, refresh, createNew, rename, remove, clearAll };
}

function groupByDate(convs) {
  const now = Date.now();
  const DAY = 86400000;
  const groups = { today: [], yesterday: [], last7days: [], older: [] };

  for (const c of convs) {
    const age = now - c.createdAt;
    if (age < DAY) groups.today.push(c);
    else if (age < 2 * DAY) groups.yesterday.push(c);
    else if (age < 7 * DAY) groups.last7days.push(c);
    else groups.older.push(c);
  }

  return groups;
}
