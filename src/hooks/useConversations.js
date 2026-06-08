import { useState, useEffect, useCallback } from 'react';
import {
  getConversations,
  createConversation,
  deleteConversation,
  updateConversationTitle,
  clearAllHistory,
} from '../db/db';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const convs = await getConversations();
    setConversations(convs);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const createNew = useCallback(async (provider = 'openai') => {
    const conv = await createConversation('New Chat', provider);
    await refresh();
    return conv;
  }, [refresh]);

  const rename = useCallback(async (id, title) => {
    await updateConversationTitle(id, title);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id) => {
    await deleteConversation(id);
    await refresh();
  }, [refresh]);

  const clearAll = useCallback(async () => {
    await clearAllHistory();
    setConversations([]);
  }, []);

  // Group conversations by time bucket
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
