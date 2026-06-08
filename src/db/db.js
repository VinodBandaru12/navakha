import Dexie from 'dexie';

export const db = new Dexie('NavakhaDB');

db.version(1).stores({
  conversations: '++id, title, createdAt, provider',
  messages: '++id, conversationId, parentMessageId, role, timestamp, blockIndex',
  settings: 'key',
});

// ── Conversations ─────────────────────────────────────────────
export async function createConversation(title = 'New Chat', provider = 'openai') {
  const id = await db.conversations.add({
    title,
    createdAt: Date.now(),
    provider,
  });
  return db.conversations.get(id);
}

export async function getConversations() {
  return db.conversations.orderBy('createdAt').reverse().toArray();
}

export async function getConversation(id) {
  return db.conversations.get(id);
}

export async function updateConversationTitle(id, title) {
  return db.conversations.update(id, { title });
}

export async function deleteConversation(id) {
  await db.messages.where('conversationId').equals(id).delete();
  await db.conversations.delete(id);
}

export async function clearAllHistory() {
  await db.messages.clear();
  await db.conversations.clear();
}

// ── Messages ──────────────────────────────────────────────────
export async function addMessage({ conversationId, role, content, parentMessageId = null, isBlock = false, blockIndex = 0 }) {
  const id = await db.messages.add({
    conversationId,
    parentMessageId,
    role,
    content,
    timestamp: Date.now(),
    isBlock,
    blockIndex,
  });
  return db.messages.get(id);
}

export async function getMessages(conversationId) {
  return db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('timestamp');
}

export async function updateMessageContent(id, content) {
  return db.messages.update(id, { content });
}

export async function getMessagesUpTo(conversationId, messageId) {
  const all = await getMessages(conversationId);
  const idx = all.findIndex((m) => m.id === messageId);
  if (idx === -1) return all;
  return all.slice(0, idx + 1);
}

// ── Settings ──────────────────────────────────────────────────
export async function getSetting(key) {
  const row = await db.settings.get(key);
  return row ? row.value : null;
}

export async function setSetting(key, value) {
  return db.settings.put({ key, value });
}

export async function getSettings() {
  const rows = await db.settings.toArray();
  return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
}
