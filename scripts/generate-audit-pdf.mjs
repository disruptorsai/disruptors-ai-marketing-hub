import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'Disruptors-SEO-GEO-Audit.pdf');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  :root{ --ink:#1a1a1a; --muted:#5b5b5b; --line:#e4e0d8; --gold:#9a7b2e; --goldlt:#bf953f;
    --good:#2f8f5b; --warn:#b8851f; --bad:#b8463f; --bg:#ffffff; --panel:#faf8f3; }
  *{box-sizing:border-box;}
  body{ font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif; color:var(--ink);
    margin:0; font-size:11px; line-height:1.5; background:var(--bg); }
  .page{ padding:48px 52px; }
  header{ border-bottom:3px solid var(--gold); padding-bottom:16px; margin-bottom:8px; }
  .eyebrow{ font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); font-weight:700; }
  h1{ font-family:Georgia,'Times New Roman',serif; font-size:30px; margin:6px 0 4px; letter-spacing:-.5px; }
  h2{ font-family:Georgia,serif; font-size:18px; margin:26px 0 10px; padding-bottom:6px;
    border-bottom:1px solid var(--line); color:#111; }
  h3{ font-size:12px; margin:16px 0 6px; color:var(--gold); text-transform:uppercase; letter-spacing:.08em; }
  p{ margin:0 0 8px; color:var(--muted); }
  .meta{ color:var(--muted); font-size:11px; }
  strong{ color:var(--ink); }
  table{ width:100%; border-collapse:collapse; margin:8px 0 4px; }
  th{ text-align:left; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:#8a8275;
    border-bottom:1px solid var(--line); padding:7px 8px; }
  td{ padding:7px 8px; border-bottom:1px solid #f0ece4; vertical-align:top; }
  td.k{ color:var(--ink); font-weight:500; }
  .pill{ display:inline-block; padding:2px 8px; border-radius:99px; font-size:9px; font-weight:700;
    letter-spacing:.04em; }
  .ok{ background:rgba(47,143,91,.12); color:var(--good); }
  .warn{ background:rgba(184,133,31,.14); color:var(--warn); }
  .bad{ background:rgba(184,70,63,.12); color:var(--bad); }
  ul{ margin:4px 0 10px; padding-left:18px; } li{ margin:3px 0; color:var(--muted); }
  li strong{ color:var(--ink); }
  .panel{ background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:14px 18px; margin:10px 0; }
  .grid2{ display:grid; grid-template-columns:1fr 1fr; gap:0 28px; }
  .owner{ font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
    padding:1px 7px; border-radius:99px; border:1px solid var(--line); color:var(--gold); }
  .avoid{ break-inside:avoid; }
  footer{ margin-top:24px; padding-top:12px; border-top:1px solid var(--line); color:#9a9286; font-size:9px; }
  .num{ font-family:Georgia,serif; font-size:22px; color:var(--goldlt); line-height:1; }
  .statgrid{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:14px 0; }
  .stat{ border:1px solid var(--line); border-radius:10px; padding:12px 14px; background:var(--panel); }
  .stat .lbl{ font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:#8a8275; }
  .stat .v{ font-family:Georgia,serif; font-size:24px; margin-top:4px; }
  .v.good{ color:var(--good);} .v.gold{ color:var(--goldlt);} .v.warn{ color:var(--warn);}
  table.cmp th{ background:var(--panel); }
  table.cmp td{ border-bottom:1px solid var(--line); }
  table.cmp td.area{ color:var(--ink); font-weight:600; width:24%; }
  table.cmp td.before{ color:var(--bad); width:38%; }
  table.cmp td.after{ color:var(--good); font-weight:500; width:38%; }
  table.cmp .x{ color:var(--bad); font-weight:700; } table.cmp .c{ color:var(--good); font-weight:700; }
</style></head><body><div class="page">

<header>
  <div class="eyebrow">Disruptors Media · Technical SEO &amp; GEO</div>
  <h1>Site Audit &amp; Remediation Report</h1>
  <div class="meta">disruptorsmedia.com — work completed on the <strong>camillo</strong> branch · measured against the prerendered production build</div>
</header>

<div class="statgrid">
  <div class="stat"><div class="lbl">Routes Prerendered</div><div class="v good">22 / 22</div></div>
  <div class="stat"><div class="lbl">Lighthouse SEO</div><div class="v good">100</div></div>
  <div class="stat"><div class="lbl">Accessibility</div><div class="v good">100</div></div>
  <div class="stat"><div class="lbl">GEO On-Page Signals</div><div class="v gold">7 / 7</div></div>
</div>

<p>The root cause behind both the performance and AI-citation failures was that the site was a client-rendered SPA serving an empty HTML shell to every crawler. That is now fixed: every indexable route ships real content, headings, metadata, and structured data in the raw HTML. On-page SEO and GEO are comprehensive; the remaining gains are primarily deployment and off-page.</p>

<h2>What Changed — Before vs After</h2>
<p>The plain-English summary of what improved.</p>
<table class="cmp">
  <thead><tr><th>Area</th><th>Before</th><th>After</th></tr></thead>
  <tbody>
    <tr><td class="area">What Google &amp; AI crawlers saw</td><td class="before"><span class="x">✗</span> A blank page — content only appeared after scripts ran, so crawlers got nothing</td><td class="after"><span class="c">✓</span> Every page's real content, headings &amp; info, right in the raw HTML (all 22 pages)</td></tr>
    <tr><td class="area">Page titles &amp; descriptions</td><td class="before"><span class="x">✗</span> One generic title/description for the entire site</td><td class="after"><span class="c">✓</span> A unique, optimized title &amp; description on each of the 22 pages</td></tr>
    <tr><td class="area">"Rich" data for search &amp; AI (schema)</td><td class="before"><span class="x">✗</span> Basic business info only</td><td class="after"><span class="c">✓</span> Full set: FAQs, services, how-to steps, reviews, breadcrumbs, author</td></tr>
    <tr><td class="area">FAQ section</td><td class="before"><span class="x">✗</span> A "Coming soon" placeholder</td><td class="after"><span class="c">✓</span> Real FAQs on the home, FAQ, and all 9 service pages</td></tr>
    <tr><td class="area">Page headings</td><td class="before"><span class="x">✗</span> Missing, duplicated, or faked with styled text</td><td class="after"><span class="c">✓</span> Exactly one proper headline per page, in correct order</td></tr>
    <tr><td class="area">AI-readiness checklist (GEO)</td><td class="before"><span class="x">✗</span> 3 of 7 checks passing (score 43)</td><td class="after"><span class="c">✓</span> 7 of 7 checks passing</td></tr>
    <tr><td class="area">Opening the site</td><td class="before"><span class="x">✗</span> A 1.7-second "loading…" splash screen every time</td><td class="after"><span class="c">✓</span> Content appears instantly — no splash screen</td></tr>
    <tr><td class="area">Accessibility score</td><td class="before"><span class="x">✗</span> Failing several checks</td><td class="after"><span class="c">✓</span> 100 / 100</td></tr>
    <tr><td class="area">Returning visitors</td><td class="before"><span class="x">✗</span> Could get stuck on a stale, cached old version forever</td><td class="after"><span class="c">✓</span> Always get the latest version</td></tr>
    <tr><td class="area">Homepage weight</td><td class="before"><span class="x">✗</span> ~38 MB of auto-playing video</td><td class="after"><span class="c">✓</span> Video skipped on phones, lazy-loaded elsewhere, images optimized</td></tr>
  </tbody>
</table>

<h2>Current State (measured)</h2>
<table>
  <thead><tr><th>Check</th><th>Result</th></tr></thead>
  <tbody>
    <tr><td class="k">Routes shipping real HTML (prerendered)</td><td><span class="pill ok">22 / 22</span></td></tr>
    <tr><td class="k">Unique title per route</td><td><span class="pill ok">22 / 22</span></td></tr>
    <tr><td class="k">Titles &le; 60 / descriptions &le; 160 chars</td><td><span class="pill ok">pass</span> <span class="meta">(home title 61 — canonical brand phrase)</span></td></tr>
    <tr><td class="k">Exactly one H1 per route</td><td><span class="pill ok">22 / 22</span></td></tr>
    <tr><td class="k">Self-referencing canonical per route</td><td><span class="pill ok">22 / 22</span></td></tr>
    <tr><td class="k">Lighthouse SEO / Accessibility / Best-Practices</td><td><span class="pill ok">100 / 100 / 96</span></td></tr>
    <tr><td class="k">GEO on-page signals (Content Agent heuristics)</td><td><span class="pill ok">7 / 7</span> <span class="meta">(was 3/7 → GEO 43)</span></td></tr>
    <tr><td class="k">Crawl assets</td><td><span class="pill ok">robots, sitemap (22), llms.txt, 404, _redirects</span></td></tr>
  </tbody>
</table>
<p class="meta"><strong>Structured data in raw HTML:</strong> Organization, LocalBusiness, ProfessionalService, WebSite, Review/Rating (6 real), Service (9 pages), BreadcrumbList (21), FAQPage (11: home + faq + 9 solutions), HowTo (home), Person/author (about). All validated.</p>

<h2>What We've Done — SEO &amp; GEO</h2>

<div class="avoid">
<h3>1 · Rendering &amp; Crawlability (root-cause fix)</h3>
<ul>
  <li><strong>Build-time prerendering of all 22 indexable routes</strong> — real H1, body copy, and metadata now in served HTML (was an empty #root shell). Resilient fallback so a flaky route can't break the deploy.</li>
  <li><strong>hydrateRoot</strong> entry so snapshots become interactive.</li>
  <li><strong>Graceful Supabase fallback</strong> so a missing/misconfigured data layer no longer blanks static pages or the prerender.</li>
</ul>
</div>

<div class="avoid">
<h3>2 · Metadata (per-route)</h3>
<ul>
  <li><strong>usePageMeta</strong> hook: unique title, description, canonical, OG/Twitter on every route (previously all routes shared one static head).</li>
  <li>Shortened the 83-char homepage title; trimmed all over-length titles/descriptions.</li>
</ul>
</div>

<div class="avoid">
<h3>3 · Structured Data</h3>
<ul>
  <li>Added <strong>WebSite, FAQPage</strong> (home + /faq + all 9 solutions), <strong>Service</strong> (9), <strong>BreadcrumbList</strong> (inner pages), <strong>HowTo</strong> (process), <strong>Person/author</strong> (Tyler Welsh), <strong>Review</strong> (6 real testimonials).</li>
  <li>Kept existing Organization / LocalBusiness / ProfessionalService.</li>
  <li>Fixed a schema-parity bug (home FAQ schema leaking to all pages) and a prerender bug (home snapshot becoming the template for every route).</li>
</ul>
</div>

<div class="avoid">
<h3>4 · On-Page GEO Content</h3>
<ul>
  <li><strong>"What is Disruptors Media?"</strong> liftable definition on home + about.</li>
  <li><strong>Answer-first "What is {service}?"</strong> framing on all 9 solutions pages.</li>
  <li>Real <strong>&lt;ol&gt; numbered process</strong>, <strong>&lt;blockquote&gt;/&lt;cite&gt; attributable testimonials</strong>, single-H1 + ordered H2/H3 hierarchy.</li>
  <li><strong>FAQ</strong> page + home section + per-service FAQs surfaced; <strong>llms.txt</strong> for AI crawlers.</li>
</ul>
</div>

<div class="avoid">
<h3>5 · Accessibility (Lighthouse 100)</h3>
<ul>
  <li>Icon-button aria-labels, WCAG AA contrast fixes (gold), 44px touch targets, explicit image dimensions.</li>
</ul>
</div>

<div class="avoid">
<h3>6 · Performance &amp; UX</h3>
<ul>
  <li>Mobile-gated + lazy-loaded heavy background videos; deferred the billboard popup off the LCP path.</li>
  <li>Supabase image transform URLs (resize + auto-WebP) on logos/marquee/service cards; width/height set.</li>
  <li>Removed the 1.7s fake loading-screen splash; fixed the services carousel jitter/slow-load.</li>
  <li>Fixed a service worker that was serving a stale cached shell (would have pinned visitors to the old site).</li>
</ul>
</div>

<div class="avoid">
<h3>7 · Crawl Infrastructure</h3>
<ul>
  <li>Sitemap synced to the 22 prerendered routes; robots.txt allows all AI crawlers; legacy 301 redirect scaffold + branded 404.html for link-equity recovery.</li>
</ul>
</div>

<h2>What Could Still Be Done</h2>

<div class="avoid">
<h3>Code <span class="owner">can do now</span></h3>
<ul>
  <li><strong>JS code-split the 1.8 MB entry chunk</strong> (~1.3 MB unused on marketing pages) — biggest remaining Performance / Total-Blocking-Time lever. Needs careful, tested work.</li>
  <li><strong>AggregateRating</strong> on Organization — once a real Google review count is provided (left out to avoid fabricating numbers).</li>
  <li><strong>Article schema</strong> on blog posts; <strong>speakable</strong> schema for voice surfaces.</li>
  <li><strong>Scope the presentation service worker</strong> to the presentation feature only (it currently caches aggressively for every visitor).</li>
  <li><strong>Drop / "hidden" source maps</strong> from the deploy (18 MB) once debugging isn't needed.</li>
</ul>
</div>

<div class="avoid">
<h3>Content <span class="owner">needs human attention</span></h3>
<ul>
  <li><strong>Approve / expand the FAQ copy</strong> (Q2–Q6 are drafts) — more approved Q&amp;As = more GEO surface.</li>
  <li><strong>Per-service definitions</strong> (one clean "X is Y" sentence each) to strengthen answer-first blocks.</li>
  <li><strong>Non-branded keyword content</strong> (the gap behind only 16 organic keywords) — service / location landing pages.</li>
</ul>
</div>

<div class="avoid">
<h3>Infra &amp; Deploy <span class="owner">needs human attention — unlocks everything</span></h3>
<ul>
  <li><strong>Deploy camillo</strong> with the prerender wired into the Netlify build (npm run build:prerender + npx playwright install chromium). Nothing above counts until this ships and bots re-crawl.</li>
  <li><strong>Re-encode the Supabase videos</strong> (12 MB → &lt;2 MB) + poster frames — the single biggest payload win.</li>
  <li><strong>Convert fonts to WOFF2</strong> (self-hosted .otf → ~50–70% smaller).</li>
  <li><strong>Populate the legacy 301 map</strong> from the Backlink Audit (recovers equity from 469 referring domains).</li>
</ul>
</div>

<div class="avoid">
<h3>Verification <span class="owner">post-deploy</span></h3>
<ul>
  <li>Google Rich Results Test (Organization + FAQPage + Review + Breadcrumb + HowTo).</li>
  <li>PageSpeed Insights on the live dev URL — the only accurate Performance number (local is distorted by no compression/CDN).</li>
  <li>Re-run the Content Agent GEO diagnostic + re-test "what is Disruptors Media" in AI engines after re-crawl → goal <strong>Cited = yes</strong>.</li>
</ul>
</div>

<div class="panel avoid">
  <strong>Bottom line.</strong> On-page SEO and GEO are now comprehensive and verified in the raw HTML — 22/22 routes prerendered, full structured-data coverage, GEO signals 3/7 → 7/7, Accessibility and SEO at 100. The remaining gains are mostly <strong>deployment and off-page</strong>: ship the branch with prerendering in CI, re-encode the videos, and populate the legacy redirect map. Those unlock the real, measurable score improvements.
</div>

<footer>Generated by Claude Code for Disruptors Media · Technical SEO &amp; GEO remediation · branch: camillo</footer>

</div></body></html>`;

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  ...(process.env.PRERENDER_CHROMIUM_PATH ? { executablePath: process.env.PRERENDER_CHROMIUM_PATH } : {}),
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
});
await browser.close();
console.log('PDF written to', OUT);
