export function renderShareWorkspace() {
  return `
    <div class="share-workspace">
      <div class="share-intro"><p class="eyebrow">Final decision</p><h2>Review exactly what West Peek will receive.</h2><p>You can keep practicing privately, copy the card, or share only after explicit consent.</p></div>
      <div data-share-boundary><p class="phase-note">A completed Founder Story Card is required before sharing.</p></div>
    </div>`;
}

export function renderThankYouWorkspace() {
  return `<div class="share-workspace"><div class="share-intro"><p class="eyebrow">Submission status</p><h2>Founder Story Card status</h2><p>This page only confirms a share after the app receives a confirmed response.</p></div><div data-thank-you-status><p class="phase-note">Checking this browser for a confirmed receipt…</p></div></div>`;
}
