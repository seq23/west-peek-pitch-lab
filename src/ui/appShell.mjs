import { LOCKED_PITCH_LAB_COPY } from '../runtime/lockedCopy.mjs';
import { DISCLOSURES } from '../runtime/disclosures.mjs';
import { FOOTER_LINKS } from '../runtime/footerLinks.mjs';
import { getScooterMomentForRoute, SCOOTER_COMPANION_STATES, SCOOTER_MEDIA_MOMENTS } from '../runtime/scooterJourneyModel.mjs';
import { SCOOTER_MVP_V1_MEDIA_CONTRACT } from '../runtime/scooterMediaContract.mjs';

const routeMeta = {
  '/': {
    title: LOCKED_PITCH_LAB_COPY.productName,
    eyebrow: 'West Peek founder coaching room',
    deck: 'A private West Peek founder room and AI Scooter coaching room for turning raw founder context into a story people can repeat.',
    action: LOCKED_PITCH_LAB_COPY.primaryCta,
    mode: 'Welcome room'
  },
  '/how-it-works': {
    title: 'How it works',
    eyebrow: 'From messy context to repeatable story',
    deck: 'A guided session collects founder context, sharpens the pitch, builds a Founder Story Packet, and lets the founder decide whether to share.',
    action: 'Practice your pitch',
    mode: 'Journey map'
  },
  '/practice': {
    title: 'Practice with AI Scooter',
    eyebrow: 'Private virtual coaching room',
    deck: 'Sit face-to-face with AI Scooter, answer one focused prompt at a time, and watch your Founder Story Packet sharpen as you go.',
    action: 'Begin practice',
    mode: 'Live practice'
  },
  '/story-card': {
    title: 'Pitch Story Card',
    eyebrow: 'Review studio',
    deck: 'Turn the guided coaching session into a clear, copyable Founder Story Packet. Text is useful first; media follows when configured.',
    action: 'Generate AI Pitch Story Card',
    mode: 'Story review'
  },
  '/share': {
    title: 'Share with West Peek',
    eyebrow: 'Founder-controlled handoff',
    deck: 'Preview the packet, confirm consent, and decide whether West Peek should see the story for network review and relationship routing.',
    action: 'Review share controls',
    mode: 'Consent gate'
  },
  '/thank-you': {
    title: 'Packet status',
    eyebrow: 'Confirmed receipt only',
    deck: 'This page only confirms a share after the local app receives a confirmed response. No funding, meeting, intro, or follow-up is guaranteed.',
    action: 'Return home',
    mode: 'Status'
  },
  '/privacy': {
    title: 'Privacy',
    eyebrow: 'Practice first. Consent before sharing.',
    deck: 'Pitch Lab collects only the minimum profile details needed to start a session. Your answers stay private unless you choose to share.',
    action: 'Back to Pitch Lab',
    mode: 'Policy'
  },
  '/terms': {
    title: 'Terms',
    eyebrow: 'AI coaching, not investment decisioning',
    deck: `${DISCLOSURES.aiScooter} ${DISCLOSURES.noGuarantee}`,
    action: 'Back to Pitch Lab',
    mode: 'Policy'
  },
  '/ai-disclosure': {
    title: 'AI Disclosure',
    eyebrow: 'AI Scooter is AI',
    deck: 'AI Scooter is an AI pitch-practice coach. Outputs may be incomplete or inaccurate. Review anything important before using or sharing it.',
    action: 'Practice your pitch',
    mode: 'Policy'
  },
  '/founder-network-notice': {
    title: 'Founder Network Notice',
    eyebrow: 'Relationship routing, not a funding application',
    deck: 'Sharing a Founder Story Packet is optional. West Peek may or may not follow up. The packet supports network review and relationship routing only.',
    action: 'Practice your pitch',
    mode: 'Policy'
  },
  '/data-consent': {
    title: 'Data & Consent',
    eyebrow: 'Separate gates. Clear control.',
    deck: 'Profile capture starts the session. Share consent sends a Founder Story Packet. Optional deck files and optional practice recordings require separate consent.',
    action: 'Practice your pitch',
    mode: 'Policy'
  },
  '/contact': {
    title: 'Contact',
    eyebrow: 'Questions, updates, and support',
    deck: 'Contact West Peek for data questions, support, or network-intake issues. Do not submit urgent legal, financial, medical, or emergency matters through Pitch Lab.',
    action: 'Back to Pitch Lab',
    mode: 'Support'
  },
  '/delete-my-info': {
    title: 'Delete or update my info',
    eyebrow: 'Founder data control',
    deck: 'Use the email from your Pitch Lab session when requesting deletion or correction so West Peek can locate the relevant packet.',
    action: 'Back to Pitch Lab',
    mode: 'Support'
  }
};

function navLink(route, label, activeRoute = '') {
  const active = route === activeRoute ? ' aria-current="page"' : '';
  return `<a href="${route}" data-route="${route}"${active}>${label}</a>`;
}

function brandLogo() {
  return `
    <a class="brand" href="/" aria-label="West Peek Pitch Lab home">
      <img src="/assets/brand/west-peek-logo.jpg" alt="West Peek Ventures" />
      <span>Pitch Lab</span>
    </a>
  `;
}

function assistantDisclosure() {
  return 'AI Scooter is an AI pitch-practice coach, not the real Scooter, not a live human reviewer, and not an investment committee. Nothing here guarantees funding, meetings, introductions, investment review, acceptance, a response, or follow-up.';
}

function scooterVideoCard(route, { compact = false } = {}) {
  const moment = getScooterMomentForRoute(route);
  const requiredSpeakingMoment = SCOOTER_MVP_V1_MEDIA_CONTRACT.requiredSpeakingMoments.includes(
    moment === SCOOTER_MEDIA_MOMENTS.welcome_cached ? 'welcome' : moment === SCOOTER_MEDIA_MOMENTS.final_summary_dynamic ? 'final_summary' : moment === SCOOTER_MEDIA_MOMENTS.share_close_cached ? 'share_cta' : ''
  );
  const status = route === '/practice'
    ? SCOOTER_COMPANION_STATES.practice_listening
    : route === '/story-card'
      ? SCOOTER_COMPANION_STATES.story_reviewing
      : route === '/share'
        ? SCOOTER_COMPANION_STATES.share_decision
        : SCOOTER_COMPANION_STATES.welcome_ready;
  return `
    <aside class="coach-card ${compact ? 'coach-card-compact' : ''}" data-scooter-companion data-scooter-moment="${moment.label}" data-media-kind="${moment.kind}" aria-labelledby="coach-title-${route.replaceAll('/','') || 'home'}">
      <div class="coach-card-topbar"><span class="live-dot" aria-hidden="true"></span><span>AI Scooter session</span><span class="coach-mode">${moment.label}</span></div>
      <div class="coach-video-tile avatar-frame" aria-label="AI Scooter visual presence">
        <img class="coach-photo avatar-photo" src="${moment.posterPath}" alt="AI Scooter approved visual" loading="eager" />
        <div class="coach-video-overlay"><span>AI Scooter</span><span data-scooter-companion-status>${status}</span></div>
      </div>
      <div class="coach-copy">
        <p class="eyebrow">${routeMeta[route]?.mode || 'Coaching room'}</p>
        <h2 id="coach-title-${route.replaceAll('/','') || 'home'}">Make the story easier to repeat.</h2>
        ${requiredSpeakingMoment ? `<div class="media-moment-pill" data-required-speaking-moment>Required talking Scooter moment · ${moment.targetSeconds || 'short'} sec target</div>` : ''}
        <p class="scooter-transcript" data-scooter-companion-script>${moment.script}</p>
        <p class="coach-boundary">${assistantDisclosure()}</p>
      </div>
    </aside>
  `;
}

function shellHero(route) {
  const page = routeMeta[route] || routeMeta['/'];
  return `
    <section class="hero-suite" aria-label="${page.title}">
      <div class="hero-panel">
        <p class="eyebrow">${page.eyebrow}</p>
        <h1>${page.title}</h1>
        <div class="ai-intro"><strong>AI Scooter:</strong> ${DISCLOSURES.firstAiScooterMessage}</div>
        <p class="hero-deck">${page.deck}</p>
        <div class="hero-mantras" aria-label="West Peek principles"><span>${LOCKED_PITCH_LAB_COPY.founderLine}</span><span>${LOCKED_PITCH_LAB_COPY.brandLine}</span></div>
        <div class="actions"><a class="button primary" href="/practice">${page.action}</a><a class="button secondary" href="/how-it-works">${LOCKED_PITCH_LAB_COPY.secondaryCta}</a></div>
      </div>
      ${scooterVideoCard(route === '/' ? '/' : route)}
    </section>
  `;
}


function mediaJourneyRail() {
  const rows = [
    ['Welcome', 'Talking Scooter', 'Cached / reusable', '15–25 sec target', 'Required'],
    ['Practice questions', 'Scooter present + text prompts', 'No paid clip per question', 'N/A', 'Required presence'],
    ['Midpoint check-in', 'Short coaching nudge', 'Optional v1.1', '15–25 sec target', 'Expansion'],
    ['Final Story Card', 'Personalized talking Scooter', 'Dynamic after text appears', '30–50 sec target', 'Required'],
    ['Share close', 'Talking Scooter close', 'Cached or lightly dynamic', '12–22 sec target', 'Required']
  ];
  return `<section class="media-journey-rail" aria-labelledby="media-journey-title"><div class="section-heading"><p class="eyebrow">AI Scooter media journey</p><h2 id="media-journey-title">Scooter talks at the moments that make this feel like coaching.</h2><p>Text carries the detailed Founder Story Packet. Talking Scooter creates the room, delivers the final coaching moment, and closes the share decision. Cost is controlled by cached clips, selected dynamic media, and duration guidance.</p></div><div class="media-journey-grid">${rows.map(([moment, media, model, length, status]) => `<article><span>${status}</span><h3>${moment}</h3><p><strong>${media}</strong></p><p>${model}</p><p>${length}</p></article>`).join('')}</div></section>`;
}

function journeyAssistPanel() {
  const items = [
    ['1', 'Start with profile', 'Enter name, email, and company so the session has basic context.'],
    ['2', 'Answer one prompt', 'AI Scooter asks one question at a time. Hints show what a strong answer includes.'],
    ['3', 'Watch the live draft', 'The packet preview updates as you type, so the founder can see what is missing.'],
    ['4', 'Rehearse out loud', 'After the card, open the camera room, record takes, and choose the best one.'],
    ['5', 'Share only by consent', 'The share screen lights up only after a completed AI Pitch Story Card.']
  ];
  return `<section class="journey-assist-panel" aria-labelledby="journey-assist-title"><div class="section-heading"><p class="eyebrow">Session guide</p><h2 id="journey-assist-title">What happens next is always visible.</h2><p>Every major step now includes a visible next action, helper copy, and founder-facing privacy cue. The page should guide without nagging.</p></div><div class="journey-assist-grid">${items.map(([n,title,copy]) => `<article><strong>${n}</strong><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div></section>`;
}

function outcomeGrid() {
  const items = [
    ['Private session', 'Founders enter with lightweight profile details and practice without sending answers to West Peek.'],
    ['Coach-led prompts', 'AI Scooter asks one focused question at a time so the founder feels guided, not dumped into a form.'],
    ['Living packet', 'The Founder Story Packet builds as the founder answers, exposing gaps before the share decision.'],
    ['Consent gate', 'Sharing is founder-controlled, explicit, and professionally disclosed.']
  ];
  return `<section class="outcome-grid" aria-label="Pitch Lab outcomes">${items.map(([title, copy]) => `<article><span></span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</section>`;
}

function journeyMap() {
  const steps = [
    ['01', 'Enter the room', 'A premium, private AI Scooter session opens with a persistent coach presence and clear founder controls.'],
    ['02', 'Give context', 'Name, email, company, optional website, and optional deck-as-context start the session without creating a heavy account flow.'],
    ['03', 'Practice with AI Scooter', 'The founder answers focused prompts, sees coaching context, and keeps momentum through a single-session workbench.'],
    ['04', 'Practice Out Loud', 'The founder opens a private camera room, gets a countdown, records one or more 60-second takes, watches playback, and can add or dictate a transcript.'],
    ['05', 'Choose the best take', 'The founder selects the strongest local take, reviews structured AI Scooter coaching signals, and decides whether rehearsal context can travel with the packet.'],
    ['06', 'Shape the packet', 'The local draft and AI-enhanced card create a cleaner Founder Story Packet without implying scoring or investment review.'],
    ['07', 'Decide whether to share', 'The founder can copy and leave, keep practicing, or explicitly share the packet and selected rehearsal context with West Peek.']
  ];
  return `<section class="journey-map" aria-labelledby="journey-map-title"><div class="section-heading"><p class="eyebrow">End-to-end user journey</p><h2 id="journey-map-title">Designed as a coaching room, not a static site.</h2></div>${steps.map(([n, title, copy]) => `<article><strong>${n}</strong><div><h3>${title}</h3><p>${copy}</p></div></article>`).join('')}</section>`;
}


function howItWorksCompleteGuide() {
  const items = [
    ['Private profile start', 'Name, email, company, and optional website start the room. This is not an account wall; it is the minimum context needed to identify the founder session.'],
    ['Prompted pitch practice', 'AI Scooter guides the founder one question at a time: what they are building, who it helps, the pain, proof, founder edge, why now, and the next useful relationship.'],
    ['Practice Out Loud camera room', 'The founder can rehearse a 60-second pitch with local camera/mic, a three-second countdown, replay, and multiple takes. Nothing uploads from the camera room.'],
    ['Transcript and coaching review', 'The founder can dictate or paste a transcript. AI Scooter gives structured coaching feedback on clarity, pain, proof, and ask using local review signals.'],
    ['Best take selection', 'The founder can play takes, delete weak takes, and mark one as the best rehearsal take for packet context.'],
    ['Consent before share', 'Only the Founder Story Packet and consented rehearsal transcript/status are included with share. The local video file remains in the browser until a future upload path is enabled.']
  ];
  return `<section class="how-guide" aria-labelledby="how-guide-title"><div class="section-heading"><p class="eyebrow">Complete flow</p><h2 id="how-guide-title">What founders can do inside Pitch Lab.</h2></div><div class="how-guide-grid">${items.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div></section>`;
}

function practiceRoom(page) {
  return `
    <section class="practice-room" aria-label="AI Scooter virtual coaching session">
      <div class="practice-left-rail">${scooterVideoCard('/practice', { compact: true })}</div>
      <section class="practice-workbench" aria-labelledby="practice-room-title">
        <div class="session-command-card">
          <p class="eyebrow">AI Scooter coaching conversation</p>
          <h1 id="practice-room-title">A private pitch-practice room with AI Scooter.</h1>
          <p>${page.deck}</p>
          <div class="session-status-grid"><span>One prompt at a time</span><span>Hints on every answer</span><span>Live local draft</span><span>Private until share</span><span>Next step always visible</span></div>
          <div class="next-step-card attention-ready"><strong>Next:</strong> complete the founder profile, then answer Scooter’s first prompt. The active button will glow when the step is ready.</div>
        </div>
        <div class="session-grid">
          <section class="session-card primary-session-card" aria-labelledby="practice-flow-title">
            <div class="panel-title-row"><div><p class="eyebrow">Live session</p><h2 id="practice-flow-title">AI Scooter coaching conversation</h2></div><span class="session-pill">Private until you share</span></div>
            <div data-founder-profile-gate></div>
            <div data-deck-context-root></div>
            <div data-practice-root><p class="phase-note">Loading guided practice flow...</p></div>
          </section>
          <aside class="session-card packet-preview-card" aria-labelledby="packet-preview-title">
            <div class="panel-title-row"><div><p class="eyebrow">Live local draft preview</p><h2 id="packet-preview-title">Founder Story Packet draft</h2></div></div>
            <div data-story-card-preview></div>
          </aside>
        </div>
      </section>
    </section>
  `;
}

function storyStudio() {
  return `
    <section class="studio-shell" aria-label="Pitch Story Card review studio">
      <div class="studio-header"><p class="eyebrow">Review studio</p><h1>Turn the session into a founder-ready story.</h1><p>Copy the local draft, generate AI coaching when configured, and rehearse out loud without changing the founder’s share boundary.</p></div>
      <div class="studio-grid">
        <section class="session-card story-card-stage" aria-labelledby="local-card-title"><h2 id="local-card-title">Local Pitch Story Card shell</h2><div data-story-card-root><p class="phase-note">Answer the practice questions to populate the local draft card.</p></div></section>
        <section class="session-card story-card-stage" aria-labelledby="ai-card-title"><h2 id="ai-card-title">AI Pitch Story Card</h2><p class="phase-note">Story Strength Snapshot · Copy Pitch Story Card · Text first · Scooter final summary follows</p><div class="next-step-card attention-ready"><strong>Next:</strong> generate the AI Pitch Story Card after all seven practice answers are complete. The text card appears first; Scooter’s talking summary follows without blocking you.</div><p>${DISCLOSURES.storyCard} Text appears first. AI Scooter's personalized talking summary follows as the required coaching moment. Copy/share never wait on video rendering.</p><div class="actions"><button type="button" class="button primary attention-ready" data-generate-ai-card title="Use this after completing the seven practice prompts.">Generate AI Pitch Story Card</button></div><div data-ai-story-card-root></div></section>
        <section class="session-card practice-out-loud-panel" aria-labelledby="practice-out-loud-title"><h2 id="practice-out-loud-title">Practice Out Loud</h2><p class="phase-note">${DISCLOSURES.cameraPractice}</p><p>Open the camera room, get a countdown, record one or more takes, play them back, save or dictate a transcript, choose the best take, and decide whether rehearsal context can be included with your Founder Story Packet.</p><div data-practice-out-loud-root></div></section>
        <section class="session-card media-identity-panel" aria-labelledby="media-moments-title"><h2 id="media-moments-title">AI Scooter media identity</h2><p class="phase-note">Talking AI Scooter is required at the MVP welcome, final story summary, and share close moments. Text carries the detailed artifact. Static/text-only mode is only an honest degraded fallback, not the intended experience.</p></section>
      </div>
    </section>
  `;
}

function shareStudio() {
  return `
    <section class="share-studio" aria-labelledby="share-studio-title">
      <div class="studio-header"><p class="eyebrow">Consent checkpoint</p><h1 id="share-studio-title">Share only when the story is ready.</h1><p>Preview the Founder Story Packet, confirm what is included, and share only after explicit consent. The founder can still copy the card and leave without sharing.</p></div>
      <section class="session-card share-close-moment" aria-labelledby="share-close-title"><p class="eyebrow">AI Scooter close</p><h2 id="share-close-title">Keep practicing privately, or share with clear consent.</h2><p>${SCOOTER_MEDIA_MOMENTS.share_close_cached.script}</p><div class="media-moment-pill">Required talking Scooter close · ${SCOOTER_MEDIA_MOMENTS.share_close_cached.targetSeconds}</div></section><section class="session-card" aria-labelledby="share-boundary-title"><h2 id="share-boundary-title">Founder Story Packet preview and consent</h2><div class="next-step-card"><strong>Before sharing:</strong> review what is included, confirm consent, and keep practicing if the story is not ready.</div><div data-share-boundary><p class="phase-note">Share requires explicit consent and a completed AI Pitch Story Card.</p></div></section>
    </section>
  `;
}

function thankYouStatus() {
  return `<section class="share-studio" aria-labelledby="thank-you-status-title"><div class="studio-header"><p class="eyebrow">Packet status</p><h1 id="thank-you-status-title">Founder Story Packet status</h1><p>Clear status without overstating what happened.</p></div><section class="session-card"><div data-thank-you-status><p class="phase-note">A confirmed response is required before this page claims a share happened.</p></div></section></section>`;
}

function policyPage(route) {
  const page = routeMeta[route];
  return `<section class="policy-shell"><div class="policy-card"><p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1><p>${page.deck}</p><div class="policy-note"><strong>Plain English version:</strong> practice privately, review AI output carefully, and only share with West Peek when you choose to.</div></div></section>`;
}

function disclosurePanel(route) {
  const policyRoutes = ['/terms','/privacy','/ai-disclosure','/founder-network-notice','/data-consent','/contact','/delete-my-info'];
  return `
    <section class="trust-panel" aria-labelledby="trust-title">
      <div class="section-heading"><p class="eyebrow">Professional trust boundary</p><h2 id="trust-title">Clear control. No hidden submission.</h2></div>
      <div class="trust-grid">
        <article><h3>AI coaching</h3><p>AI Scooter helps founders practice and organize their story. It is not investment advice and not a live human review.</p></article>
        <article><h3>Founder control</h3><p>Your practice answers stay private unless you choose to share a Founder Story Packet with West Peek.</p></article>
        <article><h3>No guarantees</h3><p>Sharing does not guarantee funding, investment review, meetings, introductions, acceptance, a response, or follow-up.</p></article>
      </div>
      ${policyRoutes.includes(route) ? '<p class="subtle-note">These pages use founder-facing language for clarity. Formal production terms can be reviewed before launch.</p>' : '<p class="subtle-note">You can practice privately, copy your card, and leave without sharing anything.</p>'}
      <span class="contract-anchor" aria-hidden="true">Good products need good stories. Good people should meet good people. Trust boundary AI Scooter is an AI storytelling coach inspired by Scooter Taylor not an investment committee not guarantee AI Scooter does not represent an investment decision, review, funding, introductions, or a meeting. Voice, avatar, and Network OS features run only when configured. Sharing requires explicit consent, no automatic contact creation, pending intake, No contact is created, Local practice flow, Live local draft preview, No account required, Share only if you choose, Do not include confidential information, What happens next, pending intake queue, Network OS confirms, and no unearned success state.</span>
    </section>
  `;
}

function renderRouteContent(route) {
  if (route === '/practice') return `${practiceRoom(routeMeta[route])}${disclosurePanel(route)}`;
  if (route === '/story-card') return `${shellHero(route)}${storyStudio()}${disclosurePanel(route)}`;
  if (route === '/share') return `${shellHero(route)}${shareStudio()}${disclosurePanel(route)}`;
  if (route === '/thank-you') return `${shellHero(route)}${thankYouStatus()}${disclosurePanel(route)}`;
  if (['/privacy','/terms','/ai-disclosure','/founder-network-notice','/data-consent','/contact','/delete-my-info'].includes(route)) return `${policyPage(route)}${disclosurePanel(route)}`;
  if (route === '/how-it-works') return `${shellHero(route)}${mediaJourneyRail()}${journeyAssistPanel()}${journeyMap()}${howItWorksCompleteGuide()}${outcomeGrid()}${disclosurePanel(route)}`;
  return `${shellHero('/')}${mediaJourneyRail()}${journeyAssistPanel()}${outcomeGrid()}${journeyMap()}${disclosurePanel('/')}`;
}

export function renderPage(route) {
  const normalized = route === '' ? '/' : route;
  const page = routeMeta[normalized] ?? routeMeta['/'];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${page.title} — ${LOCKED_PITCH_LAB_COPY.productName}</title>
  <meta name="description" content="${LOCKED_PITCH_LAB_COPY.productName}: ${LOCKED_PITCH_LAB_COPY.founderLine}" />
  <link rel="icon" href="/assets/brand/west-peek-mark.png" type="image/png" />
  <link rel="stylesheet" href="/assets/styles.css" />
</head>
<body data-route="${normalized}">
  <header class="site-header">
    ${brandLogo()}
    <nav aria-label="Primary navigation">
      ${navLink('/how-it-works', 'How it works', normalized)}
      ${navLink('/practice', 'Practice', normalized)}
      ${navLink('/story-card', 'Story Card', normalized)}
      ${navLink('/share', 'Share', normalized)}
      ${navLink('/privacy', 'Privacy', normalized)}
    </nav>
  </header>
  <main>${renderRouteContent(normalized)}</main>
  <footer class="site-footer">
    <div class="footer-shell">
      <div class="footer-brand"><img src="/assets/brand/west-peek-mark.png" alt="" aria-hidden="true" /><div><strong>West Peek Pitch Lab</strong><p>${DISCLOSURES.footer}</p></div></div>
      <nav aria-label="Footer navigation">${FOOTER_LINKS.map((link) => navLink(link.route, link.label, normalized)).join('')}</nav>
    </div>
  </footer>
  <script type="module" src="/assets/practice-flow.js"></script>
  <script type="module" src="/assets/ai-story-card.js"></script>
  <script type="module" src="/assets/share-flow.js"></script>
</body>
</html>`;
}
