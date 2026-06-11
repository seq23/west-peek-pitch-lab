# Scooter Wisdom Admin Intake + Review Queue Roadmap

**Status:** LATER ROADMAP UPGRADE

## Problem

The current Scooter Wisdom flow is safe but repo-operated: raw notes or transcripts become candidates, candidates are reviewed, approved wisdom is compiled, validation runs, and the repo is updated. That is acceptable for MVP v1, but too manual if Scooter is regularly sending new knowledge.

## Locked principle

Automate ingestion and candidate creation. Keep final approval human-gated. Raw Scooter knowledge must never auto-go live.

## Future workflow

```text
Scooter submits note/audio/transcript
→ system stores raw wisdom
→ system extracts candidate wisdom
→ admin review queue shows candidates
→ human approves, edits, or rejects
→ approved wisdom compiles into runtime
→ validation runs
→ deploy happens via one-button or automated deploy hook
```

## Required capabilities

- Private admin/intake route.
- Submit note, transcript, or audio.
- Store raw wisdom with timestamps/source metadata.
- Extract candidate wisdom into reviewable chunks.
- Edit, approve, reject, or archive candidates.
- Preserve audit trail.
- Compile approved wisdom into runtime.
- Trigger validation/deploy path.
- Roll back or deprecate outdated wisdom.

## Guardrails

Raw wisdom must not directly affect production prompts, appear founder-facing without approval, override trust/legal boundaries, create investment claims, leak sensitive/private material, or fabricate “Scooter said” language.

## Possible infrastructure

- Cloudflare Pages Function for intake/review APIs.
- R2/KV/D1 decision for raw/candidate/approved storage.
- Admin auth.
- GitHub Action or deploy hook for approved wisdom compile/deploy.
- Review queue UI.

## MVP v1 status

For now, the repo workflow remains the safe source of truth. This roadmap reduces manual friction later without compromising approval discipline.
