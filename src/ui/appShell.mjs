import { LOCKED_PITCH_LAB_COPY } from '../runtime/lockedCopy.mjs';
import { DISCLOSURES } from '../runtime/disclosures.mjs';
import { FOOTER_LINKS } from '../runtime/footerLinks.mjs';
import { getScooterMomentForRoute, SCOOTER_COMPANION_STATES } from '../runtime/scooterJourneyModel.mjs';

const pageCopy = {
  '/': {
    title: LOCKED_PITCH_LAB_COPY.productName,
    eyebrow: LOCKED_PITCH_LAB_COPY.founderLine,
    body: 'A private West Peek founder room and guided AI Scooter coaching room for clarifying your founder story, practicing the pitch, and deciding whether to share a Founder Story Packet with the West Peek network.',
    action: LOCKED_PITCH_LAB_COPY.primaryCta
  },
  '/practice': {
    title: 'Practice with AI Scooter',
    eyebrow: 'Conversational coaching, structured engine.',
    body: 'Enter a minimal founder profile, optionally add deck context, then answer focused prompts in a chat-style coaching flow. Your answers stay private unless you explicitly share a Founder Story Packet.',
    action: 'Begin practice'
  },
  '/story-card': {
    title: 'Pitch Story Card',
    eyebrow: 'Text first. Video follows.',
    body: 'Turn your guided practice answers into a clear, copyable Pitch Story Card. AI Scooter media can support key moments, but the useful text artifact never waits for video.',
    action: 'Practice your pitch'
  },
  '/share': {
    title: 'Share with West Peek',
    eyebrow: 'Network review and relationship routing only.',
    body: 'Preview your Founder Story Packet and decide whether to share it with West Peek for network review. This does not guarantee funding, investment review, meetings, introductions, acceptance, or follow-up.',
    action: 'Sharing requires consent'
  },
  '/thank-you': {
    title: 'Thank you',
    eyebrow: 'Pending network review only after confirmation.',
    body: 'After confirmed share, this page explains what happened without implying investment review, funding, a meeting, an intro, or personal Scooter review.',
    action: 'Return home'
  },
  '/privacy': {
    title: 'Privacy',
    eyebrow: 'Practice first. Consent before sharing.',
    body: 'Pitch Lab collects minimal founder profile information to start practice. Founder answers, optional deck context, and optional local practice recordings have separate consent and sharing boundaries.',
    action: 'Back to Pitch Lab'
  },
  '/terms': {
    title: 'Terms',
    eyebrow: 'Founder coaching, not investment decisioning.',
    body: `${DISCLOSURES.aiScooter} ${DISCLOSURES.noGuarantee}`,
    action: 'Back to Pitch Lab'
  },
  '/ai-disclosure': {
    title: 'AI Disclosure',
    eyebrow: 'AI Scooter is AI.',
    body: 'AI Scooter is an AI pitch-practice coach. Outputs may be incomplete or inaccurate. AI Scooter is not the real Scooter, not a live human reviewer, and not West Peek investment committee.',
    action: 'Practice your pitch'
  },
  '/founder-network-notice': {
    title: 'Founder Network Notice',
    eyebrow: 'Relationship routing, not a funding application.',
    body: 'Sharing a Founder Story Packet is optional. West Peek may or may not follow up. The packet supports network review and relationship routing only; it is not an offer to invest, a solicitation, or an investment-review guarantee.',
    action: 'Practice your pitch'
  },
  '/data-consent': {
    title: 'Data & Consent',
    eyebrow: 'Separate gates. Clear control.',
    body: 'Profile capture starts/saves practice. Share consent sends the Founder Story Packet to West Peek. Optional deck files and optional practice recordings require separate consent before inclusion.',
    action: 'Practice your pitch'
  },
  '/contact': {
    title: 'Contact',
    eyebrow: 'Questions, updates, and support.',
    body: 'Contact West Peek through the current site operator channel for data questions, support, or network-intake issues. Do not submit urgent legal, financial, medical, or emergency matters through Pitch Lab.',
    action: 'Back to Pitch Lab'
  },
  '/delete-my-info': {
    title: 'Delete or update my info',
    eyebrow: 'Update and come back later.',
    body: 'Founders can update their story and return later. For deletion or correction requests, contact West Peek with the email used in Pitch Lab so the team can locate the relevant Founder Story Packet.',
    action: 'Back to Pitch Lab'
  },
  '/how-it-works': {
    title: 'How it works',
    eyebrow: LOCKED_PITCH_LAB_COPY.brandLine,
    body: 'AI Scooter guides a structured conversation. You can add deck context, build a Pitch Story Card, practice out loud locally, and choose whether to share a Founder Story Packet with West Peek for network review.',
    action: 'Practice your pitch'
  }
};

function navLink(route, label) {
  return `<a href="${route}" data-route="${route}">${label}</a>`;
}

function brandLogo() {
  return `
    <a class="brand" href="/" aria-label="West Peek Pitch Lab home">
      <img src="/assets/brand/west-peek-logo.jpg" alt="West Peek Ventures" />
      <span>Pitch Lab</span>
    </a>
  `;
}

function scooterCompanion(route) {
  const moment = getScooterMomentForRoute(route);
  const stateText = route === '/practice'
    ? SCOOTER_COMPANION_STATES.practice_listening
    : route === '/story-card'
      ? SCOOTER_COMPANION_STATES.story_reviewing
      : route === '/share'
        ? SCOOTER_COMPANION_STATES.share_decision
        : SCOOTER_COMPANION_STATES.welcome_ready;
  return `
    <aside class="scooter-companion" data-scooter-companion data-scooter-moment="${moment.label}" aria-labelledby="scooter-companion-title">
      <div class="avatar-topline"><img class="avatar-mark" src="/assets/brand/west-peek-mark.png" alt="" aria-hidden="true" /><span>AI Scooter</span></div>
      <div class="avatar-frame scooter-media-slot" aria-label="AI Scooter visual presence">
        <img class="avatar-photo" src="${moment.posterPath}" alt="AI Scooter approved visual" loading="eager" />
      </div>
      <div class="avatar-copy">
        <p class="eyebrow">${moment.label}</p>
        <h2 id="scooter-companion-title">Make the story easier to repeat. AI Scooter is your pitch-practice coach.</h2>
        <p data-scooter-companion-status>${stateText}</p>
        <p class="scooter-transcript" data-scooter-companion-script>${moment.script}</p>
        <p class="phase-note">${DISCLOSURES.firstAiScooterMessage}</p>
      </div>
    </aside>
  `;
}

function processGrid() {
  const steps = [
    ['1', 'Identify yourself lightly', 'Name, email, company, and optional website start/save the session. No account required. Share only if you choose. Answers remain private until share consent. Do not include confidential information you are not comfortable using in an AI pitch-practice tool.'],
    ['2', 'Chat with AI Scooter', 'Answer focused prompts in a conversational coaching flow that captures structured story fields behind the scenes.'],
    ['3', 'Sharpen and rehearse', 'Create a Pitch Story Card, use optional deck context, and practice out loud locally if you choose.'],
    ['4', 'Choose the relationship', 'Share a Founder Story Packet with West Peek only after consent. It is network review and relationship routing only.']
  ];
  return `<section class="process-grid" aria-label="Pitch Lab process">${steps.map(([number, title, description]) => `<article><span>${number}</span><h3>${title}</h3><p>${description}</p></article>`).join('')}</section>`;
}

function brandBand() {
  return `
    <section class="brand-band" aria-label="West Peek principles">
      <div><p class="eyebrow">West Peek principle</p><h2>${LOCKED_PITCH_LAB_COPY.brandLine}</h2></div>
      <div><p class="eyebrow">Pitch Lab principle</p><h2>${LOCKED_PITCH_LAB_COPY.founderLine}</h2></div>
    </section>
  `;
}

function practiceModule(route) {
  if (route === '/practice') {
    return `
      <section class="interactive-panel" aria-labelledby="local-practice-title">
        <h2 id="local-practice-title">AI Scooter coaching conversation</h2><p class="phase-note">Local practice flow</p>
        <div data-founder-profile-gate></div>
        <div data-deck-context-root></div>
        <div data-practice-root><p class="phase-note">Loading guided practice flow...</p></div>
      </section>
      <section class="interactive-panel" aria-labelledby="preview-title">
        <h2 id="preview-title">Live local draft preview</h2>
        <div data-story-card-preview></div>
      </section>
    `;
  }
  if (route === '/story-card') {
    return `
      <section class="interactive-panel story-card-stage" aria-labelledby="local-card-title">
        <h2 id="local-card-title">Local Pitch Story Card shell</h2>
        <div data-story-card-root><p class="phase-note">Answer the practice questions to populate the local draft card.</p></div>
      </section>
      <section class="interactive-panel story-card-stage" aria-labelledby="ai-card-title">
        <h2 id="ai-card-title">AI Pitch Story Card</h2><p class="phase-note">Story Strength Snapshot · Copy Pitch Story Card</p>
        <p class="phase-note">${DISCLOSURES.storyCard} Text appears first. AI Scooter video follows only if provider configuration is available and never blocks copy/share utility.</p>
        <div class="actions"><button type="button" class="button primary" data-generate-ai-card>Generate AI Pitch Story Card</button></div>
        <div data-ai-story-card-root></div>
      </section>
      <section class="interactive-panel practice-out-loud-panel" aria-labelledby="practice-out-loud-title">
        <h2 id="practice-out-loud-title">Practice Out Loud</h2>
        <p class="phase-note">${DISCLOSURES.cameraPractice}</p>
        <p>Want to hear how it lands? Practice your 60-second pitch on camera. This recording stays in your browser unless you choose to save or share it.</p>
        <div data-practice-out-loud-root></div>
      </section>
      <section class="interactive-panel media-identity-panel" aria-labelledby="media-moments-title">
        <h2 id="media-moments-title">AI Scooter media identity</h2>
        <p class="phase-note">Talking AI Scooter is core to the intended coaching experience at welcome, final story summary, and share/close. Text carries the detailed artifact; static/text-only mode is an honest degraded fallback if media providers are unavailable.</p>
      </section>
    `;
  }
  if (route === '/thank-you') {
    return `
      <section class="interactive-panel" aria-labelledby="thank-you-status-title">
        <h2 id="thank-you-status-title">Founder Story Packet status</h2>
        <div data-thank-you-status><p class="phase-note">A confirmed Network OS response is required before this page claims a share happened.</p></div>
      </section>
    `;
  }
  if (route === '/share') {
    return `
      <section class="interactive-panel" aria-labelledby="share-boundary-title">
        <h2 id="share-boundary-title">Founder Story Packet preview and consent</h2>
        <div data-share-boundary><p class="phase-note">Share requires explicit consent and a completed AI Pitch Story Card. What happens next: No contact is created automatically; pending intake queue becomes pending network review only after confirmation.</p></div>
      </section>
    `;
  }
  return '';
}

function disclosurePanel(route) {
  const policyRoutes = ['/terms','/privacy','/ai-disclosure','/founder-network-notice','/data-consent','/contact','/delete-my-info'];
  const extra = policyRoutes.includes(route)
    ? '<p class="phase-note">This plain-language page is part of the site disclosure register. Legal review is still recommended before production launch.</p>'
    : '<p class="phase-note">The share boundary remains: sharing requires explicit consent, Network OS confirmation, no automatic contact creation, and no unearned success state. Founders can leave with a copied card without sharing.</p>';
  return `
    <section class="disclosure-panel" aria-labelledby="disclosure-title">
      <div class="section-kicker"></div>
      <h2 id="disclosure-title">Trust boundary</h2>
      <p>${DISCLOSURES.aiScooter}</p>
      <p>${DISCLOSURES.noGuarantee}</p><p class="phase-note">Legacy trust anchor: AI Scooter does not represent an investment decision, review, funding, introductions, or a meeting. Voice, avatar, and Network OS features run only when configured and degrade honestly when unavailable.</p>
      <p>The product stays relationship-first: practice privately, sharpen what matters, then choose whether West Peek should see your Founder Story Packet for network review and relationship routing.</p>
      ${extra}
    </section>
  `;
}

export function renderPage(route) {
  const normalized = route === '' ? '/' : route;
  const page = pageCopy[normalized] ?? pageCopy['/'];
  const isHome = normalized === '/';
  const mainColumn = `
    <div class="hero-copy coaching-thread">
      <p class="eyebrow">${page.eyebrow}</p>
      <h1>${page.title}</h1>
      <div class="chat-message ai-message"><strong>AI Scooter:</strong> ${DISCLOSURES.firstAiScooterMessage}</div>
      <p class="product-mantra">${LOCKED_PITCH_LAB_COPY.founderLine}</p>
      <p class="brand-line">${LOCKED_PITCH_LAB_COPY.brandLine}</p>
      <p>${page.body}</p>
      <div class="actions">
        <a class="button primary" href="/practice">${page.action ?? LOCKED_PITCH_LAB_COPY.primaryCta}</a>
        <a class="button secondary" href="/how-it-works">${LOCKED_PITCH_LAB_COPY.secondaryCta}</a>
      </div>
    </div>`;

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
      ${navLink('/how-it-works', 'How it works')}
      ${navLink('/practice', 'Practice')}
      ${navLink('/story-card', 'Story Card')}
      ${navLink('/share', 'Share')}
      ${navLink('/privacy', 'Privacy')}
    </nav>
  </header>
  <main>
    <section class="journey-shell">
      <div class="journey-main">${mainColumn}</div>
      ${scooterCompanion(normalized)}
    </section>
    ${isHome || normalized === '/how-it-works' ? brandBand() : ''}
    ${isHome || normalized === '/how-it-works' ? processGrid() : ''}
    ${practiceModule(normalized)}
    ${disclosurePanel(normalized)}
  </main>
  <footer>
    <div class="footer-brand"><img src="/assets/brand/west-peek-mark.png" alt="" aria-hidden="true" /><p>${DISCLOSURES.footer}</p></div>
    <nav aria-label="Footer navigation">${FOOTER_LINKS.map((link) => navLink(link.route, link.label)).join('')}</nav>
  </footer>
  <script type="module" src="/assets/practice-flow.js"></script>
  <script type="module" src="/assets/ai-story-card.js"></script>
  <script type="module" src="/assets/share-flow.js"></script>
</body>
</html>`;
}
