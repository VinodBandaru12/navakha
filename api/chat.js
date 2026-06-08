import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // 1. Verify user JWT from Authorization header
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: { user }, error: authError } =
    await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Check usage limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('messages_used, messages_limit, plan')
    .eq('id', user.id)
    .single()

  if (profile.messages_used >= profile.messages_limit) {
    return new Response(
      JSON.stringify({
        error: 'limit_reached',
        message: 'Monthly message limit reached. Please upgrade your plan.'
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 3. Parse request body
  const { messages, provider, model, systemPrompt } = await req.json()

  // 4. Stream from AI provider
  let stream

  if (provider === 'anthropic') {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
    const response = await client.messages.create({
      model: model || 'claude-sonnet-4-6',
      max_tokens: 8096,
      system: systemPrompt,
      messages,
      stream: true
    })
    stream = new ReadableStream({
      async start(controller) {
        for await (const event of response) {
          if (event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta') {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
            )
          }
          if (event.type === 'message_stop') {
            controller.enqueue(
              new TextEncoder().encode('data: [DONE]\n\n')
            )
            controller.close()
          }
        }
      }
    })
  } else {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    const response = await client.chat.completions.create({
      model: model || 'gpt-4o',
      messages: systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages,
      stream: true
    })
    stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ text })}\n\n`
              )
            )
          }
          if (chunk.choices[0]?.finish_reason === 'stop') {
            controller.enqueue(
              new TextEncoder().encode('data: [DONE]\n\n')
            )
            controller.close()
          }
        }
      }
    })
  }

  // 5. Increment usage count
  await supabase
    .from('profiles')
    .update({ messages_used: profile.messages_used + 1 })
    .eq('id', user.id)

  // 6. Log usage event
  await supabase.from('usage_events').insert({
    user_id: user.id,
    event_type: 'chat_message',
    metadata: { provider, model }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
