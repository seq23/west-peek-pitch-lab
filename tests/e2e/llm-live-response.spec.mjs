import { test, expect } from '@playwright/test';

const baseURL = process.env.PITCH_LAB_DEPLOY_URL;
const live = ['true', '1', 'yes', 'on'].includes(String(process.env.PITCH_LAB_LIVE_LLM_E2E || '').toLowerCase());

test.skip(!live, 'Set PITCH_LAB_LIVE_LLM_E2E=true for live LLM browser proof.');
test.skip(!baseURL, 'PITCH_LAB_DEPLOY_URL is required for live LLM browser proof.');

const STORAGE_ANSWERS_KEY = 'west-peek-pitch-lab.phase3.answers.v1';
const STORAGE_PROFILE_KEY = 'west-peek-pitch-lab.founder-profile.v1';
const STORAGE_DECK_CONTEXT_KEY = 'west-peek-pitch-lab.deck-context.v1';
const STORAGE_AI_CARD_KEY = 'west-peek-pitch-lab.phase4.ai-story-card.v1';

const answers = {
  what_building: 'West Peek Pitch Lab helps founders turn scattered company context into a clear Founder Story Packet and a 60-second story people can repeat.',
  who_for: 'It is for founder-led companies preparing for investor, customer, operator, or strategic partner conversations.',
  painful_problem: 'The painful problem is that strong founders often know the product but cannot explain the urgent customer, proof, and ask clearly enough for useful relationship routing.',
  why_now: 'AI has made pitch iteration faster, but trusted networks still need a concise human-readable story before they can help.',
  founder_edge: 'The team combines AI product building, capital markets experience, founder coaching, and West Peek relationship network context.',
  proof_traction: 'The current proof includes a deployed pitch-practice app, working story-card flow, runtime media provider contracts, and Network OS handoff wiring.',
  help_needed: 'The founder needs design partners, founder-friendly operators, and investors who can pressure-test the wedge and relationship routing.',
  anything_else: 'This live E2E proof verifies that AI Scooter talks back with a real provider-backed response in the deployed browser app.'
};

function deployedUrl(path = '/') {
  return new URL(path, baseURL).toString();
}

function combinedStoryText(body) {
  return JSON.stringify(body || {}).toLowerCase();
}

async function seedFounderSession(page) {
  await page.addInitScript(({ answersKey, profileKey, deckKey, answers }) => {
    window.localStorage.setItem(answersKey, JSON.stringify(answers));
    window.localStorage.setItem(profileKey, JSON.stringify({
      name: 'Gauntlet Live Founder',
      email: 'gauntlet-live-founder@example.com',
      companyName: 'Gauntlet Live Company',
      website: 'https://example.com'
    }));
    window.localStorage.setItem(deckKey, JSON.stringify({ deck_provided: false, deck_context_used: false }));
  }, { answersKey: STORAGE_ANSWERS_KEY, profileKey: STORAGE_PROFILE_KEY, deckKey: STORAGE_DECK_CONTEXT_KEY, answers });
}

async function expectNoSecretOrForbiddenText(page) {
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/OPENAI_API_KEY|GEMINI_API_KEY|NETWORK_OS_SHARED_SECRET|DID_API_KEY|HEYGEN_API_KEY|FISH_API_KEY|authorization|Bearer\s|sk-[A-Za-z0-9]/i);
  expect(text).not.toMatch(/guaranteed funding|guaranteed meeting|guaranteed intro|fundability score|\b\d{1,3}\s*\/\s*100\b/i);
}

test.describe('Live LLM response E2E — deployed AI Scooter talks back', () => {
  test('deployed story-card API returns a real schema-backed AI Scooter response', async ({ request }) => {
    const response = await request.post(deployedUrl('/api/pitch/story-card'), { data: { answers } });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const text = combinedStoryText(body);
    expect(body.aiEnhanced).toBe(true);
    expect(body.status).toBe('ai_story_card_ready');
    expect(body.storyCard?.oneLinePitch).toBeTruthy();
    expect(body.critique?.whatIsClear).toBeTruthy();
    expect(Array.isArray(body.storyStrengthSignals)).toBe(true);
    expect(text).toMatch(/founder|pitch|story|relationship|customer|investor|operator|west peek|pitch lab/);
    expect(JSON.stringify(body)).not.toMatch(/OPENAI_API_KEY|GEMINI_API_KEY|NETWORK_OS_SHARED_SECRET|authorization|Bearer\s|sk-[A-Za-z0-9]/i);
    expect(JSON.stringify(body)).not.toMatch(/guaranteed funding|guaranteed meeting|guaranteed intro|fundability score|\b\d{1,3}\s*\/\s*100\b/i);
  });

  test('deployed browser journey triggers live LLM and renders AI Scooter response in the UI', async ({ page }) => {
    await seedFounderSession(page);
    await page.goto(deployedUrl('/story-card'));
    await page.getByRole('button', { name: /Generate AI Pitch Story Card/i }).click();
    const root = page.locator('[data-ai-story-card-root]');
    await expect(root).toContainText('AI-enhanced Pitch Story Card', { timeout: 45_000 });
    await expect(root).toContainText(/AI Scooter critique|AI Scooter final summary|Story Strength/i);
    await expect(root).toContainText(/Founder|pitch|story|relationship|customer|investor|operator|West Peek|Pitch Lab/i);
    await expect(page.locator('[data-final-scooter-summary]')).toContainText(/AI Scooter final summary/i);
    const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || 'null'), STORAGE_AI_CARD_KEY);
    expect(stored?.aiEnhanced).toBe(true);
    expect(stored?.storyCard?.oneLinePitch).toBeTruthy();
    await expectNoSecretOrForbiddenText(page);
  });
});
