export const PITCH_LAB_SHARE_CONSENT_VERSION = 'pitch-lab-share-v1';
export const PITCH_LAB_SOURCE = 'pitch_lab';
export const PITCH_LAB_CAPTURE_TYPE = 'pitch_practice';

export const REQUIRED_FOUNDER_FIELDS = ['name', 'email', 'companyName'];
export const STORY_CARD_KEYS = [
  'oneLinePitch',
  'companySummary',
  'customer',
  'problem',
  'solution',
  'proofTraction',
  'founderEdge',
  'whyNow',
  'biggestStoryGap',
  'biggestObjection',
  'suggestedNextRelationships',
  'nextSteps'
];

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function normalizeText(value, max = 1200) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

export function validateFounderContact(founder) {
  const normalized = {
    name: normalizeText(founder?.name, 160),
    email: normalizeEmail(founder?.email),
    companyName: normalizeText(founder?.companyName, 180),
    website: normalizeText(founder?.website, 240)
  };
  const errors = {};
  if (normalized.name.length < 2) errors.name = 'Founder name is required.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized.email)) errors.email = 'Valid founder email is required.';
  if (normalized.companyName.length < 2) errors.companyName = 'Company name is required.';
  return { ok: Object.keys(errors).length === 0, errors, founder: normalized };
}

export function validateShareConsent(consent) {
  const normalized = {
    shareWithWestPeek: consent?.shareWithWestPeek === true,
    consentVersion: String(consent?.consentVersion || PITCH_LAB_SHARE_CONSENT_VERSION),
    consentedAt: String(consent?.consentedAt || new Date().toISOString())
  };
  const errors = {};
  if (!normalized.shareWithWestPeek) errors.shareWithWestPeek = 'Share consent is required.';
  if (normalized.consentVersion !== PITCH_LAB_SHARE_CONSENT_VERSION) errors.consentVersion = 'Unsupported consent version.';
  if (Number.isNaN(Date.parse(normalized.consentedAt))) errors.consentedAt = 'Consent timestamp must be ISO-compatible.';
  return { ok: Object.keys(errors).length === 0, errors, consent: normalized };
}

export function validateStoryCardForShare(storyCard) {
  const normalized = {};
  const errors = {};
  for (const key of STORY_CARD_KEYS) {
    normalized[key] = normalizeText(storyCard?.[key], 1200);
    if (normalized[key].length < 8) errors[key] = 'Required Pitch Story Card field is missing or too thin.';
  }
  return { ok: Object.keys(errors).length === 0, errors, storyCard: normalized };
}

export function buildPitchLabNetworkPayload({ founder, storyCard, consent, submittedAt = new Date().toISOString() }) {
  const founderResult = validateFounderContact(founder);
  const consentResult = validateShareConsent(consent);
  const cardResult = validateStoryCardForShare(storyCard);
  const errors = {
    founder: founderResult.errors,
    consent: consentResult.errors,
    storyCard: cardResult.errors
  };
  const ok = founderResult.ok && consentResult.ok && cardResult.ok;
  if (!ok) return { ok: false, errors, payload: null };
  return {
    ok: true,
    errors: {},
    payload: {
      source: PITCH_LAB_SOURCE,
      capture_type: PITCH_LAB_CAPTURE_TYPE,
      submitted_at: submittedAt,
      consent: {
        share_with_west_peek: true,
        consented_at: consentResult.consent.consentedAt,
        consent_version: PITCH_LAB_SHARE_CONSENT_VERSION
      },
      founder: {
        name: founderResult.founder.name,
        email: founderResult.founder.email,
        company_name: founderResult.founder.companyName,
        website: founderResult.founder.website
      },
      pitch_story_card: {
        one_line_pitch: cardResult.storyCard.oneLinePitch,
        company_summary: cardResult.storyCard.companySummary,
        customer: cardResult.storyCard.customer,
        problem: cardResult.storyCard.problem,
        solution: cardResult.storyCard.solution,
        proof_or_traction: cardResult.storyCard.proofTraction,
        founder_edge: cardResult.storyCard.founderEdge,
        why_now: cardResult.storyCard.whyNow,
        biggest_story_gap: cardResult.storyCard.biggestStoryGap,
        biggest_objection: cardResult.storyCard.biggestObjection,
        suggested_next_relationships: cardResult.storyCard.suggestedNextRelationships,
        next_steps: cardResult.storyCard.nextSteps
      },
      routing: {
        person_type: 'founder',
        trigger_intent: 'deal_flow',
        deal_flow_prospect: 'unknown',
        human_review_required: true,
        execution_allowed: false,
        review_status: 'pending_human_review'
      }
    }
  };
}

export async function signPitchLabPayload(secret, bodyText, submittedAt) {
  if (!secret || String(secret).length < 16) throw new Error('Network OS shared secret is not configured.');
  const message = `${submittedAt}.${bodyText}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return base64UrlBytes(new Uint8Array(signature));
}

function base64UrlBytes(input) {
  let binary = '';
  for (const byte of input) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
