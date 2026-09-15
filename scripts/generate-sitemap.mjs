/**
 * Post-build step: add published blog posts to dist/sitemap.xml.
 *
 * public/sitemap.xml holds the static routes and Vite copies it into dist/. This appends a
 * <url> for every published post that isn't already listed. Runs as part of `npm run build`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchPublishedPosts } from './lib/published-posts.mjs';

const SITE_URL = 'https://disruptorsmedia.com';
const SITEMAP = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'sitemap.xml');

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

if (!existsSync(SITEMAP)) {
  console.error('[sitemap] dist/sitemap.xml not found — run `vite build` first.');
  process.exit(1);
}

const posts = await fetchPublishedPosts();
let xml = readFileSync(SITEMAP, 'utf8');

const entries = posts
  .map((p) => ({ ...p, loc: escapeXml(`${SITE_URL}/blog/${encodeURI(p.slug)}`) }))
  .filter((p) => !xml.includes(`<loc>${p.loc}</loc>`))
  .map((p) => {
    const lastmod = (p.updated_at || p.published_at || p.created_at || '').slice(0, 10);
    return [
      '  <url>',
      `    <loc>${p.loc}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      '    <changefreq>monthly</changefreq>',
      '    <priority>0.6</priority>',
      '  </url>',
    ].join('\n');
  });

if (entries.length) {
  xml = xml.replace('</urlset>', `\n  <!-- Blog posts (generated at build time) -->\n${entries.join('\n')}\n</urlset>`);
  writeFileSync(SITEMAP, xml, 'utf8');
}
console.log(`[sitemap] added ${entries.length} blog URL(s) to dist/sitemap.xml.`);
