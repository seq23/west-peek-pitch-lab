import { renderScooterVoice } from '../../../src/server/voice/voiceService.mjs';
import { guardPaidRequest, consumeLimits, readRenderCache, writeRenderCache, jsonResponse } from '../../../src/server/security/paidEndpointGuard.mjs';
// Never renders caller text for visitors: only a scriptId the server generated for the same session.
export async function onRequestPost(context) {
  const guard = await guardPaidRequest({ request: context.request, env: context.env, endpoint: 'voice_render' });
  if (!guard.ok) return guard.response;
  const cached = guard.cacheKey ? await readRenderCache(context.env, guard.cacheKey) : null;
  if (cached) return jsonResponse({ ...cached, cached: true });
  const limited = await consumeLimits(context.env, guard);
  if (limited) return limited;
  const result = await renderScooterVoice({ env: context.env, body: { moment: guard.script.moment, text: guard.script.text }, fetchImpl: fetch });
  if (result.httpStatus === 200 && guard.cacheKey) await writeRenderCache(context.env, guard.cacheKey, result.body);
  return jsonResponse(result.body, result.httpStatus);
}
export async function onRequestGet() { return jsonResponse({ status: 'method_not_allowed', voiceReady: false, message: 'Use POST. This endpoint never returns fake voice output.' }, 405); }
