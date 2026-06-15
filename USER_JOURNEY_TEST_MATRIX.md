# User Journey Test Matrix — west-peek-pitch-lab

Status: ACTIVE
Date: 2026-06-11

Every meaningful user action must map to local proof, deployed proof, and provider proof where applicable.

| Persona | Action | Expected state change / outcome | Tier 1 source proof | Tier 2 local/browser proof | Tier 3 deployed/provider proof | Negative/edge path | Status |
|---|---|---|---|---|---|---|---|
| Founder | Complete pitch intake and AI Scooter critique | LLM response visible, saved in journey state, no placeholder AI output | matrix/docs/validators | headed/self-spawn/browser path | deployed + provider evidence/readback | invalid/duplicate/unauthorized/provider-unavailable path required | REQUIRED |
| Founder | Camera/rehearsal/media path | local browser proof or safe unavailable state; no fake media success | matrix/docs/validators | headed/self-spawn/browser path | deployed + provider evidence/readback | invalid/duplicate/unauthorized/provider-unavailable path required | REQUIRED |
| Founder | Share profile/story packet to Network OS | signed handoff succeeds and Network OS confirms pending review | matrix/docs/validators | headed/self-spawn/browser path | deployed + provider evidence/readback | invalid/duplicate/unauthorized/provider-unavailable path required | REQUIRED |
| Operator | Restore vault and sync Cloudflare env | env present by name without printing values; deployed runtime uses same contract | matrix/docs/validators | headed/self-spawn/browser path | deployed + provider evidence/readback | invalid/duplicate/unauthorized/provider-unavailable path required | REQUIRED |
| Founder | Mobile/browser route journey | core flows usable across viewport and refresh/re-entry | matrix/docs/validators | headed/self-spawn/browser path | deployed + provider evidence/readback | invalid/duplicate/unauthorized/provider-unavailable path required | REQUIRED |

## Rule

Seeded/demo fixtures may support fast smoke tests but cannot replace newly-created/entity-scoped or provider-backed Tier 3 proof.
