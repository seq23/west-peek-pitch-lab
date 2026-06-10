import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const locked = JSON.parse(fs.readFileSync(path.join(root, 'src/config/lockedCopy.json'), 'utf8'));
assert.equal(locked.brandLine, 'Good people should meet good people.');
assert.equal(locked.founderLine, 'Good products need good stories.');

for (const asset of ['public/assets/brand/west-peek-logo.jpg', 'public/assets/brand/west-peek-logo.png', 'public/assets/brand/west-peek-mark.png']) {
  assert.ok(fs.existsSync(path.join(root, asset)), `Expected provided brand asset: ${asset}`);
  assert.ok(fs.statSync(path.join(root, asset)).size > 1000, `Brand asset should not be an empty placeholder: ${asset}`);
}
assert.ok(!fs.existsSync(path.join(root, 'public/assets/brand/west-peek-logo.svg')), 'Do not keep fabricated SVG logo after provided logo is installed.');
assert.ok(!fs.existsSync(path.join(root, 'public/assets/brand/west-peek-mark.svg')), 'Do not keep fabricated SVG mark after provided logo is installed.');

const styles = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
assert.match(styles, /--wp-black/);
assert.match(styles, /--wp-white/);
assert.match(styles, /--wp-orange/);
assert.match(styles, /brand-band/);
assert.match(styles, /story-card-stage/);

const home = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
assert.match(home, /west-peek-logo\.jpg/);
assert.match(home, /Good people should meet good people\./);
assert.match(home, /Good products need good stories\./);
assert.doesNotMatch(home, /fundability score/i);
assert.doesNotMatch(home, /Request limited avatar/i);

console.log('PHASE 9B DOMAIN OK — West Peek brand/mantra/design contract is present without removed feature leakage.');
