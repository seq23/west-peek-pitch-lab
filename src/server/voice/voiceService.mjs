import { SCOOTER_MEDIA_IDENTITY, isPlaceholderMediaId } from '../media/scooterMediaIdentity.mjs';
const PLACEHOLDER_RE = /^(REPLACE_WITH_|DISABLED|__SET|placeholder|SET_IN_ENV_)/i;
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
  const provider = getEnv(env, 'VOICE_PROVIDER', 'fish_audio');
  const fallbackProvider = getEnv(env, 'VOICE_FALLBACK_PROVIDER', 'elevenlabs');
  const enabled = boolEnv(env, 'VOICE_DYNAMIC_GENERATION_ENABLED', true);
  const fishApiKey = getEnv(env, 'FISH_API_KEY') || getEnv(env, 'FISH_AUDIO_API_KEY');
  const fishReferenceId = getEnv(env, 'FISH_VOICE_REFERENCE_ID') || getEnv(env, 'FISH_AUDIO_REFERENCE_ID');
  const elevenApiKey = getEnv(env, 'ELEVENLABS_API_KEY');
  const elevenVoiceId = String(identity.elevenLabsVoiceId || '').trim();
  const fishConfigured = enabled && !!fishApiKey && !PLACEHOLDER_RE.test(fishApiKey) && !!fishReferenceId && !PLACEHOLDER_RE.test(fishReferenceId);
  const elevenLabsConfigured = enabled && !!elevenApiKey && !PLACEHOLDER_RE.test(elevenApiKey) && !!elevenVoiceId && !isPlaceholderMediaId(elevenVoiceId);
  const selectedFish = provider === 'fish_audio';
  const selectedElevenLabs = provider === 'elevenlabs';
  const fallbackEnabled = fallbackProvider === 'elevenlabs';
  const configured = (selectedFish && fishConfigured) || (selectedElevenLabs && elevenLabsConfigured) || (selectedFish && fallbackEnabled && elevenLabsConfigured);
  return {
    status: configured ? 'voice_configured' : 'voice_unavailable',
    provider,
    preferredProvider: 'fish_audio',
    fallbackProvider,
    activeProvider: selectedFish && fishConfigured ? 'fish_audio' : (elevenLabsConfigured && (selectedElevenLabs || fallbackEnabled) ? 'elevenlabs' : 'none'),
    enabled,
    configured,
    fishConfigured,
    elevenLabsConfigured,
    model: selectedFish ? getEnv(env, 'FISH_TTS_MODEL', 's2-pro') : getEnv(env, 'ELEVENLABS_MODEL', 'eleven_multilingual_v2'),
    cacheEnabled: boolEnv(env, 'VOICE_CACHE_ENABLED', true),
    maxChars: Number(getEnv(env, 'VOICE_MAX_CHARS', '1400')) || 1200,
    voiceIdSource: 'canonical_scooter_voice_identity',
    voiceSampleSource: identity.approvedVoiceSampleAsset || '/assets/avatar/scooter-voice-only.mp3',
    disclosure: 'Voice is AI-generated from a Fish Audio clone of the approved Scooter voice sample when configured; ElevenLabs is fallback-only. Text coaching remains available without voice.'
  };
}

export async function renderScooterVoice({ env = {}, body = {}, fetchImpl = fetch, identity = SCOOTER_MEDIA_IDENTITY } = {}) {
  const validation = validateVoiceRequest(body, env);
  if (!validation.ok) return { ok: false, httpStatus: 400, body: { status: 'invalid_voice_request', voiceReady: false, errors: validation.errors } };
  const status = getVoiceStatus(env, identity);
  if (!status.configured) return unavailable('Fish Audio voice clone or fallback ElevenLabs voice is not configured, or dynamic voice generation is disabled.', { provider: status.provider, preferredProvider: status.preferredProvider, fallbackProvider: status.fallbackProvider });

  if (status.activeProvider === 'fish_audio') {
    const apiKey = getEnv(env, 'FISH_API_KEY') || getEnv(env, 'FISH_AUDIO_API_KEY');
    const referenceId = getEnv(env, 'FISH_VOICE_REFERENCE_ID') || getEnv(env, 'FISH_AUDIO_REFERENCE_ID');
    const model = getEnv(env, 'FISH_TTS_MODEL', 's2-pro');
    const baseUrl = getEnv(env, 'FISH_API_BASE_URL', 'https://api.fish.audio').replace(/\/$/, '');
    const format = getEnv(env, 'FISH_TTS_FORMAT', 'mp3');
    try {
      const response = await fetchImpl(`${baseUrl}/v1/tts`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}`, model, accept: 'audio/mpeg' },
        body: JSON.stringify({
          text: validation.value.text,
          reference_id: referenceId,
          format,
          temperature: Number(getEnv(env, 'FISH_TTS_TEMPERATURE', '0.7')) || 0.7,
          top_p: Number(getEnv(env, 'FISH_TTS_TOP_P', '0.7')) || 0.7,
          prosody: { speed: Number(getEnv(env, 'FISH_TTS_SPEED', '1')) || 1, volume: 0, normalize_loudness: true },
          normalize: true,
          mp3_bitrate: 128,
          latency: getEnv(env, 'FISH_TTS_LATENCY', 'normal')
        })
      });
      if (!response.ok) return unavailable('Fish Audio returned an error. No fake voice output was generated.', { provider: 'fish_audio', providerStatus: response.status });
      const arrayBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
      return { ok: true, httpStatus: 200, body: { status: 'voice_ready', voiceReady: true, provider: 'fish_audio', moment: validation.value.moment, audioContentType: 'audio/mpeg', audioBase64, voiceSampleSource: status.voiceSampleSource, disclosure: status.disclosure } };
    } catch {
      return unavailable('Fish Audio request failed safely. No fake voice output was generated.', { provider: 'fish_audio' });
    }
  }

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
    return { ok: true, httpStatus: 200, body: { status: 'voice_ready', voiceReady: true, provider: 'elevenlabs', fallbackUsed: status.provider === 'fish_audio', moment: validation.value.moment, audioContentType: 'audio/mpeg', audioBase64, disclosure: status.disclosure } };
  } catch {
    return unavailable('ElevenLabs request failed safely. No fake voice output was generated.', { provider: 'elevenlabs' });
  }
}
