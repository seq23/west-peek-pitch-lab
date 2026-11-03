import { test, expect } from '@playwright/test';

const baseURL = process.env.PITCH_LAB_DEPLOY_URL;
test.skip(!baseURL, 'PITCH_LAB_DEPLOY_URL is required.');

const SECRET_OR_INTERNAL_RE = /OPENAI_API_KEY|GEMINI_API_KEY|NETWORK_OS_SHARED_SECRET|ELEVENLABS_API_KEY|DID_API_KEY|HEYGEN_API_KEY|MAKEUGC_API_KEY|wrangler|stack trace|src\/server|process\.env/i;
const FAKE_SUCCESS_RE = /avatarReady\s*[:=]\s*true|voiceReady\s*[:=]\s*true|guaranteed funding|guaranteed meeting|guaranteed intro|guaranteed investment review/i;

async function requestJson(request, path, options = {}) {
  const response = await request.fetch(new URL(path, baseURL).toString(), options);
  const text = await response.text();
  let body = {};
  try { body = JSON.parse(text); } catch {}
  return { response, body, text };
}

function expectSafeBody(text) {
  expect(text).not.toMatch(SECRET_OR_INTERNAL_RE);
  expect(text).not.toMatch(FAKE_SUCCESS_RE);
}

const completeAnswers = {
  build: 'West Peek Pitch Lab helps founders turn rough company context into a clear story people can repeat.',
  audience: 'Early-stage founders preparing for customer, investor, operator, or partner conversations.',
  problem: 'Founders often know what they mean, but the story is too vague for useful relationship routing.',
  traction: 'The product has a working prototype, early user discovery, and clear next design-partner targets.',
  founderEdge: 'The founders understand capital conversations, relationship routing, and pitch clarity gaps from direct experience.',
  whyNow: 'AI makes iteration faster, while trusted networks still need a concise human-readable story.',
  ask: 'The founder wants warm introductions to design partners, operators, and founder-friendly investors.'
};

const completeStoryCard = {
  oneLinePitch: 'ExampleCo helps founders turn raw context into a pitch story people can repeat.',
  companySummary: 'ExampleCo is a guided pitch-practice room for early-stage founders.',
  whoItHelps: 'Founders preparing for partner, customer, operator, or investor conversations.',
  problem: 'Their story is often too hard to repeat.',
  proofTraction: 'Prototype built, early users identified, and discovery underway.',
  founderEdge: 'The team understands founder storytelling and relationship routing.',
  whyNow: 'AI speeds iteration while human networks still require clarity.',
  biggestStoryGap: 'The proof point should be more specific.',
  strongestStoryEdge: 'The founder edge is credible.',
  nextSteps: 'Add one concrete proof point and rehearse the 60-second version.',
  suggestedNextRelationships: 'Design partners and founder-friendly operators.'
};

test.describe('Post-deploy functions honesty gauntlet', () => {
  test('status endpoints do not leak secrets or fake readiness', async ({ request }) => {
    for (const path of ['/api/avatar/status', '/api/voice/status']) {
      const { response, text } = await requestJson(request, path);
      expect([200, 404, 503]).toContain(response.status());
      expectSafeBody(text);
    }
  });

  test('malformed transaction endpoints reject or fail honestly', async ({ request }) => {
    for (const path of ['/api/pitch/share']) {
      const { response, text } = await requestJson(request, path, { method: 'POST', data: { bad: true } });
      expect([400, 405, 422, 503]).toContain(response.status());
      expectSafeBody(text);
    }
    // Paid endpoints refuse any caller without a server-signed session token (paidEndpointGuard.mjs).
    for (const path of ['/api/pitch/story-card', '/api/pitch/analyze', '/api/avatar/render', '/api/voice/render']) {
      const { response, text } = await requestJson(request, path, { method: 'POST', data: { bad: true } });
      expect(response.status()).toBe(401);
      expectSafeBody(text);
    }
  });

  test('story-card endpoint needs a session token and a passed challenge before any paid LLM call', async ({ request }) => {
    const anon = await requestJson(request, '/api/pitch/story-card', { method: 'POST', data: { answers: completeAnswers } });
    expect(anon.response.status()).toBe(401);
    expect(anon.body.aiEnhanced).not.toBe(true);
    const session = await requestJson(request, '/api/session');
    expect(session.response.status()).toBe(200);
    expect(String(session.body.sessionToken || '')).toMatch(/^s1\./);
    const noChallenge = await requestJson(request, '/api/pitch/story-card', { method: 'POST', headers: { 'x-pitch-lab-session': session.body.sessionToken }, data: { answers: completeAnswers } });
    expect(session.body.turnstileSiteKey ? [403] : [200, 400, 429, 502, 503]).toContain(noChallenge.response.status());
    expectSafeBody(noChallenge.text);
  });

  test('share endpoint requires consented Founder Story Packet payload and never creates impossible success', async ({ request }) => {
    const invalid = await requestJson(request, '/api/pitch/share', { method: 'POST', data: { founder: { email: 'avery@example.com' } } });
    expect([400, 503]).toContain(invalid.response.status());
    expectSafeBody(invalid.text);

    const validish = await requestJson(request, '/api/pitch/share', {
      method: 'POST',
      data: {
        founder: { name: 'Avery Founder', email: 'avery@example.com', companyName: 'ExampleCo', website: 'https://example.com' },
        storyCard: completeStoryCard,
        consent: {
          shareWithWestPeek: true,
          includeDeckFile: false,
          includePracticeVideo: false,
          consentVersion: 'pitch-lab-share-v1',
          consentedAt: new Date().toISOString(),
          disclaimersAcknowledged: [
            'not_investment_advice',
            'no_funding_guarantee',
            'no_meeting_guarantee',
            'no_intro_guarantee',
            'ai_generated_review_required'
          ]
        },
        deckContext: { deck_provided: false },
        profileCapture: {},
        aiPersona: 'AI Scooter'
      }
    });
    expect([200, 400, 503]).toContain(validish.response.status());
    expectSafeBody(validish.text);
    if (validish.response.status() === 200) {
      expect(validish.body.ok).toBe(true);
      expect(validish.body.contact_created).not.toBe(true);
      expect(String(validish.body.review_status || '')).toMatch(/pending|review|stored/i);
    } else {
      expect(validish.body.ok).not.toBe(true);
      expect(JSON.stringify(validish.body)).toMatch(/NETWORK_OS|VALIDATION|disabled|missing|unavailable|not configured/i);
    }
  });

  test('avatar and voice render endpoints never render caller text', async ({ request }) => {
    const text = 'Here is the concise AI Scooter final coaching summary for this founder story.';
    const session = await requestJson(request, '/api/session');
    for (const path of ['/api/avatar/render', '/api/voice/render']) {
      const anon = await requestJson(request, path, { method: 'POST', data: { moment: 'final_summary', text } });
      expect(anon.response.status()).toBe(401);
      const withSession = await requestJson(request, path, { method: 'POST', headers: { 'x-pitch-lab-session': session.body.sessionToken || '' }, data: { moment: 'final_summary', text } });
      expect(withSession.response.status()).toBe(403);
      expectSafeBody(withSession.text);
    }
  });
});
