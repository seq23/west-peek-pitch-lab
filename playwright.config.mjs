import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER === 'true' ? undefined : {
    command: 'npm run preview:static',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      APP_ENV: 'test',
      AVATAR_PROVIDER: 'elevenlabs_video',
      AVATAR_DYNAMIC_GENERATION_ENABLED: 'false',
      VOICE_PROVIDER: 'elevenlabs',
      VOICE_DYNAMIC_GENERATION_ENABLED: 'false'
    }
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } }
  ]
});
