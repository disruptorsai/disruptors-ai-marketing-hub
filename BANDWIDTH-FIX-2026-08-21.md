# Bandwidth Fix — August 21, 2026

Record of the first round of fixes for the Netlify bandwidth overage that took
`disruptorsmedia.com` offline (`503 {"error":"usage_exceeded"}`).

Companion to `NETLIFY-BANDWIDTH-AUDIT-HANDOFF.md`, which contains the original brief.

---

## The problem

Netlify usage by billing period:

| Period | Credits | Note |
|---|---:|---|
| Jun 9 – Jul 8 | 761 | Normal. Under the 1,000 allowance. |
| Jul 9 – Aug 8 | 11,000 | **14x jump** |
| Aug 9 – Sep 8 | 5,000 | Site cut off mid-period |

Cost: roughly **$140 in five weeks** of $5 auto-recharges.

**Root cause.** Commit `e3217ec` (2026-07-14, *"compress + localize media"*) moved
50 MB of video out of Cloudinary — whose account had died — and into `public/`,
where Netlify serves it and bills 20 credits/GB. Bandwidth climbed from the day
that shipped and never came back down. Netlify's own usage chart shows the bars
are almost entirely the **Bandwidth** meter, not functions, database, or AI.

Three things then multiplied it:

1. **No cache headers on video.** `netlify.toml` cached `/assets/*` and `/fonts/*`
   but had no rule for `.mp4`. Videos live at `/site-videos/`, outside `/assets/`,
   so they fell to Netlify's default — revalidate on every request.
2. **24 videos site-wide set `autoplay + loop`.** A looping multi-MB video that the
   browser is told not to cache can be re-fetched on each loop.
3. **The homepage hero (7.43 MB) also played on mobile**, with `lazy={false}`.

---

## What changed

### 1. `netlify.toml` — removed a header conflict

Deleted the blanket `/*.js` and `/*.css` `no-store` rules, replaced with a
service-worker-only rule.

Those globs also matched the content-hashed `/assets/*.js` and `/assets/*.css`
bundles. Because they were declared **later** in the file than the
`/assets/*` immutable rules, they risked cancelling them — which would force every
visitor to re-download the full ~2.1 MB JS bundle on every page view.

```toml
# now:
[[headers]]
  for = "/presentation-sw.js"        # the only unhashed root-level JS
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

> **Not yet verified against live headers** — the site was 503 during this work.
> See "How to verify" below. This was the single highest-risk unknown in the audit.

### 2. `netlify.toml` — added caching for media

Video and unversioned images had no `Cache-Control` at all. Now:

| Path | Cache-Control |
|---|---|
| `/site-videos/*`, `/site-assets/*`, `/videos/*` | `max-age=31536000, immutable` |
| `/assets/*.webp` | `max-age=31536000, immutable` |
| `/images/*`, `/generated/*`, `/blog-images/*` | `max-age=2592000` (30d, not immutable) |

⚠️ **These filenames are not content-hashed.** To replace one of these files,
rename it or append a query string (`?v=2`) — the codebase already uses this
pattern for testimonial posters. Otherwise browsers keep the old copy up to a year.

### 3. `vite.config.js` — production source maps off

```js
sourcemap: false   // was: true
```

Was emitting **136 `.map` files, 18.23 MB**, publicly downloadable and linked via
`//# sourceMappingURL`, which vulnerability scanners crawl for. To analyse a bundle
locally, flip to `true` temporarily and rebuild.

### 4. `src/pages/Home.jsx` — hero video off on mobile

Added `disableOnMobile={true}` to `website-demo-reel.mp4` (7.43 MB).

The other two homepage videos already had this; the largest one did not. The code
carried a `PERF TODO` naming this exact file as "the mobile hero payload".

**This is the only visible change in this batch** — mobile users now see the
existing poster image (`website-demo-reel-poster.webp`) instead of the video.
Desktop is unchanged.

---

## Measured effect on the build

| | Before | After |
|---|---:|---:|
| `.map` files | 136 (18.23 MB) | **0** |
| `dist/assets` | 25 MB | **5.8 MB** |
| `dist` total | 110 MB | **92 MB** |

Build verified: `npm run build` → `✓ built in 33.44s`.

Bandwidth effect cannot be measured until the site is back online.

---

## How to verify once the site is up

**1. Confirm the JS caching conflict is resolved** (the important one):

```bash
curl -sSI https://disruptorsmedia.com/assets/<hashed>.js | grep -i cache-control
# want: public, max-age=31536000, immutable
# if it says no-store, the header ordering theory was right and this fix mattered a lot
```

**2. Confirm video caching:**

```bash
curl -sSI https://disruptorsmedia.com/site-videos/dmsite/home/website-demo-reel.mp4 | grep -i cache-control
# want: public, max-age=31536000, immutable
```

**3. Test the loop-refetch theory** — the suspected main amplifier:

Open the homepage → DevTools → Network → filter `.mp4`. Watch a background video
loop several times. If the same file downloads repeatedly, that was the bandwidth
sink and these headers fix it. If it downloads once, the cause is volume, not
re-fetching, and the remaining work below matters more.

**4. Watch the Netlify usage chart** for 48 hours. Daily bars should drop sharply.

---

## How to revert

Everything is in one commit. To undo all of it:

```bash
git revert <commit-sha>
```

To undo just the mobile hero change (the only visible one):

```bash
# src/pages/Home.jsx — remove this line from the first FastVideo block:
disableOnMobile={true}
```

---

## Not done yet

Deliberately out of scope for this round — none of it needs a hosting decision,
but all of it needs testing against a live site.

| # | Task | Saves |
|---|---|---|
| 1 | Move `adapt-or-die.mp4` (23.5 MB) to YouTube | Largest single file on the site |
| 2 | Homepage: 4 videos → 1 | ~12 MB/visit |
| 3 | Re-encode `website-demo-reel.mp4` 7.43 MB → ~2-3 MB | Per the existing PERF TODO |
| 4 | Upload **compressed** videos to Supabase, repoint code | 50 MB off Netlify |
| 5 | Bot rules (`robots.txt`) + real 404 instead of SPA 200 | Blocks crawler waste |
| 6 | Narrow the SPA catch-all to real routes | Fake URLs stop returning 200 |

### Important constraints for #4

- Supabase storage is at **973 MB of the 1 GB free-tier limit** — 47 MB will not fit
  on the free plan.
- Free tier egress is **5 GB/month**; current traffic is ~20 GB/day.
- Pro ($25/mo) gives 250 GB/mo — still under the ~600 GB/mo current rate.
- **Supabase already holds all 13 videos, but they are the uncompressed originals
  (155 MB total).** Repointing the code at those as-is would make pages *heavier*.
  Upload the compressed `public/` copies first.

---

## Separate issues found during the audit

Unrelated to bandwidth, but real:

- **Dead Cloudinary account.** 11 files reference `res.cloudinary.com/dvcvxhzmt/`,
  which returns **401**. User-facing ones include `ai-tools.jsx`,
  `StopWastingBudget.jsx`, `AuditProvenGrowth.jsx`.
- **No analytics.** `src/lib/analytics.js` exists but is never imported, and no
  Google tag is loaded. Measurement ID is still `G-XXXXXXXXXX`. There is no
  visitor data for this site at all.
- **GitHub token in plaintext.** A PAT is embedded in the `origin` remote URL in
  `.git/config`. Should be rotated and replaced with a credential helper or SSH.
- **`SUPABASE_ACCESS_TOKEN` in `.env` is stale** — management API returns
  "JWT could not be decoded".

---

## Restoring the site

The 503 is a billing state, not a code state. Credits must be added or the plan
upgraded in Netlify before any of this can be tested. Nothing in this commit
changes that.

Worth setting a **spend alert at 50%** of the allowance so the next overage
surfaces before it becomes an outage.

---

# Round 2 — same day, urgent

Round 1 shipped and its cache headers were **verified live**:

```
/site-videos/.../website-demo-reel.mp4  →  public,max-age=31536000,immutable  ✓
/site-videos/.../roman-army-painting.mp4 → public,max-age=31536000,immutable  ✓
/site-videos/.../adapt-or-die.mp4       →  public,max-age=31536000,immutable  ✓
/assets/index-*.js  (1.91 MB)           →  public,max-age=31536000,immutable  ✓
sourceMappingURL in bundle              →  gone  ✓
```

**But credits kept draining**, which tells us something important: caching only helps
*repeat* visitors. It does nothing for first-time visitors or for bots, which don't
keep caches at all. So Round 2 removes bytes outright rather than negotiating with
the browser.

Also confirmed live during Round 1 testing:

```
GET /wp-admin/setup-config.php  →  HTTP 200 + 270KB of index.html
```

The most-probed URL on the internet was returning a full page. To a scanner that
reads as a live WordPress install, which invites deeper probing.

## Changes

### `src/components/shared/Footer.jsx` — removed the global background video
`roman-army-painting.mp4` (1.47 MB) rendered at `opacity-20` behind a dark gradient —
almost invisible, but it downloaded on **every page of the site** because the footer
is global. Gradient alone is visually near-identical.

### `src/pages/Home.jsx` — removed two overlay-buried background videos
- `roman-army-painting.mp4` (1.47 MB) — sat behind `bg-black/90`, ~90% invisible
- `gallery-bg.mp4` (2.39 MB) — sat behind `bg-black/60`

Kept: the hero reel, and `handshake-landscape.mp4` (visible content, not a background).

### `src/components/shared/Hero.jsx` — mobile spared the 7.43 MB reel
Added `disableOnMobile={true}`. This is the shared hero used across many pages, so
it was the single largest automatic mobile payload site-wide.

### `public/_redirects` — 23 scanner-trap 404 rules
Added above the SPA fallback: `/wp-admin/*`, `/*.php`, `/.env`, `/.git/*`,
`/phpmyadmin/*`, `/*.sql`, `/*.map`, and similar.

Safe by construction — this is a React SPA, so none of these can ever be a real
client-side route.

| | Before | After |
|---|---:|---:|
| Junk URL response | 270 KB | **1.2 KB** |
| Per 1,000 scanner probes | 270 MB | **1.2 MB** |

### `public/robots.txt` — blocked 16 bulk scrapers
GPTBot, CCBot, Bytespider, ClaudeBot, PerplexityBot, Amazonbot, AhrefsBot,
SemrushBot, MJ12bot, DotBot and others, plus `Disallow` on the video directories.

**Googlebot, Bingbot and DuckDuckBot are deliberately NOT blocked** — those send real
traffic. Note that well-behaved bots honour this; malicious ones ignore it. The 404
rules above are what actually stops the bad ones.

## Cumulative effect

| Page | Before both rounds | After |
|---|---:|---:|
| Homepage, desktop | ~15.8 MB | **~9.6 MB** |
| Homepage, mobile | ~15.8 MB | **~2.2 MB** |
| Any other page, mobile | ~1.5 MB+ | **~0 MB video** |
| Junk/scanner URL | 270 KB | **1.2 KB** |
| Return visit (any page) | full re-download | **~0** (cached 1y) |

Build verified: `npm run build` → `✓ built in 1m 40s`.

## Still available if needed

| Task | Saves |
|---|---|
| `adapt-or-die.mp4` (23.5 MB) → YouTube | Biggest file, but already click-to-play only |
| Re-encode `website-demo-reel.mp4` 7.43 MB → ~2 MB | Per the existing PERF TODO |
| `handshake-landscape.mp4` (2.17 MB) → mobile-disable | Visible content, so it's a design call |
| Upload compressed videos to Supabase | See Round 1 notes re: storage limits |

---

# Round 3 — root cause confirmed, videos restored

## The actual numbers (Netlify usage breakdown, Aug 9 - Sep 8)

| Meter | Credits | Share |
|---|---:|---:|
| **Bandwidth** (243.41 GB) | **4,868.2** | **92%** |
| Web requests (1,635,858) | 327.2 | 6% |
| Production deploys (6) | 90 | 2% |
| Compute | 0.4 | ~0% |
| AI inference | 0 | 0% |
| **Total** | **5,285.7** | |

**This rules out almost everything that was suspected:**

- Functions/compute: **0.4 credits**. The 3s polling loops, background functions,
  `brain-*`, `agent_train-background` - all irrelevant.
- AI inference: **0 credits**. No agent (Hermes or otherwise) is consuming here.
- Database: 0.

## The real cause: 270 KB served for every junk URL

```
243.41 GB / 1,635,858 requests = ~152 KB average per request
```

152 KB average is enormous - a normal site averages 20-40 KB, since most requests
are small JS chunks and icons. The SPA shell is **270 KB**, and:

```
243.41 GB / 270 KB = ~900,000 requests
```

Roughly 900k requests receiving the full shell accounts for essentially the entire
bandwidth bill. And the request volume confirms who's asking:

```
1,635,858 requests / 13 days = ~126,000/day = ~87 every minute, 24/7
```

That is bot traffic, not people. Verified live earlier in the incident:

```
GET /wp-admin/setup-config.php  ->  HTTP 200 + 270 KB
```

**The scanner-trap 404 rules added in Round 2 are the fix for 92% of this bill.**
Junk URLs drop from 270 KB to 1.2 KB - roughly 243 GB down to ~1 GB.

## Correction: videos were never the main cause

Rounds 1 and 2 anchored on video weight because bandwidth spiked right after
`e3217ec` (2026-07-14) localised 50 MB of video. The timing was real but
misleading - the dominant cost is bot traffic hitting the SPA catch-all, not
visitors downloading videos.

**All video removals from Round 2 have been reverted.** Footer and both homepage
background videos are restored and unchanged.

## Also corrected

- The "6 functions deployed but not in the repo" finding was wrong. They are
  `.ts` files (`agent_train-background.ts`, `ai_invoke.ts`, `brain-*.ts`,
  `ingest_dispatch-background.ts`); an earlier count only globbed `*.js`.
  24 `.js` + 6 `.ts` = the 30 deployed. Nothing unaccounted for.
- `versionCheck.js` polls `/index.html` every 5 min but uses `method: 'HEAD'` -
  headers only, negligible bandwidth.
- A cancelled `ffmpeg` batch had partially re-encoded `roman-army-painting.mp4`
  (1.47 MB -> 0.95 MB) before being stopped. Restored from backup; `git status`
  confirms all four homepage videos byte-match the committed versions.

## This commit

- `Footer.jsx` - background video restored
- `Home.jsx` - both background videos restored
- `netlify.toml` - build `ignore` rule so docs-only commits skip the ~250s
  Playwright prerender build (deploys were 90 credits for 6 builds)

Retained from Round 1: media cache headers, `sourcemap: false`, and
`disableOnMobile` on the homepage hero (mobile shows the existing poster).
Retained from Round 2: scanner-trap 404s and `robots.txt` scraper blocking.

## Still recommended

1. **Branch deploys** - Site settings > Build & deploy. Any push to any of 10
   branches currently triggers a full build. Restrict to `v7-main-branch` + `dev`.
2. **Spend alert at 50%** so the next overage arrives as a warning, not an outage.
3. Netlify's billing banner notes *"credit consumption reporting may be delayed"* -
   observed real-time ticking is batch lag, not live spend.

---

# Round 4 — edge block for the stale-UA scraper (2026-08-22)

## What the user-agent report showed

| User agent | Requests | Bandwidth | Per request |
|---|---:|---:|---:|
| **Windows Chrome/117** | **680** | **544.02 MB** | **~800 KB** |
| Windows Chrome/131 | 533 | 9.66 MB | ~18 KB |
| iPhone Safari 13 | 1.8K | 32.29 MB | ~18 KB |
| ChatGPT-User | 1.5K | 32.6 MB | ~22 KB |

One client - Windows Chrome/117 - was ~37% of all bandwidth in the sample window,
at ~44x the bytes-per-request of current Chrome. That is media downloading, not
browsing. Chrome 117 shipped September 2023; a frozen desktop UA is the signature
of a scraper with a hardcoded string.

By category, bots were *cheap*: crawlers averaged 30 KB/request and AI agents
22 KB/request - they fetch HTML and leave, they don't play video. Browsers were
76% of bandwidth from 39% of requests. Netlify classifies this scraper as
"Browser", which is exactly why earlier rounds mis-attributed it to real visitors.

**robots.txt cannot stop this** - that only works on clients that choose to obey.

## `netlify/edge-functions/block-scrapers.js`

Returns 403 (~40 bytes) for video requests from Windows desktop Chrome below 120.

Three safety layers, because it runs on every request (`path = "/*"`):

1. **Fail-open.** Whole body wrapped in try/catch -> any error passes the request
   through untouched. Worst case is that the file does nothing; it cannot 500 the site.
2. **Narrow match.** Six pass-through returns vs one block. A request must be
   Windows + desktop Chrome + below 120 + asking for video before anything happens.
3. **Video only.** An earlier draft also blocked `/images/` and `/generated/` - that
   was wrong, since those are visible content and would have shown broken placeholders.
   Video degrades gracefully: every one is a muted decorative background behind an
   overlay with a poster image, the same fallback `FastVideo` already serves to mobile.

Allowlisted: Chrome-Lighthouse (Mission Control's PageSpeed Insights SEO reports),
Googlebot, Google-InspectionTool, bingbot, DuckDuckBot, Slackbot, facebookexternalhit,
Twitterbot, LinkedInBot, UptimeRobot, Better Uptime, Pingdom. Edge and Opera are
skipped explicitly since they embed `Chrome/NNN` in their UA.

## Limits

- The request still **reaches** Netlify, so the Web requests meter (327 of 5,286
  credits, ~6%) still applies. This kills the bandwidth (92%), not the knock.
- It matches on **user agent**. A scraper that changes its UA walks straight past.
  Cloudflare's Bot Fight Mode detects behaviour rather than labels and is the
  durable fix; this buys time.

## Revert

```
git revert <sha>          # undoes the whole commit
```
or delete `netlify/edge-functions/block-scrapers.js` and the `[[edge_functions]]`
block in `netlify.toml`.

## Mission Control ruled out

Checked `mammoth/mission-control`. It has no headless-browser dependency and no
`fetch()` to disruptorsmedia.com anywhere in source - it publishes by writing rows
directly to the main site's Supabase project. Its only indirect path is
`runSeoReport` -> Google PageSpeed Insights, but PSI's Lighthouse identifies as
Android mobile (`Chrome-Lighthouse`), not Windows desktop, and is allowlisted above.
It is not the source.
