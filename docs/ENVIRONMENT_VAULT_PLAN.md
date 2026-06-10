# Environment Vault Plan — West Peek Pitch Lab

**Status:** Phase 1 locked contract  
**Purpose:** Make environment configuration deterministic, recoverable, local-machine friendly, and Cloudflare-ready without committing plaintext secrets.

## Operating Model

Pitch Lab uses three coordinated environment sources:

1. `config/env.registry.json` — committed registry of every env var name, phase, scope, placeholder, and Cloudflare binding type.
2. `.env.local` — local machine file generated from the registry with safe placeholders; never committed.
3. `secrets/pitch-lab.env.vault.enc` — committed encrypted env vault that can persist the full env set without plaintext values.

The registry is the deterministic map. The encrypted vault is the persistent value carrier. `.env.local` is the local runtime file.

## Local Machine Flow

Run:

```bash
npm run env:create-local
```

This creates `.env.local` from `config/env.registry.json` with acceptable placeholder values.

Rules:

- The script refuses to overwrite `.env.local` unless `npm run env:create-local:force` is used.
- `.env.local` is ignored by git.
- `.env.local` may contain real local values on the owner machine only.
- `.env.local` must never be copied into docs, logs, screenshots, tickets, or ZIP manifests.

## Encrypted Vault Flow

After local values are filled in, run:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:vault:from-local
```

This reads `.env.local`, encrypts the full env set, and writes:

```text
secrets/pitch-lab.env.vault.enc
```

Rules:

- The passphrase is supplied outside the repo.
- The passphrase is never committed.
- The encrypted file may be committed.
- Decrypted vault JSON is forbidden in repo.
- The placeholder vault included in Phase 1 is not a production secret source.

## Cloudflare Deployment Flow

The Cloudflare sync system is dry-run by default in Phase 1.

Run:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:cloudflare:plan
```

This creates a deployment plan listing env names and whether each should become a Cloudflare plain var or secret.

Phase 2+ may add a guarded `--apply` script, but it must require explicit operator confirmation and must never print secret values.

## Cloudflare Binding Rules

- `plain_var` values may become Cloudflare non-secret env vars when safe.
- `secret` values must be added through Cloudflare secret storage.
- Client-exposed values must be explicitly marked `allowed` or `allowed_if_public_asset` in the registry.
- Server secrets must never be exposed to browser bundles.

## Required Scripts

| Script | Purpose |
|---|---|
| `npm run env:create-local` | Creates `.env.local` with safe placeholders from registry |
| `npm run env:vault:from-local` | Encrypts local env into committed vault |
| `npm run env:vault:inspect` | Decrypts vault and prints names/status only, not raw values |
| `npm run env:cloudflare:plan` | Creates dry-run Cloudflare env sync plan |
| `npm run validate:env` | Validates registry, examples, encrypted vault envelope, and gitignore safety |

## Hard Prohibitions

- No plaintext `.env.local` in repo.
- No plaintext decrypted vault file in repo.
- No committed passphrase.
- No client-side LLM, HeyGen, email, or Network OS secrets.
- No Cloudflare sync script may print secret values.
- No production deployment may rely on undocumented dashboard-only env values.

## Acceptance Criteria

Phase 1 env plan is valid only when:

- every env var appears in `config/env.registry.json`
- `.env.example` and `.env.local.example` contain every registry key
- `.env.local` can be generated from registry
- encrypted vault file exists
- encrypted vault envelope validates
- `.gitignore` blocks plaintext env files and decrypted vault files
- Cloudflare sync plan can be generated without printing values

## Restore Local Env from Vault

On the owner machine, the encrypted vault can recreate `.env.local`:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:local:from-vault
```

The restore script refuses to overwrite `.env.local` unless the force command is used:

```bash
ENV_VAULT_PASSPHRASE="use-a-real-passphrase-from-password-manager" npm run env:local:from-vault:force
```

This is the deterministic recovery path: registry defines every key, vault preserves the values, and `.env.local` is regenerated locally when needed.
