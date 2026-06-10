// Shared AI call utility — used by doc sub-chat and document block Q&A.

import { getSetting } from '../db/db';
import { streamProxy } from '../utils/streamParser';

/**
 * Call AI with a system prompt and conversation messages.
 * If accessToken is provided, routes through the /api/chat proxy (production).
 * Falls back to direct API calls if no accessToken (legacy local dev).
 */
export async function callAI(systemPrompt, messages, { accessToken, provider, isSummary } = {}) {
  if (accessToken) {
    const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];
    let fullText = '';
    await streamProxy({
      accessToken,
      provider: provider || 'anthropic',
      messages: allMessages,
      isSummary,
      onDelta: (delta) => { fullText += delta; },
    });
    return { text: fullText };
  }

  // Legacy fallback: direct API call (local dev without auth)
  const [apiKey, prov] = await Promise.all([
    getSetting('apiKey'),
    getSetting('provider').then((p) => p || 'openai'),
  ]);
  const resolvedProvider = provider || prov;
  if (!apiKey) throw new Error('No API key found — please add your key in Settings.');

  if (resolvedProvider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-allow-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1536,
        system: systemPrompt,
        messages,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic error ${res.status}`);
    }
    const data = await res.json();
    return { text: data.content[0].text, model: 'claude-haiku-4-5-20251001' };
  }

  // OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1536,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error ${res.status}`);
  }
  const data = await res.json();
  return { text: data.choices[0].message.content, model: 'gpt-4o-mini' };
}
