# RUNBOOK — west-peek-pitch-lab

Read this before changing anything. It is the file an AI employee (Porter in West Peek OS,
Danielle in Boss OS) reads at plan time; `scripts/validate-runbook.mjs` fails the build if the
paths and scripts named here stop existing.

## What this repo is
West Peek Pitch Lab: a public, founder-facing AI pitch-coaching app ("Pitch Practice with
Scooter"). Partners call it "pitch lab", "pitchlab", "Pitch Lab" or "the pitch site".

| | |
|---|---|
| Hosts | https://pitch.joinwestpeek.com (canonical, `src/runtime/canonicalUrls.mjs`), https://pitchlab.joinwestpeek.com, west-peek-pitch-lab.pages.dev (noindex, `functions/_middleware.js`) |
| Platform | Cloudflare **Pages** project `west-peek-pitch-lab` (`wrangler.toml`: `pages_build_output_dir = "dist"`) — not a Worker |
| Build | `npm run build` → `scripts/build-static-app.mjs` renders every route in `src/runtime/phase2Routes.mjs` through `src/ui/appShell.mjs` into `dist/` (gitignored; Pages builds it) |
| Pages / copy | `src/ui/` (page renderers), `src/styles.css`, `src/config/lockedCopy.json` (canonical copy), `public/assets/` |
| API | Pages Functions in `functions/api/` — `pitch/` (analyze, story-card, profile-capture, share), `voice/`, `avatar/` |
| Server code | `src/server/` — `ai/`, `voice/`, `avatar/`, `media/`, `network/` (Network OS handoff) |

Founder leads: `functions/api/pitch/profile-capture.js` and `functions/api/pitch/share.js` run TWO
paths — the signed Network OS intake-queue handoff (`src/server/network/networkOsClient.mjs`) and
the site-form door to the master network sheet (`src/server/network/siteFormIntakeClient.mjs`).
A sheet failure never reaches the founder; it is reported as `sheet` in the response.

## Standing rules (cited from the repo)
- **Founders reach the master network sheet, and both paths keep running** (owner decision,
  22 Sep 2026, recorded in `src/server/network/siteFormIntakeClient.mjs` and
  `_repo_validation_matrix.json`). The `CONTACT_AUTO_CREATE_GUARD` in
  `src/server/network/networkOsClient.mjs` guards the queue door and stays. Guard:
  `npm run validate:site-form-intake`.
- **Locked decisions** — product/feature names, the two brand lines, tone, providers — are listed
  in `README.md` under "Locked Decisions". Copy lives in `src/config/lockedCopy.json`
  (`npm run validate:locked-copy`). Changing one is the owner's call: ask, don't decide.
- **Brand system is locked**: `WEST_PEEK_BRAND_SYSTEM.md` ("Orange is an accent, not the entire
  interface"). Guard: `npm run validate:brand-system`.
- **CI never deploys.** `.github/workflows/validate.yml` is validation-only;
  `scripts/validate-ci-workflow-contract.mjs` fails on any deploy command in a workflow.
- **No secrets in the repo.** A new env var is registered in `config/env.registry.json`,
  `ENVIRONMENT_VARIABLES.md` and all four `.env*.example` files, and set on the Pages project by
  name (`docs/runbooks/PRODUCTION_ENV_SETUP.md`). Guards: `npm run validate:env`,
  `npm run validate:no-secrets`.
- **Every proof script is admitted.** A new `validate:*`/`smoke:*` script needs an entry in
  `_repo_validation_matrix.json` (and `validateAllHardFailCommands` if it hard-fails) and in
  `_validator_admission_register.json`, or `npm run validate:matrix` fails.
- **A new route** goes in `src/runtime/phase2Routes.mjs` and `config/deployed-route-manifest.json`
  (`npm run validate:deployed-route-manifest`, `npm run smoke:routes`).

## How to make a change
1. Worktree + branch `work/<slug>` off `origin/main`; `npm ci` (Node from `.nvmrc`).
2. Edit under `src/`, `functions/` or `public/`.
3. Run exactly what CI runs: `npm run validate:ci-workflow-contract` then `npm run validate:all`
   (builds `dist/`, runs every hard-fail guard including `validate:runbook`). For copy or visual
   changes also `npm run validate:quality`.
4. Look at it: `npm run preview:static` serves `dist/` on http://localhost:4173; check desktop and
   390px.
5. Commit, push, open a PR. CI (`.github/workflows/validate.yml`) runs on the PR, and the Cloudflare
   bot comments a preview URL `https://<hash>.west-peek-pitch-lab.pages.dev` — check the change there.
6. `~/bin/land <pr>` verifies green, squash-merges, watches `main`.
7. Prove it live: the "Cloudflare Pages" check-run on the merge commit succeeded
   (`gh api repos/seq23/west-peek-pitch-lab/commits/<sha>/check-runs`), then
   `curl -sI https://pitch.joinwestpeek.com/` and curl the changed route.

## How it deploys
Cloudflare Pages Git integration builds `main` on every push (`npm run build`, output `dist/`) and
serves it on both custom domains; every PR gets a preview deployment. No manual deploy step, and
none in GitHub Actions. Env/secret changes: `docs/runbooks/CLOUDFLARE_DEPLOYMENT.md`,
`docs/runbooks/NETWORK_OS_SHARED_SECRET_SYNC.md`. Rollback: `ROLLBACK_AND_CONTAINMENT_RUNBOOK.md`
("roll back to the last known good deployment before diagnosis" — in the Pages dashboard). Longer release lifecycle: `REPO_UPDATE_LIFECYCLE.md`,
`TERMINAL_RELEASE_RUNBOOK.md`, `docs/TEST_OPERATIONS_RUNBOOK.md`.

## Guards, and what each pins
| Script | Pins |
|---|---|
| `scripts/validate-ci-workflow-contract.mjs` | CI exists, parses, runs `validate:all` on push + PR to main, never deploys |
| `tests/domain/site-form-intake-contracts.mjs` | founders reach the sheet door with correct tagging; both paths run; failures never throw |
| `tests/domain/profile-lead-contracts.mjs` | the profile-capture lead payload |
| `scripts/validate-validation-matrix.mjs` | every proof script is admitted; `validate:all` carries every hard-fail command |
| `scripts/validate-env-contract.mjs` / `scripts/check-no-plaintext-secrets.mjs` | env registry is complete; no plaintext secrets committed |
| `scripts/validate-deployed-route-manifest.mjs` / `scripts/route-smoke.mjs` | route manifest shape (dual viewport, ids); every route in `src/runtime/phase2Routes.mjs` serves from `dist/` with the locked brand lines |
| `scripts/validate-browser-runtime-bundle.mjs` | `dist/assets/` carries every browser entry script the pages load |
| `scripts/validate-locked-copy.mjs` / `scripts/validate-west-peek-brand-system.mjs` | locked copy source; brand system (run via `npm run validate:quality`) |
| `scripts/validate-runbook.mjs` | this file names real paths and scripts |

Prove a new guard negatively before merging: plant the defect, watch it fail, remove it.
