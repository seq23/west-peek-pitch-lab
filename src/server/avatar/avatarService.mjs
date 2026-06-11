import { SCOOTER_MEDIA_IDENTITY, isPlaceholderMediaId } from '../media/scooterMediaIdentity.mjs';
import { SCOOTER_MVP_V1_MEDIA_CONTRACT } from '../../runtime/scooterMediaContract.mjs';

const PLACEHOLDER_RE = /^(REPLACE_WITH_|DISABLED|__SET|placeholder|TO_BE_SET)/i;
const ALLOWED_MOMENTS = new Set(['welcome','story_transition','midpoint_checkin','final_summary','share_cta']);

function getEnv(env, key, fallback = '') { return String(env?.[key] ?? fallback).trim(); }
function boolEnv(env, key, fallback = false) { return ['true','1','yes','on'].includes(getEnv(env, key, String(fallback)).toLowerCase()); }
function unavailable(reason, extra = {}) { return { ok: false, httpStatus: 503, body: { status: 'avatar_unavailable', avatarReady: false, reason, ...extra } }; }
function hasReal(value) { const text = String(value || '').trim(); return Boolean(text) && !PLACEHOLDER_RE.test(text); }
function jsonHeaders(extra = {}) { return { 'content-type': 'application/json', ...extra }; }
async function parseProviderResponse(response) {
  const rawText = await response.text();
  try { return rawText ? JSON.parse(rawText) : {}; } catch { return { rawText: rawText.slice(0, 500) }; }
}
function providerList(env = {}, identity = SCOOTER_MEDIA_IDENTITY) {
  const primary = getEnv(env, 'AVATAR_PROVIDER', identity.avatarProvider || 'did').toLowerCase();
  const secondary = getEnv(env, 'AVATAR_SECONDARY_PROVIDER', getEnv(env, 'AVATAR_FALLBACK_PROVIDER', identity.fallbackAvatarProviders?.[0] || 'heygen')).toLowerCase();
  return Array.from(new Set([primary, secondary, 'heygen'].filter(Boolean)));
}

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
  if (!text && !audioUrl) errors.text = 'text or audioUrl is required.';
  if (text.length > maxChars) errors.text = `text exceeds AVATAR_MAX_SCRIPT_CHARS (${maxChars}).`;
  const estimatedSeconds = estimateSeconds(text || 'audio supplied for generated talking avatar');
  if (estimatedSeconds > maxSeconds) errors.estimatedSeconds = `estimated video length ${estimatedSeconds}s exceeds AVATAR_MAX_VIDEO_SECONDS (${maxSeconds}s).`;
  return { ok: Object.keys(errors).length === 0, errors, value: { text, moment, audioUrl, estimatedSeconds, maxChars, maxSeconds } };
}

function didConfigured(env = {}) {
  return hasReal(getEnv(env, 'DID_API_KEY')) && hasReal(getEnv(env, 'DID_SOURCE_URL'));
}
function heygenConfigured(env = {}, identity = SCOOTER_MEDIA_IDENTITY) {
  const avatarId = getEnv(env, 'HEYGEN_AVATAR_ID', identity.heygenAvatarId || '');
  const imageUrl = getEnv(env, 'HEYGEN_IMAGE_URL');
  return hasReal(getEnv(env, 'HEYGEN_API_KEY')) && (hasReal(avatarId) || hasReal(imageUrl));
}
function makeugcConfigured(env = {}, identity = SCOOTER_MEDIA_IDENTITY) {
  const makeugcAvatarId = String(identity.makeugcAvatarId || '').trim();
  const makeugcVoiceId = String(identity.makeugcVoiceId || '').trim();
  return hasReal(getEnv(env, 'MAKEUGC_API_KEY')) && hasReal(makeugcAvatarId) && hasReal(makeugcVoiceId);
}

export function getAvatarStatus(env = {}, identity = SCOOTER_MEDIA_IDENTITY) {
  const provider = getEnv(env, 'AVATAR_PROVIDER', identity.avatarProvider || 'did').toLowerCase();
  const enabled = boolEnv(env, 'AVATAR_DYNAMIC_GENERATION_ENABLED', false);
  const providers = providerList(env, identity);
  const providerConfigured = {
    did: didConfigured(env),
    heygen: heygenConfigured(env, identity),
    makeugc: makeugcConfigured(env, identity)
  };
  const configuredProvider = enabled ? providers.find((item) => providerConfigured[item]) || '' : '';
  const configured = Boolean(configuredProvider);
  return {
    status: configured ? 'avatar_configured' : 'avatar_unavailable',
    provider,
    enabled,
    configured,
    configuredProvider,
    providerOrder: providers,
    fallbackProvider: providers.find((item) => item !== provider) || 'heygen',
    mode: getEnv(env, 'AVATAR_MODE', 'did_primary_heygen_secondary_talking_avatar'),
    providerProofRequired: !configured,
    voiceMode: getEnv(env, 'AVATAR_VOICE_MODE', 'provider_text_voice'),
    mediaIdentitySource: 'src/server/media/scooterMediaIdentity.mjs',
    providerReadiness: providerConfigured,
    requestLevelCostGuard: {
      enabled: boolEnv(env, 'COST_GUARD_ENABLED', true),
      maxScriptChars: Number(getEnv(env, 'AVATAR_MAX_SCRIPT_CHARS', '1200')) || 1200,
      maxVideoSeconds: Number(getEnv(env, 'AVATAR_MAX_VIDEO_SECONDS', '65')) || 65,
      renderFinalSummaryOnly: boolEnv(env, 'AVATAR_RENDER_FINAL_SUMMARY_ONLY', false),
      dailyMaxRenders: Number(getEnv(env, 'AVATAR_DAILY_MAX_RENDERS', '5')) || 5,
      monthlyMaxRenders: Number(getEnv(env, 'AVATAR_MONTHLY_MAX_RENDERS', '50')) || 50,
      persistentQuotaStore: false
    },
    disclosure: 'Talking AI Scooter is generated by a managed avatar provider only when D-ID or HeyGen is configured. If providers are unavailable, the app degrades honestly to text/static media instead of faking video.'
  };
}

async function callDid({ env, request, fetchImpl }) {
  const baseUrl = getEnv(env, 'DID_API_BASE_URL', 'https://api.d-id.com').replace(/\/$/, '');
  const apiKey = getEnv(env, 'DID_API_KEY');
  const authValue = /^Basic\s+/i.test(apiKey) ? apiKey : `Basic ${apiKey}`;
  const sourceUrl = getEnv(env, 'DID_SOURCE_URL');
  if (!sourceUrl) throw new Error('did_source_url_missing');
  const script = request.audioUrl
    ? { type: 'audio', audio_url: request.audioUrl }
    : {
        type: 'text',
        input: request.text,
        provider: {
          type: getEnv(env, 'DID_VOICE_PROVIDER', 'microsoft'),
          voice_id: getEnv(env, 'DID_VOICE_ID', 'en-US-GuyNeural')
        }
      };
  const payload = {
    source_url: sourceUrl,
    script,
    config: {
      stitch: boolEnv(env, 'DID_STITCH', true),
      fluent: boolEnv(env, 'DID_FLUENT', true)
    },
    user_data: `west-peek-pitch-lab:${request.moment}`
  };
  const webhook = getEnv(env, 'DID_WEBHOOK_URL');
  const driverUrl = getEnv(env, 'DID_DRIVER_URL');
  if (webhook) payload.webhook = webhook;
  if (driverUrl) payload.driver_url = driverUrl;
  const response = await fetchImpl(`${baseUrl}/talks`, {
    method: 'POST',
    headers: jsonHeaders({ authorization: authValue }),
    body: JSON.stringify(payload)
  });
  const raw = await parseProviderResponse(response);
  if (!response.ok) throw new Error(`did_error_${response.status}`);
  return raw;
}

async function callHeyGen({ env, request, fetchImpl, identity = SCOOTER_MEDIA_IDENTITY }) {
  const baseUrl = getEnv(env, 'HEYGEN_API_BASE_URL', 'https://api.heygen.com').replace(/\/$/, '');
  const avatarId = getEnv(env, 'HEYGEN_AVATAR_ID', identity.heygenAvatarId || '');
  const imageUrl = getEnv(env, 'HEYGEN_IMAGE_URL');
  const payload = {
    type: hasReal(avatarId) ? 'avatar' : 'image',
    title: `West Peek Pitch Lab ${request.moment}`,
    aspect_ratio: getEnv(env, 'HEYGEN_ASPECT_RATIO', '16:9'),
    output_format: 'mp4',
    resolution: getEnv(env, 'HEYGEN_RESOLUTION', '720p')
  };
  if (hasReal(avatarId)) payload.avatar_id = avatarId;
  if (!hasReal(avatarId) && hasReal(imageUrl)) payload.image_url = imageUrl;
  if (request.audioUrl) payload.audio_url = request.audioUrl;
  else payload.script = request.text;
  const voiceId = getEnv(env, 'HEYGEN_VOICE_ID');
  if (!request.audioUrl && hasReal(voiceId)) payload.voice_id = voiceId;
  const response = await fetchImpl(`${baseUrl}/v3/videos`, {
    method: 'POST',
    headers: jsonHeaders({ 'x-api-key': getEnv(env, 'HEYGEN_API_KEY') }),
    body: JSON.stringify(payload)
  });
  const raw = await parseProviderResponse(response);
  if (!response.ok) throw new Error(`heygen_error_${response.status}`);
  return raw;
}

async function callMakeUgc({ env, request, fetchImpl, identity = SCOOTER_MEDIA_IDENTITY }) {
  const response = await fetchImpl(`${getEnv(env, 'MAKEUGC_API_BASE_URL')}/videos`, {
    method: 'POST',
    headers: jsonHeaders({ authorization: `Bearer ${getEnv(env, 'MAKEUGC_API_KEY')}` }),
    body: JSON.stringify({ avatar_id: identity.makeugcAvatarId, voice_id: identity.makeugcVoiceId, script: request.text })
  });
  const raw = await parseProviderResponse(response);
  if (!response.ok) throw new Error(`makeugc_error_${response.status}`);
  return raw;
}

async function callProvider(provider, args) {
  if (provider === 'did') return callDid(args);
  if (provider === 'heygen') return callHeyGen(args);
  if (provider === 'makeugc') return callMakeUgc(args);
  throw new Error(`unsupported_avatar_provider_${provider}`);
}

function providerId(raw = {}) {
  return raw?.id || raw?.data?.video_id || raw?.video_id || raw?.talk_id || raw?.data?.id || null;
}

export async function renderScooterAvatar({ env = {}, body = {}, fetchImpl = fetch, identity = SCOOTER_MEDIA_IDENTITY } = {}) {
  const validation = validateAvatarRequest(body, env);
  if (!validation.ok) return { ok: false, httpStatus: 400, body: { status: 'invalid_avatar_request', avatarReady: false, errors: validation.errors } };
  const status = getAvatarStatus(env, identity);
  if (!status.enabled) return unavailable('Talking AI Scooter media generation is disabled in this environment. This is a degraded mode, not the intended MVP experience.', { provider: status.provider, staticFallback: true, degradedMode: true });
  if (!status.configured) return unavailable('D-ID primary and HeyGen secondary avatar providers are not fully configured. No fake avatar video was generated.', { provider: status.provider, providerReadiness: status.providerReadiness, staticFallback: true, degradedMode: true });
  if (status.requestLevelCostGuard.renderFinalSummaryOnly && validation.value.moment !== 'final_summary') {
    return { ok: false, httpStatus: 429, body: { status: 'avatar_blocked_by_cost_guard', avatarReady: false, reason: 'Dynamic avatar render is restricted to final_summary by cost guard. Cached welcome/share clips should be used for those moments.', staticFallback: true } };
  }
  const errors = [];
  for (const provider of status.providerOrder) {
    if (!status.providerReadiness[provider]) continue;
    try {
      const raw = await callProvider(provider, { env, request: validation.value, fetchImpl, identity });
      return { ok: true, httpStatus: 202, body: { status: 'avatar_render_queued', avatarReady: false, provider, moment: validation.value.moment, estimatedSeconds: validation.value.estimatedSeconds, providerResponse: { id: providerId(raw) }, disclosure: status.disclosure } };
    } catch (error) {
      errors.push({ provider, error: error instanceof Error ? error.message : 'provider_error' });
    }
  }
  return unavailable('Managed avatar provider request failed safely. Static fallback should remain visible.', { provider: status.provider, providerErrors: errors, staticFallback: true });
}
