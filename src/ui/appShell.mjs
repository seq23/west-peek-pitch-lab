import { LOCKED_PITCH_LAB_COPY } from '../runtime/lockedCopy.mjs';
import { DISCLOSURES } from '../runtime/disclosures.mjs';

const pageCopy = {
  '/': {
    title: LOCKED_PITCH_LAB_COPY.productName,
    eyebrow: LOCKED_PITCH_LAB_COPY.founderLine,
    body:
      'A private West Peek founder room for making your product story easier to understand, repeat, and share only when you choose.',
    action: LOCKED_PITCH_LAB_COPY.primaryCta
  },
  '/practice': {
    title: 'Practice your pitch',
    eyebrow: LOCKED_PITCH_LAB_COPY.founderLine,
    body:
      'Answer seven plain-English prompts. Your draft starts locally in this browser. Do not include confidential information you are not comfortable sharing with an AI tool.',
    action: 'Start local practice'
  },
  '/story-card': {
    title: 'Pitch Story Card',
    eyebrow: 'Turn raw answers into a story people can repeat.',
    body:
      'Review your local draft, generate the AI Pitch Story Card when providers are configured, use the Story Strength Snapshot to improve it, and copy the card with the Copy Pitch Story Card control without needing email.',
    action: 'Practice your pitch'
  },
  '/share': {
    title: 'Share with West Peek',
    eyebrow: 'Good people should meet good people.',
    body:
      'Share your AI Pitch Story Card only after explicit consent. A confirmed submission creates a pending intake for human review only; it does not guarantee funding and does not create a contact, meeting, intro, or Scooter review.',
    action: 'Sharing requires consent'
  },
  '/thank-you': {
    title: 'Thank you',
    eyebrow: 'Pending intake only after confirmation.',
    body:
      'After a confirmed share, this page explains what happened next without implying funding, a meeting, an intro, or personal Scooter review.',
    action: 'Return home'
  },
  '/privacy': {
    title: 'Privacy and consent',
    eyebrow: 'Practice first. Consent before sharing.',
    body: `${DISCLOSURES.privacy} ${DISCLOSURES.consent}`,
    action: 'Back to Pitch Lab'
  },
  '/terms': {
    title: 'Terms and boundaries',
    eyebrow: 'Founder coaching, not investment decisioning.',
    body: `${DISCLOSURES.aiScooter} ${DISCLOSURES.noGuarantee}`,
    action: 'Back to Pitch Lab'
  },
  '/how-it-works': {
    title: 'How it works',
    eyebrow: LOCKED_PITCH_LAB_COPY.brandLine,
    body:
      'Practice privately, sharpen the story, copy the Pitch Story Card, and share with West Peek only when you choose. No account required. Share only if you choose.',
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

function avatarCard() {
  return `
    <section class="avatar-card" aria-labelledby="avatar-title">
      <div class="avatar-topline">
        <img class="avatar-mark" src="/assets/brand/west-peek-mark.png" alt="" aria-hidden="true" />
        <span>${LOCKED_PITCH_LAB_COPY.featureName}</span>
      </div>
      <div class="avatar-frame" aria-hidden="true">
        <div class="avatar-initials">ST</div>
      </div>
      <div class="avatar-copy">
        <p class="eyebrow">AI Scooter</p>
        <h2 id="avatar-title">Make the story easier to repeat.</h2>
        <p>${DISCLOSURES.aiScooter}</p>
        <p class="phase-note">Practice privately first. Share only when the story is ready enough for a human review queue.</p>
      </div>
    </section>
  `;
}

function processGrid() {
  const steps = [
    ['1', 'Practice privately', 'Answer seven founder prompts. No account required. Share only if you choose.'],
    ['2', 'Shape the story', 'The app turns raw answers into a Pitch Story Card with clear sections and qualitative Story Strength Signals.'],
    ['3', 'Improve the weak spots', 'Guidance focuses on clarity, urgency, proof, founder edge, next relationships, and memorability.'],
    ['4', 'Choose the relationship', 'Share with West Peek only after consent. The handoff is pending human review, not an automatic contact or funding decision.']
  ];
  return `<section class="process-grid" aria-label="Pitch Lab process">${steps
    .map(([number, title, description]) => `<article><span>${number}</span><h3>${title}</h3><p>${description}</p></article>`)
    .join('')}</section>`;
}

function brandBand() {
  return `
    <section class="brand-band" aria-label="West Peek principles">
      <div>
        <p class="eyebrow">West Peek principle</p>
        <h2>${LOCKED_PITCH_LAB_COPY.brandLine}</h2>
      </div>
      <div>
        <p class="eyebrow">Pitch Lab principle</p>
        <h2>${LOCKED_PITCH_LAB_COPY.founderLine}</h2>
      </div>
    </section>
  `;
}

function practiceModule(route) {
  if (route === '/practice') {
    return `
      <section class="interactive-panel" aria-labelledby="local-practice-title">
        <h2 id="local-practice-title">Local practice flow</h2>
        <div data-practice-root>
          <p class="phase-note">Loading local practice flow...</p>
        </div>
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
        <div data-story-card-root>
          <p class="phase-note">Answer the practice questions to populate the local draft card.</p>
        </div>
      </section>
      <section class="interactive-panel story-card-stage" aria-labelledby="ai-card-title">
        <h2 id="ai-card-title">AI Pitch Story Card</h2>
        <p class="phase-note">This calls only the server-side LLM endpoint. If providers are not configured, it fails honestly and produces no fake AI card. Story Strength Signals are qualitative coaching guidance, not scores.</p>
        <div class="actions"><button type="button" class="button primary" data-generate-ai-card>Generate AI Pitch Story Card</button></div>
        <div data-ai-story-card-root></div>
      </section>
      <section class="interactive-panel media-identity-panel" aria-labelledby="media-moments-title">
        <h2 id="media-moments-title">Scooter media identity</h2>
        <p class="phase-note">Talking AI Scooter is core to the intended coaching experience at welcome, final story summary, and share/close. Text carries the detailed artifact; static/text-only mode is an honest degraded fallback if media providers are unavailable.</p>
      </section>
    `;
  }
  if (route === '/thank-you') {
    return `
      <section class="interactive-panel" aria-labelledby="thank-you-status-title">
        <h2 id="thank-you-status-title">Submission status</h2>
        <div data-thank-you-status>
          <p class="phase-note">A confirmed Network OS response is required before this page claims a submission happened.</p>
        </div>
      </section>
    `;
  }
  if (route === '/share') {
    return `
      <section class="interactive-panel" aria-labelledby="share-boundary-title">
        <h2 id="share-boundary-title">Share boundary</h2>
        <div data-share-boundary>
          <p class="phase-note">Share requires explicit consent and a completed AI Pitch Story Card.</p>
        </div>
      </section>
    `;
  }
  return '';
}

export function renderPage(route) {
  const normalized = route === '' ? '/' : route;
  const page = pageCopy[normalized] ?? pageCopy['/'];
  const isHome = normalized === '/';

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
      ${navLink('/privacy', 'Privacy')}
    </nav>
  </header>
  <main>
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${page.eyebrow}</p>
        <h1>${page.title}</h1>
        <p class="product-mantra">${LOCKED_PITCH_LAB_COPY.founderLine}</p>
        <p class="brand-line">${LOCKED_PITCH_LAB_COPY.brandLine}</p>
        <p>${page.body}</p>
        <div class="actions">
          <a class="button primary" href="/practice">${page.action ?? LOCKED_PITCH_LAB_COPY.primaryCta}</a>
          <a class="button secondary" href="/how-it-works">${LOCKED_PITCH_LAB_COPY.secondaryCta}</a>
        </div>
      </div>
      ${avatarCard()}
    </section>
    ${isHome || normalized === '/how-it-works' ? brandBand() : ''}
    ${isHome || normalized === '/how-it-works' ? processGrid() : ''}
    ${practiceModule(normalized)}
    <section class="disclosure-panel" aria-labelledby="disclosure-title">
      <div class="section-kicker"></div>
      <h2 id="disclosure-title">Trust boundary</h2>
      <p>${DISCLOSURES.aiScooter}</p>
      <p>${DISCLOSURES.noGuarantee}</p>
      <p>Pitch Lab can analyze with server-side AI when configured. Voice and avatar media are backend-managed and core at key moments, not founder-facing render buttons. Email is not part of this MVP.</p>
      <p>The product stays relationship-first: practice privately, sharpen what matters, then choose whether West Peek should see the card.</p>
      <p class="phase-note">The share boundary remains: sharing requires explicit consent, Network OS confirmation, no automatic contact creation, and no unearned success state. Founders can leave with a copied card without sharing.</p>
    </section>
  </main>
  <footer>
    <div class="footer-brand">
      <img src="/assets/brand/west-peek-mark.png" alt="" aria-hidden="true" />
      <p>${LOCKED_PITCH_LAB_COPY.brandLine} · ${LOCKED_PITCH_LAB_COPY.founderLine}</p>
    </div>
    <nav aria-label="Footer navigation">
      ${navLink('/terms', 'Terms')}
      ${navLink('/privacy', 'Privacy')}
      ${navLink('/share', 'Share boundary')}
    </nav>
  </footer>
  <script type="module" src="/assets/practice-flow.js"></script>
  <script type="module" src="/assets/ai-story-card.js"></script>
  <script type="module" src="/assets/share-flow.js"></script>
</body>
</html>`;
}
