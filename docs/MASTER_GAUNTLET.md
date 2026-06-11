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
8. Founder answers seven prompts.
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
