import { addFounderToNetworkSheet } from '../../../src/server/network/siteFormIntakeClient.mjs';
import { submitPitchLabShare } from '../../../src/server/network/networkOsClient.mjs';

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) }
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error_code: 'INVALID_JSON', message: 'Request body must be valid JSON.' }, { status: 400 }); }
  // Both destinations, for the reason in siteFormIntakeClient.mjs: contacts for
  // lead generation, intake_queue for the human review that already existed.
  const [result, sheet] = await Promise.all([
    submitPitchLabShare(body, env),
    addFounderToNetworkSheet(
      { founder: body?.founder, form: 'pitch_lab_share', context: 'Shared a Founder Story Packet through Pitch Lab.' },
      env
    )
  ]);

  if (!result.ok) return json({ ...result, sheet }, { status: result.error_code === 'VALIDATION_FAILED' ? 400 : 503 });
  return json({ ...result, sheet });
}

export async function onRequest() {
  return json({ ok: false, error_code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' }, { status: 405 });
}
