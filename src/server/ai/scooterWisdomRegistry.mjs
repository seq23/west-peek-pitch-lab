import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const approvedWisdomPath = path.resolve(__dirname, '../../../content/scooter-wisdom/approved/approved-wisdom.json');
const approvedWisdom = JSON.parse(fs.readFileSync(approvedWisdomPath, 'utf8'));

const REQUIRED_CHUNK_FIELDS = [
  'id',
  'category',
  'sourceTitle',
  'sourceDate',
  'approvalStatus',
  'runtimeText',
  'useCase',
  'prohibitedExtrapolations'
];

export function getApprovedScooterWisdomRegistry() {
  return approvedWisdom;
}

export function validateScooterWisdomRegistry(registry = approvedWisdom) {
  const errors = [];
  if (!registry || typeof registry !== 'object') errors.push('Approved wisdom registry must be an object.');
  if (!registry.version) errors.push('Approved wisdom registry missing version.');
  if (registry?.approvalRules?.rawSourcesAllowedAtRuntime !== false) errors.push('Raw sources must be blocked from runtime.');
  if (registry?.approvalRules?.requiresApprovedOnly !== true) errors.push('Approved-only runtime must be required.');
  if (registry?.approvalRules?.fabricatedQuotesAllowed !== false) errors.push('Fabricated Scooter quotes must be forbidden.');
  if (registry?.approvalRules?.vectorRetrievalEnabled !== false) errors.push('Vector retrieval must remain disabled for V1.');


  const chunks = Array.isArray(registry?.approvedChunks) ? registry.approvedChunks : [];
  if (chunks.length < 1) errors.push('At least one approved wisdom chunk is required.');
  const ids = new Set();
  for (const chunk of chunks) {
    for (const field of REQUIRED_CHUNK_FIELDS) {
      if (chunk?.[field] === undefined || chunk?.[field] === '') errors.push(`Wisdom chunk missing field ${field}: ${chunk?.id || 'unknown'}`);
    }
    if (chunk?.approvalStatus !== 'approved') errors.push(`Runtime chunk is not approved: ${chunk?.id || 'unknown'}`);
    if (ids.has(chunk?.id)) errors.push(`Duplicate wisdom chunk id: ${chunk?.id}`);
    ids.add(chunk?.id);
    if (/Scooter says|quote from Scooter|Scooter told me/i.test(chunk?.runtimeText || '')) {
      errors.push(`Runtime chunk may imply unapproved direct quote: ${chunk.id}`);
    }
  }

  const forbidden = Array.isArray(registry?.forbiddenClaims) ? registry.forbiddenClaims : [];
  for (const claim of [
    'Scooter personally reviewed your pitch.',
    'West Peek will invest.',
    'This company is fundable.',
    'Scooter Taylor is live in this conversation.'
  ]) {
    if (!forbidden.some((item) => String(item).toLowerCase() === claim.toLowerCase())) errors.push(`Missing forbidden claim: ${claim}`);
  }
  return { ok: errors.length === 0, errors };
}
