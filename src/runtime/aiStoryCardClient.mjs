import { normalizeDisplayValue } from './normalizeDisplayValue.mjs';
import { createLocalDraftStoryCard } from './storyCard.mjs';
import { copyTextToClipboard, formatStoryCardForClipboard } from './clipboard.mjs';
import { DISCLOSURE_COPY } from './disclaimerModel.mjs';
import { SCOOTER_COMPANION_STATES, SCOOTER_MEDIA_MOMENTS } from './scooterJourneyModel.mjs';
import { SCOOTER_MVP_V1_MEDIA_CONTRACT } from './scooterMediaContract.mjs';

const answersKey = 'west-peek-pitch-lab.phase3.answers.v1';
const aiCardKey = 'west-peek-pitch-lab.phase4.ai-story-card.v1';

// Pitch Lab has no login (owner ruling 2026-11-03). Paid endpoints need a short-lived session token
// the server signs on page load, plus a Cloudflare Turnstile token on the step that starts paid work.
let paidSession = null;
let turnstileWidgetId = null;
async function loadPaidSession(force = false) {
  if (paidSession && !force) return paidSession;
  try {
    const response = await fetch('/api/session', { headers: { accept: 'application/json' } });
    const body = await response.json();
    paidSession = response.ok && body.sessionToken ? body : null;
  } catch { paidSession = null; }
  if (paidSession?.turnstileSiteKey) mountTurnstile(paidSession.turnstileSiteKey);
  return paidSession;
}
function mountTurnstile(siteKey) {
  const slot = document.querySelector('[data-turnstile-slot]');
  if (!slot || turnstileWidgetId !== null || slot.dataset.mounted) return;
  slot.dataset.mounted = 'true';
  const render = () => { turnstileWidgetId = window.turnstile.render(slot, { sitekey: siteKey, appearance: 'interaction-only', action: 'story_card' }); };
  if (window.turnstile) { render(); return; }
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true; script.defer = true; script.onload = render;
  document.head.appendChild(script);
}
async function turnstileToken() {
  if (!paidSession?.turnstileSiteKey || !window.turnstile || turnstileWidgetId === null) return '';
  for (let i = 0; i < 20; i += 1) {
    const token = window.turnstile.getResponse(turnstileWidgetId);
    if (token) return token;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return '';
}
function resetTurnstile() { try { if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId); } catch {} }
async function paidPost(path, payload, { withTurnstile = false } = {}) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const session = await loadPaidSession(attempt > 0);
    const body = withTurnstile ? { ...payload, turnstileToken: await turnstileToken() } : payload;
    const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-pitch-lab-session': session?.sessionToken || '' }, body: JSON.stringify(body) });
    if (withTurnstile) resetTurnstile();
    if (response.status !== 401 || attempt > 0) return response;
  }
}

function escapeHtml(value) { return normalizeDisplayValue(value, { maxLength: 2000 }).summary.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;').replaceAll("'",'&#039;'); }
function readAnswers() { try { return JSON.parse(localStorage.getItem(answersKey) || '{}'); } catch { return {}; } }
function updateScooter(status, script) { const s=document.querySelector('[data-scooter-companion-status]'); const c=document.querySelector('[data-scooter-companion-script]'); if(s) s.textContent=status; if(c&&script) c.textContent=script; }
function renderStoryStrengthSignals(signals=[]) { if(!Array.isArray(signals)||!signals.length) return ''; return `<div class="strength-panel" aria-label="Story Strength Snapshot"><h3>Story Strength Snapshot</h3><p class="phase-note">Qualitative coaching signals only. This is not a funding prediction, investment rating, or West Peek investment decision.</p><div class="strength-grid">${signals.map((item)=>`<article class="strength-item"><h4>${escapeHtml(item.category)}</h4><span>${escapeHtml(item.signal)}</span><p>${escapeHtml(item.guidance)}</p></article>`).join('')}</div></div>`; }

function deriveFinalSummary(result) {
  const card = result.storyCard || {};
  const strongest = card.founderEdge || 'the founder edge';
  const gap = card.biggestStoryGap || result.critique?.needsStrongerProof || 'proof and specificity';
  return `Here’s what I’m hearing. The strongest part of your story is ${strongest}. The biggest gap is ${gap}. Before you share this, add one concrete proof point so the story is easier to believe.`.slice(0, 520);
}

function renderAiCard(result) {
  const card = result.storyCard;
  const finalSummary = result.finalScooterSummary?.script || deriveFinalSummary(result);
  const rows = [
    ['One-line pitch', card.oneLinePitch], ['Company summary', card.companySummary], ['Customer', card.customer], ['Problem', card.problem], ['Solution', card.solution], ['Proof / traction', card.proofTraction], ['Founder edge', card.founderEdge], ['Why now', card.whyNow], ['Biggest story gap', card.biggestStoryGap], ['Biggest objection', card.biggestObjection], ['Suggested next relationships', card.suggestedNextRelationships], ['Next steps', card.nextSteps]
  ];
  return `<div class="card-status" data-ai-enhanced="true">AI-enhanced Founder Story Card · text ready</div><p class="phase-note">${escapeHtml(result.disclosure || DISCLOSURE_COPY.storyCard)}</p>${renderStoryStrengthSignals(result.storyStrengthSignals)}<div class="ai-scooter-final-summary" data-final-scooter-summary><h3>AI Scooter final summary</h3><p>${escapeHtml(finalSummary)}</p><p class="phase-note">Your written story is ready now. Scooter’s talking summary follows without blocking the card.</p></div><div data-avatar-lane class="boundary-card media-runway-card"><h3>AI Scooter final talking summary</h3><p data-avatar-status>Text coaching is ready. Scooter’s short personalized media summary is preparing as the non-blocking coaching moment.</p></div><div class="actions"><button type="button" class="button secondary" data-copy-ai-card>Copy Founder Story Card</button><a class="button primary" href="/share">Continue to sharing</a><span class="copy-status" data-ai-copy-status></span></div><div class="critique-panel"><h3>AI Scooter critique</h3><ul><li><strong>Clear:</strong> ${escapeHtml(result.critique.whatIsClear)}</li><li><strong>Confusing:</strong> ${escapeHtml(result.critique.whatIsConfusing)}</li><li><strong>Generic:</strong> ${escapeHtml(result.critique.whatSoundsGeneric)}</li><li><strong>Proof:</strong> ${escapeHtml(result.critique.needsStrongerProof)}</li><li><strong>Likely objection:</strong> ${escapeHtml(result.critique.likelyObjection)}</li><li><strong>Better story angle:</strong> ${escapeHtml(result.critique.betterStoryAngle)}</li><li><strong>Next question:</strong> ${escapeHtml(result.critique.suggestedNextQuestion)}</li></ul></div><div class="story-card-grid">${rows.map(([label,value])=>`<article class="story-card-section"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(value)}</p></article>`).join('')}</div>`;
}

async function requestAvatarLane(target, scriptId) {
  const status = target.querySelector('[data-avatar-status]');
  if (!status) return;
  status.textContent = 'Preparing Scooter’s final talking summary…';
  try {
    const response = await paidPost('/api/avatar/render', { scriptId });
    const body = await response.json();
    if (response.status === 202 || body.status === 'avatar_render_queued') status.textContent = 'Scooter’s final talking summary is queued. The text card remains usable now.';
    else status.textContent = body.reason || body.message || 'Scooter media is unavailable right now. The text coaching remains ready.';
  } catch { status.textContent = 'Scooter media is unavailable right now. The text coaching remains ready.'; }
}

export function attachAiStoryCardControls() {
  const target = document.querySelector('[data-ai-story-card-root]'); const button = document.querySelector('[data-generate-ai-card]'); if(!target||!button) return;
  button.addEventListener('click', async () => {
    const answers = readAnswers(); const localCard = createLocalDraftStoryCard(answers);
    if (localCard.validation && !localCard.validation.ok) { target.innerHTML = `<div class="boundary-card"><h3>Finish the local practice flow first.</h3><p>AI generation requires all required founder answers to pass validation. The final context prompt is optional.</p></div>`; return; }
    updateScooter(SCOOTER_COMPANION_STATES.story_reviewing, 'AI Scooter is sharpening your story. Your written card appears first.');
    target.innerHTML = '<p class="phase-note">AI Scooter is sharpening your story…</p>';
    try {
      const response = await paidPost('/api/pitch/story-card', { answers }, { withTurnstile: true });
      const data = await response.json();
      if(!response.ok || data.status === 'ai_unavailable') { target.innerHTML = `<div class="boundary-card"><h3>AI coaching is unavailable.</h3><p>${escapeHtml(data.reason || 'Provider is unavailable or not configured.')}</p><p>No fake AI output was generated.</p></div>`; updateScooter(SCOOTER_COMPANION_STATES.final_video_unavailable, 'AI coaching is unavailable. No fake output was generated.'); return; }
      const finalScript = data.finalScooterSummary?.script || deriveFinalSummary(data);
      const scriptId = data.finalScooterSummary?.scriptId || '';
      data.finalScooterSummary = { script: finalScript, scriptId, moment: SCOOTER_MEDIA_MOMENTS.final_summary_dynamic.label, comfortRangeWords: SCOOTER_MVP_V1_MEDIA_CONTRACT.scriptGuidance.final_summary.comfortRangeWords, reviewAboveWords: SCOOTER_MVP_V1_MEDIA_CONTRACT.scriptGuidance.final_summary.reviewAboveWords };
      localStorage.setItem(aiCardKey, JSON.stringify(data));
      target.innerHTML = renderAiCard(data);
      updateScooter(SCOOTER_COMPANION_STATES.story_text_ready, finalScript);
      target.querySelector('[data-copy-ai-card]')?.addEventListener('click', async () => { const copy = await copyTextToClipboard(formatStoryCardForClipboard(data.storyCard, { title:'Founder Story Card', storyStrengthSignals:data.storyStrengthSignals || [] })); const status=target.querySelector('[data-ai-copy-status]'); if(status) status.textContent = copy.ok ? 'Copied.' : copy.reason; });
      if (scriptId) requestAvatarLane(target, scriptId);
    } catch { target.innerHTML = '<div class="boundary-card"><h3>AI coaching is unavailable.</h3><p>The request failed safely. No fake AI output was generated.</p></div>'; updateScooter(SCOOTER_COMPANION_STATES.final_video_unavailable, 'The request failed safely. No fake AI output was generated.'); }
  });
}

attachAiStoryCardControls();
if (document.querySelector('[data-generate-ai-card]')) loadPaidSession();
