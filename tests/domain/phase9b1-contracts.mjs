import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const doc = fs.readFileSync(path.join(root, 'docs/PHASE_9B1_WEST_PEEK_DESIGN_PARITY.md'), 'utf8');
const contract = fs.readFileSync(path.join(root, 'docs/PITCH_LAB_PERSISTENT_COACHING_ROOM_UI_CONTRACT.md'), 'utf8');

assert.match(html, /west-peek-logo\.jpg/);
assert.match(html, /Good people should meet good people\./);
assert.match(html, /Good products need good stories\./);
assert.match(html, /Turn your startup story into a pitch people remember/);
assert.match(html, /Make the story easier to repeat\./);
assert.match(css, /--wp-orange: #f05a1a/);
assert.match(css, /\.landing-hero/);
assert.match(css, /\.scooter-stage-session\.is-compact/);
assert.match(css, /\.mobile-draft-trigger/);
assert.match(doc, /westpeek\.ventures/);
assert.match(doc, /westpeek\.live/);
assert.match(contract, /persistent asynchronous coaching room/i);

const practiceRuntime = fs.readFileSync(path.join(root, 'src/runtime/practiceFlow.mjs'), 'utf8');
const masterGauntlet = fs.readFileSync(path.join(root, 'tests/e2e/master-gauntlet.spec.mjs'), 'utf8');
const rehearsalProof = fs.readFileSync(path.join(root, 'tests/e2e/founder-camera-rehearsal-proof.spec.mjs'), 'utf8');
assert.match(practiceRuntime, /consent\.disabled = false/);
assert.match(practiceRuntime, /consentControl\.disabled = true/);
assert.match(css, /\.session-header \{ position: static;/);
assert.match(css, /\.mobile-draft-trigger \{ position: static;/);
assert.match(masterGauntlet, /data-story-draft-trigger/);
assert.match(rehearsalProof, /toBeEnabled\(\)/);
assert.doesNotMatch(practiceRuntime, /Founder Story Packet|handoff packet|strongest packet/);

assert.doesNotMatch(`${html}\n${css}`, /fundability score|Request limited avatar/i);
console.log('PHASE 9B.1 DOMAIN OK — route-level West Peek parity and responsive coaching-room surfaces are present.');
