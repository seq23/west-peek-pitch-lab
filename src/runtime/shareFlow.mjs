const aiCardKey = 'west-peek-pitch-lab.phase4.ai-story-card.v1';
const shareStatusKey = 'west-peek-pitch-lab.phase7.share-status.v1';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function readAiStoryCard() {
  try {
    const parsed = JSON.parse(localStorage.getItem(aiCardKey) || 'null');
    return parsed?.storyCard ? parsed.storyCard : null;
  } catch {
    return null;
  }
}

function renderShareForm(root, card) {
  if (!card) {
    root.innerHTML = `
      <div class="boundary-card">
        <h2>Generate your AI Pitch Story Card first.</h2>
        <p>Sharing with West Peek requires the completed AI Pitch Story Card. No placeholder submission is allowed.</p>
        <a class="button primary" href="/story-card">Go to Story Card</a>
      </div>`;
    return;
  }
  root.innerHTML = `
    <form data-share-form class="share-form" novalidate>
      <div class="boundary-card">
        <h2>Share your Pitch Story Card with West Peek?</h2>
        <p>This is optional. It creates a pending intake for human review only after Network OS confirms receipt. It does not guarantee funding, a response, a meeting, an intro, or review by Scooter personally.</p><p class="phase-note">What happens next: if submitted, your card enters West Peek's pending intake queue. A human may review it. No contact is created automatically.</p>
      </div>
      <label>Founder name <input name="name" minlength="2" required autocomplete="name" /></label>
      <label>Email <input name="email" type="email" required autocomplete="email" /></label>
      <label>Company name <input name="companyName" minlength="2" required autocomplete="organization" /></label>
      <label>Website <input name="website" autocomplete="url" /></label>
      <label class="checkbox-row"><input name="shareWithWestPeek" type="checkbox" required /> I consent to share this Pitch Story Card with West Peek for human review.</label>
      <div class="actions"><button class="button primary" type="submit">Share with West Peek</button></div>
      <p class="field-error" data-share-error hidden></p>
      <div data-share-result></div>
    </form>`;

  const form = root.querySelector('[data-share-form]');
  const error = root.querySelector('[data-share-error]');
  const result = root.querySelector('[data-share-result]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    result.innerHTML = '';
    const data = new FormData(form);
    const payload = {
      founder: {
        name: data.get('name'),
        email: data.get('email'),
        companyName: data.get('companyName'),
        website: data.get('website')
      },
      consent: {
        shareWithWestPeek: data.get('shareWithWestPeek') === 'on',
        consentVersion: 'pitch-lab-share-v1',
        consentedAt: new Date().toISOString()
      },
      storyCard: card
    };
    if (!payload.consent.shareWithWestPeek) {
      error.textContent = 'Consent is required before sharing with West Peek.';
      error.hidden = false;
      return;
    }
    result.innerHTML = '<p class="phase-note">Submitting to West Peek…</p>';
    try {
      const response = await fetch('/api/pitch/share', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok || body.ok !== true) {
        result.innerHTML = `<div class="boundary-card"><h3>Submission was not completed.</h3><p>${escapeHtml(body.message || body.error_code || 'Network OS is unavailable.')}</p><p>Your Pitch Story Card is still available to copy. No submitted state was recorded.</p></div>`;
        return;
      }
      const status = { ok: true, reviewStatus: body.review_status, contactCreated: body.contact_created === false, intakeId: body.intake_id || '', submittedAt: new Date().toISOString() };
      localStorage.setItem(shareStatusKey, JSON.stringify(status));
      result.innerHTML = `<div class="boundary-card"><h3>Shared with West Peek for human review.</h3><p>Intake status: ${escapeHtml(body.review_status)}. Contact created: ${body.contact_created === false ? 'No' : 'Unexpected'}.</p><p>This does not guarantee a response, meeting, funding, intro, or personal Scooter review.</p><a class="button primary" href="/thank-you">Continue</a></div>`;
    } catch {
      result.innerHTML = '<div class="boundary-card"><h3>Submission was not completed.</h3><p>Network OS is unavailable. No submitted state was recorded.</p></div>';
    }
  });
}

export function hydrateThankYouStatus() {
  const root = document.querySelector('[data-thank-you-status]');
  if (!root) return;
  let status = null;
  try { status = JSON.parse(localStorage.getItem(shareStatusKey) || 'null'); } catch { status = null; }
  if (!status?.ok) {
    root.innerHTML = `<div class="boundary-card"><h3>No confirmed submission found in this browser.</h3><p>This page only claims success after Network OS confirms the pending intake. Your Pitch Story Card may still be available on the Story Card page.</p><a class="button primary" href="/story-card">Return to Story Card</a></div>`;
    return;
  }
  root.innerHTML = `<div class="boundary-card"><h3>Your Pitch Story Card was submitted to West Peek's pending intake queue.</h3><p>Status: ${escapeHtml(status.reviewStatus || 'pending_human_review')}.</p><p>Contact created automatically: ${status.contactCreated ? 'No' : 'Unexpected — please verify locally.'}</p><p>A human may review it. This does not guarantee a response, funding, a meeting, an intro, or personal Scooter review.</p><a class="button secondary" href="/story-card">Return to Story Card</a></div>`;
}

export function hydrateShareFlow() {
  const root = document.querySelector('[data-share-boundary]');
  if (!root) return;
  renderShareForm(root, readAiStoryCard());
}

hydrateShareFlow();
hydrateThankYouStatus();
