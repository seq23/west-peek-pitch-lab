#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rawDirs = ['content/scooter-wisdom/raw/notes', 'content/scooter-wisdom/raw/transcripts'];
const outPath = path.join(root, 'content/scooter-wisdom/candidates/candidate-wisdom.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
const candidates = [];
function slug(text) { return String(text || 'wisdom').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || `wisdom-${Date.now()}`; }
for (const relDir of rawDirs) {
  const dir = path.join(root, relDir);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!/\.(txt|md)$/i.test(file)) continue;
    const raw = fs.readFileSync(path.join(dir, file), 'utf8').trim();
    if (!raw) continue;
    const sentences = raw.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
    const principle = sentences.find((s) => /proof|story|founder|customer|specific|relationship|people|clarity/i.test(s)) || sentences[0] || raw.slice(0, 140);
    candidates.push({
      id: slug(path.basename(file, path.extname(file))),
      title: principle.slice(0, 80),
      contributor: 'Scooter Taylor / West Peek team',
      source_type: relDir.includes('transcripts') ? 'transcript' : 'raw_note',
      source_title: file,
      source_date: new Date().toISOString().slice(0, 10),
      approval_status: 'candidate',
      wisdom_tier: /proof beats polish|good products need good stories|good people should meet good people/i.test(raw) ? 'gem' : 'standard',
      display_label: /proof beats polish|good products need good stories|good people should meet good people/i.test(raw) ? 'AI Scooter Gem' : 'AI Scooter coaching principle',
      direct_quote_allowed: false,
      quote_text: '',
      principle,
      runtime_text: principle.length > 220 ? `${principle.slice(0, 219).trim()}…` : principle,
      use_cases: ['pitch_card_feedback', 'founder_storytelling'],
      founder_stage_fit: ['general'],
      industry_fit: ['general'],
      when_to_use: 'Use when a founder needs sharper story clarity, proof, customer specificity, or relationship-routing language.',
      when_not_to_use: 'Do not use when it would imply West Peek interest, funding likelihood, guaranteed follow-up, or verified diligence.',
      prohibited_extrapolations: [
        'Do not imply the company is fundable.',
        'Do not imply West Peek is interested.',
        'Do not invent traction or proof.',
        'Do not call this a direct quote unless approved.'
      ],
      tone: 'direct, encouraging, practical',
      tags: ['founder_storytelling'],
      approved_by: '',
      approved_at: '',
      notes: `Extracted from ${relDir}/${file}. Human approval required before runtime.`
    });
  }
}
fs.writeFileSync(outPath, JSON.stringify(candidates, null, 2) + '\n');
console.log(`Extracted ${candidates.length} candidate wisdom chunk(s). Human approval required before runtime.`);
