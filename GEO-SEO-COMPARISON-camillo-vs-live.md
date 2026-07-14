# GEO + SEO Audit: `camillo` branch vs. LIVE production

**Date:** 2026-07-01
**Live:** https://disruptorsmedia.com (currently deployed — old client-rendered SPA)
**Camillo:** local prerendered build of the `camillo` branch, served at `http://localhost:4300`
**Method:** identical for both — fetch each page's **raw HTML with no JavaScript** (exactly what AI crawlers and a search engine's first-pass crawler receive), on the same 6 pages.

---

## Headline

| | LIVE (deployed) | CAMILLO (branch) |
|---|---|---|
| **Overall GEO score** | **~33/100 — Critical** | **~58/100 — Fair** |
| **What an AI crawler sees** | Empty page on every URL | Full content + schema on every URL |

The entire gap is **on-page + technical** (rendering, meta, schema, content). Off-site factors (Brand Authority, Platform presence) are unchanged because they can't be fixed in the repo.

---

## The objective, measured difference (raw HTML, no JS)

| Page | LIVE `#root` | LIVE `<h1>` | LIVE words | → | CAMILLO `#root` | CAMILLO `<h1>` | CAMILLO words |
|---|---|---|---|---|---|---|---|
| `/` | empty | 0 | ~502* | → | **filled** | **1** | **4,389** |
| `/solutions` | empty | 0 | ~0 | → | filled | 1 | 3,181 |
| `/about` | empty | 0 | ~0 | → | filled | 1 | 1,199 |
| `/work-tradeworx-usa` | empty | 0 | ~0 | → | filled | 1 | 1,083 |
| `/faq` | empty | 0 | ~0 | → | filled | 1 | 1,542 |
| `/pricing` | empty | 0 | ~0 | → | filled | 1 | 1,297 |

\* Live's ~502 "words" are almost entirely JSON-LD/meta in `<head>`, not readable body copy. Every live page is `<div id="root"></div>` — AI crawlers get **nothing to read or cite**. Camillo serves real, server-rendered content on every route.

---

## Signal-by-signal comparison

| Signal | LIVE | CAMILLO | Why it matters |
|---|---|---|---|
| **Server-rendered content** | ❌ None (empty `#root`, 0 `<h1>`) | ✅ Every page (1 `<h1>`, 1,000–4,400 words) | AI crawlers don't run JS. This is THE GEO factor. |
| **Per-page `<title>`** | ❌ Same static title on all URLs | ✅ 6 unique, page-specific titles | Duplicate titles dilute SEO; unique titles rank per page |
| **Per-page schema** | ⚠️ 3 global blocks in `<head>` only | ✅ Global **+ per-page**: FAQPage, Service, BreadcrumbList, HowTo | Page-type schema drives AI Overviews & rich results |
| **Case-study statistics in raw HTML** | ❌ Empty shell — no stats | ✅ Present (`$850`, `$5000`, `35%`, `99%`, …) | Hard numbers are the most AI-citable content an agency has |
| **Sitemap URLs** | 22 | **33** (adds 10 case studies + billboard) | More indexable, high-value pages discovered |
| **llms.txt** | ✅ 200 | ✅ 200 | AI guidance file (but on live it points at empty pages) |
| **robots.txt — AI crawlers** | ✅ All allowed | ✅ All allowed | Neither blocks GPTBot/ClaudeBot/PerplexityBot |
| **robots.txt — `Crawl-delay`** | ⚠️ `Crawl-delay: 1` (throttles) | ✅ Removed | Frees crawl budget |
| **Security headers** | ✅ Strong (HSTS, CSP, X-Frame DENY, nosniff) | ✅ Same config + `noindex` on `/event-checkin` | Equivalent on deploy (Netlify headers) |
| **TTFB** | 0.29s | n/a (local static) | Live server speed is already good |

---

## GEO score breakdown (estimated)

| Category | Weight | LIVE | CAMILLO | Driver of change |
|---|---|---|---|---|
| AI Citability | 25% | 15 | 55 | SSR + case-study stats now in raw HTML |
| Brand Authority* | 20% | 35 | 35 | Off-site — unchanged |
| Content E-E-A-T | 20% | 30 | 62 | Team/testimonials/results now server-rendered |
| Technical GEO | 15% | 45 | 88 | SSR works; sitemap 33; crawl-delay removed |
| Schema & Structured Data | 10% | 65 | 90 | Per-page FAQ/Service/Breadcrumb/HowTo in HTML |
| Platform Optimization* | 10% | 30 | 35 | Off-site — largely unchanged |
| **Overall** | | **~33 (Critical)** | **~58 (Fair)** | |

\* Require an external presence scan (Wikipedia/Reddit/LinkedIn/YouTube); carried as estimates.

---

## Traditional SEO comparison

| SEO factor | LIVE | CAMILLO |
|---|---|---|
| Crawlable content on first pass | ❌ JS render queue only (delayed/deprioritized) | ✅ Immediate static HTML |
| Unique title/description/canonical per URL | ❌ | ✅ |
| Duplicate-title issue (Screaming Frog) | ❌ Present | ✅ Resolved |
| One `<h1>` per page | ❌ 0 in raw HTML | ✅ Exactly 1 |
| BreadcrumbList for SERP display | ❌ | ✅ |
| Case studies indexable | ❌ Empty shells | ✅ Prerendered + in sitemap |
| Internal links in raw HTML | ❌ JS-only | ✅ Server-rendered |

---

## Bottom line

- **Live today = ~33/100 (Critical)** — technically well-configured for *access* (robots, llms.txt, security, speed) but delivers an **empty page to every AI crawler and to search engines' first crawl pass.**
- **Camillo = ~58/100 (Fair)** — the same site with the rendering fixed: real content, unique meta, per-page schema, and citable case-study statistics on every route.
- **The +25-point jump is already built and verified locally. It just needs to be deployed.** After deploy, the remaining upside is off-site (Brand/Platform, ~+? ) and cornerstone-page statistical density — neither of which the deploy itself addresses.

### Caveats
- Camillo scores come from the **local prerendered build**; production values (esp. security headers, TTFB) will match live's Netlify config on deploy.
- Category scores are estimates against the GEO rubric; the **measured raw-HTML facts** in the tables above are objective.
- Brand Authority / Platform Optimization were not re-scanned this run (require external-domain crawls).
