import { LOCKED_PITCH_LAB_COPY } from '../runtime/lockedCopy.mjs';

export function renderHomeLanding({ scooterStage }) {
  return `
    <section class="landing-hero" aria-labelledby="home-title">
      <div class="landing-hero-copy">
        <p class="eyebrow">${LOCKED_PITCH_LAB_COPY.homepageEyebrow}</p>
        <h1 id="home-title">${LOCKED_PITCH_LAB_COPY.homepageHeadline}</h1>
        <p class="landing-lede">${LOCKED_PITCH_LAB_COPY.homepageSupport}</p>
        <div class="landing-actions">
          <a class="button primary button-large" href="/practice" data-primary-start>${LOCKED_PITCH_LAB_COPY.primaryCta}</a>
          <a class="text-link" href="/how-it-works">${LOCKED_PITCH_LAB_COPY.secondaryCta} <span aria-hidden="true">→</span></a>
        </div>
        <p class="landing-microcopy">${LOCKED_PITCH_LAB_COPY.homepageMicrocopy}</p>
        <div class="brand-band" aria-label="West Peek principles"><strong>${LOCKED_PITCH_LAB_COPY.founderLine}</strong><span>${LOCKED_PITCH_LAB_COPY.brandLine}</span></div>
      </div>
      ${scooterStage}
    </section>
    <section class="landing-section landing-outcomes" aria-labelledby="outcomes-title">
      <div class="section-intro"><p class="eyebrow">What you leave with</p><h2 id="outcomes-title">A story you can actually use.</h2></div>
      <div class="outcome-cards">
        <article><span>01</span><h3>A sharper one-line pitch</h3><p>Say what you build, who it helps, and why it matters without hiding behind jargon.</p></article>
        <article><span>02</span><h3>A Founder Story Card</h3><p>See the customer, problem, proof, founder edge, timing, and next relationship in one clear artifact.</p></article>
        <article><span>03</span><h3>A stronger spoken story</h3><p>Practice the pitch out loud, review the take, and keep improving before anyone else sees it.</p></article>
      </div>
    </section>
    <section class="landing-section process-section" aria-labelledby="process-title">
      <div class="section-intro"><p class="eyebrow">Three simple steps</p><h2 id="process-title">Start rough. Leave clearer.</h2></div>
      <ol class="process-list">
        <li><strong>Tell Scooter what you are building.</strong><span>Begin with basic founder context and one focused question at a time.</span></li>
        <li><strong>Watch your story take shape.</strong><span>Your live Founder Story Card updates as your answers get more specific.</span></li>
        <li><strong>Choose what happens next.</strong><span>Copy the card, keep practicing, or share it with West Peek only by explicit consent.</span></li>
      </ol>
    </section>
    <section class="trust-strip" aria-label="Pitch Lab trust boundaries"><div class="trust-strip-label"><span class="eyebrow">Trust boundary</span></div>
      <div><strong>Private by default</strong><span>Your pitch answers stay private unless you choose to share.</span></div>
      <div><strong>AI coaching</strong><span>AI Scooter helps sharpen the story; it is not investment advice or a live review.</span></div>
      <div><strong>No guarantees</strong><span>Sharing never guarantees funding, meetings, introductions, or follow-up.</span></div>
    </section>
    <section class="final-cta" aria-labelledby="final-cta-title">
      <p class="eyebrow">Ready when you are</p>
      <h2 id="final-cta-title">Give Scooter the messy version.</h2>
      <p>The room will help you find the version people can remember.</p>
      <a class="button primary button-large" href="/practice">Start Step 1</a>
    </section>`;
}

export function renderHowItWorks({ scooterStage }) {
  return `
    <section class="how-hero" aria-labelledby="how-title">
      <div>
        <p class="eyebrow">How Pitch Lab works</p>
        <h1 id="how-title">A private coaching session that builds the story with you.</h1>
        <p class="landing-lede">You answer focused questions, AI Scooter helps you sharpen the language, and a Founder Story Card forms alongside the conversation.</p>
        <div class="landing-actions"><a class="button primary button-large" href="/practice">Start Step 1</a><a class="text-link" href="#complete-flow">See the complete flow ↓</a></div>
      </div>
      ${scooterStage}
    </section>
    <section id="complete-flow" class="landing-section how-steps" aria-labelledby="complete-flow-title">
      <div class="section-intro"><p class="eyebrow">The complete flow</p><h2 id="complete-flow-title">One room. Four stages.</h2></div>
      <div class="how-step-grid">
        <article><span>01</span><h3>Set the context</h3><p>Add your name, work email, company or project, and an optional website. A deck is optional background context—not an admission ticket.</p></article>
        <article><span>02</span><h3>Work through the story</h3><p>Answer one question at a time while the live draft shows which parts of the pitch are becoming clear.</p></article>
        <article><span>03</span><h3>Review and rehearse</h3><p>Generate the Founder Story Card, copy it, and use Practice Out Loud to strengthen delivery.</p></article>
        <article><span>04</span><h3>Choose whether to share</h3><p>Keep the work private, or explicitly share the finished card with West Peek for relationship review.</p></article>
      </div>
    </section>
    <section class="landing-section what-you-see" aria-labelledby="what-you-see-title">
      <div class="section-intro"><p class="eyebrow">Inside the room</p><h2 id="what-you-see-title">Scooter stays present while the work stays simple.</h2></div>
      <div class="experience-diagram">
        <div class="diagram-stage"><strong>AI Scooter</strong><span>Visible throughout the session</span></div>
        <div class="diagram-work"><strong>Current coaching question</strong><span>The only task that needs your attention</span></div>
        <div class="diagram-draft"><strong>Live Founder Story Card</strong><span>Updates after meaningful answers</span></div>
      </div>
    </section>
    <section class="trust-strip" aria-label="Pitch Lab privacy model">
      <div><strong>No account wall</strong><span>Basic profile details create the session context.</span></div>
      <div><strong>Local-first practice</strong><span>Camera practice stays in your browser by default.</span></div>
      <div><strong>Separate consent</strong><span>Profile capture and Story Card sharing are different actions.</span></div>
    </section>`;
}
