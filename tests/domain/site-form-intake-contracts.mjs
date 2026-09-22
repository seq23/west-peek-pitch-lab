/**
 * Pitch Lab -> master network sheet contract.
 *
 * The owner's decision, 22 Sep 2026: "pitch lab is meant to be a lead gen
 * engine. so add pitchlab for sure." This asserts the behaviour that decision
 * bought, by DRIVING the real client against a stubbed fetch - not by reading
 * its source and hoping.
 *
 * It also pins the thing most likely to be undone by a future reader who finds
 * the old CONTACT_AUTO_CREATE_GUARD and concludes Pitch Lab must never create
 * contacts: both destinations run, and neither can silently replace the other.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addFounderToNetworkSheet, getSiteFormIntakeConfig } from '../../src/server/network/siteFormIntakeClient.mjs';

let checks = 0;
function ok(condition, message) { assert.ok(condition, message); checks += 1; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); checks += 1; }

const ENV = {
  WP_NETWORK_OS_INTAKE_URL: 'https://network.joinwestpeek.com/api/intake/site-form',
  WP_NETWORK_OS_INTAKE_SECRET: 'x'.repeat(32)
};
const FOUNDER = { name: 'Ada Example', email: 'Founder@Example.COM', company_name: 'Example Labs', website: 'https://example.com' };

function stub(response) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return response;
  };
  return { calls, fetchImpl };
}
const okResponse = { ok: true, status: 200, json: async () => ({ ok: true, contact_id: 'contact_x', result: 'created' }) };

// --- configuration -------------------------------------------------------
const config = getSiteFormIntakeConfig(ENV);
equal(config.intakeUrl, ENV.WP_NETWORK_OS_INTAKE_URL, 'the door URL is read from WP_NETWORK_OS_INTAKE_URL');
equal(config.sharedSecret, ENV.WP_NETWORK_OS_INTAKE_SECRET, 'the secret is read from WP_NETWORK_OS_INTAKE_SECRET');
ok(config.timeoutMs > 0, 'a timeout is always set, so a slow door cannot hold a founder open');

// --- the happy path, driven ----------------------------------------------
{
  const { calls, fetchImpl } = stub(okResponse);
  const result = await addFounderToNetworkSheet({ founder: FOUNDER, form: 'pitch_lab_profile', context: 'At the profile gate.' }, ENV, fetchImpl);
  equal(result, 'ok', 'a successful write reports ok');
  equal(calls.length, 1, 'exactly one call is made');
  const { body, init, url } = calls[0];
  equal(url, ENV.WP_NETWORK_OS_INTAKE_URL, 'the call goes to the intake door');
  equal(init.method, 'POST', 'the call is a POST');
  equal(init.headers['x-wp-network-os-intake-secret'], ENV.WP_NETWORK_OS_INTAKE_SECRET, 'the shared secret is sent in the header the door requires');
  equal(body.email, 'founder@example.com', 'the email is lowercased');
  equal(body.name, 'Ada Example', 'the founder name is sent');
  equal(body.company, 'Example Labs', 'company_name maps to company');
  equal(body.host, 'pitch lab', 'the row records that the person came from Pitch Lab');
  equal(body.form, 'pitch_lab_profile', 'the row records which Pitch Lab step they reached');
  equal(body.lead_source, 'pitch_lab', 'lead_source tags the row as Pitch Lab');
  ok(body.submission_id && body.submission_id.length > 8, 'a submission id is sent, so a retry cannot double-write');
  equal(init.headers['x-wp-network-os-submission-id'], body.submission_id, 'the submission id is also sent as a header');
  ok(body.message.includes('profile gate'), 'the context reaches the row');
}

// The share step is tagged distinctly from the profile step.
{
  const { calls, fetchImpl } = stub(okResponse);
  await addFounderToNetworkSheet({ founder: FOUNDER, form: 'pitch_lab_share' }, ENV, fetchImpl);
  equal(calls[0].body.form, 'pitch_lab_share', 'the share step is tagged as its own form');
}

// An explicit submission id is honoured, so the caller can make a retry idempotent.
{
  const { calls, fetchImpl } = stub(okResponse);
  await addFounderToNetworkSheet({ founder: FOUNDER, form: 'pitch_lab_share', submissionId: 'fixed-id-123' }, ENV, fetchImpl);
  equal(calls[0].body.submission_id, 'fixed-id-123', 'a supplied submission id is used verbatim');
}

// --- failure never reaches the founder ------------------------------------
{
  const { fetchImpl } = stub({ ok: false, status: 503, json: async () => ({ ok: false, error_code: 'SHARED_SECRET_MISSING' }) });
  equal(await addFounderToNetworkSheet({ founder: FOUNDER, form: 'pitch_lab_profile' }, ENV, fetchImpl), 'failed', 'a door error reports failed rather than throwing');
}
{
  const fetchImpl = async () => { throw new Error('offline'); };
  equal(await addFounderToNetworkSheet({ founder: FOUNDER, form: 'pitch_lab_profile' }, ENV, fetchImpl), 'failed', 'a network error reports failed rather than throwing');
}
{
  const { calls, fetchImpl } = stub(okResponse);
  equal(await addFounderToNetworkSheet({ founder: FOUNDER, form: 'pitch_lab_profile' }, {}, fetchImpl), 'not_configured', 'an unconfigured door reports not_configured');
  equal(calls.length, 0, 'an unconfigured door is not called at all');
}
{
  const { calls, fetchImpl } = stub(okResponse);
  equal(await addFounderToNetworkSheet({ founder: { email: 'nope' }, form: 'pitch_lab_profile' }, ENV, fetchImpl), 'invalid', 'a malformed email is refused before any call');
  equal(await addFounderToNetworkSheet({ founder: FOUNDER, form: 'made_up' }, ENV, fetchImpl), 'invalid', 'an unknown form name is refused');
  equal(calls.length, 0, 'nothing invalid reaches the door');
}

// --- both destinations, and the reversal that is deliberate ---------------
const profileHandler = readFileSync(new URL('../../functions/api/pitch/profile-capture.js', import.meta.url), 'utf8');
const shareHandler = readFileSync(new URL('../../functions/api/pitch/share.js', import.meta.url), 'utf8');
const client = readFileSync(new URL('../../src/server/network/siteFormIntakeClient.mjs', import.meta.url), 'utf8');
const legacyClient = readFileSync(new URL('../../src/server/network/networkOsClient.mjs', import.meta.url), 'utf8');

for (const [name, handler, form] of [['profile-capture', profileHandler, 'pitch_lab_profile'], ['share', shareHandler, 'pitch_lab_share']]) {
  ok(handler.includes('addFounderToNetworkSheet'), `${name} adds the founder to the master network sheet`);
  ok(handler.includes(`'${form}'`), `${name} tags its rows as ${form}`);
  ok(handler.includes('sheet'), `${name} reports the sheet outcome to its caller`);
}
ok(profileHandler.includes('submitPitchLabProfileLead'), 'the profile queue handoff is still made — a working path is not removed to add a new one');
ok(shareHandler.includes('submitPitchLabShare'), 'the share queue handoff is still made');
ok(legacyClient.includes('CONTACT_AUTO_CREATE_GUARD'), 'the pitch-lab door guard is untouched: that door still must not create contacts');
ok(/lead gen/i.test(client), 'the client records WHY contacts creation is now correct, so the reversal is not re-reversed by someone reading the old guard');

console.log(`pitch lab site-form intake contract PASS — ${checks} checks`);
