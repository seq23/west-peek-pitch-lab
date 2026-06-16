# West Peek Pitch Lab v2 — Real-Time Coaching Room Vision

## Purpose

This document captures the intended v2 direction for West Peek Pitch Lab.

The product should not feel like a static website, a form wizard, or a landing page with prompts. The product should feel like a premium virtual pitch-coaching room where AI Scooter is present, attentive, and guiding the founder through a live-feeling session.

## Core v2 Product Metaphor

AI Scooter is the coach in the room.

The interface is the room.

The Founder Story Packet is the artifact produced by the session.

The founder should feel like they are sitting across from AI Scooter in a polished, face-to-face coaching experience, not clicking through a static questionnaire.

## Required v2 Experience

The fuller v2 vision likely requires real-time or near-real-time infrastructure if the product includes any of the following capabilities:

- AI Scooter appears like an actual video-call participant.
- The user talks out loud and AI Scooter responds conversationally.
- There is live voice input, live transcription, live turn-taking, or low-latency coaching.
- AI Scooter’s face/video changes as the session progresses.
- Sessions need streaming responses, websockets, WebRTC, or long-running avatar generation jobs.
- The app feels like “I’m in a live coaching room,” not “I click a button and wait for an output.”

## What v2 Must Feel Like

The experience should feel like a high-end founder coaching session, not a static SaaS intake form.

The user should enter a focused environment where AI Scooter is visible, persistent, and actively guiding the session. The coaching flow should feel conversational, paced, and responsive. The founder should understand where they are in the session, what AI Scooter is listening for, what needs to be sharpened, and how the Founder Story Packet is forming.

The session should feel smooth, calm, premium, and intuitive.

## AI Scooter Presence

AI Scooter should be a persistent session presence, not a decorative image.

On desktop:

- AI Scooter should remain visible in a video-call-style panel or sticky coach rail.
- The visual should be appropriately sized and should not dominate or shove the work below the fold.
- The coach panel should indicate state: listening, thinking, coaching, summarizing, ready to share.
- The founder should always feel accompanied by the coach while answering prompts.

On mobile:

- AI Scooter should collapse into a compact persistent coach card, bubble, or top panel.
- The avatar should not consume the whole screen.
- The founder should be able to continue the session without losing context.

## Practice Session Behavior

The practice flow should feel like a guided session.

AI Scooter should progressively guide the founder through the story:

1. What are you building?
2. Who is it for?
3. What painful problem does it solve?
4. Why now?
5. Why are you the founder/team to do it?
6. What proof or traction exists?
7. What help, relationship, or next move is needed?

The UI should show one primary coaching task at a time while keeping the overall session context visible.

The founder should not feel like they are filling out a generic form. They should feel like AI Scooter is listening for clarity, specificity, proof, urgency, founder edge, and the next useful relationship.

## Founder Story Packet Formation

The Founder Story Packet should build as the session progresses.

The product should show the story becoming sharper in real time or near real time. The founder should be able to see how each answer affects the emerging packet.

The packet should remain copyable, practical, and shareable only with explicit consent.

## Trust and Disclosure Layer

The trust layer must be professional, founder-facing, and visually integrated.

The user should understand:

- AI Scooter is an AI-assisted pitch coach.
- AI Scooter is not the real human Scooter.
- This is not investment, legal, tax, securities, or financial advice.
- Sharing is optional.
- Nothing is sent to West Peek unless the founder chooses to share.
- Sharing does not guarantee funding, meetings, introductions, investment review, acceptance, response, or follow-up.

The visible product should not expose internal implementation language such as:

- Network OS
- Legacy trust anchor
- Phase 3
- handoff
- unearned success state
- internal validation language
- backend contract language

Internal governance language may remain in docs, tests, or hidden validation anchors when necessary, but it should not appear in the polished founder-facing interface.

## Infrastructure Implication

A polished v1/v1.5 may remain on Cloudflare Pages if it uses:

- a strong app-shell UI,
- persistent avatar presence,
- local/session state,
- async AI calls,
- provider-triggered generated clips or audio,
- Cloudflare Pages Functions for API endpoints.

The fuller v2 vision may require additional infrastructure if the product needs:

- live bidirectional audio,
- streaming AI responses,
- real-time transcription,
- WebSocket session state,
- WebRTC rooms,
- low-latency avatar response,
- long-running avatar/video rendering jobs,
- persistent server-side session orchestration.

The key decision is not “Cloudflare Pages or not.” The key decision is whether AI Scooter is a simulated persistent coach in an async app, or a true real-time conversational video coach.

## v2 Design Standard

The design standard for v2 is:

- virtual coaching room,
- persistent AI Scooter presence,
- smooth session pacing,
- premium founder-facing interface,
- no exposed internal scaffolding,
- clear consent and trust boundaries,
- Founder Story Packet produced through the session,
- no fake claims of human review, funding likelihood, meetings, introductions, or guaranteed outcomes.

## Non-Negotiable Product Truth

West Peek Pitch Lab is not a static content site.

It is a guided founder pitch-coaching experience.

AI Scooter is not an image on the page.

AI Scooter is the coaching presence that makes the product feel alive.


## Later Roadmap: Scooter Wisdom Admin Intake + Review Queue

A later upgrade should reduce manual repo-file handling for new Scooter knowledge without allowing raw knowledge to auto-go live. Scooter should be able to submit notes, audio, or transcripts into a private intake flow. The system should store raw wisdom, extract candidate wisdom, and present an approval queue where a human can edit, approve, reject, or archive candidates. Only approved wisdom should compile into runtime and deploy.

This roadmap automates ingestion and candidate creation, but final approval remains human-gated.

## MVP v1 Roadmap Bridge: Optional Founder Context

MVP v1 should include an optional final prompt: “Anything else AI Scooter should know?” This is the founder-safe alternative to uploading a confidential deck. It lets founders add market nuance, founder background, customer proof, constraints, use-of-funds context, strategic goals, or context they chose not to upload.

## MVP v1 Blocker: Talking Scooter Provider Proof

The MVP media journey is product-locked, but it should not be called media-complete until the talking-avatar provider path is proven end to end. Required proof includes reusable welcome cache policy, dynamic final summary session/content-hash cache policy, generic/contextual share close policy, playable provider output when generated, honest provider failure, and text-first/non-blocking Story Card behavior.

## Runtime Proof Lock — AI Scooter Must Talk Back

AI Scooter is not considered operational merely because static copy says “AI Scooter” or because a fallback Story Card shell exists. The app must prove two separate layers before release confidence:

1. Direct provider/API proof: a real configured LLM provider returns a schema-backed AI Scooter story card.
2. Browser E2E proof: a founder clicks Generate AI Pitch Story Card in the deployed app and sees the live AI Scooter response rendered in the UI.

The browser proof must not stub `/api/pitch/story-card`. Stubs are allowed only in local failure/success fixture tests that prove fallback and copy-only behavior. Live release proof must call the deployed route.

If either layer fails, the response path is `UNPROVEN`, even if the rest of the gauntlet passes.

## 2026-06-16 Async Persistent-Room Implementation Boundary

The current persistent top Scooter stage, compact listening state, two-column desktop workbench, and mobile draft sheet are the v1/v1.5 asynchronous UI implementation of this room vision. They intentionally do not add WebRTC, streaming transcription, new speaking moments, or continuous avatar rendering. The future real-time roadmap remains unchanged.
