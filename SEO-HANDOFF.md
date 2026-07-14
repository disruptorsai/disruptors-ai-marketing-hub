# SEO / GEO Handoff

**Date:** 2026-06-26
**Branch:** `camillo`
**Status:** Code-side optimizations applied. Remaining work is grouped below by who can do it (deploy, code, content, off-site).

This document lets you hand the rest off cleanly. It lists (1) exactly what was changed and how to verify, (2) a blocker on your local machine, and (3) everything still open.

---

## 1. What was changed (apply = done in code, not yet deployed)

| # | File | Change | Why it matters |
|---|---|---|---|
| 1 | `netlify.toml` | Build command → `npx playwright install chromium && npm run build:prerender` | Production was shipping an **empty page** to Google/AI on every URL. This makes the prerendered HTML actually deploy. **Single biggest fix.** |
| 2 | `index.html` | Merged 4 overlapping schema blocks → one `@id`-anchored `@graph` (ProfessionalService + WebSite); added `aggregateRating` 5.0/6; added YouTube to `sameAs`; refreshed default title/description to current "Fractional CAIO/CMO" positioning | Clean, non-redundant structured data; star-rating eligibility; one strong business entity for AI. |
| 3 | `src/pages/blog-detail.jsx` | Added `usePageMeta` + `BlogPosting` JSON-LD; **clean `/blog/:slug` URLs** (with `?slug=` fallback); **named author** (`post.author_name`) in byline + Person schema; canonical = clean URL | Blog posts previously had no title/description/schema and used messy `?slug=` URLs. |
| 4 | `src/pages/index.jsx` | Added `<Route path="/blog/:slug">` (kept `/blog-detail` for back-compat) | Enables clean, indexable blog URLs. |
| 5 | `src/pages/blog.jsx` | Post links now point to `/blog/${slug}` | Internal links use the clean URLs. |
| 6 | `scripts/prerender.js` | Best-effort build-time fetch of published posts → prerenders each `/blog/<slug>` **and** appends them to `dist/sitemap.xml`. Non-fatal if Supabase is unreachable at build | Makes blog posts visible to crawlers + listed in the sitemap. |
| 7 | `public/sitemap.xml` | Refreshed 33 stale `lastmod` dates (2025-01-15 → 2026-06-26) | Removes the "abandoned site" signal. |
| 8 | `public/robots.txt` | Removed `Crawl-delay: 1` | Stops needlessly throttling Bing/AI crawlers. |

All edited JS/JSX files pass an esbuild syntax check. The JSON-LD in `index.html` was validated as parseable.

### How to verify after deploy
```bash
# 1. After the dev deploy, confirm pages are no longer empty shells:
curl -s https://dev.disruptorsmedia.com/about | grep -c '<h1'       # expect >= 1
curl -s https://dev.disruptorsmedia.com/pricing | grep -c 'application/ld+json'

# 2. Confirm a blog post prerendered with clean URL + author:
curl -s https://dev.disruptorsmedia.com/blog/<some-slug> | grep -E '<h1|BlogPosting|author'

# 3. Confirm blog posts landed in the sitemap:
curl -s https://dev.disruptorsmedia.com/sitemap.xml | grep -c '/blog/'

# 4. Validate schema: paste the homepage into https://validator.schema.org/
```

---

## 2. BLOCKER on this machine (fix before building/committing locally)

Your working copy lives on the **iCloud-synced Desktop**, and several files (notably `index.html`) were **"dataless" placeholders** — the directory shows a size but the bytes aren't downloaded locally. Symptoms seen:
- `index.html` read as 0 bytes while git had the real 14,939 bytes (it was restored from git).
- `git status`, `eslint`, and full `npm run build` **hang** trying to read unmaterialized files.

**This is local-only — Netlify builds from git, where everything is intact, so deploys are unaffected.**

**To build/commit locally**, materialize the files first:
- In Finder: right-click the project folder → **Download Now**, or
- Move the repo off the iCloud Desktop (e.g. `~/dev/`), or
- `find . -path ./node_modules -prune -o -type f -print0 | xargs -0 cat > /dev/null` to force-download.

Then `npm run build:prerender` will run. (Because of this, I verified changes with targeted tools — esbuild syntax checks, JSON-LD parsing — not a full local build.)

---

## 3. Still open — grouped by owner

### A. Deploy & verify (whoever owns deploys) — **do this first**
- [ ] **Verify Chromium works on Netlify.** The prerender uses Playwright headless Chromium. Netlify's build image *usually* has the needed system libs, but this is the one risky part. Watch the **dev** deploy log for `[prerender] ✓` lines. If it fails on `playwright install` or browser launch, options: add `--with-deps`, pin a Netlify build image with Chromium, or use `@sparticuz/chromium`. The prerender script supports a `PRERENDER_CHROMIUM_PATH` env override.
- [ ] Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present in the Netlify **build** environment (needed for the blog-post prerender step; it's skipped gracefully if absent).
- [ ] Run the verify commands in section 1 against the dev site.
- [ ] If dev looks good, promote to production (`npm run deploy:prod`).

### B. Code tasks remaining (next dev)
- [ ] **Compress images (biggest speed win).** ~15 blog PNGs at 2–2.8MB each (~30MB) in `public/blog-images/generated/`, plus 1MB+ icons in `public/generated/`, `public/images/ai-generated/`, `public/images/services/`.
  - A script already exists: `scripts/convert-images-to-webp.js` (uses `sharp`, already a dependency). **Note it does NOT currently include `blog-images/generated`** — add that dir to its `IMAGE_DIRS` array.
  - After generating `.webp`, **update references**: code references are mostly DB-driven (`post.featured_image`, `post.image`) so you'll also need to update Supabase `posts` rows, or serve `.webp` via a `<picture>`/CDN transform. Test that images still render.
  - Expected: ~30MB → ~4–6MB. Big LCP improvement on blog/solution pages.
- [ ] **Dead-code/asset cleanup.** The Spline components (`SplineScrollAnimation.jsx`, `SplineScrollAnimationEnhanced.jsx`, `ServicesHandScroll.jsx`, `SplineViewer.jsx`) are **not rendered by any page** (only referenced in a `.md` guide). The matching assets `public/original-animation.spline` (5.8MB) and `public/spline-animation.splinecode` (2.8MB) appear unused. Verify, then remove to cut ~9MB of deploy weight. *(Verify carefully — `SplineViewer` loads a scene by URL at runtime.)*
- [ ] **Server-render team bios on `/about`.** Bios exist but are trapped in a click-to-open `TeamMemberModal`, so crawlers never see them. Render them into static HTML and add a `Person` schema (with `sameAs` LinkedIn) per team member. Strong E-E-A-T win.
- [ ] **Add `Permissions-Policy` header** in `netlify.toml` (e.g. `camera=(), microphone=(), geolocation=()`) — *but first confirm no page uses those APIs (check `/event-checkin`)*. Optionally harden HSTS with `includeSubDomains` (skip `preload` unless you intend the permanent commitment).
- [ ] **Legacy redirect (optional):** add a 301 from `/blog-detail?slug=X` → `/blog/X` in `public/_redirects` if old query-param links are indexed. (Not required — canonical already points to the clean URL.)

### C. Content tasks (content/marketing)
- [ ] **Named blog authors.** The `posts` table has `author_name` / `author_member_id` columns — populate them (the byline + Person schema now read `author_name` automatically). Real team bios exist in `scripts/supabase-migration/CREATE_TEAM_MEMBERS.sql`.
- [ ] **Case-study metrics.** Some studies use vague placeholders ("Improved", "Growing") — replace with real numbers, and add 300+ words of first-hand narrative each.
- [ ] **Content freshness.** Surface visible "Published / Updated" dates on posts; refresh top AI-topic posts for 2026.
- [ ] **Add `llms-full.txt`** and expand `public/llms.txt` with pricing tiers + a case-studies section.
- [ ] **Finalize FAQ.** `src/data/faqContent.js` Q2–Q6 are marked "DRAFT — pending Tyler's approval."

### D. Off-site / real-world (the score ceiling — marketing/ops)
*These move "Brand Authority," the 20%-weighted category that no code change can touch. Required to push the score past ~80.*
- [ ] **Create a Wikidata entity** for "Disruptors Media" (highest-leverage; also fixes AI confusing you with "Disruptive Advertising"). Then add its URL to the `sameAs` array in `index.html`.
- [ ] **Claim a Clutch or G2 agency profile** under the exact name "Disruptors Media."
- [ ] **Fix the NAP inconsistency:** your site says **650** N Main St; the BestOfSLC directory says **640**. Pick one and make it consistent everywhere.
- [ ] **Claim/verify the Google Business Profile** with a NAP that matches the `LocalBusiness` schema.
- [ ] **IndexNow + Bing Webmaster Tools** verification (helps ChatGPT, which leans on Bing's index).
- [ ] Seed a few genuine third-party mentions (relevant subreddits, industry directories).

---

## Scorecard reference
- **Live now (pre-deploy):** ~47/100 — content is good but hidden behind the empty-shell render.
- **After deploying the changes above:** ~76/100.
- **To reach mid-80s:** image compression + the content tasks (section B & C).
- **To break ~85:** the off-site authority work (section D) — the binding constraint.

Full detail in `GEO-AUDIT-REPORT.md`.
