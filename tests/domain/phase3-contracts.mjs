#!/usr/bin/env node
import assert from 'node:assert/strict';
import { PITCH_QUESTIONS, validateAnswer, validatePitchAnswers } from '../../src/runtime/pitchQuestions.mjs';
import { createLocalDraftStoryCard } from '../../src/runtime/storyCard.mjs';
import { PHASE_3_CONSENT_STATE } from '../../src/runtime/consent.mjs';

assert.equal(PITCH_QUESTIONS.length, 7);
assert.deepEqual(PITCH_QUESTIONS.map((question) => question.label), [
  'What are you building?',
  'Who is it for?',
  'What painful problem does it solve?',
  'Why now?',
  'Why are you or your team the right people?',
  'What proof or traction do you have?',
  'What kind of help, people, capital, customers, partners, or strategic relationships do you need next?'
]);

for (const question of PITCH_QUESTIONS) {
  assert.equal(validateAnswer(question, 'x').ok, false, `${question.id} should reject thin answers`);
  assert.equal(validateAnswer(question, 'This answer has enough detail to satisfy the local question validation gate.').ok, true, `${question.id} should accept detailed answers`);
}

const answers = Object.fromEntries(PITCH_QUESTIONS.map((question) => [question.id, 'This answer has enough detail to satisfy the local question validation gate and explain the founder story.']));
assert.equal(validatePitchAnswers(answers).ok, true);

const card = createLocalDraftStoryCard(answers);
assert.equal(card.status, 'local_draft_complete');
assert.equal(card.aiEnhanced, false);
assert.equal(card.shareEnabled, false);
assert.match(card.notice, /local draft shell/i);
assert.match(card.oneLinePitch, /for/i);
assert.equal(PHASE_3_CONSENT_STATE.canShareWithWestPeek, false);
assert.equal(PHASE_3_CONSENT_STATE.emailCardEnabled, false);

const incompleteCard = createLocalDraftStoryCard({});
assert.equal(incompleteCard.status, 'local_draft_incomplete');
assert.equal(incompleteCard.aiEnhanced, false);
assert.equal(incompleteCard.shareEnabled, false);

console.log('PHASE 3 DOMAIN CONTRACT TESTS PASSED');
