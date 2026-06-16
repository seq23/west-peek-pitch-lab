import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const explicitPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '';
let executablePath = explicitPath;
if (!executablePath) {
  const probe = spawnSync('node', ['-e', "process.stdout.write(require('playwright').chromium.executablePath())"], { encoding: 'utf8' });
  if (probe.status === 0) executablePath = String(probe.stdout || '').trim();
}
const present = Boolean(executablePath && fs.existsSync(executablePath));
let launch = false;
if (present) {
  const code = `const{chromium}=require('playwright');(async()=>{const b=await chromium.launch({headless:true,executablePath:${JSON.stringify(executablePath)}});await b.close()})().catch(()=>process.exit(1))`;
  const result = spawnSync('node', ['-e', code], { encoding: 'utf8' });
  launch = result.status === 0;
}
const profile = process.env.RELEASE_EXECUTION_ENV === 'local' ? 'local' : 'container';
const out = {
  browser_binary_present: present,
  browser_launch_successful: launch,
  selected_prepush_profile: profile,
  browser_source: explicitPath ? 'explicit_env' : 'playwright_managed',
  reason: launch ? 'browser available' : 'browser unavailable or not launchable; structural fallback required'
};
fs.mkdirSync('artifacts/diagnostics/release', { recursive: true });
fs.writeFileSync('artifacts/diagnostics/release/environment.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out));
