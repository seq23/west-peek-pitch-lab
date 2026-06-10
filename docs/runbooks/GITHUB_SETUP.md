# GitHub Setup — West Peek Pitch Lab

Target repo name: `west-peek-pitch-lab`

This runbook is executed locally after the baseline ZIP is applied to the correct local repo root.

Do not run GitHub commands until repo identity and local path are confirmed.

## Required checks before first push

1. Confirm repo root.
2. Confirm no plaintext `.env.local` or decrypted vault exists.
3. Run `npm run validate:all`.
4. Run the Master Gauntlet locally when Playwright is installed.
5. Commit source only.

## GitHub creation

Use GitHub UI or `gh repo create west-peek-pitch-lab --private --source=. --remote=origin` after local repo identity is confirmed.

GitHub Actions status is not proven until `gh run list --limit 20` is checked after push.
