import { SCOOTER_MEDIA_IDENTITY, isPlaceholderMediaId } from '../media/scooterMediaIdentity.mjs';
import { SCOOTER_MVP_V1_MEDIA_CONTRACT } from '../../runtime/scooterMediaContract.mjs';
const PLACEHOLDER_RE = /^(REPLACE_WITH_|DISABLED|__SET|placeholder)/i;
const ALLOWED_MOMENTS = new Set(['welcome','story_transition','midpoint_checkin','final_summary','share_cta']);

function getEnv(env, key, fallback = '') { return String(env?.[key] ?? fallback).trim(); }
function boolEnv(env, key, fallback = false) { return ['true','1','yes','on'].includes(getEnv(env, key, String(fallback)).toLowerCase()); }
function unavailable(reason, extra = {}) { return { ok: false, httpStatus: 503, body: { status: 'avatar_unavailable', avatarReady: false, reason, ...extra } }; }

export function estimateSeconds(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 2.5));
}

export function validateAvatarRequest(body = {}, env = {}) {
  const text = String(body.text ?? '').trim();
  const moment = String(body.moment ?? '').trim();
  const audioUrl = String(body.audioUrl ?? '').trim();
  const maxChars = Number(getEnv(env, 'AVATAR_MAX_SCRIPT_CHARS', '1200')) || 1200;
  const globalMaxSeconds = Number(getEnv(env, 'AVATAR_MAX_VIDEO_SECONDS', '65')) || 65;
  const momentMaxSeconds = SCOOTER_MVP_V1_MEDIA_CONTRACT.durationGuidance[moment]?.hardMaxSeconds || globalMaxSeconds;
  const maxSeconds = Math.min(globalMaxSeconds, momentMaxSeconds);
  const errors = {};
  if (!ALLOWED_MOMENTS.has(moment)) errors.moment = `moment must be one of: ${Array.from(ALLOWED_MOMENTS).join(', ')}`;
  if (!text) errors.text = 'text is required.';
  if (text.length > maxChars) errors.text = `text exceeds AVATAR_MAX_SCRIPT_CHARS (${maxChars}).`;
  const estimatedSeconds = estimateSeconds(text);
  if (estimatedSeconds > maxSeconds) errors.estimatedSeconds = `estimated video length ${estimatedSeconds}s exceeds AVATAR_MAX_VIDEO_SECONDS (${maxSeconds}s).`;
  return { ok: Object.keys(errors).length === 0, errors, value: { text, moment, audioUrl, estimatedSeconds, maxChars, maxSeconds } };
}

export function getAvatarStatus(env = {}, identity = SCOOTER_MEDIA_IDENTITY) {
  const provider = getEnv(env, 'AVATAR_PROVIDER', 'elevenlabs_video');
  const enabled = boolEnv(env, 'AVATAR_DYNAMIC_GENERATION_ENABLED', false);
  const elevenLabsConfigured = provider === 'elevenlabs_video' && getEnv(env, 'ELEVENLABS_API_KEY') && !PLACEHOLDER_RE.test(getEnv(env, 'ELEVENLABS_API_KEY')) && identity.approvedPhotoAsset && !isPlaceholderMediaId(identity.elevenLabsVoiceId);
  const heygenAvatarId = String(identity.heygenAvatarId || '').trim();
  const makeugcAvatarId = String(identity.makeugcAvatarId || '').trim();
  const makeugcVoiceId = String(identity.makeugcVoiceId || '').trim();
  const heygenConfigured = provider === 'heygen' && getEnv(env, 'HEYGEN_API_KEY') && !PLACEHOLDER_RE.test(getEnv(env, 'HEYGEN_API_KEY')) && heygenAvatarId && !isPlaceholderMediaId(heygenAvatarId);
  const makeugcConfigured = provider === 'makeugc' && getEnv(env, 'MAKEUGC_API_KEY') && !PLACEHOLDER_RE.test(getEnv(env, 'MAKEUGC_API_KEY')) && makeugcAvatarId && !isPlaceholderMediaId(makeugcAvatarId) && makeugcVoiceId && !isPlaceholderMediaId(makeugcVoiceId);
  const configured = enabled && (elevenLabsConfigured || heygenConfigured || makeugcConfigured);
  return {
    status: configured ? 'avatar_configured' : 'avatar_unavailable',
    provider,
    enabled,
    configured,
    fallbackProvider: provider === 'elevenlabs_video' ? 'heygen' : (provider === 'heygen' ? 'makeugc' : 'heygen'),
    mode: getEnv(env, 'AVATAR_MODE', 'elevenlabs_talking_photo_key_moments'),
    voiceMode: getEnv(env, 'HEYGEN_VOICE_MODE', 'uploaded_audio'),
    mediaIdentitySource: 'src/server/media/scooterMediaIdentity.mjs',
    requestLevelCostGuard: {
      enabled: boolEnv(env, 'COST_GUARD_ENABLED', true),
      maxScriptChars: Number(getEnv(env, 'AVATAR_MAX_SCRIPT_CHARS', '1200')) || 1200,
      maxVideoSeconds: Number(getEnv(env, 'AVATAR_MAX_VIDEO_SECONDS', '65')) || 65,
      renderFinalSummaryOnly: boolEnv(env, 'AVATAR_RENDER_FINAL_SUMMARY_ONLY', false),
      dailyMaxRenders: Number(getEnv(env, 'AVATAR_DAILY_MAX_RENDERS', '5')) || 5,
      monthlyMaxRenders: Number(getEnv(env, 'AVATAR_MONTHLY_MAX_RENDERS', '50')) || 50,
      persistentQuotaStore: false
    },
    disclosure: 'Talking AI Scooter is the intended experience at key moments. If the provider is unavailable, the app degrades honestly to text/static media instead of faking video.'
  };
}

async function callHeyGen({ env, request, fetchImpl, identity = SCOOTER_MEDIA_IDENTITY }) {
  const response = await fetchImpl(`${getEnv(env, 'HEYGEN_API_BASE_URL', 'https://api.heygen.com')}/v2/video/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': getEnv(env, 'HEYGEN_API_KEY') },
    body: JSON.stringify({
      video_inputs: [{ character: { type: 'avatar', avatar_id: identity.heygenAvatarId }, voice: request.audioUrl ? { type: 'audio', audio_url: request.audioUrl } : { type: 'text', input_text: request.text } }],
      dimension: { width: 1280, height: 720 }
    })
  });
  if (!response.ok) throw new Error(`heygen_error_${response.status}`);
  return response.json();
}

async function callMakeUgc({ env, request, fetchImpl, identity = SCOOTER_MEDIA_IDENTITY }) {
  const response = await fetchImpl(`${getEnv(env, 'MAKEUGC_API_BASE_URL')}/videos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${getEnv(env, 'MAKEUGC_API_KEY')}` },
    body: JSON.stringify({ avatar_id: identity.makeugcAvatarId, voice_id: identity.makeugcVoiceId, script: request.text })
  });
  if (!response.ok) throw new Error(`makeugc_error_${response.status}`);
  return response.json();
}


async function callElevenLabsVideo({ request, identity = SCOOTER_MEDIA_IDENTITY }) {
  // ElevenLabs Image & Video/Lip-sync is the approved MVP provider priority, but exact live API
  // endpoint/asset IDs must be confirmed during the env/provider subset of 9D before production use.
  // This adapter intentionally fails closed instead of faking an MP4 or pretending the provider queued.
  const hasIdentity = identity.approvedPhotoAsset && identity.elevenLabsVoiceId && !isPlaceholderMediaId(identity.elevenLabsVoiceId);
  if (!hasIdentity) throw new Error('elevenlabs_video_identity_not_configured');
  if (request.moment !== 'welcome' && request.moment !== 'final_summary' && request.moment !== 'share_cta') {
    throw new Error('elevenlabs_video_moment_not_required_for_mvp');
  }
  throw new Error('elevenlabs_video_live_endpoint_pending_9d_env_provider_setup');
}

export async function renderScooterAvatar({ env = {}, body = {}, fetchImpl = fetch, identity = SCOOTER_MEDIA_IDENTITY } = {}) {
  const validation = validateAvatarRequest(body, env);
  if (!validation.ok) return { ok: false, httpStatus: 400, body: { status: 'invalid_avatar_request', avatarReady: false, errors: validation.errors } };
  const status = getAvatarStatus(env, identity);
  if (!status.enabled) return unavailable('Talking AI Scooter media generation is disabled in this environment. This is a degraded mode, not the intended MVP experience.', { provider: status.provider, staticFallback: true, degradedMode: true });
  if (!status.configured) return unavailable('ElevenLabs-first talking-photo provider is not configured. No fake avatar video was generated.', { provider: status.provider, staticFallback: true, degradedMode: true });
  if (status.requestLevelCostGuard.renderFinalSummaryOnly && validation.value.moment !== 'final_summary') {
    return { ok: false, httpStatus: 429, body: { status: 'avatar_blocked_by_cost_guard', avatarReady: false, reason: 'Dynamic avatar render is restricted to final_summary by cost guard. Cached welcome/share clips should be used for those moments.', staticFallback: true } };
  }
  try {
    const raw = status.provider === 'elevenlabs_video'
      ? await callElevenLabsVideo({ env, request: validation.value, fetchImpl, identity })
      : (status.provider === 'makeugc'
        ? await callMakeUgc({ env, request: validation.value, fetchImpl, identity })
        : await callHeyGen({ env, request: validation.value, fetchImpl, identity }));
    return { ok: true, httpStatus: 202, body: { status: 'avatar_render_queued', avatarReady: false, provider: status.provider, moment: validation.value.moment, estimatedSeconds: validation.value.estimatedSeconds, providerResponse: { id: raw?.data?.video_id ?? raw?.id ?? raw?.video_id ?? null }, disclosure: status.disclosure } };
  } catch (error) {
    return unavailable('Managed avatar provider request failed safely. Static fallback should remain visible.', { provider: status.provider, providerError: error instanceof Error ? error.message : 'provider_error', staticFallback: true });
  }
}
