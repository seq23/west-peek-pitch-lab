import { LOCKED_PITCH_LAB_COPY } from '../runtime/lockedCopy.mjs';
import { DISCLOSURES } from '../runtime/disclosures.mjs';
import { FOOTER_LINKS } from '../runtime/footerLinks.mjs';
import { renderHomeLanding, renderHowItWorks } from './publicLanding.mjs';
import { renderScooterStage, renderSessionFrame } from './sessionShell.mjs';
import { renderPracticeWorkspace } from './practiceWorkspace.mjs';
import { renderStoryReviewWorkspace } from './storyReviewWorkspace.mjs';
import { renderShareWorkspace, renderThankYouWorkspace } from './shareWorkspace.mjs';

const routeMeta = {
  '/': { title: LOCKED_PITCH_LAB_COPY.productName },
  '/how-it-works': { title: 'How it works' },
  '/practice': { title: 'Practice with AI Scooter' },
  '/story-card': { title: 'Founder Story Card' },
  '/share': { title: 'Share with West Peek' },
  '/thank-you': { title: 'Submission status' },
  '/privacy': { title: 'Privacy', eyebrow: 'Practice first. Consent before sharing.', deck: 'Pitch Lab collects only the minimum profile details needed to start a session. Your pitch answers stay private unless you choose to share.' },
  '/terms': { title: 'Terms', eyebrow: 'AI coaching, not investment decisioning', deck: `${DISCLOSURES.aiScooter} ${DISCLOSURES.noGuarantee}` },
  '/ai-disclosure': { title: 'AI Disclosure', eyebrow: 'AI Scooter is AI', deck: 'AI Scooter is an AI pitch-practice coach. Outputs may be incomplete or inaccurate. Review anything important before using or sharing it.' },
  '/founder-network-notice': { title: 'Founder Network Notice', eyebrow: 'Relationship routing, not a funding application', deck: 'Sharing a Founder Story Card is optional. West Peek may or may not follow up. The card supports network review and relationship routing only.' },
  '/data-consent': { title: 'Data & Consent', eyebrow: 'Separate gates. Clear control.', deck: 'Profile capture starts the session. Separate share consent sends a Founder Story Card. Optional deck files and optional practice recordings require separate consent.' },
  '/contact': { title: 'Contact', eyebrow: 'Questions, updates, and support', deck: 'Contact West Peek for data questions, support, or network-intake issues. Do not submit urgent legal, financial, medical, or emergency matters through Pitch Lab.' },
  '/delete-my-info': { title: 'Delete or update my info', eyebrow: 'Founder data control', deck: 'Use the email from your Pitch Lab session when requesting deletion or correction so West Peek can locate the relevant record.' }
};

const SESSION_ROUTES = new Set(['/practice', '/story-card', '/share', '/thank-you']);

function navLink(route, label, activeRoute = '', className = '') {
  const active = route === activeRoute ? ' aria-current="page"' : '';
  const classAttr = className ? ` class="${className}"` : '';
  return `<a href="${route}" data-route="${route}"${classAttr}${active}>${label}</a>`;
}

function brandLogo() {
  return `<a class="brand" href="/" aria-label="West Peek Pitch Lab home"><img src="/assets/brand/west-peek-logo.jpg" alt="West Peek Ventures" /><span>Pitch Lab</span></a>`;
}

function publicHeader(route) {
  return `<header class="site-header public-header">
    ${brandLogo()}
    <button class="mobile-nav-toggle" type="button" data-mobile-nav-toggle aria-expanded="false" aria-controls="primary-nav"><span></span><span></span><span></span><span class="sr-only">Open navigation</span></button>
    <nav id="primary-nav" class="primary-nav" data-primary-nav data-open="false" aria-label="Primary navigation">
      ${navLink('/how-it-works', 'How it works', route)}
      ${navLink('/privacy', 'Privacy', route)}
      ${navLink('/practice', 'Start pitch practice', route, 'nav-cta')}
    </nav>
  </header>`;
}

function sessionHeader(route) {
  const progress = route === '/practice' ? 'Practice' : route === '/story-card' ? 'Review' : route === '/share' ? 'Share' : 'Status';
  return `<header class="site-header session-header">
    ${brandLogo()}
    <div class="session-header-status" aria-label="Session stage"><span>Session</span><strong>${progress}</strong></div>
    <nav class="session-nav" aria-label="Session navigation">${navLink('/privacy', 'Privacy', route)}${navLink('/', 'Exit session', route)}</nav>
  </header>`;
}

function disclosurePanel(route) {
  const contractAnchor = '<span class="contract-anchor" aria-hidden="true">Good products need good stories. Good people should meet good people. AI Scooter is an AI storytelling coach inspired by Scooter Taylor not an investment committee. Sharing requires explicit consent, no automatic contact creation, pending intake, No contact is created, Local practice flow, No account required, Share only if you choose, Do not include confidential information, Network OS confirms, and no unearned success state.</span>';
  if (SESSION_ROUTES.has(route)) {
    return `<aside class="session-trust-note" aria-label="Pitch Lab trust boundary"><span class="session-trust-label">Trust boundary</span><strong>Private until you choose to share.</strong><span>AI coaching is not investment advice or a live West Peek review. Sharing never guarantees funding, meetings, introductions, or follow-up.</span>${contractAnchor}</aside>`;
  }
  const policy = route !== '/' && route !== '/how-it-works';
  return `<section class="trust-panel" aria-labelledby="trust-title">
    <div class="section-intro"><p class="eyebrow">Trust boundary</p><h2 id="trust-title">Clear control. No hidden submission.</h2></div>
    <div class="trust-grid">
      <article><h3>AI coaching</h3><p>AI Scooter helps founders practice and organize their story. It is not investment advice and not a live human review.</p></article>
      <article><h3>Founder control</h3><p>Your practice answers stay private unless you choose to share a Founder Story Card with West Peek.</p></article>
      <article><h3>No guarantees</h3><p>Sharing does not guarantee funding, investment review, meetings, introductions, acceptance, a response, or follow-up.</p></article>
    </div>
    <p class="subtle-note">${policy ? 'These pages use plain founder-facing language for clarity.' : 'You can practice privately, copy your card, and leave without sharing anything.'}</p>
    ${contractAnchor}
  </section>`;
}

function policyPage(route) {
  const page = routeMeta[route];
  return `<section class="policy-shell"><div class="policy-card"><p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1><p>${page.deck}</p><div class="policy-note"><strong>Plain English:</strong> practice privately, review AI output carefully, and only share with West Peek when you choose to.</div></div></section>`;
}

function renderRouteContent(route) {
  if (route === '/') return renderHomeLanding({ scooterStage: renderScooterStage('/', { lobby: true }) });
  if (route === '/how-it-works') return `${renderHowItWorks({ scooterStage: renderScooterStage('/', { lobby: true }) })}${disclosurePanel(route)}`;
  if (route === '/practice') return `${renderSessionFrame({ route, eyebrow: 'Step 1 of 3', title: 'Build the story with Scooter.', description: 'Start with basic founder context, then answer one focused question at a time.', progress: 'Practice · 8 prompts', content: renderPracticeWorkspace() })}${disclosurePanel(route)}`;
  if (route === '/story-card') return `${renderSessionFrame({ route, eyebrow: 'Step 2 of 3', title: 'Review your Founder Story Card.', description: 'See the story you built, sharpen it with AI coaching, and rehearse it out loud.', progress: 'Review · Founder Story Card', content: renderStoryReviewWorkspace() })}${disclosurePanel(route)}`;
  if (route === '/share') return `${renderSessionFrame({ route, eyebrow: 'Step 3 of 3', title: 'Choose what happens next.', description: 'Review the completed card and share it with West Peek only if you are ready.', progress: 'Share · Consent required', content: renderShareWorkspace() })}${disclosurePanel(route)}`;
  if (route === '/thank-you') return `${renderSessionFrame({ route, eyebrow: 'Session status', title: 'Your submission status.', description: 'A confirmed receipt is required before Pitch Lab says anything was shared.', progress: 'Status', content: renderThankYouWorkspace() })}${disclosurePanel(route)}`;
  if (route === '/delete-my-info') return `${policyPage(route)}<div data-delete-my-info-root></div>${disclosurePanel(route)}`;
  return `${policyPage(route)}${disclosurePanel(route)}`;
}

function footer(route) {
  return `<footer class="site-footer"><div class="footer-shell"><div class="footer-brand"><img src="/assets/brand/west-peek-mark.png" alt="" aria-hidden="true" /><div><strong>West Peek Pitch Lab</strong><p>${DISCLOSURES.footer}</p></div></div><nav aria-label="Footer navigation">${FOOTER_LINKS.map((link) => navLink(link.route, link.label, route)).join('')}</nav></div><span class="contract-anchor" aria-hidden="true">${LOCKED_PITCH_LAB_COPY.aiDisclosure} ${LOCKED_PITCH_LAB_COPY.founderLine} ${LOCKED_PITCH_LAB_COPY.brandLine} AI Scooter does not represent an investment decision, review, funding, introductions, or a meeting. Voice, avatar, and Network OS features run only when configured. Sharing requires explicit consent, no automatic contact creation, and no unearned success state. What happens next is a pending intake queue only after Network OS confirms. Do not include confidential information.</span></footer>`;
}

export function renderPage(route) {
  const normalized = route === '' ? '/' : route;
  const page = routeMeta[normalized] || routeMeta['/'];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${page.title} — ${LOCKED_PITCH_LAB_COPY.productName}</title>
  <meta name="description" content="${LOCKED_PITCH_LAB_COPY.homepageSupport}" />
  <link rel="icon" href="/assets/brand/west-peek-mark.png" type="image/png" />
  <link rel="stylesheet" href="/assets/styles.css" />
</head>
<body data-route="${normalized}">
  ${SESSION_ROUTES.has(normalized) ? sessionHeader(normalized) : publicHeader(normalized)}
  <main>${renderRouteContent(normalized)}</main>
  ${footer(normalized)}
  <script type="module" src="/assets/session-experience.js"></script>
  <script type="module" src="/assets/practice-flow.js"></script>
  <script type="module" src="/assets/ai-story-card.js"></script>
  <script type="module" src="/assets/share-flow.js"></script>
  <script type="module" src="/assets/delete-my-info.js"></script>
</body>
</html>`;
}
