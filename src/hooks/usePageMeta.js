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
 * @param {string}  opts.title        - Full <title> text (keep to 60 characters or fewer)
 * @param {string}  opts.description  - Meta description (keep to 160 characters or fewer)
 * @param {string}  opts.path         - Route path (e.g. '/about'); builds the canonical URL
 * @param {string} [opts.ogImage]     - Open Graph image URL (defaults to brand logo)
 * @param {Object} [opts.jsonLd]      - Optional JSON-LD object injected as a <script> for this page
 * @param {string} [opts.type]        - og:type, 'website' (default) or 'article'
 * @param {Object} [opts.article]     - For type 'article': { publishedTime, modifiedTime, section }
 */
const SITE_URL = 'https://disruptorsmedia.com';
const ORG_ID = `${SITE_URL}/#organization`;
const DEFAULT_OG_IMAGE =
  'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png';
const ARTICLE_META_KEYS = ['article:published_time', 'article:modified_time', 'article:section'];

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

function removeMeta(attr, key) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
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

export function usePageMeta({
  title,
  description,
  path = '/',
  ogImage,
  jsonLd,
  noindex = false,
  type = 'website',
  article,
} = {}) {
  const url = `${SITE_URL}${path}`;
  const ldString = jsonLd ? JSON.stringify(jsonLd) : null;
  const publishedTime = article?.publishedTime;
  const modifiedTime = article?.modifiedTime;
  const section = article?.section;

  useEffect(() => {
    if (import.meta.env.DEV) {
      if (title && title.length > 60) {
        console.warn(`[usePageMeta] Title is ${title.length} characters (max 60): ${title}`);
      }
      if (description && description.length > 160) {
        console.warn(`[usePageMeta] Description is ${description.length} characters (max 160) on ${path}`);
      }
    }

    if (title) {
      document.title = title;
      upsertMeta('property', 'og:title', title);
      upsertMeta('name', 'twitter:title', title);
    }
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }
    upsertCanonical(url);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', type);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    const img = ogImage || DEFAULT_OG_IMAGE;
    upsertMeta('property', 'og:image', img);
    upsertMeta('name', 'twitter:image', img);

    // Clear article tags left by a previous route, then set them for this one if it's an article.
    ARTICLE_META_KEYS.forEach((key) => removeMeta('property', key));
    if (type === 'article') {
      upsertMeta('property', 'article:published_time', publishedTime);
      upsertMeta('property', 'article:modified_time', modifiedTime);
      upsertMeta('property', 'article:section', section);
    }
  }, [title, description, url, path, ogImage, noindex, type, publishedTime, modifiedTime, section]);

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

/** Truncate to a max length at the nearest word boundary, appending an ellipsis
 * instead of cutting mid-word. */
export function truncateDescription(text, maxLength = 155) {
  if (!text) return text;
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${safe.trim()}…`;
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

/** Helper: Article schema for a case-study page, published by Disruptors Media and about
 * the client. Used instead of a Review of Disruptors Media, which Google treats as a
 * self-serving review when it appears on our own site. */
export function caseStudySchema({ headline, client, path }) {
  const pageUrl = `${SITE_URL}${path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(client ? { about: { '@type': 'Organization', name: client } } : {}),
    image: DEFAULT_OG_IMAGE,
    author: { '@type': 'Organization', name: 'Disruptors Media', url: SITE_URL },
    publisher: { '@id': ORG_ID },
    url: pageUrl,
    mainEntityOfPage: pageUrl,
  };
}

export default usePageMeta;
