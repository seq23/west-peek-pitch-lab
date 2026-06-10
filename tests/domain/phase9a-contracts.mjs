import assert from 'node:assert/strict';
import { PITCH_QUESTIONS } from '../../src/runtime/pitchQuestions.mjs';
import { createLocalDraftStoryCard, STORY_STRENGTH_CATEGORIES, STORY_STRENGTH_LABELS } from '../../src/runtime/storyCard.mjs';
import { formatStoryCardForClipboard } from '../../src/runtime/clipboard.mjs';
import { validateAiResponseShape } from '../../src/server/ai/aiSchema.mjs';
import { buildPitchLabNetworkPayload } from '../../src/server/network/pitchLabHandoffContract.mjs';

const answers = Object.fromEntries(PITCH_QUESTIONS.map((question) => [question.id, 'This is a concrete founder answer with customer, problem, traction, founder edge, timing, and relationship context for journey validation.']));
const localCard = createLocalDraftStoryCard(answers);
assert.equal(localCard.status, 'local_draft_complete');
assert.equal(localCard.shareEnabled, false);
assert.equal(localCard.storyStrengthSignals.length, STORY_STRENGTH_CATEGORIES.length);
for (const item of localCard.storyStrengthSignals) {
  assert.ok(STORY_STRENGTH_CATEGORIES.includes(item.category));
  assert.ok(STORY_STRENGTH_LABELS.includes(item.signal));
  assert.doesNotMatch(item.signal, /\d/);
  assert.match(item.guidance, /\w{4,}/);
}

const aiRaw = {
  disclosure: 'AI Scooter is an AI storytelling coach inspired by Scooter Taylor. This is not the real-time human Scooter, not an investment decision, and not a guarantee of review, funding, intros, or a meeting.',
  critique: {
    whatIsClear: 'The customer and product direction are understandable.',
    whatIsConfusing: 'The urgency could be more specific.',
    whatSoundsGeneric: 'Some language still sounds broad and category-level.',
    needsStrongerProof: 'Traction needs one measurable proof point.',
    likelyObjection: 'A reviewer may ask whether buyers will change behavior now.',
    betterStoryAngle: 'Open with the painful moment and then explain the founder edge.',
    suggestedNextQuestion: 'Which customer has the pain most intensely right now?'
  },
  storyCard: {
    oneLinePitch: 'A founder story lab for relationship-driven pitch practice.',
    companySummary: 'The product helps founders turn raw answers into a clearer story.',
    customer: 'Founders preparing for investor, customer, and strategic conversations.',
    problem: 'Useful companies are often explained in a way people cannot repeat.',
    solution: 'Guided prompts and AI coaching create a concise Pitch Story Card.',
    proofTraction: 'The workflow produces structured outputs and next-step guidance.',
    founderEdge: 'The founder understands the West Peek relationship lens.',
    whyNow: 'AI can make pitch coaching more accessible without forcing capture.',
    biggestStoryGap: 'The proof needs a sharper real-world example.',
    biggestObjection: 'The audience may question whether there is urgency.',
    suggestedNextRelationships: 'Customers, operators, advisors, and warm strategic partners.',
    nextSteps: 'Tighten proof, clarify urgency, copy the card, then share only if desired.'
  },
  storyStrengthSignals: [
    { category: 'Clarity', signal: 'Strong', guidance: 'The core story can be repeated by an outsider.' },
    { category: 'Problem Urgency', signal: 'Developing', guidance: 'Add the painful moment and why it matters now.' },
    { category: 'Proof / Traction', signal: 'Needs Sharpening', guidance: 'Add one specific traction point or customer proof.' },
    { category: 'Founder Edge', signal: 'Developing', guidance: 'Tie the founder edge to market advantage.' },
    { category: 'Ask / Next Relationship', signal: 'Developing', guidance: 'Name the relationship that creates momentum.' },
    { category: 'Memorability', signal: 'Developing', guidance: 'Add a memorable phrase or contrast.' }
  ],
  warnings: []
};
const aiShape = validateAiResponseShape(aiRaw, answers);
assert.equal(aiShape.ok, true);
assert.equal(aiShape.value.storyStrengthSignals.length, 6);
assert.ok(!JSON.stringify(aiShape.value).toLowerCase().includes('fundability score'));
assert.ok(!JSON.stringify(aiShape.value).match(/score\s*[:=]\s*\d/i));

const clipboardText = formatStoryCardForClipboard(aiShape.value.storyCard, { title: 'AI Pitch Story Card', storyStrengthSignals: aiShape.value.storyStrengthSignals });
assert.match(clipboardText, /Story Strength Snapshot/);
assert.match(clipboardText, /AI Pitch Story Card/);
assert.doesNotMatch(clipboardText, /fundability score/i);

const shared = buildPitchLabNetworkPayload({
  founder: { name: 'Founder Person', email: 'founder@example.com', companyName: 'Founder Co' },
  storyCard: aiShape.value.storyCard,
  consent: { shareWithWestPeek: true, consentVersion: 'pitch-lab-share-v1', consentedAt: '2026-06-09T12:00:00.000Z' }
});
assert.equal(shared.ok, true);
assert.equal(shared.payload.routing.review_status, 'pending_human_review');
assert.equal(shared.payload.routing.execution_allowed, false);
assert.equal(shared.payload.routing.human_review_required, true);

console.log('PHASE 9A DOMAIN OK — journey logic has Story Strength Signals, copy path, consented handoff, and no numeric/fundability scoring.');
