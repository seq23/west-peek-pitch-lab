import assert from 'node:assert/strict';
import { buildPitchLabProfileLeadPayload } from '../../src/server/network/profileLeadContract.mjs';
import { buildPitchLabNetworkPayload } from '../../src/server/network/pitchLabHandoffContract.mjs';

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
console.log('profile lead contracts passed');
