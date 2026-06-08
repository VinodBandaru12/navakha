// Mode 2 — Document Reader API
// Uses Dexie (IndexedDB) for storage and calls AI APIs directly from the browser,
// exactly the same way Mode 1 does. No backend server needed.

import { callAI } from './aiChat';
import {
  docDb,
  createDocument, updateDocumentBlockCount, setDocumentRenderContent,
  getAllDocuments, getDocumentById, removeDocument,
  saveBlocks, getBlocksByDocumentId, getBlocksBefore,
  addThread, getThreadsByBlockIds,
} from '../db/documentDb';
import { parseFileInBrowser, generateRenderContent, findRelevantBlocks } from './browserChunker';


async function summarisePriorBlocks(text, authOpts = {}) {
  try {
    const { text: summary } = await callAI(
      `Summarise this document content into 200 words. Preserve named entities, events, key facts, and story connections. Output only the summary — no preamble.`,
      [{ role: 'user', content: text }],
      authOpts
    );
    return summary;
  } catch {
    return text.slice(0, 3000);
  }
}

// ── Shape helpers — normalise Dexie rows to what the UI components expect ────

function shapeBlock(b, threads = []) {
  return {
    id: b.id,
    index: b.blockIndex,
    type: b.blockType,
    content: b.content,
    threads: threads.map(t => ({
      id: t.id,
      question: t.question,
      answer: t.answer,
      model_used: t.modelUsed,
      created_at: new Date(t.createdAt).toISOString(),
    })),
  };
}

function shapeDocument(doc) {
  return {
    id: doc.id,
    filename: doc.filename,
    filetype: doc.filetype,
    size_bytes: doc.sizeBytes,
    block_count: doc.blockCount,
    created_at: new Date(doc.createdAt).toISOString(),
  };
}

// ── Public API — same function signatures as the original backend version ─────

export async function uploadDocument(file) {
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > 50) {
    throw new Error('File too large. Maximum 50 MB.');
  }

  // Parse text blocks + generate visual render content in parallel
  const [rawBlocks, renderContent] = await Promise.all([
    parseFileInBrowser(file),
    generateRenderContent(file),
  ]);

  const totalBlocks = rawBlocks.length;
  const truncated = false;

  const doc = await createDocument({
    filename: file.name,
    filetype: file.name.split('.').pop().toLowerCase(),
    sizeBytes: file.size,
  });

  const [blocks] = await Promise.all([
    saveBlocks(doc.id, rawBlocks),
    renderContent ? setDocumentRenderContent(doc.id, renderContent) : Promise.resolve(),
  ]);
  await updateDocumentBlockCount(doc.id, blocks.length);

  return {
    documentId: doc.id,
    blockCount: blocks.length,
    totalBlocks,
    truncated,
  };
}

export async function fetchDocuments() {
  const docs = await getAllDocuments();
  return { documents: docs.map(shapeDocument) };
}

export async function fetchDocument(id) {
  const doc = await getDocumentById(id);
  if (!doc) throw new Error('Document not found');

  const rawBlocks = await getBlocksByDocumentId(id);
  const blockIds = rawBlocks.map(b => b.id);
  const threadsByBlock = await getThreadsByBlockIds(blockIds);

  return {
    document: shapeDocument(doc),
    blocks: rawBlocks.map(b => shapeBlock(b, threadsByBlock[b.id])),
  };
}

export async function askBlock(blockId, question, authOpts = {}) {
  // blockId is the Dexie auto-increment integer
  const blk = await docDb.blocks.get(blockId);
  if (!blk) throw new Error('Block not found');

  // Build full story context from all blocks before this one
  const priorBlocks = await getBlocksBefore(blk.documentId, blk.blockIndex);

  let priorContext;
  if (priorBlocks.length === 0) {
    priorContext = '(This is the first block — no prior context)';
  } else if (priorBlocks.length <= 5) {
    priorContext = priorBlocks.map(b => b.content).join('\n\n');
  } else {
    priorContext = await summarisePriorBlocks(
      priorBlocks.map(b => b.content).join('\n\n'),
      authOpts
    );
  }

  const systemPrompt = `You are Navakha, a friendly AI tutor.
The user is reading a document and asked a question while on a specific section.
Use the full document context provided to answer accurately.
If the question is genuinely unrelated to the document, say so kindly and offer to help with the document content.`;

  const userMessage = `[Story and context so far]:
${priorContext}

[Section the user is currently reading]:
${blk.content}

[User's question]:
${question}`;

  const { text: answer, model } = await callAI(systemPrompt, [{ role: 'user', content: userMessage }], authOpts);

  const thread = await addThread({ blockId, question, answer, modelUsed: model });

  return {
    answer,
    model,
    threadId: thread.id,
  };
}

export async function chatWithDocument(documentId, question, authOpts = {}) {
  const allBlocks = await getBlocksByDocumentId(documentId);

  // Use keyword relevance to find the most relevant blocks
  const relevant = findRelevantBlocks(question, allBlocks, 5);
  const blockContext = relevant.map(b => b.content).join('\n\n---\n\n');

  const { text: answer, model } = await callAI(
    'You are Navakha, a friendly AI tutor. Answer questions about the provided document sections accurately and clearly.',
    [{ role: 'user', content: `[Relevant document sections]:\n${blockContext}\n\n[Question]: ${question}` }],
    authOpts
  );

  return {
    answer,
    model,
    relevantBlocks: relevant.map(b => b.blockIndex),
  };
}

export async function deleteDocument(id) {
  await removeDocument(id);
  return { success: true };
}
