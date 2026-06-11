export const PITCH_LAB_SHARE_CONSENT_VERSION = 'pitch-lab-share-v1';
export const PITCH_LAB_SOURCE = 'pitch_lab';
export const PITCH_LAB_CAPTURE_TYPE = 'founder_story_packet';
export const PITCH_LAB_TRIGGER_INTENT = 'relationship_routing';

export const REQUIRED_FOUNDER_FIELDS = ['name', 'email', 'companyName'];
export const STORY_CARD_KEYS = ['oneLinePitch','companySummary','customer','problem','solution','proofTraction','founderEdge','whyNow','biggestStoryGap','biggestObjection','suggestedNextRelationships','nextSteps'];

export function normalizeEmail(value) { return String(value ?? '').trim().toLowerCase(); }
export function normalizeText(value, max = 1200) { const text = String(value ?? '').replace(/\s+/g, ' ').trim(); return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text; }

export function validateFounderContact(founder) {
  const normalized = { name: normalizeText(founder?.name,160), email: normalizeEmail(founder?.email), companyName: normalizeText(founder?.companyName,180), website: normalizeText(founder?.website,240) };
  const errors = {};
  if (normalized.name.length < 2) errors.name = 'Founder name is required.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized.email)) errors.email = 'Valid founder email is required.';
  if (normalized.companyName.length < 2) errors.companyName = 'Company name is required.';
  return { ok: Object.keys(errors).length === 0, errors, founder: normalized };
}

export function validateShareConsent(consent) {
  const normalized = {
    shareWithWestPeek: consent?.shareWithWestPeek === true,
    includeDeckFile: consent?.includeDeckFile === true,
    includePracticeVideo: consent?.includePracticeVideo === true,
    consentVersion: String(consent?.consentVersion || PITCH_LAB_SHARE_CONSENT_VERSION),
    consentedAt: String(consent?.consentedAt || new Date().toISOString()),
    disclaimersAcknowledged: consent?.disclaimersAcknowledged || {}
  };
  const errors = {};
  if (!normalized.shareWithWestPeek) errors.shareWithWestPeek = 'Share consent is required.';
  if (normalized.consentVersion !== PITCH_LAB_SHARE_CONSENT_VERSION) errors.consentVersion = 'Unsupported consent version.';
  if (Number.isNaN(Date.parse(normalized.consentedAt))) errors.consentedAt = 'Consent timestamp must be ISO-compatible.';
  for (const key of ['ai_disclosure','no_investment_advice','no_guaranteed_follow_up','network_review_only']) {
    if (normalized.disclaimersAcknowledged?.[key] !== true) errors[key] = `Required disclaimer acknowledgement missing: ${key}`;
  }
  return { ok: Object.keys(errors).length === 0, errors, consent: normalized };
}

export function validateStoryCardForShare(storyCard) {
  const normalized = {}; const errors = {};
  for (const key of STORY_CARD_KEYS) { normalized[key] = normalizeText(storyCard?.[key], 1200); if (normalized[key].length < 8) errors[key] = 'Required Pitch Story Card field is missing or too thin.'; }
  return { ok: Object.keys(errors).length === 0, errors, storyCard: normalized };
}

export function buildPitchLabNetworkPayload({ founder, storyCard, consent, deckContext = {}, profileCapture = {}, practiceRehearsal = null, aiPersona = 'AI Scooter', submittedAt = new Date().toISOString() }) {
  const founderResult = validateFounderContact(founder);
  const consentResult = validateShareConsent(consent);
  const cardResult = validateStoryCardForShare(storyCard);
  const errors = { founder: founderResult.errors, consent: consentResult.errors, storyCard: cardResult.errors };
  const ok = founderResult.ok && consentResult.ok && cardResult.ok;
  if (!ok) return { ok: false, errors, payload: null };
  return { ok: true, errors: {}, payload: {
    source: PITCH_LAB_SOURCE,
    capture_type: PITCH_LAB_CAPTURE_TYPE,
    parent_capture_type: 'founder_profile_lead',
    append_to_existing_profile: true,
    profile_capture_intake_id: normalizeText(profileCapture?.intakeId || profileCapture?.intake_id, 180),
    profile_id: normalizeText(profileCapture?.profileId || profileCapture?.profile_id, 180),
    person_type: 'founder',
    trigger_intent: PITCH_LAB_TRIGGER_INTENT,
    network_intake: true,
    deal_flow_prospect: 'unknown',
    human_review_required: true,
    execution_allowed: false,
    review_status: 'pending_network_review',
    investment_decision: false,
    contact_created: false,
    follow_up_guaranteed: false,
    ai_persona: aiPersona,
    submitted_at: submittedAt,
    founder: { name: founderResult.founder.name, email: founderResult.founder.email, company_name: founderResult.founder.companyName, website: founderResult.founder.website },
    packet: {
      version: 'founder-story-packet-v1',
      one_liner: cardResult.storyCard.oneLinePitch,
      company_summary: cardResult.storyCard.companySummary,
      customer: cardResult.storyCard.customer,
      problem: cardResult.storyCard.problem,
      solution: cardResult.storyCard.solution,
      proof: cardResult.storyCard.proofTraction,
      founder_edge: cardResult.storyCard.founderEdge,
      why_now: cardResult.storyCard.whyNow,
      help_needed: cardResult.storyCard.nextSteps,
      story_gaps: [cardResult.storyCard.biggestStoryGap].filter(Boolean),
      likely_objections: [cardResult.storyCard.biggestObjection].filter(Boolean),
      relationship_routing_notes: [cardResult.storyCard.suggestedNextRelationships].filter(Boolean),
      ai_scooter_gems_used: [],
      deck_context_used: deckContext?.deck_context_used === true,
      deck_filename: normalizeText(deckContext?.filename, 240),
      deck_included_with_consent: consentResult.consent.includeDeckFile === true,
      practice_video_included_with_consent: consentResult.consent.includePracticeVideo === true,
      practice_rehearsal: practiceRehearsal && consentResult.consent.includePracticeVideo === true ? {
        selected_take_id: normalizeText(practiceRehearsal.selected_take_id, 180),
        recorded_at: normalizeText(practiceRehearsal.recorded_at, 80),
        duration_seconds: Number(practiceRehearsal.duration_seconds || 0),
        transcript: normalizeText(practiceRehearsal.transcript, 2200),
        local_video_only: practiceRehearsal.local_video_only === true,
        upload_storage_enabled: practiceRehearsal.upload_storage_enabled === true
      } : null
    },
    consent: {
      founder_story_packet_shared: true,
      deck_file_shared: consentResult.consent.includeDeckFile === true,
      practice_video_shared: consentResult.consent.includePracticeVideo === true,
      consented_at: consentResult.consent.consentedAt,
      consent_version: PITCH_LAB_SHARE_CONSENT_VERSION
    },
    disclaimers_acknowledged: consentResult.consent.disclaimersAcknowledged
  }};
}

export async function signPitchLabPayload(secret, bodyText, submittedAt) {
  if (!secret || String(secret).length < 16) throw new Error('Network OS shared secret is not configured.');
  const message = `${submittedAt}.${bodyText}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return base64UrlBytes(new Uint8Array(signature));
}
function base64UrlBytes(input) { let binary=''; for (const byte of input) binary += String.fromCharCode(byte); return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
