> **SUPERSEDED FOR NETWORK OS HANDOFF** — Historical planning reference only. Current handoff law is `founder_profile_lead` → `founder_story_packet` with `trigger_intent: relationship_routing`, Network OS database upsert, no email notification, no auto-execution, and no guaranteed follow-up. Do not use stale `pitch_practice`, `deal_flow`, or `pitch_story_card` framing for current implementation.

# Privacy and Consent Model — West Peek Pitch Lab

**Status:** Phase 1 contract

## 1. Principle

West Peek Pitch Lab must give value before asking for relationship or data sharing.

Founder practice may be anonymous. Sharing with West Peek is optional and must be explicit.

## 2. Consent States

| State | Meaning | Network OS handoff allowed? |
|---|---|---:|
| Anonymous practice | Founder uses tool without sharing identity | No |
| Email card only | Founder provides email to receive card | No, unless separately consented |
| Share with West Peek | Founder explicitly consents to share Pitch Story Card | Yes |
| Follow-up consent | Founder agrees West Peek may contact them | Yes, with contact flag |

## 3. Required Copy

Before sharing with West Peek, show plain-language consent:

> By sharing this Pitch Story Card with West Peek, you agree that West Peek may review the information you provided for future relationship, founder support, or deal-flow purposes. Sharing does not guarantee review, funding, a meeting, or follow-up.

## 4. AI Disclosure

Show near the avatar and before the pitch flow:

> AI Scooter is an AI storytelling coach inspired by Scooter Taylor. This is not the real-time human Scooter and does not represent an investment decision or guarantee of review, funding, or a meeting.

## 5. Sensitive Data Guidance

Show before free-form pitch entry:

> Share only what you are comfortable sharing. You do not need to include confidential technical details, trade secrets, customer lists, or private financial information to practice your pitch.

## 6. Data Minimization

V1 should collect only:

- pitch answers;
- founder name only if sharing/emailing;
- email only if sharing/emailing;
- company/stage/sector only if helpful to Pitch Story Card or Network OS review.

Do not collect:

- passwords;
- payment info;
- government IDs;
- bank info;
- cap tables;
- confidential customer lists;
- uploaded decks in V1.

## 7. Runtime Rules

- No Network OS payload without explicit share consent.
- No automatic contact creation.
- No hidden marketing opt-in.
- Email card consent is separate from West Peek review consent.
- Follow-up consent is separate from share consent.
- Failure to submit must not show fake success.

## 8. Internal Review Boundary

Pitch Lab submissions enter Network OS as pending human review. A human reviewer decides whether to convert, attach, dismiss, or request more info.

## 9. Audit Fields

Every shared record should preserve:

- submitted timestamp;
- consent flags;
- source = pitch_lab;
- capture_type = pitch_practice;
- review_status = pending_human_review;
- human_review_required = true;
- execution_allowed = false.
