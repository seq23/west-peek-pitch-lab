import { buildPitchLabNetworkPayload, signPitchLabPayload } from './pitchLabHandoffContract.mjs';
import { buildPitchLabProfileLeadPayload } from './profileLeadContract.mjs';

export function getNetworkOsConfig(env = {}) {
  return {
    enabled: String(env.NETWORK_OS_HANDOFF_ENABLED || 'false').toLowerCase() === 'true',
    intakeUrl: String(env.NETWORK_OS_PITCH_LAB_PACKET_ENDPOINT || env.NETWORK_OS_PITCH_LAB_ENDPOINT || env.NETWORK_OS_INTAKE_URL || '').trim(),
    sharedSecret: String(env.NETWORK_OS_SHARED_SECRET || '').trim(),
    timeoutMs: Number(env.NETWORK_OS_TIMEOUT_MS || 15000)
  };
}

export function getNetworkOsProfileConfig(env = {}) {
  return {
    enabled: String(env.NETWORK_OS_PROFILE_CAPTURE_ENABLED || env.NETWORK_OS_HANDOFF_ENABLED || 'false').toLowerCase() === 'true',
    intakeUrl: String(env.NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT || env.NETWORK_OS_PROFILE_CAPTURE_ENDPOINT || '').trim(),
    sharedSecret: String(env.NETWORK_OS_SHARED_SECRET || '').trim(),
    timeoutMs: Number(env.NETWORK_OS_TIMEOUT_MS || 15000)
  };
}

export async function submitPitchLabProfileLead({ founder, consent, aiPersona = 'AI Scooter' }, env = {}, fetchImpl = fetch) {
  const config = getNetworkOsProfileConfig(env);
  const payloadResult = buildPitchLabProfileLeadPayload({ founder, consent, aiPersona });
  if (!payloadResult.ok) return { ok: false, error_code: 'VALIDATION_FAILED', errors: payloadResult.errors };
  if (!config.enabled) return { ok: false, error_code: 'NETWORK_OS_PROFILE_CAPTURE_DISABLED', message: 'Network OS profile capture is not enabled.' };
  if (!config.intakeUrl) return { ok: false, error_code: 'NETWORK_OS_PROFILE_URL_MISSING', message: 'Network OS profile capture URL is not configured.' };
  if (!config.sharedSecret || config.sharedSecret.length < 16) return { ok: false, error_code: 'NETWORK_OS_SECRET_MISSING', message: 'Network OS shared secret is not configured.' };

  const bodyText = JSON.stringify(payloadResult.payload);
  const submittedAt = payloadResult.payload.submitted_at;
  const signature = await signPitchLabPayload(config.sharedSecret, bodyText, submittedAt);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetchImpl(config.intakeUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pitch-lab-signature': signature,
        'x-pitch-lab-submitted-at': submittedAt
      },
      body: bodyText,
      signal: controller.signal
    });
    const data = await safeJson(response);
    if (!response.ok || data?.ok !== true) {
      return { ok: false, error_code: data?.error_code || 'NETWORK_OS_REJECTED', message: data?.message || 'Network OS rejected the profile capture.' };
    }
    return {
      ok: true,
      intake_id: data.intake_id,
      profile_id: data.profile_id,
      review_status: data.review_status || 'lead_captured',
      database_write_status: data.database_write_status || 'stored',
      profile_created: data.profile_created === true,
      contact_created: data.contact_created === true
    };
  } catch {
    return { ok: false, error_code: 'NETWORK_OS_UNAVAILABLE', message: 'Network OS is unavailable. Profile capture sync is pending.' };
  } finally {
    clearTimeout(timeout);
  }
}

export async function submitPitchLabShare({ founder, storyCard, consent, deckContext = {}, profileCapture = {}, aiPersona = 'AI Scooter' }, env = {}, fetchImpl = fetch) {
  const config = getNetworkOsConfig(env);
  const payloadResult = buildPitchLabNetworkPayload({ founder, storyCard, consent, deckContext, profileCapture, aiPersona });
  if (!payloadResult.ok) return { ok: false, error_code: 'VALIDATION_FAILED', errors: payloadResult.errors };
  if (!config.enabled) return { ok: false, error_code: 'NETWORK_OS_DISABLED', message: 'Network OS sharing is not enabled.' };
  if (!config.intakeUrl) return { ok: false, error_code: 'NETWORK_OS_URL_MISSING', message: 'Network OS intake URL is not configured.' };
  if (!config.sharedSecret || config.sharedSecret.length < 16) return { ok: false, error_code: 'NETWORK_OS_SECRET_MISSING', message: 'Network OS shared secret is not configured.' };

  const bodyText = JSON.stringify(payloadResult.payload);
  const submittedAt = payloadResult.payload.submitted_at;
  const signature = await signPitchLabPayload(config.sharedSecret, bodyText, submittedAt);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetchImpl(config.intakeUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pitch-lab-signature': signature,
        'x-pitch-lab-submitted-at': submittedAt
      },
      body: bodyText,
      signal: controller.signal
    });
    const data = await safeJson(response);
    if (!response.ok || data?.ok !== true) {
      return { ok: false, error_code: data?.error_code || 'NETWORK_OS_REJECTED', message: data?.message || 'Network OS rejected the intake.' };
    }
    if (data.execution_allowed === true) return { ok: false, error_code: 'AUTO_EXECUTION_GUARD', message: 'Network OS reported execution was allowed; Pitch Lab requires human review before any action.' };
    if (data.follow_up_guaranteed === true) return { ok: false, error_code: 'FOLLOW_UP_GUARANTEE_GUARD', message: 'Network OS reported guaranteed follow-up; Pitch Lab cannot promise follow-up.' };
    return { ok: true, intake_id: data.intake_id, profile_id: data.profile_id, linked_profile_intake_id: data.linked_profile_intake_id, review_status: data.review_status, database_write_status: data.database_write_status, profile_created: data.profile_created === true, contact_created: data.contact_created === true }; 
  } catch {
    return { ok: false, error_code: 'NETWORK_OS_UNAVAILABLE', message: 'Network OS is unavailable. No submitted state was recorded.' };
  } finally {
    clearTimeout(timeout);
  }
}

async function safeJson(response) {
  try { return await response.json(); } catch { return {}; }
}
