import { renderScooterAvatar } from '../../../src/server/avatar/avatarService.mjs';
import { guardPaidRequest, consumeLimits, readRenderCache, writeRenderCache, jsonResponse } from '../../../src/server/security/paidEndpointGuard.mjs';
// Never renders caller text or caller audio for visitors: only a scriptId the server generated for the same session.
export async function onRequestPost(context) {
  const guard = await guardPaidRequest({ request: context.request, env: context.env, endpoint: 'avatar_render' });
  if (!guard.ok) return guard.response;
  const cached = guard.cacheKey ? await readRenderCache(context.env, guard.cacheKey) : null;
  if (cached) return jsonResponse({ ...cached, cached: true }, 202);
  const limited = await consumeLimits(context.env, guard);
  if (limited) return limited;
  const result = await renderScooterAvatar({ env: context.env, body: { moment: guard.script.moment, text: guard.script.text, audioUrl: guard.script.audioUrl }, fetchImpl: fetch });
  if (result.httpStatus === 202 && guard.cacheKey) await writeRenderCache(context.env, guard.cacheKey, result.body);
  return jsonResponse(result.body, result.httpStatus);
}
export async function onRequestGet() { return jsonResponse({ status: 'method_not_allowed', avatarReady: false, message: 'Use POST. This endpoint never returns fake avatar video.' }, 405); }
