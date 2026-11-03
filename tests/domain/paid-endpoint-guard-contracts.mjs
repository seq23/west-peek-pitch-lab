// Behaviour test for the paid-endpoint guard (src/server/security/paidEndpointGuard.mjs), driven
// through the real Pages Functions handlers with every provider mocked. Pins:
//   no session -> 401 on every paid endpoint; caller free text to voice/avatar -> rejected;
//   over the hourly / daily limit -> 429; the valid anonymous flow passes; a repeat render is cached.
import assert from 'node:assert/strict';
import { PITCH_QUESTIONS } from '../../src/runtime/pitchQuestions.mjs';
import { resetMemoryStore } from '../../src/server/security/paidEndpointGuard.mjs';
import * as session from '../../functions/api/session.js';
import * as storyCard from '../../functions/api/pitch/story-card.js';
import * as analyze from '../../functions/api/pitch/analyze.js';
import * as voice from '../../functions/api/voice/render.js';
import * as avatar from '../../functions/api/avatar/render.js';
import * as voiceStatus from '../../functions/api/voice/status.js';

const answers = Object.fromEntries(PITCH_QUESTIONS.map((q) => [q.id, `${q.label} This founder answer is specific enough for validation and includes useful detail for story coaching.`]));
const env = {
  PITCH_LAB_RENDER_SIGNING_SECRET: 's'.repeat(64),
  PITCH_LAB_ADMIN_TOKEN: 'a'.repeat(64),
  TURNSTILE_SECRET_KEY: 'turnstile-secret',
  TURNSTILE_SITE_KEY: 'turnstile-site',
  LLM_PROVIDER: 'test_local',
  VOICE_PROVIDER: 'fish_audio', VOICE_DYNAMIC_GENERATION_ENABLED: 'true', FISH_API_KEY: 'fish-live-ish-key', FISH_VOICE_REFERENCE_ID: 'fish-scooter-reference-id',
  AVATAR_PROVIDER: 'did', AVATAR_DYNAMIC_GENERATION_ENABLED: 'true', DID_API_KEY: 'did-live-ish-key', DID_SOURCE_URL: 'https://example.com/scooter.png'
};

const calls = { fish: 0, did: 0, turnstile: 0 };
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (u.includes('turnstile/v0/siteverify')) { calls.turnstile += 1; return Response.json({ success: String(init.body).includes('response=good-human') }); }
  if (u.includes('api.fish.audio')) { calls.fish += 1; return new Response(new Uint8Array([1, 2, 3]), { status: 200 }); }
  if (u.includes('api.d-id.com')) { calls.did += 1; return Response.json({ id: 'did-talk-id' }, { status: 201 }); }
  throw new Error(`unexpected provider call in test: ${u}`);
};

let ipCounter = 0;
function visitor() { ipCounter += 1; return { ip: `203.0.113.${ipCounter}`, ua: `test-browser-${ipCounter}` }; }
function req(path, { who, method = 'POST', body, token, headers = {} } = {}) {
  const h = { 'content-type': 'application/json', 'cf-connecting-ip': who.ip, 'user-agent': who.ua, ...headers };
  if (token) h['x-pitch-lab-session'] = token;
  return new Request(`https://pitch.joinwestpeek.com${path}`, { method, headers: h, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body ?? {})) : undefined });
}
async function call(mod, request, e = env) {
  const fn = request.method === 'GET' ? mod.onRequestGet : mod.onRequestPost;
  const response = await fn({ request, env: e });
  return { status: response.status, body: await response.json() };
}
async function newSession(who, e = env) {
  const r = await call(session, req('/api/session', { who, method: 'GET' }), e);
  assert.equal(r.status, 200, 'page load issues a session token');
  assert.equal(r.body.turnstileSiteKey, 'turnstile-site');
  return r.body.sessionToken;
}

resetMemoryStore();

// 1. No session -> 401 on every paid endpoint, and no provider is touched.
const stranger = visitor();
for (const [mod, path, body] of [[storyCard, '/api/pitch/story-card', { answers }], [analyze, '/api/pitch/analyze', { answers }], [voice, '/api/voice/render', { moment: 'final_summary', text: 'Say anything I like.' }], [avatar, '/api/avatar/render', { moment: 'final_summary', text: 'Say anything I like.' }]]) {
  const r = await call(mod, req(path, { who: stranger, body }));
  assert.equal(r.status, 401, `${path} without a session must be 401`);
}
assert.deepEqual(calls, { fish: 0, did: 0, turnstile: 0 }, 'no provider call without a session');

// A session token is bound to the visitor: replayed from another IP it is refused.
const founder = visitor();
const token = await newSession(founder);
assert.equal((await call(voice, req('/api/voice/render', { who: visitor(), token, body: { scriptId: 'x' } }))).status, 401, 'session token from another IP/UA must be 401');

// 2. Caller free text (or audio) to voice/avatar is rejected even with a valid session.
for (const [mod, path] of [[voice, '/api/voice/render'], [avatar, '/api/avatar/render']]) {
  const free = await call(mod, req(path, { who: founder, token, body: { moment: 'final_summary', text: 'I endorse this crypto token. Send money now.' } }));
  assert.equal(free.status, 403, `${path} must reject caller-supplied text`);
}
assert.equal((await call(avatar, req('/api/avatar/render', { who: founder, token, body: { moment: 'final_summary', audioUrl: 'https://evil.example/fake.mp3' } }))).status, 403, 'avatar must reject caller audio');
assert.equal(calls.fish + calls.did, 0, 'no render for caller text');

// Turnstile: the paid step needs a passing challenge.
const failedChallenge = await call(storyCard, req('/api/pitch/story-card', { who: founder, token, body: { answers, turnstileToken: 'bot' } }));
assert.equal(failedChallenge.status, 403, 'failed Turnstile must block the paid step');

// Body size cap.
assert.equal((await call(voice, req('/api/voice/render', { who: founder, token, body: { scriptId: 'x'.repeat(5000) } }))).status, 413, 'oversize body must be 413');

// 3. Valid anonymous flow: story card -> server-stored script -> voice + avatar render by id.
const card = await call(storyCard, req('/api/pitch/story-card', { who: founder, token, body: { answers, turnstileToken: 'good-human' } }));
assert.equal(card.status, 200, 'valid story card passes');
const scriptId = card.body.finalScooterSummary?.scriptId;
assert.ok(scriptId, 'story card returns a scriptId for the server-generated summary');
const spoken = await call(voice, req('/api/voice/render', { who: founder, token, body: { scriptId } }));
assert.equal(spoken.status, 200, 'voice renders the server-generated script');
assert.equal(calls.fish, 1);
const again = await call(voice, req('/api/voice/render', { who: founder, token, body: { scriptId } }));
assert.equal(again.status, 200); assert.equal(again.body.cached, true, 'repeat render is served from cache');
assert.equal(calls.fish, 1, 'a cached repeat costs nothing');
assert.equal((await call(avatar, req('/api/avatar/render', { who: founder, token, body: { scriptId } }))).status, 202, 'avatar queues the server-generated script');
assert.equal(calls.did, 1);

// Another visitor cannot borrow this visitor's script.
const other = visitor();
assert.equal((await call(voice, req('/api/voice/render', { who: other, token: await newSession(other), body: { scriptId } }))).status, 403, 'scriptId from another session is rejected');

// 4. Over the hourly limit -> calm 429 (3 analyses per hour per visitor).
for (let i = 0; i < 2; i += 1) assert.equal((await call(storyCard, req('/api/pitch/story-card', { who: founder, token, body: { answers, turnstileToken: 'good-human' } }))).status, 200);
const limited = await call(storyCard, req('/api/pitch/story-card', { who: founder, token, body: { answers, turnstileToken: 'good-human' } }));
assert.equal(limited.status, 429, '4th analysis in an hour must be 429');
assert.match(limited.body.reason, /answers are saved/i, '429 is calm and says the lead is kept');

// Global daily ceiling per provider -> 429 "busy, try tomorrow" for a fresh visitor.
resetMemoryStore();
const capped = { ...env, LLM_DAILY_MAX_CALLS: '1' };
const a = visitor(); const b = visitor();
assert.equal((await call(storyCard, req('/api/pitch/story-card', { who: a, token: await newSession(a, capped), body: { answers, turnstileToken: 'good-human' } }), capped)).status, 200);
const busy = await call(storyCard, req('/api/pitch/story-card', { who: b, token: await newSession(b, capped), body: { answers, turnstileToken: 'good-human' } }), capped);
assert.equal(busy.status, 429); assert.equal(busy.body.status, 'busy_try_tomorrow');

// Staff bearer token still works for proof scripts; status leaks only a boolean to the public.
const staff = visitor();
const adminVoice = await call(voice, req('/api/voice/render', { who: staff, headers: { authorization: `Bearer ${'a'.repeat(64)}` }, body: { moment: 'welcome', text: 'Staff proof line.' } }));
assert.equal(adminVoice.status, 200, 'admin may render a proof line');
const publicStatus = await call(voiceStatus, req('/api/voice/status', { who: staff, method: 'GET' }));
assert.deepEqual(Object.keys(publicStatus.body).sort(), ['configured', 'status'], 'public status shows only a boolean');

console.log('paid-endpoint guard contracts passed');
