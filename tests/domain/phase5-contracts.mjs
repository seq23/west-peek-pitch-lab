#!/usr/bin/env node
import assert from 'node:assert/strict';
import { buildStoryCardPrompt } from '../../src/server/ai/promptContracts.mjs';
import { buildScooterWisdomContext, getScooterWisdomVersion } from '../../src/server/ai/scooterWisdom.mjs';
import { getApprovedScooterWisdomRegistry, validateScooterWisdomRegistry } from '../../src/server/ai/scooterWisdomRegistry.mjs';
import { PITCH_QUESTIONS } from '../../src/runtime/pitchQuestions.mjs';

const registry = getApprovedScooterWisdomRegistry();
const validation = validateScooterWisdomRegistry(registry);
assert.equal(validation.ok, true, `approved wisdom registry should validate: ${validation.errors.join('; ')}`);
assert.equal(registry.approvalRules.rawSourcesAllowedAtRuntime, false, 'raw wisdom sources must not be runtime-approved');
assert.equal(registry.approvalRules.fabricatedQuotesAllowed, false, 'fabricated Scooter quotes must be forbidden');
assert.equal(registry.approvalRules.vectorRetrievalEnabled, false, 'V1 must not enable vector retrieval');
assert.equal(getScooterWisdomVersion(), 'scooter-wisdom-v1-approved-seed', 'wisdom version should be explicit');

const context = buildScooterWisdomContext();
assert.match(context, /Scooter Wisdom Layer version/i, 'wisdom context should identify version');
assert.match(context, /approved chunks only/i, 'wisdom context should require approved chunks only');
assert.match(context, /Good products need good stories/i, 'approved founder story line should be present');
assert.match(context, /Good people should meet good people/i, 'approved networking line should be present');
assert.match(context, /Do not invent Scooter quotes/i, 'wisdom context should forbid invented quotes');
assert.doesNotMatch(context, /raw transcript/i, 'runtime context should not include raw transcript text');

const answers = Object.fromEntries(
  PITCH_QUESTIONS.map((question) => [question.id, `${question.label} This is enough founder detail for story coaching.`])
);
const prompt = buildStoryCardPrompt(answers);
assert.match(prompt.system, /Scooter Wisdom Layer version/i, 'system prompt should include Scooter Wisdom context');
assert.match(prompt.system, /Founder trust is more important than capture/i, 'system prompt should include trust-over-capture wisdom');
assert.match(prompt.system, /Do not invent Scooter quotes/i, 'system prompt should prevent fabricated Scooter quotes');
assert.match(prompt.system, /not a cold VC evaluation/i, 'system prompt should preserve warm founder room tone');
assert.doesNotMatch(prompt.system, /content\/scooter-wisdom\/raw/i, 'system prompt must not load raw wisdom folder');

console.log('PHASE 5 DOMAIN CONTRACT TESTS PASSED');
