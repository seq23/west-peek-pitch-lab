import { PITCH_QUESTIONS, validateAnswer, validatePitchAnswers, normalizeAnswer } from './pitchQuestions.mjs';
import { createLocalDraftStoryCard } from './storyCard.mjs';
import { PHASE_3_CONSENT_STATE } from './consent.mjs';
import { copyTextToClipboard, formatStoryCardForClipboard } from './clipboard.mjs';

const storageKey = 'west-peek-pitch-lab.phase3.answers.v1';

function loadAnswers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function saveAnswers(answers) {
  localStorage.setItem(storageKey, JSON.stringify(answers));
}

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
      <p class="phase-note">Qualitative coaching signals only. This is not a funding prediction or investment rating.</p>
      <div class="strength-grid">
        ${signals.map((item) => `<article class="strength-item"><h4>${escapeHtml(item.category)}</h4><span>${escapeHtml(item.signal)}</span><p>${escapeHtml(item.guidance)}</p></article>`).join('')}
      </div>
    </div>
  `;
}

function renderCardHtml(card) {
  const rows = [
    ['One-line pitch', card.oneLinePitch],
    ['Company summary', card.companySummary],
    ['Who it helps', card.whoItHelps],
    ['Problem', card.problem],
    ['Traction / proof', card.tractionProof],
    ['Founder edge', card.founderEdge],
    ['Why now', card.whyNow],
    ['Biggest storytelling gap', card.biggestStoryGap],
    ['Suggested next steps', card.suggestedNextSteps],
    ['Suggested people or relationships', card.suggestedPeopleOrRelationships]
  ];
  return `
    <div class="card-status" data-ai-enhanced="false">Local draft · not AI-enhanced</div>
    <p class="phase-note">${escapeHtml(card.notice)}</p>
    ${renderStoryStrengthSignals(card.storyStrengthSignals)}
    <div class="actions"><button type="button" class="button secondary" data-copy-local-card>Copy Pitch Story Card</button><span class="copy-status" data-local-copy-status></span></div>
    <div class="story-card-grid">
      ${rows
        .map(([label, value]) => `<article class="story-card-section"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(value)}</p></article>`)
        .join('')}
    </div>
  `;
}

function updateStoryPreview(answers) {
  const target = document.querySelector('[data-story-card-preview]');
  if (!target) return;
  const card = createLocalDraftStoryCard(answers);
  target.innerHTML = renderCardHtml(card);
  target.querySelector('[data-copy-local-card]')?.addEventListener('click', async () => {
    const copy = await copyTextToClipboard(formatStoryCardForClipboard(card, { title: 'Local Draft Pitch Story Card', storyStrengthSignals: card.storyStrengthSignals || [] }));
    const status = target.querySelector('[data-local-copy-status]');
    if (status) status.textContent = copy.ok ? 'Copied.' : copy.reason;
  });
}

function renderStep(root, state) {
  const question = PITCH_QUESTIONS[state.index];
  const answer = state.answers[question.id] || '';
  const progress = `${state.index + 1} of ${PITCH_QUESTIONS.length}`;
  root.innerHTML = `
    <section class="practice-flow" aria-labelledby="practice-step-title">
      <div class="progress-row">
        <span>${escapeHtml(progress)}</span>
        <progress max="${PITCH_QUESTIONS.length}" value="${state.index + 1}"></progress>
      </div>
      <form data-practice-form novalidate>
        <label for="answer"><span id="practice-step-title">${escapeHtml(question.label)}</span></label>
        <p class="helper-text">${escapeHtml(question.helper)}</p>
        <textarea id="answer" name="answer" rows="8" minlength="${question.minLength}" maxlength="${question.maxLength}">${escapeHtml(answer)}</textarea>
        <div class="field-meta"><span data-count>${normalizeAnswer(answer).length}</span> / ${question.maxLength} characters</div>
        <p class="field-error" data-error hidden></p>
        <div class="actions">
          <button type="button" class="button secondary" data-back ${state.index === 0 ? 'disabled' : ''}>Back</button>
          <button type="submit" class="button primary">${state.index === PITCH_QUESTIONS.length - 1 ? 'Create local draft card' : 'Next question'}</button>
        </div>
      </form>
      <p class="phase-note">Phase 3 stores answers in this browser only. No AI call, email, avatar generation, or Network OS handoff runs here.</p>
    </section>
  `;

  const textarea = root.querySelector('textarea');
  const count = root.querySelector('[data-count]');
  const error = root.querySelector('[data-error]');

  textarea.addEventListener('input', () => {
    count.textContent = String(normalizeAnswer(textarea.value).length);
    error.hidden = true;
    state.answers[question.id] = textarea.value;
    saveAnswers(state.answers);
    updateStoryPreview(state.answers);
  });

  root.querySelector('[data-back]')?.addEventListener('click', () => {
    if (state.index > 0) {
      state.index -= 1;
      renderStep(root, state);
    }
  });

  root.querySelector('[data-practice-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const result = validateAnswer(question, textarea.value);
    if (!result.ok) {
      error.textContent = result.message;
      error.hidden = false;
      return;
    }
    state.answers[question.id] = normalizeAnswer(textarea.value);
    saveAnswers(state.answers);
    updateStoryPreview(state.answers);
    if (state.index < PITCH_QUESTIONS.length - 1) {
      state.index += 1;
      renderStep(root, state);
      return;
    }
    renderComplete(root, state.answers);
  });
}

function renderComplete(root, answers) {
  const validation = validatePitchAnswers(answers);
  const card = createLocalDraftStoryCard(answers);
  root.innerHTML = `
    <section class="practice-flow complete" aria-labelledby="practice-complete-title">
      <p class="eyebrow">Local draft created</p>
      <h2 id="practice-complete-title">Your local Pitch Story Card shell is ready.</h2>
      <p>${escapeHtml(card.notice)}</p>
      <div class="actions">
        <button type="button" class="button secondary" data-edit>Edit answers</button>
        <a class="button primary" href="/story-card">View local draft card</a>
      </div>
      <p class="phase-note">Share with West Peek remains inactive until Phase 7. Email remains deferred.</p>
    </section>
  `;
  if (!validation.ok) root.querySelector('p').textContent = 'Some required answers still need more detail.';
  root.querySelector('[data-edit]')?.addEventListener('click', () => renderStep(root, { index: 0, answers }));
}

export function hydratePracticeFlow() {
  const root = document.querySelector('[data-practice-root]');
  if (!root) return;
  const answers = loadAnswers();
  updateStoryPreview(answers);
  renderStep(root, { index: 0, answers });
}

export function hydrateStoryCard() {
  const root = document.querySelector('[data-story-card-root]');
  if (!root) return;
  const answers = loadAnswers();
  const card = createLocalDraftStoryCard(answers);
  root.innerHTML = renderCardHtml(card);
  root.querySelector('[data-copy-local-card]')?.addEventListener('click', async () => {
    const copy = await copyTextToClipboard(formatStoryCardForClipboard(card, { title: 'Local Draft Pitch Story Card', storyStrengthSignals: card.storyStrengthSignals || [] }));
    const status = root.querySelector('[data-local-copy-status]');
    if (status) status.textContent = copy.ok ? 'Copied.' : copy.reason;
  });
}

export function hydrateShareBoundary() {
  const root = document.querySelector('[data-share-boundary]');
  if (!root) return;
  root.innerHTML = `
    <div class="boundary-card">
      <h2>Sharing is intentionally inactive in Phase 3.</h2>
      <p>${escapeHtml(PHASE_3_CONSENT_STATE.reason)}</p>
      <ul>
        <li>No email is sent.</li>
        <li>No Network OS intake is created.</li>
        <li>No contact is created.</li>
        <li>No human review is implied.</li>
      </ul>
    </div>
  `;
}

hydratePracticeFlow();
hydrateStoryCard();
hydrateShareBoundary();
