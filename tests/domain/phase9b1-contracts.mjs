import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const doc = fs.readFileSync(path.join(root, 'docs/PHASE_9B1_WEST_PEEK_DESIGN_PARITY.md'), 'utf8');

assert.match(html, /west-peek-logo\.jpg/);
assert.match(html, /Good people should meet good people\./);
assert.match(html, /Good products need good stories\./);
assert.match(html, /A private West Peek founder room/);
assert.match(html, /Make the story easier to repeat\./);
assert.match(css, /--wp-orange: #ff6a00/);
assert.match(css, /border-radius: 0/);
assert.match(doc, /westpeek\.ventures/);
assert.match(doc, /westpeek\.live/);
assert.match(doc, /We back founders where/);
assert.match(doc, /operating system/);
assert.doesNotMatch(`${html}\n${css}`, /fundability score/i);
assert.doesNotMatch(`${html}\n${css}`, /Request limited avatar/i);

console.log('PHASE 9B.1 DOMAIN OK — design parity references provided logo and preferred West Peek app family without score/media leakage.');
