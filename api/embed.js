import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { texts } = req.body
  if (!Array.isArray(texts) || !texts.length) {
    return res.status(400).json({ error: 'texts array required' })
  }

  try {
    console.log(`[embed] user=${user.id.slice(0,8)} blocks=${texts.length} model=text-embedding-3-small`)
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts.map(t => String(t).slice(0, 8000)),
    })
    return res.status(200).json({ embeddings: response.data.map(e => e.embedding) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
