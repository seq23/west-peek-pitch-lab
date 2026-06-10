#!/usr/bin/env node
import assert from 'node:assert/strict';
import { getVoiceStatus, renderScooterVoice } from '../../src/server/voice/voiceService.mjs';
import { getAvatarStatus, renderScooterAvatar, validateAvatarRequest } from '../../src/server/avatar/avatarService.mjs';
import { SCOOTER_MEDIA_IDENTITY } from '../../src/server/media/scooterMediaIdentity.mjs';

const placeholderEnv = {
  VOICE_PROVIDER: 'elevenlabs',
  VOICE_DYNAMIC_GENERATION_ENABLED: 'true',
  VOICE_MAX_CHARS: '1200',
  ELEVENLABS_API_KEY: 'REPLACE_WITH_LOCAL_ELEVENLABS_API_KEY',
  ELEVENLABS_MODEL: 'eleven_multilingual_v2',
  AVATAR_PROVIDER: 'elevenlabs_video',
  AVATAR_DYNAMIC_GENERATION_ENABLED: 'true',
  AVATAR_RENDER_FINAL_SUMMARY_ONLY: 'false',
  AVATAR_MAX_SCRIPT_CHARS: '700',
  AVATAR_MAX_VIDEO_SECONDS: '40',
  COST_GUARD_ENABLED: 'true',
  HEYGEN_API_KEY: 'DISABLED_UNLESS_PROVIDER_SELECTED',
  HEYGEN_API_BASE_URL: 'https://api.heygen.com'
};

assert.equal(getVoiceStatus(placeholderEnv).configured, false, 'placeholder ElevenLabs key and placeholder identity must not configure voice');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.apiKeysRemainEnvOnly, true, 'media identity must not store API keys');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.talkingScooterIsCoreExperience, true, 'talking Scooter must be core to the intended MVP');
assert.equal(SCOOTER_MEDIA_IDENTITY.rules.textOnlyIsDegradedMode, true, 'text-only/static mode is degraded fallback, not intended experience');
assert.equal(SCOOTER_MEDIA_IDENTITY.approvedPhotoAsset, '/assets/avatar/scooter-avatar-source.png');

const approvedIdentity = { ...SCOOTER_MEDIA_IDENTITY, elevenLabsVoiceId: 'scooter-voice-id' };
let result = await renderScooterVoice({ env: placeholderEnv, body: { moment: 'welcome', text: 'Good products need good stories.' }, fetchImpl: async () => { throw new Error('must not call provider'); } });
assert.equal(result.httpStatus, 503, 'missing voice key must fail safely');
assert.equal(result.body.voiceReady, false);

result = await renderScooterVoice({ env: { ...placeholderEnv, ELEVENLABS_API_KEY: 'live-ish-key' }, identity: approvedIdentity, body: { moment: 'welcome', text: 'Hi Scooter.' }, fetchImpl: async () => new Response(new Uint8Array([1,2,3]), { status: 200 }) });
assert.equal(result.httpStatus, 200, 'configured voice provider should return ready when provider returns audio');
assert.equal(result.body.audioBase64, 'AQID');

const status = getAvatarStatus(placeholderEnv);
assert.equal(status.provider, 'elevenlabs_video', 'ElevenLabs video must be default avatar provider in 9D');
assert.equal(status.enabled, true, 'dynamic avatar video is intended enabled in MVP env, though provider identity/key may be unavailable');
assert.equal(status.configured, false, 'placeholder key/voice ID must not configure avatar video');

result = await renderScooterAvatar({ env: placeholderEnv, body: { moment: 'final_summary', text: 'This is the final story.' }, fetchImpl: async () => { throw new Error('must not call avatar provider when unconfigured'); } });
assert.equal(result.httpStatus, 503, 'unconfigured avatar render must fail safely with degraded fallback');
assert.equal(result.body.staticFallback, true);
assert.equal(result.body.degradedMode, true);

const invalidAvatar = validateAvatarRequest({ moment: 'final_summary', text: 'x'.repeat(701) }, placeholderEnv);
assert.equal(invalidAvatar.ok, false, 'avatar script length cap must block oversize scripts');

result = await renderScooterAvatar({
  env: { ...placeholderEnv, ELEVENLABS_API_KEY: 'eleven-key' },
  identity: approvedIdentity,
  body: { moment: 'final_summary', text: 'This summary is worth a short avatar render.' },
  fetchImpl: async () => { throw new Error('current ElevenLabs video endpoint is not called until final 9D provider setup'); }
});
assert.equal(result.httpStatus, 503, 'ElevenLabs video endpoint remains fail-closed until final provider setup');
assert.match(result.body.providerError, /pending_9d_env_provider_setup/);
assert.equal(result.body.staticFallback, true);

console.log('PHASE 6 DOMAIN CONTRACTS PASSED');
