import { test, expect } from '@playwright/test';

async function startPractice(page) {
  await page.goto('/practice');
  await page.getByRole('textbox', { name: /^Name$/i }).fill('Avery Founder');
  await page.getByRole('textbox', { name: /^Work email$/i }).fill('avery@example.com');
  await page.getByRole('textbox', { name: /^Company or project$/i }).fill('ExampleCo');
  await page.getByRole('button', { name: /Continue to your first question/i }).click();
  await expect(page.getByRole('heading', { name: /Have a deck handy/i })).toBeVisible();
  await page.getByRole('button', { name: /Continue without a deck/i }).click();
  await expect(page.locator('[data-practice-root]')).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const geometry = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth
  }));
  expect(geometry.page).toBeLessThanOrEqual(geometry.viewport + 1);
}

test.describe('Persistent founder coaching room UX proof', () => {
  test('homepage behaves as a concise lobby with an above-fold Step 1 action', async ({ page }) => {
    await page.goto('/');
    const primary = page.locator('[data-primary-start]');
    await expect(primary).toHaveText('Start Step 1');
    await expect(primary).toBeVisible();
    const box = await primary.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.locator('[data-scooter-stage]')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Cached \/ reusable|No paid clip per question|Optional v1\.1|Dynamic after text appears/i);
    await expectNoHorizontalOverflow(page);
  });

  test('profile and deck choices progressively reveal the coaching conversation without an empty draft', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('[data-scooter-stage]')).toBeVisible();
    await expect(page.locator('[data-practice-layout]')).toHaveAttribute('data-practice-phase', 'profile');
    await expect(page.locator('[data-story-card-panel]')).toBeHidden();
    await expect(page.locator('[data-practice-root]')).toBeHidden();

    await page.getByRole('textbox', { name: /^Name$/i }).fill('Avery Founder');
    await page.getByRole('textbox', { name: /^Work email$/i }).fill('avery@example.com');
    await page.getByRole('textbox', { name: /^Company or project$/i }).fill('ExampleCo');
    await page.getByRole('button', { name: /Continue to your first question/i }).click();

    await expect(page.locator('[data-practice-layout]')).toHaveAttribute('data-practice-phase', 'deck');
    await expect(page.getByRole('heading', { name: /Have a deck handy/i })).toBeVisible();
    await expect(page.locator('[data-story-card-panel]')).toBeHidden();

    await page.getByRole('button', { name: /Continue without a deck/i }).click();
    await expect(page.locator('[data-practice-layout]')).toHaveAttribute('data-practice-phase', 'questions');
    await expect(page.locator('[data-practice-root]')).toContainText(/What are you building/i);
    await expect(page.locator('[data-story-card-panel]')).toBeHidden();
  });

  test('first meaningful answer reveals the live Founder Story Card while Scooter remains present', async ({ page }) => {
    await startPractice(page);
    const answer = page.locator('[data-practice-root] textarea');
    await answer.fill('ExampleCo helps independent dental groups replace fragmented scheduling work with one clear operating workflow.');

    await expect(page.locator('[data-scooter-stage]')).toBeVisible();
    await expect(page.locator('[data-story-card-preview]')).toContainText('ExampleCo helps independent dental groups');
    await expect(page.locator('[data-story-card-panel]')).not.toHaveAttribute('hidden', '');
    await expect(page.locator('[data-story-draft-trigger]')).not.toHaveAttribute('hidden', '');
    await expectNoHorizontalOverflow(page);
  });

  test('responsive controls preserve navigation and mobile draft access without squeezing a third column', async ({ page }) => {
    await startPractice(page);
    await page.locator('[data-practice-root] textarea').fill('ExampleCo helps independent dental groups replace fragmented scheduling work with one clear operating workflow.');
    const width = page.viewportSize()?.width || 1280;

    if (width <= 720) {
      await expect(page.getByRole('navigation', { name: 'Session navigation' })).toBeVisible();
      await expect(page.getByLabel('Session stage')).toContainText('Practice');
      await expect(page.locator('[data-mobile-nav-toggle]')).toHaveCount(0);

      const trigger = page.locator('[data-story-draft-trigger]');
      await expect(trigger).toBeVisible();
      await trigger.click();
      await expect(page.locator('[data-story-draft-sheet]')).toBeVisible();
      await expect(page.locator('[data-story-card-sheet-content]')).toContainText('ExampleCo helps independent dental groups');
      await page.getByRole('button', { name: /Close Founder Story Card/i }).click();
      await expect(page.locator('[data-story-draft-sheet]')).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(page.locator('[data-story-card-panel]')).toBeHidden();
    } else {
      await expect(page.locator('[data-mobile-nav-toggle]')).toBeHidden();
      await expect(page.locator('[data-story-card-panel]')).toBeVisible();
      await expect(page.locator('[data-story-draft-trigger]')).toBeHidden();
    }
    await expectNoHorizontalOverflow(page);
  });
});
