import { getApprovedScooterWisdomRegistry, validateScooterWisdomRegistry } from './scooterWisdomRegistry.mjs';

export function buildScooterWisdomContext({ maxChunks = 8 } = {}) {
  const registry = getApprovedScooterWisdomRegistry();
  const validation = validateScooterWisdomRegistry(registry);
  if (!validation.ok) {
    throw new Error(`Scooter Wisdom registry invalid: ${validation.errors.join('; ')}`);
  }

  const chunks = registry.approvedChunks
    .filter((chunk) => chunk.approvalStatus === 'approved')
    .slice(0, maxChunks)
    .map((chunk) => `- [${chunk.category}] ${chunk.runtimeText} Use case: ${chunk.useCase}`);

  const forbiddenClaims = registry.forbiddenClaims.map((claim) => `- ${claim}`);

  return [
    `Scooter Wisdom Layer version: ${registry.version}`,
    'Runtime rule: use approved chunks only. Do not invent Scooter quotes or use raw source material.',
    'Approved wisdom chunks:',
    chunks.join('\n'),
    'Forbidden claims:',
    forbiddenClaims.join('\n')
  ].join('\n');
}

export function getScooterWisdomVersion() {
  return getApprovedScooterWisdomRegistry().version;
}
