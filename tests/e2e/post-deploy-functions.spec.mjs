import { test, expect } from '@playwright/test';

const baseURL = process.env.PITCH_LAB_DEPLOY_URL;
test.skip(!baseURL, 'PITCH_LAB_DEPLOY_URL is required.');

async function requestJson(request, path, options = {}) {
  const response = await request.fetch(new URL(path, baseURL).toString(), options);
  let body = {};
  try { body = await response.json(); } catch {}
  return { response, body };
}

test.describe('Post-deploy functions honesty gauntlet', () => {
  test('status endpoints do not leak secrets or fake readiness', async ({ request }) => {
    for (const path of ['/api/avatar/status', '/api/voice/status']) {
      const { response, body } = await requestJson(request, path);
      expect([200, 404, 503]).toContain(response.status());
      expect(JSON.stringify(body)).not.toMatch(/OPENAI_API_KEY|GEMINI_API_KEY|NETWORK_OS_SHARED_SECRET|ELEVENLABS_API_KEY/i);
      expect(JSON.stringify(body)).not.toMatch(/false success|placeholder-ready success/i);
    }
  });

  test('transaction endpoints reject malformed payloads or fail honestly', async ({ request }) => {
    for (const path of ['/api/pitch/story-card', '/api/pitch/share', '/api/avatar/render']) {
      const { response, body } = await requestJson(request, path, { method: 'POST', data: { bad: true } });
      expect([400, 405, 503]).toContain(response.status());
      expect(JSON.stringify(body)).not.toMatch(/false success|avatarReady\s*[:=]\s*true|investment_review/i);
    }
  });
});
