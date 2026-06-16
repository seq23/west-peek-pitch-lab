# Visible Control Inventory — West Peek Pitch Lab

| Route/state | Control | State change | Durable readback | Failure UX | Proof |
|---|---|---|---|---|---|
| `/` lobby | Start Step 1 | Navigate to `/practice` | N/A | Link remains keyboard accessible | founder-room UX + deployed click audit |
| public mobile header | Open navigation / Escape | Menu opens/closes and focus remains usable | N/A | No clipped navigation | founder-room UX |
| session routes | Minimize / Expand Scooter | Stage toggles compact/expanded presentation only | N/A | Scooter remains visible | founder-room UX + gauntlet |
| `/practice` profile | Continue to your first question | Persist profile; reveal deck choice | localStorage + profile-capture status | inline validation; practice remains blocked | gauntlet + postdeploy journey |
| `/practice` deck | Continue without a deck | Persist no-deck decision; reveal first prompt | localStorage | no forced upload | founder-room UX + postdeploy journey |
| `/practice` deck | Add deck | Store allowed local context metadata | localStorage | honest unavailable parsing state | gauntlet |
| `/practice` question | Back / Next question | Persist answer and advance/return | localStorage + live draft | inline validation, no answer loss | gauntlet |
| `/practice` mobile | Founder Story Card trigger | Open accessible bottom sheet | current local draft | Escape/close returns focus | founder-room UX |
| `/story-card` | Copy Founder Story Card | Copy local or AI card | clipboard status | readable failure reason | gauntlet |
| `/story-card` | Generate my Founder Story Card | Call LLM route; render schema-backed result | localStorage | honest unavailable state, no fake output | gauntlet + live LLM proof |
| `/story-card` | Practice Out Loud controls | Local camera/take/transcript state | IndexedDB/localStorage | permission/unavailable state | camera proof |
| `/share` | Share consent | Enable explicit share authorization | form state | submit blocked when unchecked | gauntlet |
| `/share` | Share my Founder Story Card with West Peek | Signed handoff; confirmed receipt only | receipt + Network OS readback when live | safe failure; no success claim | gauntlet + deployed live proof |
| `/delete-my-info` | Delete/update controls | Clear every Pitch Lab local key / submit request | refresh and re-entry | clear status | persistence/deletion proof |
