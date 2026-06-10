> **SUPERSEDED FOR NETWORK OS HANDOFF** — Historical planning reference only. Current handoff law is `founder_profile_lead` → `founder_story_packet` with `trigger_intent: relationship_routing`, Network OS database upsert, no email notification, no auto-execution, and no guaranteed follow-up. Do not use stale `pitch_practice`, `deal_flow`, or `pitch_story_card` framing for current implementation.

# West Peek Pitch Lab — Product Spec

**Status:** Approved and locked for Phase 1  
**Product:** West Peek Pitch Lab  
**Feature experience:** Pitch Practice with Scooter  
**Founder line:** Good products need good stories.  
**West Peek brand line:** Good people should meet good people.

## 1. Purpose

West Peek Pitch Lab is a warm founder coaching room. It helps founders practice and clarify their pitch through AI Scooter, then generates a Pitch Story Card they can optionally share with West Peek.

The tool exists to:

1. help founders tell clearer stories;
2. express West Peek's relationship-first brand;
3. create permissioned founder/deal-flow signal;
4. feed opted-in submissions into the existing West Peek Network OS intake queue.

## 2. Non-Goals

Pitch Lab must not become:

- a duplicate CRM;
- an AI investment committee;
- an automatic funding evaluator;
- a fake human impersonation of Scooter;
- a forced lead capture form;
- a system that claims real Scooter personally reviewed a pitch;
- a system that creates final Network OS contacts without human review.

## 3. Core User Promise

Founder-facing promise:

> Practice your pitch with AI Scooter, sharpen your story, and leave with a Pitch Story Card you can keep or optionally share with West Peek.

## 4. Primary Experience

### Step 1 — Landing

The founder sees:

- West Peek Pitch Lab
- Good products need good stories.
- Good people should meet good people.
- Practice your pitch CTA
- AI Scooter disclosure

### Step 2 — Pitch Practice

AI Scooter guides the founder through:

1. What are you building?
2. Who is it for?
3. What painful problem does it solve?
4. Why now?
5. Why are you or your team the right people?
6. What proof or traction do you have?
7. What kind of help, people, capital, customers, partners, or strategic relationships do you need next?

### Step 3 — AI Scooter Feedback

The system gives warm, direct feedback on:

- what is clear;
- what is confusing;
- what sounds generic;
- where proof is missing;
- what an investor/partner may question;
- what relationship or intro types could help.

### Step 4 — Pitch Story Card

The founder receives a Pitch Story Card containing:

- one-line pitch;
- 30-second pitch;
- optional 2-minute pitch/story;
- company summary;
- customer/ICP;
- problem;
- solution;
- traction/proof;
- founder edge;
- why now;
- biggest story gap;
- likely investor objection;
- suggested next relationships;
- AI Scooter summary.

### Step 5 — Optional Sharing

After receiving value, the founder can choose:

- email me my Pitch Story Card;
- share this with West Peek;
- save this for a future West Peek conversation;
- I just wanted to practice.

No Network OS submission may happen without explicit share consent.

## 5. Internal Outcome

Opted-in submissions become Network OS intake rows with:

- `source = pitch_lab`;
- `capture_type = pitch_practice`;
- `person_type = founder`;
- `trigger_intent = deal_flow`;
- `deal_flow_prospect = yes` or `unknown`;
- `review_status = pending_human_review`;
- `human_review_required = true`;
- `execution_allowed = false`.

## 6. Required Disclosures

Pitch Lab must disclose:

- AI Scooter is an AI storytelling coach inspired by Scooter Taylor.
- It is not real-time human Scooter.
- Sharing is optional.
- No guarantee of review, funding, or meeting.
- This is not investment, legal, financial, or business advice.
- Sensitive/confidential information should be shared intentionally.

## 7. Product Tone

Must feel:

- warm;
- smart;
- charismatic;
- founder-friendly;
- relationship-oriented;
- clear but not harsh;
- premium, not gimmicky.

Must not feel:

- cold;
- extractive;
- robotic;
- generic;
- VC gatekeeper-ish;
- fake-human deceptive;
- hypey or unserious.

## 8. MVP Scope

V1 includes:

- public landing page;
- Scooter avatar card with disclosure;
- pitch practice flow;
- server-side LLM-generated feedback;
- Pitch Story Card;
- optional consented share;
- Network OS handoff;
- static avatar fallback;
- validation and E2E proof.

V1 excludes:

- auth;
- founder dashboard;
- deck upload;
- dynamic real-time avatar dependency;
- investment scoring;
- automatic CRM conversion;
- payment;
- internal deal pipeline automation.

## 9. Success Criteria

The MVP succeeds only if:

- founder can complete practice without capture;
- founder receives a useful Pitch Story Card;
- consented share creates a pending Network OS intake row;
- no contact is auto-created;
- AI disclosure is visible;
- provider failures fail safely;
- required validation passes.

## Phase 10 locked product framing

West Peek Pitch Lab is an AI Scooter-led founder story practice system. It captures minimal founder identity, guides founders through a structured chat-style coaching experience, optionally uses a deck as context, generates a Pitch Story Card, supports optional local camera rehearsal, and lets founders explicitly share a Founder Story Packet with West Peek for network review and relationship routing — with clear disclaimers, strict AI guardrails, no fake human review, no investment-review framing, and no guaranteed outcomes.
