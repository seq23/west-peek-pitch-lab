# Pitch Lab Local Browser Gate Repair — 2026-06-16

## Incident

The v3.1 updater correctly stopped before commit and push after the 112-test local browser gate reported 25 failures across desktop and mobile.

## Root-cause classification

1. **Product defect:** the optional eighth prompt used `minLength: 0`, so a blank answer counted as complete and revealed the live draft during profile entry.
2. **Visual defect:** the desktop homepage CTA extended below the 1280×720 first viewport.
3. **Usability/accessibility defects:** rehearsal consent was interactive before a take existed; text-first media ordering was not always stated; trust-boundary labeling was inconsistent.
4. **Proof-contract drift:** browser tests still targeted pre-redesign labels, pre-redesign navigation behavior, non-progressive deck visibility, and obsolete button text.

## Source repairs

- Count blank optional context as incomplete for live-draft visibility.
- Report required-answer progress without implying that optional context is mandatory.
- Keep the Story Card panel hidden until the first meaningful answer.
- Reduce homepage hero line wrapping and vertical footprint so Step 1 remains above fold.
- Add explicit trust-boundary labels to public and session surfaces.
- Disable rehearsal-sharing consent until a best take exists and explain the required next action.
- State that written text appears first and talking media follows when available.
- Use Founder Story Card consistently in founder-facing consent copy while retaining packet semantics in the handoff contract.
- Update E2E tests to the approved session navigation, Work email label, progressive deck step, current question controls, mobile draft sheet, and current coaching-room copy.
- Add optional-answer counting regression tests and expand critical source/artifact parity coverage.

## Validation performed

- Canonical `release:prepush:container`: PASS.
- UI/test parity: PASS.
- Browser-suite contract: PASS; 112 tests collected across 56 desktop and 56 mobile cases.
- Independent hostile browser harness: PASS twice against rebuilt output.
- Hostile harness states: homepage desktop/mobile, practice desktop/mobile, Story Card review, share consent and payload.
- Horizontal overflow: none in reviewed desktop/mobile states.

## Remaining boundary

The canonical local headed Playwright suite must rerun through the v3.1 updater on the operator Mac. The ChatGPT environment blocks browser navigation to local HTTP origins, so it cannot replace the updater’s local browser verdict.

## Second local-browser failure harvest

The replacement baseline reduced the updater failure set from 25 to 8. The remaining failures exposed:

1. **Runtime defect:** recording a take wrote the selected take to local storage but did not enable the rehearsal-sharing consent control.
2. **Runtime cleanup defect:** deleting the selected take cleared storage but did not immediately disable/reset the consent control.
3. **Mobile interaction defect:** the sticky session header and full-width sticky Story Card launcher could intercept the active Continue control.
4. **Proof-contract drift:** one mobile test still expected the intentionally hidden desktop draft sidebar, and one share test still asserted the retired founder-facing “Founder Story Packet” name.

## Second-pass repairs

- Enable rehearsal consent immediately after a newly recorded take becomes the selected take.
- Disable and reset rehearsal consent immediately after the selected take is deleted.
- Make the mobile session header non-sticky and keep the compact Scooter stage sticky independently.
- Convert the mobile Story Card launcher from an overlaying sticky control to an in-flow bottom-sheet launcher.
- Add safe scroll margins around the active question form and Continue control.
- Prove mobile draft visibility through the Story Card trigger and bottom sheet, not the hidden desktop sidebar.
- Standardize the affected founder-facing rehearsal/share copy on **Founder Story Card** while preserving backend packet semantics.
- Add source-level regression assertions for consent enable/disable behavior, mobile non-overlap rules, and mobile draft-sheet proof.

## Second-pass proof boundary

The operator’s second v3.1 run proved 72 tests passed and narrowed the release blocker to the eight failures above before commit or push. The ChatGPT environment can run real Chromium against in-memory rendered routes but blocks browser navigation to local HTTP origins; therefore the final canonical 112-test verdict remains the next updater gate.
