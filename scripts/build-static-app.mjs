#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { renderPage } from '../src/ui/appShell.mjs';
import { PHASE_2_ROUTES } from '../src/runtime/phase2Routes.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });

const styles = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
fs.writeFileSync(path.join(dist, 'assets/styles.css'), styles);

const DEPLOY_EXCLUDED_PUBLIC_ASSETS = new Set([
  'assets/avatar/scooter-driving-video-source.mp4'
]);

function shouldCopyPublicAsset(relativePath) {
  return !DEPLOY_EXCLUDED_PUBLIC_ASSETS.has(relativePath.split(path.sep).join('/'));
}

function copyPublicAssetDir(relativeDir) {
  const source = path.join(root, 'public', relativeDir);
  if (!fs.existsSync(source)) return;
  const target = path.join(dist, relativeDir);
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    const relativeAssetPath = path.join(relativeDir, entry.name);
    if (!shouldCopyPublicAsset(relativeAssetPath)) continue;
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      for (const nested of fs.readdirSync(from, { withFileTypes: true })) {
        const nestedRelativeAssetPath = path.join(relativeDir, entry.name, nested.name);
        if (nested.isFile() && shouldCopyPublicAsset(nestedRelativeAssetPath)) {
          fs.copyFileSync(path.join(from, nested.name), path.join(to, nested.name));
        }
      }
    } else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

copyPublicAssetDir('assets/avatar');
copyPublicAssetDir('assets/brand');

const runtimeSource = path.join(root, 'src/runtime');
const runtimeTarget = path.join(dist, 'assets');

// Every browser entry point imports sibling runtime modules. Copy the complete
// runtime module set so the deployed ESM graph cannot fail with a hidden 404.
for (const entry of fs.readdirSync(runtimeSource, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.mjs')) {
    fs.copyFileSync(path.join(runtimeSource, entry.name), path.join(runtimeTarget, entry.name));
  }
}

// Stable browser-facing aliases remain explicit so HTML entry points do not
// depend on source filenames. Imported sibling modules keep their .mjs names.
const clientEntryAliases = {
  'practiceFlow.mjs': 'practice-flow.js',
  'aiStoryCardClient.mjs': 'ai-story-card.js',
  'shareFlow.mjs': 'share-flow.js',
  'deleteMyInfo.mjs': 'delete-my-info.js',
  'sessionExperience.mjs': 'session-experience.js'
};
for (const [moduleFile, outputName] of Object.entries(clientEntryAliases)) {
  fs.copyFileSync(path.join(runtimeSource, moduleFile), path.join(runtimeTarget, outputName));
}

for (const route of PHASE_2_ROUTES) {
  const filePath = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, renderPage(route));
}

const redirectLines = PHASE_2_ROUTES.filter((route) => route !== '/').map((route) => `${route} ${route}/ 301`);
fs.writeFileSync(path.join(dist, '_redirects'), redirectLines.join('\n') + '\n');
console.log(`Built static app routes: ${PHASE_2_ROUTES.length}`);
