#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildScooterWisdomContext } from '../src/server/ai/scooterWisdom.mjs';
import { getApprovedScooterWisdomRegistry, validateScooterWisdomRegistry } from '../src/server/ai/scooterWisdomRegistry.mjs';

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
for (const rel of ['content/scooter-wisdom/raw/README.md','content/scooter-wisdom/raw/audio','content/scooter-wisdom/raw/transcripts','content/scooter-wisdom/raw/notes','content/scooter-wisdom/candidates','content/scooter-wisdom/approved/approved-wisdom.json','src/server/ai/generatedApprovedScooterWisdom.mjs','src/server/ai/scooterWisdomRegistry.mjs','src/server/ai/scooterWisdomSchema.mjs','scripts/extract-scooter-wisdom-candidates.mjs','docs/SCOOTER_WISDOM_CONTRIBUTION_SCHEMA.md']) if (!exists(rel)) failures.push(`Missing Scooter Wisdom file/path: ${rel}`);

const registry = getApprovedScooterWisdomRegistry();
const validation = validateScooterWisdomRegistry(registry);
if (!validation.ok) failures.push(...validation.errors);

const approvedJson = JSON.stringify(JSON.parse(read('content/scooter-wisdom/approved/approved-wisdom.json') || '{}'), null, 2);
const generated = read('src/server/ai/generatedApprovedScooterWisdom.mjs');
if (!generated.includes(approvedJson.slice(0, 120))) failures.push('generatedApprovedScooterWisdom.mjs appears out of sync. Run npm run wisdom:compile.');

const promptText = read('src/server/ai/promptContracts.mjs') + read('src/server/ai/aiScooterSystemPrompt.mjs');
if (!promptText.includes('buildScooterWisdomContext')) failures.push('Prompt contract does not load approved Scooter Wisdom context.');
if (promptText.includes('content/scooter-wisdom/raw')) failures.push('Prompt contract must not reference raw wisdom source folder.');
const context = buildScooterWisdomContext();
for (const required of ['Good products need good stories','Good people should meet good people','Founder trust is more important than capture','Do not invent Scooter quotes','West Peek will invest']) if (!context.includes(required)) failures.push(`Built Scooter Wisdom context missing: ${required}`);
const docs = read('docs/SCOOTER_WISDOM_LAYER.md') + read('docs/SCOOTER_WISDOM_UPDATE_RUNBOOK.md') + read('docs/SCOOTER_WISDOM_CONTRIBUTION_SCHEMA.md');
for (const text of ['raw intake can be messy','voice memo','candidate wisdom','approved runtime wisdom','AI Scooter Gem','direct_quote_allowed']) if (!docs.includes(text)) failures.push(`Scooter Wisdom docs missing: ${text}`);
if (failures.length) { console.error('SCOOTER WISDOM VALIDATION FAILED'); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log('SCOOTER WISDOM VALIDATION PASSED');
console.log(`Approved wisdom version: ${registry.version}`);
console.log(`Approved runtime chunks: ${registry.approvedChunks.length}`);
