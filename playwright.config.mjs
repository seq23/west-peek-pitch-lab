import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
const evidenceMode = process.env.PITCH_LAB_EVIDENCE_MODE === '1';

export default defineConfig({
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || 'test-results',
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: evidenceMode ? 'on' : 'retain-on-failure',
    screenshot: evidenceMode ? 'on' : 'only-on-failure',
    video: evidenceMode ? 'on' : 'retain-on-failure'
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
