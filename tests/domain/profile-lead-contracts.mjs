import assert from 'node:assert/strict';
import { buildPitchLabProfileLeadPayload } from '../../src/server/network/profileLeadContract.mjs';
import { buildPitchLabNetworkPayload } from '../../src/server/network/pitchLabHandoffContract.mjs';
import { getNetworkOsConfig, getNetworkOsProfileConfig, submitPitchLabProfileLead } from '../../src/server/network/networkOsClient.mjs';
import { readFileSync } from 'node:fs';

const founder = { name: 'Gauntlet Founder', email: 'Gauntlet@Example.com', companyName: 'Gauntlet Co', website: 'https://example.com' };
const profileConsent = { profileCaptureNoticeShown: true, consentVersion: 'pitch-lab-profile-v1', consentedAt: new Date().toISOString(), disclaimersAcknowledged: { ai_disclosure: true, answers_private_until_share: true, no_guaranteed_follow_up: true, network_review_only: true } };
const lead = buildPitchLabProfileLeadPayload({ founder, consent: profileConsent });
assert.equal(lead.ok, true);
assert.equal(lead.payload.capture_type, 'founder_profile_lead');
assert.equal(lead.payload.trigger_intent, 'relationship_routing');
assert.equal(lead.payload.execution_allowed, false);
assert.equal(lead.payload.follow_up_guaranteed, false);
assert.equal(lead.payload.founder.email, 'gauntlet@example.com');
assert.equal(JSON.stringify(lead.payload).includes('one_liner'), false, 'profile lead must not contain pitch answers');

const storyCard = { oneLinePitch:'A tool that helps founders practice clearer pitches.', companySummary:'Gauntlet Co helps founders turn rough notes into clear story packets.', customer:'Early founders with messy pitch notes.', problem:'Founders ramble and miss proof.', solution:'Guided AI Scooter coaching.', proofTraction:'Three pilot founders completed the practice flow.', founderEdge:'The team understands founder storytelling and relationship routing.', whyNow:'AI coaching makes lightweight practice easier.', biggestStoryGap:'Proof needs to be specific.', biggestObjection:'Is this just another chatbot?', suggestedNextRelationships:'Founder mentors and operator reviewers.', nextSteps:'Sharpen proof and rehearse.' };
const shareConsent = { shareWithWestPeek: true, consentVersion: 'pitch-lab-share-v1', consentedAt: new Date().toISOString(), disclaimersAcknowledged: { ai_disclosure: true, no_investment_advice: true, no_guaranteed_follow_up: true, network_review_only: true } };
const packet = buildPitchLabNetworkPayload({ founder, storyCard, consent: shareConsent, profileCapture: { intakeId:'intake_profile_123', profileId:'profile_123' } });
assert.equal(packet.ok, true);
assert.equal(packet.payload.capture_type, 'founder_story_packet');
assert.equal(packet.payload.parent_capture_type, 'founder_profile_lead');
assert.equal(packet.payload.append_to_existing_profile, true);
assert.equal(packet.payload.profile_capture_intake_id, 'intake_profile_123');
assert.equal(packet.payload.profile_id, 'profile_123');
assert.equal(packet.payload.trigger_intent, 'relationship_routing');
assert.equal(packet.payload.investment_decision, false);


const derivedFromBase = getNetworkOsProfileConfig({
  NETWORK_OS_HANDOFF_ENABLED: 'true',
  NETWORK_OS_BASE_URL: 'https://network.joinwestpeek.com/',
  NETWORK_OS_SHARED_SECRET: 'local-test-shared-secret-1234'
});
assert.equal(derivedFromBase.enabled, true);
assert.equal(derivedFromBase.intakeUrl, 'https://network.joinwestpeek.com/api/intake/pitch-lab-profile');

const derivedFromPacket = getNetworkOsProfileConfig({
  NETWORK_OS_HANDOFF_ENABLED: 'true',
  NETWORK_OS_PITCH_LAB_ENDPOINT: 'https://network.joinwestpeek.com/api/intake/pitch-lab',
  NETWORK_OS_SHARED_SECRET: 'local-test-shared-secret-1234'
});
assert.equal(derivedFromPacket.intakeUrl, 'https://network.joinwestpeek.com/api/intake/pitch-lab-profile');

const explicitProfile = getNetworkOsProfileConfig({
  NETWORK_OS_HANDOFF_ENABLED: 'false',
  NETWORK_OS_PROFILE_CAPTURE_ENABLED: 'true',
  NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT: 'https://network.joinwestpeek.com/api/intake/pitch-lab-profile',
  NETWORK_OS_SHARED_SECRET: 'local-test-shared-secret-1234'
});
assert.equal(explicitProfile.enabled, true);

const packetConfig = getNetworkOsConfig({
  NETWORK_OS_HANDOFF_ENABLED: 'true',
  NETWORK_OS_BASE_URL: 'https://network.joinwestpeek.com',
  NETWORK_OS_SHARED_SECRET: 'local-test-shared-secret-1234'
});
assert.equal(packetConfig.intakeUrl, 'https://network.joinwestpeek.com/api/intake/pitch-lab');

let observedProfileUrl = '';
const sentProfile = await submitPitchLabProfileLead({ founder, consent: profileConsent }, {
  NETWORK_OS_HANDOFF_ENABLED: 'true',
  NETWORK_OS_BASE_URL: 'https://network.joinwestpeek.com',
  NETWORK_OS_SHARED_SECRET: 'local-test-shared-secret-1234',
  NETWORK_OS_TIMEOUT_MS: '1000'
}, async (url, request) => {
  observedProfileUrl = url;
  assert.equal(request.method, 'POST');
  assert.ok(request.headers['x-pitch-lab-signature']);
  assert.ok(request.headers['x-pitch-lab-submitted-at']);
  return new Response(JSON.stringify({ ok: true, intake_id: 'intake_profile_test_123', profile_id: 'profile_test_123', review_status: 'lead_captured', database_write_status: 'created_new_profile', contact_created: false }), { status: 200, headers: { 'content-type': 'application/json' } });
});
assert.equal(observedProfileUrl, 'https://network.joinwestpeek.com/api/intake/pitch-lab-profile');
assert.equal(sentProfile.ok, true);
assert.equal(sentProfile.intake_id, 'intake_profile_test_123');
assert.equal(sentProfile.profile_id, 'profile_test_123');
assert.equal(sentProfile.database_write_status, 'created_new_profile');

const practiceFlowSource = readFileSync('src/runtime/practiceFlow.mjs', 'utf8');
assert.ok(practiceFlowSource.includes('dataset.profileSyncState'), 'profile UI must expose synced/pending state.');
assert.ok(practiceFlowSource.includes('Profile saved to West Peek Network OS'), 'profile UI must confirm remote persistence only after success.');
assert.ok(practiceFlowSource.includes('West Peek Network OS sync is pending'), 'profile UI must disclose remote sync failure without blocking practice.');

const registry = JSON.parse(readFileSync('config/env.registry.json', 'utf8'));
const registeredKeys = new Set(registry.variables.map((item) => item.key));
for (const key of ['NETWORK_OS_PITCH_LAB_PACKET_ENDPOINT','NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT','NETWORK_OS_PROFILE_CAPTURE_ENABLED']) {
  assert.ok(registeredKeys.has(key), `env registry missing ${key}`);
  for (const example of ['.env.example','.env.local.example','.env.preview.example','.env.production.example']) {
    assert.ok(readFileSync(example, 'utf8').includes(`${key}=`), `${example} missing ${key}`);
  }
}

console.log('profile lead contracts passed');
