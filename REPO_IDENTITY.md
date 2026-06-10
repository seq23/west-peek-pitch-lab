# REPO IDENTITY — West Peek Pitch Lab

**Status:** ACTIVE — Phase 1 planning baseline  
**Repo slug:** `west-peek-pitch-lab`  
**Expected branch:** `main`  
**Expected product/domain:** `pitchlab.joinwestpeek.com`  
**Product name:** West Peek Pitch Lab  
**Feature experience:** Pitch Practice with Scooter  
**Primary internal integration:** West Peek Network OS at `network.joinwestpeek.com`

## Identity Lock

This repo is the public founder-facing Pitch Lab application. It must not become a duplicate CRM.

## Product Lines

- Founder-facing line: **Good products need good stories.**
- West Peek brand line: **Good people should meet good people.**

## Repo Role

This repo owns:

- public Pitch Lab UI
- AI Scooter founder coaching flow
- Pitch Story Card generation
- founder consent/share flow
- LLM prompt and provider contracts
- avatar provider contract/fallback
- handoff payload to Network OS

This repo does **not** own:

- final CRM/contact database
- West Peek Network OS contact conversion
- investment decisions
- claims of real Scooter review
- automatic contact creation

## Required Companion Repo

Existing internal CRM repo:

- `west-peek-network-os`

Pitch Lab may submit opted-in founder records into Network OS intake. Network OS remains the system of record for review, conversion, and relationship tracking.

## Completion Constraint

No implementation may claim COMPLETE until the public founder journey and Network OS handoff are both proven at the required validation depth. Phase 1 is documentation and contract lock only.
