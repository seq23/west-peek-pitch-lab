import { PITCH_QUESTIONS, normalizeAnswer, validatePitchAnswers } from './pitchQuestions.mjs';

const emptyText = 'Not answered yet.';

export const STORY_CARD_SECTIONS = [
  'oneLinePitch',
  'companySummary',
  'whoItHelps',
  'problem',
  'tractionProof',
  'founderEdge',
  'whyNow',
  'biggestStoryGap',
  'suggestedNextSteps',
  'suggestedPeopleOrRelationships'
];

export const STORY_STRENGTH_LABELS = ['Strong', 'Developing', 'Needs Sharpening'];
export const STORY_STRENGTH_CATEGORIES = ['Clarity', 'Problem Urgency', 'Proof / Traction', 'Founder Edge', 'Ask / Next Relationship', 'Memorability'];

function sentenceFrom(answer, limit = 220) {
  const cleaned = normalizeAnswer(answer);
  if (!cleaned) return emptyText;
  return cleaned.length > limit ? `${cleaned.slice(0, limit - 1).trim()}…` : cleaned;
}

function strengthFrom(text, strongAt = 160, developingAt = 60) {
  const length = normalizeAnswer(text).length;
  if (length >= strongAt) return 'Strong';
  if (length >= developingAt) return 'Developing';
  return 'Needs Sharpening';
}

export function createStoryStrengthSignalsFromAnswers(answers = {}) {
  const normalized = Object.fromEntries(PITCH_QUESTIONS.map((question) => [question.id, normalizeAnswer(answers?.[question.id])]));
  return [
    { category: 'Clarity', signal: strengthFrom(`${normalized.what_building} ${normalized.who_for}`, 180, 80), guidance: 'Make the one-line pitch plain enough that a smart outsider can repeat it.' },
    { category: 'Problem Urgency', signal: strengthFrom(`${normalized.painful_problem} ${normalized.why_now}`, 190, 90), guidance: 'Sharpen the pain, urgency, and why this matters now.' },
    { category: 'Proof / Traction', signal: strengthFrom(normalized.proof_traction, 140, 55), guidance: 'Add one specific proof point: revenue, users, pilots, LOIs, waitlist, partnerships, or customer quotes.' },
    { category: 'Founder Edge', signal: strengthFrom(normalized.founder_edge, 120, 50), guidance: 'Explain why this founder or team has an unfair lived, technical, market, or relationship advantage.' },
    { category: 'Ask / Next Relationship', signal: strengthFrom(normalized.help_needed, 120, 50), guidance: 'Name the next relationship that would create momentum: customer, operator, investor, partner, or advisor.' },
    { category: 'Memorability', signal: strengthFrom(`${normalized.what_building} ${normalized.painful_problem} ${normalized.founder_edge}`, 360, 160), guidance: 'Use one concrete image, contrast, or memorable phrase so the story sticks.' }
  ];
}

export function createLocalDraftStoryCard(answers) {
  const normalized = Object.fromEntries(PITCH_QUESTIONS.map((question) => [question.id, normalizeAnswer(answers?.[question.id])]));
  const validation = validatePitchAnswers(normalized);
  const who = sentenceFrom(normalized.who_for, 120);
  const building = sentenceFrom(normalized.what_building, 180);
  const problem = sentenceFrom(normalized.painful_problem, 180);

  return {
    status: validation.ok ? 'local_draft_complete' : 'local_draft_incomplete',
    aiEnhanced: false,
    shareEnabled: false,
    notice: 'This is a local draft shell. AI coaching can create a sharper Pitch Story Card when configured. Sharing with West Peek is always optional and consent-gated.',
    oneLinePitch: validation.ok ? `${building} for ${who}.` : 'Complete the practice questions to create a local draft one-line pitch.',
    companySummary: building,
    whoItHelps: who,
    problem,
    tractionProof: sentenceFrom(normalized.proof_traction),
    founderEdge: sentenceFrom(normalized.founder_edge),
    whyNow: sentenceFrom(normalized.why_now),
    biggestStoryGap: validation.ok
      ? 'Use the Story Strength Snapshot to see what needs sharpening before sharing.'
      : 'Complete all required answers before reviewing story gaps.',
    suggestedNextSteps: validation.ok
      ? 'Review each section, tighten vague language, and generate the AI Pitch Story Card when provider keys are configured.'
      : 'Finish the question flow first.',
    suggestedPeopleOrRelationships: sentenceFrom(normalized.help_needed),
    storyStrengthSignals: createStoryStrengthSignalsFromAnswers(normalized),
    validation
  };
}
