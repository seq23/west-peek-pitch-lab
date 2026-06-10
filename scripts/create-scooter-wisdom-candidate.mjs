#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function arg(name, fallback = '') {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? String(process.argv[index + 1] || fallback) : fallback;
}
const id = arg('id', `candidate-${Date.now()}`);
const category = arg('category', 'founder_storytelling');
const root = process.cwd();
const outPath = path.join(root, 'content/scooter-wisdom/candidates/candidate-wisdom.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
let existing = [];
try { existing = JSON.parse(fs.readFileSync(outPath, 'utf8')); if (!Array.isArray(existing)) existing = []; } catch {}
const candidate = {
  id,
  title: id.split('-').map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' '),
  contributor: 'Scooter Taylor / West Peek team',
  source_type: 'direct_note',
  source_title: 'Founder storytelling notes',
  source_date: new Date().toISOString().slice(0, 10),
  approval_status: 'candidate',
  wisdom_tier: 'standard',
  display_label: 'AI Scooter coaching principle',
  direct_quote_allowed: false,
  quote_text: '',
  principle: '',
  runtime_text: '',
  use_cases: [category],
  founder_stage_fit: ['general'],
  industry_fit: ['general'],
  when_to_use: '',
  when_not_to_use: '',
  prohibited_extrapolations: [
    'Do not imply the company is fundable.',
    'Do not imply West Peek is interested.',
    'Do not invent traction or proof.',
    'Do not call this a direct quote unless approved.'
  ],
  tone: 'direct, encouraging, practical',
  tags: [category],
  approved_by: '',
  approved_at: '',
  notes: ''
};
existing.push(candidate);
fs.writeFileSync(outPath, JSON.stringify(existing, null, 2) + '\n');
console.log(`Created wisdom candidate: ${id}`);
