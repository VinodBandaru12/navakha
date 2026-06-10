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

  // 1. Verify user JWT
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authError } =
    await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 2. Check usage limit
  let { data: profile } = await supabase
    .from('profiles')
    .select('messages_used, messages_limit, plan')
    .eq('id', user.id)
    .single()

  // Profile missing — create it on the fly (handles race conditions and missing trigger)
  if (!profile) {
    const { data: created } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.email?.split('@')[0] || 'User',
      })
      .select('messages_used, messages_limit, plan')
      .single()
    profile = created
  }

  const messagesUsed = profile?.messages_used ?? 0
  const messagesLimit = profile?.messages_limit ?? 20

  if (messagesUsed >= messagesLimit) {
    return res.status(429).json({
      error: 'limit_reached',
      message: 'Monthly message limit reached. Please upgrade your plan.'
    })
  }

  // 3. Parse request body
  const { messages, provider, model, systemPrompt, isSummary } = req.body

  // 4. Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const send = (text) => res.write(`data: ${JSON.stringify({ text })}\n\n`)
  const done = () => res.write('data: [DONE]\n\n')

  try {
    if (provider === 'anthropic') {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const stream = await client.messages.create({
        model: model || 'claude-sonnet-4-6',
        max_tokens: 8096,
        system: systemPrompt,
        messages,
        stream: true,
      })
      for await (const event of stream) {
        if (event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta') {
          send(event.delta.text)
        }
      }
    } else {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const stream = await client.chat.completions.create({
        model: model || 'gpt-4o',
        messages: systemPrompt
          ? [{ role: 'system', content: systemPrompt }, ...messages]
          : messages,
        stream: true,
      })
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        if (text) send(text)
      }
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
  }

  done()
  res.end()

  // 5. Increment usage (skip for internal summarization calls)
  if (!isSummary) {
    await supabase
      .from('profiles')
      .update({ messages_used: messagesUsed + 1 })
      .eq('id', user.id)

    await supabase.from('usage_events').insert({
      user_id: user.id,
      event_type: 'chat_message',
      metadata: { provider, model },
    })
  }
}
