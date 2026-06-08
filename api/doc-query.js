import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 1. Verify JWT
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error } =
    await supabase.auth.getUser(token)
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 2. Check usage limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('messages_used, messages_limit')
    .eq('id', user.id)
    .single()

  if (profile.messages_used >= profile.messages_limit) {
    return res.status(429).json({
      error: 'limit_reached',
      message: 'Monthly message limit reached. Please upgrade.'
    })
  }

  // 3. Parse body
  const { question, context, provider } = req.body

  let answer

  if (provider === 'anthropic') {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }]
    })
    answer = response.content[0].text
  } else {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }]
    })
    answer = response.choices[0].message.content
  }

  // 4. Increment usage
  await supabase
    .from('profiles')
    .update({ messages_used: profile.messages_used + 1 })
    .eq('id', user.id)

  return res.status(200).json({ answer })
}
