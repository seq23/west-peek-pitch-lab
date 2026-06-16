import { test, expect } from '@playwright/test';

const live = ['1','true','yes','on'].includes(String(process.env.PITCH_LAB_LIVE_MEDIA_PROOF || '').toLowerCase());
const STORAGE_ANSWERS_KEY = 'west-peek-pitch-lab.phase3.answers.v1';
const STORAGE_PROFILE_KEY = 'west-peek-pitch-lab.founder-profile.v1';
const STORAGE_DECK_CONTEXT_KEY = 'west-peek-pitch-lab.deck-context.v1';

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

async function seedSession(page) {
  await page.addInitScript(({ answersKey, profileKey, deckKey, founderAnswers }) => {
    window.localStorage.setItem(answersKey, JSON.stringify(founderAnswers));
    window.localStorage.setItem(profileKey, JSON.stringify({ name: 'Avery Founder', email: 'avery@example.com', companyName: 'ExampleCo', website: 'https://example.com' }));
    window.localStorage.setItem(deckKey, JSON.stringify({ deck_provided: false, deck_context_used: false }));
  }, { answersKey: STORAGE_ANSWERS_KEY, profileKey: STORAGE_PROFILE_KEY, deckKey: STORAGE_DECK_CONTEXT_KEY, founderAnswers: answers });
}

async function postJson(request, path, body) {
  const response = await request.post(path, { data: body });
  let json = {};
  try { json = await response.json(); } catch {}
  return { response, json };
}

test.describe('MVP v1 live media proof — headed when requested', () => {
  test('browser shows the locked talking-Scooter media journey slots without static-shell failure', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('[data-scooter-companion]').first()).toContainText(/AI Scooter session|Listening/i);
    await expect(page.locator('body')).toContainText(/Private coaching room|Build the story with Scooter/i);
    await expect(page.locator('[data-founder-profile-gate]')).not.toContainText('Loading guided practice flow');

    await seedSession(page);
    await page.goto('/story-card');
    await expect(page.locator('[data-scooter-companion]').first()).toContainText(/Final summary|AI Scooter is reviewing your story/i);
    await expect(page.locator('body')).toContainText(/Founder Story Card|Scooter final summary|Required talking Scooter moment/i);
    await expect(page.locator('body')).toContainText(/Practice Out Loud|record one or more takes|choose the best take/i);

    await page.goto('/share');
    await expect(page.locator('[data-scooter-companion]').first()).toContainText(/Share close|AI Scooter/i);
    await expect(page.locator('body')).toContainText(/keep practicing privately|share with West Peek|No guarantees/i);
  });

  test('media APIs prove real configured voice/avatar behavior or fail honestly', async ({ request }) => {
    const voiceStatus = await request.get('/api/voice/status');
    const voice = await voiceStatus.json();
    expect(voice).toHaveProperty('status');

    const avatarStatus = await request.get('/api/avatar/status');
    const avatar = await avatarStatus.json();
    expect(avatar).toHaveProperty('status');

    const voiceRender = await postJson(request, '/api/voice/render', {
      moment: 'welcome',
      text: 'Welcome to West Peek Pitch Lab. Good products need good stories. Tell me what you are building, and let us sharpen the story.'
    });
    expect([200, 400, 503]).toContain(voiceRender.response.status());

    const avatarRender = await postJson(request, '/api/avatar/render', {
      moment: 'final_summary',
      text: 'Here is what I am hearing. The customer is clear, but the proof needs to get sharper before you share. Add one concrete traction point so the story is easier to believe.'
    });
    expect([202, 400, 429, 503]).toContain(avatarRender.response.status());

    if (live) {
      expect(voice.configured, `Live proof requires ElevenLabs voice configured. Status: ${JSON.stringify(voice)}`).toBeTruthy();
      expect(voiceRender.response.status(), `Live proof requires a real voice render. Body: ${JSON.stringify(voiceRender.json)}`).toBe(200);
      expect(voiceRender.json.voiceReady).toBe(true);
      expect(String(voiceRender.json.audioBase64 || '').length).toBeGreaterThan(1000);

      expect(avatar.configured, `Live proof requires a configured/proven avatar provider. Status: ${JSON.stringify(avatar)}`).toBeTruthy();
      expect(avatarRender.response.status(), `Live proof requires the avatar provider to queue or return a real render contract. Body: ${JSON.stringify(avatarRender.json)}`).toBe(202);
      expect(avatarRender.json.status).toMatch(/avatar_render_queued|avatar_ready/);
    } else {
      expect(JSON.stringify(voiceRender.json) + JSON.stringify(avatarRender.json)).not.toMatch(/fake.*success|avatarReady":true.*unavailable|voiceReady":true.*unavailable/i);
    }
  });

  test('Story Card is text-first and live media proof reveals final summary provider state in-browser', async ({ page }) => {
    await seedSession(page);
    await page.goto('/story-card');
    await page.getByRole('button', { name: /Generate my Founder Story Card/i }).click();
    const root = page.locator('[data-ai-story-card-root]');
    await expect(root).toContainText(/AI-enhanced Founder Story Card|AI coaching is unavailable|No fake AI output was generated/i, { timeout: live ? 30000 : 15000 });
    await expect(page.locator('body')).toContainText(/Text appears first|text-first|talking summary follows/i);

    if (live) {
      await expect(root).toContainText('AI-enhanced Founder Story Card', { timeout: 30000 });
      await expect(page.locator('[data-avatar-lane]')).toContainText(/queued|ready|preparing|unavailable/i, { timeout: 30000 });
    } else {
      await expect(page.locator('body')).not.toContainText(/avatar video generated successfully/i);
    }
  });
});
