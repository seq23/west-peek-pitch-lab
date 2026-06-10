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
  const result = await submitPitchLabProfileLead(body, env);
  if (!result.ok) return json(result, { status: result.error_code === 'VALIDATION_FAILED' ? 400 : 202 });
  return json(result);
}

export async function onRequest() {
  return json({ ok: false, error_code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' }, { status: 405 });
}
