import { getScooterMomentForRoute, SCOOTER_COMPANION_STATES, SCOOTER_MEDIA_MOMENTS } from '../runtime/scooterJourneyModel.mjs';

const ROUTE_STATUS = {
  '/': SCOOTER_COMPANION_STATES.welcome_ready,
  '/practice': SCOOTER_COMPANION_STATES.profile_gate_ready,
  '/story-card': SCOOTER_COMPANION_STATES.story_reviewing,
  '/share': SCOOTER_COMPANION_STATES.share_decision,
  '/thank-you': SCOOTER_COMPANION_STATES.update_later
};

function escapeAttribute(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function renderScooterStage(route, { lobby = false } = {}) {
  const moment = getScooterMomentForRoute(route);
  const status = ROUTE_STATUS[route] || SCOOTER_COMPANION_STATES.welcome_ready;
  const titleId = `scooter-stage-title-${route.replaceAll('/', '') || 'home'}`;
  const requiredSpeakingMoment = [SCOOTER_MEDIA_MOMENTS.welcome_cached.label, SCOOTER_MEDIA_MOMENTS.final_summary_dynamic.label, SCOOTER_MEDIA_MOMENTS.share_close_cached.label].includes(moment.label);
  return `
    <section class="scooter-stage avatar-card ${lobby ? 'scooter-stage-lobby' : 'scooter-stage-session'}" data-scooter-stage data-scooter-companion data-scooter-moment="${escapeAttribute(moment.label)}" data-media-kind="${escapeAttribute(moment.kind)}" aria-labelledby="${titleId}">
      <div class="scooter-stage-visual">
        <img class="scooter-stage-photo avatar-photo" src="${moment.posterPath}" alt="AI Scooter" loading="eager" />
        <div class="scooter-stage-presence">
          <span class="presence-dot" aria-hidden="true"></span>
          <span>AI Scooter</span>
          <span class="presence-state" data-scooter-companion-status>${status}</span>
        </div>
      </div>
      <div class="scooter-stage-content">
        <div class="scooter-stage-kicker"><span>Private coaching room</span><span>${escapeAttribute(moment.label)}</span></div>
        <h2 id="${titleId}">Make the story easier to repeat.</h2>
        <p class="scooter-transcript" data-scooter-companion-script>${moment.script}</p>
        <p class="scooter-boundary">AI Scooter is an AI pitch-practice coach—not a live human reviewer or investment committee.</p>
        ${requiredSpeakingMoment ? '<span class="contract-anchor" data-required-speaking-moment>Required talking Scooter moment</span>' : ''}
        ${lobby ? '' : '<button class="stage-toggle" type="button" data-scooter-stage-toggle aria-expanded="true">Minimize Scooter</button>'}
      </div>
    </section>`;
}

export function renderSessionFrame({ route, eyebrow, title, description, progress, content }) {
  return `
    <section class="session-shell" data-session-shell data-session-route="${route}">
      ${renderScooterStage(route)}
      <div class="session-context-bar" aria-label="Session context">
        <div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1></div>
        <div class="session-context-meta"><span>${progress}</span><span>Private until you choose to share</span></div>
        <p>${description}</p>
      </div>
      ${content}
    </section>`;
}
