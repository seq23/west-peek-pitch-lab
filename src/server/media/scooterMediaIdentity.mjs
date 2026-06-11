// Non-secret Scooter media identity contract.
// Real provider account IDs can be committed here after Scooter likeness/voice approval.
// API keys, webhook secrets, and Cloudflare tokens must remain in env/vault only.

export const SCOOTER_MEDIA_IDENTITY = Object.freeze({
  version: 'phase9e-uploaded-mp3-primary-did-audio-url-media-identity-v1',
  person: 'Scooter Taylor',
  approvedPhotoAsset: '/assets/avatar/scooter-avatar-source.png',
  approvedDrivingVideoAsset: '/assets/avatar/scooter-driving-video-source.mp4',
  approvedVoiceAudioAsset: '/assets/avatar/scooter-voice-only.mp3',
  approvedVoiceAudioBackupAsset: '/assets/avatar/scooter-voice-only.m4a',
  fixedClipVoiceProvider: 'uploaded_scooter_mp3_to_did_audio_url',
  dynamicVoiceProvider: 'fish_audio_optional_for_dynamic_custom_speech',
  fallbackVoiceProvider: 'elevenlabs',
  voiceProvider: 'uploaded_scooter_mp3_primary_for_fixed_did_audio_url',
  avatarProvider: 'did',
  fallbackAvatarProviders: Object.freeze(['heygen']),
  elevenLabsVoiceId: 'hANI1GBmIHJmKw4YnaGO',
  elevenLabsAvatarId: 'UNSUPPORTED_FOR_TALKING_PHOTO_VIDEO_API',
  heygenAvatarId: 'SET_IN_ENV_HEYGEN_AVATAR_ID_IF_PROVIDER_SELECTED',
  makeugcAvatarId: 'DISABLED_UNLESS_PROVIDER_SELECTED',
  makeugcVoiceId: 'DISABLED_UNLESS_PROVIDER_SELECTED',
  requiredMediaMoments: Object.freeze(['welcome', 'final_summary', 'share_cta']),
  recommendedScriptSeconds: Object.freeze({
    welcomeTarget: '15-25',
    welcomeHardMax: 35,
    midpointTarget: '15-25',
    midpointHardMax: 35,
    finalSummaryTarget: '30-50',
    finalSummaryHardMax: 65,
    shareCloseTarget: '12-22',
    shareCloseHardMax: 30
  }),
  rules: Object.freeze({
    voiceIdIsSecret: false,
    providerIdsAreSecrets: false,
    uploadedScooterMp3IsCanonicalFixedClipVoice: true,
    didAudioUrlIsPrimaryFixedClipPath: true,
    fishAudioIsDynamicSpeechOnly: true,
    elevenLabsIsFallbackOnly: true,
    apiKeysRemainEnvOnly: true,
    founderUiMayRequestPaidMedia: false,
    talkingScooterIsCoreExperience: true,
    textOnlyIsDegradedMode: true,
    welcomeClipCanBeCached: true,
    finalSummaryShouldBeDynamic: true,
    finalSummaryTextMustAppearBeforeVideo: true,
    costControlMeansCachingDurationAndMomentSelection: true,
    shareCloseCanBeCachedOrLightlyDynamic: true,
    everyIntendedJourneyNeedsTalkingScooterAtKeyMoments: true
  })
});

export function isPlaceholderMediaId(value = '') {
  return /^(REPLACE_WITH_|DISABLED|__SET|placeholder)/i.test(String(value).trim());
}
