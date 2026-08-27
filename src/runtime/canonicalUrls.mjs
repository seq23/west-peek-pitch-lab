// Pitch Lab answers on two custom domains, pitch.joinwestpeek.com and
// pitchlab.joinwestpeek.com, plus the west-peek-pitch-lab.pages.dev preview
// host. All three served identical pages with no canonical, so a search engine
// had three equally valid candidates for the same content and nothing saying
// which one is the site. This names one.
//
// pitch.joinwestpeek.com is the choice because the site carried no canonical
// tags of its own to inherit a preference from.
export const CANONICAL_ORIGIN = 'https://pitch.joinwestpeek.com';

// scripts/build-static-app.mjs writes every non-root route as
// dist/<route>/index.html and emits a `/<route> /<route>/ 301` redirect, so the
// address that answers 200 is the one with the trailing slash. The canonical
// and the sitemap must both name that form or they point at a redirect.
export function canonicalUrl(route) {
  const normalized = route === '' ? '/' : route;
  if (normalized === '/') return `${CANONICAL_ORIGIN}/`;
  return `${CANONICAL_ORIGIN}${normalized}/`;
}
