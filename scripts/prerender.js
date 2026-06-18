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
import { createReadStream, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4317;

// Marketing routes that must ship real HTML for SEO/GEO/AI-citation.
const ROUTES = ['/', '/about', '/solutions', '/pricing', '/faq'];

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.otf': 'font/otf',
  '.ttf': 'font/ttf', '.map': 'application/json', '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4',
};

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidate = join(DIST, urlPath);
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[extname(candidate)] || 'application/octet-stream' });
      createReadStream(candidate).pipe(res);
      return;
    }
    // SPA fallback to the freshly built index.html
    res.writeHead(200, { 'Content-Type': 'text/html' });
    createReadStream(join(DIST, 'index.html')).pipe(res);
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

  const server = await startServer();
  // Optional override: point at a specific Chromium binary (e.g. the full build when the
  // headless-shell variant isn't installed). Defaults to Playwright's managed browser.
  const launchOpts = { args: ['--no-sandbox'] };
  if (process.env.PRERENDER_CHROMIUM_PATH) {
    launchOpts.executablePath = process.env.PRERENDER_CHROMIUM_PATH;
  }
  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  let failed = 0;
  for (const route of ROUTES) {
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

      const outDir = route === '/' ? DIST : join(DIST, route);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), html, 'utf8');

      const hasH1 = /<h1[\s>]/i.test(html);
      console.log(`[prerender] ✓ ${route.padEnd(12)} -> ${join(outDir, 'index.html').replace(DIST, 'dist')}  (h1: ${hasH1 ? 'yes' : 'NO'}, ${(html.length / 1024).toFixed(0)} KB)`);
      if (!hasH1) failed++;
    } catch (err) {
      failed++;
      console.error(`[prerender] ✗ ${route} — ${err.message}`);
    }
  }

  await browser.close();
  server.close();

  if (failed > 0) {
    console.error(`[prerender] ${failed} route(s) failed or missing <h1>.`);
    process.exit(1);
  }
  console.log(`[prerender] Done — ${ROUTES.length} marketing routes snapshotted.`);
}

main().catch((err) => {
  console.error('[prerender] Fatal:', err);
  process.exit(1);
});
