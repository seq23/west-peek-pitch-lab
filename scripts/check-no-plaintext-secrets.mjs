import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbiddenFiles = ['.env', '.env.local', '.env.production', '.env.backup', '.env.vault.key', 'cloudflare-secrets.json', 'secrets/pitch-lab.env.vault.json'];
const failures = [];

for (const file of forbiddenFiles) {
  if (fs.existsSync(path.join(root, file))) failures.push(`Forbidden secret file present: ${file}`);
}

const textExtensions = new Set(['.md', '.ts', '.js', '.json', '.example', '.txt', '.toml', '.yml', '.yaml']);
const secretPattern = /(sk[-_][A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA|OPENSSH|PRIVATE) KEY-----|AIza[0-9A-Za-z_-]{20,}|[A-Za-z0-9+/=]{20,}:[A-Za-z0-9_-]{20,})/;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const ext = path.extname(entry.name);
      if (textExtensions.has(ext) || entry.name.includes('.env')) {
        const data = fs.readFileSync(full, 'utf8');
        if (secretPattern.test(data)) failures.push(`Potential plaintext secret pattern: ${path.relative(root, full)}`);
      }
    }
  }
}

walk(root);

if (failures.length) {
  console.error('NO-SECRETS VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('NO-SECRETS VALIDATION PASSED');
