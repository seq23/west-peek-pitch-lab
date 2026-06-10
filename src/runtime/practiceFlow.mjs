import { PITCH_QUESTIONS, validateAnswer, validatePitchAnswers, normalizeAnswer } from './pitchQuestions.mjs';
import { createLocalDraftStoryCard } from './storyCard.mjs';
import { copyTextToClipboard, formatStoryCardForClipboard } from './clipboard.mjs';
import { DISCLOSURE_COPY } from './disclaimerModel.mjs';
import { SCOOTER_COMPANION_STATES } from './scooterJourneyModel.mjs';

export const STORAGE_ANSWERS_KEY = 'west-peek-pitch-lab.phase3.answers.v1';
export const STORAGE_PROFILE_KEY = 'west-peek-pitch-lab.founder-profile.v1';
export const STORAGE_DECK_CONTEXT_KEY = 'west-peek-pitch-lab.deck-context.v1';
export const STORAGE_PROFILE_CAPTURE_STATUS_KEY = 'west-peek-pitch-lab.profile-capture-status.v1';

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
  root.innerHTML = `<section class="profile-gate boundary-card" aria-labelledby="profile-gate-title"><p class="eyebrow">Start here</p><h2 id="profile-gate-title">Enter your email to begin.</h2><p>${escapeHtml(DISCLOSURE_COPY.profileGate)}</p><p class="phase-note" data-profile-sync-status>Basic profile sync starts after you submit. Pitch answers stay private until packet consent.</p><form data-profile-form novalidate><label>Name <input name="name" required minlength="2" autocomplete="name" value="${escapeHtml(existing.name || '')}" /></label><label>Email <input name="email" type="email" required autocomplete="email" value="${escapeHtml(existing.email || '')}" /></label><label>Company name <input name="companyName" required minlength="2" autocomplete="organization" value="${escapeHtml(existing.companyName || '')}" /></label><label>Website optional <input name="website" autocomplete="url" value="${escapeHtml(existing.website || '')}" /></label><p class="field-error" data-profile-error hidden></p><div class="actions"><button class="button primary" type="submit">Start AI Scooter practice</button></div></form></section>`;
  root.querySelector('[data-profile-form]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const profile = { name: normalizeAnswer(data.get('name')), email: normalizeAnswer(data.get('email')).toLowerCase(), companyName: normalizeAnswer(data.get('companyName')), website: normalizeAnswer(data.get('website')) };
    const error = root.querySelector('[data-profile-error]');
    if (!profileComplete(profile)) { error.textContent = 'Name, valid email, and company name are required before practice.'; error.hidden = false; return; }
    saveJson(STORAGE_PROFILE_KEY, profile);
    const syncStatus = root.querySelector('[data-profile-sync-status]');
    if (syncStatus) syncStatus.textContent = 'Saving your basic founder profile to West Peek Network OS…';
    syncProfileCapture(profile).then((status) => {
      if (syncStatus) syncStatus.textContent = status.ok ? 'Profile synced. Your pitch answers remain private until you choose to share.' : 'Profile saved locally. Server sync is pending; you can continue practice.';
    });
    renderProfileGate(root, onComplete);
  });
}

function hydrateDeckContext() {
  const root = document.querySelector('[data-deck-context-root]');
  if (!root) return;
  const deck = loadJson(STORAGE_DECK_CONTEXT_KEY, null);
  root.innerHTML = `<section class="deck-context-panel boundary-card" aria-labelledby="deck-context-title"><h2 id="deck-context-title">Optional deck-as-context</h2><p>${escapeHtml(DISCLOSURE_COPY.deckUpload)}</p><div class="actions"><button type="button" class="button secondary" data-no-deck>No deck — guide me through pitch practice</button><label class="button secondary file-button">Use deck as background context<input type="file" data-deck-file accept=".txt,.md,.pdf,.ppt,.pptx" hidden /></label></div><p class="phase-note" data-deck-status>${deck?.deck_provided ? `Deck context noted: ${escapeHtml(deck.filename)}. Parsing is background context only.` : 'No deck context required.'}</p></section>`;
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
  root.innerHTML = `<section class="practice-flow coaching-thread" aria-labelledby="practice-step-title"><div class="progress-row"><span>${escapeHtml(progress)}</span><progress max="${PITCH_QUESTIONS.length}" value="${state.index + 1}"></progress></div>${isMidpoint ? '<div class="chat-message ai-message" data-midpoint-checkin><strong>AI Scooter:</strong> I’m hearing the shape of it. The customer is getting clearer; now sharpen the pain and proof.</div>' : ''}<div class="chat-message ai-message"><strong>AI Scooter:</strong> ${escapeHtml(question.label)} <span class="helper-text">${escapeHtml(prompt)}</span></div><form data-practice-form novalidate><label for="answer"><span id="practice-step-title">You</span></label><textarea id="answer" name="answer" rows="8" minlength="${question.minLength}" maxlength="${question.maxLength}" placeholder="Answer AI Scooter here...">${escapeHtml(answer)}</textarea><div class="field-meta"><span data-count>${normalizeAnswer(answer).length}</span> / ${question.maxLength} characters</div><p class="field-error" data-error hidden></p><div class="actions"><button type="button" class="button secondary" data-back ${state.index === 0 ? 'disabled' : ''}>Back</button><button type="submit" class="button primary">${state.index === PITCH_QUESTIONS.length - 1 ? 'Create local draft card' : 'Next question'}</button></div></form><p class="phase-note">Answers are stored in this browser/session. AI Scooter will not share them with West Peek unless you explicitly submit a Founder Story Packet.</p></section>`;
  const textarea = root.querySelector('textarea'); const count = root.querySelector('[data-count]'); const error = root.querySelector('[data-error]');
  textarea.addEventListener('input', () => { count.textContent = String(normalizeAnswer(textarea.value).length); error.hidden = true; state.answers[question.id] = textarea.value; saveAnswers(state.answers); updateStoryPreview(state.answers); });
  root.querySelector('[data-back]')?.addEventListener('click', () => { if (state.index > 0) { state.index -= 1; renderStep(root, state); } });
  root.querySelector('[data-practice-form]').addEventListener('submit', (event) => { event.preventDefault(); const result = validateAnswer(question, textarea.value); if (!result.ok) { error.textContent = result.message; error.hidden = false; return; } state.answers[question.id] = normalizeAnswer(textarea.value); saveAnswers(state.answers); updateStoryPreview(state.answers); if (state.index < PITCH_QUESTIONS.length - 1) { state.index += 1; renderStep(root, state); return; } renderComplete(root, state.answers); });
}

function renderComplete(root, answers) {
  const validation = validatePitchAnswers(answers);
  const card = createLocalDraftStoryCard(answers);
  updateScooter(SCOOTER_COMPANION_STATES.story_text_ready, 'Your local Pitch Story Card shell is ready. Next, generate the AI Pitch Story Card when providers are configured.');
  root.innerHTML = `<section class="practice-flow complete" aria-labelledby="practice-complete-title"><p class="eyebrow">Local draft created</p><h2 id="practice-complete-title">Your local Pitch Story Card shell is ready.</h2><p>${escapeHtml(card.notice)}</p><div class="actions"><button type="button" class="button secondary" data-edit>Edit answers</button><a class="button primary" href="/story-card">View Pitch Story Card</a></div><p class="phase-note">Founder Story Packet sharing remains separate and consent-gated. You can update and come back later.</p></section>`;
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

export function hydratePracticeOutLoud() {
  const root = document.querySelector('[data-practice-out-loud-root]');
  if (!root) return;
  root.innerHTML = `<div class="camera-practice"><video data-camera-preview playsinline muted></video><div class="actions"><button type="button" class="button secondary" data-start-camera>Turn on camera</button><button type="button" class="button primary" data-start-recording disabled>Start local recording</button><button type="button" class="button secondary" data-stop-recording disabled>Stop</button><button type="button" class="button secondary" data-delete-recording disabled>Delete recording</button></div><p class="phase-note" data-camera-status>Camera practice is optional and local-first. No upload occurs.</p><video data-recording-playback controls hidden></video></div>`;
  const preview = root.querySelector('[data-camera-preview]'); const playback = root.querySelector('[data-recording-playback]'); const status = root.querySelector('[data-camera-status]'); const startCamera = root.querySelector('[data-start-camera]'); const startRecording = root.querySelector('[data-start-recording]'); const stopRecording = root.querySelector('[data-stop-recording]'); const deleteRecording = root.querySelector('[data-delete-recording]');
  let stream, recorder, chunks = [];
  startCamera.addEventListener('click', async () => { try { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); preview.srcObject = stream; await preview.play(); startRecording.disabled = false; status.textContent = 'Camera is on locally. Nothing is uploaded.'; } catch { status.textContent = 'Camera permission was unavailable or denied. You can still submit a Founder Story Packet without recording.'; } });
  startRecording.addEventListener('click', () => { if (!stream || typeof MediaRecorder === 'undefined') { status.textContent = 'Local recording is unavailable in this browser.'; return; } chunks = []; recorder = new MediaRecorder(stream); recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); }; recorder.onstop = () => { const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' }); playback.src = URL.createObjectURL(blob); playback.hidden = false; deleteRecording.disabled = false; status.textContent = 'Local playback is ready. This recording has not been uploaded.'; }; recorder.start(); startRecording.disabled = true; stopRecording.disabled = false; status.textContent = 'Recording locally…'; });
  stopRecording.addEventListener('click', () => { if (recorder && recorder.state !== 'inactive') recorder.stop(); stopRecording.disabled = true; startRecording.disabled = false; });
  deleteRecording.addEventListener('click', () => { playback.removeAttribute('src'); playback.hidden = true; deleteRecording.disabled = true; status.textContent = 'Local recording deleted from this browser view.'; });
}

hydratePracticeFlow();
hydrateStoryCard();
hydratePracticeOutLoud();
