# Pitch Lab Persistent Coaching Room UI Contract

**Status:** ACTIVE / CANONICAL UI AUTHORITY  
**Effective date:** 2026-06-16  
**Scope:** Visual hierarchy, route presentation, responsive behavior, and usability proof for West Peek Pitch Lab.

## Authority boundary

This contract does not change when Scooter speaks, speaking duration, media providers, text-first/video-follows behavior, pitch questions, answer validation, storage keys, API payloads, consent, Network OS handoff, deletion, or provider fallback. The existing MVP Scooter experience and speaking/cost contracts remain authoritative for those behaviors.

## Product model

Pitch Lab is a persistent asynchronous coaching room with a shared working artifact.

- Scooter is the relationship and remains visible throughout the active journey.
- The current coaching question is the primary task.
- The Founder Story Card is the secondary artifact forming from the work.
- The interface must never present those three elements as equal competing columns.

## Public lobby

The homepage must:

1. explain pitch practice, AI Scooter, the Founder Story Card, and privacy within the first viewport;
2. expose a fully visible `Start Step 1` action at 390×844 and 1440×900;
3. show only How it works, Privacy, and Start pitch practice in public primary navigation;
4. omit internal media, caching, duration, version, and provider language;
5. reserve detailed explanation for `/how-it-works`.

## Session shell

The critical journey routes `/practice`, `/story-card`, `/share`, and `/thank-you` share one visual system:

- compact session header;
- persistent Scooter stage above the work;
- honest route/state label;
- privacy-state visibility;
- no marketing navigation that allows accidental journey skipping.

The Scooter stage may compact after scroll or on narrow screens but must remain present. Presentation code must consume existing Scooter states and may not create new speaking decisions.

## Practice progression

The practice route must reveal one task at a time:

1. profile;
2. optional deck choice;
3. active coaching question;
4. live draft after the first meaningful answer;
5. review continuation after required answers.

The profile step contains Name, Work email, Company or project, and optional Website. Its one primary action is `Continue to your first question`.

The deck step presents `Continue without a deck` as the default and `Add deck` as an optional secondary action.

## Workbench hierarchy

Desktop:

- persistent Scooter stage across the top;
- conversation at approximately two-thirds width;
- live Founder Story Card at approximately one-third width;
- no empty draft panel before meaningful input.

Mobile:

- compact sticky Scooter stage;
- single-column active task;
- sticky Founder Story Card trigger only after meaningful input;
- accessible bottom sheet with visible close control, Escape closure, focus trap, and focus return.

## Founder Story Card language

`Founder Story Card` is the canonical founder-facing artifact name. Internal data shapes may retain legacy property names where required by stable contracts. Active user interfaces must not use `Pitch Story Card`, `AI Pitch Story Card`, or `Founder Story Packet` as competing product labels.

## Story review and share

The Story Card route hierarchy is:

1. Scooter final-summary stage;
2. working Founder Story Card;
3. AI-enhancement action and result;
4. Practice Out Loud;
5. continuation to sharing.

The share route hierarchy is:

1. Scooter share-close stage;
2. concise Founder Story Card preview;
3. included-content summary;
4. explicit consent;
5. one primary share action and one keep-practicing alternative.

Internal media identity, required-moment, duration, provider, and degraded-mode implementation language must not be visible.

## Accessibility and responsive requirements

- no horizontal overflow at 320, 375, 390, 430, 1280, or 1440 widths;
- interactive targets at least 44×44px where practical;
- visible focus indicators;
- semantic labels for all form controls;
- no color-only readiness signal;
- reduced-motion preference respected;
- mobile navigation opens and closes by keyboard and Escape;
- draft sheet returns focus to its trigger.

## Required proof

Tier 1/container proof must assert source contracts, build output, current UI labels, browser-suite count, route manifests, no internal public language, and responsive safeguards.

Tier 2/local browser proof must execute the exact 112-test suite: 56 desktop and 56 mobile. It must prove homepage CTA geometry, progressive profile/deck flow, persistent Scooter presence, first-answer draft reveal, desktop two-column hierarchy, mobile menu, mobile draft sheet, focus return, no overflow, route continuity, provider honesty, persistence, deletion, consent, and handoff payload behavior.

Tier 3/deployed proof must run the public click audit against the canonical live hostname and preserve the same route/state coverage.
