import { buildApiMessages, streamProxy } from './streamParser';

/**
 * Uses the AI to generate a short 3-4 word title for a conversation.
 * Falls back to truncating the first message if the call fails.
 */
export async function generateTitle({ provider, apiKey, accessToken, firstUserMessage }) {
  const messages = buildApiMessages([
    {
      role: 'user',
      content: `Generate a concise 3-4 word title for a conversation that starts with this message.
Respond with ONLY the title, nothing else. No quotes, no punctuation at end.
Message: "${firstUserMessage.slice(0, 300)}"`,
    },
  ]);

  try {
    if (accessToken) {
      let title = '';
      await streamProxy({
        accessToken,
        provider: provider || 'anthropic',
        messages,
        onDelta: (d) => { title += d },
      });
      return title.trim() || fallbackTitle(firstUserMessage);
    }

    // Legacy direct-call path (no auth)
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: 'gpt-4o', messages, stream: false, max_tokens: 20 }),
      });
      if (!res.ok) throw new Error('OpenAI title gen failed');
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || fallbackTitle(firstUserMessage);
    }

    if (provider === 'anthropic') {
      const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';
      const userMessages = messages.filter((m) => m.role !== 'system');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 20,
          system: systemMsg,
          messages: userMessages,
        }),
      });
      if (!res.ok) throw new Error('Anthropic title gen failed');
      const data = await res.json();
      return data.content?.[0]?.text?.trim() || fallbackTitle(firstUserMessage);
    }
  } catch {
    // silently fall back
  }

  return fallbackTitle(firstUserMessage);
}

function fallbackTitle(text) {
  return text.trim().split(/\s+/).slice(0, 4).join(' ');
}
