import { test, expect } from '@playwright/test';

const STORAGE_ANSWERS_KEY = 'west-peek-pitch-lab.phase3.answers.v1';
const STORAGE_PROFILE_KEY = 'west-peek-pitch-lab.founder-profile.v1';
const STORAGE_DECK_CONTEXT_KEY = 'west-peek-pitch-lab.deck-context.v1';
const STORAGE_AI_CARD_KEY = 'west-peek-pitch-lab.phase4.ai-story-card.v1';
const STORAGE_SELECTED_REHEARSAL_KEY = 'west-peek-pitch-lab.practice-out-loud.selected.v2';
const STORAGE_REHEARSAL_TAKES_KEY = 'west-peek-pitch-lab.practice-out-loud.takes.v2';

const baseAnswers = {
  what_building: 'West Peek Pitch Lab helps founders turn rough company context into a clear story investors, customers, and partners can repeat.',
  who_for: 'Pre-seed and seed-stage founders who need clearer pitch language before sharing with strategic investors or partners.',
  painful_problem: 'Founders know what they are building, but their story is often too vague for useful relationship routing.',
  why_now: 'AI tools let founders iterate faster, but trusted relationship routing still depends on a story humans can understand.',
  founder_edge: 'The founders combine relationship access, capital markets experience, and direct exposure to pitch quality gaps.',
  proof_traction: 'The team has a working prototype, a founder network, early users, and structured customer discovery notes.',
  help_needed: 'They want introductions to founder-friendly operators, early design partners, and investors who understand workflow software.'
};

const fakeAiResponse = {
  aiEnhanced: true,
  generatedAt: new Date().toISOString(),
  storyCard: {
    oneLinePitch: 'West Peek Pitch Lab helps founders turn rough company context into a story the right people can repeat.',
    companySummary: 'ExampleCo gives founders a guided AI Scooter practice room for clearer pitch storytelling.',
    customer: 'Early-stage founders preparing to share with strategic partners.',
    problem: 'The pitch is often too generic to route to useful relationships.',
    solution: 'A guided coaching flow creates a Founder Story Packet.',
    proofTraction: 'Prototype, founder network, and customer discovery notes.',
    founderEdge: 'Relationship access and pitch-quality insight.',
    whyNow: 'AI can speed practice while human trust still depends on clarity.',
    biggestStoryGap: 'The proof point needs to be more concrete.',
    biggestObjection: 'A reviewer may ask whether founders will complete the flow.',
    suggestedNextRelationships: 'Founder-friendly operators and early design partners.',
    nextSteps: 'Add one traction point, rehearse out loud, and share only if ready.'
  },
  finalScooterSummary: { script: 'The story is clear enough to begin, but the proof needs to get sharper before you share it.' },
  storyStrengthSignals: [
    { category: 'Clarity', signal: 'Strong', guidance: 'The audience is understandable.' },
    { category: 'Proof / Traction', signal: 'Developing', guidance: 'Add one concrete signal.' }
  ]
};

async function seed(page, { anythingElse = '', ai = false, rehearsal = false } = {}) {
  await page.addInitScript(({ answersKey, profileKey, deckKey, aiKey, selectedKey, takesKey, answers, aiCard, useAi, useRehearsal }) => {
    const finalAnswers = { ...answers, anything_else: answers.anything_else || '' };
    window.localStorage.setItem(answersKey, JSON.stringify(finalAnswers));
    window.localStorage.setItem(profileKey, JSON.stringify({ name: 'Avery Founder', email: 'avery@example.com', companyName: 'ExampleCo', website: 'https://example.com' }));
    window.localStorage.setItem(deckKey, JSON.stringify({ deck_provided: false, deck_context_used: false }));
    if (useAi) window.localStorage.setItem(aiKey, JSON.stringify(aiCard));
    if (useRehearsal) {
      window.localStorage.setItem(takesKey, JSON.stringify({ takes: [{ id: 'take-proof', durationSeconds: 31, transcript: 'Manual transcript from a selected rehearsal take.', createdAt: new Date().toISOString(), createdAtLabel: 'Proof run' }] }));
      window.localStorage.setItem(selectedKey, JSON.stringify({ id: 'take-proof', selectedAt: new Date().toISOString(), selectedWithConsent: true, consentedAt: new Date().toISOString() }));
    }
  }, { answersKey: STORAGE_ANSWERS_KEY, profileKey: STORAGE_PROFILE_KEY, deckKey: STORAGE_DECK_CONTEXT_KEY, aiKey: STORAGE_AI_CARD_KEY, selectedKey: STORAGE_SELECTED_REHEARSAL_KEY, takesKey: STORAGE_REHEARSAL_TAKES_KEY, answers: { ...baseAnswers, anything_else: anythingElse }, aiCard: fakeAiResponse, useAi: ai, useRehearsal: rehearsal });
}

test.describe('Founder context and accessibility proof', () => {
  test('optional eighth question can be blank or filled and preserves manual context without requiring a deck', async ({ page }) => {
    await seed(page, { anythingElse: 'Avoid enterprise buyers until Q4; the near-term path is regional operators with 20 to 100 locations.' });
    await page.goto('/story-card');
    await expect(page.locator('body')).toContainText('Additional context');
    await expect(page.locator('body')).toContainText('Avoid enterprise buyers until Q4');
    await expect(page.locator('body')).toContainText('Practice Out Loud');

    const promptPayload = await page.request.post('/api/pitch/story-card', { data: { answers: { ...baseAnswers, anything_else: 'Manual context supplied instead of uploading a confidential deck.' } } });
    expect([200, 400, 503]).toContain(promptPayload.status());

    await page.context().clearCookies();
    await page.goto('/practice');
    await page.evaluate((key) => window.localStorage.setItem(key, JSON.stringify({ ...JSON.parse(window.localStorage.getItem(key) || '{}'), anything_else: '' })), STORAGE_ANSWERS_KEY);
    await page.goto('/story-card');
    await expect(page.locator('body')).toContainText('Additional context');
    await expect(page.locator('body')).not.toContainText('Minimum: 0 characters');
  });

  test('share packet includes manual context and rehearsal metadata only after explicit founder-controlled state', async ({ page }) => {
    await seed(page, { anythingElse: 'Manual confidential-deck alternative context should travel only when the founder shares.', ai: true, rehearsal: true });
    await page.goto('/share');
    await expect(page.locator('.founder-story-packet')).toContainText('Practice Out Loud');
    await expect(page.locator('.founder-story-packet')).toContainText('Best take selected:');
    await expect(page.locator('.founder-story-packet')).toContainText('Transcript saved: Yes');
    await expect(page.locator('.founder-story-packet')).toContainText('Packet inclusion consent: Yes');
    await expect(page.getByLabel(/Include my selected Practice Out Loud take/i)).toBeChecked();
    await expect(page.locator('body')).not.toContainText(/video uploaded|contact created automatically: yes|funding guaranteed/i);
  });

  test('basic keyboard and label journey is usable without relying only on glow or mouse', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toContainText('Practice');
    await expect(page.getByRole('textbox', { name: /^Name\b/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /^Email/i })).toBeVisible();
    await expect(page.getByLabel(/Company name/i)).toBeVisible();

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    await page.getByRole('textbox', { name: /^Name\b/i }).fill('Avery Founder');
    await page.getByRole('textbox', { name: /^Email/i }).fill('avery@example.com');
    await page.getByLabel(/Company name/i).fill('ExampleCo');
    await page.getByRole('button', { name: /Start AI Scooter practice/i }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('body')).toContainText(/What are you building\?|Why Scooter asks|Strong answer hint/i);
    await expect(page.locator('body')).toContainText('Answers stay in this session');
  });
});
