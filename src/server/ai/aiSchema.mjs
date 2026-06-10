import { PITCH_QUESTIONS, QUESTION_IDS, normalizeAnswer, validatePitchAnswers } from '../../runtime/pitchQuestions.mjs';
import { STORY_STRENGTH_CATEGORIES, STORY_STRENGTH_LABELS, createStoryStrengthSignalsFromAnswers } from '../../runtime/storyCard.mjs';

export const PHASE_4_AI_DISCLOSURE = 'AI Scooter is an AI storytelling coach inspired by Scooter Taylor. This is not the real-time human Scooter, not an investment decision, and not a guarantee of review, funding, intros, or a meeting.';

export const ALLOWED_LLM_PROVIDERS = ['gemini', 'openai', 'test_local'];

const maxInputCharsDefault = 12000;

function asString(value) {
  return String(value ?? '').trim();
}

function clampText(value, maxLength) {
  const text = asString(value).replace(/\s+/g, ' ');
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…` : text;
}

export function normalizePitchAnswers(rawAnswers) {
  const answers = {};
  for (const question of PITCH_QUESTIONS) answers[question.id] = normalizeAnswer(rawAnswers?.[question.id]);
  return answers;
}

export function createAiRequestPayload(rawAnswers) {
  const answers = normalizePitchAnswers(rawAnswers);
  const validation = validatePitchAnswers(answers);
  const totalInputChars = QUESTION_IDS.reduce((sum, id) => sum + answers[id].length, 0);
  return { answers, validation, totalInputChars };
}

export function validateAiRequest(rawAnswers, options = {}) {
  const maxInputChars = Number(options.maxInputChars || maxInputCharsDefault);
  const payload = createAiRequestPayload(rawAnswers);
  const errors = { ...payload.validation.errors };
  if (payload.totalInputChars > maxInputChars) errors.totalInputChars = `Total pitch input exceeds ${maxInputChars} characters.`;
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    answers: payload.answers,
    totalInputChars: payload.totalInputChars
  };
}

export function emptyAiStoryCard() {
  return {
    oneLinePitch: '',
    companySummary: '',
    customer: '',
    problem: '',
    solution: '',
    proofTraction: '',
    founderEdge: '',
    whyNow: '',
    biggestStoryGap: '',
    biggestObjection: '',
    suggestedNextRelationships: '',
    nextSteps: ''
  };
}

export function validateAiStoryCard(card) {
  const required = Object.keys(emptyAiStoryCard());
  const errors = {};
  const normalized = {};
  for (const key of required) {
    const value = clampText(card?.[key], 900);
    normalized[key] = value;
    if (value.length < 8) errors[key] = 'Required story-card field is missing or too thin.';
  }
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    card: normalized
  };
}


export function validateStoryStrengthSignals(rawSignals, answers = {}) {
  const source = Array.isArray(rawSignals) && rawSignals.length ? rawSignals : createStoryStrengthSignalsFromAnswers(answers);
  const normalized = [];
  const errors = {};
  const byCategory = new Map(source.map((item) => [asString(item?.category), item]));
  for (const category of STORY_STRENGTH_CATEGORIES) {
    const item = byCategory.get(category);
    const signal = asString(item?.signal);
    const guidance = clampText(item?.guidance, 360);
    if (!STORY_STRENGTH_LABELS.includes(signal)) errors[category] = 'Story Strength signal must be Strong, Developing, or Needs Sharpening.';
    if (guidance.length < 12) errors[`${category} guidance`] = 'Story Strength guidance is missing or too thin.';
    normalized.push({
      category,
      signal: STORY_STRENGTH_LABELS.includes(signal) ? signal : createStoryStrengthSignalsFromAnswers(answers).find((fallback) => fallback.category === category)?.signal || 'Developing',
      guidance: guidance || createStoryStrengthSignalsFromAnswers(answers).find((fallback) => fallback.category === category)?.guidance || 'Sharpen this section with one more concrete detail.'
    });
  }
  return { ok: Object.keys(errors).length === 0, errors, signals: normalized };
}

export function validateAiCritique(critique) {
  const required = [
    'whatIsClear',
    'whatIsConfusing',
    'whatSoundsGeneric',
    'needsStrongerProof',
    'likelyObjection',
    'betterStoryAngle',
    'suggestedNextQuestion'
  ];
  const errors = {};
  const normalized = {};
  for (const key of required) {
    const value = clampText(critique?.[key], 700);
    normalized[key] = value;
    if (value.length < 8) errors[key] = 'Required critique field is missing or too thin.';
  }
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    critique: normalized
  };
}

export function validateAiResponseShape(raw, answers = {}) {
  const warnings = Array.isArray(raw?.warnings) ? raw.warnings.map((item) => clampText(item, 240)).filter(Boolean).slice(0, 8) : [];
  const critiqueResult = validateAiCritique(raw?.critique);
  const cardResult = validateAiStoryCard(raw?.storyCard);
  const strengthResult = validateStoryStrengthSignals(raw?.storyStrengthSignals, answers);
  const allowedNotice = clampText(raw?.disclosure || PHASE_4_AI_DISCLOSURE, 500);
  return {
    ok: critiqueResult.ok && cardResult.ok && strengthResult.ok,
    errors: {
      critique: critiqueResult.errors,
      storyCard: cardResult.errors,
      storyStrengthSignals: strengthResult.errors
    },
    value: {
      status: 'ai_story_card_ready',
      aiEnhanced: true,
      shareEnabled: false,
      disclosure: allowedNotice,
      critique: critiqueResult.critique,
      storyCard: cardResult.card,
      storyStrengthSignals: strengthResult.signals,
      warnings
    }
  };
}

export function createAiUnavailableResponse(reason = 'AI coaching is unavailable right now.') {
  return {
    status: 'ai_unavailable',
    aiEnhanced: false,
    shareEnabled: false,
    disclosure: PHASE_4_AI_DISCLOSURE,
    reason: clampText(reason, 500),
    storyCard: null,
    critique: null
  };
}
