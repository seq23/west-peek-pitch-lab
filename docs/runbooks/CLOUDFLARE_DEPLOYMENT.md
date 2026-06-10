# Cloudflare Deployment — West Peek Pitch Lab

Target domain: `pitchlab.joinwestpeek.com`
Target platform: Cloudflare Pages / Functions unless superseded by repo-local deployment docs.

## Before deployment

- Real env values must be encrypted into `secrets/pitch-lab.env.vault.enc`.
- Secret values must be added to Cloudflare by name, not committed.
- `npm run env:cloudflare:plan` must be reviewed.
- No placeholder values may be pushed to production.

## Required local proof before deploy

- `npm run validate:all`
- `npm run validate:master-gauntlet`
- `npm run gauntlet:headed` where local Playwright is available

## Postdeploy proof

Use explicit base URL. Do not rely on localhost defaults.

`SMOKE_BASE_URL=https://pitchlab.joinwestpeek.com npm run postdeploy:smoke`

Postdeploy smoke is not currently implemented in this artifact; add before claiming production deployment proof.
