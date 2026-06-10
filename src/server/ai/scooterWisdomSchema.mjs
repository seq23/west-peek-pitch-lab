export const REQUIRED_WISDOM_FIELDS = [
  'id',
  'category',
  'sourceTitle',
  'sourceDate',
  'approvalStatus',
  'runtimeText',
  'useCase',
  'prohibitedExtrapolations',
  'wisdomTier',
  'displayLabel',
  'directQuoteAllowed',
  'sourceConfidence'
];

export const WISDOM_TIERS = ['standard', 'gem', 'direct_quote'];
export const SOURCE_CONFIDENCE_LEVELS = ['approved_seed', 'approved_interview', 'direct_quote'];

export function validateWisdomChunk(chunk = {}) {
  const errors = [];
  for (const field of REQUIRED_WISDOM_FIELDS) {
    if (chunk[field] === undefined || chunk[field] === '') errors.push(`missing ${field}`);
  }
  if (chunk.approvalStatus !== 'approved') errors.push('approvalStatus must be approved for runtime.');
  if (!WISDOM_TIERS.includes(chunk.wisdomTier)) errors.push('wisdomTier must be standard, gem, or direct_quote.');
  if (!SOURCE_CONFIDENCE_LEVELS.includes(chunk.sourceConfidence)) errors.push('sourceConfidence is invalid.');
  if (!Array.isArray(chunk.prohibitedExtrapolations) || chunk.prohibitedExtrapolations.length < 1) errors.push('prohibitedExtrapolations are required.');
  if (/straight from Scooter|Scooter said|Scooter told me|quote from Scooter/i.test(String(chunk.runtimeText || '')) && chunk.directQuoteAllowed !== true) {
    errors.push('direct quote language requires directQuoteAllowed true.');
  }
  return { ok: errors.length === 0, errors };
}
