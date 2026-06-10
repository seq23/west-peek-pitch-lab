# Scooter Wisdom Update Runbook

This runbook keeps AI Scooter wisdom easy to update without allowing raw or unapproved material into runtime.

## Workflow

1. Add raw source material to `content/scooter-wisdom/raw/`.
   - voice memo/audio: `raw/audio/`
   - transcript: `raw/transcripts/`
   - rough notes: `raw/notes/`
2. If audio/video was provided, transcribe it first and save the transcript under `raw/transcripts/`.
3. Extract candidates:
   ```bash
   npm run wisdom:extract
   ```
4. Review `content/scooter-wisdom/candidates/candidate-wisdom.json`.
5. Move approved chunks into `content/scooter-wisdom/approved/approved-wisdom.json`.
6. Compile runtime wisdom:
   ```bash
   npm run wisdom:compile
   ```
7. Validate:
   ```bash
   npm run wisdom:validate
   npm run validate:all
   ```
8. Commit.

## Rules

- Raw intake can be messy.
- Raw material is not runtime material.
- Candidate wisdom is not runtime material.
- Runtime wisdom must be approved.
- Do not invent AI Scooter quotes.
- Do not imply AI Scooter, real Scooter, or any human reviewed a founder.
- Do not add investment advice, funding promises, intro promises, meeting promises, or guaranteed follow-up.
- Use **💎 AI Scooter Gem** only when `wisdomTier` is `gem`.
- Do not use “straight from Scooter” unless direct quote approval exists.
