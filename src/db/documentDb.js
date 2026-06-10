import Dexie from 'dexie';

export const docDb = new Dexie('NavakhaDocsDB');

// version 1 kept for migration path
docDb.version(1).stores({
  documents:     '++id, filename, filetype, createdAt',
  blocks:        '++id, documentId, blockIndex',
  block_threads: '++id, blockId, createdAt',
});

// version 2 — same indexes, new non-indexed fields: renderHtml, rawFileData
docDb.version(2).stores({
  documents:     '++id, filename, filetype, createdAt',
  blocks:        '++id, documentId, blockIndex',
  block_threads: '++id, blockId, createdAt',
});

// version 3 — adds doc_chats for DocSubChat persistence (free users)
docDb.version(3).stores({
  documents:     '++id, filename, filetype, createdAt',
  blocks:        '++id, documentId, blockIndex',
  block_threads: '++id, blockId, createdAt',
  doc_chats:     '++id, documentId, createdAt',
});

// ── Documents ─────────────────────────────────────────────────────────────────

export async function createDocument({ filename, filetype, sizeBytes }) {
  const id = await docDb.documents.add({
    filename,
    filetype,
    sizeBytes,
    blockCount: 0,
    createdAt: Date.now(),
  });
  return docDb.documents.get(id);
}

export async function updateDocumentBlockCount(id, count) {
  return docDb.documents.update(id, { blockCount: count });
}

export async function setDocumentRenderContent(id, { renderHtml, rawFileData }) {
  const update = {};
  if (renderHtml !== undefined) update.renderHtml = renderHtml;
  if (rawFileData !== undefined) update.rawFileData = rawFileData;
  return docDb.documents.update(id, update);
}

export async function getAllDocuments() {
  return docDb.documents.orderBy('createdAt').reverse().toArray();
}

export async function getDocumentById(id) {
  return docDb.documents.get(id);
}

export async function removeDocument(id) {
  const blocks = await docDb.blocks.where('documentId').equals(id).toArray();
  const blockIds = blocks.map(b => b.id);
  if (blockIds.length) {
    await docDb.block_threads.where('blockId').anyOf(blockIds).delete();
    await docDb.blocks.where('documentId').equals(id).delete();
  }
  await docDb.doc_chats.where('documentId').equals(id).delete();
  await docDb.documents.delete(id);
}

// ── Blocks ────────────────────────────────────────────────────────────────────

export async function saveBlocks(documentId, rawBlocks) {
  const ids = await docDb.blocks.bulkAdd(
    rawBlocks.map((b, i) => ({
      documentId,
      blockIndex: i,
      blockType: b.type,
      content: b.content,
      embedding: b.embedding ?? null,
    })),
    { allKeys: true }
  );
  return docDb.blocks.bulkGet(ids);
}

export async function getBlocksByDocumentId(documentId) {
  return docDb.blocks.where('documentId').equals(documentId).sortBy('blockIndex');
}

export async function getBlocksBefore(documentId, blockIndex) {
  const all = await getBlocksByDocumentId(documentId);
  return all.filter(b => b.blockIndex < blockIndex);
}

// ── Block Threads ─────────────────────────────────────────────────────────────

export async function addThread({ blockId, question, answer, modelUsed }) {
  const id = await docDb.block_threads.add({
    blockId,
    question,
    answer,
    modelUsed,
    createdAt: Date.now(),
  });
  return docDb.block_threads.get(id);
}

export async function getThreadsByBlockIds(blockIds) {
  if (!blockIds.length) return {};
  const threads = await docDb.block_threads
    .where('blockId').anyOf(blockIds)
    .sortBy('createdAt');
  const map = {};
  for (const t of threads) {
    (map[t.blockId] ??= []).push(t);
  }
  return map;
}

// ── Doc Chats (DocSubChat panel — free users / local cache) ───────────────────

export async function addDocChat(documentId, role, content) {
  const id = await docDb.doc_chats.add({
    documentId,
    role,
    content,
    createdAt: Date.now(),
  });
  return docDb.doc_chats.get(id);
}

export async function getDocChatsByDocumentId(documentId) {
  return docDb.doc_chats.where('documentId').equals(documentId).sortBy('createdAt');
}
