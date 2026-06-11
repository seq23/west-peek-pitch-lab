# Environment Variables — West Peek Pitch Lab

**Status:** Phase 1 contract — managed avatar + ElevenLabs voice update
**Rule:** Secret names belong in repo. Secret values do not.

## Source of Truth

All env var names, phases, scopes, placeholders, and Cloudflare binding types live in:

```text
config/env.registry.json
```

The deterministic env system has three lanes:

1. **Registry:** `config/env.registry.json` lists every env var the repo knows about.
2. **Local machine:** `.env.local` is generated from the registry with safe placeholders by `npm run env:create-local`.
3. **Encrypted vault:** `secrets/pitch-lab.env.vault.enc` persists the complete env set in encrypted form for deterministic recovery and future Cloudflare sync.

Detailed workflow lives in:

```text
docs/ENVIRONMENT_VAULT_PLAN.md
docs/runbooks/ENVIRONMENT_SETUP.md
docs/COST_AND_PROVIDER_PLAN.md
```

## Approved Provider Posture

- LLM: Gemini first for lowest-cost/free-tier V1 path.
- Voice: ElevenLabs for Scooter's approved voice.
- Avatar video: ElevenLabs first for MVP talking-photo/video; HeyGen and MakeUGC fallback/research after MVP proof.
- Main coaching: talking AI Scooter at key moments, with text carrying detailed coaching.
- Email: disabled in V1 unless later approved.
- Network OS: existing CRM destination, no duplicate CRM.

## Registered Env Vars

| Key | Phase | Scope | Cloudflare Binding | Client Exposure | Placeholder Policy |
|---|---|---|---|---|---|
| `APP_ENV` | phase2 | public_config | plain_var | allowed | `development` |
| `APP_BASE_URL` | phase2 | public_config | plain_var | allowed | `http://localhost:5173` |
| `PUBLIC_APP_URL` | phase2 | public_config | plain_var | allowed | `http://localhost:5173` |
| `LLM_PROVIDER` | phase4 | server_config | plain_var | forbidden | `gemini` |
| `GEMINI_API_KEY` | phase4 | server_secret | secret | forbidden | `REPLACE_WITH_LOCAL_GEMINI_API_KEY` |
| `GEMINI_MODEL` | phase4 | server_config | plain_var | forbidden | `gemini-2.5-flash` |
| `GEMINI_API_BASE_URL` | phase4 | server_config | plain_var | forbidden | `https://generativelanguage.googleapis.com` |
| `OPENAI_API_KEY` | phase4 | server_secret | secret | forbidden | `DISABLED_UNLESS_OPENAI_FALLBACK_CONFIGURED` |
| `OPENAI_MODEL` | phase4 | server_config | plain_var | forbidden | `gpt-4.1-mini` |
| `VOICE_PROVIDER` | phase9d | server_config | plain_var | forbidden | `elevenlabs` |
| `ELEVENLABS_API_KEY` | phase9d | server_secret | secret | forbidden | `REPLACE_WITH_LOCAL_ELEVENLABS_API_KEY` |
| `ELEVENLABS_MODEL` | phase6 | server_config | plain_var | forbidden | `eleven_multilingual_v2` |
| `VOICE_DYNAMIC_GENERATION_ENABLED` | phase9d | server_config | plain_var | forbidden | `true` |
| `VOICE_CACHE_ENABLED` | phase6 | server_config | plain_var | forbidden | `true` |
| `VOICE_MAX_CHARS` | phase6 | server_config | plain_var | forbidden | `1400` |
| `VOICE_DAILY_MAX_RENDERS` | phase6 | server_config | plain_var | forbidden | `50` |
| `AVATAR_PROVIDER` | phase9d | server_config | plain_var | forbidden | `elevenlabs_video` |
| `AVATAR_MODE` | phase9d | server_config | plain_var | forbidden | `elevenlabs_talking_photo_key_moments` |
| `AVATAR_DYNAMIC_GENERATION_ENABLED` | phase9d | server_config | plain_var | forbidden | `true` |
| `AVATAR_RENDER_FINAL_SUMMARY_ONLY` | phase9d | server_config | plain_var | forbidden | `false` |
| `AVATAR_MAX_SCRIPT_CHARS` | phase9d | server_config | plain_var | forbidden | `1200` |
| `AVATAR_MAX_VIDEO_SECONDS` | phase9d | server_config | plain_var | forbidden | `65` |
| `AVATAR_CACHE_ENABLED` | phase6 | server_config | plain_var | forbidden | `true` |
| `HEYGEN_API_KEY` | phase6 | server_secret | secret | forbidden | `REPLACE_WITH_LOCAL_HEYGEN_API_KEY` |
| `HEYGEN_API_BASE_URL` | phase6 | server_config | plain_var | forbidden | `https://api.heygen.com` |
| `HEYGEN_VOICE_MODE` | phase6 | server_config | plain_var | forbidden | `uploaded_audio` |
| `HEYGEN_WEBHOOK_SECRET` | phase6 | server_secret | secret | forbidden | `REPLACE_WITH_LOCAL_HEYGEN_WEBHOOK_SECRET` |
| `MAKEUGC_API_KEY` | phase6_optional | server_secret | secret | forbidden | `DISABLED_UNLESS_PROVIDER_SELECTED` |
| `MAKEUGC_API_BASE_URL` | phase6_optional | server_config | plain_var | forbidden | `disabled` |
| `SCOOTER_AVATAR_IMAGE_URL` | phase9d | public_asset | plain_var | allowed_if_public_asset | `/assets/avatar/scooter-avatar-source.png` |
| `SCOOTER_AVATAR_INTRO_VIDEO_URL` | phase9d | public_asset | plain_var | allowed_if_public_asset | `/assets/avatar/scooter-welcome.mp4` |
| `SCOOTER_AVATAR_CLIP_MANIFEST` | phase9d | public_asset | plain_var | allowed_if_public_asset | `/assets/avatar/clip-manifest.json` |
| `COST_GUARD_ENABLED` | phase6 | server_config | plain_var | forbidden | `true` |
| `AVATAR_DAILY_MAX_RENDERS` | phase6 | server_config | plain_var | forbidden | `5` |
| `AVATAR_MONTHLY_MAX_RENDERS` | phase6 | server_config | plain_var | forbidden | `50` |
| `AVATAR_REQUIRE_OPERATOR_APPROVAL` | phase6 | server_config | plain_var | forbidden | `false` |
| `ALLOW_ANONYMOUS_PRACTICE` | phase3 | server_config | plain_var | forbidden | `true` |
| `REQUIRE_SHARE_CONSENT` | phase7 | server_config | plain_var | forbidden | `true` |
| `REQUIRE_EMAIL_CONSENT` | phase8_optional | server_config | plain_var | forbidden | `true` |
| `AUTO_CREATE_NETWORK_CONTACTS` | phase7 | server_config | plain_var | forbidden | `false` |
| `HUMAN_REVIEW_REQUIRED` | phase7 | server_config | plain_var | forbidden | `true` |
| `NETWORK_OS_BASE_URL` | phase7 | server_config | plain_var | forbidden | `https://network.joinwestpeek.com` |
| `NETWORK_OS_PITCH_LAB_ENDPOINT` | phase7 | server_config | plain_var | forbidden | `https://network.joinwestpeek.com/api/in...` |
| `NETWORK_OS_HANDOFF_ENABLED` | phase7 | server_config | plain_var | forbidden | `false` |
| `NETWORK_OS_SHARED_SECRET` | phase7 | server_secret | secret | forbidden | `REPLACE_WITH_LOCAL_NETWORK_OS_SHARED_SE...` |
| `NETWORK_OS_TIMEOUT_MS` | phase7 | server_config | plain_var | forbidden | `15000` |
| `PITCH_LAB_ALLOWED_ORIGIN` | phase7 | server_config | plain_var | forbidden | `http://localhost:5173` |
| `RATE_LIMIT_ENABLED` | phase4 | server_config | plain_var | forbidden | `true` |
| `RATE_LIMIT_WINDOW_SECONDS` | phase4 | server_config | plain_var | forbidden | `3600` |
| `RATE_LIMIT_MAX_REQUESTS` | phase4 | server_config | plain_var | forbidden | `25` |
| `MAX_PITCH_INPUT_CHARS` | phase3 | server_config | plain_var | forbidden | `12000` |
| `MAX_SESSION_QUESTIONS` | phase3 | server_config | plain_var | forbidden | `8` |
| `EMAIL_PROVIDER` | phase8_optional | server_config | plain_var | forbidden | `disabled` |
| `EMAIL_API_KEY` | phase8_optional | server_secret | secret | forbidden | `DISABLED_UNLESS_EMAIL_PROVIDER_SELECTED` |
| `EMAIL_FROM` | phase8_optional | server_config | plain_var | forbidden | `Pitch Lab <pitchlab@joinwestpeek.com>` |
| `EMAIL_REPLY_TO` | phase8_optional | server_config | plain_var | forbidden | `team@joinwestpeek.com` |
| `EMAIL_CARD_ENABLED` | phase8_optional | server_config | plain_var | forbidden | `false` |
| `CLOUDFLARE_ACCOUNT_ID` | phase10 | server_secret | secret | forbidden | `REPLACE_WITH_LOCAL_CLOUDFLARE_ACCOUNT_ID` |
| `CLOUDFLARE_API_TOKEN` | phase10 | server_secret | secret | forbidden | `REPLACE_WITH_LOCAL_CLOUDFLARE_API_TOKEN` |
| `CLOUDFLARE_PROJECT_NAME` | phase10 | server_config | plain_var | forbidden | `west-peek-pitch-lab` |
| `CLOUDFLARE_ENVIRONMENT` | phase10 | server_config | plain_var | forbidden | `production` |
| `CLOUDFLARE_WORKER_NAME` | phase10 | server_config | plain_var | forbidden | `west-peek-pitch-lab` |
| `ENV_VAULT_PATH` | phase1 | server_config | plain_var | forbidden | `secrets/pitch-lab.env.vault.enc` |
| `ENV_LOCAL_PATH` | phase1 | server_config | plain_var | forbidden | `.env.local` |
| `ENV_VAULT_ALGORITHM` | phase1 | server_config | plain_var | forbidden | `aes-256-gcm` |

## Local Env Creation

Run:

```bash
npm run env:create-local
```

This writes `.env.local` with safe placeholders. `.env.local` is local-machine only and must not be committed.

## Encrypted Env Vault

The repo includes:

```text
secrets/pitch-lab.env.vault.enc
```

This file is allowed in the repo because it is encrypted.

Rules:

- It may store the full env set.
- It must be encrypted with a passphrase stored outside the repo.
- The decrypted vault JSON must never be committed.
- The Phase 1 vault is placeholder-only and must be regenerated from real local values before production use.
- The vault must include provider/cost envs for Gemini, ElevenLabs, HeyGen, MakeUGC fallback, Network OS, Cloudflare, and local vault restoration.

Create or update from local env:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:vault:from-local
```

Restore local env from vault:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:local:from-vault
```

Inspect without printing values:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:vault:inspect
```

## Cloudflare Plan

Generate dry-run plan:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:cloudflare:plan
```

Phase 1 does not apply values to Cloudflare. It only creates a deterministic plan. A later apply script must require explicit operator confirmation and must never print secret values.

## Secret Rules

- Never commit `.env`, `.env.local`, `.env.production`, `.env.backup`, decrypted vault JSON, or passphrase files.
- Gemini, ElevenLabs, HeyGen, MakeUGC, Cloudflare, email, and Network OS handoff secrets must stay server-side/local only.
- Admin/health pages may show configured/missing only; no values, no partial values, no copy buttons.
- Logs must not print raw founder submissions plus provider secrets in the same diagnostic bundle.
- Network OS handoff must be signed or protected by a shared secret.

## Required Validation

- `npm run validate:env` must pass.
- `.env.example` and `.env.local.example` must contain every key from `config/env.registry.json`.
- `scripts/check-no-plaintext-secrets.mjs` must pass before artifact delivery.


## Pitch Lab → Network OS profile/packet endpoints

NETWORK_OS_PROFILE_CAPTURE_ENABLED=true
NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT=https://network.example.com/api/intake/pitch-lab-profile
NETWORK_OS_PITCH_LAB_PACKET_ENDPOINT=https://network.example.com/api/intake/pitch-lab
NETWORK_OS_SHARED_SECRET=<shared-secret>
NETWORK_OS_TIMEOUT_MS=15000

Profile capture sends only founder name, email, company, and optional website. Pitch answers remain private until the Founder Story Packet is explicitly shared.
