#!/usr/bin/env node
import assert from 'node:assert/strict';
import { PITCH_QUESTIONS } from '../../src/runtime/pitchQuestions.mjs';
import { generatePitchStoryCard, analyzePitch } from '../../src/server/ai/aiService.mjs';
import { validateAiRequest, validateAiResponseShape } from '../../src/server/ai/aiSchema.mjs';
import { resolveLlmProviderOrder } from '../../src/server/ai/llmRouter.mjs';

const validAnswers = Object.fromEntries(
  PITCH_QUESTIONS.map((question) => [question.id, `${question.label} This founder answer is specific enough for validation and includes useful detail for story coaching.`])
);

const validProviderPayload = {
  disclosure: 'AI Scooter is an AI storytelling coach inspired by Scooter Taylor. This is not the real-time human Scooter, not an investment decision, and not a guarantee of review, funding, intros, or a meeting.',
  critique: {
    whatIsClear: 'The founder has a visible customer and a specific problem frame.',
    whatIsConfusing: 'The current wording still needs a sharper customer trigger and business outcome.',
    whatSoundsGeneric: 'Broad platform language should be replaced with a concrete painful moment.',
    needsStrongerProof: 'The proof should include traction, customer evidence, or repeatable demand.',
    likelyObjection: 'A skeptical listener may ask why this team can win and why now matters.',
    betterStoryAngle: 'Lead with the urgent painful moment and then make the founder edge obvious.',
    suggestedNextQuestion: 'What is the one proof point that would make this story more believable?'
  },
  storyCard: {
    oneLinePitch: 'A clear founder pitch for a specific customer segment.',
    companySummary: 'The company helps a defined customer reach a specific better outcome.',
    customer: 'The intended customer segment is specific enough to coach further.',
    problem: 'The problem is painful enough to justify changing behavior.',
    solution: 'The solution should be explained as the direct bridge to the better outcome.',
    proofTraction: 'The founder should show traction, usage, revenue, pilots, or proof of demand.',
    founderEdge: 'The founder edge needs to connect lived expertise to execution advantage.',
    whyNow: 'The timing needs to show why this problem matters now and not later.',
    biggestStoryGap: 'The biggest story gap is the missing proof that makes the claim credible.',
    biggestObjection: 'The biggest objection is whether the customer pain is urgent enough.',
    suggestedNextRelationships: 'Useful relationships could include customers, operators, partners, or investors.',
    nextSteps: 'Tighten the pitch, add proof, and decide who should hear the story next.'
  },
  warnings: []
};

const request = validateAiRequest(validAnswers, { maxInputChars: 12000 });
assert.equal(request.ok, true, 'valid founder answers should pass AI request validation');
assert.equal(Object.keys(request.answers).length, PITCH_QUESTIONS.length, 'all pitch questions should map into AI answers');

const tooLong = validateAiRequest({ ...validAnswers, what_building: 'x'.repeat(13000) }, { maxInputChars: 12000 });
assert.equal(tooLong.ok, false, 'oversized AI payload should fail before provider call');

assert.deepEqual(resolveLlmProviderOrder({ LLM_PROVIDER: 'gemini', LLM_FALLBACK_ENABLED: 'true', LLM_FALLBACK_PROVIDER: 'openai' }), ['gemini', 'openai'], 'default lowest-cost order should be Gemini then OpenAI');
assert.deepEqual(resolveLlmProviderOrder({ LLM_PROVIDER: 'gemini', LLM_FALLBACK_ENABLED: 'false', LLM_FALLBACK_PROVIDER: 'openai' }), ['gemini'], 'fallback can be disabled for primary-only live validation');
assert.deepEqual(resolveLlmProviderOrder({ LLM_PROVIDER: 'test_local', LLM_FALLBACK_PROVIDER: 'openai' }), ['test_local'], 'local test lane must not cascade into live providers');

const localResult = await generatePitchStoryCard({ env: { LLM_PROVIDER: 'test_local' }, answers: validAnswers, fetchImpl: async () => { throw new Error('fetch should not run for local test lane'); } });
assert.equal(localResult.ok, true, 'explicit local/test provider should create a schema-valid card for tests');
assert.equal(localResult.body.aiEnhanced, true, 'schema-valid AI test result should be marked AI enhanced');
assert.equal(localResult.body.shareEnabled, false, 'Phase 4 AI result must not enable sharing');
assert.match(localResult.body.disclosure, /not an investment decision/i, 'AI disclosure must include investment boundary');
assert.equal(localResult.body.provider, 'test_local', 'test provider should identify itself as test_local');

let openAiCalled = false;
const fallbackResult = await generatePitchStoryCard({
  env: {
    LLM_PROVIDER: 'gemini',
    LLM_FALLBACK_ENABLED: 'true',
    LLM_FALLBACK_PROVIDER: 'openai',
    GEMINI_API_KEY: 'REPLACE_WITH_LOCAL_GEMINI_API_KEY',
    OPENAI_API_KEY: 'test-openai-key',
    OPENAI_MODEL: 'gpt-4.1-mini'
  },
  answers: validAnswers,
  fetchImpl: async (url) => {
    if (String(url).includes('generativelanguage.googleapis.com')) throw new Error('Gemini should fail before fetch when key is placeholder');
    assert.match(String(url), /api\.openai\.com\/v1\/chat\/completions/, 'fallback fetch should call OpenAI chat completions');
    openAiCalled = true;
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(validProviderPayload) } }] })
    };
  }
});
assert.equal(openAiCalled, true, 'OpenAI fallback should be attempted after Gemini placeholder failure');
assert.equal(fallbackResult.ok, true, 'OpenAI fallback should return schema-valid story card');
assert.equal(fallbackResult.body.provider, 'openai', 'fallback provider should be reported as OpenAI');
assert.deepEqual(fallbackResult.body.providerAttempts.map((item) => item.provider), ['gemini'], 'failed primary provider should be recorded without exposing secrets');

const critique = await analyzePitch({ env: { LLM_PROVIDER: 'test_local' }, answers: validAnswers });
assert.equal(critique.ok, true, 'critique endpoint service should pass with explicit local/test provider');
assert.equal(Boolean(critique.body.critique.likelyObjection), true, 'critique should include likely objection');

const unavailable = await generatePitchStoryCard({ env: { LLM_PROVIDER: 'gemini', LLM_FALLBACK_ENABLED: 'true', LLM_FALLBACK_PROVIDER: 'openai', GEMINI_API_KEY: 'REPLACE_WITH_LOCAL_GEMINI_API_KEY', OPENAI_API_KEY: 'DISABLED_UNLESS_OPENAI_FALLBACK_CONFIGURED' }, answers: validAnswers });
assert.equal(unavailable.ok, false, 'missing configured LLM keys should fail safely');
assert.equal(unavailable.httpStatus, 503, 'missing configured LLM keys should return unavailable status');
assert.equal(unavailable.body.aiEnhanced, false, 'unavailable result must not be marked AI enhanced');
assert.equal(unavailable.body.storyCard, null, 'unavailable result must not return placeholder story card');
assert.deepEqual(unavailable.body.providerAttempts.map((item) => item.provider), ['gemini', 'openai'], 'unavailable response should identify attempted providers by name only');

const malformed = validateAiResponseShape({ critique: { whatIsClear: 'thin' }, storyCard: {} });
assert.equal(malformed.ok, false, 'malformed provider output must fail schema validation');

console.log('PHASE 4 DOMAIN CONTRACT TESTS PASSED');
