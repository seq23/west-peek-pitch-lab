import { renderScooterAvatar } from '../../../src/server/avatar/avatarService.mjs';
async function readJson(request) { try { return await request.json(); } catch { return null; } }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }); }
export async function onRequestPost(context) {
  const body = await readJson(context.request);
  if (!body || typeof body !== 'object') return json({ status: 'invalid_avatar_request', avatarReady: false, errors: { body: 'Expected JSON body.' } }, 400);
  const result = await renderScooterAvatar({ env: context.env, body, fetchImpl: fetch });
  return json(result.body, result.httpStatus);
}
export async function onRequestGet() { return json({ status: 'method_not_allowed', avatarReady: false, message: 'Use POST. This endpoint never returns fake avatar video.' }, 405); }
