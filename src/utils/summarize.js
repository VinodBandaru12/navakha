import { streamProxy } from './streamParser';

export async function summarizeHistory(messages, { accessToken, provider = 'anthropic' }) {
  if (!accessToken || !messages.length) return null;

  const filtered = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  if (!filtered.length) return null;

  let full = '';
  try {
    await streamProxy({
      accessToken,
      provider: 'openai',
      model: 'gpt-4o-mini',
      isSummary: true,
      messages: filtered.map(m => ({ role: m.role, content: m.content })),
      onDelta: d => { full += d; },
    });
  } catch {
    return null;
  }

  return full || null;
}
