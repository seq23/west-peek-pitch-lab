import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const locked = JSON.parse(fs.readFileSync(path.join(root, 'src/config/lockedCopy.json'), 'utf8'));
assert.equal(locked.brandLine, 'Good people should meet good people.');
assert.equal(locked.founderLine, 'Good products need good stories.');
assert.equal(locked.primaryCta, 'Start Step 1');
assert.match(locked.homepageHeadline, /pitch people remember/i);

for (const asset of ['public/assets/brand/west-peek-logo.jpg', 'public/assets/brand/west-peek-logo.png', 'public/assets/brand/west-peek-mark.png']) {
  assert.ok(fs.existsSync(path.join(root, asset)), `Expected provided brand asset: ${asset}`);
  assert.ok(fs.statSync(path.join(root, asset)).size > 1000, `Brand asset should not be an empty placeholder: ${asset}`);
}
assert.ok(!fs.existsSync(path.join(root, 'public/assets/brand/west-peek-logo.svg')));
assert.ok(!fs.existsSync(path.join(root, 'public/assets/brand/west-peek-mark.svg')));

const styles = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/ui/appShell.mjs'), 'utf8');
const session = fs.readFileSync(path.join(root, 'src/ui/sessionShell.mjs'), 'utf8');
const practice = fs.readFileSync(path.join(root, 'src/ui/practiceWorkspace.mjs'), 'utf8');
for (const token of [/--wp-black/, /--wp-white/, /--wp-orange/, /\.scooter-stage/, /\.practice-layout/, /\.draft-sheet/]) assert.match(styles, token);
assert.match(app, /renderHomeLanding/);
assert.match(session, /data-scooter-stage/);
assert.match(practice, /data-story-draft-sheet/);

const home = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
assert.match(home, /west-peek-logo\.jpg/);
assert.match(home, /Start Step 1/);
assert.match(home, /Turn your startup story into a pitch people remember/);
assert.doesNotMatch(home, /Cached \/ reusable|No paid clip per question|Optional v1\.1|fundability score/i);
console.log('PHASE 9B DOMAIN OK — persistent coaching-room hierarchy and West Peek brand contract are present without internal-language leakage.');
