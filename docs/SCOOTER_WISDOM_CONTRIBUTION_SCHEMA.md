# Scooter Wisdom Contribution Schema

This document defines the preferred format for submitting Scooter wisdom so it can be reviewed, approved, validated, and safely used by AI Scooter.

## Raw intake can be messy

Raw intake does not have to follow a schema. Raw intake can be a voice memo, audio file, video file, transcript, rough notes, bullets, email, chat log, meeting notes, pasted text, or a stream-of-consciousness note from Scooter or the West Peek team.

Raw intake belongs in `content/scooter-wisdom/raw/`. It is never runtime material, never displayed to founders, and never used directly by AI Scooter.

Recommended raw folders:

```text
content/scooter-wisdom/raw/audio/
content/scooter-wisdom/raw/transcripts/
content/scooter-wisdom/raw/notes/
```

## Conversion flow

```text
messy raw intake
→ transcript / parsed notes
→ candidate wisdom chunks
→ human approval
→ approved runtime wisdom JSON
→ compiled runtime module
```

Audio/video must be transcribed before automated extraction unless a future transcription provider is explicitly enabled.

## Candidate wisdom template

```text
Principle:
Context:
When to use:
When not to use:
Example founder situation:
Exact words if any:
Is this a direct quote? yes/no
```

## Preferred structured contribution JSON

```json
{
  "id": "proof-beats-polish",
  "title": "Proof beats polish",
  "contributor": "Scooter Taylor",
  "source_type": "direct_note",
  "source_title": "Founder storytelling notes",
  "source_date": "2026-06-10",
  "approval_status": "candidate",
  "wisdom_tier": "gem",
  "display_label": "AI Scooter Gem",
  "direct_quote_allowed": false,
  "quote_text": "",
  "principle": "Proof beats polish.",
  "runtime_text": "Proof beats polish. A clear traction point will usually make your story stronger than prettier language.",
  "use_cases": ["traction", "proof", "story_gap", "pitch_card_feedback"],
  "founder_stage_fit": ["idea", "pre_seed", "seed", "growth"],
  "industry_fit": ["general"],
  "when_to_use": "Use when a founder has polished language but weak evidence, traction, customer proof, or specificity.",
  "when_not_to_use": "Do not use when the founder has provided strong proof and needs positioning help instead.",
  "prohibited_extrapolations": [
    "Do not imply the company is fundable.",
    "Do not imply West Peek is interested.",
    "Do not invent traction or proof.",
    "Do not call this a direct quote unless approved."
  ],
  "tone": "direct, encouraging, practical",
  "tags": ["proof", "traction", "clarity"],
  "approved_by": "",
  "approved_at": "",
  "notes": ""
}
```

## Wisdom tiers

`standard` means normal approved AI Scooter coaching principle.

`gem` means highlighted “💎 AI Scooter Gem”.

`direct_quote` means exact approved quote only.

## Display rules

All approved wisdom should feel like AI Scooter. Only `wisdom_tier: "gem"` gets the badge. The badge says **💎 AI Scooter Gem**. Do not say “straight from Scooter” unless `direct_quote_allowed: true`. Direct quotes require exact `quote_text`, source, and approval.
