# West Peek Pitch Lab — Master Gauntlet

## Scope

Repo: `west-peek-pitch-lab`
Complexity: Level 5
Playwright Depth: Hostile Max-Depth Journey / Outcome E2E

## Purpose

Prove Pitch Lab behaves like a real founder coaching product, not a form, route shell, static demo, or thin happy-path test.

## Intended Journey

The Master Gauntlet is intentionally broad: 13 behavioral tests across desktop and mobile projects, covering routes, navigation, validation, persistence, AI success/failure, consent gating, Network OS success/failure, thank-you truthfulness, media fallback, and secret exposure.

1. Founder lands on Pitch Lab.
2. West Peek logo appears.
3. Founder sees the brand mantra: “Good people should meet good people.”
4. Founder sees the product mantra: “Good products need good stories.”
5. AI Scooter disclosure is visible.
6. Talking Scooter welcome path exists.
7. Founder starts practice.
8. Founder answers eight prompts, with the final context prompt optional.
9. Founder receives a Pitch Story Card.
10. Story Strength Snapshot appears.
11. Copy-card path works.
12. Founder can leave without sharing.
13. Founder can open share flow.
14. Consent is required.
15. Submission success appears only after confirmed Network OS response.
16. Failure state is honest when the receiver fails.
17. No funding, meeting, intro, approval, or Scooter-review claim appears.

## Media Lanes

The gauntlet treats talking AI Scooter media as core:

- welcome clip/path required
- final personalized talking-summary path required
- share/close clip/path required

If provider keys are absent, tests must verify degraded mode is honest. They must not accept fake video success.

## Network OS Lane

For Pitch Lab-side proof, use a controlled local receiver or configured endpoint.

The gauntlet must verify:

- server-side signed request path
- consent proof included
- source `pitch_lab`
- capture type `pitch_practice`
- pending human review language only
- no automatic contact claim in Pitch Lab

Full Network OS persistence proof remains Network OS-side validation. Pitch Lab-side proof must still exercise success and failure responses so the UI cannot claim completion without a confirmed receiver response.

## Commands

- `npm run validate:master-gauntlet` validates that the gauntlet exists and is wired.
- `npm run gauntlet` runs Playwright in normal mode when dependencies are installed.
- `npm run gauntlet:headed` runs Playwright headed locally.

If Playwright is unavailable in this artifact environment, the honest status is:

`GAUNTLET CREATED — LOCAL HEADED RUN REQUIRED`


## Phase 9D.1 Gauntlet Assertion Patch — 0000025
- Fixed hostile gauntlet false-positive promise detection so explicit negative boundary copy is allowed.
- Fixed localStorage test seeding so share-status receipts are not wiped on navigation to thank-you.
- Maintains 13 behavioral tests across desktop and mobile.

## 06-10-26 MVP v1 Journey Guidance + Rehearsal Coverage Patch

The master gauntlet now includes additional contract-level E2E coverage for the MVP v1 founder experience:

- practice guidance and next-action cues;
- question-level why/hint/example/avoid helpers;
- Practice Out Loud camera-room surface states;
- selected take persistence into share preview;
- consented rehearsal transcript/status payload behavior;
- required Scooter speaking moments at welcome, final summary, and share close;
- text-first Story Card behavior before media completion.

These are intentionally contract-level checks. They do not hard-fail subjective design polish such as exact glow strength, animation timing, or every tooltip phrase.

## 06-10-26 Post-Deploy Gauntlet Expansion

Post-deploy coverage is intentionally leaner than the local master gauntlet, but now protects the failure class found in browser validation:

- deployed `/practice` must hydrate beyond the static shell;
- founder profile fields must be visible and usable;
- Story Card must prove text-first / media-follows behavior;
- Practice Out Loud guidance must explain the camera-room journey without requiring upload storage;
- share gates must block early sharing and preserve explicit consent;
- MVP v1 media moments must exist live: welcome, final summary, and share close;
- Functions must reject malformed payloads, avoid fake media/AI/share success, and never leak secrets or stack internals.

These post-deploy checks are contract-level. They must not become pixel tests, animation tests, or exact-tooltip-copy tests.



## Media proof boundary

The browser gauntlet protects product journey contracts. It does not prove real paid provider media. Talking AI Scooter media is complete only after `npm run proof:media` passes in live mode with real provider env and a playable welcome/final/share output.

## Focused media proof harness

The master gauntlet is not the only browser proof layer. MVP v1 talking-Scooter media has a focused headed proof path:

```bash
npm run proof:media:headed
ENV_VAULT_PASSPHRASE="<approved passphrase>" npm run proof:media:live:headed:from-vault
```

Use the focused media proof before claiming that AI Scooter's talking-avatar moments are live. The live-headed command restores `.env.local` from the encrypted vault and requires real provider behavior instead of fallback-only DOM checks.

## 06-10-26 Focused Real Proof Expansion

The master gauntlet remains the broad local browser journey suite, but several real proof checks now live in focused commands so they can use the right browser/env setup without bloating the main gauntlet:

```bash
npm run proof:camera
npm run proof:camera:headed
npm run proof:voice
npm run proof:voice:live
npm run env:proof
npm run proof:journey
npm run proof:journey:headed
```

These focused proofs cover real browser camera/mic rehearsal, local recording/playback, permission-denied fallback, MediaRecorder-unavailable fallback, voice provider proof, encrypted env-vault proof, optional founder context, consented rehearsal metadata, and basic keyboard/label usability. They are product-outcome tests, not pixel or tooltip-theater tests.
