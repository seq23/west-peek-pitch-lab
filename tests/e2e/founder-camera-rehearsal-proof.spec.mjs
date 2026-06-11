import { test, expect } from '@playwright/test';

const STORAGE_ANSWERS_KEY = 'west-peek-pitch-lab.phase3.answers.v1';
const STORAGE_PROFILE_KEY = 'west-peek-pitch-lab.founder-profile.v1';
const STORAGE_DECK_CONTEXT_KEY = 'west-peek-pitch-lab.deck-context.v1';
const STORAGE_REHEARSAL_TAKES_KEY = 'west-peek-pitch-lab.practice-out-loud.takes.v2';
const STORAGE_SELECTED_REHEARSAL_KEY = 'west-peek-pitch-lab.practice-out-loud.selected.v2';

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

async function seedFounderSession(page) {
  await page.addInitScript(({ answersKey, profileKey, deckKey, founderAnswers }) => {
    window.localStorage.setItem(answersKey, JSON.stringify(founderAnswers));
    window.localStorage.setItem(profileKey, JSON.stringify({ name: 'Avery Founder', email: 'avery@example.com', companyName: 'ExampleCo', website: 'https://example.com' }));
    window.localStorage.setItem(deckKey, JSON.stringify({ deck_provided: false, deck_context_used: false }));
  }, { answersKey: STORAGE_ANSWERS_KEY, profileKey: STORAGE_PROFILE_KEY, deckKey: STORAGE_DECK_CONTEXT_KEY, founderAnswers: answers });
}

async function openRehearsalRoom(page) {
  await seedFounderSession(page);
  await page.goto('/story-card');
  await expect(page.locator('.camera-practice')).toContainText('Camera Room Opens');
  await expect(page.locator('[data-camera-status]')).toContainText('No video uploads from this screen');
}

test.use({
  permissions: ['camera', 'microphone'],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
  }
});

test.describe('Founder Practice Out Loud camera rehearsal proof', () => {
  test('happy path opens camera, records a local take, plays it back, selects it, and persists consented metadata', async ({ page }) => {
    await openRehearsalRoom(page);

    await page.getByRole('button', { name: /Turn on camera\/mic/i }).click();
    await expect(page.locator('[data-camera-status]')).toContainText('Camera/mic are on locally', { timeout: 10000 });
    await expect(page.locator('[data-camera-preview]')).toBeVisible();

    await page.locator('[data-rehearsal-transcript]').fill('We help founders sharpen a pitch story so the customer, pain, proof, and next useful relationship are clear before sharing. We need introductions to design partners and operators who understand founder workflow pain.');
    await page.getByRole('button', { name: /Start 3-second countdown/i }).click();
    await expect(page.locator('[data-countdown-display]')).toContainText(/Recording|Go|3|2|1/i, { timeout: 8000 });
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: /Stop take/i }).click();
    await expect(page.locator('[data-camera-status]')).toContainText('Take saved locally', { timeout: 15000 });
    await expect(page.locator('[data-recording-playback]')).toBeVisible();
    await expect(page.locator('[data-take-list]')).toContainText(/Take 1|Choose best|Selected/i);
    await expect(page.locator('[data-coaching-review]')).toContainText('AI Scooter review of selected take');

    await page.getByRole('button', { name: /Save transcript to selected take/i }).click();
    await expect(page.locator('[data-transcript-status]')).toContainText('Transcript saved to selected take');
    await page.getByLabel(/Include my selected rehearsal take transcript\/status/i).check();
    await expect(page.locator('[data-rehearsal-consent-status]')).toContainText('will be included');

    const selected = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || 'null'), STORAGE_SELECTED_REHEARSAL_KEY);
    expect(selected?.id).toMatch(/^take-/);
    expect(selected?.selectedWithConsent).toBe(true);
    const takes = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || '{"takes":[]}'), STORAGE_REHEARSAL_TAKES_KEY);
    expect(takes.takes.length).toBeGreaterThan(0);
    expect(takes.takes[0].transcript).toContain('customer, pain, proof');

    await page.reload();
    await expect(page.locator('[data-rehearsal-consent-status]')).toContainText('Selected take context is marked for packet inclusion');
    await page.goto('/share');
    await expect(page.locator('.founder-story-packet')).toContainText('Selected rehearsal take transcript/status included');
    await expect(page.getByLabel(/Include my selected Practice Out Loud take/i)).toBeChecked();
  });

  test('delete and redo clears selected take state and removes consented rehearsal context from share preview', async ({ page }) => {
    await openRehearsalRoom(page);
    await page.addInitScript(() => {});
    await page.getByRole('button', { name: /Turn on camera\/mic/i }).click();
    await expect(page.locator('[data-camera-status]')).toContainText('Camera/mic are on locally', { timeout: 10000 });
    await page.locator('[data-rehearsal-transcript]').fill('This is a short selected take that should be deleted before sharing.');
    await page.getByRole('button', { name: /Start 3-second countdown/i }).click();
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: /Stop take/i }).click();
    await expect(page.locator('[data-camera-status]')).toContainText('Take saved locally', { timeout: 15000 });
    await page.getByLabel(/Include my selected rehearsal take transcript\/status/i).check();
    await page.getByRole('button', { name: /Delete/i }).first().click();
    await expect(page.locator('[data-camera-status]')).toContainText('Take deleted from this browser');
    await expect(page.locator('[data-take-list]')).toContainText('No takes recorded yet');
    const selected = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_SELECTED_REHEARSAL_KEY);
    expect(selected).toBe('null');
    await page.goto('/share');
    await expect(page.locator('.founder-story-packet')).toContainText('No rehearsal take selected');
    await expect(page.getByLabel(/Include my selected Practice Out Loud take/i)).toBeDisabled();
  });
});

test.describe('Founder Practice Out Loud fallback paths', () => {
  test('camera permission denial fails honestly and keeps manual transcript path available', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: { getUserMedia: () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError')) }
      });
    });
    await openRehearsalRoom(page);
    await page.getByRole('button', { name: /Turn on camera\/mic/i }).click();
    await expect(page.locator('[data-camera-status]')).toContainText('Camera permission was unavailable or denied');
    await expect(page.locator('[data-rehearsal-transcript]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Save transcript to selected take/i })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/uploaded successfully|video submitted|avatar video generated successfully/i);
  });

  test('MediaRecorder unavailable degrades honestly without fake recording success', async ({ page }) => {
    await page.addInitScript(() => {
      class FakeStream { getTracks() { return []; } }
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: { getUserMedia: () => Promise.resolve(new FakeStream()) }
      });
      Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: undefined });
      HTMLMediaElement.prototype.play = () => Promise.resolve();
    });
    await openRehearsalRoom(page);
    await page.getByRole('button', { name: /Turn on camera\/mic/i }).click();
    await expect(page.locator('[data-camera-status]')).toContainText('Camera/mic are on locally');
    await page.getByRole('button', { name: /Start 3-second countdown/i }).click();
    await expect(page.locator('[data-camera-status]')).toContainText('Local recording is unavailable in this browser', { timeout: 10000 });
    await expect(page.locator('[data-recording-playback]')).toBeHidden();
    await expect(page.locator('[data-take-list]')).toContainText('No takes recorded yet');
    await expect(page.locator('body')).not.toContainText(/Take saved locally|uploaded successfully/i);
  });
});
