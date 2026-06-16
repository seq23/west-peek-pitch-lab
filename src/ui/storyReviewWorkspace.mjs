import { DISCLOSURES } from '../runtime/disclosures.mjs';

export function renderStoryReviewWorkspace() {
  return `
    <div class="story-review-layout">
      <section class="story-review-main story-card-stage" aria-labelledby="local-card-title">
        <div class="workspace-heading"><p class="eyebrow">Your working story</p><h2 id="local-card-title">Founder Story Card</h2><p>Review the story you built with Scooter. You can copy the local version now or generate the AI-enhanced version below.</p></div>
        <div data-story-card-root><p class="phase-note">Answer the practice questions to create your Founder Story Card.</p></div>
      </section>
      <section class="ai-review-panel" aria-labelledby="ai-card-title">
        <div class="workspace-heading"><p class="eyebrow">Scooter review</p><h2 id="ai-card-title">Sharpen the finished story.</h2><p>${DISCLOSURES.storyCard}</p><p class="media-order-note">Text appears first. Scooter’s talking summary follows when available, without blocking the written card.</p></div>
        <div class="next-action-card"><strong>Next step</strong><span>Generate the AI-enhanced Founder Story Card after all required practice answers are complete.</span></div>
        <div class="actions"><button type="button" class="button primary" data-generate-ai-card>Generate my Founder Story Card</button></div>
        <div data-ai-story-card-root></div>
      </section>
      <section class="practice-out-loud-panel" aria-labelledby="practice-out-loud-title">
        <div class="workspace-heading"><p class="eyebrow">Optional rehearsal</p><h2 id="practice-out-loud-title">Practice Out Loud</h2><p>${DISCLOSURES.cameraPractice}</p></div>
        <div data-practice-out-loud-root></div>
      </section>
    </div>`;
}
