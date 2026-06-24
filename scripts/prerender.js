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
  '/book-strategy-session', '/blog', '/podcast', '/gallery', '/marketing-audit',
  '/privacy', '/terms',
  '/solutions-ai-automation', '/solutions-social-media', '/solutions-seo-geo',
  '/solutions-lead-generation', '/solutions-paid-advertising', '/solutions-podcasting',
  '/solutions-custom-apps', '/solutions-crm-management', '/solutions-fractional-cmo',
  // Publicly-linked campaign page (indexable).
  '/billboard',
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

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('[prerender] dist/index.html not found — run `vite build` first.');
    process.exit(1);
  }

  // Capture the clean build shell BEFORE writing any snapshots, and strip any leftover
  // page-injected JSON-LD so re-runs on an already-prerendered dist stay idempotent.
  const shellHtml = readFileSync(join(DIST, 'index.html'), 'utf8')
    .replace(/\s*<script type="application\/ld\+json" data-page-schema[^>]*>[\s\S]*?<\/script>/g, '');
  const server = await startServer(shellHtml);
  // Optional override: point at a specific Chromium binary (e.g. the full build when the
  // headless-shell variant isn't installed). Defaults to Playwright's managed browser.
  const launchOpts = { args: ['--no-sandbox'] };
  if (process.env.PRERENDER_CHROMIUM_PATH) {
    launchOpts.executablePath = process.env.PRERENDER_CHROMIUM_PATH;
  }
  const browser = await chromium.launch(launchOpts);

  let ok = 0;
  const coreFailures = [];
  const softFailures = [];
  for (const route of ROUTES) {
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

  if (softFailures.length) {
    console.warn(`[prerender] ${softFailures.length} non-core route(s) skipped (SPA fallback): ${softFailures.join(', ')}`);
  }
  if (coreFailures.length) {
    console.error(`[prerender] CORE route(s) failed: ${coreFailures.join(', ')}`);
    process.exit(1);
  }
  console.log(`[prerender] Done — ${ok}/${ROUTES.length} routes snapshotted.`);
}

main().catch((err) => {
  console.error('[prerender] Fatal:', err);
  process.exit(1);
});
