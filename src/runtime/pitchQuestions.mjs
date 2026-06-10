export const PITCH_QUESTIONS = [
  {
    id: 'what_building',
    label: 'What are you building?',
    helper: 'Describe the company, product, or project in plain English.',
    minLength: 20,
    maxLength: 1600
  },
  {
    id: 'who_for',
    label: 'Who is it for?',
    helper: 'Name the customer, buyer, user, or community as specifically as possible.',
    minLength: 15,
    maxLength: 1200
  },
  {
    id: 'painful_problem',
    label: 'What painful problem does it solve?',
    helper: 'Focus on the painful moment, cost, delay, risk, or frustration.',
    minLength: 25,
    maxLength: 1600
  },
  {
    id: 'why_now',
    label: 'Why now?',
    helper: 'Explain the timing: market shift, behavior change, regulation, technology, or urgency.',
    minLength: 20,
    maxLength: 1400
  },
  {
    id: 'founder_edge',
    label: 'Why are you or your team the right people?',
    helper: 'Share the founder edge: lived experience, unfair insight, relationships, execution proof, or domain expertise.',
    minLength: 20,
    maxLength: 1600
  },
  {
    id: 'proof_traction',
    label: 'What proof or traction do you have?',
    helper: 'Include revenue, pilots, users, waitlist, partnerships, customer quotes, LOIs, or other proof.',
    minLength: 10,
    maxLength: 1600
  },
  {
    id: 'help_needed',
    label: 'What kind of help, people, capital, customers, partners, or strategic relationships do you need next?',
    helper: 'Be clear about the relationship or resource that would move the company forward.',
    minLength: 20,
    maxLength: 1600
  }
];

export const QUESTION_IDS = PITCH_QUESTIONS.map((question) => question.id);

export function normalizeAnswer(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function validateAnswer(question, value) {
  const answer = normalizeAnswer(value);
  if (answer.length < question.minLength) {
    return {
      ok: false,
      message: `Please add a little more detail. Minimum: ${question.minLength} characters.`
    };
  }
  if (answer.length > question.maxLength) {
    return {
      ok: false,
      message: `Please shorten this answer. Maximum: ${question.maxLength} characters.`
    };
  }
  return { ok: true, message: '' };
}

export function validatePitchAnswers(answers) {
  const errors = {};
  for (const question of PITCH_QUESTIONS) {
    const result = validateAnswer(question, answers?.[question.id]);
    if (!result.ok) errors[question.id] = result.message;
  }
  return {
    ok: Object.keys(errors).length === 0,
    errors
  };
}
