# User Journey Test Matrix — west-peek-pitch-lab

**Status:** ACTIVE  
**Updated:** 2026-06-16

| Persona | Journey | Tier 1 source/container proof | Tier 2 local browser proof | Tier 3 deployed/provider proof | Negative/edge path |
|---|---|---|---|---|---|
| Cold founder | Understand product and start from first viewport | locked copy, public usability, parity contract | CTA geometry at desktop/mobile; no overflow | public click audit | internal production language absent |
| Founder | Complete profile and optional deck choice | progressive-state source anchors | profile → deck → prompt; keyboard labels | deployed journey | invalid profile; deck optional |
| Founder | Answer first question while Scooter remains present | persistent stage and draft event contracts | first answer reveals draft; stage persists | deployed click audit | empty draft hidden before input |
| Founder | Review live draft on desktop | two-column source/CSS contract | draft visible without third competing column | deployed desktop evidence | long content and overflow |
| Founder | Review live draft on mobile | bottom-sheet/focus source contract | menu, sheet, Escape, focus return | deployed mobile evidence | no clipped nav; no background scroll |
| Founder | Generate and copy Founder Story Card | schema/display contracts | honest success/unavailable rendering | live LLM mutation/readback | provider unavailable; no fake output |
| Founder | Practice Out Loud | local media contracts | camera/take/transcript/best-take path | provider proof only where applicable | denied permission; cleanup |
| Founder | Share by explicit consent | payload and consent contracts | blocked early share; confirmed receipt only | signed Network OS mutation/readback | unchecked consent; provider/handoff failure |
| Founder | Return/refresh and delete info | storage/deletion contracts | refresh/re-entry and exact clearing | deployed integrity | fresh context isolation |
| Operator | Close release lifecycle | validation matrix and reports | exact 112-test suite | postdeploy audit, cleanup, final report | environment/provider gaps labeled |
