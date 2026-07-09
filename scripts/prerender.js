/**
 * Build-time prerender for marketing routes (Phase 1 — serve content without waiting for JS).
 *
 * What it does:
 *   1. Serves the built `dist/` folder over a local static server (with SPA fallback).
 *   2. Loads each marketing route in headless Chromium (Playwright), lets the SPA render
 *      and its animations settle, then writes the fully-rendered HTML back to disk as a
 *      static snapshot (dist/<route>/index.html).
 *
 * Why it works with the existing Netlify config:
 *   netlify.toml's catch-all `/*  ->  /index.html` redirect is NOT `force = true`, so an
 *   existing static file (e.g. dist/about/index.html) is served before the fallback. The
 *   fallback only handles the 70+ app/utility routes, which stay client-rendered.
 *
 * The client entry (src/main.jsx) hydrates when #root already has children, so these
 * snapshots become interactive after hydration.
 *
 * Requirements:
 *   - Run AFTER `vite build` (see `npm run build:prerender`).
 *   - Chromium must be available to Playwright: `npx playwright install chromium`.
 *     On Netlify this must run during the build step (flag for infra/Bryan).
 */
import http from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4317;

// Indexable routes that must ship real HTML for SEO/GEO/AI-citation.
// Keep this list in sync with public/sitemap.xml.
const ROUTES = [
  '/', '/about', '/solutions', '/pricing', '/faq', '/work',
  '/book-strategy-session', '/blog', '/podcast', '/marketing-audit',
  '/privacy', '/terms',
  '/solutions-ai-automation', '/solutions-social-media', '/solutions-seo-geo',
  '/solutions-lead-generation', '/solutions-paid-advertising', '/solutions-podcasting',
  '/solutions-custom-apps', '/solutions-crm-management', '/solutions-fractional-cmo',
  // Publicly-linked campaign page (indexable).
  '/billboard',
  // Case-study detail pages — high-value, statistic-rich content for citability.
  '/work-saas-content-engine', '/work-tradeworx-usa', '/work-timber-view-financial',
  '/work-the-wellness-way', '/work-sound-corrections', '/work-segpro',
  '/work-neuro-mastery', '/work-muscle-works', '/work-granite-paving', '/work-auto-trim-utah',
  // NOTE: /event-checkin is intentionally NOT prerendered — it's a utility tool with a
  // client-only hydration mismatch, and it's marked noindex via an X-Robots-Tag header
  // in netlify.toml, so it never needs to ship indexable static HTML.
];

// Core routes: if any of these fail to prerender, fail the build. Other routes that
// fail are logged and skipped (they fall back to the SPA shell, same as before — no
// regression), so one flaky/interactive page never blocks a deploy.
const CORE_ROUTES = new Set(['/', '/about', '/solutions', '/pricing', '/faq']);

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.otf': 'font/otf',
  '.ttf': 'font/ttf', '.map': 'application/json', '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4',
};

// Replace whatever is inside <div id="root">…</div> with nothing, keeping the trailing
// build <script>/<link> tags intact. Regex can't reliably match the matching </div> when
// the snapshot has nested divs, so we slice from the #root open tag to the first <script>
// that follows it (the app entry always sits after #root in the body).
function emptyRoot(html) {
  const open = html.indexOf('<div id="root"');
  if (open === -1) return html;
  const gt = html.indexOf('>', open);
  const nextScript = html.indexOf('<script', gt);
  if (gt === -1 || nextScript === -1) return html;
  return html.slice(0, gt + 1) + '</div>\n    ' + html.slice(nextScript);
}

function startServer(shellHtml) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidate = join(DIST, urlPath);
    // Serve real static asset files (JS/CSS/images/etc.) directly. Never serve an .html
    // file from disk — always use the in-memory clean shell for navigations, otherwise a
    // route prerendered earlier in this run would become the template for later routes.
    if (existsSync(candidate) && statSync(candidate).isFile() && extname(candidate) !== '.html') {
      res.writeHead(200, { 'Content-Type': MIME[extname(candidate)] || 'application/octet-stream' });
      createReadStream(candidate).pipe(res);
      return;
    }
    // SPA fallback to the clean build shell captured before any snapshots were written.
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(shellHtml);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

// Scroll through the page so framer-motion `whileInView` sections animate to their
// final (visible) state before we snapshot — bakes visible content into the HTML.
async function settle(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += Math.max(300, window.innerHeight * 0.8);
        if (y < document.body.scrollHeight) {
          setTimeout(step, 120);
        } else {
          window.scrollTo(0, 0);
          setTimeout(resolve, 400);
        }
      };
      step();
    });
  });
  // Allow above-the-fold mount animations (opacity/transform) to complete.
  await page.waitForTimeout(1500);
}

// Best-effort: pull published blog posts so each ships static HTML at /blog/<slug> and lands in
// the sitemap. Non-fatal — if Supabase env/credentials/table are unavailable at build time, blog
// posts simply fall back to the SPA shell (no regression) and a warning is logged.
async function fetchBlogPosts() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[prerender] Supabase env not set — skipping blog-post prerender/sitemap.');
    return [];
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('posts')
      .select('slug, published_at, updated_at, created_at')
      .eq('is_published', true);
    if (error) throw error;
    const posts = (data || []).filter((p) => p.slug);
    console.log(`[prerender] +${posts.length} published blog post(s) from Supabase.`);
    return posts;
  } catch (err) {
    console.warn(`[prerender] blog fetch failed (${err.message.split('\n')[0]}) — skipping blog posts.`);
    return [];
  }
}

// Inject <url> entries for blog posts into the built dist/sitemap.xml (skips ones already present).
function appendBlogToSitemap(posts) {
  const sitemapPath = join(DIST, 'sitemap.xml');
  if (!existsSync(sitemapPath) || !posts.length) return;
  let xml = readFileSync(sitemapPath, 'utf8');
  const entries = posts
    .filter((p) => !xml.includes(`/blog/${p.slug}<`))
    .map((p) => {
      const lastmod = (p.updated_at || p.published_at || p.created_at || '').slice(0, 10) || '2026-06-26';
      return `  <url><loc>https://disruptorsmedia.com/blog/${p.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
    });
  if (!entries.length) return;
  xml = xml.replace('</urlset>', `${entries.join('\n')}\n</urlset>`);
  writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`[prerender] sitemap.xml += ${entries.length} blog URL(s).`);
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('[prerender] dist/index.html not found — run `vite build` first.');
    process.exit(1);
  }

  // Capture the build shell BEFORE writing any snapshots. Two cleanups make this robust:
  //   1. Strip leftover page-injected JSON-LD so re-runs stay idempotent.
  //   2. Force an EMPTY #root. dist/index.html may already be a prior home snapshot
  //      (e.g. a re-run, or a build that didn't refresh index.html), which would carry
  //      home's rendered DOM. Serving that makes the client `hydrateRoot` against
  //      mismatched markup, and pages whose hydration errors hard never run their
  //      usePageMeta effect — leaving home's <title>/canonical on every route. An empty
  //      #root forces `createRoot` (CSR) instead, so each page renders fresh and its own
  //      usePageMeta is authoritative. The hashed asset <script>/<link> tags are preserved.
  const shellHtml = emptyRoot(
    readFileSync(join(DIST, 'index.html'), 'utf8')
      .replace(/\s*<script type="application\/ld\+json" data-page-schema[^>]*>[\s\S]*?<\/script>/g, '')
  );
  const server = await startServer(shellHtml);
  // Optional override: point at a specific Chromium binary (e.g. the full build when the
  // headless-shell variant isn't installed). Defaults to Playwright's managed browser.
  const launchOpts = { args: ['--no-sandbox'] };
  if (process.env.PRERENDER_CHROMIUM_PATH) {
    launchOpts.executablePath = process.env.PRERENDER_CHROMIUM_PATH;
  }
  const browser = await chromium.launch(launchOpts);

  const blogPosts = await fetchBlogPosts();
  const routes = [...ROUTES, ...blogPosts.map((p) => `/blog/${p.slug}`)];

  let ok = 0;
  const coreFailures = [];
  const softFailures = [];
  for (const route of routes) {
    const isCore = CORE_ROUTES.has(route);
    // Fresh, isolated context per route (no shared service worker, cache, or carried-over
    // DOM/head state) so page-injected per-route JSON-LD can't leak between routes.
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      // Wait for the SPA to actually render headings into #root.
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.querySelector('h1, h2');
        },
        { timeout: 45000 }
      );
      await settle(page);

      const html = '<!doctype html>\n' + (await page.evaluate(() => document.documentElement.outerHTML));
      const hasH1 = /<h1[\s>]/i.test(html);

      if (!hasH1) {
        // Don't write a snapshot without a real <h1>; let it fall back to the SPA shell.
        (isCore ? coreFailures : softFailures).push(`${route} (no <h1>)`);
        console.error(`[prerender] ${isCore ? '✗' : '•'} ${route.padEnd(26)} skipped — no <h1>`);
        continue;
      }

      const outDir = route === '/' ? DIST : join(DIST, route);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), html, 'utf8');
      ok++;
      console.log(`[prerender] ✓ ${route.padEnd(26)} -> ${join(outDir, 'index.html').replace(DIST, 'dist')}  (${(html.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      (isCore ? coreFailures : softFailures).push(`${route} (${err.message.split('\n')[0]})`);
      console.error(`[prerender] ${isCore ? '✗' : '•'} ${route} — ${err.message.split('\n')[0]}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  server.close();
  appendBlogToSitemap(blogPosts);

  if (softFailures.length) {
    console.warn(`[prerender] ${softFailures.length} non-core route(s) skipped (SPA fallback): ${softFailures.join(', ')}`);
  }
  if (coreFailures.length) {
    console.error(`[prerender] CORE route(s) failed: ${coreFailures.join(', ')}`);
    process.exit(1);
  }
  console.log(`[prerender] Done — ${ok}/${routes.length} routes snapshotted.`);
}

main().catch((err) => {
  console.error('[prerender] Fatal:', err);
  process.exit(1);
});
