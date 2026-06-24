import { useEffect } from 'react';

/**
 * Lightweight per-route head manager (SEO/GEO).
 *
 * The app has no react-helmet; the static index.html ships one default <head>.
 * This hook imperatively sets a route-specific <title>, meta description, canonical,
 * and Open Graph / Twitter tags, and optionally injects page-level JSON-LD.
 *
 * It updates the EXISTING tags from index.html (no duplicates) and cleans up any
 * injected JSON-LD on route change. The build-time prerender (scripts/prerender.js)
 * runs the real app and snapshots the resulting <head>, so each prerendered marketing
 * route ships its own title/description/canonical in raw HTML.
 *
 * @param {Object}  opts
 * @param {string}  opts.title        - Full <title> text
 * @param {string}  opts.description  - Meta description
 * @param {string}  opts.path         - Route path (e.g. '/about'); builds the canonical URL
 * @param {string} [opts.ogImage]     - Open Graph image URL (defaults to brand logo)
 * @param {Object} [opts.jsonLd]      - Optional JSON-LD object injected as a <script> for this page
 */
const SITE_URL = 'https://disruptorsmedia.com';
const DEFAULT_OG_IMAGE =
  'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function usePageMeta({ title, description, path = '/', ogImage, jsonLd, noindex = false } = {}) {
  const url = `${SITE_URL}${path}`;
  const ldString = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMeta('name', 'title', title);
      upsertMeta('property', 'og:title', title);
      upsertMeta('property', 'twitter:title', title);
    }
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('property', 'twitter:description', description);
    }
    upsertCanonical(url);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'twitter:url', url);
    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    const img = ogImage || DEFAULT_OG_IMAGE;
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'twitter:image', img);
  }, [title, description, url, ogImage, noindex]);

  useEffect(() => {
    if (!ldString) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page-schema', '');
    script.textContent = ldString;
    document.head.appendChild(script);
    return () => script.remove();
  }, [ldString]);
}

/** Helper: build a simple two-level BreadcrumbList (Home > current page). */
export function breadcrumb(name, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${path}` },
    ],
  };
}

export default usePageMeta;
