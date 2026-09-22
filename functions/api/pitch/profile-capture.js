import { addFounderToNetworkSheet } from '../../../src/server/network/siteFormIntakeClient.mjs';
import { submitPitchLabProfileLead } from '../../../src/server/network/networkOsClient.mjs';

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) }
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error_code: 'INVALID_JSON', message: 'Request body must be valid JSON.' }, { status: 400 }); }
  // The founder goes to the master network sheet AND, as before, to the review
  // queue. Owner's rule, 22 Sep 2026: Pitch Lab is a lead generation engine, so
  // these people belong in the network. The queue handoff is unchanged.
  const [result, sheet] = await Promise.all([
    submitPitchLabProfileLead(body, env),
    addFounderToNetworkSheet(
      { founder: body?.founder, form: 'pitch_lab_profile', context: 'Captured at the Pitch Lab profile gate.' },
      env
    )
  ]);

  // A sheet outage never costs the founder their step. It is reported, never
  // allowed to change the outcome, and every failure is logged above.
  if (!result.ok) return json({ ...result, sheet }, { status: result.error_code === 'VALIDATION_FAILED' ? 400 : 202 });
  return json({ ...result, sheet });
}

export async function onRequest() {
  return json({ ok: false, error_code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' }, { status: 405 });
}
