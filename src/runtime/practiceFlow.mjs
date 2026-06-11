import { PITCH_QUESTIONS, validateAnswer, validatePitchAnswers, normalizeAnswer } from './pitchQuestions.mjs';
import { createLocalDraftStoryCard } from './storyCard.mjs';
import { copyTextToClipboard, formatStoryCardForClipboard } from './clipboard.mjs';
import { DISCLOSURE_COPY } from './disclaimerModel.mjs';
import { SCOOTER_COMPANION_STATES } from './scooterJourneyModel.mjs';

export const STORAGE_ANSWERS_KEY = 'west-peek-pitch-lab.phase3.answers.v1';
export const STORAGE_PROFILE_KEY = 'west-peek-pitch-lab.founder-profile.v1';
export const STORAGE_DECK_CONTEXT_KEY = 'west-peek-pitch-lab.deck-context.v1';
export const STORAGE_PROFILE_CAPTURE_STATUS_KEY = 'west-peek-pitch-lab.profile-capture-status.v1';
export const STORAGE_REHEARSAL_TAKES_KEY = 'west-peek-pitch-lab.practice-out-loud.takes.v2';
export const STORAGE_SELECTED_REHEARSAL_KEY = 'west-peek-pitch-lab.practice-out-loud.selected.v2';

function loadJson(key, fallback = {}) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch { return fallback; }
}
function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function saveProfileCaptureStatus(status) { saveJson(STORAGE_PROFILE_CAPTURE_STATUS_KEY, status); }
async function syncProfileCapture(profile) {
  const consent = {
    profileCaptureNoticeShown: true,
    consentVersion: 'pitch-lab-profile-v1',
    consentedAt: new Date().toISOString(),
    disclaimersAcknowledged: { ai_disclosure: true, answers_private_until_share: true, no_guaranteed_follow_up: true, network_review_only: true }
  };
  try {
    const response = await fetch('/api/pitch/profile-capture', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ founder: profile, consent, aiPersona: 'AI Scooter' }) });
    const body = await response.json().catch(() => ({}));
    const status = body?.ok === true
      ? { ok: true, intakeId: body.intake_id || '', profileId: body.profile_id || '', reviewStatus: body.review_status || 'lead_captured', databaseWriteStatus: body.database_write_status || 'stored', capturedAt: new Date().toISOString() }
      : { ok: false, errorCode: body?.error_code || 'NETWORK_OS_UNAVAILABLE', message: body?.message || 'Profile capture sync is pending.', capturedAt: null };
    saveProfileCaptureStatus(status);
    return status;
  } catch {
    const status = { ok: false, errorCode: 'NETWORK_OS_UNAVAILABLE', message: 'Profile capture sync is pending.', capturedAt: null };
    saveProfileCaptureStatus(status);
    return status;
  }
}
function loadAnswers() { return loadJson(STORAGE_ANSWERS_KEY, {}); }
function saveAnswers(answers) { saveJson(STORAGE_ANSWERS_KEY, answers); }
function loadProfile() { return loadJson(STORAGE_PROFILE_KEY, {}); }
function profileComplete(profile = {}) { return String(profile.name || '').trim().length >= 2 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(profile.email || '').trim()) && String(profile.companyName || '').trim().length >= 2; }
function escapeHtml(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function updateScooter(status, script) {
  const statusNode = document.querySelector('[data-scooter-companion-status]');
  const scriptNode = document.querySelector('[data-scooter-companion-script]');
  if (statusNode && status) statusNode.textContent = status;
  if (scriptNode && script) scriptNode.textContent = script;
}

function answerReadiness(question, value) {
  const length = normalizeAnswer(value).length;
  if (length >= question.minLength) return { state: 'ready', copy: 'Ready for the next prompt.' };
  if (length >= Math.max(1, Math.floor(question.minLength * 0.55))) return { state: 'almost', copy: 'Almost there — add one more specific detail.' };
  return { state: 'start', copy: 'Start with one plain sentence. Specific beats perfect.' };
}

function renderQuestionHelp(question) {
  return `<aside class="answer-helper-panel" aria-label="How to answer this question"><div class="helper-block"><span>Why Scooter asks</span><p>${escapeHtml(question.helper)}</p></div><div class="helper-block"><span>Strong answer hint</span><p>${escapeHtml(question.hint || 'Give one concrete detail a smart outsider could repeat.')}</p></div><div class="helper-block example"><span>Example</span><p>${escapeHtml(question.example || 'Use a specific customer, problem, proof point, or next relationship.')}</p></div><div class="helper-block avoid"><span>Avoid</span><p>${escapeHtml(question.avoid || 'Avoid vague, buzzword-heavy answers.')}</p></div></aside>`;
}

function renderStoryStrengthSignals(signals = []) {
  if (!Array.isArray(signals) || !signals.length) return '';
  return `<div class="strength-panel" aria-label="Story Strength Snapshot"><h3>Story Strength Snapshot</h3><p class="phase-note">Qualitative coaching signals only. This is not a funding prediction or investment rating.</p><div class="strength-grid">${signals.map((item)=>`<article class="strength-item"><h4>${escapeHtml(item.category)}</h4><span>${escapeHtml(item.signal)}</span><p>${escapeHtml(item.guidance)}</p></article>`).join('')}</div></div>`;
}

function renderCardHtml(card) {
  const rows = [
    ['One-line pitch', card.oneLinePitch], ['Company summary', card.companySummary], ['Who it helps', card.whoItHelps], ['Problem', card.problem], ['Traction / proof', card.tractionProof], ['Founder edge', card.founderEdge], ['Why now', card.whyNow], ['Biggest storytelling gap', card.biggestStoryGap], ['Suggested next steps', card.suggestedNextSteps], ['Suggested people or relationships', card.suggestedPeopleOrRelationships]
  ];
  return `<div class="card-status" data-ai-enhanced="false">Local draft · not AI-enhanced</div><p class="phase-note">${escapeHtml(card.notice)}</p>${renderStoryStrengthSignals(card.storyStrengthSignals)}<div class="actions"><button type="button" class="button secondary" data-copy-local-card>Copy Pitch Story Card</button><span class="copy-status" data-local-copy-status></span></div><div class="story-card-grid">${rows.map(([label,value])=>`<article class="story-card-section"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(value)}</p></article>`).join('')}</div>`;
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

function renderProfileGate(root, onComplete) {
  const profile = loadProfile();
  if (profileComplete(profile)) {
    root.innerHTML = `<div class="profile-summary"><strong>${escapeHtml(profile.name)}</strong> · ${escapeHtml(profile.email)} · ${escapeHtml(profile.companyName)} <button type="button" class="button secondary mini" data-edit-profile>Edit profile</button></div>`;
    root.querySelector('[data-edit-profile]')?.addEventListener('click', () => renderProfileForm(root, onComplete));
    onComplete(profile);
    return;
  }
  renderProfileForm(root, onComplete);
}

function renderProfileForm(root, onComplete) {
  const existing = loadProfile();
  root.innerHTML = `<section class="profile-gate boundary-card" aria-labelledby="profile-gate-title"><p class="eyebrow">Start here</p><h2 id="profile-gate-title">Enter your email to begin.</h2><p>${escapeHtml(DISCLOSURE_COPY.profileGate)}</p><div class="next-step-card attention-ready"><strong>Next:</strong> this creates the private session context. Your pitch answers are still private until you choose to share.</div><p class="phase-note" data-profile-sync-status>Your session starts after this step. Pitch answers stay private until you choose to share.</p><form data-profile-form novalidate><label>Name <span class="field-help">Use the name West Peek should recognize if you later share.</span><input name="name" required minlength="2" autocomplete="name" value="${escapeHtml(existing.name || '')}" title="Your name for the founder session." /></label><label>Email <span class="field-help">Used to identify this session and support update/delete requests.</span><input name="email" type="email" required autocomplete="email" value="${escapeHtml(existing.email || '')}" title="Use the email tied to this founder story." /></label><label>Company name <span class="field-help">This anchors the Story Card and packet preview.</span><input name="companyName" required minlength="2" autocomplete="organization" value="${escapeHtml(existing.companyName || '')}" title="Company, project, or founder initiative name." /></label><label>Website optional <span class="field-help">Add only if it helps context. You can leave this blank.</span><input name="website" autocomplete="url" value="${escapeHtml(existing.website || '')}" title="Optional website for context." /></label><p class="field-error" data-profile-error hidden></p><div class="actions"><button class="button primary attention-ready" type="submit">Start AI Scooter practice</button></div></form></section>`;
  root.querySelector('[data-profile-form]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const profile = { name: normalizeAnswer(data.get('name')), email: normalizeAnswer(data.get('email')).toLowerCase(), companyName: normalizeAnswer(data.get('companyName')), website: normalizeAnswer(data.get('website')) };
    const error = root.querySelector('[data-profile-error]');
    if (!profileComplete(profile)) { error.textContent = 'Name, valid email, and company name are required before practice.'; error.hidden = false; return; }
    saveJson(STORAGE_PROFILE_KEY, profile);
    const syncStatus = root.querySelector('[data-profile-sync-status]');
    if (syncStatus) syncStatus.textContent = 'Saving your basic founder profile…';
    syncProfileCapture(profile).then((status) => {
      if (syncStatus) syncStatus.textContent = status.ok ? 'Profile saved. Your pitch answers remain private until you choose to share.' : 'Profile saved for this session. You can continue practice.';
    });
    renderProfileGate(root, onComplete);
  });
}

function hydrateDeckContext() {
  const root = document.querySelector('[data-deck-context-root]');
  if (!root) return;
  const deck = loadJson(STORAGE_DECK_CONTEXT_KEY, null);
  root.innerHTML = `<section class="deck-context-panel boundary-card" aria-labelledby="deck-context-title"><h2 id="deck-context-title">Optional deck-as-context</h2><p>${escapeHtml(DISCLOSURE_COPY.deckUpload)}</p><div class="next-step-card"><strong>Choose one:</strong> skip the deck and answer from scratch, or add deck context so the story prompts have more background.</div><div class="actions"><button type="button" class="button secondary attention-ready" data-no-deck title="Recommended if you want the fastest guided session.">No deck — guide me through pitch practice</button><label class="button secondary file-button" title="Use a deck only as context. Sharing the deck remains separate consent.">Use deck as background context<input type="file" data-deck-file accept=".txt,.md,.pdf,.ppt,.pptx" hidden /></label></div><p class="phase-note" data-deck-status>${deck?.deck_provided ? `Deck context noted: ${escapeHtml(deck.filename)}. Parsing is background context only.` : 'No deck context required.'}</p></section>`;
  root.querySelector('[data-no-deck]')?.addEventListener('click', () => { saveJson(STORAGE_DECK_CONTEXT_KEY, { deck_provided: false, deck_context_used: false }); root.querySelector('[data-deck-status]').textContent = 'No deck context will be used. Continue with AI Scooter practice.'; });
  root.querySelector('[data-deck-file]')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    let summary = '';
    if (/text|markdown|plain/.test(file.type) || /\.(txt|md)$/i.test(file.name)) {
      try { summary = (await file.text()).slice(0, 2000); } catch { summary = ''; }
    }
    saveJson(STORAGE_DECK_CONTEXT_KEY, { deck_provided: true, deck_context_used: Boolean(summary), filename: file.name, summary, parsed_at: new Date().toISOString(), deck_included_with_consent: false });
    root.querySelector('[data-deck-status]').textContent = summary ? `Deck context extracted from ${file.name}. It will inform the story prompts only.` : `Deck received as context (${file.name}), but automatic parsing is unavailable here. Continue with practice questions.`;
  });
}

function renderStep(root, state) {
  const question = PITCH_QUESTIONS[state.index];
  const answer = state.answers[question.id] || '';
  const progress = `${state.index + 1} of ${PITCH_QUESTIONS.length}`;
  const isMidpoint = state.index === 3;
  const prompt = isMidpoint ? 'Midpoint check-in: the shape is forming. Now make the pain specific and the proof concrete.' : question.helper;
  updateScooter(isMidpoint ? SCOOTER_COMPANION_STATES.midpoint_checkin_ready : SCOOTER_COMPANION_STATES.practice_listening, prompt);
  const readiness = answerReadiness(question, answer);
  root.innerHTML = `<section class="practice-flow coaching-thread" aria-labelledby="practice-step-title" data-answer-readiness="${readiness.state}"><div class="progress-row"><span>${escapeHtml(progress)}</span><progress max="${PITCH_QUESTIONS.length}" value="${state.index + 1}"></progress></div><div class="next-step-card ${readiness.state === 'ready' ? 'attention-ready' : ''}" data-next-step-card><strong>Next:</strong> answer this prompt with one specific customer, problem, proof, or relationship signal. <span data-readiness-copy>${escapeHtml(readiness.copy)}</span></div>${isMidpoint ? '<div class="chat-message ai-message" data-midpoint-checkin><strong>AI Scooter:</strong> I’m hearing the shape of it. The customer is getting clearer; now sharpen the pain and proof.</div>' : ''}<div class="chat-message ai-message"><strong>AI Scooter:</strong> ${escapeHtml(question.label)} <span class="helper-text">${escapeHtml(prompt)}</span></div>${renderQuestionHelp(question)}<form data-practice-form novalidate><label for="answer"><span id="practice-step-title">You</span><span class="field-help">Write like you are explaining it to one smart person who has never heard of the company.</span></label><textarea id="answer" name="answer" rows="8" minlength="${question.minLength}" maxlength="${question.maxLength}" placeholder="Answer AI Scooter here. Start rough — specificity matters more than polish." title="Answer this prompt in plain English. The live draft updates as you type.">${escapeHtml(answer)}</textarea><div class="field-meta"><span data-count>${normalizeAnswer(answer).length}</span> / ${question.maxLength} characters · minimum ${question.minLength}</div><p class="field-error" data-error hidden></p><div class="actions"><button type="button" class="button secondary" data-back ${state.index === 0 ? 'disabled' : ''}>Back</button><button type="submit" class="button primary ${readiness.state === 'ready' ? 'attention-ready' : ''}" data-next-question>${state.index === PITCH_QUESTIONS.length - 1 ? 'Create session draft card' : 'Next question'}</button></div></form><p class="phase-note">Answers stay in this session while you practice. AI Scooter will not share them with West Peek unless you explicitly submit a Founder Story Packet.</p></section>`;
  const textarea = root.querySelector('textarea'); const count = root.querySelector('[data-count]'); const error = root.querySelector('[data-error]');
  textarea.addEventListener('input', () => { const normalizedLength = normalizeAnswer(textarea.value).length; count.textContent = String(normalizedLength); error.hidden = true; state.answers[question.id] = textarea.value; saveAnswers(state.answers); updateStoryPreview(state.answers); const readiness = answerReadiness(question, textarea.value); const section = root.querySelector('.practice-flow'); const nextCard = root.querySelector('[data-next-step-card]'); const readinessCopy = root.querySelector('[data-readiness-copy]'); const nextButton = root.querySelector('[data-next-question]'); if (section) section.dataset.answerReadiness = readiness.state; if (readinessCopy) readinessCopy.textContent = readiness.copy; if (nextCard) nextCard.classList.toggle('attention-ready', readiness.state === 'ready'); if (nextButton) nextButton.classList.toggle('attention-ready', readiness.state === 'ready'); });
  root.querySelector('[data-back]')?.addEventListener('click', () => { if (state.index > 0) { state.index -= 1; renderStep(root, state); } });
  root.querySelector('[data-practice-form]').addEventListener('submit', (event) => { event.preventDefault(); const result = validateAnswer(question, textarea.value); if (!result.ok) { error.textContent = result.message; error.hidden = false; return; } state.answers[question.id] = normalizeAnswer(textarea.value); saveAnswers(state.answers); updateStoryPreview(state.answers); if (state.index < PITCH_QUESTIONS.length - 1) { state.index += 1; renderStep(root, state); return; } renderComplete(root, state.answers); });
}

function renderComplete(root, answers) {
  const validation = validatePitchAnswers(answers);
  const card = createLocalDraftStoryCard(answers);
  updateScooter(SCOOTER_COMPANION_STATES.story_text_ready, 'Your Pitch Story Card draft is ready. Next, generate the AI Pitch Story Card when providers are configured.');
  root.innerHTML = `<section class="practice-flow complete" aria-labelledby="practice-complete-title"><p class="eyebrow">Session draft created</p><h2 id="practice-complete-title">Your Pitch Story Card draft is ready.</h2><div class="next-step-card attention-ready"><strong>Next:</strong> go to the Story Card review studio, generate the AI Pitch Story Card, then rehearse out loud if you want a stronger delivery.</div><p>${escapeHtml(card.notice)}</p><div class="actions"><button type="button" class="button secondary" data-edit>Edit answers</button><a class="button primary attention-ready" href="/story-card">View Pitch Story Card</a></div><p class="phase-note">Founder Story Packet sharing remains separate and consent-gated. You can update and come back later.</p></section>`;

  if (!validation.ok) root.querySelector('p').textContent = 'Some required answers still need more detail.';
  root.querySelector('[data-edit]')?.addEventListener('click', () => renderStep(root, { index: 0, answers }));
}

export function hydratePracticeFlow() {
  const root = document.querySelector('[data-practice-root]');
  const gate = document.querySelector('[data-founder-profile-gate]');
  if (!root || !gate) return;
  const answers = loadAnswers();
  updateStoryPreview(answers);
  hydrateDeckContext();
  renderProfileGate(gate, () => renderStep(root, { index: 0, answers }));
}

export function hydrateStoryCard() {
  const root = document.querySelector('[data-story-card-root]');
  if (!root) return;
  const answers = loadAnswers();
  const card = createLocalDraftStoryCard(answers);
  root.innerHTML = renderCardHtml(card);
  root.querySelector('[data-copy-local-card]')?.addEventListener('click', async () => { const copy = await copyTextToClipboard(formatStoryCardForClipboard(card, { title: 'Local Draft Pitch Story Card', storyStrengthSignals: card.storyStrengthSignals || [] })); const status = root.querySelector('[data-local-copy-status]'); if (status) status.textContent = copy.ok ? 'Copied.' : copy.reason; });
}

function loadRehearsalTakes() { return loadJson(STORAGE_REHEARSAL_TAKES_KEY, { takes: [] }); }
function saveRehearsalTakes(value) { saveJson(STORAGE_REHEARSAL_TAKES_KEY, value); }
function loadSelectedRehearsal() { return loadJson(STORAGE_SELECTED_REHEARSAL_KEY, null); }
function saveSelectedRehearsal(value) { saveJson(STORAGE_SELECTED_REHEARSAL_KEY, value); }
function takeLabel(index) { return `Take ${index + 1}`; }
function formatSeconds(total = 0) { const safe = Math.max(0, Math.floor(total)); return `${String(Math.floor(safe / 60)).padStart(2,'0')}:${String(safe % 60).padStart(2,'0')}`; }
function rehearsalDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
    const request = indexedDB.open('west-peek-pitch-lab-rehearsal-v2', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('takes');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB unavailable'));
  });
}
async function putTakeBlob(id, blob) {
  const db = await rehearsalDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('takes', 'readwrite');
    tx.objectStore('takes').put(blob, id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error('Could not save recording'));
  });
  db.close();
}
async function getTakeBlob(id) {
  const db = await rehearsalDb();
  const blob = await new Promise((resolve, reject) => {
    const tx = db.transaction('takes', 'readonly');
    const req = tx.objectStore('takes').get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error('Could not read recording'));
  });
  db.close();
  return blob;
}
async function deleteTakeBlob(id) {
  try {
    const db = await rehearsalDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('takes', 'readwrite');
      tx.objectStore('takes').delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Could not delete recording'));
    });
    db.close();
  } catch {}
}
function buildLocalRehearsalCoaching(take = {}) {
  const transcript = normalizeAnswer(take.transcript || take.selfTranscript || '');
  const length = transcript.length;
  const lower = transcript.toLowerCase();
  const checks = [
    ['Plain-English opening', length > 120 ? 'Present' : 'Needs a stronger first 15 seconds', length > 120 ? 'The pitch has enough material to review.' : 'Open with who you help and what changes for them.'],
    ['Customer and pain', /customer|user|client|buyer|founder|company|people|team/.test(lower) && /problem|pain|struggle|hard|cost|waste|delay|risk/.test(lower) ? 'Present' : 'Needs sharpening', 'Name the exact person and the expensive pain they already feel.'],
    ['Proof or traction', /revenue|pilot|users|customers|loi|waitlist|partner|traction|proof|paid|growth/.test(lower) ? 'Present' : 'Add proof', 'Give one concrete proof point: revenue, users, pilots, LOIs, partnerships, or customer pull.'],
    ['Ask / next relationship', /ask|intro|partner|investor|customer|advisor|operator|relationship|help/.test(lower) ? 'Present' : 'Make the ask explicit', 'Close with the next useful relationship AI Scooter should remember.']
  ];
  return checks.map(([category, signal, guidance]) => ({ category, signal, guidance }));
}
function selectedRehearsalSummary() {
  const selected = loadSelectedRehearsal();
  if (!selected?.id) return null;
  const takes = loadRehearsalTakes().takes || [];
  const take = takes.find((item) => item.id === selected.id);
  return take ? { ...take, selectedWithConsent: selected.selectedWithConsent === true, selectedAt: selected.selectedAt } : null;
}
function renderTakeList(root, playback, setStatus) {
  const list = root.querySelector('[data-take-list]');
  if (!list) return;
  const takes = loadRehearsalTakes().takes || [];
  const selected = loadSelectedRehearsal();
  if (!takes.length) {
    list.innerHTML = '<p class="phase-note">No takes recorded yet. Open the camera room, record, then choose your best take.</p>';
    return;
  }
  list.innerHTML = takes.map((take, index) => {
    const active = selected?.id === take.id;
    return `<article class="take-row ${active ? 'selected' : ''}" data-take-id="${escapeHtml(take.id)}"><div><strong>${takeLabel(index)}</strong><p>${escapeHtml(formatSeconds(take.durationSeconds))} · ${escapeHtml(take.createdAtLabel || 'Recorded locally')}</p><p>${escapeHtml(take.transcript ? take.transcript.slice(0, 140) : 'No transcript saved yet. Add one before sharing for the strongest packet.')}${take.transcript && take.transcript.length > 140 ? '…' : ''}</p></div><div class="take-actions"><button type="button" class="button secondary mini" data-play-take="${escapeHtml(take.id)}">Play</button><button type="button" class="button primary mini" data-select-take="${escapeHtml(take.id)}">${active ? 'Selected' : 'Choose best'}</button><button type="button" class="button secondary mini" data-delete-take="${escapeHtml(take.id)}">Delete</button></div></article>`;
  }).join('');
  list.querySelectorAll('[data-play-take]').forEach((button) => button.addEventListener('click', async () => {
    const id = button.getAttribute('data-play-take');
    try {
      const blob = await getTakeBlob(id);
      if (!blob) { setStatus('This recording is no longer available in this browser.'); return; }
      if (playback.src) URL.revokeObjectURL(playback.src);
      playback.src = URL.createObjectURL(blob);
      playback.hidden = false;
      await playback.play().catch(() => {});
      setStatus('Playing local rehearsal take. It has not been uploaded.');
    } catch { setStatus('Could not open this local take.'); }
  }));
  list.querySelectorAll('[data-select-take]').forEach((button) => button.addEventListener('click', () => {
    const id = button.getAttribute('data-select-take');
    const take = (loadRehearsalTakes().takes || []).find((item) => item.id === id);
    saveSelectedRehearsal({ id, selectedAt: new Date().toISOString(), selectedWithConsent: false });
    root.querySelector('[data-consent-selected-take]').checked = false;
    root.querySelector('[data-coaching-review]').innerHTML = renderCoachingReview(take);
    renderTakeList(root, playback, setStatus);
    setStatus('Best take selected. Add consent below if you want its transcript/status included with the Founder Story Packet.');
  }));
  list.querySelectorAll('[data-delete-take]').forEach((button) => button.addEventListener('click', async () => {
    const id = button.getAttribute('data-delete-take');
    await deleteTakeBlob(id);
    const remaining = (loadRehearsalTakes().takes || []).filter((item) => item.id !== id);
    saveRehearsalTakes({ takes: remaining });
    if (loadSelectedRehearsal()?.id === id) saveSelectedRehearsal(null);
    renderTakeList(root, playback, setStatus);
    root.querySelector('[data-coaching-review]').innerHTML = renderCoachingReview(selectedRehearsalSummary());
    setStatus('Take deleted from this browser.');
  }));
}
function renderCoachingReview(take) {
  if (!take?.id) return '<p class="phase-note">After recording, choose a best take. AI Scooter will give a structured review using your transcript or self-review notes.</p>';
  const coaching = buildLocalRehearsalCoaching(take);
  return `<div class="rehearsal-review"><div class="panel-title-row"><div><p class="eyebrow">Playback + coaching</p><h3>AI Scooter review of selected take</h3></div><span class="session-pill">Structured review</span></div><div class="strength-grid">${coaching.map((item)=>`<article class="strength-item"><h4>${escapeHtml(item.category)}</h4><span>${escapeHtml(item.signal)}</span><p>${escapeHtml(item.guidance)}</p></article>`).join('')}</div><p class="phase-note">This is a local coaching review, not an investment rating. For stronger feedback, paste or dictate the transcript from the take.</p></div>`;
}

export function hydratePracticeOutLoud() {
  const root = document.querySelector('[data-practice-out-loud-root]');
  if (!root) return;
  const selected = selectedRehearsalSummary();
  root.innerHTML = `<div class="camera-practice rehearsal-room" data-rehearsal-state="ready">
    <div class="rehearsal-brief">
      <p class="eyebrow">Practice Out Loud</p>
      <h3>Rehearse your 60-second pitch in a private camera room.</h3>
      <p>AI Scooter stays present. You turn on camera/mic, get a countdown, record one or more takes, watch playback, add or dictate a transcript, choose the best take, then decide whether the transcript/status should travel with the Founder Story Packet.</p>
      <div class="journey-mini-steps" aria-label="Practice Out Loud steps"><span>1 Camera</span><span>2 Countdown</span><span>3 Record</span><span>4 Playback</span><span>5 Choose</span><span>6 Consent</span></div>
      <div class="session-status-grid"><span>Local camera room</span><span>Multiple takes</span><span>Transcript optional</span><span>Consent before share</span></div>
    </div>
    <div class="camera-room-shell">
      <div class="camera-stage">
        <video data-camera-preview playsinline muted></video>
        <div class="camera-overlay"><span data-countdown-display>Ready</span><span data-recording-timer>00:00</span></div>
        <div class="camera-prompt"><strong>AI Scooter:</strong> Pitch me like I’m hearing this for the first time. Keep it plain. Tell me the customer, the pain, the proof, and the next useful relationship.</div>
      </div>
      <div class="camera-controls">
        <button type="button" class="button secondary" data-start-camera title="Browser permission prompt opens here. Video stays local.">Turn on camera/mic</button>
        <button type="button" class="button primary" data-start-countdown disabled title="Enabled after camera/mic permission is granted.">Start 3-second countdown</button>
        <button type="button" class="button secondary" data-stop-recording disabled title="Stop when your 60-second pitch is done.">Stop take</button>
      </div>
      <p class="phase-note" data-camera-status>Camera rehearsal is optional and local-first. No video uploads from this screen.</p>
      <video data-recording-playback controls hidden></video>
    </div>
    <section class="transcript-room boundary-card" aria-labelledby="rehearsal-transcript-title">
      <div class="panel-title-row"><div><p class="eyebrow">Transcript / self-review</p><h3 id="rehearsal-transcript-title">Help AI Scooter coach the take.</h3></div><button type="button" class="button secondary mini" data-start-transcript>Dictate transcript</button></div>
      <textarea data-rehearsal-transcript rows="5" maxlength="2200" placeholder="Paste or dictate what you said in the selected take. If browser speech recognition is available, use Dictate transcript while you pitch.">${escapeHtml(selected?.transcript || '')}</textarea>
      <div class="actions"><button type="button" class="button secondary" data-save-transcript>Save transcript to selected take</button></div>
      <p class="phase-note" data-transcript-status>Transcript is optional, but it makes coaching and sharing more useful.</p>
    </section>
    <section class="take-library boundary-card" aria-labelledby="take-library-title"><div class="panel-title-row"><div><p class="eyebrow">Choose Best Take</p><h3 id="take-library-title">Your local rehearsal takes</h3></div></div><div data-take-list></div></section>
    <section class="boundary-card" aria-label="Selected rehearsal coaching"><div data-coaching-review>${renderCoachingReview(selected)}</div></section>
    <section class="consent-gate-card boundary-card" aria-labelledby="rehearsal-consent-title"><p class="eyebrow">Consent Gate</p><h3 id="rehearsal-consent-title">Attach rehearsal context to the Founder Story Packet?</h3><p>The selected video remains local unless a storage/upload path is enabled later. Today, consent can attach the selected take status and transcript text to the packet.</p><label class="checkbox-row"><input type="checkbox" data-consent-selected-take ${selected?.selectedWithConsent ? 'checked' : ''} /> Include my selected rehearsal take transcript/status with my Founder Story Packet.</label><p class="phase-note" data-rehearsal-consent-status>${selected?.selectedWithConsent ? 'Selected take context is marked for packet inclusion.' : 'Nothing from camera rehearsal is included unless you choose this.'}</p></section>
  </div>`;

  const preview = root.querySelector('[data-camera-preview]');
  const playback = root.querySelector('[data-recording-playback]');
  const status = root.querySelector('[data-camera-status]');
  const transcriptStatus = root.querySelector('[data-transcript-status]');
  const startCamera = root.querySelector('[data-start-camera]');
  const startCountdown = root.querySelector('[data-start-countdown]');
  const stopRecording = root.querySelector('[data-stop-recording]');
  const countdownDisplay = root.querySelector('[data-countdown-display]');
  const timerDisplay = root.querySelector('[data-recording-timer]');
  const transcript = root.querySelector('[data-rehearsal-transcript]');
  const consent = root.querySelector('[data-consent-selected-take]');
  const consentStatus = root.querySelector('[data-rehearsal-consent-status]');
  let stream, recorder, startedAt = 0, timerId = null, chunks = [], speechRecognition = null;
  const setStatus = (copy) => { status.textContent = copy; };
  renderTakeList(root, playback, setStatus);

  function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }
  function startTimer() { startedAt = Date.now(); timerDisplay.textContent = '00:00'; timerId = setInterval(() => { timerDisplay.textContent = formatSeconds((Date.now() - startedAt) / 1000); }, 250); }
  async function startRecording() {
    if (!stream || typeof MediaRecorder === 'undefined') { setStatus('Local recording is unavailable in this browser.'); return; }
    chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      stopTimer();
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      const id = `take-${Date.now()}`;
      const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
      try { await putTakeBlob(id, blob); } catch { setStatus('Take recorded, but this browser could not persist the video blob. Metadata still saved.'); }
      const existing = loadRehearsalTakes().takes || [];
      const newTake = { id, durationSeconds, mimeType: blob.type, transcript: normalizeAnswer(transcript.value), createdAt: new Date().toISOString(), createdAtLabel: new Date().toLocaleString(), coachingSignals: buildLocalRehearsalCoaching({ transcript: transcript.value }) };
      saveRehearsalTakes({ takes: [newTake, ...existing].slice(0, 6) });
      saveSelectedRehearsal({ id, selectedAt: new Date().toISOString(), selectedWithConsent: false });
      consent.checked = false;
      root.querySelector('[data-coaching-review]').innerHTML = renderCoachingReview(newTake);
      renderTakeList(root, playback, setStatus);
      if (playback.src) URL.revokeObjectURL(playback.src);
      playback.src = URL.createObjectURL(blob);
      playback.hidden = false;
      deleteRecordingArtifactsOverLimit();
      setStatus('Take saved locally. Watch it back, revise the transcript, then choose whether it can be included with the packet.');
      stopRecording.disabled = true; startCountdown.disabled = false; countdownDisplay.textContent = 'Ready';
    };
    recorder.start();
    startTimer();
    stopRecording.disabled = false; startCountdown.disabled = true; countdownDisplay.textContent = 'Recording'; setStatus('Recording locally…');
  }
  async function deleteRecordingArtifactsOverLimit() {
    const takes = loadRehearsalTakes().takes || [];
    for (const extra of takes.slice(6)) await deleteTakeBlob(extra.id);
  }
  startCamera.addEventListener('click', async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      preview.srcObject = stream; await preview.play(); startCountdown.disabled = false; setStatus('Camera/mic are on locally. Nothing is uploaded.');
      updateScooter(SCOOTER_COMPANION_STATES.practice_listening, 'Good. When you are ready, I’ll count you down. Pitch me like I’m hearing this for the first time.');
    } catch { setStatus('Camera permission was unavailable or denied. You can still create and share a Founder Story Packet without video practice.'); }
  });
  startCountdown.addEventListener('click', async () => {
    for (const label of ['3','2','1']) {
      countdownDisplay.textContent = label;
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    countdownDisplay.textContent = 'Go';
    await startRecording();
  });
  stopRecording.addEventListener('click', () => { if (recorder && recorder.state !== 'inactive') recorder.stop(); });
  root.querySelector('[data-save-transcript]').addEventListener('click', () => {
    const selectedState = loadSelectedRehearsal();
    if (!selectedState?.id) { transcriptStatus.textContent = 'Record and choose a take before saving transcript.'; return; }
    const takes = loadRehearsalTakes().takes || [];
    const updated = takes.map((take) => take.id === selectedState.id ? { ...take, transcript: normalizeAnswer(transcript.value), coachingSignals: buildLocalRehearsalCoaching({ transcript: transcript.value }) } : take);
    saveRehearsalTakes({ takes: updated });
    const selectedTake = updated.find((take) => take.id === selectedState.id);
    root.querySelector('[data-coaching-review]').innerHTML = renderCoachingReview(selectedTake);
    renderTakeList(root, playback, setStatus);
    transcriptStatus.textContent = 'Transcript saved to selected take.';
  });
  root.querySelector('[data-start-transcript]').addEventListener('click', () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) { transcriptStatus.textContent = 'Dictation is not available in this browser. You can paste or type the transcript instead.'; return; }
    if (speechRecognition) { speechRecognition.stop(); speechRecognition = null; transcriptStatus.textContent = 'Dictation stopped.'; return; }
    speechRecognition = new Speech(); speechRecognition.continuous = true; speechRecognition.interimResults = true; speechRecognition.lang = 'en-US';
    let finalText = transcript.value ? `${transcript.value.trim()} ` : '';
    speechRecognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += `${text} `; else interim += text;
      }
      transcript.value = `${finalText}${interim}`.trim();
    };
    speechRecognition.onend = () => { speechRecognition = null; transcriptStatus.textContent = 'Dictation paused. Save transcript to attach it to the selected take.'; };
    speechRecognition.start(); transcriptStatus.textContent = 'Dictation running locally in your browser. Speak your pitch.';
  });
  consent.addEventListener('change', () => {
    const selectedState = loadSelectedRehearsal();
    if (!selectedState?.id) { consent.checked = false; consentStatus.textContent = 'Choose a best take before attaching rehearsal context.'; return; }
    saveSelectedRehearsal({ ...selectedState, selectedWithConsent: consent.checked, consentedAt: consent.checked ? new Date().toISOString() : null });
    consentStatus.textContent = consent.checked ? 'Selected take transcript/status will be included if you share the Founder Story Packet.' : 'Selected take context removed from packet inclusion.';
  });
}

hydratePracticeFlow();
hydrateStoryCard();
hydratePracticeOutLoud();
