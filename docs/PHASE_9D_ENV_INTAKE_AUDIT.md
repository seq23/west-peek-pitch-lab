# Phase 9D Env Intake Audit

## Status

- Uploaded env file was parsed against `config/env.registry.json`.
- Unknown keys: 0.
- Uploaded keys: 62.
- Registry keys written into temporary local env before vault encryption: 74.
- Real values were encrypted into `secrets/pitch-lab.env.vault.enc`.
- Plaintext `.env.local` was deleted before package.
- This audit intentionally records key names and status only; it never records secret values.

## Uploaded key status

| Key | Status | Scope | Binding |
|---|---|---|---|
| APP_ENV | configured | public_config | plain_var |
| APP_BASE_URL | configured | public_config | plain_var |
| PUBLIC_APP_URL | configured | public_config | plain_var |
| LLM_PROVIDER | configured | server_config | plain_var |
| GEMINI_API_KEY | configured | server_secret | secret |
| GEMINI_MODEL | configured | server_config | plain_var |
| GEMINI_API_BASE_URL | configured | server_config | plain_var |
| LLM_TIMEOUT_MS | configured | server_config | plain_var |
| LLM_MAX_INPUT_CHARS | configured | server_config | plain_var |
| LLM_MAX_OUTPUT_TOKENS | configured | server_config | plain_var |
| LLM_FALLBACK_ENABLED | configured | server_config | plain_var |
| LLM_FALLBACK_PROVIDER | configured | server_config | plain_var |
| LLM_ROUTING_MODE | configured | server_config | plain_var |
| OPENAI_API_KEY | blank | server_secret | secret |
| OPENAI_MODEL | configured | server_config | plain_var |
| OPENAI_API_BASE_URL | configured | server_config | plain_var |
| OPENAI_TIMEOUT_MS | configured | server_config | plain_var |
| OPENAI_MAX_OUTPUT_TOKENS | configured | server_config | plain_var |
| VOICE_PROVIDER | configured | server_config | plain_var |
| ELEVENLABS_API_KEY | configured | server_secret | secret |
| ELEVENLABS_MODEL | configured | server_config | plain_var |
| VOICE_DYNAMIC_GENERATION_ENABLED | configured | server_config | plain_var |
| VOICE_CACHE_ENABLED | configured | server_config | plain_var |
| VOICE_MAX_CHARS | configured | server_config | plain_var |
| VOICE_DAILY_MAX_RENDERS | configured | server_config | plain_var |
| AVATAR_PROVIDER | configured | server_config | plain_var |
| AVATAR_MODE | configured | server_config | plain_var |
| AVATAR_DYNAMIC_GENERATION_ENABLED | configured | server_config | plain_var |
| AVATAR_RENDER_FINAL_SUMMARY_ONLY | configured | server_config | plain_var |
| AVATAR_MAX_SCRIPT_CHARS | configured | server_config | plain_var |
| AVATAR_MAX_VIDEO_SECONDS | configured | server_config | plain_var |
| AVATAR_CACHE_ENABLED | configured | server_config | plain_var |
| HEYGEN_API_KEY | registry default / optional not uploaded | server_secret | secret |
| HEYGEN_API_BASE_URL | registry default / optional not uploaded | server_config | plain_var |
| HEYGEN_VOICE_MODE | registry default / optional not uploaded | server_config | plain_var |
| HEYGEN_WEBHOOK_SECRET | registry default / optional not uploaded | server_secret | secret |
| MAKEUGC_API_KEY | registry default / optional not uploaded | server_secret | secret |
| MAKEUGC_API_BASE_URL | registry default / optional not uploaded | server_config | plain_var |
| SCOOTER_AVATAR_IMAGE_URL | configured | public_asset | plain_var |
| SCOOTER_AVATAR_INTRO_VIDEO_URL | configured | public_asset | plain_var |
| SCOOTER_AVATAR_CLIP_MANIFEST | configured | public_asset | plain_var |
| COST_GUARD_ENABLED | configured | server_config | plain_var |
| AVATAR_DAILY_MAX_RENDERS | configured | server_config | plain_var |
| AVATAR_MONTHLY_MAX_RENDERS | configured | server_config | plain_var |
| AVATAR_REQUIRE_OPERATOR_APPROVAL | configured | server_config | plain_var |
| ALLOW_ANONYMOUS_PRACTICE | configured | server_config | plain_var |
| REQUIRE_SHARE_CONSENT | configured | server_config | plain_var |
| REQUIRE_EMAIL_CONSENT | registry default / optional not uploaded | server_config | plain_var |
| AUTO_CREATE_NETWORK_CONTACTS | configured | server_config | plain_var |
| HUMAN_REVIEW_REQUIRED | configured | server_config | plain_var |
| NETWORK_OS_BASE_URL | configured | server_config | plain_var |
| NETWORK_OS_PITCH_LAB_ENDPOINT | configured | server_config | plain_var |
| NETWORK_OS_HANDOFF_ENABLED | configured | server_config | plain_var |
| NETWORK_OS_SHARED_SECRET | blank | server_secret | secret |
| NETWORK_OS_TIMEOUT_MS | configured | server_config | plain_var |
| PITCH_LAB_ALLOWED_ORIGIN | configured | server_config | plain_var |
| RATE_LIMIT_ENABLED | configured | server_config | plain_var |
| RATE_LIMIT_WINDOW_SECONDS | configured | server_config | plain_var |
| RATE_LIMIT_MAX_REQUESTS | configured | server_config | plain_var |
| MAX_PITCH_INPUT_CHARS | configured | server_config | plain_var |
| MAX_SESSION_QUESTIONS | configured | server_config | plain_var |
| EMAIL_PROVIDER | registry default / optional not uploaded | server_config | plain_var |
| EMAIL_API_KEY | registry default / optional not uploaded | server_secret | secret |
| EMAIL_FROM | registry default / optional not uploaded | server_config | plain_var |
| EMAIL_REPLY_TO | registry default / optional not uploaded | server_config | plain_var |
| EMAIL_CARD_ENABLED | registry default / optional not uploaded | server_config | plain_var |
| CLOUDFLARE_ACCOUNT_ID | configured | local_tooling | none |
| CLOUDFLARE_API_TOKEN | configured | local_tooling | none |
| CLOUDFLARE_PROJECT_NAME | configured | local_tooling | none |
| CLOUDFLARE_ENVIRONMENT | configured | local_tooling | none |
| CLOUDFLARE_WORKER_NAME | configured | local_tooling | none |
| ENV_VAULT_PATH | configured | local_tooling | none |
| ENV_LOCAL_PATH | configured | local_tooling | none |
| ENV_VAULT_ALGORITHM | configured | local_tooling | none |

## Outstanding values

- OPENAI_API_KEY: uploaded but blank.
- NETWORK_OS_SHARED_SECRET: uploaded but blank.

## Operational note

- `OPENAI_API_KEY` can remain blank if OpenAI fallback is disabled or intentionally unused.
- `NETWORK_OS_SHARED_SECRET` must be populated with the same value in Pitch Lab and Network OS before live handoff can be proven.
- Cloudflare token and account ID were received and encrypted into the vault.

## Phase 9D Env Intake Update — OpenAI + Scooter Voice + Shared Secret

Date: 2026-06-10

### Intake Result

- Updated env attachment accepted.
- Accepted uploaded keys: 62.
- Unknown uploaded keys: 0.
- Registry keys encrypted into vault: 74.
- `OPENAI_API_KEY` is now present in encrypted vault.
- `ELEVENLABS_API_KEY` remains present in encrypted vault.
- `NETWORK_OS_SHARED_SECRET` was blank in the uploaded file, so a new high-entropy shared secret was generated during intake and encrypted into the Pitch Lab vault.
- The generated shared secret value is not written to repo docs, logs, source files, examples, or plaintext artifacts.
- Plaintext `.env.local` was deleted before packaging.

### Scooter Voice Identity

The approved Coach Scooter ElevenLabs voice ID was added to the non-secret media identity contract:

- `src/server/media/scooterMediaIdentity.mjs`
- Voice ID: stored as provider identity, not a secret.

### ElevenLabs Avatar / Photo Variables

No additional ElevenLabs avatar/photo provider IDs were added yet because they are not known from the current account workflow. This is intentionally not blocking env vault completion.

Current position:

- `ELEVENLABS_API_KEY` controls API access and stays encrypted in vault.
- `elevenLabsVoiceId` is repo-owned media identity and now set.
- `elevenLabsAvatarId` remains `TO_BE_SET_AFTER_ELEVENLABS_VIDEO_ASSET_CREATION_IF_REQUIRED` until the ElevenLabs video/avatar asset workflow is confirmed in the account.

### Shared Secret Sync Requirement

Pitch Lab now has the sender-side shared secret encrypted as `NETWORK_OS_SHARED_SECRET`.

Network OS must receive the exact same value as `PITCH_LAB_SHARED_SECRET` before live handoff proof.

Do not invent a second value. The secret is a pair.

### Remaining Live-Proof Gaps

- Network OS receiver env still needs the matching `PITCH_LAB_SHARED_SECRET`.
- Live ElevenLabs voice/video render proof has not run.
- Local headed Master Gauntlet has not run.
- Cloudflare production deploy and postdeploy smoke have not run.


## Profile Capture Contract Repair — 2026-06-16

The canonical env registry now also includes:

- `NETWORK_OS_PITCH_LAB_PACKET_ENDPOINT`
- `NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT`
- `NETWORK_OS_PROFILE_CAPTURE_ENABLED`

The runtime derives the profile endpoint from `NETWORK_OS_BASE_URL` or the packet endpoint when the explicit profile endpoint is absent. This makes the code compatible with the existing deployed env shape. Live persistence still requires the exact same secret value in both deployments:

- Pitch Lab: `NETWORK_OS_SHARED_SECRET`
- Network OS: `PITCH_LAB_SHARED_SECRET`

The historical intake note above records that the receiver-side secret still needed synchronization. That is a deployment configuration task, not a Network OS source-code defect.
