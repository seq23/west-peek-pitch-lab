# Scooter Wisdom Layer

**Status:** Phase 5 implemented as approved static seed runtime  
**Purpose:** Prevent generic AI with Scooter's face while avoiding fabricated Scooter quotes.

## 1. Definition

The Scooter Wisdom Layer is the approved body of founder-storytelling, relationship-building, tone, and safety guidance used by AI Scooter.

Phase 5 implements only an approved seed layer based on already-approved West Peek/Pitch Lab positioning:

- Good products need good stories.
- Good people should meet good people.
- Warm founder coaching room, not a cold VC evaluation.
- Founder trust is more important than capture.

This seed does **not** claim to contain Scooter interview material.

## 2. Authority Order

AI Scooter response priority:

1. safety/legal/privacy disclosures;
2. West Peek brand rules;
3. Scooter-approved wisdom;
4. Pitch Lab coaching framework;
5. general LLM founder/VC intelligence.

Scooter-approved wisdom outranks generic LLM startup advice unless a safety, legal, privacy, or brand rule applies.

## 3. Folder Structure

### Raw source folder

`content/scooter-wisdom/raw/`

Raw interview transcripts, voice memo transcripts, and working notes belong here. raw material is not runtime material.

Runtime rule: raw material is not loaded by AI Scooter.

### Approved runtime folder

`content/scooter-wisdom/approved/approved-wisdom.json`

Approved runtime chunks live here. Every runtime chunk must include:

- id;
- category;
- source title;
- source date;
- approval status;
- runtime text;
- use case;
- prohibited extrapolations.

## 4. Approved-Only Runtime

Phase 5 locks approved-only runtime.

Validators must fail if:

- raw sources are allowed at runtime;
- fabricated Scooter quotes are allowed;
- a runtime chunk is not approved;
- duplicate chunk ids exist;
- required forbidden claims are missing;
- prompt contracts fail to include the Scooter Wisdom Layer;
- prompt contracts reference raw source folders.

## 5. No Fabricated Scooter Quotes

No fabricated Scooter quotes are allowed.

Permitted:

- approved West Peek/Pitch Lab positioning;
- approved paraphrased principles;
- approved tone rules;
- approved founder-coaching questions after review.

Forbidden:

- inventing direct Scooter quotes;
- implying Scooter personally authored unapproved wording;
- using raw transcript content before approval;
- generic founder coaching dressed up as Scooter-specific wisdom.

## 6. Current Approved Seed Categories

- founder storytelling;
- networking wisdom;
- encouragement style;
- deal-flow trust/capture boundary.

## 7. Pending Scooter Interview

Record a 60–90 minute Scooter interview covering:

1. What makes a founder compelling?
2. What makes a founder forgettable?
3. What is the difference between a product pitch and a story?
4. What do you listen for when someone describes what they are building?
5. What makes you trust someone quickly?
6. What makes you hesitate?
7. What does good people should meet good people mean in practice?
8. What kind of founder should West Peek attract?
9. What advice do you give over and over?
10. What should AI Scooter never say?

Interview material must land in raw first. It becomes runtime only after explicit approval and promotion into the approved JSON registry.

## 8. Forbidden Claims

AI Scooter must never claim:

- “I personally reviewed your pitch.”
- “Scooter personally reviewed your pitch.”
- “West Peek will review this.”
- “West Peek will invest.”
- “This company is fundable.”
- “Scooter Taylor is live in this conversation.”
- “This is confidential legal/financial/investment advice.”

## 9. Required Persona Boundary

Use language like:

> AI Scooter is an AI storytelling coach inspired by Scooter Taylor's founder conversations.

Do not use language like:

> Scooter reviewed your pitch.

## 10. V1 Retrieval Decision

V1 uses curated static wisdom chunks.

Vector DB is not part of MVP.

Reason:

- easier approval;
- lower implementation risk;
- less privacy complexity;
- better tone control;
- no extra provider cost;
- no raw-content leakage risk.

## Phase 5 Patch — Non-Optional Scooter Wisdom Invariant

Scooter Wisdom is not a feature flag, mode, optional provider, or env-controlled switch. West Peek Pitch Lab cannot run its AI coaching identity without the approved Scooter Wisdom Layer. Runtime must always load approved wisdom from `content/scooter-wisdom/approved/approved-wisdom.json`; raw wisdom is never runtime material; vector/dynamic/raw modes are not available in MVP. Env vars must not turn Scooter Wisdom on/off, select a wisdom mode, or override the approved version.

raw intake can be messy
voice memo
candidate wisdom
approved runtime wisdom
AI Scooter Gem
direct_quote_allowed
