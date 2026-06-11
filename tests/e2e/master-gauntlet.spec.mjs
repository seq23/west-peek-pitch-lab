import { test, expect } from '@playwright/test';

const STORAGE_ANSWERS_KEY = 'west-peek-pitch-lab.phase3.answers.v1';
const STORAGE_AI_CARD_KEY = 'west-peek-pitch-lab.phase4.ai-story-card.v1';
const STORAGE_SHARE_STATUS_KEY = 'west-peek-pitch-lab.phase7.share-status.v1';
const STORAGE_PROFILE_KEY = 'west-peek-pitch-lab.founder-profile.v1';
const STORAGE_DECK_CONTEXT_KEY = 'west-peek-pitch-lab.deck-context.v1';
const STORAGE_REHEARSAL_TAKES_KEY = 'west-peek-pitch-lab.practice-out-loud.takes.v2';
const STORAGE_SELECTED_REHEARSAL_KEY = 'west-peek-pitch-lab.practice-out-loud.selected.v2';

// Required validation anchor: does not guarantee
const founderAnswers = {
  what_building: 'We are building a relationship-intelligence tool for founder-led companies that turns founder context into usable relationship actions.',
  who_for: 'It is for founders who need clearer story, investor readiness, and better relationship routing before they ask for capital or introductions.',
  painful_problem: 'The painful problem is that good products often get ignored because the story is hard to repeat, proof is scattered, and the next relationship is unclear.',
  why_now: 'The timing matters because AI makes story iteration faster, but it also creates generic pitches, so founders need sharper context and human relationship judgment.',
  founder_edge: 'The team has direct founder, investor, AI product-building, and West Peek relationship-network experience, so we understand both the tooling and the human trust layer.',
  proof_traction: 'Early proof includes live West Peek deal flow, current founder tooling, working Network OS integration, and active founder-story workflows.',
  help_needed: 'We need strategic founders, investor feedback, warm customer introductions, and operators who can pressure-test the routing workflow.'
};

const fakeAiResponse = {
  status: 'ai_story_card_ready',
  aiEnhanced: true,
  shareEnabled: false,
  disclosure: 'AI-generated coaching draft. Human review is still separate and not guaranteed.',
  storyStrengthSignals: [
    { category: 'Clarity', signal: 'Strong', guidance: 'The one-line pitch is repeatable.' },
    { category: 'Proof / Traction', signal: 'Developing', guidance: 'Add a customer quote or pilot number.' }
  ],
  critique: {
    whatIsClear: 'The audience and problem are legible.',
    whatIsConfusing: 'The exact first customer could be sharper.',
    whatSoundsGeneric: 'Relationship intelligence needs one concrete example.',
    needsStrongerProof: 'Use a specific metric or live case.',
    likelyObjection: 'Buyers may ask why this is not just a CRM.',
    betterStoryAngle: 'Position it as the story-to-relationship bridge.',
    suggestedNextQuestion: 'Who urgently needs this this week?'
  },
  storyCard: {
    oneLinePitch: 'West Peek Pitch Lab helps founders turn raw context into a story people can repeat.',
    companySummary: 'A founder-story and relationship-routing practice tool.',
    customer: 'Founder-led companies preparing for investors, customers, and strategic relationships.',
    problem: 'Good products get ignored when the story is vague and the next relationship is unclear.',
    solution: 'A guided Pitch Story Card with qualitative story-strength coaching.',
    proofTraction: 'Working local flow, AI endpoint contract, and Network OS handoff contract.',
    founderEdge: 'Direct founder, investor, AI, and West Peek relationship-network context.',
    whyNow: 'AI increases pitch volume, so the human story and relationship signal matter more.',
    biggestStoryGap: 'The first customer wedge needs one specific example.',
    biggestObjection: 'It may sound like a generic CRM unless positioned clearly.',
    suggestedNextRelationships: 'Founders, operators, customer design partners, and investor reviewers.',
    nextSteps: 'Tighten the customer wedge, add proof, then decide whether to share with West Peek.'
  }
};

const fakeShareSuccess = {
  ok: true,
  review_status: 'pending_network_review',
  contact_created: false,
  intake_id: 'test-intake-001'
};

const fakeSelectedRehearsalTake = {
  id: 'take-gauntlet-001',
  durationSeconds: 58,
  mimeType: 'video/webm',
  transcript: 'We help founders turn scattered context into a clear pitch story, prove the painful problem, explain founder edge, and name the next useful customer or investor relationship.',
  createdAt: '2026-06-10T20:00:00.000Z',
  createdAtLabel: 'Jun 10, 2026, 8:00 PM',
  coachingSignals: [
    { category: 'Plain-English opening', signal: 'Present', guidance: 'The pitch has enough material to review.' },
    { category: 'Proof or traction', signal: 'Add proof', guidance: 'Give one concrete proof point before sharing.' }
  ]
};

function forbiddenPromisePatterns() {
  return [
    /Scooter reviewed this/i,
    /Scooter personally reviewed/i,
    /meeting guaranteed/i,
    /guaranteed meeting/i,
    /guaranteed funding/i,
    /funding guaranteed/i,
    /guaranteed intro/i,
    /contact created automatically:\s*yes/i,
    /Email me my card/i,
    /fundability score/i,
    /West Peek score/i,
    /\b\d{1,3}\s*\/\s*100\b/i,
    /\b\d{1,3}%\b/i
  ];
}

async function expectNoForbiddenPromises(page) {
  const text = await page.locator('body').innerText();
  for (const pattern of forbiddenPromisePatterns()) expect(text).not.toMatch(pattern);
}

async function seedCompleteAnswers(page) {
  await page.addInitScript(({ key, profileKey, answers }) => {
    window.localStorage.setItem(key, JSON.stringify(answers));
    window.localStorage.setItem(profileKey, JSON.stringify({ name: 'Avery Founder', email: 'avery@example.com', companyName: 'ExampleCo', website: 'https://example.com' }));
  }, { key: STORAGE_ANSWERS_KEY, profileKey: STORAGE_PROFILE_KEY, answers: founderAnswers });
}

async function seedAiCard(page) {
  await page.addInitScript(({ answersKey, aiKey, profileKey, deckKey, answers, aiCard }) => {
    window.localStorage.setItem(answersKey, JSON.stringify(answers));
    window.localStorage.setItem(aiKey, JSON.stringify(aiCard));
    window.localStorage.setItem(profileKey, JSON.stringify({ name: 'Avery Founder', email: 'avery@example.com', companyName: 'ExampleCo', website: 'https://example.com' }));
    window.localStorage.setItem(deckKey, JSON.stringify({ deck_provided: false, deck_context_used: false }));
  }, { answersKey: STORAGE_ANSWERS_KEY, aiKey: STORAGE_AI_CARD_KEY, profileKey: STORAGE_PROFILE_KEY, deckKey: STORAGE_DECK_CONTEXT_KEY, answers: founderAnswers, aiCard: fakeAiResponse });
}

async function seedSelectedRehearsal(page, { consented = true } = {}) {
  await page.addInitScript(({ takesKey, selectedKey, take, consented }) => {
    window.localStorage.setItem(takesKey, JSON.stringify({ takes: [take] }));
    window.localStorage.setItem(selectedKey, JSON.stringify({
      id: take.id,
      selectedAt: '2026-06-10T20:01:00.000Z',
      selectedWithConsent: consented,
      consentedAt: consented ? '2026-06-10T20:02:00.000Z' : null
    }));
  }, { takesKey: STORAGE_REHEARSAL_TAKES_KEY, selectedKey: STORAGE_SELECTED_REHEARSAL_KEY, take: fakeSelectedRehearsalTake, consented });
}

function liveEnvEnabled(name) {
  return String(process.env[name] || '').toLowerCase() === 'true';
}

test.describe('West Peek Pitch Lab Master Gauntlet — hostile max-depth', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (error) => { throw error; });
  });

  test('all public routes render core brand, trust boundaries, and no forbidden success claims', async ({ page }) => {
    const routes = ['/', '/how-it-works', '/practice', '/story-card', '/share', '/thank-you', '/privacy', '/terms', '/ai-disclosure', '/founder-network-notice', '/data-consent', '/contact', '/delete-my-info'];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('body')).toContainText('Good people should meet good people.');
      await expect(page.locator('body')).toContainText('Good products need good stories.');
      await expect(page.locator('body')).toContainText('AI Scooter');
      await expect(page.locator('body')).toContainText('Trust boundary');
      await expect(page.locator('body')).toContainText('not an investment committee');
      await expect(page.locator('body')).toContainText(/not guarantee/i);
      await expectNoForbiddenPromises(page);
    }
  });

  test('hero uses the canonical Scooter image instead of initials fallback', async ({ page }) => {
    await page.goto('/');
    const photo = page.locator('.avatar-frame img.avatar-photo');
    await expect(photo).toHaveAttribute('src', '/assets/avatar/scooter-avatar-source.png');
    await expect(photo).toBeVisible();
    await expect(page.locator('.avatar-initials')).toHaveCount(0);
    await expect(page.locator('.avatar-frame')).not.toContainText(/^ST$/);
    await expectNoForbiddenPromises(page);
  });

  test('primary navigation reaches the founder journey surfaces on desktop and mobile', async ({ page }) => {
    await page.goto('/');
    for (const [label, expectedRoute] of [
      ['How it works', '/how-it-works'],
      ['Practice', '/practice'],
      ['Story Card', '/story-card'],
      ['Privacy', '/privacy']
    ]) {
      await page.getByRole('link', { name: label }).first().click();
      await expect(page.locator('body')).toHaveAttribute('data-route', expectedRoute);
      await expectNoForbiddenPromises(page);
    }
  });

  test('practice flow blocks thin answers, advances through all seven prompts, and persists founder answers locally', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('body')).toContainText('AI Scooter coaching conversation');
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Avery Founder');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('avery@example.com');
    await page.getByLabel('Company name').fill('ExampleCo');
    await page.getByRole('button', { name: /Start AI Scooter practice/i }).click();

    await page.locator('textarea').first().fill('too short');
    await page.getByRole('button', { name: /next question/i }).click();
    await expect(page.locator('[data-error]')).toBeVisible();
    await expect(page.locator('[data-error]')).toContainText('Minimum');

    for (const answer of Object.values(founderAnswers)) {
      await page.locator('textarea').first().fill(answer);
      await page.getByRole('button', { name: /next question|create local draft card/i }).click();
    }

    await expect(page.locator('body')).toContainText('Your Pitch Story Card draft is ready.');
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), STORAGE_ANSWERS_KEY);
    expect(saved).toMatchObject(founderAnswers);
    await expectNoForbiddenPromises(page);
  });


  test('practice guidance makes the next step obvious without modal tutorial or visual hard-fail theater', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('body')).toContainText('Start here');
    await expect(page.locator('body')).toContainText('Use the name West Peek should recognize');
    await expect(page.locator('body')).toContainText('this creates the private session context');
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Avery Founder');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('avery@example.com');
    await page.getByLabel('Company name').fill('ExampleCo');
    await page.getByRole('button', { name: /Start AI Scooter practice/i }).click();

    await expect(page.locator('body')).toContainText('Optional deck-as-context');
    await expect(page.locator('body')).toContainText('skip the deck and answer from scratch');
    await expect(page.getByRole('button', { name: /No deck/i })).toHaveClass(/attention-ready/);
    await page.getByRole('button', { name: /No deck/i }).click();

    await expect(page.locator('[data-next-step-card]')).toContainText('Next:');
    await expect(page.locator('.answer-helper-panel')).toContainText('Why Scooter asks');
    await expect(page.locator('.answer-helper-panel')).toContainText('Strong answer hint');
    await expect(page.locator('.answer-helper-panel')).toContainText('Example');
    await expect(page.locator('.answer-helper-panel')).toContainText('Avoid');
    await expect(page.locator('textarea')).toHaveAttribute('title', /live draft updates/i);

    await page.locator('textarea').first().fill(founderAnswers.what_building);
    await expect(page.locator('[data-next-step-card]')).toHaveClass(/attention-ready/);
    await expect(page.getByRole('button', { name: /Next question/i })).toHaveClass(/attention-ready/);
    await expectNoForbiddenPromises(page);
  });

  test('Practice Out Loud journey surfaces camera, countdown, playback, transcript, best-take, and consent states without uploading video', async ({ page }) => {
    await seedCompleteAnswers(page);
    await page.goto('/story-card');
    await expect(page.locator('body')).toContainText('Practice Out Loud');
    await expect(page.locator('.camera-practice')).toContainText('Camera Room Opens');
    await expect(page.locator('.camera-practice')).toContainText('AI Scooter remains visible. Your camera appears here. Countdown starts when you are ready.');
    await expect(page.locator('.camera-practice')).toContainText('Record');
    await expect(page.locator('.camera-practice')).toContainText('Playback');
    await expect(page.locator('.camera-practice')).toContainText('Choose');
    await expect(page.locator('.camera-practice')).toContainText('Consent');
    await expect(page.locator('[data-camera-status]')).toContainText('No video uploads from this screen');
    await expect(page.locator('[data-take-list]')).toContainText('No takes recorded yet');
    await page.locator('[data-consent-selected-take]').click({ force: true });
    await expect(page.locator('[data-rehearsal-consent-status]')).toContainText('Choose a best take before attaching rehearsal context');
    await expectNoForbiddenPromises(page);
  });

  test('selected rehearsal take persists into share preview only after explicit rehearsal consent', async ({ page }) => {
    await seedAiCard(page);
    await seedSelectedRehearsal(page, { consented: true });
    await page.goto('/share');
    await expect(page.locator('.founder-story-packet')).toContainText('Practice Out Loud');
    await expect(page.locator('.founder-story-packet')).toContainText('Best take selected');
    await expect(page.locator('.founder-story-packet')).toContainText('Transcript saved: Yes');
    await expect(page.locator('.founder-story-packet')).toContainText('Packet inclusion consent: Yes');
    await expect(page.getByLabel(/Include my selected Practice Out Loud take/i)).toBeChecked();
    await expectNoForbiddenPromises(page);
  });

  test('local Story Card is populated, copyable, qualitative-only, and does not imply scoring or review', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await seedCompleteAnswers(page);
    await page.goto('/story-card');

    await expect(page.locator('body')).toContainText('Local Pitch Story Card shell');
    await expect(page.locator('body')).toContainText('Story Strength Snapshot');
    await expect(page.locator('body')).toContainText('Copy Pitch Story Card');
    await expect(page.locator('body')).toContainText('relationship-intelligence tool');
    await expect(page.locator('body')).toContainText('Strong');
    await expect(page.locator('body')).toContainText('Developing');
    await expectNoForbiddenPromises(page);

    await page.getByRole('button', { name: /Copy Pitch Story Card/i }).first().click();
    await expect(page.locator('[data-local-copy-status]')).toContainText(/Copied|Clipboard/);
  });

  test('AI story generation fails honestly when providers are unavailable and never produces fake AI output', async ({ page }) => {
    await seedCompleteAnswers(page);
    await page.route('**/api/pitch/story-card', async (route) => {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ status: 'ai_unavailable', reason: 'Provider is unavailable in this gauntlet.' }) });
    });

    await page.goto('/story-card');
    await page.getByRole('button', { name: /Generate AI Pitch Story Card/i }).click();
    await expect(page.locator('[data-ai-story-card-root]')).toContainText('AI coaching is unavailable');
    await expect(page.locator('[data-ai-story-card-root]')).toContainText('No fake AI output was generated');
    const aiStored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_AI_CARD_KEY);
    expect(aiStored).toBeNull();
    await expectNoForbiddenPromises(page);
  });

  test('AI story generation success remains copy-only until explicit founder share consent', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await seedCompleteAnswers(page);
    await page.route('**/api/pitch/story-card', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeAiResponse) });
    });

    await page.goto('/story-card');
    await page.getByRole('button', { name: /Generate AI Pitch Story Card/i }).click();
    await expect(page.locator('[data-ai-story-card-root]')).toContainText('AI-enhanced Pitch Story Card');
    await expect(page.locator('[data-ai-story-card-root]')).toContainText('West Peek Pitch Lab helps founders');
    await page.getByRole('button', { name: /Copy Pitch Story Card/i }).last().click();
    await expect(page.locator('[data-ai-copy-status]')).toContainText(/Copied|Clipboard/);
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STORAGE_AI_CARD_KEY);
    expect(stored?.storyCard?.oneLinePitch).toContain('West Peek Pitch Lab helps founders');
    const shareStatus = await page.evaluate((key) => localStorage.getItem(key), STORAGE_SHARE_STATUS_KEY);
    expect(shareStatus).toBeNull();
    await expectNoForbiddenPromises(page);
  });

  test('share page blocks placeholder submission when no AI Pitch Story Card exists', async ({ page }) => {
    await page.goto('/share');
    await expect(page.locator('body')).toContainText('Start with your founder profile');
    await expect(page.locator('body')).toContainText('Your pitch answers and Founder Story Packet stay private unless you choose to share them');
    const shareStatus = await page.evaluate((key) => localStorage.getItem(key), STORAGE_SHARE_STATUS_KEY);
    expect(shareStatus).toBeNull();
    await expectNoForbiddenPromises(page);
  });

  test('share form requires explicit consent before any West Peek handoff is attempted', async ({ page }) => {
    await seedAiCard(page);
    let called = false;
    await page.route('**/api/pitch/share', async (route) => {
      called = true;
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false }) });
    });

    await page.goto('/share');
    await page.getByRole('button', { name: /Share Founder Story Packet with West Peek/i }).click();
    await expect(page.locator('[data-share-error]')).toContainText('Consent is required');
    expect(called).toBe(false);
    await expectNoForbiddenPromises(page);
  });

  test('Network OS failure keeps the founder in honest non-submitted state', async ({ page }) => {
    await seedAiCard(page);
    await page.route('**/api/pitch/share', async (route) => {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error_code: 'NETWORK_OS_UNAVAILABLE', message: 'Network OS is unavailable.' }) });
    });

    await page.goto('/share');
    await page.getByLabel(/I consent to share/i).check();
    await page.getByRole('button', { name: /Share Founder Story Packet with West Peek/i }).click();
    await expect(page.locator('[data-share-result]')).toContainText('Submission was not completed');
    await expect(page.locator('[data-share-result]')).toContainText('Nothing was shared');
    const shareStatus = await page.evaluate((key) => localStorage.getItem(key), STORAGE_SHARE_STATUS_KEY);
    expect(shareStatus).toBeNull();
    await expectNoForbiddenPromises(page);
  });

  test('confirmed Network OS handoff records pending network review without auto-contact or exaggerated success', async ({ page }) => {
    await seedAiCard(page);
    await page.route('**/api/pitch/share', async (route) => {
      const requestBody = route.request().postDataJSON();
      expect(requestBody.consent.shareWithWestPeek).toBe(true);
      expect(requestBody.storyCard.oneLinePitch).toContain('West Peek Pitch Lab helps founders');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeShareSuccess) });
    });

    await page.goto('/share');
    await page.getByLabel(/I consent to share/i).check();
    await page.getByRole('button', { name: /Share Founder Story Packet with West Peek/i }).click();
    await expect(page.locator('[data-share-result]')).toContainText('Founder Story Packet shared with West Peek for network review');
    await expect(page.locator('[data-share-result]')).toContainText('Contact created: No');

    await page.getByRole('link', { name: /Continue/i }).click();
    await expect(page.locator('body')).toContainText('pending_network_review');
    await expect(page.locator('body')).toContainText('Contact created automatically: No');
    await expectNoForbiddenPromises(page);
  });

  test('share transaction sends complete consented handoff payload and persists only confirmed receipt', async ({ page }) => {
    await seedAiCard(page);
    let observedPayload = null;

    await page.route('**/api/pitch/share', async (route) => {
      observedPayload = route.request().postDataJSON();
      expect(observedPayload.founder.name).toBe('Avery Founder');
      expect(observedPayload.founder.email).toBe('avery@example.com');
      expect(observedPayload.founder.companyName).toBe('ExampleCo');
      expect(observedPayload.consent.shareWithWestPeek).toBe(true);
      expect(observedPayload.storyCard.oneLinePitch).toContain('West Peek Pitch Lab helps founders');
      expect(observedPayload.storyCard.nextSteps).toContain('Tighten the customer wedge');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeShareSuccess) });
    });

    await page.goto('/share');
    await page.getByLabel(/I consent to share/i).check();
    await page.getByRole('button', { name: /Share Founder Story Packet with West Peek/i }).click();
    await expect(page.locator('[data-share-result]')).toContainText('Founder Story Packet shared with West Peek for network review');

    expect(observedPayload).not.toBeNull();
    const shareStatus = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STORAGE_SHARE_STATUS_KEY);
    expect(shareStatus.reviewStatus).toBe('pending_network_review');
    expect(shareStatus.contactCreated).toBe(false);
    expect(shareStatus.intakeId).toBe('test-intake-001');
    await expectNoForbiddenPromises(page);
  });

  test('thank-you page refuses to claim success without a confirmed local submission receipt', async ({ page }) => {
    await page.goto('/thank-you');
    await expect(page.locator('body')).toContainText('No confirmed submission found');
    await expect(page.locator('body')).toContainText('only confirms a share after the app receives a confirmed receipt');
    await expectNoForbiddenPromises(page);
  });

  test('Scooter media lane is visibly core, honestly degraded, and backend/provider-gated', async ({ page, request }) => {
    await page.goto('/story-card');
    await expect(page.locator('body')).toContainText('Scooter media identity');
    await expect(page.locator('body')).toContainText('Talking AI Scooter is core');
    await expect(page.locator('body')).toContainText('static/text-only mode is an honest degraded fallback');
    await expect(page.locator('body')).toContainText('Text carries the detailed artifact');

    for (const endpoint of ['/api/avatar/status', '/api/voice/status']) {
      const response = await request.get(endpoint);
      expect([200, 404, 503]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        expect(JSON.stringify(body)).not.toMatch(/fake|placeholder success|generated/i);
      }
    }
    await expectNoForbiddenPromises(page);
  });


  test('Scooter speaking journey protects required moments while keeping text-first output non-blocking', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-required-speaking-moment]').first()).toContainText('Required talking Scooter moment');
    await expect(page.locator('[data-scooter-companion]').first()).toHaveAttribute('data-scooter-moment', /Welcome/);

    await seedCompleteAnswers(page);
    await page.route('**/api/pitch/story-card', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeAiResponse) });
    });
    await page.goto('/story-card');
    await page.getByRole('button', { name: /Generate AI Pitch Story Card/i }).click();
    await expect(page.locator('[data-ai-story-card-root]')).toContainText('AI-enhanced Pitch Story Card');
    await expect(page.locator('[data-final-scooter-summary]')).toContainText('AI Scooter final summary');
    await expect(page.locator('[data-avatar-lane]')).toContainText('Scooter’s short personalized media summary is preparing');
    await expect(page.locator('[data-avatar-lane]')).toContainText('Hard ceiling 65 seconds');
    await expect(page.getByRole('link', { name: /Preview Founder Story Packet/i })).toBeVisible();

    await seedAiCard(page);
    await page.goto('/share');
    await expect(page.locator('.share-close-moment')).toContainText('AI Scooter close');
    await expect(page.locator('.share-close-moment')).toContainText('Required talking Scooter close');
    await expectNoForbiddenPromises(page);
  });

  test('share transaction includes consented rehearsal transcript/status and keeps local video file out of payload', async ({ page }) => {
    await seedAiCard(page);
    await seedSelectedRehearsal(page, { consented: true });
    let observedPayload = null;
    await page.route('**/api/pitch/share', async (route) => {
      observedPayload = route.request().postDataJSON();
      expect(observedPayload.consent.shareWithWestPeek).toBe(true);
      expect(observedPayload.consent.includePracticeVideo).toBe(true);
      expect(observedPayload.practiceRehearsal.selected_take_id).toBe(fakeSelectedRehearsalTake.id);
      expect(observedPayload.practiceRehearsal.transcript).toContain('turn scattered context into a clear pitch story');
      expect(observedPayload.practiceRehearsal.local_video_only).toBe(true);
      expect(observedPayload.practiceRehearsal.upload_storage_enabled).toBe(false);
      expect(JSON.stringify(observedPayload.practiceRehearsal)).not.toMatch(/blob:|data:video|webm;base64|ArrayBuffer/i);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeShareSuccess) });
    });

    await page.goto('/share');
    await page.getByLabel(/I consent to share my Founder Story Packet/i).check();
    await expect(page.getByLabel(/Include my selected Practice Out Loud take/i)).toBeChecked();
    await page.getByRole('button', { name: /Share Founder Story Packet with West Peek/i }).click();
    await expect(page.locator('[data-share-result]')).toContainText('Founder Story Packet shared with West Peek for network review');
    expect(observedPayload).not.toBeNull();
    await expectNoForbiddenPromises(page);
  });

  test('avatar render POST is a real transaction endpoint and never returns fake video success', async ({ request }) => {
    const response = await request.post('/api/avatar/render', {
      data: { moment: 'final_summary', text: 'This is a short final AI Scooter summary for provider-gated video formation.' }
    });
    expect([202, 400, 429, 503]).toContain(response.status());
    const body = await response.json();
    expect(JSON.stringify(body)).not.toMatch(/fake|placeholder success/i);
    if (response.status() === 202) {
      expect(body.status).toBe('avatar_render_queued');
      expect(body.avatarReady).toBe(false);
      expect(body.providerResponse).toBeTruthy();
    } else {
      expect(JSON.stringify(body)).not.toMatch(/avatar_render_queued|avatarReady\s*[:=]\s*true|videoReady\s*[:=]\s*true/i);
      if (Object.prototype.hasOwnProperty.call(body, 'avatarReady')) expect(body.avatarReady).toBe(false);
      if (body.status) expect(String(body.status)).not.toMatch(/success|ready|generated/i);
    }
  });

  test('LIVE gated Network OS handoff E2E requires explicit opt-in env', async ({ page }) => {
    test.skip(!liveEnvEnabled('PITCH_LAB_LIVE_NETWORK_OS_E2E'), 'Set PITCH_LAB_LIVE_NETWORK_OS_E2E=true only when live Network OS env is configured.');
    await seedAiCard(page);
    await page.goto('/share');
    await page.getByLabel('Founder name').fill('Gauntlet Live Founder');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('gauntlet-live-founder@example.com');
    await page.getByLabel('Company name').fill('Gauntlet Live Company');
    await page.getByLabel(/I consent to share/i).check();
    await page.getByRole('button', { name: /Share Founder Story Packet with West Peek/i }).click();
    await expect(page.locator('[data-share-result]')).toContainText('Founder Story Packet shared with West Peek for network review');
    const shareStatus = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STORAGE_SHARE_STATUS_KEY);
    expect(shareStatus.reviewStatus).toBe('pending_network_review');
    expect(shareStatus.contactCreated).toBe(false);
    await expectNoForbiddenPromises(page);
  });

  test('LIVE gated avatar video formation E2E requires explicit opt-in env', async ({ request }) => {
    test.skip(!liveEnvEnabled('PITCH_LAB_LIVE_AVATAR_E2E'), 'Set PITCH_LAB_LIVE_AVATAR_E2E=true only when live avatar provider env is configured.');
    const response = await request.post('/api/avatar/render', {
      data: { moment: 'final_summary', text: 'Good products need good stories. This is a live gated avatar formation proof.' }
    });
    expect(response.status()).toBe(202);
    const body = await response.json();
    expect(body.status).toBe('avatar_render_queued');
    expect(body.provider).toBeTruthy();
    expect(body.providerResponse?.id).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/fake|placeholder/i);
  });

  test('UI does not expose secret names, raw env values, provider keys, or implementation-only file names', async ({ page }) => {
    for (const route of ['/', '/story-card', '/share', '/privacy', '/terms']) {
      await page.goto(route);
      const text = await page.locator('body').innerText();
      expect(text).not.toMatch(/OPENAI_API_KEY|GEMINI_API_KEY|ELEVENLABS_API_KEY|NETWORK_OS_SHARED_SECRET|PITCH_LAB_SHARED_SECRET/i);
      expect(text).not.toMatch(/\.env\.local|secrets\/|\.gpg/i);
      await expectNoForbiddenPromises(page);
    }
  });

  test('profile gate, footer disclosures, policy routes, deck context, and Practice Out Loud are present', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('body')).toContainText('Enter your email to begin and save your Pitch Lab session');
    await expect(page.locator('body')).toContainText('Optional deck-as-context');
    await expect(page.locator('body')).toContainText('not a deck review');
    await page.goto('/story-card');
    await expect(page.locator('body')).toContainText('Practice Out Loud');
    await expect(page.locator('body')).toContainText('local-first');
    await page.goto('/');
    for (const label of ['Terms', 'Privacy', 'AI Disclosure', 'Founder Network Notice', 'Data & Consent', 'Contact', 'Delete / Update My Info']) {
      await expect(page.getByRole('link', { name: label }).last()).toBeVisible();
    }
  });

  test('Founder Story Packet payload uses relationship routing and disclaimer acknowledgements', async ({ page }) => {
    await seedAiCard(page);
    let observedPayload = null;
    await page.route('**/api/pitch/share', async (route) => {
      observedPayload = route.request().postDataJSON();
      expect(observedPayload.aiPersona).toBe('AI Scooter');
      expect(observedPayload.consent.disclaimersAcknowledged.network_review_only).toBe(true);
      expect(observedPayload.consent.includeDeckFile).toBe(false);
      expect(observedPayload.consent.includePracticeVideo).toBe(false);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeShareSuccess) });
    });
    await page.goto('/share');
    await page.getByLabel(/I consent to share my Founder Story Packet/i).check();
    await page.getByRole('button', { name: /Share Founder Story Packet with West Peek/i }).click();
    expect(observedPayload).not.toBeNull();
    await expect(page.locator('[data-share-result]')).toContainText('network review');
  });

});
