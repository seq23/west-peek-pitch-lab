# Network OS Handoff Contract — Pitch Lab to Network OS

**Status:** Phase 1 contract  
**Source app:** `west-peek-pitch-lab`  
**Destination app:** `west-peek-network-os`  
**Destination behavior:** intake queue only, human review required.

## 1. Core Rule

Pitch Lab may create a pending Network OS intake record only after explicit founder consent.

Pitch Lab must not:

- create final contacts automatically;
- create touches automatically;
- create approval records automatically;
- mark an opportunity as reviewed by Scooter;
- mark an opportunity as investment-approved;
- bypass human review.

## 2. Network OS Existing Fit

The uploaded Network OS repo already includes fields that fit Pitch Lab:

- `source`;
- `capture_type`;
- `trigger_intent`;
- `person_type`;
- `deal_flow_prospect`;
- `deal_context`;
- `parsed_*` fields;
- `ai_summary`;
- `human_review_required`;
- `execution_allowed`;
- `review_status`.

Therefore, Pitch Lab should extend the intake model narrowly instead of creating a duplicate data model.

## 3. Required Network OS Enum Additions

In `west-peek-network-os`:

- `IntakeSource` should add `pitch_lab`.
- `CaptureType` should add `pitch_practice`.

Suggested future review category enum:

- `possible_fund_fit`
- `network_intro_candidate`
- `founder_to_watch`
- `partner_customer_intro_candidate`
- `community_event_invite`
- `not_relevant`
- `needs_more_info`

## 4. Pitch Lab Submission Payload

```ts
export type PitchLabSubmission = {
  source: 'pitch_lab';
  capture_type: 'pitch_practice';
  founder_name: string;
  founder_email: string;
  founder_company?: string;
  founder_title?: string;
  website?: string;
  linkedin_url?: string;
  sector?: string;
  stage?: string;
  location?: string;

  original_pitch: string;
  one_line_pitch: string;
  thirty_second_pitch: string;
  two_minute_pitch?: string;

  problem: string;
  customer: string;
  solution: string;
  traction_or_proof?: string;
  founder_edge?: string;
  why_now?: string;
  biggest_story_gap?: string;
  biggest_investor_objection?: string;
  suggested_next_relationships?: string;

  ai_scooter_summary: string;
  pitch_story_card_markdown: string;

  consent_share_with_west_peek: boolean;
  consent_contact_followup: boolean;
  consent_email_card: boolean;

  submitted_at: string;
};
```

## 5. Network OS Intake Mapping

```ts
{
  source: 'pitch_lab',
  capture_type: 'pitch_practice',
  captured_by: 'pitchlab@joinwestpeek.com',
  source_user_email: founder_email,
  source_trigger: 'pitch_lab_share',
  trigger_intent: 'deal_flow',
  person_type: 'founder',
  deal_flow_prospect: 'yes',
  raw_text: pitch_story_card_markdown,
  parsed_name: founder_name,
  parsed_email: founder_email,
  parsed_company: founder_company,
  parsed_title: founder_title,
  parsed_website: website,
  parsed_notes: ai_scooter_summary,
  deal_context: one_line_pitch,
  ai_summary: ai_scooter_summary,
  ai_confidence: 'medium',
  human_review_required: true,
  execution_allowed: false,
  review_status: 'pending_human_review'
}
```

## 6. Handoff Endpoint Recommendation

Add a dedicated endpoint in Network OS:

`functions/api/intake/pitch-lab.js`

Reason:

- separates public Pitch Lab submissions from Gmail trigger flows;
- keeps consent validation explicit;
- avoids overloading trigger-specific logic;
- makes signature/origin checks clearer.

## 7. Security Requirements

The endpoint must:

- require shared secret or signed request;
- reject missing/false `consent_share_with_west_peek`;
- reject missing founder email for share submissions;
- enforce input length limits;
- set `human_review_required = true`;
- set `execution_allowed = false`;
- return honest failure if write fails;
- not print secrets in logs.

## 8. Required Network OS Tests

- `pitch_lab` source is accepted by schema.
- `pitch_practice` capture type is accepted by schema.
- unsigned request is rejected.
- missing consent is rejected.
- valid submission creates intake queue row.
- valid submission does not create contact.
- valid submission appears as pending human review.
- reviewer can convert, attach, dismiss, or mark needs more info.


## Phase 7 Network OS handoff

Implemented consent-gated signed handoff from Pitch Lab to Network OS. Pitch Lab posts to `/api/pitch/share`; Network OS receives at `/api/intake/pitch-lab`. The handoff creates pending intake only, requires explicit consent, and forbids automatic contact creation. See `docs/PHASE_7_NETWORK_OS_HANDOFF_REVIEW.md`.
