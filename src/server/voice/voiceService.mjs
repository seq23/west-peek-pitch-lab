import { SCOOTER_MEDIA_IDENTITY, isPlaceholderMediaId } from '../media/scooterMediaIdentity.mjs';
const PLACEHOLDER_RE = /^(REPLACE_WITH_|DISABLED|__SET|placeholder)/i;
const ALLOWED_MOMENTS = new Set(['welcome','hearing','final_summary','good_ideas','share_cta']);

function getEnv(env, key, fallback = '') {
  return String(env?.[key] ?? fallback).trim();
}

function boolEnv(env, key, fallback = false) {
  const value = getEnv(env, key, String(fallback));
  return ['true','1','yes','on'].includes(value.toLowerCase());
}

function unavailable(reason, extra = {}) {
  return { ok: false, httpStatus: 503, body: { status: 'voice_unavailable', voiceReady: false, reason, ...extra } };
}

export function validateVoiceRequest(body = {}, env = {}) {
  const text = String(body.text ?? '').trim();
  const moment = String(body.moment ?? '').trim();
  const maxChars = Number(getEnv(env, 'VOICE_MAX_CHARS', '1400')) || 1200;
  const errors = {};
  if (!ALLOWED_MOMENTS.has(moment)) errors.moment = `moment must be one of: ${Array.from(ALLOWED_MOMENTS).join(', ')}`;
  if (!text) errors.text = 'text is required.';
  if (text.length > maxChars) errors.text = `text exceeds VOICE_MAX_CHARS (${maxChars}).`;
  return { ok: Object.keys(errors).length === 0, errors, value: { text, moment, maxChars } };
}

export function getVoiceStatus(env = {}, identity = SCOOTER_MEDIA_IDENTITY) {
  const provider = getEnv(env, 'VOICE_PROVIDER', 'elevenlabs');
  const enabled = boolEnv(env, 'VOICE_DYNAMIC_GENERATION_ENABLED', true);
  const apiKey = getEnv(env, 'ELEVENLABS_API_KEY');
  const voiceId = String(identity.elevenLabsVoiceId || '').trim();
  const configured = provider === 'elevenlabs' && enabled && apiKey && !PLACEHOLDER_RE.test(apiKey) && voiceId && !isPlaceholderMediaId(voiceId);
  return {
    status: configured ? 'voice_configured' : 'voice_unavailable',
    provider,
    enabled,
    configured,
    model: getEnv(env, 'ELEVENLABS_MODEL', 'eleven_multilingual_v2'),
    cacheEnabled: boolEnv(env, 'VOICE_CACHE_ENABLED', true),
    maxChars: Number(getEnv(env, 'VOICE_MAX_CHARS', '1400')) || 1200,
    voiceIdSource: 'src/server/media/scooterMediaIdentity.mjs',
    disclosure: 'Voice is AI-generated with the committed Scooter voice identity only when ElevenLabs is configured. Text coaching remains available without voice.'
  };
}

export async function renderScooterVoice({ env = {}, body = {}, fetchImpl = fetch, identity = SCOOTER_MEDIA_IDENTITY } = {}) {
  const validation = validateVoiceRequest(body, env);
  if (!validation.ok) return { ok: false, httpStatus: 400, body: { status: 'invalid_voice_request', voiceReady: false, errors: validation.errors } };
  const status = getVoiceStatus(env, identity);
  if (!status.configured) return unavailable('ElevenLabs voice is not configured or dynamic voice generation is disabled.', { provider: status.provider });
  const apiKey = getEnv(env, 'ELEVENLABS_API_KEY');
  const voiceId = String(identity.elevenLabsVoiceId || '').trim();
  const model = getEnv(env, 'ELEVENLABS_MODEL', 'eleven_multilingual_v2');
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'xi-api-key': apiKey, accept: 'audio/mpeg' },
      body: JSON.stringify({ text: validation.value.text, model_id: model, voice_settings: { stability: 0.55, similarity_boost: 0.85 } })
    });
    if (!response.ok) return unavailable('ElevenLabs returned an error. No fake voice output was generated.', { provider: 'elevenlabs', providerStatus: response.status });
    const arrayBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
    return { ok: true, httpStatus: 200, body: { status: 'voice_ready', voiceReady: true, provider: 'elevenlabs', moment: validation.value.moment, audioContentType: 'audio/mpeg', audioBase64, disclosure: status.disclosure } };
  } catch {
    return unavailable('ElevenLabs request failed safely. No fake voice output was generated.', { provider: 'elevenlabs' });
  }
}
