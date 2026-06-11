# MVP v1 E2E User Journey Guidance Trace — West Peek Pitch Lab

**Status:** ACTIVE SUPPORTING TRACE  
**Parent source:** `docs/MVP_V1_AI_SCOOTER_EXPERIENCE_CONTRACT.md`  
**Validation posture:** aligned with `docs/VALIDATION_SIMPLIFICATION_MATRIX.md`; this trace guides design review and does not add petty hard-fail validators.

## Purpose

This pass traces the founder journey end to end and adds practical guidance so users always know:

1. where they are,
2. what they can do now,
3. what happens next,
4. what is private,
5. what requires consent,
6. when Scooter is listening, speaking, or text-only.

The goal is not more clutter. The goal is a calmer coaching room where the next move is obvious.

## Journey trace

| Stage | User question | Guidance added / required | Attention cue |
|---|---|---|---|
| Home / how it works | “What is this?” | Session guide, media journey, complete flow, privacy/consent explanation. | Journey cards explain the path before the user enters practice. |
| Profile start | “Why do you need this?” | Field-level helper copy for name, email, company, website. | Start button can glow as the active next step. |
| Deck context | “Do I need a deck?” | Clear skip-vs-upload explanation; deck is context only and not automatically shared. | Recommended fast-path button can glow. |
| Practice prompt | “How should I answer?” | Every question includes why it matters, strong-answer hint, example, and avoid guidance. | Next button/card lights up once minimum useful detail is present. |
| Live draft | “Is this doing anything?” | Draft preview updates as the founder types. | Current prompt remains in Scooter rail and workbench. |
| Completion | “What now?” | Completed draft card points to Story Card review studio. | Story Card CTA glows as the next step. |
| Story Card | “When do I get the real output?” | Text-first explanation; final talking Scooter summary follows without blocking copy/share. | Generate button and avatar runway explain what is about to happen. |
| Practice Out Loud | “How do I record?” | Mini stepper: camera, countdown, record, playback, choose, consent. | Countdown and recording state draw attention inside the camera room. |
| Share | “What exactly am I sending?” | Packet preview, consent copy, selected rehearsal context status, no guarantee language. | Consent/submit area marks the final active decision. |
| Thank you | “What happened?” | Confirms only after a real confirmed response; no fake success. | No extra validation theater. |

## Tooltips and hints standard

Use visible helper copy for anything material. Use native `title` attributes only as secondary support.

Required visible helpers:

- what each profile field is for
- whether deck context is required
- how to answer each pitch question
- what makes an answer strong
- what to avoid
- what the local draft is doing
- what happens after draft completion
- how the camera room works
- what transcript/self-review affects
- what selected take consent means
- what share sends and does not send

## Attention standard

Use attention cues sparingly. They should help, not yell.

Allowed:

- subtle glow on the active next action
- active next-step card
- progress bar
- countdown
- recording timer
- selected-take border
- share consent checkpoint

Do not use:

- modal interruptions for ordinary guidance
- hard-blocking tutorials
- aggressive animations
- alert-style warnings for non-dangerous steps
- new hard-fail validators for subjective UI polish

## Speaking-length guidance adjustment

The prior word-count framing felt too brittle. MVP v1 should use **duration and editorial guidance**, not tiny hard word caps.

Current standard:

- welcome: 15–25 sec target, 35 sec duration safety ceiling
- midpoint: 15–25 sec target, 35 sec duration safety ceiling
- final summary: 30–50 sec target, 65 sec duration safety ceiling
- share close: 12–22 sec target, 30 sec duration safety ceiling

Script guidance should use comfort ranges and editorial review thresholds, not hard clipping:

- midpoint comfort range: 55–95 words; review if clearly above ~130
- final summary comfort range: 100–165 words; review if clearly above ~220
- share close comfort range: 45–85 words; review if clearly above ~115

The rule is: **human-feeling and specific, never rambling, never clipped into robotic fragments.**

## Validation simplification note

This pass intentionally does not create a new hard-fail visual validator. The current validation matrix already covers build, locked copy, disclosures, data boundaries, local practice/share behavior, and route smoke. Human UX review remains necessary for subjective feel.
