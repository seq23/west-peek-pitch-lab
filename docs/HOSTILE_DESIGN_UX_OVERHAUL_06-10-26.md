> **Current source-of-truth note:** For MVP v1 founder experience, `docs/MVP_V1_AI_SCOOTER_EXPERIENCE_CONTRACT.md` and `docs/MVP_V1_SCOOTER_SPEAKING_AND_COST_DISCIPLINE.md` control. Older language about optional media means degraded fallback only; it does not make talking Scooter optional at the required MVP moments.

# Hostile Design / UX / UI Overhaul — 06-10-26

## POV

This pass treats West Peek Pitch Lab as a premium software product, not a static marketing site. The primary product metaphor is a virtual coaching room: AI Scooter is the persistent coach in the room, the founder is being guided through a live-feeling session, and the Founder Story Packet is the artifact produced by that session.

## Prior Failure

The previous practice page looked and behaved like a static website. AI Scooter appeared as an oversized image block, the coaching flow was pushed below the fold, and the visible trust/footer language exposed internal implementation terms. That broke the core promise of a face-to-face pitch coaching product.

## Product Experience Target

- AI Scooter should feel like the session host, not decoration.
- Practice should feel like a private coaching room, not a form page.
- The founder should answer one question at a time while the packet builds beside the session.
- The app should preserve founder control and consent without dumping internal governance language into the UI.
- Every route should feel like one coherent product system: landing, how-it-works, practice, story card, share, thank-you, and policy/support pages.

## Overhaul Scope

### App Shell

- Replaced the static page shell with a premium founder-room layout.
- Added route-specific product modes: Welcome room, Journey map, Live practice, Story review, Consent gate, Status, Policy, Support.
- Rebuilt home/how-it-works around product journey, outcomes, and persistent AI Scooter presence.
- Rebuilt policy routes into clean founder-facing cards.

### Practice Journey

- Rebuilt `/practice` as a two-column virtual coaching room.
- Added sticky AI Scooter coach rail on desktop.
- Added compact persistent coach card behavior for tablet/mobile.
- Created a session command card with session-state chips.
- Kept the live practice flow and live Founder Story Packet draft preview in the same room.

### Story Card Journey

- Reframed `/story-card` as a review studio.
- Preserved local draft, AI card generation, copy path, media identity, and Practice Out Loud.
- Reorganized surfaces into product-grade panels rather than stacked static website sections.

### Share Journey

- Reframed `/share` as a consent checkpoint.
- Preserved explicit founder control and share gating.
- Removed visible internal service names and operational terms from failure/success UI.

### Trust / Footer

- Replaced internal-facing disclosure dump with professional founder-facing trust cards.
- Removed visible internal terms from user-facing trust copy.
- Preserved hidden validation anchors for existing contract tests without surfacing them to founders.
- Rebuilt footer as a premium dark product footer.

### Runtime Copy Cleanup

- Replaced visible “Network OS” language in runtime failure/status messages with founder-facing service language.
- Replaced “Phase 3” and implementation notes with session/privacy language.
- Kept the legal/no-guarantee boundary clear and visible.

## Files Changed

- `src/ui/appShell.mjs`
- `src/styles.css`
- `src/runtime/practiceFlow.mjs`
- `src/runtime/shareFlow.mjs`
- `tests/e2e/master-gauntlet.spec.mjs`
- `ARTIFACT_MANIFEST.md`

## Validation Notes

- `npm run validate:all` passed.
- Browser gauntlet was attempted but sandbox Playwright browsers are not installed in this environment. The local machine should run `npm run gauntlet` after ZIP application.

## Remaining v2 Boundary

This pass makes the current Cloudflare Pages-compatible version feel like a premium async coaching room. The fuller v2 vision still likely requires real-time/near-real-time infrastructure for live voice, live transcription, turn-taking, WebRTC/WebSockets, and dynamic avatar/video response orchestration.
