// One guard for every endpoint that spends money on a provider (LLM, cloned voice, avatar video).
//
// Why: until 2026-11-03 /api/voice/render, /api/avatar/render and /api/pitch/analyze took any
// caller's text with no auth and no limit, so anyone could render arbitrary text in Scooter's
// cloned voice and run up the provider bills.
//
// Owner ruling (2026-11-03): Pitch Lab has NO login; it is lead gen and stays open to anonymous
// visitors. So the gate is:
//   1. A short-lived session token the server signs when the page loads (GET /api/session),
//      bound to the visitor's IP + user agent, ~1h expiry. Required by every paid endpoint.
//   2. Cloudflare Turnstile on the step that starts paid work (story card / analyze), when
//      TURNSTILE_SECRET_KEY is configured.
//   3. Voice and avatar never take caller text: they take a scriptId that points at a script the
//      server itself generated for that same session (stored server-side, length capped).
//   4. Per-IP and per-session hourly limits, a global daily ceiling per provider (calm 429), body
//      size caps, and a render cache so a repeat costs nothing.
// Staff (Authorization: Bearer PITCH_LAB_ADMIN_TOKEN) skip the session, Turnstile and per-visitor
// limits, never the daily ceiling. Lead capture (/api/pitch/profile-capture, /api/pitch/share)
// is not a paid endpoint and is not gated here.
//
// Storage: the PITCH_LAB_LIMITS KV binding; without it (tests, local preview) per-isolate memory.

const encoder = new TextEncoder();
const memoryStore = new Map();
export const SESSION_TTL_SECONDS = 60 * 60;
const SCRIPT_TTL_SECONDS = 60 * 60;
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
export const MAX_SCRIPT_CHARS = 900;

// bucket: the per-visitor hourly bucket (story card and analyze share one: "analyses").
// provider: the global daily ceiling bucket.
export const PAID_ENDPOINTS = {
  story_card: { maxBodyBytes: 32768, bucket: 'analysis', perHour: 3, provider: 'llm', turnstile: true },
  pitch_analyze: { maxBodyBytes: 32768, bucket: 'analysis', perHour: 3, provider: 'llm', turnstile: true },
  voice_render: { maxBodyBytes: 2048, bucket: 'voice', perHour: 3, provider: 'voice', script: true },
  avatar_render: { maxBodyBytes: 2048, bucket: 'avatar', perHour: 1, provider: 'avatar', script: true }
};
const DAILY_CEILINGS = { llm: ['LLM_DAILY_MAX_CALLS', 300], voice: ['VOICE_DAILY_MAX_RENDERS', 50], avatar: ['AVATAR_DAILY_MAX_RENDERS', 20] };

function getEnv(env, key) { return String(env?.[key] ?? '').trim(); }

export function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}

function b64url(bytes) {
  return Buffer.from(bytes).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
async function hmac(secret, message) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message))));
}
export async function sha256(text) {
  return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(String(text)))));
}
function safeEqual(a, b) {
  const x = String(a); const y = String(b);
  if (!x || x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
function randomId(bytes = 12) { return b64url(crypto.getRandomValues(new Uint8Array(bytes))); }
function clientIp(request) { return request.headers.get('cf-connecting-ip') || 'unknown'; }
function signingSecret(env) { const s = getEnv(env, 'PITCH_LAB_RENDER_SIGNING_SECRET'); return s.length >= 32 ? s : ''; }

export function isAdminRequest(request, env) {
  const expected = getEnv(env, 'PITCH_LAB_ADMIN_TOKEN');
  if (expected.length < 32) return false;
  const match = /^Bearer\s+(.+)$/i.exec((request.headers.get('authorization') || '').trim());
  return Boolean(match) && safeEqual(match[1].trim(), expected);
}

async function bindingHash(request) {
  return sha256(`${clientIp(request)}|${request.headers.get('user-agent') || ''}`);
}

export async function issueSessionToken({ request, env, nowMs = Date.now() }) {
  const secret = signingSecret(env);
  if (!secret) return null;
  const exp = Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS;
  const sid = randomId();
  const sig = await hmac(secret, `s1|${exp}|${sid}|${await bindingHash(request)}`);
  return { token: `s1.${exp}.${sid}.${sig}`, expiresAt: exp };
}

export async function verifySessionToken({ request, env, nowMs = Date.now() }) {
  const secret = signingSecret(env);
  if (!secret) return { ok: false, reason: 'session_signing_not_configured' };
  const parts = String(request.headers.get('x-pitch-lab-session') || '').split('.');
  if (parts.length !== 4 || parts[0] !== 's1') return { ok: false, reason: 'missing_session' };
  const [, expRaw, sid, sig] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(nowMs / 1000)) return { ok: false, reason: 'session_expired' };
  const expected = await hmac(secret, `s1|${exp}|${sid}|${await bindingHash(request)}`);
  if (!safeEqual(sig, expected)) return { ok: false, reason: 'session_invalid' };
  return { ok: true, sid };
}

function store(env) {
  const kv = env?.PITCH_LAB_LIMITS;
  if (kv && typeof kv.get === 'function' && typeof kv.put === 'function') {
    return {
      async get(key) { return kv.get(key); },
      async put(key, value, ttl) { await kv.put(key, String(value), { expirationTtl: Math.max(60, ttl) }); }
    };
  }
  return {
    async get(key) { const hit = memoryStore.get(key); return hit && hit.until > Date.now() ? hit.value : null; },
    async put(key, value, ttl) { memoryStore.set(key, { value: String(value), until: Date.now() + ttl * 1000 }); }
  };
}
export function resetMemoryStore() { memoryStore.clear(); }

// Called by the story-card / analyze endpoints: keeps the script the server generated for this
// session, so voice/avatar can render it by id and never render caller text.
export async function storeSessionScript({ env, sid, moment, text }) {
  const clean = String(text || '').trim().slice(0, MAX_SCRIPT_CHARS);
  if (!clean || !sid) return null;
  const scriptId = randomId();
  await store(env).put(`pl:script:${scriptId}`, JSON.stringify({ sid, moment, text: clean }), SCRIPT_TTL_SECONDS);
  return scriptId;
}

export async function readRenderCache(env, key) {
  const raw = await store(env).get(key);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export async function writeRenderCache(env, key, value) {
  await store(env).put(key, JSON.stringify(value), CACHE_TTL_SECONDS);
}

async function verifyTurnstile({ env, token, request, fetchImpl }) {
  const secret = getEnv(env, 'TURNSTILE_SECRET_KEY');
  if (!secret) return true; // not configured: ship without it (named in the session response)
  if (!token) return false;
  try {
    const form = new URLSearchParams({ secret, response: String(token), remoteip: clientIp(request) });
    const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const data = await response.json();
    return data?.success === true;
  } catch { return false; }
}

const BUSY = { status: 'busy_try_tomorrow', reason: 'Scooter is very busy today. Your answers are saved and your written story card still works; please try the AI coaching again tomorrow.' };
const SLOW_DOWN = { status: 'rate_limited', reason: 'You have used Scooter’s coaching a few times this hour. Your answers are saved; please try again a little later.' };
const NEED_SESSION = { status: 'unauthorized', reason: 'Please refresh the page to continue with Scooter.' };

async function readBody(request, maxBodyBytes) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maxBodyBytes) return { tooLarge: true };
  const raw = await request.text();
  if (encoder.encode(raw).length > maxBodyBytes) return { tooLarge: true };
  try { const value = JSON.parse(raw); return { value: value && typeof value === 'object' && !Array.isArray(value) ? value : null }; } catch { return { value: null }; }
}

// Returns { ok: true, body, admin, sid, script, cacheKey } or { ok: false, response }.
// Counting happens in consumeLimits(), after a cache miss, so a cached repeat costs nothing.
export async function guardPaidRequest({ request, env = {}, endpoint, fetchImpl = fetch, nowMs = Date.now() }) {
  const policy = PAID_ENDPOINTS[endpoint];
  if (!policy) throw new Error(`Unknown paid endpoint: ${endpoint}`);
  const read = await readBody(request, policy.maxBodyBytes);
  if (read.tooLarge) return { ok: false, response: jsonResponse({ status: 'payload_too_large', reason: 'Request body is too large.' }, 413) };
  const body = read.value;
  if (!body) return { ok: false, response: jsonResponse({ status: 'invalid_request', errors: { body: 'Expected JSON body.' } }, 400) };

  const admin = isAdminRequest(request, env);
  let sid = admin ? 'admin' : null;
  if (!admin) {
    const session = await verifySessionToken({ request, env, nowMs });
    if (!session.ok) return { ok: false, response: jsonResponse({ ...NEED_SESSION, detail: session.reason }, 401) };
    sid = session.sid;
    if (policy.turnstile && !(await verifyTurnstile({ env, token: body.turnstileToken, request, fetchImpl }))) {
      return { ok: false, response: jsonResponse({ status: 'challenge_failed', reason: 'We could not confirm this browser. Please refresh the page and try again.' }, 403) };
    }
  }

  let script = null;
  if (policy.script) {
    const callerText = String(body.text ?? '').trim();
    const callerAudio = String(body.audioUrl ?? '').trim();
    if (admin && !body.scriptId) {
      script = { moment: String(body.moment ?? '').trim(), text: callerText, audioUrl: callerAudio };
    } else {
      if (!admin && (callerText || callerAudio)) {
        return { ok: false, response: jsonResponse({ status: 'forbidden', reason: 'Scooter only speaks text Pitch Lab wrote for your session.' }, 403) };
      }
      const raw = body.scriptId ? await store(env).get(`pl:script:${String(body.scriptId).slice(0, 64)}`) : null;
      let saved = null; try { saved = raw ? JSON.parse(raw) : null; } catch { saved = null; }
      if (!saved || (!admin && saved.sid !== sid)) {
        return { ok: false, response: jsonResponse({ status: 'forbidden', reason: 'Scooter only speaks text Pitch Lab wrote for your session.' }, 403) };
      }
      script = { moment: saved.moment, text: saved.text, audioUrl: '' };
    }
  }
  const cacheKey = script && !script.audioUrl ? `pl:cache:${endpoint}:${await sha256(`${script.moment}|${script.text}`)}` : null;
  return { ok: true, body, admin, sid, script, cacheKey, policy, endpoint, request, nowMs };
}

export async function consumeLimits(env, guard) {
  const { policy, endpoint, admin, sid, request, nowMs } = guard;
  const kv = store(env);
  const hour = Math.floor(nowMs / 3600000);
  const day = new Date(nowMs).toISOString().slice(0, 10);
  const [ceilingKey, ceilingDefault] = DAILY_CEILINGS[policy.provider];
  const checks = [[`pl:day:${policy.provider}:${day}`, Number(getEnv(env, ceilingKey)) || ceilingDefault, 86400, BUSY]];
  if (!admin) {
    checks.push([`pl:ip:${policy.bucket}:${clientIp(request)}:${hour}`, policy.perHour, 3600, SLOW_DOWN]);
    checks.push([`pl:sid:${policy.bucket}:${sid}:${hour}`, policy.perHour, 3600, SLOW_DOWN]);
  }
  const counts = [];
  for (const [key, limit, ttl, message] of checks) {
    const count = Number(await kv.get(key)) || 0;
    if (count >= limit) return jsonResponse({ ...message, endpoint }, 429, { 'retry-after': String(ttl === 86400 ? 3600 : 600) });
    counts.push([key, count, ttl]);
  }
  for (const [key, count, ttl] of counts) await kv.put(key, count + 1, ttl);
  return null;
}

// Status endpoints: unauthenticated callers learn one boolean, staff see the full detail.
export function statusResponse(request, env, fullStatus) {
  if (isAdminRequest(request, env)) return jsonResponse(fullStatus);
  return jsonResponse({ status: fullStatus.status, configured: Boolean(fullStatus.configured) });
}
