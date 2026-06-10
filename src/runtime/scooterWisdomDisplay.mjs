export const WISDOM_TIERS = ['standard', 'gem', 'direct_quote'];

export function getWisdomDisplayLabel(chunk = {}) {
  if (chunk.wisdomTier === 'gem' || chunk.wisdom_tier === 'gem') return '💎 AI Scooter Gem';
  if ((chunk.wisdomTier === 'direct_quote' || chunk.wisdom_tier === 'direct_quote') && chunk.directQuoteAllowed === true) return 'AI Scooter approved quote';
  return 'AI Scooter coaching principle';
}

export function canUseDirectQuoteLanguage(chunk = {}) {
  return chunk.directQuoteAllowed === true && Boolean(chunk.quoteText || chunk.quote_text);
}
