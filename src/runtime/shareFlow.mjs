import { DISCLOSURE_COPY, DISCLAIMER_ACKNOWLEDGEMENTS } from './disclaimerModel.mjs';

const aiCardKey = 'west-peek-pitch-lab.phase4.ai-story-card.v1';
const profileKey = 'west-peek-pitch-lab.founder-profile.v1';
const deckKey = 'west-peek-pitch-lab.deck-context.v1';
const shareStatusKey = 'west-peek-pitch-lab.phase7.share-status.v1';
const profileCaptureStatusKey = 'west-peek-pitch-lab.profile-capture-status.v1';

function escapeHtml(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function readJson(key, fallback=null) { try { const parsed = JSON.parse(localStorage.getItem(key) || 'null'); return parsed || fallback; } catch { return fallback; } }
function readAiStoryCard() { const parsed = readJson(aiCardKey); return parsed?.storyCard ? parsed.storyCard : null; }
function readProfile() { return readJson(profileKey, {}); }
function readDeck() { return readJson(deckKey, { deck_provided: false }); }
function readProfileCaptureStatus() { return readJson(profileCaptureStatusKey, {}); }
function profileComplete(profile={}) { return String(profile.name||'').trim().length>=2 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(profile.email||'').trim()) && String(profile.companyName||'').trim().length>=2; }

function renderPacketPreview(card, profile, deck) {
  return `<div class="story-card-grid founder-story-packet"><article class="story-card-section"><h3>Founder</h3><p>${escapeHtml(profile.name)} · ${escapeHtml(profile.email)} · ${escapeHtml(profile.companyName)}</p><p>${escapeHtml(profile.website || 'Website not provided')}</p></article><article class="story-card-section"><h3>One-line pitch</h3><p>${escapeHtml(card.oneLinePitch)}</p></article><article class="story-card-section"><h3>Company summary</h3><p>${escapeHtml(card.companySummary)}</p></article><article class="story-card-section"><h3>Proof / traction</h3><p>${escapeHtml(card.proofTraction)}</p></article><article class="story-card-section"><h3>Relationship routing notes</h3><p>${escapeHtml(card.suggestedNextRelationships || card.nextSteps)}</p></article><article class="story-card-section"><h3>Deck context</h3><p>Deck provided: ${deck?.deck_provided ? 'Yes' : 'No'}. Deck file is not included unless separately consented.</p></article></div>`;
}

function renderShareForm(root, card) {
  const profile = readProfile();
  const deck = readDeck();
  const profileCapture = readProfileCaptureStatus();
  if (!profileComplete(profile)) {
    root.innerHTML = `<div class="boundary-card"><h2>Start with your founder profile.</h2><p>${escapeHtml(DISCLOSURE_COPY.profileGate)}</p><a class="button primary" href="/practice">Go to practice</a></div>`;
    return;
  }
  if (!card) {
    root.innerHTML = `<div class="boundary-card"><h2>Generate your AI Pitch Story Card first.</h2><p>Sharing with West Peek requires the completed AI Pitch Story Card. No placeholder submission is allowed.</p><a class="button primary" href="/story-card">Go to Story Card</a></div>`;
    return;
  }
  root.innerHTML = `<form data-share-form class="share-form" novalidate><div class="boundary-card"><h2>Share your Founder Story Packet with West Peek?</h2><p>Share your Founder Story Packet with West Peek so we can understand what you’re building and consider whether there’s a useful relationship, next step, or fit within the network. No guarantees — and you can always update your story and come back later.</p><p class="phase-note">${escapeHtml(DISCLOSURE_COPY.shareConsent)}</p></div>${renderPacketPreview(card, profile, deck)}<label class="checkbox-row"><input name="shareWithWestPeek" type="checkbox" required /> ${escapeHtml(DISCLOSURE_COPY.shareConsent)}</label><label class="checkbox-row"><input name="includeDeckFile" type="checkbox" /> Include my uploaded deck file with my Founder Story Packet, if upload storage is enabled later.</label><label class="checkbox-row"><input name="includePracticeVideo" type="checkbox" /> Include my practice video only if a future video-sharing consent path is enabled.</label><div class="actions"><button class="button primary" type="submit">Share Founder Story Packet with West Peek</button></div><p class="field-error" data-share-error hidden></p><div data-share-result></div></form>`;
  const form = root.querySelector('[data-share-form]'); const error = root.querySelector('[data-share-error]'); const result = root.querySelector('[data-share-result]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); error.hidden = true; result.innerHTML = '';
    const data = new FormData(form);
    const payload = {
      founder: profile,
      consent: {
        shareWithWestPeek: data.get('shareWithWestPeek') === 'on',
        includeDeckFile: data.get('includeDeckFile') === 'on',
        includePracticeVideo: data.get('includePracticeVideo') === 'on',
        consentVersion: 'pitch-lab-share-v1',
        consentedAt: new Date().toISOString(),
        disclaimersAcknowledged: DISCLAIMER_ACKNOWLEDGEMENTS
      },
      storyCard: card,
      deckContext: deck,
      profileCapture,
      aiPersona: 'AI Scooter'
    };
    if (!payload.consent.shareWithWestPeek) { error.textContent = 'Consent is required before sharing with West Peek.'; error.hidden = false; return; }
    result.innerHTML = '<p class="phase-note">Submitting Founder Story Packet to West Peek network review…</p>';
    try {
      const response = await fetch('/api/pitch/share', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(payload) });
      const body = await response.json();
      if(!response.ok || body.ok !== true) { result.innerHTML = `<div class="boundary-card"><h3>Submission was not completed.</h3><p>${escapeHtml(body.message || body.error_code || 'Network OS is unavailable.')}</p><p>Your Pitch Story Card is still available to copy. No submitted state was recorded.</p></div>`; return; }
      const status = { ok:true, reviewStatus: body.review_status || 'pending_network_review', profileCreated: body.profile_created === true, contactCreated: body.contact_created === true, intakeId: body.intake_id || '', profileId: body.profile_id || profileCapture.profileId || '', linkedProfileIntakeId: body.linked_profile_intake_id || profileCapture.intakeId || '', databaseWriteStatus: body.database_write_status || 'stored', submittedAt: new Date().toISOString() };
      localStorage.setItem(shareStatusKey, JSON.stringify(status));
      result.innerHTML = `<div class="boundary-card"><h3>Founder Story Packet shared with West Peek for network review.</h3><p>Intake status: ${escapeHtml(status.reviewStatus)}. Database write: ${escapeHtml(status.databaseWriteStatus)}.</p><p>This does not guarantee funding, investment review, a response, a meeting, an intro, acceptance, follow-up, or personal Scooter review.</p><a class="button primary" href="/thank-you">Continue</a></div>`;
    } catch { result.innerHTML = '<div class="boundary-card"><h3>Submission was not completed.</h3><p>Network OS is unavailable. No submitted state was recorded.</p></div>'; }
  });
}

export function hydrateThankYouStatus() {
  const root = document.querySelector('[data-thank-you-status]'); if(!root) return;
  const status = readJson(shareStatusKey, null);
  if(!status?.ok) { root.innerHTML = `<div class="boundary-card"><h3>No confirmed submission found in this browser.</h3><p>This page only claims success after Network OS confirms the pending network review. Your Pitch Story Card may still be available on the Story Card page.</p><a class="button primary" href="/story-card">Return to Story Card</a></div>`; return; }
  root.innerHTML = `<div class="boundary-card"><h3>Your Founder Story Packet was shared with West Peek for network review.</h3><p>Status: ${escapeHtml(status.reviewStatus || 'pending_network_review')}.</p><p>Database write: ${escapeHtml(status.databaseWriteStatus || 'stored')}. No outreach, intro, investment review, or follow-up is automatic.</p><p>${escapeHtml(DISCLOSURE_COPY.thankYou)}</p><a class="button secondary" href="/story-card">Update and come back later</a></div>`;
}

export function hydrateShareFlow() { const root = document.querySelector('[data-share-boundary]'); if(!root) return; renderShareForm(root, readAiStoryCard()); }

hydrateShareFlow();
hydrateThankYouStatus();
