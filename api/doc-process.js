import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MAX_BLOCKS   = 2000
const MAX_CONTENT  = 50_000 // chars per block
const EMBED_BATCH  = 100

const ALLOWED_BLOCK_TYPES = new Set([
  'paragraph', 'heading1', 'heading2', 'heading3', 'code', 'table', 'list', 'text',
])

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── 1. Auth ──────────────────────────────────────────────────────────────────
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  // ── 2. Parse + validate body ──────────────────────────────────────────────────
  const { documentId, blocks } = req.body

  if (!documentId || typeof documentId !== 'string') {
    return res.status(400).json({ error: 'documentId required' })
  }
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return res.status(400).json({ error: 'blocks array required' })
  }
  if (blocks.length > MAX_BLOCKS) {
    return res.status(400).json({ error: `Too many blocks (max ${MAX_BLOCKS})` })
  }

  // Validate each block — prevents injection via block content field
  for (const b of blocks) {
    if (!b.type || typeof b.type !== 'string' || !ALLOWED_BLOCK_TYPES.has(b.type)) {
      return res.status(400).json({ error: `Invalid block type: ${b.type}` })
    }
    if (!b.content || typeof b.content !== 'string') {
      return res.status(400).json({ error: 'Each block must have a content string' })
    }
    if (b.content.length > MAX_CONTENT) {
      return res.status(400).json({ error: 'Block content exceeds 50 000 character limit' })
    }
  }

  // ── 3. Verify user owns this document ─────────────────────────────────────────
  const { data: doc } = await supabase
    .from('documents')
    .select('id, user_id, size_bytes, block_count')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (!doc) return res.status(404).json({ error: 'Document not found or access denied' })
  if (doc.block_count > 0) return res.status(409).json({ error: 'Document already processed' })

  // ── 4. Generate embeddings (batched, non-fatal on failure) ────────────────────
  const contents   = blocks.map(b => b.content)
  const embeddings = new Array(blocks.length).fill(null)

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    for (let i = 0; i < contents.length; i += EMBED_BATCH) {
      const batch = contents.slice(i, i + EMBED_BATCH)
      const resp  = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      })
      resp.data.forEach((item, j) => { embeddings[i + j] = item.embedding })
    }
  } catch (e) {
    console.warn('[doc-process] embeddings failed, continuing without:', e.message)
  }

  // ── 5. Save blocks to Supabase ────────────────────────────────────────────────
  const blockRows = blocks.map((b, i) => ({
    document_id: documentId,
    user_id:     user.id,
    block_index: i,
    block_type:  b.type,
    content:     b.content,
    embedding:   embeddings[i] ?? null,
  }))

  const { error: blocksErr } = await supabase.from('blocks').insert(blockRows)
  if (blocksErr) {
    console.error('[doc-process] block insert error:', blocksErr.message)
    return res.status(500).json({ error: 'Failed to save blocks' })
  }

  // ── 6. Finalise document record ───────────────────────────────────────────────
  await supabase
    .from('documents')
    .update({ block_count: blocks.length })
    .eq('id', documentId)

  // ── 7. Increment storage quota atomically ─────────────────────────────────────
  const { error: rpcErr } = await supabase.rpc('increment_docs_storage', {
    p_user_id: user.id,
    p_bytes:   doc.size_bytes ?? 0,
  })

  if (rpcErr) {
    // Fallback: non-atomic but acceptable — small race risk for consumer app
    const { data: p } = await supabase
      .from('profiles').select('docs_storage_bytes').eq('id', user.id).single()
    await supabase
      .from('profiles')
      .update({ docs_storage_bytes: (Number(p?.docs_storage_bytes) || 0) + (doc.size_bytes ?? 0) })
      .eq('id', user.id)
  }

  console.log(
    `[doc-process] user=${user.id.slice(0, 8)} doc=${documentId.slice(0, 8)}` +
    ` blocks=${blocks.length} embeddings=${embeddings.filter(Boolean).length}`
  )

  return res.status(200).json({ blockCount: blocks.length })
}
