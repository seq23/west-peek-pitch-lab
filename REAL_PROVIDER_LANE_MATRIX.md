# Real Provider Lane Matrix — west-peek-pitch-lab

Status: ACTIVE
Date: 2026-06-11

Tier 3 is the final release gate. Every row below must be passed, blocked with owner acceptance, or explicitly ruled not applicable before COMPLETE.

| Provider lane | Provider | Runtime/surface | Env keys / inputs | Tier 3 proof required | Status |
|---|---|---|---|---|---|
| Gemini/OpenAI LLM | Gemini/OpenAI LLM | AI Scooter pitch critique/story card/final summary | GEMINI_API_KEY, OPENAI_API_KEY when fallback enabled, LLM_* config | Live LLM provider returns non-placeholder response and browser renders it. | REQUIRED FOR TIER 3 |
| D-ID / HeyGen / avatar provider lane | D-ID / HeyGen / avatar provider lane | Talking AI Scooter media generation for key moments | D_ID_* / HEYGEN_* or current avatar provider keys | Provider returns queued/rendered media artifact or controlled unavailable status. | REQUIRED FOR TIER 3 |
| Voice provider / Fish / voice lane | Voice provider / Fish / voice lane | Scooter voice proof and generated audio support | voice provider keys from env registry | Live audio proof returns playable-sized audio and records evidence. | REQUIRED FOR TIER 3 |
| Network OS signed handoff | Network OS signed handoff | Founder profile/story packet sent to Network OS for pending review | NETWORK_OS_API_BASE_URL, PITCH_LAB_SHARED_SECRET | Browser share flow sends exact x-pitch-lab-* signature contract and receives pending_network_review. | REQUIRED FOR TIER 3 |
| Cloudflare Pages/Functions | Cloudflare Pages/Functions | Deployed runtime, server routes, env binding parity | PITCH_LAB_DEPLOY_URL, Cloudflare env/vault variables | Postdeploy functions and journey gauntlet pass against explicit deployed URL. | REQUIRED FOR TIER 3 |

## Rule

A mocked/local provider test may support Tier 2 but cannot satisfy this matrix. Tier 3 must run against deployed runtime and live provider evidence or return BLOCKED/UNPROVEN.
