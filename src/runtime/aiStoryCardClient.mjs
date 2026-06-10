import { createLocalDraftStoryCard } from './storyCard.mjs';
import { copyTextToClipboard, formatStoryCardForClipboard } from './clipboard.mjs';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function renderStoryStrengthSignals(signals = []) {
  if (!Array.isArray(signals) || !signals.length) return '';
  return `
    <div class="strength-panel" aria-label="Story Strength Snapshot">
      <h3>Story Strength Snapshot</h3>
      <p class="phase-note">Qualitative coaching signals only. This is not a funding prediction, investment rating, or West Peek investment decision.</p>
      <div class="strength-grid">
        ${signals.map((item) => `<article class="strength-item"><h4>${escapeHtml(item.category)}</h4><span>${escapeHtml(item.signal)}</span><p>${escapeHtml(item.guidance)}</p></article>`).join('')}
      </div>
    </div>
  `;
}

function readAnswers() {
  try {
    return JSON.parse(localStorage.getItem('west-peek-pitch-lab.phase3.answers.v1') || '{}');
  } catch {
    return {};
  }
}

function renderAiCard(result) {
  const card = result.storyCard;
  const rows = [
    ['One-line pitch', card.oneLinePitch],
    ['Company summary', card.companySummary],
    ['Customer', card.customer],
    ['Problem', card.problem],
    ['Solution', card.solution],
    ['Proof / traction', card.proofTraction],
    ['Founder edge', card.founderEdge],
    ['Why now', card.whyNow],
    ['Biggest story gap', card.biggestStoryGap],
    ['Biggest objection', card.biggestObjection],
    ['Suggested next relationships', card.suggestedNextRelationships],
    ['Next steps', card.nextSteps]
  ];
  return `
    <div class="card-status" data-ai-enhanced="true">AI-enhanced Pitch Story Card · share still inactive</div>
    <p class="phase-note">${escapeHtml(result.disclosure)}</p>
    ${renderStoryStrengthSignals(result.storyStrengthSignals)}
    <div class="actions"><button type="button" class="button secondary" data-copy-ai-card>Copy Pitch Story Card</button><span class="copy-status" data-ai-copy-status></span></div>
    <div class="critique-panel">
      <h3>AI Scooter critique</h3>
      <ul>
        <li><strong>Clear:</strong> ${escapeHtml(result.critique.whatIsClear)}</li>
        <li><strong>Confusing:</strong> ${escapeHtml(result.critique.whatIsConfusing)}</li>
        <li><strong>Generic:</strong> ${escapeHtml(result.critique.whatSoundsGeneric)}</li>
        <li><strong>Proof:</strong> ${escapeHtml(result.critique.needsStrongerProof)}</li>
        <li><strong>Likely objection:</strong> ${escapeHtml(result.critique.likelyObjection)}</li>
        <li><strong>Better story angle:</strong> ${escapeHtml(result.critique.betterStoryAngle)}</li>
        <li><strong>Next question:</strong> ${escapeHtml(result.critique.suggestedNextQuestion)}</li>
      </ul>
    </div>
    <div class="story-card-grid">
      ${rows.map(([label, value]) => `<article class="story-card-section"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(value)}</p></article>`).join('')}
    </div>
  `;
}

export function attachAiStoryCardControls() {
  const target = document.querySelector('[data-ai-story-card-root]');
  const button = document.querySelector('[data-generate-ai-card]');
  if (!target || !button) return;

  button.addEventListener('click', async () => {
    const answers = readAnswers();
    const localCard = createLocalDraftStoryCard(answers);
    if (localCard.validation && !localCard.validation.ok) {
      target.innerHTML = `<div class="boundary-card"><h3>Finish the local practice flow first.</h3><p>AI generation requires all seven founder answers to pass validation.</p></div>`;
      return;
    }
    target.innerHTML = '<p class="phase-note">Generating AI Pitch Story Card…</p>';
    try {
      const response = await fetch('/api/pitch/story-card', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await response.json();
      if (!response.ok || data.status === 'ai_unavailable') {
        target.innerHTML = `<div class="boundary-card"><h3>AI coaching is unavailable.</h3><p>${escapeHtml(data.reason || 'Provider is unavailable or not configured.')}</p><p>No fake AI output was generated.</p></div>`;
        return;
      }
      localStorage.setItem('west-peek-pitch-lab.phase4.ai-story-card.v1', JSON.stringify(data));
      target.innerHTML = renderAiCard(data);
      target.querySelector('[data-copy-ai-card]')?.addEventListener('click', async () => {
        const copy = await copyTextToClipboard(formatStoryCardForClipboard(data.storyCard, { title: 'AI Pitch Story Card', storyStrengthSignals: data.storyStrengthSignals || [] }));
        const status = target.querySelector('[data-ai-copy-status]');
        if (status) status.textContent = copy.ok ? 'Copied.' : copy.reason;
      });
    } catch (error) {
      target.innerHTML = '<div class="boundary-card"><h3>AI coaching is unavailable.</h3><p>The request failed safely. No fake AI output was generated.</p></div>';
    }
  });
}

attachAiStoryCardControls();
