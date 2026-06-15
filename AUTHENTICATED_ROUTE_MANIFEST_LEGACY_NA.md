# Authenticated Route Manifest

**Repo:** `west-peek-pitch-lab`  
**Deployment:** Cloudflare Pages / repo-defined target

| Route | Persona | Purpose | Production Data Dependency | Critical Controls | Desktop | Mobile | Network Verified | Persistence Verified | Status |
|---|---|---|---|---|---|---|---|---|---|
| `/` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/how-it-works` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/practice` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/story-card` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/share` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/thank-you` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/privacy` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/terms` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/ai-disclosure` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/founder-network-notice` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/data-consent` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/contact` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |
| `/delete-my-info` | public founder | Product workflow | provider/production data | critical route controls | REQUIRED | REQUIRED | UNPROVEN | UNPROVEN | CRITICAL |

Every critical route/state must prove navigation, visual rendering, network behavior, persistence where applicable, refresh/re-entry, mobile, diagnostics, and cleanup. Homepage-only evidence is invalid.


> NOT APPLICABLE: Pitch Lab is a public no-auth product. See `PUBLIC_ROUTE_MANIFEST.md`.
