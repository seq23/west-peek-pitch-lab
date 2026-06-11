export const SCOOTER_MVP_V1_MEDIA_CONTRACT = Object.freeze({
  version: 'mvp-v1-ai-scooter-speaking-cost-contract',
  productInvariant: 'AI Scooter is the session host. Talking Scooter is required at the MVP welcome, final personalized summary, and share close moments; text-only/static mode is degraded fallback, not the intended experience.',
  textFirstVideoFollows: true,
  noVideoBlockingStoryCard: true,
  costControlModel: 'cached clips + selected dynamic moments + duration guidance + render caps + honest fallback',
  requiredSpeakingMoments: Object.freeze(['welcome', 'final_summary', 'share_cta']),
  optionalSpeakingMoments: Object.freeze(['section_encouragement', 'midpoint_checkin', 'return_user_greeting', 'improve_this_section']),
  textOnlyMoments: Object.freeze(['practice_question', 'validation_error', 'tooltip', 'field_help', 'policy_detail', 'packet_detail']),
  durationGuidance: Object.freeze({
    welcome: Object.freeze({ targetSeconds: '15-25', hardMaxSeconds: 35, dynamic: false, mediaModel: 'cached_or_prerendered' }),
    section_encouragement: Object.freeze({ targetSeconds: '6-12', hardMaxSeconds: 18, dynamic: false, mediaModel: 'cached_optional' }),
    midpoint_checkin: Object.freeze({ targetSeconds: '15-25', hardMaxSeconds: 35, dynamic: 'optional', mediaModel: 'cached_or_light_dynamic_optional' }),
    final_summary: Object.freeze({ targetSeconds: '30-50', hardMaxSeconds: 65, dynamic: true, mediaModel: 'dynamic_personalized' }),
    share_cta: Object.freeze({ targetSeconds: '12-22', hardMaxSeconds: 30, dynamic: 'cached_or_light', mediaModel: 'cached_or_light_dynamic' })
  }),
  scriptGuidance: Object.freeze({
    philosophy: 'Use flexible editorial ranges, not brittle hard word caps. The model should stay concise, specific, and human-feeling; overflow is corrected only when output is obviously rambling or off-subject.',
    midpoint_checkin: Object.freeze({ comfortRangeWords: '55-95', reviewAboveWords: 130 }),
    final_summary: Object.freeze({ comfortRangeWords: '100-165', reviewAboveWords: 220 }),
    share_cta: Object.freeze({ comfortRangeWords: '45-85', reviewAboveWords: 115 })
  })
});

export function countWords(value = '') {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

export function scriptNeedsEditorialReview(value = '', reviewAboveWords = 220) {
  return countWords(value) > reviewAboveWords;
}

export function mediaMomentGuidance(moment = '') {
  return SCOOTER_MVP_V1_MEDIA_CONTRACT.durationGuidance[moment] || null;
}
