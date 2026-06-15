#!/usr/bin/env node
import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const required={
  'release:prepush':null,'release:local-visual-proof':null,'validate:reopened-baseline':null,'release:postpush':null,'release:live-proof':null,'release:cleanup':null,'postcleanup:integrity':null,'release:report':null,'release:close-lifecycle':null
};
for(const n of Object.keys(required)) if(!pkg.scripts?.[n]) throw new Error(`Missing required lifecycle script: ${n}`);
const source=fs.readFileSync('scripts/release-close-lifecycle.mjs','utf8');
for(const marker of ['postdeploy-proof','live-proof','populated-click-audit','exact-cleanup','post-cleanup-integrity','final-proof-report']) if(!source.includes(marker)) throw new Error(`Lifecycle stage missing: ${marker}`);
const doc=fs.readFileSync('docs/runbooks/SUITE_RELEASE_LIFECYCLE_CONTRACT.md','utf8');
for(const term of ['Container structural proof','First-command-green delivery law','Non-substitution law']) if(!doc.includes(term)) throw new Error(`Suite contract missing: ${term}`);
const tierAuthorityFiles=['ARTIFACT_MANIFEST.md','DIAGNOSTICS_STANDARD.md','TESTING_ARCHITECTURE.md','REPO_VALIDATION_MATRIX.md','docs/TEST_OPERATIONS_RUNBOOK.md'];
const legacyTierPatterns=[/human approval is Tier 4/i,/human visual\/media\/business approval is Tier 4/i,/^### Tier 4 — Human approval/im,/Tier 3 failures and Tier 4 runs/i];
for(const file of tierAuthorityFiles){const text=fs.readFileSync(file,'utf8');for(const pattern of legacyTierPatterns)if(pattern.test(text))throw new Error(`Legacy Tier 4 authority language remains in ${file}: ${pattern}`);}
const artifactManifest=JSON.parse(fs.readFileSync('_artifact_validation_manifest.json','utf8'));
for(const field of ['source_tree_fingerprint','artifact_sha256_binding','generated_at','evidence_references']) if(!artifactManifest[field] || (Array.isArray(artifactManifest[field])&&artifactManifest[field].length===0)) throw new Error(`Artifact manifest missing required field: ${field}`);
if(artifactManifest.artifact_sha256_binding!=='DETACHED_SHA256_SIDECAR') throw new Error('Artifact manifest must use detached SHA-256 sidecar to avoid self-referential ZIP hashing');
console.log('validate:suite-release-lifecycle-contract: PASS');
