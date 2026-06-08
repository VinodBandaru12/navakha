import express from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { parseDocument } from '../services/chunker.js';
import { embedText, summariseWithMini } from '../services/embedder.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function sb() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

const PLAN_LIMITS = {
  free:    { maxFileSizeMB: 5,  maxBlocks: 20,  maxDocuments: 3  },
  own_key: { maxFileSizeMB: 15, maxBlocks: 50,  maxDocuments: 10 },
  pro:     { maxFileSizeMB: 50, maxBlocks: 200, maxDocuments: 50 },
};

// ── POST /api/document/upload ─────────────────────────────────────────────────
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { userId, userPlan } = req;
    const limits = PLAN_LIMITS[userPlan] ?? PLAN_LIMITS.free;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > limits.maxFileSizeMB) {
      return res.status(413).json({
        error: `File too large. Your plan allows up to ${limits.maxFileSizeMB} MB.`,
      });
    }

    const client = sb();

    // Check document count
    const { count } = await client
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if ((count ?? 0) >= limits.maxDocuments) {
      return res.status(403).json({
        error: `Document limit reached. Your plan allows ${limits.maxDocuments} documents.`,
      });
    }

    // Parse into blocks
    let rawBlocks = await parseDocument(file.buffer, file.originalname, file.mimetype);
    const totalBlocks = rawBlocks.length;
    let truncated = false;
    if (rawBlocks.length > limits.maxBlocks) {
      rawBlocks = rawBlocks.slice(0, limits.maxBlocks);
      truncated = true;
    }

    // Insert document record
    const { data: doc, error: docErr } = await client
      .from('documents')
      .insert({
        user_id: userId,
        filename: file.originalname,
        filetype: file.originalname.split('.').pop().toLowerCase(),
        size_bytes: file.size,
        block_count: rawBlocks.length,
      })
      .select()
      .single();
    if (docErr) throw docErr;

    // Embed and insert each block
    const blocks = [];
    for (let i = 0; i < rawBlocks.length; i++) {
      const b = rawBlocks[i];
      const embedding = await embedText(b.content);
      const { data: blk, error: blkErr } = await client
        .from('blocks')
        .insert({
          document_id: doc.id,
          user_id: userId,
          block_index: i,
          block_type: b.type,
          content: b.content,
          embedding,
        })
        .select()
        .single();
      if (blkErr) throw blkErr;
      blocks.push(blk);
    }

    res.json({
      documentId: doc.id,
      blockCount: blocks.length,
      totalBlocks,
      truncated,
      planLimit: limits.maxBlocks,
      blocks: blocks.map(b => ({
        id: b.id,
        index: b.block_index,
        type: b.block_type,
        content: b.content,
      })),
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/document ─────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: documents } = await sb()
      .from('documents')
      .select()
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    res.json({ documents: documents ?? [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/document/:id ─────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const client = sb();
    const { userId } = req;

    const { data: doc } = await client
      .from('documents')
      .select()
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const { data: blocks } = await client
      .from('blocks')
      .select()
      .eq('document_id', doc.id)
      .order('block_index');

    const blockIds = (blocks ?? []).map(b => b.id);
    const { data: threads } = await client
      .from('block_threads')
      .select()
      .eq('user_id', userId)
      .in('block_id', blockIds.length ? blockIds : ['00000000-0000-0000-0000-000000000000'])
      .order('created_at');

    const byBlock = {};
    for (const t of threads ?? []) {
      (byBlock[t.block_id] ??= []).push(t);
    }

    res.json({
      document: doc,
      blocks: (blocks ?? []).map(b => ({
        id: b.id,
        index: b.block_index,
        type: b.block_type,
        content: b.content,
        threads: byBlock[b.id] ?? [],
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/document/block/:blockId/ask ─────────────────────────────────────
router.post('/block/:blockId/ask', authMiddleware, async (req, res) => {
  try {
    const { userId, userPlan } = req;
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: 'question is required' });

    const client = sb();

    const { data: blk } = await client
      .from('blocks')
      .select()
      .eq('id', req.params.blockId)
      .eq('user_id', userId)
      .single();
    if (!blk) return res.status(404).json({ error: 'Block not found' });

    // Get all blocks before this one (the full story so far)
    const { data: priorBlocks } = await client
      .from('blocks')
      .select('content')
      .eq('document_id', blk.document_id)
      .lt('block_index', blk.block_index)
      .order('block_index');

    let priorContext;
    if (!priorBlocks || priorBlocks.length === 0) {
      priorContext = '(This is the first block — no prior context)';
    } else if (priorBlocks.length <= 5) {
      priorContext = priorBlocks.map(b => b.content).join('\n\n');
    } else {
      priorContext = await summariseWithMini(
        priorBlocks.map(b => b.content).join('\n\n'),
        `Summarise this document content into 200 words.
Preserve all named entities, events, key facts, and story connections.
A student will use this summary to answer questions about later sections.
Output only the summary — no preamble.`
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

    const deepQ = /prove|derive|analyse deeply|research/i.test(question);
    const model = userPlan === 'pro' && deepQ ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';

    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const answer = response.content[0].text;

    const { data: thread } = await client
      .from('block_threads')
      .insert({ block_id: blk.id, user_id: userId, question, answer, model_used: model })
      .select()
      .single();

    res.json({ answer, model, threadId: thread.id });
  } catch (err) {
    console.error('Block ask error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/document/:id/chat ───────────────────────────────────────────────
router.post('/:id/chat', authMiddleware, async (req, res) => {
  try {
    const { userId, userPlan } = req;
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: 'question is required' });

    const client = sb();

    const { data: doc } = await client
      .from('documents')
      .select()
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const qEmbedding = await embedText(question);

    const { data: matched } = await client.rpc('match_blocks', {
      query_embedding: qEmbedding,
      p_document_id: req.params.id,
      match_count: 3,
    });

    const blockContext = (matched ?? []).map(b => b.content).join('\n\n---\n\n');
    const relevantBlocks = (matched ?? []).map(b => b.block_index);

    const deepQ = /prove|derive|analyse deeply|research/i.test(question);
    const model = userPlan === 'pro' && deepQ ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';

    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: 'You are Navakha, a friendly AI tutor. Answer questions about the provided document sections accurately and clearly.',
      messages: [{
        role: 'user',
        content: `[Relevant document sections]:\n${blockContext}\n\n[Question]: ${question}`,
      }],
    });

    res.json({ answer: response.content[0].text, model, relevantBlocks });
  } catch (err) {
    console.error('Document chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/document/:id ──────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const client = sb();
    const { data: doc } = await client
      .from('documents')
      .select()
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    await client.from('documents').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
