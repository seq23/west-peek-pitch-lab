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

export async function callOpenAiStoryCard({ env, answers, fetchImpl = fetch }) {
  const apiKey = getEnv(env, 'OPENAI_API_KEY');
  const model = getEnv(env, 'OPENAI_MODEL', 'gpt-4.1-mini');
  const baseUrl = getEnv(env, 'OPENAI_API_BASE_URL', 'https://api.openai.com');
  const timeoutMs = Number(getEnv(env, 'OPENAI_TIMEOUT_MS', getEnv(env, 'LLM_TIMEOUT_MS', '30000'))) || 30000;

  if (!apiKey || apiKey.startsWith('REPLACE_WITH_') || apiKey.includes('DISABLED')) {
    throw new Error('OpenAI API key is not configured.');
  }

  const prompt = buildStoryCardPrompt(answers);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: Number(getEnv(env, 'OPENAI_MAX_OUTPUT_TOKENS', getEnv(env, 'LLM_MAX_OUTPUT_TOKENS', '2200'))) || 2500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ]
      })
    });
    if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}.`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text.trim()) throw new Error('OpenAI returned an empty response.');
    return JSON.parse(extractJsonText(text));
  } finally {
    clearTimeout(timer);
  }
}
