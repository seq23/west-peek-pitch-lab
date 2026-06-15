#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const contract=JSON.parse(fs.readFileSync(path.join(root,'_browser_suite_contract.json'),'utf8')).browser_suite;
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const runId=process.env.LOCAL_BROWSER_PROOF_RUN_ID||`${pkg.name}-local-browser-${stamp}`;
const localDir=path.join(root,'artifacts','diagnostics','local-browser',runId);
const externalDir=path.join(os.homedir(),'repo-validation-evidence',pkg.name,runId);
fs.mkdirSync(localDir,{recursive:true});fs.mkdirSync(externalDir,{recursive:true});
const reportPath=path.join(localDir,'playwright-report.json');
const env={...process.env,RELEASE_EXECUTION_ENV:'local',PITCH_LAB_EVIDENCE_MODE:'1',PLAYWRIGHT_JSON_OUTPUT_NAME:reportPath,PLAYWRIGHT_OUTPUT_DIR:path.join(localDir,'test-results'),NODE_OPTIONS:process.env.NODE_OPTIONS||'--max-old-space-size=3072'};
const result=spawnSync('npx',['playwright','test','--headed','--reporter=list,json'],{cwd:root,stdio:'inherit',env,shell:false});
let report=null;try{report=JSON.parse(fs.readFileSync(reportPath,'utf8'))}catch{}
const allTests=[];
function collect(suite){for(const spec of suite.specs||[])for(const t of spec.tests||[])allTests.push({title:[suite.title,spec.title,t.title].filter(Boolean).join(' › '),projectName:t.projectName||'unknown',status:t.results?.at(-1)?.status||'unknown',expectedStatus:t.expectedStatus,annotations:t.annotations||[]});for(const child of suite.suites||[])collect(child)}
for(const suite of report?.suites||[])collect(suite);
const perProject={};for(const t of allTests){perProject[t.projectName]||={collected:0,passed:0,failed:0,skipped:0};const x=perProject[t.projectName];x.collected++;if(t.status==='passed')x.passed++;else if(t.status==='skipped')x.skipped++;else x.failed++}
const skipped=allTests.filter(t=>t.status==='skipped').map(t=>({title:t.title,project:t.projectName}));const failed=allTests.filter(t=>!['passed','skipped'].includes(t.status)).map(t=>({title:t.title,project:t.projectName,status:t.status}));
const summary={schema_version:'1.0',repo:pkg.name,run_id:runId,profile:'local',command:'npx playwright test --headed',projects:contract.projects,collected:allTests.length,passed:allTests.filter(t=>t.status==='passed').length,failed:failed.length,skipped:skipped.length,skipped_identities:skipped,per_project:perProject,exit_code:result.status??1,evidence_local:path.relative(root,localDir),evidence_external:externalDir,generated_at:new Date().toISOString(),verdict:(result.status===0&&failed.length===0)?'PASS':'FAIL'};
fs.writeFileSync(path.join(localDir,'summary.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(localDir,'local-proof-manifest.json'),JSON.stringify({...summary,source_fingerprint:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'package.json'))).digest('hex')},null,2)+'\n');
fs.cpSync(localDir,externalDir,{recursive:true,force:true});console.log(`LOCAL BROWSER VISUAL PROOF: ${summary.verdict}`);console.log(`Evidence: ${externalDir}`);process.exit(summary.verdict==='PASS'?0:1);
