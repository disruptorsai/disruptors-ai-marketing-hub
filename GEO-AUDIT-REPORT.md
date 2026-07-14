# GEO Audit Report: Disruptors Media

**Audit Date:** 2026-07-01
**URL audited:** `camillo` prerendered build (local, `http://localhost:4300`) — the branch pending deploy
**Business Type:** Agency / Services (fractional CAIO/CMO) with Local Business signals (Utah)
**Pages Analyzed:** 32 prerendered routes (raw HTML, no JS — what AI crawlers receive)

> **Scope:** This audits the **`camillo` build** (not yet deployed). The live production site still scores **~33/100 (Critical)** because it ships an empty client-rendered shell — see `GEO-AUDIT-LIVE-2026-07-01.md` and `GEO-SEO-COMPARISON-camillo-vs-live.md`. This report measures the remediated build that is about to ship. Brand-Authority and Platform-Optimization require live external-domain scans (YouTube/Reddit/Wikipedia/LinkedIn) and are carried as estimates.

---

## Executive Summary

**Overall GEO Score: ~59/100 (Fair, upper edge)**

The technical and structured-data foundation is now excellent: every one of the 32 routes ships server-rendered HTML with exactly one `<h1>`, a self-referencing canonical, unique title/description, OG/Twitter tags, and comprehensive per-page JSON-LD. AI crawlers get real, readable content on every page — including the statistic-rich case studies (`+450%`, `35%`, `99%`, `$5000`, etc.) that are the site's most citable asset. The remaining gap is **content citability on cornerstone pages** (definitions/service overviews still score low on statistical density and uniqueness) and **off-site brand authority**, neither of which the deploy itself addresses. Removing the broken Gallery this session cut dead-asset noise from the crawl (59 → 2 dead references).

### Score Breakdown

| Category | Score | Weight | Weighted |
|---|---|---|---|
| AI Citability | 56/100 | 25% | 14.0 |
| Brand Authority* | 35/100 | 20% | 7.0 |
| Content E-E-A-T | 62/100 | 20% | 12.4 |
| Technical GEO | 90/100 | 15% | 13.5 |
| Schema & Structured Data | 90/100 | 10% | 9.0 |
| Platform Optimization* | 32/100 | 10% | 3.2 |
| **Overall GEO Score** | | | **~59/100** |

\* Estimated — require an external presence scan not performed in this run.

---

## Critical Issues (Fix Immediately)

- **(Critical) Not deployed.** The entire improvement is live only on `camillo`; production still serves the empty-shell SPA (~33/100). Deploying `camillo` with the prerender step in CI is the single highest-impact action and is the prerequisite for every gain in this report.

## High Priority Issues

- **(High) Low statistical density / uniqueness on cornerstone pages.** SSR and structure are strong, but homepage and solution-overview passages still lack the hard numbers and original/proprietary claims AI engines preferentially quote. Case studies now carry stats; the definitional/service pages do not yet.

## Medium Priority Issues

- **(Medium) 2 dead Cloudinary hero images remain.** `/about` and `/work-saas-content-engine` each reference one image on the dead `dvcvxhzmt` Cloudinary account (HTTP 401). Replace with Supabase equivalents or remove. (The 57-video Gallery — the worst offender — was removed this session.)
- **(Medium) Brand authority underbuilt / off-site entity presence thin.** Backlink equity (AS 7, ~469 referring domains) is underused; little third-party presence (Wikipedia/Reddit). Requires off-site work.

## Low Priority Issues

- **(Low) A few thin/long titles.** Homepage title is 67 chars (Google truncates ~60); `/faq` (24), `/podcast` (26) are short. Optional tuning.
- **(Low) 4 homepage images missing explicit `width`/`height`** — minor CLS risk.

---

## Category Deep Dives

### AI Citability (56/100)
Every page now ships readable content in raw HTML (homepage 4,389 words; solution pages 1,300–3,200; case studies 1,000+). Case-study statistics are present in raw HTML (`+450%`, `35%`, `99%`, `$5000`) — a real citability win. Held back by cornerstone definitional/service passages that remain low on statistical density and uniqueness signals. Answer-first structure is in place; add proprietary numbers/data to lift further.

### Brand Authority (35/100, estimated)
Organization + LocalBusiness entity signals present in schema. Off-site presence (Wikipedia/Reddit/LinkedIn/YouTube) not scanned this run. Backlink equity underused; the empty-shell live site historically wasted it (fixed on deploy).

### Content E-E-A-T (62/100)
Now server-rendered and visible to crawlers: attributed testimonials (Review schema, real names — no fabricated aggregate), team/Person schema, and case-study results with concrete numbers. About page and service definitions present. Opportunity: author bios/credentials and source citations on content.

### Technical GEO (90/100)
SSR confirmed on all 32 routes (1 `<h1>`, non-empty `#root` everywhere). `llms.txt` serves 200; `sitemap.xml` = 32 URLs; `robots.txt` allows all AI crawlers (GPTBot/ClaudeBot/PerplexityBot/Google-Extended) with **no crawl-delay**. Security headers strong on deploy (HSTS, CSP, X-Frame DENY, nosniff, Referrer-Policy); live TTFB 0.29s. `/event-checkin` correctly `noindex`. Only minor deductions (image dimensions, a couple residual dead assets).

### Schema & Structured Data (90/100)
Comprehensive and in raw HTML: Organization, LocalBusiness, ProfessionalService, WebSite (global) plus per-page FAQPage, Service, HowTo, BreadcrumbList, Person, Review. Validates cleanly. Note: a global `AggregateRating` is present in the baked head schema — confirm it reflects a real review count before relying on it.

### Platform Optimization (32/100, estimated)
Requires live external-presence scan. On-page readiness for AI Overviews / ChatGPT / Perplexity is now strong (real content + schema per page); off-platform presence is the gap.

---

## AI Crawler Access

| Crawler | User-Agent | Status |
|---|---|---|
| GPTBot | GPTBot | ✅ Allowed |
| ClaudeBot | ClaudeBot | ✅ Allowed |
| PerplexityBot | PerplexityBot | ✅ Allowed |
| Google-Extended | Google-Extended | ✅ Allowed |
| Googlebot / Bingbot | Googlebot / bingbot | ✅ Allowed |
| CCBot | CCBot | ✅ Allowed |

`robots.txt` = `User-agent: * / Allow: /` with sitemap referenced and no crawl-delay. No AI crawler blocked.

---

## Quick Wins (This Week)
1. **Deploy `camillo` with prerender in CI** — flips the whole technical + citability layer live (from ~33 to ~59).
2. **Replace/remove the 2 dead Cloudinary hero images** on `/about` and `/work-saas-content-engine`.
3. **Inject statistics into cornerstone pages** (homepage definition, solution overviews) — biggest remaining citability lever.
4. **Trim the homepage `<title>` to ~58 chars**; enrich thin titles (`/faq`, `/podcast`).
5. **Add `width`/`height` to the 4 undimensioned homepage images.**

## 30-Day Action Plan

### Week 1: Ship & clean up
- [ ] Deploy `camillo` with prerender wired into CI; re-run this audit against production
- [ ] Replace or remove the 2 remaining dead Cloudinary hero images

### Week 2: Citability
- [ ] Rewrite homepage definition + solution overviews with hard stats and one proprietary data point each
- [ ] Trim/enrich titles; add image dimensions

### Week 3: Authority / E-E-A-T
- [ ] Add author bios + credentials to content pages; add source citations
- [ ] Seed Reddit / LinkedIn / Wikipedia entity presence

### Week 4: Programmatic + re-measure
- [ ] Location × service pages
- [ ] Re-run the full GEO audit on the live domain for true Brand / Platform scores

---

## Appendix: Pages Analyzed (32 routes)

All 32 routes returned **HTTP 200** with **exactly 1 `<h1>`**, a **self-referencing canonical**, **unique title/description**, and **no accidental `noindex`**. Representative set:

| URL | Raw-HTML words | Notes |
|---|---|---|
| / | 4,389 | Full SSR; global schema |
| /solutions | 3,181 | Service + breadcrumb schema |
| /solutions-seo-geo (×9 service pages) | ~1,300 ea. | FAQPage + Service; unique descriptions |
| /about | 1,199 | 1 dead Cloudinary hero image |
| /faq | 1,542 | FAQPage schema |
| /pricing | 1,297 | — |
| /work + 10 case studies | 1,000–1,100 ea. | Stats in raw HTML; BreadcrumbList |
| /work-saas-content-engine | ~1,100 | 1 dead Cloudinary hero image |
| /blog, /podcast, /billboard, /book-strategy-session, /marketing-audit, /privacy, /terms | varies | All SSR, clean |

**Bottom line:** `camillo` is a **Fair (~59/100)** GEO result with an Excellent technical/schema foundation — a ~+26-point jump over the live site (~33). The two levers left are **deploying it** and **raising cornerstone-page citability**; the rest is off-site authority work.
