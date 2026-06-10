import { createLocalDraftStoryCard } from './storyCard.mjs';
import { copyTextToClipboard, formatStoryCardForClipboard } from './clipboard.mjs';
import { DISCLOSURE_COPY } from './disclaimerModel.mjs';
import { SCOOTER_COMPANION_STATES, SCOOTER_MEDIA_MOMENTS } from './scooterJourneyModel.mjs';

const answersKey = 'west-peek-pitch-lab.phase3.answers.v1';
const aiCardKey = 'west-peek-pitch-lab.phase4.ai-story-card.v1';

function escapeHtml(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
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
  return `<div class="card-status" data-ai-enhanced="true">AI-enhanced Pitch Story Card · text-first artifact ready</div><p class="phase-note">${escapeHtml(result.disclosure || DISCLOSURE_COPY.storyCard)}</p>${renderStoryStrengthSignals(result.storyStrengthSignals)}<div class="ai-scooter-final-summary" data-final-scooter-summary><h3>AI Scooter final summary</h3><p>${escapeHtml(finalSummary)}</p><p class="phase-note">Video follows only if provider configuration is available. Copy/share remain available without video.</p></div><div data-avatar-lane class="boundary-card"><h3>AI Scooter video lane</h3><p data-avatar-status>Video not requested yet. Text coaching is ready.</p></div><div class="actions"><button type="button" class="button secondary" data-copy-ai-card>Copy Pitch Story Card</button><a class="button primary" href="/share">Preview Founder Story Packet</a><span class="copy-status" data-ai-copy-status></span></div><div class="critique-panel"><h3>AI Scooter critique</h3><ul><li><strong>Clear:</strong> ${escapeHtml(result.critique.whatIsClear)}</li><li><strong>Confusing:</strong> ${escapeHtml(result.critique.whatIsConfusing)}</li><li><strong>Generic:</strong> ${escapeHtml(result.critique.whatSoundsGeneric)}</li><li><strong>Proof:</strong> ${escapeHtml(result.critique.needsStrongerProof)}</li><li><strong>Likely objection:</strong> ${escapeHtml(result.critique.likelyObjection)}</li><li><strong>Better story angle:</strong> ${escapeHtml(result.critique.betterStoryAngle)}</li><li><strong>Next question:</strong> ${escapeHtml(result.critique.suggestedNextQuestion)}</li></ul></div><div class="story-card-grid">${rows.map(([label,value])=>`<article class="story-card-section"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(value)}</p></article>`).join('')}</div>`;
}

async function requestAvatarLane(target, text) {
  const status = target.querySelector('[data-avatar-status]');
  if (!status) return;
  status.textContent = 'Checking AI Scooter video availability…';
  try {
    const response = await fetch('/api/avatar/render', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moment: 'final_summary', text }) });
    const body = await response.json();
    if (response.status === 202 || body.status === 'avatar_render_queued') status.textContent = 'AI Scooter video queued. The text card remains usable now.';
    else status.textContent = body.reason || body.message || 'AI Scooter video unavailable. This is an honest static fallback.';
  } catch { status.textContent = 'AI Scooter video unavailable. This is an honest static fallback.'; }
}

export function attachAiStoryCardControls() {
  const target = document.querySelector('[data-ai-story-card-root]'); const button = document.querySelector('[data-generate-ai-card]'); if(!target||!button) return;
  button.addEventListener('click', async () => {
    const answers = readAnswers(); const localCard = createLocalDraftStoryCard(answers);
    if (localCard.validation && !localCard.validation.ok) { target.innerHTML = `<div class="boundary-card"><h3>Finish the local practice flow first.</h3><p>AI generation requires all seven founder answers to pass validation.</p></div>`; return; }
    updateScooter(SCOOTER_COMPANION_STATES.story_reviewing, 'AI Scooter is reviewing your story. Text appears before video.');
    target.innerHTML = '<p class="phase-note">AI Scooter is reviewing your story…</p>';
    try {
      const response = await fetch('/api/pitch/story-card', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ answers }) });
      const data = await response.json();
      if(!response.ok || data.status === 'ai_unavailable') { target.innerHTML = `<div class="boundary-card"><h3>AI coaching is unavailable.</h3><p>${escapeHtml(data.reason || 'Provider is unavailable or not configured.')}</p><p>No fake AI output was generated.</p></div>`; updateScooter(SCOOTER_COMPANION_STATES.final_video_unavailable, 'AI coaching is unavailable. No fake output was generated.'); return; }
      const finalScript = data.finalScooterSummary?.script || deriveFinalSummary(data);
      data.finalScooterSummary = { script: finalScript, moment: SCOOTER_MEDIA_MOMENTS.final_summary_dynamic.label, maxWords: 90 };
      localStorage.setItem(aiCardKey, JSON.stringify(data));
      target.innerHTML = renderAiCard(data);
      updateScooter(SCOOTER_COMPANION_STATES.story_text_ready, finalScript);
      target.querySelector('[data-copy-ai-card]')?.addEventListener('click', async () => { const copy = await copyTextToClipboard(formatStoryCardForClipboard(data.storyCard, { title:'AI Pitch Story Card', storyStrengthSignals:data.storyStrengthSignals || [] })); const status=target.querySelector('[data-ai-copy-status]'); if(status) status.textContent = copy.ok ? 'Copied.' : copy.reason; });
      requestAvatarLane(target, finalScript);
    } catch { target.innerHTML = '<div class="boundary-card"><h3>AI coaching is unavailable.</h3><p>The request failed safely. No fake AI output was generated.</p></div>'; updateScooter(SCOOTER_COMPANION_STATES.final_video_unavailable, 'The request failed safely. No fake AI output was generated.'); }
  });
}

attachAiStoryCardControls();
