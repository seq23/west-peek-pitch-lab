import { test, expect } from '@playwright/test';

const baseURL = process.env.PITCH_LAB_DEPLOY_URL;
test.skip(!baseURL, 'PITCH_LAB_DEPLOY_URL is required.');

test.describe('Post-deploy Pitch Lab journey gauntlet', () => {
  test('deployed frontend supports AI Scooter journey surfaces and disclosures', async ({ page }) => {
    await page.goto(baseURL);
    await expect(page.locator('body')).toContainText('AI Scooter');
    await expect(page.locator('.avatar-photo').first()).toHaveAttribute('src', '/assets/avatar/scooter-avatar-source.png');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('[data-scooter-companion]').first()).toBeVisible();
    for (const path of ['/terms','/privacy','/ai-disclosure','/founder-network-notice','/data-consent']) {
      await page.goto(new URL(path, baseURL).toString());
      await expect(page.locator('body')).toContainText(/AI Scooter|West Peek|Founder/);
      await expect(page.locator('body')).not.toContainText('ST');
    }
  });

  test('deployed practice/profile/deck/camera/share surfaces are available without live providers', async ({ page }) => {
    await page.goto(new URL('/practice', baseURL).toString());
    await expect(page.locator('body')).toContainText('Enter your email to begin');
    await expect(page.locator('body')).toContainText('Optional deck-as-context');
    await page.goto(new URL('/story-card', baseURL).toString());
    await expect(page.locator('body')).toContainText('Practice Out Loud');
    await expect(page.locator('body')).toContainText('Text first. Video follows');
    await page.goto(new URL('/share', baseURL).toString());
    await expect(page.locator('body')).toContainText(/Founder profile|Founder Story Packet|Generate your AI Pitch Story Card first/);
  });
});
