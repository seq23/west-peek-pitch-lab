#!/usr/bin/env node
import assert from 'node:assert/strict';
import { getVoiceStatus, renderScooterVoice } from '../../src/server/voice/voiceService.mjs';
import { getAvatarStatus, renderScooterAvatar, validateAvatarRequest } from '../../src/server/avatar/avatarService.mjs';
import { SCOOTER_MEDIA_IDENTITY } from '../../src/server/media/scooterMediaIdentity.mjs';

const placeholderEnv = {
  VOICE_PROVIDER: 'elevenlabs',
  VOICE_DYNAMIC_GENERATION_ENABLED: 'true',
  VOICE_MAX_CHARS: '1400',
  ELEVENLABS_API_KEY: 'REPLACE_WITH_LOCAL_ELEVENLABS_API_KEY',
  ELEVENLABS_MODEL: 'eleven_multilingual_v2',
  AVATAR_PROVIDER: 'did',
  AVATAR_SECONDARY_PROVIDER: 'heygen',
  AVATAR_DYNAMIC_GENERATION_ENABLED: 'true',
  AVATAR_RENDER_FINAL_SUMMARY_ONLY: 'false',
  AVATAR_MAX_SCRIPT_CHARS: '1200',
  AVATAR_MAX_VIDEO_SECONDS: '65',
  COST_GUARD_ENABLED: 'true',
  DID_API_KEY: 'REPLACE_WITH_LOCAL_DID_API_KEY',
  DID_SOURCE_URL: 'REPLACE_WITH_PUBLIC_SCOOTER_SOURCE_IMAGE_URL',
  HEYGEN_API_KEY: 'REPLACE_WITH_LOCAL_HEYGEN_API_KEY',
  HEYGEN_API_BASE_URL: 'https://api.heygen.com',
  HEYGEN_AVATAR_ID: 'REPLACE_WITH_HEYGEN_AVATAR_ID_OR_USE_HEYGEN_IMAGE_URL'
};

assert.equal(getVoiceStatus(placeholderEnv).configured, false, 'placeholder ElevenLabs key and placeholder identity must not configure voice');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.apiKeysRemainEnvOnly, true, 'media identity must not store API keys');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.talkingScooterIsCoreExperience, true, 'talking Scooter must be core to the intended MVP');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.textOnlyIsDegradedMode, true, 'text-only/static mode is degraded fallback, not intended experience');
assert.equal(SCOOTER_MEDIA_IDENTITY.approvedPhotoAsset, '/assets/avatar/scooter-avatar-source.png');
assert.equal(SCOOTER_MEDIA_IDENTITY.approvedVoiceSampleAsset, '/assets/avatar/scooter-voice-only.mp3', 'uploaded Scooter MP3 is canonical voice sample / clone source');
assert.equal(SCOOTER_MEDIA_IDENTITY.approvedVoiceSampleBackupAsset, '/assets/avatar/scooter-voice-only.m4a', 'uploaded Scooter M4A is canonical backup voice sample');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.uploadedScooterMp3IsNotFinishedWelcomeClip, true, 'uploaded Scooter MP3 is not a finished welcome/share clip');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.didAudioUrlRequiresShortGeneratedOrApprovedAudio, true, 'D-ID audio_url requires short generated or approved clip audio');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.fishOrDidCloneUsesUploadedSampleForDynamicSpeech, true, 'Fish/D-ID clone uses uploaded sample for dynamic speech');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.elevenLabsIsFallbackOnly, true, 'ElevenLabs is fallback only');
assert.equal(SCOOTER_MEDIA_IDENTITY.avatarProvider, 'did', 'D-ID is the primary avatar provider');
assert.deepEqual([...SCOOTER_MEDIA_IDENTITY.fallbackAvatarProviders], ['heygen'], 'HeyGen is the secondary avatar provider');

const approvedIdentity = { ...SCOOTER_MEDIA_IDENTITY, elevenLabsVoiceId: 'scooter-voice-id' };
let result = await renderScooterVoice({ env: placeholderEnv, body: { moment: 'welcome', text: 'Good products need good stories.' }, fetchImpl: async () => { throw new Error('must not call provider'); } });
assert.equal(result.httpStatus, 503, 'missing voice key must fail safely');
assert.equal(result.body.voiceReady, false);

result = await renderScooterVoice({ env: { ...placeholderEnv, ELEVENLABS_API_KEY: 'live-ish-key' }, identity: approvedIdentity, body: { moment: 'welcome', text: 'Hi Scooter.' }, fetchImpl: async () => new Response(new Uint8Array([1,2,3]), { status: 200 }) });
assert.equal(result.httpStatus, 200, 'configured voice provider should return ready when provider returns audio');
assert.equal(result.body.audioBase64, 'AQID');

const status = getAvatarStatus(placeholderEnv);
assert.equal(status.provider, 'did', 'D-ID must be default avatar provider in 9D');
assert.equal(status.fallbackProvider, 'heygen', 'HeyGen must be secondary avatar provider');
assert.equal(status.enabled, true, 'dynamic avatar video is intended enabled in MVP env, though provider identity/key may be unavailable');
assert.equal(status.configured, false, 'placeholder keys/source URL must not configure avatar video');
assert.equal(status.providerProofRequired, true, 'avatar video must remain proof-gated until provider credentials and source URL are real');

result = await renderScooterAvatar({ env: placeholderEnv, body: { moment: 'final_summary', text: 'This is the final story.' }, fetchImpl: async () => { throw new Error('must not call avatar provider when unconfigured'); } });
assert.equal(result.httpStatus, 503, 'unconfigured avatar render must fail safely with degraded fallback');
assert.equal(result.body.staticFallback, true);
assert.equal(result.body.degradedMode, true);

const invalidAvatar = validateAvatarRequest({ moment: 'final_summary', text: 'x'.repeat(1201) }, placeholderEnv);
assert.equal(invalidAvatar.ok, false, 'avatar script length cap must block oversize scripts');

result = await renderScooterAvatar({
  env: { ...placeholderEnv, DID_API_KEY: 'base64-ish-key', DID_SOURCE_URL: 'https://example.com/scooter.png' },
  identity: approvedIdentity,
  body: { moment: 'final_summary', text: 'This summary is worth a short avatar render.' },
  fetchImpl: async (url, init) => {
    assert.match(String(url), /api\.d-id\.com\/talks/);
    const body = JSON.parse(init.body);
    assert.equal(body.source_url, 'https://example.com/scooter.png');
    assert.equal(body.script.type, 'text');
    return new Response(JSON.stringify({ id: 'did-talk-id', status: 'created' }), { status: 201, headers: { 'content-type': 'application/json' } });
  }
});
assert.equal(result.httpStatus, 202, 'configured D-ID provider should queue avatar render');
assert.equal(result.body.provider, 'did');
assert.equal(result.body.providerResponse.id, 'did-talk-id');

result = await renderScooterAvatar({
  env: { ...placeholderEnv, DID_API_KEY: 'base64-ish-key', DID_SOURCE_URL: 'https://example.com/scooter.png' },
  identity: approvedIdentity,
  body: { moment: 'welcome', audioUrl: 'https://example.com/assets/avatar/scooter-voice-only.mp3' },
  fetchImpl: async (url, init) => {
    assert.match(String(url), /api\.d-id\.com\/talks/);
    const body = JSON.parse(init.body);
    assert.equal(body.script.type, 'audio');
    assert.equal(body.script.audio_url, 'https://example.com/assets/avatar/scooter-voice-only.mp3');
    return new Response(JSON.stringify({ id: 'did-audio-talk-id', status: 'created' }), { status: 201, headers: { 'content-type': 'application/json' } });
  }
});
assert.equal(result.httpStatus, 202, 'configured D-ID provider should queue uploaded-audio avatar render');
assert.equal(result.body.provider, 'did');
assert.equal(result.body.providerResponse.id, 'did-audio-talk-id');

result = await renderScooterAvatar({
  env: { ...placeholderEnv, AVATAR_PROVIDER: 'did', DID_API_KEY: '', DID_SOURCE_URL: '', HEYGEN_API_KEY: 'heygen-key', HEYGEN_AVATAR_ID: 'heygen-avatar-id' },
  identity: approvedIdentity,
  body: { moment: 'final_summary', text: 'This summary should fall back to HeyGen.' },
  fetchImpl: async (url, init) => {
    assert.match(String(url), /api\.heygen\.com\/v3\/videos/);
    const body = JSON.parse(init.body);
    assert.equal(body.type, 'avatar');
    assert.equal(body.avatar_id, 'heygen-avatar-id');
    return new Response(JSON.stringify({ data: { video_id: 'heygen-video-id', status: 'processing' } }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
});
assert.equal(result.httpStatus, 202, 'configured HeyGen fallback should queue avatar render');
assert.equal(result.body.provider, 'heygen');
assert.equal(result.body.providerResponse.id, 'heygen-video-id');

console.log('PHASE 6 DOMAIN CONTRACTS PASSED');
