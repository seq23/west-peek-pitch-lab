import { test, expect } from '@playwright/test';

const baseURL = process.env.PITCH_LAB_DEPLOY_URL;
test.skip(!baseURL, 'PITCH_LAB_DEPLOY_URL is required.');

function deployedUrl(path = '/') {
  return new URL(path, baseURL).toString();
}

async function expectNoInternalLanguage(page) {
  await expect(page.locator('body')).not.toContainText(/render job|provider key|OPENAI_API_KEY|GEMINI_API_KEY|ELEVENLABS_API_KEY|NETWORK_OS_SHARED_SECRET/i);
  await expect(page.locator('body')).not.toContainText(/guaranteed funding|guaranteed meeting|guaranteed intro|guaranteed investment review/i);
}

async function seedCompletePracticeSession(page) {
  await page.addInitScript(() => {
    const answers = {
      what_building: 'West Peek Pitch Lab helps founders turn rough company context into a clear story investors, customers, and partners can repeat.',
      who_for: 'Pre-seed and seed-stage founders who need clearer pitch language before sharing with strategic investors or partners.',
      painful_problem: 'Founders know what they are building, but their story is often too vague for useful relationship routing.',
      why_now: 'AI tools let founders iterate faster, but trusted relationship routing still depends on a story humans can understand.',
      founder_edge: 'The founders combine relationship access, capital markets experience, and direct exposure to pitch quality gaps.',
      proof_traction: 'The team has a working prototype, a founder network, early users, and structured customer discovery notes.',
      help_needed: 'They want introductions to founder-friendly operators, early design partners, and investors who understand workflow software.',
      anything_else: 'No deck is uploaded; this manual context should help AI Scooter understand founder priorities.'
    };
    window.localStorage.setItem('west-peek-pitch-lab.phase3.answers.v1', JSON.stringify(answers));
    window.localStorage.setItem('west-peek-pitch-lab.founder-profile.v1', JSON.stringify({
      name: 'Avery Founder',
      email: 'avery@example.com',
      companyName: 'ExampleCo',
      website: 'https://example.com'
    }));
    window.localStorage.setItem('west-peek-pitch-lab.deck-context.v1', JSON.stringify({ deck_provided: false, deck_context_used: false }));
  });
}

async function seedAiStoryCard(page) {
  await seedCompletePracticeSession(page);
  await page.addInitScript(() => {
    window.localStorage.setItem('west-peek-pitch-lab.phase4.ai-story-card.v1', JSON.stringify({
      generatedAt: new Date().toISOString(),
      storyCard: {
        oneLinePitch: 'West Peek Pitch Lab helps founders turn rough context into a pitch story people can repeat.',
        companySummary: 'ExampleCo is building a guided pitch-practice room for founders who need clearer story, proof, and relationship routing.',
        whoItHelps: 'Early-stage founders preparing for customers, partners, operators, or investor conversations.',
        problem: 'Strong founders often lose momentum because their story is too hard to repeat.',
        proofTraction: 'Prototype built, early users identified, and structured customer discovery underway.',
        founderEdge: 'The team understands founder storytelling, capital conversations, and relationship routing.',
        whyNow: 'AI can speed up story iteration while trusted networks still require clear human language.',
        biggestStoryGap: 'The proof point needs to become more concrete before sharing.',
        strongestStoryEdge: 'The founder edge is specific and credible.',
        nextSteps: 'Add one concrete traction point, tighten the customer language, and rehearse a 60-second version.',
        suggestedNextRelationships: 'Design partners, founder-friendly operators, and investors who understand workflow tools.'
      }
    }));
  });
}

test.describe('Post-deploy Pitch Lab journey gauntlet', () => {
  test('deployed shell loads core routes, canonical AI Scooter presence, and policy disclosures', async ({ page }) => {
    await page.goto(deployedUrl('/'));
    await expect(page.locator('body')).toContainText('AI Scooter');
    await expect(page.locator('body')).toContainText('Good people should meet good people');
    await expect(page.locator('body')).toContainText('Good products need good stories');
    await expect(page.locator('.avatar-photo').first()).toHaveAttribute('src', '/assets/avatar/scooter-avatar-source.png');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('[data-scooter-companion]').first()).toBeVisible();
    await expectNoInternalLanguage(page);

    for (const path of ['/terms', '/privacy', '/ai-disclosure', '/founder-network-notice', '/data-consent', '/contact', '/delete-my-info']) {
      await page.goto(deployedUrl(path));
      await expect(page.locator('body')).toContainText(/AI Scooter|West Peek|Founder|Privacy|Consent|Contact/i);
      await expectNoInternalLanguage(page);
    }
  });

  test('deployed practice page hydrates beyond static shell and exposes founder guidance', async ({ page }) => {
    await page.goto(deployedUrl('/practice'));
    await expect(page.locator('[data-founder-profile-gate]')).not.toContainText('Loading guided practice flow');
    await expect(page.locator('[data-founder-profile-gate]')).toContainText(/Start here|Enter your email|founder profile/i);
    await expect(page.getByRole('textbox', { name: /Name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Email/i })).toBeVisible();
    await expect(page.getByLabel(/Company name/i)).toBeVisible();
    await expect(page.locator('body')).toContainText(/Next:|Hints on every answer|Next step always visible/i);
    await expect(page.locator('body')).toContainText(/Optional deck-as-context|private session context|answers stay private/i);
    await expectNoInternalLanguage(page);
  });

  test('deployed practice journey advances through profile, deck choice, prompts, helpers, and local persistence', async ({ page }) => {
    await page.goto(deployedUrl('/practice'));
    await page.getByRole('textbox', { name: /Name/i }).fill('Avery Founder');
    await page.getByRole('textbox', { name: /Email/i }).fill('avery@example.com');
    await page.getByLabel(/Company name/i).fill('ExampleCo');
    await page.getByRole('button', { name: /Start AI Scooter practice/i }).click();

    await expect(page.locator('body')).toContainText(/Optional deck-as-context|deck-as-context/i);
    await page.getByRole('button', { name: /No deck/i }).click();
    await expect(page.locator('body')).toContainText(/Why Scooter asks|Strong answer|Example|Avoid/i);
    await expect(page.locator('body')).toContainText(/What are you building/i);
    await page.getByRole('textbox').last().fill('West Peek Pitch Lab helps founders turn rough company context into a clear, repeatable story for useful relationship routing.');
    await expect(page.locator('body')).toContainText(/Ready for next question|Next question/i);

    const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('west-peek-pitch-lab.founder-profile.v1') || '{}'));
    expect(stored.email).toBe('avery@example.com');
    await expectNoInternalLanguage(page);
  });

  test('deployed Story Card page proves text-first media lane, Practice Out Loud guidance, and local rehearsal states', async ({ page }) => {
    await seedCompletePracticeSession(page);
    await page.goto(deployedUrl('/story-card'));
    await expect(page.locator('body')).toContainText('Story Strength Snapshot');
    await expect(page.locator('body')).toContainText('Copy Pitch Story Card');
    await expect(page.locator('body')).toContainText(/Text first|Scooter final summary follows|copy\/share never wait/i);
    await expect(page.locator('body')).toContainText(/Practice Out Loud|Camera Room Opens|countdown|record one or more takes|choose the best take/i);
    await expect(page.locator('body')).toContainText(/Talking AI Scooter is core|required at the welcome, final story summary, and share close/i);
    await expectNoInternalLanguage(page);
  });

  test('deployed AI Story Card transaction produces honest failure or schema-backed success without blocking on media', async ({ page }) => {
    await seedCompletePracticeSession(page);
    await page.goto(deployedUrl('/story-card'));
    await page.getByRole('button', { name: /Generate AI Pitch Story Card/i }).click();

    const root = page.locator('[data-ai-story-card-root]');
    await expect(root).toContainText(/AI-enhanced Pitch Story Card|AI coaching is unavailable|No fake AI output was generated|not completed|unavailable/i, { timeout: 15000 });
    await expect(page.locator('body')).toContainText(/Text appears first|text-first|Scooter.*summary follows|media summary/i);
    await expect(page.locator('body')).not.toContainText(/fake AI output generated|guaranteed investment review/i);
    await expectNoInternalLanguage(page);
  });

  test('deployed share gate blocks early sharing and preserves explicit founder consent boundary', async ({ page }) => {
    await page.goto(deployedUrl('/share'));
    await expect(page.locator('body')).toContainText(/Start with your founder profile|Generate your AI Pitch Story Card first|Founder Story Packet/i);
    await expect(page.locator('body')).not.toContainText(/shared with West Peek for network review|pending_network_review/i);

    await seedAiStoryCard(page);
    await page.goto(deployedUrl('/share'));
    await expect(page.locator('body')).toContainText(/Share your Founder Story Packet with West Peek|Founder Story Packet|Share only if you choose/i);
    await expect(page.locator('body')).toContainText(/Practice Out Loud|Deck provided|Relationship routing/i);
    await expect(page.locator('input[name="shareWithWestPeek"]')).toBeVisible();
    await expectNoInternalLanguage(page);
  });

  test('deployed MVP v1 media moments exist without requiring live provider renders', async ({ page }) => {
    await page.goto(deployedUrl('/practice'));
    await expect(page.locator('[data-scooter-companion]').first()).toContainText(/AI Scooter session|Listening/i);
    await expect(page.locator('body')).toContainText(/AI Scooter is listening|persistent|private pitch-practice room/i);

    await page.goto(deployedUrl('/story-card'));
    await expect(page.locator('[data-scooter-companion]').first()).toContainText(/Final summary|AI Scooter is reviewing your story/i);
    await expect(page.locator('body')).toContainText(/Required talking Scooter moment|final story summary|text carries the detailed artifact/i);

    await page.goto(deployedUrl('/share'));
    await expect(page.locator('[data-scooter-companion]').first()).toContainText(/Share close|share decision|AI Scooter/i);
    await expect(page.locator('body')).toContainText(/keep practicing privately|share with West Peek|No guarantees/i);
    await expectNoInternalLanguage(page);
  });
});
