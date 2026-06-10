import { test, expect } from '@playwright/test';

const STORAGE_ANSWERS_KEY = 'west-peek-pitch-lab.phase3.answers.v1';
const STORAGE_AI_CARD_KEY = 'west-peek-pitch-lab.phase4.ai-story-card.v1';
const STORAGE_SHARE_STATUS_KEY = 'west-peek-pitch-lab.phase7.share-status.v1';

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
  review_status: 'pending_human_review',
  contact_created: false,
  intake_id: 'test-intake-001'
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
  await page.addInitScript(({ key, answers }) => {
    window.localStorage.setItem(key, JSON.stringify(answers));
  }, { key: STORAGE_ANSWERS_KEY, answers: founderAnswers });
}

async function seedAiCard(page) {
  await page.addInitScript(({ answersKey, aiKey, answers, aiCard }) => {
    window.localStorage.setItem(answersKey, JSON.stringify(answers));
    window.localStorage.setItem(aiKey, JSON.stringify(aiCard));
  }, { answersKey: STORAGE_ANSWERS_KEY, aiKey: STORAGE_AI_CARD_KEY, answers: founderAnswers, aiCard: fakeAiResponse });
}

test.describe('West Peek Pitch Lab Master Gauntlet — hostile max-depth', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (error) => { throw error; });
  });

  test('all public routes render core brand, trust boundaries, and no forbidden success claims', async ({ page }) => {
    const routes = ['/', '/how-it-works', '/practice', '/story-card', '/share', '/thank-you', '/privacy', '/terms'];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('body')).toContainText('Good people should meet good people.');
      await expect(page.locator('body')).toContainText('Good products need good stories.');
      await expect(page.locator('body')).toContainText('AI Scooter');
      await expect(page.locator('body')).toContainText('Trust boundary');
      await expect(page.locator('body')).toContainText('does not represent an investment decision');
      await expect(page.locator('body')).toContainText(/not guarantee/i);
      await expectNoForbiddenPromises(page);
    }
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
    await expect(page.locator('body')).toContainText('Local practice flow');

    await page.locator('textarea').first().fill('too short');
    await page.getByRole('button', { name: /next question/i }).click();
    await expect(page.locator('[data-error]')).toBeVisible();
    await expect(page.locator('[data-error]')).toContainText('Minimum');

    for (const answer of Object.values(founderAnswers)) {
      await page.locator('textarea').first().fill(answer);
      await page.getByRole('button', { name: /next question|create local draft card/i }).click();
    }

    await expect(page.locator('body')).toContainText('Your local Pitch Story Card shell is ready.');
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), STORAGE_ANSWERS_KEY);
    expect(saved).toMatchObject(founderAnswers);
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
    await expect(page.locator('body')).toContainText('Generate your AI Pitch Story Card first');
    await expect(page.locator('body')).toContainText('No placeholder submission is allowed');
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
    await page.getByLabel('Founder name').fill('Avery Founder');
    await page.getByLabel('Email').fill('avery@example.com');
    await page.getByLabel('Company name').fill('ExampleCo');
    await page.getByRole('button', { name: /Share with West Peek/i }).click();
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
    await page.getByLabel('Founder name').fill('Avery Founder');
    await page.getByLabel('Email').fill('avery@example.com');
    await page.getByLabel('Company name').fill('ExampleCo');
    await page.getByLabel(/I consent to share/i).check();
    await page.getByRole('button', { name: /Share with West Peek/i }).click();
    await expect(page.locator('[data-share-result]')).toContainText('Submission was not completed');
    await expect(page.locator('[data-share-result]')).toContainText('No submitted state was recorded');
    const shareStatus = await page.evaluate((key) => localStorage.getItem(key), STORAGE_SHARE_STATUS_KEY);
    expect(shareStatus).toBeNull();
    await expectNoForbiddenPromises(page);
  });

  test('confirmed Network OS handoff records pending human review without auto-contact or exaggerated success', async ({ page }) => {
    await seedAiCard(page);
    await page.route('**/api/pitch/share', async (route) => {
      const requestBody = route.request().postDataJSON();
      expect(requestBody.consent.shareWithWestPeek).toBe(true);
      expect(requestBody.storyCard.oneLinePitch).toContain('West Peek Pitch Lab helps founders');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeShareSuccess) });
    });

    await page.goto('/share');
    await page.getByLabel('Founder name').fill('Avery Founder');
    await page.getByLabel('Email').fill('avery@example.com');
    await page.getByLabel('Company name').fill('ExampleCo');
    await page.getByLabel(/I consent to share/i).check();
    await page.getByRole('button', { name: /Share with West Peek/i }).click();
    await expect(page.locator('[data-share-result]')).toContainText('Shared with West Peek for human review');
    await expect(page.locator('[data-share-result]')).toContainText('Contact created: No');

    await page.getByRole('link', { name: /Continue/i }).click();
    await expect(page.locator('body')).toContainText('pending_human_review');
    await expect(page.locator('body')).toContainText('Contact created automatically: No');
    await expectNoForbiddenPromises(page);
  });

  test('thank-you page refuses to claim success without a confirmed local submission receipt', async ({ page }) => {
    await page.goto('/thank-you');
    await expect(page.locator('body')).toContainText('No confirmed submission found');
    await expect(page.locator('body')).toContainText('only claims success after Network OS confirms');
    await expectNoForbiddenPromises(page);
  });

  test('Scooter media lane is visibly core, honestly degraded, and backend/provider-gated', async ({ page, request }) => {
    await page.goto('/story-card');
    await expect(page.locator('body')).toContainText('Scooter media identity');
    await expect(page.locator('body')).toContainText('Talking AI Scooter is core');
    await expect(page.locator('body')).toContainText('static/text-only mode is an honest degraded fallback');
    await expect(page.locator('body')).toContainText('backend-managed and core at key moments');

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

  test('UI does not expose secret names, raw env values, provider keys, or implementation-only file names', async ({ page }) => {
    for (const route of ['/', '/story-card', '/share', '/privacy', '/terms']) {
      await page.goto(route);
      const text = await page.locator('body').innerText();
      expect(text).not.toMatch(/OPENAI_API_KEY|GEMINI_API_KEY|ELEVENLABS_API_KEY|NETWORK_OS_SHARED_SECRET|PITCH_LAB_SHARED_SECRET/i);
      expect(text).not.toMatch(/\.env\.local|secrets\/|\.gpg/i);
      await expectNoForbiddenPromises(page);
    }
  });
});
