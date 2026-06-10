import { callGeminiStoryCard } from './geminiProvider.mjs';
import { callOpenAiStoryCard } from './openaiProvider.mjs';
import { createTestLocalAiResponse } from './testLocalProvider.mjs';

export const SUPPORTED_LLM_PROVIDERS = ['gemini', 'openai', 'test_local'];
export const ROUTER_FAILURE_POLICY = 'honest_unavailable_no_placeholder_output';

function getEnv(env, key, fallback = '') {
  return String(env?.[key] ?? fallback).trim();
}

function enabled(value, fallback = false) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return fallback;
  return ['1', 'true', 'yes', 'enabled', 'on'].includes(normalized);
}

function uniqueProviders(providers) {
  const out = [];
  for (const provider of providers.map((item) => String(item || '').trim()).filter(Boolean)) {
    if (SUPPORTED_LLM_PROVIDERS.includes(provider) && !out.includes(provider)) out.push(provider);
  }
  return out;
}

export function resolveLlmProviderOrder(env = {}) {
  const primary = getEnv(env, 'LLM_PROVIDER', 'gemini');
  const fallbackEnabled = enabled(getEnv(env, 'LLM_FALLBACK_ENABLED', 'true'), true);
  const fallback = getEnv(env, 'LLM_FALLBACK_PROVIDER', 'openai');
  const routingMode = getEnv(env, 'LLM_ROUTING_MODE', 'lowest_cost_available');

  if (primary === 'test_local') return ['test_local'];
  if (routingMode === 'primary_only' || !fallbackEnabled) return uniqueProviders([primary]);
  if (routingMode === 'lowest_cost_available') return uniqueProviders([primary, fallback]);
  return uniqueProviders([primary, fallback]);
}

export async function callStoryCardWithRouter({ env, answers, fetchImpl = fetch } = {}) {
  const providers = resolveLlmProviderOrder(env);
  const attempts = [];

  for (const provider of providers) {
    try {
      let raw;
      if (provider === 'gemini') raw = await callGeminiStoryCard({ env, answers, fetchImpl });
      else if (provider === 'openai') raw = await callOpenAiStoryCard({ env, answers, fetchImpl });
      else if (provider === 'test_local') raw = createTestLocalAiResponse(answers);
      else throw new Error(`Unsupported LLM provider: ${provider}`);
      return { provider, raw, attempts };
    } catch (error) {
      attempts.push({ provider, reason: error instanceof Error ? error.message : 'Provider failed safely.' });
    }
  }

  const attempted = attempts.map((item) => item.provider).join(' -> ') || 'none';
  const error = new Error(`No configured LLM provider completed successfully. Attempted: ${attempted}.`);
  error.attempts = attempts;
  throw error;
}
