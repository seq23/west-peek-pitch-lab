# Public Route Manifest

Machine-readable authority: `config/deployed-route-manifest.json`.

| ID | Path | Auth mode | Persona | Criticality | Viewports | Cleanup |
|---|---|---|---|---|---|---|
| `home` | `/` | public | founder | critical | desktop + mobile | none |
| `how-it-works` | `/how-it-works` | public | founder | standard | desktop + mobile | none |
| `practice` | `/practice` | public | founder | critical | desktop + mobile | exact-run |
| `story-card` | `/story-card` | public | founder | critical | desktop + mobile | exact-run |
| `share` | `/share` | public | founder | critical | desktop + mobile | exact-run |
| `thank-you` | `/thank-you` | public | founder | standard | desktop + mobile | none |
| `privacy` | `/privacy` | public | founder | standard | desktop + mobile | none |
| `terms` | `/terms` | public | founder | standard | desktop + mobile | none |
| `ai-disclosure` | `/ai-disclosure` | public | founder | standard | desktop + mobile | none |
| `founder-network-notice` | `/founder-network-notice` | public | founder | standard | desktop + mobile | none |
| `data-consent` | `/data-consent` | public | founder | standard | desktop + mobile | none |
| `contact` | `/contact` | public | founder | standard | desktop + mobile | none |
| `delete-my-info` | `/delete-my-info` | public | founder | critical | desktop + mobile | exact-run |

## 2026-06-16 UI interaction coverage

- `/`: activate Step 1 CTA; open/close mobile navigation.
- `/practice`: toggle Scooter stage; submit profile; continue without or add deck; answer prompts; open/close mobile Founder Story Card.
- `/story-card`: toggle Scooter stage; copy/generate Founder Story Card; use Practice Out Loud; continue to share.
- `/share`: toggle Scooter stage; review card; set consent; submit; keep practicing.
- `/thank-you`: verify no-receipt and confirmed-receipt states; return home.
