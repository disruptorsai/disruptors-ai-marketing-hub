# GEO Audit Report: Disruptors Media (LIVE production site)

**Audit Date:** 2026-07-01
**URL audited:** https://disruptorsmedia.com (the **currently deployed** site)
**Business Type:** Agency / Services (fractional CAIO/CMO) with Local Business signals
**Pages Analyzed:** homepage + /solutions, /about, /work-tradeworx-usa, /faq, /pricing (raw HTML, no JS — what AI crawlers actually receive)

> **Important scope note.** This audits the **live production site**, which is still the pre-`camillo` client-rendered SPA. The `camillo` branch (prerendering, per-page meta, case studies, expanded schema/sitemap) is **not deployed yet**, so none of that work is reflected here. A local audit of the `camillo` build previously scored **~53/100**; this live audit is the **"before" baseline** that quantifies why deploying `camillo` matters. The local `camillo` build could not be re-served for this run (local `dist` was lost to a filesystem issue), so the two numbers come from different runs but measure the same site pre/post-remediation.

---

## Executive Summary

**Overall GEO Score: ~33/100 (Critical)**

The live site is technically well-configured for crawler *access* — robots.txt allows all AI crawlers, `llms.txt` and `sitemap.xml` are served, security headers are strong, and TTFB is fast (0.29s). But it fails the single most important GEO requirement: **every page is a client-rendered empty shell.** The raw HTML (what GPTBot, ClaudeBot, PerplexityBot, and Google's render-budget-limited first pass receive) contains **`<div id="root"></div>` with zero `<h1>`/`<h2>` headings and no body content** on the homepage and every inner page tested. AI systems get a page with schema and a title but **nothing to read, quote, or cite.** This is the dominant, score-defining problem, and it is exactly what the `camillo` prerendering work fixes.

### Score Breakdown

| Category | Score | Weight | Weighted |
|---|---|---|---|
| AI Citability | 15/100 | 25% | 3.75 |
| Brand Authority* | 35/100 | 20% | 7.00 |
| Content E-E-A-T | 30/100 | 20% | 6.00 |
| Technical GEO | 45/100 | 15% | 6.75 |
| Schema & Structured Data | 65/100 | 10% | 6.50 |
| Platform Optimization* | 30/100 | 10% | 3.00 |
| **Overall** | | | **~33/100** |

\* Brand Authority and Platform Optimization require an off-site external scan (YouTube/Reddit/Wikipedia/LinkedIn) not performed in this run; carried over as estimates from the prior audit.

---

## Critical Issues (Fix Immediately)

1. **No server-side rendering — content is invisible to AI crawlers.** Raw HTML on `/`, `/solutions`, `/about`, `/work-tradeworx-usa`, `/faq`, `/pricing` all return `<div id="root"></div>`, **0 `<h1>`**, **0 `<h2>`**, ~502 "words" (almost entirely JSON-LD/meta, not real copy). AI crawlers do not execute JavaScript, so they see an empty page on every URL. **Fix: deploy the `camillo` branch, which prerenders all marketing routes to real static HTML.** This is the highest-impact action available and single-handedly moves the score from Critical toward Fair.

2. **Case-study / deep content returns a 200 empty shell.** `/work-tradeworx-usa` responds 200 but with no content — so the most citable material (client results, statistics) is entirely absent from what crawlers receive. `camillo` prerenders the 10 case studies with their statistics in raw HTML.

## High Priority Issues

3. **`llms.txt` and `sitemap.xml` describe pages that render empty.** Both files are served (good), but they point AI systems at URLs that return no readable content — so the guidance leads to empty pages. Deploying SSR makes these assets actually pay off. (Live sitemap has 22 URLs; `camillo` expands to 33 incl. case studies.)

4. **`Crawl-delay: 1` in robots.txt throttles crawl budget.** Minor but real; `camillo` removes it.

## Medium Priority Issues

5. **Page-level schema missing from raw pages.** The homepage ships 3 JSON-LD blocks in `<head>` (Organization / LocalBusiness tier), which is good and survives no-JS. But FAQPage, Service, BreadcrumbList, and Article schema are JS-injected and therefore absent for crawlers. `camillo` bakes these into each prerendered page.

6. **Homepage `<title>` is long and generic** ("Disruptors Media - AI-Powered Marketing Agency | Expert Digital Marketing Solutions"). `camillo` ships a tighter, entity-focused title.

## Low Priority Issues

7. **Content citability (post-SSR gap).** Even once SSR ships, the prior `camillo` audit found passages score well on structure but **zero on statistical density / uniqueness signals** — add hard numbers and original data to cornerstone pages to lift AI-citation likelihood.

---

## Category Deep Dives

### AI Citability (15/100)
Raw HTML contains a title, meta description, and Organization/LocalBusiness JSON-LD — enough for weak *entity recognition*, but **nothing quotable**. No headings, no paragraphs, no answer blocks reach a non-JS crawler. AI systems cannot cite what they cannot read. This is capped near-zero until SSR ships.

### Brand Authority (35/100, estimated)
Organization + LocalBusiness schema provide baseline entity signals. Off-site presence (Wikipedia/Reddit/LinkedIn/YouTube) not scanned this run. Prior audit noted underused backlink equity (AS 7, ~469 referring domains) partly wasted by the empty-shell rendering.

### Content E-E-A-T (30/100)
Experience/Expertise/Authority/Trust signals exist in the app but are **JS-rendered**, so they don't reach crawlers. Schema carries some org-level trust. Real E-E-A-T (team bios, attributed testimonials, case-study results) is invisible in raw HTML today.

### Technical GEO (45/100)
**Strengths:** robots.txt allows all AI crawlers (none blocked); `llms.txt` 200; `sitemap.xml` 200; HTTPS with HSTS; strong CSP; `X-Frame-Options: DENY`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; TTFB 0.29s. **Fatal weakness:** no SSR — the most GEO-critical technical factor fails on every page, which caps this category.

### Schema & Structured Data (65/100)
3 JSON-LD blocks in the static `<head>` render without JS (good). Missing at the raw-HTML level: FAQPage, Service, BreadcrumbList, Article, HowTo (all JS-injected today; present in `camillo`).

### Platform Optimization (30/100, estimated)
Requires live external-presence scan. Empty-shell rendering means AI Overviews / ChatGPT / Perplexity currently have no page content to surface.

---

## AI Crawler Access

| Crawler | User-Agent | Status | Note |
|---|---|---|---|
| GPTBot | GPTBot | ✅ Allowed | `User-agent: * / Allow: /` |
| ClaudeBot | ClaudeBot | ✅ Allowed | (but receives empty HTML) |
| PerplexityBot | PerplexityBot | ✅ Allowed | (but receives empty HTML) |
| Google-Extended | Google-Extended | ✅ Allowed | |
| Googlebot | Googlebot | ✅ Allowed | |
| Bingbot | bingbot | ✅ Allowed | (feeds ChatGPT/Copilot) |
| CCBot | CCBot | ✅ Allowed | |

Access is not the problem — **content delivery is.** Every crawler is welcomed to an empty page.

---

## Quick Wins (This Week)
1. **Deploy `camillo` with prerender in CI.** Flips SSR on for every marketing route — the entire technical + citability layer improves at once. (#1 action.)
2. Remove `Crawl-delay: 1` (already done on `camillo`).
3. Ship the expanded 33-URL sitemap + case studies (already on `camillo`).
4. Tighten the homepage `<title>` (already on `camillo`).
5. Confirm `llms.txt` points only at URLs that will render real HTML post-deploy.

## 30-Day Action Plan
- **Week 1 — Ship SSR:** deploy `camillo`; re-run this audit against production to confirm `has_ssr_content: true` and non-empty `#root` on all pages.
- **Week 2 — Citability:** inject statistics + original data into homepage definition, solution overviews, and case studies (raise statistical_density/uniqueness above 0).
- **Week 3 — Authority/E-E-A-T:** author bios + credentials; seed Reddit/LinkedIn/Wikipedia entity presence.
- **Week 4 — Programmatic + re-measure:** location × service pages; re-run the full GEO audit on the live domain for true Brand/Platform scores.

---

## Appendix: Pages Analyzed (raw HTML)

| URL | HTTP | `<h1>` in raw HTML | `#root` | Verdict |
|---|---|---|---|---|
| / | 200 | 0 | empty | CSR shell |
| /solutions | 200 | 0 | empty | CSR shell |
| /about | 200 | 0 | empty | CSR shell |
| /work-tradeworx-usa | 200 | 0 | empty | CSR shell |
| /faq | 200 | 0 | empty | CSR shell |
| /pricing | 200 | 0 | empty | CSR shell |

**Bottom line:** the live site is a Critical-tier GEO result driven entirely by client-side rendering. The remediation is already built on `camillo` (which measured ~53/100 with SSR working) — **it just needs to be deployed.**
