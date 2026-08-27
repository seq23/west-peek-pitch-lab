#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { renderPage } from '../src/ui/appShell.mjs';
import { PHASE_2_ROUTES } from '../src/runtime/phase2Routes.mjs';
import { canonicalUrl } from '../src/runtime/canonicalUrls.mjs';

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

// robots.txt and sitemap.xml. Without these two files Pages answered /robots.txt
// and /sitemap.xml with the SPA's index.html as text/html, so a crawler asking
// for the crawl policy got a web page and there was no sitemap at all.
//
// robots.txt is authored at public/robots.txt rather than generated, because it
// is the same portfolio-wide body on every West Peek property and a generator
// here would let this one drift. copyPublicAssetDir only walks asset
// subdirectories, so it is copied explicitly.
const robotsSource = path.join(root, 'public', 'robots.txt');
if (!fs.existsSync(robotsSource)) {
  throw new Error('public/robots.txt is missing; the deployed site would serve the SPA shell at /robots.txt');
}
fs.copyFileSync(robotsSource, path.join(dist, 'robots.txt'));

// Every public route is indexable, so the sitemap is the route list. canonicalUrl
// gives the trailing-slash form, which is the address that answers 200 -- the
// bare /<route> is a 301 to it.
const sitemapEntries = PHASE_2_ROUTES.map((route) => `  <url><loc>${canonicalUrl(route)}</loc></url>`);
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`
);

console.log(`Built static app routes: ${PHASE_2_ROUTES.length}; robots.txt + sitemap.xml (${sitemapEntries.length} URLs)`);
