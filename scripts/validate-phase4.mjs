#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
function read(rel) { return fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }
function requireFile(rel) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing Phase 4 file: ${rel}`); }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`${rel} missing required text: ${text}`); }

[
  'src/server/ai/aiSchema.mjs',
  'src/server/ai/aiService.mjs',
  'src/server/ai/geminiProvider.mjs',
  'src/server/ai/openaiProvider.mjs',
  'src/server/ai/llmRouter.mjs',
  'src/server/ai/promptContracts.mjs',
  'src/server/ai/testLocalProvider.mjs',
  'src/runtime/aiStoryCardClient.mjs',
  'functions/api/pitch/story-card.js',
  'functions/api/pitch/analyze.js',
  'tests/domain/phase4-contracts.mjs'
].forEach(requireFile);

requireIncludes('src/server/ai/aiSchema.mjs', 'PHASE_4_AI_DISCLOSURE');
requireIncludes('src/server/ai/aiSchema.mjs', 'not an investment decision');
requireIncludes('src/server/ai/aiService.mjs', 'callStoryCardWithRouter');
requireIncludes('src/server/ai/llmRouter.mjs', 'lowest_cost_available');
requireIncludes('src/server/ai/llmRouter.mjs', 'openai');
requireIncludes('src/server/ai/aiSchema.mjs', 'ai_unavailable');
requireIncludes('src/server/ai/geminiProvider.mjs', 'GEMINI_API_KEY');
requireIncludes('src/server/ai/geminiProvider.mjs', 'responseMimeType');
requireIncludes('src/server/ai/openaiProvider.mjs', 'OPENAI_API_KEY');
requireIncludes('src/server/ai/openaiProvider.mjs', 'response_format');
requireIncludes('functions/api/pitch/story-card.js', 'onRequestPost');
requireIncludes('src/runtime/aiStoryCardClient.mjs', 'No fake AI output was generated.');
requireIncludes('src/ui/appShell.mjs', 'Generate AI Pitch Story Card');

const clientFiles = ['src/runtime/aiStoryCardClient.mjs', 'src/ui/appShell.mjs', 'src/runtime/practiceFlow.mjs'];
for (const rel of clientFiles) {
  const text = read(rel);
  if (/GEMINI_API_KEY|OPENAI_API_KEY|ELEVENLABS_API_KEY|HEYGEN_API_KEY|MAKEUGC_API_KEY/.test(text)) failures.push(`${rel} references server secret name from client/runtime UI path`);
}

const registry = JSON.parse(read('config/env.registry.json'));
const keys = new Set((registry.variables || []).map((item) => item.key));
for (const key of ['LLM_PROVIDER', 'LLM_FALLBACK_ENABLED', 'LLM_FALLBACK_PROVIDER', 'LLM_ROUTING_MODE', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'LLM_TIMEOUT_MS', 'LLM_MAX_INPUT_CHARS', 'LLM_MAX_OUTPUT_TOKENS', 'OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_API_BASE_URL', 'OPENAI_TIMEOUT_MS', 'OPENAI_MAX_OUTPUT_TOKENS']) {
  if (!keys.has(key)) failures.push(`Env registry missing Phase 4 key: ${key}`);
}

const docs = read('docs/IMPLEMENTATION_PHASE_PLAN.md');
if (!/Phase 4/i.test(docs) || !/server-side/i.test(docs) || !/schema/i.test(docs) || !/OpenAI fallback/i.test(docs)) failures.push('Implementation phase plan does not document Phase 4 server-side schema and fallback behavior.');

if (failures.length) {
  console.error('PHASE 4 VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PHASE 4 VALIDATION PASSED');
