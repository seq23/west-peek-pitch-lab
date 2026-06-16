#!/usr/bin/env node
import assert from 'node:assert/strict';
import { PITCH_QUESTIONS, validateAnswer, validatePitchAnswers, countCompletedPitchAnswers } from '../../src/runtime/pitchQuestions.mjs';
import { createLocalDraftStoryCard } from '../../src/runtime/storyCard.mjs';
import { PHASE_3_CONSENT_STATE } from '../../src/runtime/consent.mjs';

assert.equal(PITCH_QUESTIONS.length, 8);
assert.deepEqual(PITCH_QUESTIONS.map((question) => question.label), [
  'What are you building?',
  'Who is it for?',
  'What painful problem does it solve?',
  'Why now?',
  'Why are you or your team the right people?',
  'What proof or traction do you have?',
  'What kind of help, people, capital, customers, partners, or strategic relationships do you need next?',
  'Anything else AI Scooter should know?'
]);
assert.equal(PITCH_QUESTIONS.at(-1).required, false, 'final context prompt should be optional');

for (const question of PITCH_QUESTIONS) {
  if (question.required === false) {
    assert.equal(validateAnswer(question, '').ok, true, `${question.id} should allow blank optional context`);
  } else {
    assert.equal(validateAnswer(question, 'x').ok, false, `${question.id} should reject thin answers`);
  }
  assert.equal(validateAnswer(question, 'This answer has enough detail to satisfy the local question validation gate.').ok, true, `${question.id} should accept detailed answers`);
}

const answers = Object.fromEntries(PITCH_QUESTIONS.map((question) => [question.id, 'This answer has enough detail to satisfy the local question validation gate and explain the founder story.']));
assert.equal(validatePitchAnswers(answers).ok, true);


assert.equal(countCompletedPitchAnswers({}), 0, 'blank optional prompt must not reveal or advance the live draft');
assert.equal(countCompletedPitchAnswers({ anything_else: '' }), 0, 'blank optional context must not count as a completed story element');
assert.equal(countCompletedPitchAnswers({ what_building: answers.what_building }), 1, 'first meaningful required answer should reveal one live-draft element');

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
