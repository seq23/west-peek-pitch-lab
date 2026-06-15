#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const lane=process.argv[2]||'public';
if(lane!=='public'){
  const out=path.resolve('artifacts/diagnostics/click-audit',`${Date.now()}-${lane}`);
  await fs.mkdir(out,{recursive:true});
  const na={repo:'west-peek-pitch-lab',lane,verdict:'NOT_APPLICABLE',reason:'Pitch Lab is a public no-auth product with no roles or tenants.',generatedAt:new Date().toISOString()};
  await fs.writeFile(path.join(out,'summary.json'),JSON.stringify(na,null,2));
  console.log(`${lane} click audit: NOT APPLICABLE`);process.exit(0);
}
const base=process.env.POSTDEPLOY_BASE_URL||process.env.SMOKE_BASE_URL;
if(!base||!/^https:\/\//.test(base)||/localhost|127\.0\.0\.1|example\.com/i.test(base))throw new Error('Explicit non-placeholder HTTPS POSTDEPLOY_BASE_URL or SMOKE_BASE_URL required');
const manifest=JSON.parse(await fs.readFile('config/postdeploy-public-proof-manifest.json','utf8'));
const runId=process.env.PROOF_RUN_ID||`${manifest.repo}-public-${new Date().toISOString().replace(/[-:.]/g,'')}`;
const out=path.resolve('artifacts/diagnostics/click-audit',runId);await fs.mkdir(out,{recursive:true});
const viewportMap={desktop:{width:1280,height:800},mobile:{width:375,height:667}};
const browser=await chromium.launch({headless:process.env.PLAYWRIGHT_HEADED!=='1'});
const results=[];const globalConsole=[];const globalFailed=[];const globalHttp=[];
try{
 for(const scenario of manifest.scenarios){
  for(const viewportName of scenario.viewports||['desktop','mobile']){
   const vp=viewportMap[viewportName];if(!vp)throw new Error(`Unknown viewport ${viewportName}`);
   const context=await browser.newContext({viewport:vp});
   await context.addInitScript(seed=>{for(const [k,v] of Object.entries(seed||{}))localStorage.setItem(k,JSON.stringify(v));},scenario.storage_seed||{});
   await context.tracing.start({screenshots:true,snapshots:true,sources:true});
   const page=await context.newPage();const consoleErrors=[],failedRequests=[],httpErrors=[];
   page.on('console',m=>{if(m.type()==='error'){const x={scenario:scenario.id,text:m.text()};consoleErrors.push(x);globalConsole.push(x)}});
   page.on('requestfailed',q=>{const x={scenario:scenario.id,url:q.url(),error:q.failure()?.errorText||'unknown'};failedRequests.push(x);globalFailed.push(x)});
   page.on('response',r=>{if(r.status()>=400){const x={scenario:scenario.id,url:r.url(),status:r.status()};httpErrors.push(x);globalHttp.push(x)}});
   let status='PASS',error='';
   try{
    const response=await page.goto(new URL(scenario.path,base).toString(),{waitUntil:'networkidle',timeout:Number(process.env.CLICK_AUDIT_TIMEOUT_MS||30000)});
    if(!response||response.status()>=400)throw new Error(`HTTP ${response?.status()??'none'}`);
    await assertExpected(page,scenario.expected||{});
    for(const action of scenario.actions||[])await runAction(page,action);
    if(scenario.final_path&&new URL(page.url()).pathname.replace(/\/$/,'')!==(scenario.final_path.replace(/\/$/,'')||'/'))throw new Error(`final path mismatch: ${new URL(page.url()).pathname}`);
    await assertRenderSafety(page);
    if(consoleErrors.length)throw new Error(`console errors: ${consoleErrors.map(x=>x.text).join(' | ')}`);
    if(failedRequests.length)throw new Error(`failed requests: ${failedRequests.map(x=>x.url).join(' | ')}`);
    if(httpErrors.length)throw new Error(`HTTP errors: ${httpErrors.map(x=>`${x.status} ${x.url}`).join(' | ')}`);
    await page.screenshot({path:path.join(out,`${viewportName}-${scenario.id}.png`),fullPage:true});
   }catch(e){status='FAIL';error=String(e?.message||e)}
   const geometry=await safeGeometry(page);
   results.push({scenarioId:scenario.id,path:scenario.path,viewport:viewportName,status,error,finalUrl:page.url(),consoleErrors,failedRequests,httpErrors,geometry});
   await context.tracing.stop({path:path.join(out,`trace-${viewportName}-${scenario.id}.zip`)});await context.close();
  }
 }
}finally{await browser.close()}
const expected=manifest.scenarios.reduce((n,s)=>n+(s.viewports?.length||2),0);const failures=results.filter(r=>r.status!=='PASS');
const summary={schema_version:'2.0',runId,repo:manifest.repo,lane:'public',targetUrl:base,scenarioCount:manifest.scenarios.length,expectedChecks:expected,actualChecks:results.length,verdict:failures.length||results.length!==expected?'FAIL':'PASS',generatedAt:new Date().toISOString()};
await fs.writeFile(path.join(out,'summary.json'),JSON.stringify(summary,null,2));await fs.writeFile(path.join(out,'scenario-results.json'),JSON.stringify(results,null,2));await fs.writeFile(path.join(out,'console-errors.json'),JSON.stringify(globalConsole,null,2));await fs.writeFile(path.join(out,'failed-requests.json'),JSON.stringify(globalFailed,null,2));await fs.writeFile(path.join(out,'http-errors.json'),JSON.stringify(globalHttp,null,2));await fs.writeFile(path.join(out,'final-verdict.txt'),`${summary.verdict}\n`);
console.log(`public click audit: ${summary.verdict} (${results.length}/${expected} checks)`);process.exit(summary.verdict==='PASS'?0:1);

async function assertExpected(page,expected){if(expected.heading)await page.getByRole('heading',{name:new RegExp(escapeRx(expected.heading),'i')}).first().waitFor();if(expected.text)await page.getByText(new RegExp(escapeRx(expected.text),'i')).first().waitFor()}
async function runAction(page,a){if(a.type==='clickLink'){await page.getByRole('link',{name:new RegExp(`^${escapeRx(a.name)}$`,'i')}).first().click();await page.waitForLoadState('networkidle')}else if(a.type==='clickButton'){await page.getByRole('button',{name:new RegExp(`^${escapeRx(a.name)}$`,'i')}).click()}else if(a.type==='fill'){await page.getByLabel(new RegExp(escapeRx(a.label),'i')).fill(a.value)}else if(a.type==='check'){await page.getByLabel(new RegExp(escapeRx(a.label),'i')).check()}else if(a.type==='reload'){await page.reload({waitUntil:'networkidle'})}else if(a.type==='assertText'){await page.getByText(new RegExp(escapeRx(a.value),'i')).first().waitFor()}else throw new Error(`UNSUPPORTED_SAFE_ACTION: ${a.type}`)}
async function assertRenderSafety(page){const result=await page.evaluate(()=>{const vw=document.documentElement.clientWidth;const overflow=document.documentElement.scrollWidth>vw;const controls=[...document.querySelectorAll('a[href],button,input,select,textarea')].filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0}).map(e=>{const r=e.getBoundingClientRect();return{tag:e.tagName,text:(e.innerText||e.getAttribute('aria-label')||'').slice(0,80),left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,offscreen:r.right<0||r.left>vw}});return{overflow,controls,zeroSize:[...document.querySelectorAll('a[href],button,input,select,textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width===0||r.height===0}).length}});if(result.overflow)throw new Error('UI_DISPLAY_NORMALIZATION_FAILED: horizontal overflow');if(result.controls.some(c=>c.offscreen))throw new Error('UI_DISPLAY_NORMALIZATION_FAILED: offscreen control');const body=await page.locator('body').innerText();if(/<script|<div|�|\{\s*"[^"]+"\s*:/i.test(body))throw new Error('UI_DISPLAY_NORMALIZATION_FAILED: raw payload marker')}
async function safeGeometry(page){try{return await page.evaluate(()=>({viewport:{width:document.documentElement.clientWidth,height:document.documentElement.clientHeight},scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,controls:[...document.querySelectorAll('a[href],button,input,select,textarea')].map(e=>{const r=e.getBoundingClientRect();return{tag:e.tagName,label:(e.innerText||e.getAttribute('aria-label')||'').slice(0,80),x:r.x,y:r.y,width:r.width,height:r.height}})}))}catch{return null}}
function escapeRx(v){return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
