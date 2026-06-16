import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { normalizeDisplayValue } from '../../src/runtime/normalizeDisplayValue.mjs';

assert.equal(normalizeDisplayValue('<script>x</script><b>A &amp; B</b>').summary, 'A & B');
const cases = JSON.parse(await fs.readFile(new URL('../fixtures/production-shaped-payloads.json', import.meta.url), 'utf8'));
for (const value of Object.values(cases)) {
  const result = normalizeDisplayValue(value, { maxLength: 320 });
  assert.equal(typeof result.summary, 'string');
  assert.ok(result.summary.length <= 320);
}
for (const file of [
  '../../src/ui/publicLanding.mjs','../../src/ui/sessionShell.mjs','../../src/ui/practiceWorkspace.mjs',
  '../../src/ui/storyReviewWorkspace.mjs','../../src/ui/shareWorkspace.mjs','../../src/runtime/sessionExperience.mjs'
]) {
  const source = await fs.readFile(new URL(file, import.meta.url), 'utf8');
  assert.doesNotMatch(source, /dangerouslySetInnerHTML|document\.write\(|innerHTML\s*=\s*(?:response|payload|body)\b/i, `${file} must not render raw provider payloads`);
  assert.doesNotMatch(source, /�/, `${file} contains malformed replacement characters`);
}
console.log('display normalization contracts: PASS — hostile payload normalization and new coaching-room surfaces are display-safe.');
