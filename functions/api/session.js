import { issueSessionToken, jsonResponse } from '../../src/server/security/paidEndpointGuard.mjs';
// Issued on page load to every anonymous visitor (no login, owner ruling 2026-11-03). Paid endpoints
// require it; it is bound to this visitor's IP + user agent and expires in about an hour.
export async function onRequestGet(context) {
  const issued = await issueSessionToken({ request: context.request, env: context.env });
  if (!issued) return jsonResponse({ status: 'session_unavailable', reason: 'AI coaching is unavailable right now. Your written story card still works.' }, 503);
  const turnstileSiteKey = String(context.env?.TURNSTILE_SITE_KEY || '').trim() || null;
  return jsonResponse({ status: 'session_ready', sessionToken: issued.token, expiresAt: issued.expiresAt, turnstileSiteKey });
}
