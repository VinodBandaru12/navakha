import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedText(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

// Used to compress prior blocks into a 200-word story summary before sending to Haiku
export async function summariseWithMini(text, systemPrompt) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 400,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ],
  });
  return res.choices[0].message.content;
}
