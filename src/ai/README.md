# AI Layer Runtime Notes

Current canonical implementation path is **plain `.mjs` runtime plus JSON contracts**.

Implemented server-side AI files live in:

- `src/server/ai/aiSchema.mjs`
- `src/server/ai/aiService.mjs`
- `src/server/ai/geminiProvider.mjs`
- `src/server/ai/openaiProvider.mjs`
- `src/server/ai/llmRouter.mjs`
- `src/server/ai/promptContracts.mjs`
- `src/server/ai/scooterWisdom.mjs`
- `src/server/ai/scooterWisdomRegistry.mjs`
- `src/server/ai/testLocalProvider.mjs` for explicit local/test use only

Do not add TypeScript scaffold mirrors under `src/` unless the repo intentionally migrates to a real TypeScript build pipeline and removes the `.mjs` duplication.
