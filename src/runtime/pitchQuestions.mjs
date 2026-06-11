export const PITCH_QUESTIONS = [
  {
    id: 'what_building',
    label: 'What are you building?',
    helper: 'Describe the company, product, or project in plain English.',
    hint: 'Start with the plain-English noun: “We are building a ___ for ___.” Do not lead with buzzwords.',
    example: 'Example: “We help independent event planners price, scope, and sell premium party packages faster.”',
    avoid: 'Avoid: “AI-powered platform disrupting an industry.”',
    minLength: 20,
    maxLength: 1600
  },
  {
    id: 'who_for',
    label: 'Who is it for?',
    helper: 'Name the customer, buyer, user, or community as specifically as possible.',
    hint: 'Name the person with the pain and the person who pays. If they are different, say that.',
    example: 'Example: “Our user is a solo benefits broker; our buyer is the agency owner.”',
    avoid: 'Avoid: “Everyone,” “small businesses,” or “consumers” without narrowing.',
    minLength: 15,
    maxLength: 1200
  },
  {
    id: 'painful_problem',
    label: 'What painful problem does it solve?',
    helper: 'Focus on the painful moment, cost, delay, risk, or frustration.',
    hint: 'Describe the moment the customer says, “I cannot keep doing this manually.” Include cost, time, risk, or lost revenue if you know it.',
    example: 'Example: “Managers lose 6–8 hours a week reconciling shift changes, and mistakes create overtime leakage.”',
    avoid: 'Avoid: generic “it saves time” without showing what breaks today.',
    minLength: 25,
    maxLength: 1600
  },
  {
    id: 'why_now',
    label: 'Why now?',
    helper: 'Explain the timing: market shift, behavior change, regulation, technology, or urgency.',
    hint: 'Tell Scooter what changed recently that makes this more urgent or possible now.',
    example: 'Example: “New compliance pressure and cheaper automation finally make this workflow possible for smaller firms.”',
    avoid: 'Avoid: “the market is huge” without a timing reason.',
    minLength: 20,
    maxLength: 1400
  },
  {
    id: 'founder_edge',
    label: 'Why are you or your team the right people?',
    helper: 'Share the founder edge: lived experience, unfair insight, relationships, execution proof, or domain expertise.',
    hint: 'Explain the earned advantage: what you know, have lived, have built, or can access that others cannot easily copy.',
    example: 'Example: “I ran this workflow for 12 years and already have 40 target buyers willing to pilot.”',
    avoid: 'Avoid: generic passion without evidence.',
    minLength: 20,
    maxLength: 1600
  },
  {
    id: 'proof_traction',
    label: 'What proof or traction do you have?',
    helper: 'Include revenue, pilots, users, waitlist, partnerships, customer quotes, LOIs, or other proof.',
    hint: 'One concrete proof point is better than five vague claims. If you are early, name the strongest signal you have.',
    example: 'Example: “3 paid pilots, $18K ARR, 900 waitlist signups, or 2 LOIs from design partners.”',
    avoid: 'Avoid: “people love it” without a measurable signal or quote.',
    minLength: 10,
    maxLength: 1600
  },
  {
    id: 'help_needed',
    label: 'What kind of help, people, capital, customers, partners, or strategic relationships do you need next?',
    helper: 'Be clear about the relationship or resource that would move the company forward.',
    hint: 'Name the next useful relationship. Scooter is listening for who should be in the room next, not just a vague ask.',
    example: 'Example: “We need intros to CFOs at multi-location healthcare operators for design partnerships.”',
    avoid: 'Avoid: “funding” with no use of funds, target relationship, or next step.',
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
