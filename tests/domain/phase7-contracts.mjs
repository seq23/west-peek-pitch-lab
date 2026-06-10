import assert from 'node:assert/strict';
import { buildPitchLabNetworkPayload } from '../../src/server/network/pitchLabHandoffContract.mjs';
import { submitPitchLabShare } from '../../src/server/network/networkOsClient.mjs';

const storyCard = {
  oneLinePitch: 'A clear AI pitch tool for founders.',
  companySummary: 'West Peek Pitch Lab helps founders turn rough ideas into a crisp story.',
  customer: 'Early stage founders who need a warmer pitch room.',
  problem: 'Good companies often explain themselves poorly.',
  solution: 'A guided AI Scooter coaching flow creates a Pitch Story Card.',
  proofTraction: 'The workflow produces structured pitch sections and reviewable outputs.',
  founderEdge: 'The founder understands relationship-driven storytelling.',
  whyNow: 'AI can make high-quality pitch prep more accessible now.',
  biggestStoryGap: 'The strongest wedge needs sharper proof.',
  biggestObjection: 'Reviewers may ask whether the founder can reach customers cheaply.',
  suggestedNextRelationships: 'Founder-friendly investors, customer discovery leads, operators.',
  nextSteps: 'Refine proof, test story with five prospects, then share with West Peek.'
};
const founder = { name: 'Taylor Founder', email: 'founder@example.com', companyName: 'Founder Co', website: 'https://example.com' };
const consent = { shareWithWestPeek: true, consentVersion: 'pitch-lab-share-v1', consentedAt: '2026-06-09T12:00:00.000Z' };

const built = buildPitchLabNetworkPayload({ founder, storyCard, consent, submittedAt: '2026-06-09T12:00:00.000Z' });
assert.equal(built.ok, true);
assert.equal(built.payload.source, 'pitch_lab');
assert.equal(built.payload.capture_type, 'pitch_practice');
assert.equal(built.payload.routing.person_type, 'founder');
assert.equal(built.payload.routing.trigger_intent, 'deal_flow');
assert.equal(built.payload.routing.human_review_required, true);
assert.equal(built.payload.routing.execution_allowed, false);
assert.equal(built.payload.routing.review_status, 'pending_human_review');

const noConsent = buildPitchLabNetworkPayload({ founder, storyCard, consent: { shareWithWestPeek: false } });
assert.equal(noConsent.ok, false);
assert.ok(noConsent.errors.consent.shareWithWestPeek);

const disabled = await submitPitchLabShare({ founder, storyCard, consent }, { NETWORK_OS_HANDOFF_ENABLED: 'false' });
assert.equal(disabled.ok, false);
assert.equal(disabled.error_code, 'NETWORK_OS_DISABLED');

const fakeFetch = async (_url, request) => {
  assert.equal(request.method, 'POST');
  assert.ok(request.headers['x-pitch-lab-signature']);
  assert.ok(request.headers['x-pitch-lab-submitted-at']);
  return new Response(JSON.stringify({ ok: true, intake_id: 'intake_test_123', review_status: 'pending_human_review', contact_created: false }), { status: 200, headers: { 'content-type': 'application/json' } });
};
const sent = await submitPitchLabShare({ founder, storyCard, consent }, {
  NETWORK_OS_HANDOFF_ENABLED: 'true',
  NETWORK_OS_PITCH_LAB_ENDPOINT: 'https://network.joinwestpeek.com/api/intake/pitch-lab',
  NETWORK_OS_SHARED_SECRET: 'local-test-shared-secret-1234',
  NETWORK_OS_TIMEOUT_MS: '1000'
}, fakeFetch);
assert.equal(sent.ok, true);
assert.equal(sent.review_status, 'pending_human_review');
assert.equal(sent.contact_created, false);

const autoContact = await submitPitchLabShare({ founder, storyCard, consent }, {
  NETWORK_OS_HANDOFF_ENABLED: 'true',
  NETWORK_OS_PITCH_LAB_ENDPOINT: 'https://network.joinwestpeek.com/api/intake/pitch-lab',
  NETWORK_OS_SHARED_SECRET: 'local-test-shared-secret-1234',
  NETWORK_OS_TIMEOUT_MS: '1000'
}, async () => new Response(JSON.stringify({ ok: true, intake_id: 'bad', review_status: 'pending_human_review', contact_created: true }), { status: 200 }));
assert.equal(autoContact.ok, false);
assert.equal(autoContact.error_code, 'CONTACT_AUTO_CREATE_GUARD');

console.log('PHASE 7 DOMAIN OK — consent-gated signed Network OS handoff contract is deterministic and no auto-contact success is accepted.');
