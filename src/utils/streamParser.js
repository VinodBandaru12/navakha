export const SYSTEM_PROMPT = `You are Navakha — a brilliant AI assistant and tutor.
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
`;

/**
 * Returns a display-safe version of streaming text.
 * Hides raw HTML while a widget block is being streamed.
 */
export function getDisplayText(rawText) {
  if (!rawText) return '';
  let result = rawText;

  // Hide incomplete widget block
  const wStart = result.lastIndexOf('<!--WIDGET_START-->');
  const wEnd   = result.lastIndexOf('<!--WIDGET_END-->');
  if (wStart !== -1 && wEnd < wStart) {
    result = result.slice(0, wStart) + '\n\n`Building interactive widget...`\n';
    return result;
  }

  // Hide incomplete mermaid block
  const mStart = result.lastIndexOf('```mermaid');
  const mEnd   = result.lastIndexOf('```', result.length - 1);
  if (mStart !== -1 && mEnd <= mStart + 9) {
    result = result.slice(0, mStart) + '\n\n`Building diagram...`\n';
    return result;
  }

  // Hide incomplete code block (odd number of ``` markers)
  const tickCount = (result.match(/```/g) || []).length;
  if (tickCount % 2 !== 0) {
    const lastTickIdx = result.lastIndexOf('```');
    result = result.slice(0, lastTickIdx) + '\n`...`';
  }

  return result;
}

/**
 * Builds the messages array for an API call.
 * historyMessages: array of { role, content } from DB
 */
export function buildApiMessages(historyMessages) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historyMessages.map((m) => ({ role: m.role, content: m.content })),
  ];
}

/**
 * Parse an OpenAI SSE stream chunk and return the delta text.
 */
export function parseOpenAIChunk(line) {
  if (!line.startsWith('data: ')) return null;
  const data = line.slice(6).trim();
  if (data === '[DONE]') return null;
  try {
    const json = JSON.parse(data);
    return json.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * Parse an Anthropic SSE stream chunk and return the delta text.
 */
export function parseAnthropicChunk(line) {
  if (!line.startsWith('data: ')) return null;
  const data = line.slice(6).trim();
  try {
    const json = JSON.parse(data);
    if (json.type === 'content_block_delta') {
      return json.delta?.text ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Stream a response from OpenAI.
 * onDelta(text) called for each chunk.
 * Returns the full accumulated response text.
 */
export async function streamOpenAI({ apiKey, model = 'gpt-4o', messages, onDelta, signal }) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const delta = parseOpenAIChunk(line);
      if (delta) {
        full += delta;
        onDelta(delta);
      }
    }
  }

  return full;
}

/**
 * Stream a response through the /api/chat proxy.
 * Strips system message from messages array and sends it as systemPrompt.
 * onDelta(text) called for each chunk.
 * Returns full accumulated response text.
 */
export async function streamProxy({ accessToken, provider = 'anthropic', messages, onDelta, signal }) {
  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? ''
  const userMessages = messages.filter((m) => m.role !== 'system')

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ messages: userMessages, provider, systemPrompt: systemMsg }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    if (response.status === 429) throw new Error(err.message || 'Monthly message limit reached. Please upgrade your plan.')
    if (response.status === 401) throw new Error('Session expired. Please sign in again.')
    throw new Error(err.message || `API error ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return full
      try {
        const json = JSON.parse(data)
        if (json.text) {
          full += json.text
          onDelta(json.text)
        }
      } catch {
        // ignore parse errors on malformed chunks
      }
    }
  }

  return full
}

/**
 * Stream a response from Anthropic.
 * onDelta(text) called for each chunk.
 * Returns the full accumulated response text.
 */
export async function streamAnthropic({ apiKey, model = 'claude-sonnet-4-20250514', messages, onDelta, signal }) {
  // Anthropic requires system message separated from messages array
  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';
  const userMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMsg,
      messages: userMessages,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic error ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const delta = parseAnthropicChunk(line);
      if (delta) {
        full += delta;
        onDelta(delta);
      }
    }
  }

  return full;
}
