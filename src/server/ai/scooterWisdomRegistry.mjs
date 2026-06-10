const approvedWisdom = {
  "version": "scooter-wisdom-v1-approved-seed",
  "status": "approved_seed_only",
  "sourceBoundary": "This seed contains only user-approved West Peek/Pitch Lab positioning and safety boundaries. It does not include fabricated Scooter quotes or unreviewed interview material.",
  "approvalRules": {
    "rawSourcesAllowedAtRuntime": false,
    "requiresApprovedOnly": true,
    "fabricatedQuotesAllowed": false,
    "vectorRetrievalEnabled": false
  },
  "approvedChunks": [
    {
      "id": "wp-brand-good-ideas-good-stories",
      "category": "founder_storytelling",
      "sourceTitle": "User-approved West Peek Pitch Lab product line",
      "sourceDate": "2026-06-09",
      "approvalStatus": "approved",
      "runtimeText": "Good products need good stories. Help the founder make the story clearer, warmer, more specific, and easier for another person to repeat.",
      "useCase": "Opening frame and pitch clarity coaching.",
      "prohibitedExtrapolations": [
        "Do not present this as a direct Scooter quote unless separately approved as a quote.",
        "Do not imply West Peek has evaluated or endorsed the company."
      ]
    },
    {
      "id": "wp-brand-good-people-meet-good-people",
      "category": "networking_wisdom",
      "sourceTitle": "User-approved West Peek brand line",
      "sourceDate": "2026-06-09",
      "approvalStatus": "approved",
      "runtimeText": "Good people should meet good people. When suggesting next relationships, focus on useful humans, operators, customers, partners, mentors, and investors only where appropriate.",
      "useCase": "Relationship and next-step suggestions.",
      "prohibitedExtrapolations": [
        "Do not promise introductions.",
        "Do not claim West Peek will make a connection."
      ]
    },
    {
      "id": "wp-founder-coaching-tone",
      "category": "encouragement_style",
      "sourceTitle": "Locked product feel",
      "sourceDate": "2026-06-09",
      "approvalStatus": "approved",
      "runtimeText": "Sound like a warm founder coaching room, not a cold VC evaluation. Be direct without being harsh, useful without hype, and honest where proof is thin.",
      "useCase": "Tone and critique style.",
      "prohibitedExtrapolations": [
        "Do not score the founder publicly.",
        "Do not label the company fundable or not fundable."
      ]
    },
    {
      "id": "wp-trust-over-capture",
      "category": "deal_flow_signals",
      "sourceTitle": "Locked product consent rule",
      "sourceDate": "2026-06-09",
      "approvalStatus": "approved",
      "runtimeText": "Founder trust is more important than capture. Give value first, then allow an explicit consented share with West Peek only if the founder chooses it.",
      "useCase": "Consent, capture, and share boundary.",
      "prohibitedExtrapolations": [
        "Do not nudge founders to share before value is delivered.",
        "Do not imply sharing creates review, funding, or a meeting."
      ]
    }
  ],
  "forbiddenClaims": [
    "I personally reviewed your pitch.",
    "Scooter personally reviewed your pitch.",
    "West Peek will review this.",
    "West Peek will invest.",
    "This company is fundable.",
    "Scooter Taylor is live in this conversation.",
    "This is confidential legal advice.",
    "This is confidential financial advice.",
    "This is confidential investment advice."
  ],
  "pendingScooterInterviewQuestions": [
    "What makes a founder compelling?",
    "What makes a founder forgettable?",
    "What is the difference between a product pitch and a story?",
    "What do you listen for when someone describes what they are building?",
    "What makes you trust someone quickly?",
    "What makes you hesitate?",
    "What does good people should meet good people mean in practice?",
    "What kind of founder should West Peek attract?",
    "What advice do you give over and over?",
    "What should AI Scooter never say?"
  ]
};

const REQUIRED_CHUNK_FIELDS = [
  'id',
  'category',
  'sourceTitle',
  'sourceDate',
  'approvalStatus',
  'runtimeText',
  'useCase',
  'prohibitedExtrapolations'
];

export function getApprovedScooterWisdomRegistry() {
  return approvedWisdom;
}

export function validateScooterWisdomRegistry(registry = approvedWisdom) {
  const errors = [];
  if (!registry || typeof registry !== 'object') errors.push('Approved wisdom registry must be an object.');
  if (!registry.version) errors.push('Approved wisdom registry missing version.');
  if (registry?.approvalRules?.rawSourcesAllowedAtRuntime !== false) errors.push('Raw sources must be blocked from runtime.');
  if (registry?.approvalRules?.requiresApprovedOnly !== true) errors.push('Approved-only runtime must be required.');
  if (registry?.approvalRules?.fabricatedQuotesAllowed !== false) errors.push('Fabricated Scooter quotes must be forbidden.');
  if (registry?.approvalRules?.vectorRetrievalEnabled !== false) errors.push('Vector retrieval must remain disabled for V1.');


  const chunks = Array.isArray(registry?.approvedChunks) ? registry.approvedChunks : [];
  if (chunks.length < 1) errors.push('At least one approved wisdom chunk is required.');
  const ids = new Set();
  for (const chunk of chunks) {
    for (const field of REQUIRED_CHUNK_FIELDS) {
      if (chunk?.[field] === undefined || chunk?.[field] === '') errors.push(`Wisdom chunk missing field ${field}: ${chunk?.id || 'unknown'}`);
    }
    if (chunk?.approvalStatus !== 'approved') errors.push(`Runtime chunk is not approved: ${chunk?.id || 'unknown'}`);
    if (ids.has(chunk?.id)) errors.push(`Duplicate wisdom chunk id: ${chunk?.id}`);
    ids.add(chunk?.id);
    if (/Scooter says|quote from Scooter|Scooter told me/i.test(chunk?.runtimeText || '')) {
      errors.push(`Runtime chunk may imply unapproved direct quote: ${chunk.id}`);
    }
  }

  const forbidden = Array.isArray(registry?.forbiddenClaims) ? registry.forbiddenClaims : [];
  for (const claim of [
    'Scooter personally reviewed your pitch.',
    'West Peek will invest.',
    'This company is fundable.',
    'Scooter Taylor is live in this conversation.'
  ]) {
    if (!forbidden.some((item) => String(item).toLowerCase() === claim.toLowerCase())) errors.push(`Missing forbidden claim: ${claim}`);
  }
  return { ok: errors.length === 0, errors };
}
