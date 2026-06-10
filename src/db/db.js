import Dexie from 'dexie';

export const db = new Dexie('NavakhaDB');

db.version(1).stores({
  conversations: '++id, title, createdAt, provider',
  messages: '++id, conversationId, parentMessageId, role, timestamp, blockIndex',
  settings: 'key',
});

db.version(2).stores({
  conversations: '++id, title, createdAt, provider, cloudId',
  messages: '++id, conversationId, parentMessageId, role, timestamp, blockIndex, cloudMsgId',
  settings: 'key',
});

// v3: conversations use string UUID primary keys (old integer-keyed records remain accessible)
db.version(3).stores({
  conversations: 'id, title, createdAt, provider, cloudId',
  messages: '++id, conversationId, parentMessageId, role, timestamp, blockIndex, cloudMsgId',
  settings: 'key',
});

// ── Conversations ─────────────────────────────────────────────
export async function createConversation(title = 'New Chat', provider = 'openai') {
  const id = crypto.randomUUID();
  await db.conversations.put({ id, title, createdAt: Date.now(), provider });
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

export async function updateConversationSummary(id, contextSummary, summarizedCount) {
  return db.conversations.update(id, { contextSummary, summarizedCount });
}

export async function setConversationCloudId(id, cloudId) {
  return db.conversations.update(id, { cloudId });
}

export async function setMessageCloudId(id, cloudMsgId) {
  return db.messages.update(id, { cloudMsgId });
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
