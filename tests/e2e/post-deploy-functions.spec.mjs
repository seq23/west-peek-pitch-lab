import { test, expect } from '@playwright/test';

const baseURL = process.env.PITCH_LAB_DEPLOY_URL;
test.skip(!baseURL, 'PITCH_LAB_DEPLOY_URL is required.');

const SECRET_OR_INTERNAL_RE = /OPENAI_API_KEY|GEMINI_API_KEY|NETWORK_OS_SHARED_SECRET|ELEVENLABS_API_KEY|HEYGEN_API_KEY|MAKEUGC_API_KEY|wrangler|stack trace|src\/server|process\.env/i;
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
    for (const path of ['/api/pitch/story-card', '/api/pitch/share', '/api/avatar/render', '/api/voice/render']) {
      const { response, text } = await requestJson(request, path, { method: 'POST', data: { bad: true } });
      expect([400, 405, 422, 503]).toContain(response.status());
      expectSafeBody(text);
    }
  });

  test('story-card endpoint returns schema-backed AI output or honest provider-unavailable response', async ({ request }) => {
    const { response, body, text } = await requestJson(request, '/api/pitch/story-card', {
      method: 'POST',
      data: { answers: completeAnswers }
    });
    expect([200, 400, 502, 503]).toContain(response.status());
    expectSafeBody(text);
    if (response.status() === 200) {
      expect(body.aiEnhanced).toBe(true);
      expect(body.shareEnabled).toBe(true);
      expect(body.storyCard).toBeTruthy();
      expect(String(body.disclosure || '')).toMatch(/AI-generated|pitch coaching/i);
    } else {
      expect(body.aiEnhanced).not.toBe(true);
      expect(JSON.stringify(body)).toMatch(/unavailable|invalid|schema|provider|No fake/i);
    }
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

  test('avatar and voice render endpoints enforce moment/script controls without fake media success', async ({ request }) => {
    const avatar = await requestJson(request, '/api/avatar/render', {
      method: 'POST',
      data: { moment: 'final_summary', text: 'Here is the concise AI Scooter final coaching summary for this founder story.' }
    });
    expect([202, 400, 429, 503]).toContain(avatar.response.status());
    expectSafeBody(avatar.text);
    if (avatar.response.status() === 202) {
      expect(avatar.body.status).toMatch(/queued|avatar/i);
      expect(avatar.body.avatarReady).not.toBe(true);
    } else {
      expect(avatar.body.avatarReady).not.toBe(true);
      expect(JSON.stringify(avatar.body)).toMatch(/unavailable|disabled|not configured|cost guard|invalid/i);
    }

    const voice = await requestJson(request, '/api/voice/render', {
      method: 'POST',
      data: { moment: 'final_summary', text: 'Here is the concise AI Scooter final coaching summary for this founder story.' }
    });
    expect([200, 400, 503]).toContain(voice.response.status());
    expectSafeBody(voice.text);
    if (voice.response.status() === 200) {
      expect(voice.body.voiceReady).toBe(true);
      expect(String(voice.body.audioContentType || '')).toMatch(/audio/i);
    } else {
      expect(voice.body.voiceReady).not.toBe(true);
      expect(JSON.stringify(voice.body)).toMatch(/unavailable|disabled|not configured|invalid/i);
    }
  });
});
