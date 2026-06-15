#!/usr/bin/env node
import assert from 'node:assert/strict';
import { LOCKED_PITCH_LAB_COPY } from '../../src/runtime/lockedCopy.mjs';
import { DISCLOSURES } from '../../src/runtime/disclosures.mjs';
import { PHASE_2_ROUTES } from '../../src/runtime/phase2Routes.mjs';
import { renderPage } from '../../src/ui/appShell.mjs';

assert.equal(LOCKED_PITCH_LAB_COPY.productName, 'West Peek Pitch Lab');
assert.equal(LOCKED_PITCH_LAB_COPY.founderLine, 'Good products need good stories.');
assert.equal(LOCKED_PITCH_LAB_COPY.brandLine, 'Good people should meet good people.');
assert.ok(DISCLOSURES.aiScooter.includes('not the real-time human Scooter'));
assert.ok(DISCLOSURES.noGuarantee.includes('will not guarantee investment'));
assert.deepEqual(PHASE_2_ROUTES, ['/', '/practice', '/story-card', '/share', '/thank-you', '/privacy', '/terms', '/ai-disclosure', '/founder-network-notice', '/data-consent', '/contact', '/delete-my-info', '/how-it-works']);

for (const route of PHASE_2_ROUTES) {
  const html = renderPage(route);
  assert.ok(html.includes('West Peek Pitch Lab'), `${route} missing product name`);
  assert.ok(html.includes('Good products need good stories.'), `${route} missing founder line`);
  assert.ok(html.includes('Good people should meet good people.'), `${route} missing brand line`);
  assert.ok(html.includes('AI Scooter is an AI storytelling coach inspired by Scooter Taylor'), `${route} missing disclosure`);
  assert.doesNotMatch(html, /submitted successfully|email sent successfully|Scooter reviewed your pitch/i);
}

console.log('PHASE 2 DOMAIN CONTRACT TESTS PASSED');
