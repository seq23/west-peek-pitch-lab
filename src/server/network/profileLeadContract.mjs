import { validateFounderContact, normalizeText, PITCH_LAB_SOURCE, PITCH_LAB_TRIGGER_INTENT } from './pitchLabHandoffContract.mjs';

export const PITCH_LAB_PROFILE_CONSENT_VERSION = 'pitch-lab-profile-v1';
export const PITCH_LAB_PROFILE_CAPTURE_TYPE = 'founder_profile_lead';
export const PROFILE_CAPTURE_STATUS_KEY = 'west-peek-pitch-lab.profile-capture-status.v1';

export function validateProfileCaptureConsent(consent = {}) {
  const normalized = {
    profileCaptureNoticeShown: consent?.profileCaptureNoticeShown === true,
    consentVersion: String(consent?.consentVersion || PITCH_LAB_PROFILE_CONSENT_VERSION),
    consentedAt: String(consent?.consentedAt || new Date().toISOString()),
    disclaimersAcknowledged: consent?.disclaimersAcknowledged || {}
  };
  const errors = {};
  if (!normalized.profileCaptureNoticeShown) errors.profileCaptureNoticeShown = 'Profile capture notice must be shown before capture.';
  if (normalized.consentVersion !== PITCH_LAB_PROFILE_CONSENT_VERSION) errors.consentVersion = 'Unsupported profile capture consent version.';
  if (Number.isNaN(Date.parse(normalized.consentedAt))) errors.consentedAt = 'Profile capture timestamp must be ISO-compatible.';
  for (const key of ['ai_disclosure','answers_private_until_share','no_guaranteed_follow_up','network_review_only']) {
    if (normalized.disclaimersAcknowledged?.[key] !== true) errors[key] = `Required profile disclaimer acknowledgement missing: ${key}`;
  }
  return { ok: Object.keys(errors).length === 0, errors, consent: normalized };
}

export function buildPitchLabProfileLeadPayload({ founder, consent = {}, aiPersona = 'AI Scooter', submittedAt = new Date().toISOString() }) {
  const founderResult = validateFounderContact(founder);
  const consentResult = validateProfileCaptureConsent(consent);
  const ok = founderResult.ok && consentResult.ok;
  if (!ok) return { ok: false, errors: { founder: founderResult.errors, consent: consentResult.errors }, payload: null };
  return { ok: true, errors: {}, payload: {
    source: PITCH_LAB_SOURCE,
    capture_type: PITCH_LAB_PROFILE_CAPTURE_TYPE,
    person_type: 'founder',
    trigger_intent: PITCH_LAB_TRIGGER_INTENT,
    network_intake: true,
    lead_stage: 'profile_gate',
    human_review_required: false,
    execution_allowed: false,
    review_status: 'lead_captured',
    investment_decision: false,
    contact_created: false,
    follow_up_guaranteed: false,
    ai_persona: aiPersona,
    submitted_at: submittedAt,
    founder: {
      name: founderResult.founder.name,
      email: founderResult.founder.email,
      company_name: founderResult.founder.companyName,
      website: normalizeText(founderResult.founder.website, 240)
    },
    consent: {
      profile_capture_notice_shown: true,
      founder_story_packet_shared: false,
      consent_version: PITCH_LAB_PROFILE_CONSENT_VERSION,
      consented_at: consentResult.consent.consentedAt
    },
    disclaimers_acknowledged: consentResult.consent.disclaimersAcknowledged
  }};
}
