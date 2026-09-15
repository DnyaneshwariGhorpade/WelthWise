// Swappable AI provider adapter (OR-04).
// All AI calls must go through this single interface so switching between
// OpenAI / Gemini is a configuration change, not a code change.
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const GEMINI_CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  'gemini-2.5-pro',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`OpenAI API error ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI returned no content');
    return text.trim();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  let lastErr;
  for (const model of GEMINI_CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`);
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned no content');
      return text.trim();
    } catch (err) {
      clearTimeout(timeout);
      lastErr = err;
    }
  }
  throw lastErr || new Error('All Gemini model candidates failed');
}

const providers = {
  openai: callOpenAI,
  gemini: callGemini,
};

async function generateText(prompt) {
  const provider = providers[process.env.AI_PROVIDER] || providers.gemini;
  return provider(prompt);
}

module.exports = { generateText };