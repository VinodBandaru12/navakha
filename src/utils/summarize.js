import { streamProxy } from './streamParser';

export async function summarizeHistory(messages, { accessToken, provider = 'anthropic', existingSummary = null }) {
  if (!accessToken || !messages.length) return null;

  const filtered = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  if (!filtered.length) return null;

  // Incremental: prepend existing summary so gpt-4o-mini merges rather than re-reads everything
  const payload = existingSummary
    ? [
        { role: 'user', content: `[Previous summary]:\n${existingSummary}\n\nNew messages to incorporate:` },
        { role: 'assistant', content: 'Understood.' },
        ...filtered,
      ]
    : filtered;

  let full = '';
  try {
    await streamProxy({
      accessToken,
      provider: 'openai',
      model: 'gpt-4o-mini',
      isSummary: true,
      messages: payload,
      onDelta: d => { full += d; },
    });
  } catch {
    return null;
  }

  return full || null;
}
