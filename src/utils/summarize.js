import { streamProxy } from './streamParser';

const SUMMARY_PROMPT =
  'Summarize this conversation concisely in 2-3 paragraphs. Preserve all key facts, topics, questions asked, and decisions made. Write in third person. Plain text only — no bullet points, no markdown.';

/**
 * Calls /api/chat with isSummary=true so it does NOT count against the user's
 * monthly message limit.  Returns the summary string, or null on failure.
 */
export async function summarizeHistory(messages, { accessToken, provider = 'anthropic' }) {
  if (!accessToken || !messages.length) return null;

  const filtered = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  if (!filtered.length) return null;

  let full = '';
  try {
    await streamProxy({
      accessToken,
      provider,
      isSummary: true,
      messages: [
        { role: 'system', content: SUMMARY_PROMPT },
        ...filtered.map(m => ({ role: m.role, content: m.content })),
      ],
      onDelta: d => { full += d; },
    });
  } catch {
    return null;
  }

  return full || null;
}
