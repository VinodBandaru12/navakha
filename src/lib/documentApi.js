// Document API — branches by plan:
//   free users  → IndexedDB (Dexie) only, no server storage
//   paying users → Supabase Storage + Supabase DB (cloud path)

import { callAI } from './aiChat';
import { supabase } from './supabase';
import {
  docDb,
  createDocument, updateDocumentBlockCount, setDocumentRenderContent,
  getAllDocuments, getDocumentById, removeDocument,
  saveBlocks, getBlocksByDocumentId, getBlocksBefore,
  addThread, getThreadsByBlockIds,
} from '../db/documentDb';
import { parseFileInBrowser, generateRenderContent, findRelevantBlocks } from './browserChunker';
import {
  cloudFetchDocuments,
  cloudFetchDocument,
  cloudDeleteDocument,
  cloudSaveBlockThread,
} from './cloudStorage';

// UUID test — cloud documents have UUID IDs; IndexedDB docs have integer IDs
const isCloudId = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

// ── Embedding helpers ─────────────────────────────────────────────────────────

async function generateEmbeddings(texts, accessToken) {
  const res = await fetch('/api/embed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ texts }),
  });
  if (!res.ok) throw new Error('Embedding API failed');
  const { embeddings } = await res.json();
  return embeddings;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export async function findBlocksByEmbedding(question, blocks, accessToken, topN = 5) {
  const withEmbedding = blocks.filter(b => b.embedding);
  if (!withEmbedding.length || !accessToken) {
    return findRelevantBlocks(question, blocks, topN);
  }
  try {
    const [queryEmbedding] = await generateEmbeddings([question], accessToken);
    const scored = withEmbedding.map(b => ({
      block: b,
      score: cosineSimilarity(queryEmbedding, b.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN).map(x => x.block);
  } catch {
    return findRelevantBlocks(question, blocks, topN);
  }
}

// ── Prior-block summariser ─────────────────────────────────────────────────────

async function summarisePriorBlocks(text, authOpts = {}) {
  try {
    const { text: summary } = await callAI(
      `Summarise this document content into 200 words. Preserve named entities, events, key facts, and story connections. Output only the summary — no preamble.`,
      [{ role: 'user', content: text }],
      { ...authOpts, isSummary: true }
    );
    return summary;
  } catch {
    return text.slice(0, 3000);
  }
}

// ── Shape helpers ─────────────────────────────────────────────────────────────

function shapeBlock(b, threads = []) {
  return {
    id: b.id,
    index: b.blockIndex ?? b.block_index,
    type: b.blockType ?? b.block_type,
    content: b.content,
    embedding: b.embedding ?? null,
    threads: threads.map(t => ({
      id: t.id,
      question: t.question,
      answer: t.answer,
      model_used: t.modelUsed ?? t.model_used,
      created_at: t.createdAt ? new Date(t.createdAt).toISOString() : t.created_at,
    })),
  };
}

function shapeDocument(doc) {
  return {
    id: doc.id,
    filename: doc.filename,
    filetype: doc.filetype,
    size_bytes: doc.sizeBytes ?? doc.size_bytes,
    block_count: doc.blockCount ?? doc.block_count,
    created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : doc.created_at,
    // renderHtml / rawFileData only exist for IndexedDB docs
    renderHtml: doc.renderHtml,
    rawFileData: doc.rawFileData,
  };
}

// ── Upload ────────────────────────────────────────────────────────────────────

/**
 * Upload a document.
 * authOpts: { accessToken, isPaying }
 *   - Free users: IndexedDB only, 2-doc limit.
 *   - Paying users: Supabase Storage via presigned URL + cloud blocks.
 */
export async function uploadDocument(file, authOpts = {}) {
  const { accessToken, isPaying } = authOpts;

  if (isPaying && accessToken) {
    return uploadCloudDocument(file, accessToken);
  }
  return uploadLocalDocument(file, authOpts);
}

async function uploadLocalDocument(file, authOpts = {}) {
  const { accessToken } = authOpts;

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > 50) throw new Error('File too large. Maximum 50 MB.');

  const existing = await getAllDocuments();
  if (existing.length >= 2) {
    throw new Error('Free plan allows 2 documents. Upgrade to upload more.');
  }

  const [rawBlocks, renderContent] = await Promise.all([
    parseFileInBrowser(file),
    generateRenderContent(file),
  ]);

  const doc = await createDocument({
    filename: file.name,
    filetype: file.name.split('.').pop().toLowerCase(),
    sizeBytes: file.size,
  });

  let embeddings = [];
  if (accessToken && rawBlocks.length > 0) {
    try {
      embeddings = await generateEmbeddings(rawBlocks.map(b => b.content), accessToken);
    } catch { /* optional */ }
  }

  const blocksWithEmbeddings = rawBlocks.map((b, i) => ({
    ...b,
    embedding: embeddings[i] ?? null,
  }));

  const [blocks] = await Promise.all([
    saveBlocks(doc.id, blocksWithEmbeddings),
    renderContent ? setDocumentRenderContent(doc.id, renderContent) : Promise.resolve(),
  ]);
  await updateDocumentBlockCount(doc.id, blocks.length);

  return {
    documentId: doc.id,
    blockCount: blocks.length,
    totalBlocks: rawBlocks.length,
    truncated: false,
    isCloud: false,
  };
}

async function uploadCloudDocument(file, accessToken) {
  // ── Step 1: Presign ──────────────────────────────────────────────────────────
  const presignRes = await fetch('/api/doc-presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ filename: file.name, size_bytes: file.size }),
  });

  if (!presignRes.ok) {
    const { error } = await presignRes.json().catch(() => ({}));
    throw new Error(error || 'Failed to get upload URL');
  }

  const { signedUrl, documentId } = await presignRes.json();

  // ── Step 2: Upload directly to Supabase Storage (bypasses Vercel 4.5 MB limit) ─
  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('File upload to storage failed');
  }

  // ── Step 3: Parse blocks in the browser (reuse existing chunker) ──────────────
  const [rawBlocks, renderContent] = await Promise.all([
    parseFileInBrowser(file),
    generateRenderContent(file),
  ]);

  // ── Step 4: Send blocks to server for embedding + Supabase save ───────────────
  const processRes = await fetch('/api/doc-process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      documentId,
      blocks: rawBlocks.map(b => ({ type: b.type, content: b.content })),
    }),
  });

  if (!processRes.ok) {
    const { error } = await processRes.json().catch(() => ({}));
    throw new Error(error || 'Block processing failed');
  }

  const { blockCount } = await processRes.json();

  // ── Step 5: Also cache the visual render in IndexedDB for this device ─────────
  if (renderContent) {
    // Store render under a key that links to the cloud document ID
    try {
      const doc = await createDocument({
        filename: file.name,
        filetype: file.name.split('.').pop().toLowerCase(),
        sizeBytes: file.size,
      });
      await setDocumentRenderContent(doc.id, renderContent);
      // Tag local record so we know it mirrors the cloud doc
      await docDb.documents.update(doc.id, { cloudId: documentId });
    } catch { /* visual cache is non-critical */ }
  }

  return {
    documentId,
    blockCount,
    totalBlocks: rawBlocks.length,
    truncated: false,
    isCloud: true,
  };
}

// ── List documents ────────────────────────────────────────────────────────────

export async function fetchDocuments(authOpts = {}) {
  const { isPaying, userId } = authOpts;

  if (isPaying && userId) {
    // Cloud: fetch from Supabase
    const cloudDocs = await cloudFetchDocuments(userId);
    return { documents: cloudDocs.map(shapeDocument) };
  }

  // Free: fetch from IndexedDB
  const docs = await getAllDocuments();
  return { documents: docs.map(shapeDocument) };
}

// ── Fetch single document + blocks + threads ──────────────────────────────────

export async function fetchDocument(id, authOpts = {}) {
  if (isCloudId(id)) {
    return fetchCloudDocument(id);
  }
  return fetchLocalDocument(id);
}

async function fetchLocalDocument(id) {
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

async function fetchCloudDocument(id) {
  const result = await cloudFetchDocument(id);
  if (!result) throw new Error('Document not found');

  const { doc, blocks, threadsByBlockId } = result;

  return {
    document: shapeDocument(doc),
    blocks: blocks.map(b => shapeBlock(b, threadsByBlockId[b.id] ?? [])),
  };
}

// ── Ask a block ───────────────────────────────────────────────────────────────

export async function askBlock(blockId, question, authOpts = {}) {
  if (isCloudId(blockId)) {
    return askCloudBlock(blockId, question, authOpts);
  }
  return askLocalBlock(blockId, question, authOpts);
}

async function askLocalBlock(blockId, question, authOpts = {}) {
  const blk = await docDb.blocks.get(blockId);
  if (!blk) throw new Error('Block not found');

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
If the question is genuinely unrelated to the document, say so kindly.`;

  const userMessage = `[Story and context so far]:\n${priorContext}\n\n[Section the user is currently reading]:\n${blk.content}\n\n[User's question]:\n${question}`;

  const { text: answer, model } = await callAI(systemPrompt, [{ role: 'user', content: userMessage }], authOpts);

  const thread = await addThread({ blockId, question, answer, modelUsed: model });

  return { answer, model, threadId: thread.id };
}

async function askCloudBlock(blockId, question, authOpts = {}) {
  // Fetch block + prior blocks from Supabase
  const { data: blk } = await supabase
    .from('blocks')
    .select('id, document_id, block_index, content')
    .eq('id', blockId)
    .single();

  if (!blk) throw new Error('Block not found');

  const { data: priorRows } = await supabase
    .from('blocks')
    .select('content')
    .eq('document_id', blk.document_id)
    .lt('block_index', blk.block_index)
    .order('block_index', { ascending: true });

  const priorBlocks = priorRows ?? [];

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
If the question is genuinely unrelated to the document, say so kindly.`;

  const userMessage = `[Story and context so far]:\n${priorContext}\n\n[Section the user is currently reading]:\n${blk.content}\n\n[User's question]:\n${question}`;

  const { text: answer, model } = await callAI(systemPrompt, [{ role: 'user', content: userMessage }], authOpts);

  // Save thread to Supabase
  const { user } = authOpts;
  let threadId = null;
  if (user) {
    try {
      threadId = await cloudSaveBlockThread(blockId, blk.document_id, user.id, question, answer, model);
    } catch (e) {
      console.warn('[askCloudBlock] thread save failed:', e.message);
    }
  }

  return { answer, model, threadId };
}

// ── Document-level chat (DocSubChat) ──────────────────────────────────────────

export async function chatWithDocument(documentId, question, authOpts = {}) {
  const { accessToken } = authOpts;

  let allBlocks;
  if (isCloudId(documentId)) {
    const { data } = await supabase
      .from('blocks')
      .select('id, block_index, content, embedding')
      .eq('document_id', documentId)
      .order('block_index', { ascending: true });
    allBlocks = (data ?? []).map(b => ({ ...b, blockIndex: b.block_index }));
  } else {
    allBlocks = await getBlocksByDocumentId(documentId);
  }

  const relevant = await findBlocksByEmbedding(question, allBlocks, accessToken, 5);
  const blockContext = relevant.map(b => b.content).join('\n\n---\n\n');

  const { text: answer, model } = await callAI(
    'You are Navakha, a friendly AI tutor. Answer questions about the provided document sections accurately and clearly.',
    [{ role: 'user', content: `[Relevant document sections]:\n${blockContext}\n\n[Question]: ${question}` }],
    authOpts
  );

  return {
    answer,
    model,
    relevantBlocks: relevant.map(b => b.blockIndex ?? b.index),
  };
}

// ── Delete document ───────────────────────────────────────────────────────────

export async function deleteDocument(id, authOpts = {}) {
  if (isCloudId(id)) {
    const { user } = authOpts;
    if (user) await cloudDeleteDocument(id, user.id);
    return { success: true };
  }
  await removeDocument(id);
  return { success: true };
}
