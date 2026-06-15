# Pitch Lab Testing Architecture

**Authority:** Repo-local three-tier model.

## Tier 1 — Source, Container, and Artifact Proof
Static contracts, domain/integration logic, build, secrets, UI/test parity, browser-suite contract, packaging, source/artifact parity, and reopened ZIP validation. Tier 1 does not prove a real browser or deployed provider.

## Tier 2 — Local Real-Browser Proof
Desktop and mobile Playwright projects, complete founder journey, persistence, refresh/re-entry, camera/media failure paths, consent boundaries, geometry, accessibility, state isolation, and Delete My Info. Required command: `npm run release:prepush:local`.

## Tier 3 — Deployed and Live-System Proof
GitHub/Cloudflare deployment, live LLM, voice, avatar/media, signed Network OS handoff/readback, populated public click audit, exact cleanup, and post-cleanup integrity.

## Approval overlays
Hallmark and human visual approval are not a validation tier. They attach to the applicable Tier 2 or Tier 3 evidence without renumbering the repo model.
