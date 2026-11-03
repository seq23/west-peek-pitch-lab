import { analyzePitch } from '../../../src/server/ai/aiService.mjs';
import { guardPaidRequest, consumeLimits, storeSessionScript, jsonResponse } from '../../../src/server/security/paidEndpointGuard.mjs';

// Paid LLM call: session token + Turnstile + per-visitor and daily limits (paidEndpointGuard.mjs).
export async function onRequestPost(context) {
  const guard = await guardPaidRequest({ request: context.request, env: context.env, endpoint: 'pitch_analyze' });
  if (!guard.ok) return guard.response;
  const limited = await consumeLimits(context.env, guard);
  if (limited) return limited;
  const result = await analyzePitch({ env: context.env, answers: guard.body.answers, fetchImpl: fetch });
  const script = result.body?.finalScooterSummary?.script;
  if (result.ok && script) {
    result.body.finalScooterSummary.scriptId = await storeSessionScript({ env: context.env, sid: guard.sid, moment: 'final_summary', text: script });
  }
  return jsonResponse(result.body, result.httpStatus);
}

export async function onRequestGet() {
  return jsonResponse({
    status: 'method_not_allowed',
    aiEnhanced: false,
    shareEnabled: false,
    message: 'Use POST with founder answers. This endpoint never returns placeholder AI output.'
  }, 405);
}
