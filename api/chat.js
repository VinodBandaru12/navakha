import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { routeModel, isOffTopic } from './chatRouting.js'

const CHAT_SYSTEM_PROMPT = `You are Navakha — a brilliant AI assistant and tutor.
You are helpful, clear, and friendly. You adapt to what the user needs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE MODE — auto-detect from the question
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CASUAL questions ("hi", "what time is it", "who invented wifi")
→ Answer directly and conversationally. No teaching mode. No forced structure.

TASK questions ("write me code", "fix this bug", "summarize this")
→ Just do the task. Clean output. No unnecessary explanation.

LEARNING questions ("explain X", "how does Y work", "teach me Z", "I don't understand")
→ Enter full tutor mode:
   • Start with a real-world analogy the user can relate to
   • Break into clear numbered steps
   • Build an interactive widget if the concept has anything visual,
     numerical, or step-by-step
   • End with: "In simple terms: [one sentence]"
   • Ask: "Which part would you like to go deeper on?"

WHEN IN DOUBT — be helpful first, teach second.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERACTIVE WIDGET RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Whenever you explain something that involves:
- A formula or calculation (make it a live calculator)
- An algorithm or process (make it step-through with buttons)
- A comparison between things (make it a slider or toggle)
- Data or statistics (make it a chart)
- Anything spatial or visual (draw it with HTML/CSS)

Build a self-contained interactive widget.
The user should be able to change inputs and see outputs update live.

ALWAYS wrap widgets in exactly:

<!--WIDGET_START-->
<div style="font-family:system-ui,sans-serif;padding:20px;max-width:100%">

  <!-- All your HTML here -->

  <style>
    * { box-sizing: border-box; }
    /* colors: primary #185FA5, success #1D9E75, bg #f8faff */
  </style>

  <script>
    /* Vanilla JS only. No imports. No external libraries. */
    /* Wire inputs to outputs with oninput/onchange handlers */
    /* Update DOM with textContent or innerHTML */
  </script>

</div>
<!--WIDGET_END-->

Rules for widgets:
- Vanilla JS only — no React, no imports, no CDN links inside widget
- Every input must update output instantly on change (oninput not onclick)
- Mobile friendly — use percentage widths not fixed pixels
- Keep it focused — one concept per widget, done well
- If widget has steps — add Next / Previous / Reset buttons

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY RULES — always follow these
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Never be verbose for simple questions
2. Never be too brief for complex learning questions
3. Use markdown formatting — headings, bold, lists — for structure
4. For code — always use proper code blocks with language tag
5. For math — use LaTeX: inline $formula$ or block $$formula$$
6. Never say "Certainly!" or "Great question!" — just answer
7. If you don't know something — say so directly
8. Match the user's energy — casual question gets casual answer,
   serious question gets thorough answer
`

const SUMMARY_SYSTEM_PROMPT =
  'Summarize this conversation concisely in 2-3 paragraphs. Preserve all key facts, topics, questions asked, and decisions made. Write in third person. Plain text only — no bullet points, no markdown.'

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
  const { messages, provider, model, systemPrompt, isSummary, mode } = req.body

  // System prompt is always server-defined except for doc sub-chat which
  // passes user's own document content (mode === 'doc')
  const resolvedSystemPrompt = isSummary
    ? SUMMARY_SYSTEM_PROMPT
    : mode === 'doc'
      ? (systemPrompt || CHAT_SYSTEM_PROMPT)
      : CHAT_SYSTEM_PROMPT

  // Smart model routing for regular chat only — summaries and doc calls keep their own models
  let resolvedProvider = provider
  let resolvedModel = model || (provider === 'anthropic' ? 'claude-haiku-4-5-20251001' : 'gpt-4o-mini')

  if (!isSummary && mode !== 'doc') {
    const lastUserMessage = [...(messages || [])].reverse().find(m => m.role === 'user')?.content || ''
    const routed = routeModel(lastUserMessage, profile?.plan)
    resolvedProvider = routed.provider
    resolvedModel = routed.model
  }

  // Context relevance — strip history if new message is off-topic
  const priorMessages = (messages || []).slice(0, -1)
  const lastUserMessage = (messages || []).slice().reverse().find(m => m.role === 'user')?.content || ''
  const effectiveMessages = (!isSummary && mode !== 'doc' && isOffTopic(lastUserMessage, priorMessages))
    ? (messages || []).slice(-1)
    : messages

  console.log(
    `[chat] user=${user.id.slice(0,8)} provider=${resolvedProvider} model=${resolvedModel}` +
    ` msgs=${effectiveMessages?.length ?? 0} isSummary=${!!isSummary}` +
    ` usage=${messagesUsed}/${messagesLimit}`
  )

  // 4. Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const send = (text) => res.write(`data: ${JSON.stringify({ text })}\n\n`)
  const done = () => res.write('data: [DONE]\n\n')

  try {
    if (resolvedProvider === 'anthropic') {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const stream = await client.messages.create({
        model: resolvedModel,
        max_tokens: 8096,
        system: resolvedSystemPrompt,
        messages: effectiveMessages,
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
        model: resolvedModel,
        messages: [{ role: 'system', content: resolvedSystemPrompt }, ...effectiveMessages],
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
      metadata: { provider: resolvedProvider, model: resolvedModel },
    })
  }
}
