# Environment Setup Runbook — West Peek Pitch Lab

## Step 1 — Create local env placeholders

```bash
npm run env:create-local
```

This creates `.env.local` with safe placeholders.

## Step 2 — Fill local values

Open `.env.local` on the local machine and replace placeholder values that are needed for the active phase.

Do not commit `.env.local`.

## Step 3 — Encrypt local env into repo vault

```bash
ENV_VAULT_PASSPHRASE="your-passphrase-from-password-manager" npm run env:vault:from-local
```

This updates `secrets/pitch-lab.env.vault.enc`.

## Step 4 — Verify vault can be opened

```bash
ENV_VAULT_PASSPHRASE="your-passphrase-from-password-manager" npm run env:vault:inspect
```

The script prints env names and configured/placeholder status only. It does not print raw values.

## Step 5 — Generate Cloudflare env plan

```bash
ENV_VAULT_PASSPHRASE="your-passphrase-from-password-manager" npm run env:cloudflare:plan
```

Review `logs/cloudflare-env-plan.txt`. In Phase 1, this is a dry-run plan only.

## Failure Rules

- If `.env.local` already exists, the create script stops instead of overwriting.
- If the vault passphrase is missing or too short, vault scripts fail.
- If the vault cannot decrypt, stop and use the password manager backup passphrase.
- If a real secret appears in repo files, rotate the secret and regenerate a clean artifact.

## Restore Existing Local Env From Vault

If the encrypted vault already contains the correct values, restore `.env.local` with:

```bash
ENV_VAULT_PASSPHRASE="your-passphrase-from-password-manager" npm run env:local:from-vault
```

Use force only when intentionally replacing the local file:

```bash
ENV_VAULT_PASSPHRASE="your-passphrase-from-password-manager" npm run env:local:from-vault:force
```
