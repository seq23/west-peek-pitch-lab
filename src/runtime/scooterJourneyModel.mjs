export const SCOOTER_JOURNEY_RULES = {
  textFirstVideoFollows: true,
  videoNeverBlocksStoryCard: true,
  noFakeMediaSuccess: true,
  companionPersistent: true,
  mobileCompanionCompact: true,
  conversationalUiStructuredEngine: true,
  cameraLocalFirst: true,
  founderStoryPacketForRelationshipRouting: true
};

export const SCOOTER_COMPANION_STATES = {
  welcome_ready: 'AI Scooter is ready to start your pitch-practice session.',
  profile_gate_ready: 'Start with name, email, and company so your session can be saved.',
  deck_context_optional: 'Deck upload is optional context, not a deck review.',
  practice_listening: 'AI Scooter is listening for clarity, specificity, proof, and the next useful relationship.',
  practice_encouraging: 'Good. Now let’s get sharper.',
  midpoint_checkin_ready: 'The story is taking shape. Now sharpen the pain, proof, and next relationship.',
  story_reviewing: 'AI Scooter is reviewing your story.',
  story_text_ready: 'Your Pitch Story Card is ready before any video dependency.',
  final_video_pending: 'AI Scooter video is pending only when provider configuration exists.',
  final_video_ready: 'AI Scooter video is ready.',
  final_video_unavailable: 'AI Scooter video is unavailable. The text coaching remains usable.',
  practice_out_loud_ready: 'Practice this out loud locally before sharing.',
  share_decision: 'You can keep practicing privately or share your Founder Story Packet.',
  handoff_pending: 'Network review submission is pending confirmation.',
  handoff_confirmed: 'Founder Story Packet shared for network review only.',
  handoff_failed: 'Submission failed safely. No submitted state was recorded.',
  update_later: 'You can update your story and come back anytime.'
};

export const SCOOTER_MEDIA_MOMENTS = {
  welcome_cached: {
    label: 'Welcome',
    route: '/',
    script: 'Welcome to West Peek Pitch Lab. Good products need good stories. Tell me what you’re building, and let’s sharpen the story.',
    kind: 'cached_or_static',
    posterPath: '/assets/avatar/scooter-avatar-source.png',
    videoPath: '/assets/avatar/scooter-welcome.mp4',
    fallbackCopy: 'AI Scooter welcome note',
    providerRequired: false,
    durationCapSeconds: 20,
    blocksJourney: false
  },
  practice_idle: {
    label: 'Listening',
    route: '/practice',
    script: 'I’m listening for the customer, the pain, the proof, and the next useful relationship.',
    kind: 'static_text',
    posterPath: '/assets/avatar/scooter-avatar-source.png',
    providerRequired: false,
    durationCapSeconds: 10,
    blocksJourney: false
  },
  practice_encouragement: {
    label: 'Encouragement',
    route: '/practice',
    script: 'Good. Now let’s get sharper. Proof beats polish.',
    kind: 'static_text',
    posterPath: '/assets/avatar/scooter-avatar-source.png',
    providerRequired: false,
    durationCapSeconds: 12,
    blocksJourney: false
  },
  midpoint_checkin: {
    label: 'Midpoint check-in',
    route: '/practice',
    script: 'The shape is forming. Now make the pain specific and the proof concrete.',
    kind: 'static_text',
    posterPath: '/assets/avatar/scooter-avatar-source.png',
    providerRequired: false,
    durationCapSeconds: 15,
    blocksJourney: false
  },
  final_summary_dynamic: {
    label: 'Final summary',
    route: '/story-card',
    script: 'Your strongest edge and biggest story gap should be clear before you share anything.',
    kind: 'dynamic_ready',
    posterPath: '/assets/avatar/scooter-avatar-source.png',
    providerRequired: true,
    durationCapSeconds: 40,
    blocksJourney: false
  },
  share_close_cached: {
    label: 'Share close',
    route: '/share',
    script: 'You can keep practicing privately, or share this with West Peek for network review. No guarantees — just a chance to start the right conversation.',
    kind: 'cached_or_static',
    posterPath: '/assets/avatar/scooter-avatar-source.png',
    providerRequired: false,
    durationCapSeconds: 15,
    blocksJourney: false
  },
  practice_out_loud_prompt: {
    label: 'Practice Out Loud',
    route: '/story-card',
    script: 'Read this like you’re explaining it to one smart person who has never heard of your company before. Keep it clear, specific, and under 60 seconds.',
    kind: 'local_camera_prompt',
    posterPath: '/assets/avatar/scooter-avatar-source.png',
    providerRequired: false,
    durationCapSeconds: 90,
    blocksJourney: false
  }
};

export function getScooterMomentForRoute(route = '/') {
  if (route === '/practice') return SCOOTER_MEDIA_MOMENTS.practice_idle;
  if (route === '/story-card') return SCOOTER_MEDIA_MOMENTS.final_summary_dynamic;
  if (route === '/share') return SCOOTER_MEDIA_MOMENTS.share_close_cached;
  return SCOOTER_MEDIA_MOMENTS.welcome_cached;
}
