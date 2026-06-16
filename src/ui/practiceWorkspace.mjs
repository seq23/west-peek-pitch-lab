export function renderPracticeWorkspace() {
  return `
    <div class="practice-layout" data-practice-layout data-practice-phase="profile"><span class="contract-anchor" aria-hidden="true">Local practice flow · Live local draft preview</span>
      <section class="conversation-panel" aria-labelledby="practice-work-title">
        <div class="conversation-heading">
          <div><p class="eyebrow">Your conversation</p><h2 id="practice-work-title">Start with the basics.</h2></div>
          <span class="privacy-chip">Private until you share</span>
        </div>
        <div data-founder-profile-gate></div>
        <div data-deck-context-root hidden></div>
        <div data-practice-root hidden><p class="phase-note">Loading guided practice flow…</p></div>
      </section>
      <aside class="story-draft-panel story-card-stage" data-story-card-panel aria-labelledby="story-draft-title" hidden>
        <div class="draft-panel-heading">
          <div><p class="eyebrow">Live draft</p><h2 id="story-draft-title">Founder Story Card</h2></div>
          <span data-draft-progress>0 of 8</span>
        </div>
        <div data-story-card-preview></div>
      </aside>
      <button class="mobile-draft-trigger" type="button" data-story-draft-trigger aria-controls="story-draft-sheet" aria-expanded="false" hidden>Founder Story Card <span data-mobile-draft-progress>0 of 8</span></button>
      <div class="draft-sheet-backdrop" data-draft-sheet-backdrop hidden></div>
      <section class="draft-sheet" id="story-draft-sheet" data-story-draft-sheet role="dialog" aria-modal="true" aria-labelledby="story-draft-sheet-title" hidden>
        <div class="draft-sheet-header"><div><p class="eyebrow">Live draft</p><h2 id="story-draft-sheet-title">Founder Story Card</h2></div><button type="button" class="icon-button" data-draft-sheet-close aria-label="Close Founder Story Card">×</button></div>
        <div data-story-card-sheet-content></div>
      </section>
    </div>`;
}
