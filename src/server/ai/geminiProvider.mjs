import { buildStoryCardPrompt } from './promptContracts.mjs';

function getEnv(env, key, fallback = '') {
  return String(env?.[key] ?? fallback).trim();
}

function extractJsonText(text) {
  const cleaned = String(text ?? '').trim();
  if (cleaned.startsWith('{')) return cleaned;
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match) return match[1].trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) return cleaned.slice(start, end + 1);
  return cleaned;
}

export async function callGeminiStoryCard({ env, answers, fetchImpl = fetch }) {
  const apiKey = getEnv(env, 'GEMINI_API_KEY');
  const model = getEnv(env, 'GEMINI_MODEL', 'gemini-2.5-flash');
  const baseUrl = getEnv(env, 'GEMINI_API_BASE_URL', 'https://generativelanguage.googleapis.com');
  const timeoutMs = Number(getEnv(env, 'LLM_TIMEOUT_MS', '30000')) || 30000;

  if (!apiKey || apiKey.startsWith('REPLACE_WITH_') || apiKey.includes('DISABLED')) {
    throw new Error('Gemini API key is not configured.');
  }

  const prompt = buildStoryCardPrompt(answers);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt.system }] },
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.35,
          maxOutputTokens: Number(getEnv(env, 'LLM_MAX_OUTPUT_TOKENS', '2200')) || 2500
        }
      })
    });
    if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}.`);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
    if (!text.trim()) throw new Error('Gemini returned an empty response.');
    return JSON.parse(extractJsonText(text));
  } finally {
    clearTimeout(timer);
  }
}
