// Non-secret Scooter media identity contract.
// Real provider account IDs can be committed here after Scooter likeness/voice approval.
// API keys, webhook secrets, and Cloudflare tokens must remain in env/vault only.

export const SCOOTER_MEDIA_IDENTITY = Object.freeze({
  version: 'phase9d-elevenlabs-first-media-identity-v1',
  person: 'Scooter Taylor',
  approvedPhotoAsset: '/assets/avatar/scooter-avatar-source.png',
  approvedDrivingVideoAsset: '/assets/avatar/scooter-driving-video-source.mp4',
  voiceProvider: 'elevenlabs',
  avatarProvider: 'elevenlabs_video',
  fallbackAvatarProviders: Object.freeze(['heygen', 'makeugc']),
  elevenLabsVoiceId: 'hANI1GBmIHJmKw4YnaGO',
  elevenLabsAvatarId: 'TO_BE_SET_AFTER_ELEVENLABS_VIDEO_ASSET_CREATION_IF_REQUIRED',
  heygenAvatarId: 'DISABLED_UNLESS_PROVIDER_SELECTED',
  makeugcAvatarId: 'DISABLED_UNLESS_PROVIDER_SELECTED',
  makeugcVoiceId: 'DISABLED_UNLESS_PROVIDER_SELECTED',
  requiredMediaMoments: Object.freeze(['welcome', 'final_summary', 'share_cta']),
  recommendedScriptSeconds: Object.freeze({
    welcome: 20,
    midpoint: 15,
    final_summary: 40,
    share_cta: 15
  }),
  rules: Object.freeze({
    voiceIdIsSecret: false,
    providerIdsAreSecrets: false,
    apiKeysRemainEnvOnly: true,
    founderUiMayRequestPaidMedia: false,
    talkingScooterIsCoreExperience: true,
    textOnlyIsDegradedMode: true,
    welcomeClipCanBeCached: true,
    finalSummaryShouldBeDynamic: true,
    shareCloseCanBeCachedOrLightlyDynamic: true,
    everyIntendedJourneyNeedsTalkingScooterAtKeyMoments: true
  })
});

export function isPlaceholderMediaId(value = '') {
  return /^(REPLACE_WITH_|DISABLED|__SET|placeholder)/i.test(String(value).trim());
}
