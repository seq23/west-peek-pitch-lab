# Network OS Handoff Contract — Founder Story Packet

Pitch Lab sends a Founder Story Packet to Network OS only after explicit founder consent. This is a network review and relationship-routing intake, not an investment review, not a funding application, and not a guaranteed follow-up workflow.

## Payload shape

```json
{
  "source": "pitch_lab",
  "capture_type": "founder_story_packet",
  "person_type": "founder",
  "trigger_intent": "relationship_routing",
  "network_intake": true,
  "deal_flow_prospect": "unknown",
  "human_review_required": true,
  "execution_allowed": false,
  "review_status": "pending_network_review",
  "investment_decision": false,
  "profile_created": false,
  "contact_created": false,
  "follow_up_guaranteed": false,
  "ai_persona": "AI Scooter",
  "founder": {
    "name": "",
    "email": "",
    "company_name": "",
    "website": ""
  },
  "packet": {
    "version": "founder-story-packet-v1",
    "one_liner": "",
    "company_summary": "",
    "customer": "",
    "problem": "",
    "solution": "",
    "proof": "",
    "founder_edge": "",
    "why_now": "",
    "help_needed": "",
    "story_gaps": [],
    "likely_objections": [],
    "relationship_routing_notes": [],
    "ai_scooter_gems_used": [],
    "deck_context_used": false,
    "deck_included_with_consent": false,
    "practice_video_included_with_consent": false
  },
  "consent": {
    "founder_story_packet_shared": true,
    "deck_file_shared": false,
    "practice_video_shared": false,
    "consented_at": "",
    "consent_version": "pitch-lab-share-v1"
  },
  "disclaimers_acknowledged": {
    "ai_disclosure": true,
    "no_investment_advice": true,
    "no_guaranteed_follow_up": true,
    "network_review_only": true
  }
}
```

## Required guards

- Network OS may create or update a database-backed profile from self-submitted founder information.
- Network OS must not treat profile/database upsert as outreach, CRM conversion, investment review, acceptance, funding, or guaranteed follow-up.
- Network OS must not mark the packet as accepted, funded, invested, reviewed, or routed.
- Network OS must preserve `execution_allowed: false` until a human chooses otherwise outside Pitch Lab.
- Deck files and practice videos are not included without separate consent.


## Pitch Lab → Network OS profile/packet endpoints

NETWORK_OS_PROFILE_CAPTURE_ENABLED=true
NETWORK_OS_PITCH_LAB_PROFILE_ENDPOINT=https://network.example.com/api/intake/pitch-lab-profile
NETWORK_OS_PITCH_LAB_PACKET_ENDPOINT=https://network.example.com/api/intake/pitch-lab
NETWORK_OS_SHARED_SECRET=<shared-secret>
NETWORK_OS_TIMEOUT_MS=15000

Profile capture sends only founder name, email, company, and optional website. Pitch answers remain private until the Founder Story Packet is explicitly shared.
