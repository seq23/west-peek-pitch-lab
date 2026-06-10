import { approvedWisdom } from './generatedApprovedScooterWisdom.mjs';
import { REQUIRED_WISDOM_FIELDS, validateWisdomChunk } from './scooterWisdomSchema.mjs';

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
    for (const field of REQUIRED_WISDOM_FIELDS) if (chunk?.[field] === undefined || chunk?.[field] === '') errors.push(`Wisdom chunk missing field ${field}: ${chunk?.id || 'unknown'}`);
    const chunkValidation = validateWisdomChunk(chunk);
    if (!chunkValidation.ok) errors.push(...chunkValidation.errors.map((error) => `${chunk?.id || 'unknown'}: ${error}`));
    if (ids.has(chunk?.id)) errors.push(`Duplicate wisdom chunk id: ${chunk?.id}`);
    ids.add(chunk?.id);
  }
  const forbidden = Array.isArray(registry?.forbiddenClaims) ? registry.forbiddenClaims : [];
  for (const claim of ['Scooter personally reviewed your pitch.','West Peek will invest.','This company is fundable.','Scooter Taylor is live in this conversation.','This is an investment review.']) {
    if (!forbidden.some((item) => String(item).toLowerCase() === claim.toLowerCase())) errors.push(`Missing forbidden claim: ${claim}`);
  }
  return { ok: errors.length === 0, errors };
}
