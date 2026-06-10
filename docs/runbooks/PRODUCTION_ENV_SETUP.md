# Production Env Setup — West Peek Pitch Lab

Real env values are the final subset of Phase 9D.

## Rules

- API keys stay in encrypted vault and platform secret stores only.
- Provider IDs and asset IDs that are not secrets can live in media identity config.
- The vault passphrase is supplied outside the repo.
- The passphrase is never written to source, docs, logs, examples, or Cloudflare.

## Process

1. Upload or create `.env.local` locally.
2. Run `npm run validate:env`.
3. Encrypt with `npm run env:vault:from-local`.
4. Delete plaintext `.env.local` before packaging/commit.
5. Review `npm run env:cloudflare:plan`.
6. Add secrets to Cloudflare by name.
