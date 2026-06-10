import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ALLOWED_EXT = new Set([
  'pdf', 'docx', 'txt', 'md', 'html', 'css', 'xml', 'xlsx',
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rb', 'rs',
])

// Per-file size limit and total quota by plan (bytes)
const FILE_LIMIT = { basic: 50, power: 50, pro: 100 }   // MB
const QUOTA_MB   = { basic: 500, power: 500, pro: 1536 } // MB

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── 1. Auth ──────────────────────────────────────────────────────────────────
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  // ── 2. Plan check ─────────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, docs_storage_bytes')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  if (plan === 'free') {
    return res.status(403).json({ error: 'Cloud document storage requires a paid plan.' })
  }

  // ── 3. Input validation ───────────────────────────────────────────────────────
  const { filename, size_bytes } = req.body

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'filename is required' })
  }
  // Strip path traversal attempts and control chars from the filename
  const safeName = filename.replace(/[/\\<>:"|?*\x00-\x1f]/g, '_').slice(0, 200)
  if (!safeName) return res.status(400).json({ error: 'Invalid filename' })

  const ext = safeName.split('.').pop().toLowerCase()
  if (!ALLOWED_EXT.has(ext)) {
    return res.status(400).json({ error: `File type .${ext} is not allowed.` })
  }

  const sizeNum = Number(size_bytes)
  if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
    return res.status(400).json({ error: 'size_bytes must be a positive number' })
  }

  // ── 4. Per-file size limit ────────────────────────────────────────────────────
  const fileLimitBytes = (FILE_LIMIT[plan] ?? 50) * 1024 * 1024
  if (sizeNum > fileLimitBytes) {
    return res.status(400).json({
      error: `File exceeds the ${FILE_LIMIT[plan] ?? 50} MB limit for your plan.`,
    })
  }

  // ── 5. Quota check ────────────────────────────────────────────────────────────
  const quotaBytes = (QUOTA_MB[plan] ?? 500) * 1024 * 1024
  const usedBytes  = Number(profile?.docs_storage_bytes ?? 0)
  if (usedBytes + sizeNum > quotaBytes) {
    const freeGB = ((quotaBytes - usedBytes) / (1024 * 1024 * 1024)).toFixed(2)
    return res.status(403).json({
      error: `Storage quota exceeded. You have ${freeGB} GB remaining. Delete documents to free space.`,
    })
  }

  // ── 6. Create document record (to get the UUID for the storage path) ──────────
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({
      user_id:   user.id,
      filename:  safeName,
      filetype:  ext,
      size_bytes: sizeNum,
    })
    .select('id')
    .single()

  if (docErr || !doc) {
    return res.status(500).json({ error: 'Failed to create document record' })
  }

  // ── 7. Generate presigned upload URL (5-min expiry) ───────────────────────────
  const storagePath = `${user.id}/${doc.id}/${safeName}`

  const { data: signed, error: signErr } = await supabase.storage
    .from('user-documents')
    .createSignedUploadUrl(storagePath)

  if (signErr || !signed) {
    // Roll back document record so quota isn't phantom-consumed
    await supabase.from('documents').delete().eq('id', doc.id)
    return res.status(500).json({ error: 'Failed to generate upload URL' })
  }

  // Persist the storage path so doc-process.js can verify it
  await supabase.from('documents').update({ storage_path: storagePath }).eq('id', doc.id)

  return res.status(200).json({
    signedUrl:   signed.signedUrl,
    token:       signed.token,
    documentId:  doc.id,
    storagePath,
  })
}
