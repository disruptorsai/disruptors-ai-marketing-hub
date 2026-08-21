/**
 * Edge-level scraper block  (added 2026-08-22, bandwidth incident)
 *
 * WHY THIS EXISTS
 * Netlify's user-agent report showed one client responsible for ~37% of bandwidth:
 *
 *   (Windows NT 10; Win64; x64) Chrome/117    680 requests   544.02 MB   (~800 KB/req)
 *   (Windows NT 10; Win64; x64) Chrome/131    533 requests     9.66 MB   (~18 KB/req)
 *
 * Same OS, same browser family, similar request counts - but Chrome/117 pulls ~44x
 * more per request. That is media downloading, not browsing. Chrome 117 shipped
 * September 2023; a frozen desktop UA is the signature of a scraper with a hardcoded
 * string. It identifies as a browser, so robots.txt cannot touch it.
 *
 * SAFETY MODEL - three layers, because this runs on EVERY request (path "/*"):
 *
 *   1. FAIL-OPEN. The whole body is wrapped in try/catch. Any error at all and the
 *      request passes straight to the origin. The worst case for this file is that
 *      it silently does nothing - it can never 500 the site.
 *   2. NARROW MATCH. Five separate early-returns pass traffic through untouched.
 *      A request must be Windows + desktop Chrome + below MIN_CHROME + asking for a
 *      video before anything is blocked.
 *   3. VIDEO ONLY. Images, icons, HTML, JS and CSS are never blocked. Every video
 *      here is a muted decorative background behind an overlay, and each has a poster
 *      image that renders in its place - the same path FastVideo already uses on
 *      mobile and slow connections. Degrades to a still image, nothing breaks.
 *
 * To harden into a full block: BLOCK_ALL_PATHS = true.
 * To disable: delete this file and the [[edge_functions]] block in netlify.toml.
 */

// Chrome builds older than this are treated as stale. Chrome 117 = Sept 2023.
// 120 is deliberately conservative; Chrome force-updates well past this.
const MIN_CHROME = 120;

// false = block only video (recommended). true = block every path.
const BLOCK_ALL_PATHS = false;

// VIDEO ONLY - deliberately narrow.
// An earlier draft also listed /images/ and /generated/. That was wrong: those are
// visible content, and blocking them would leave a real (if rare) old-browser user
// staring at broken image placeholders. Blocking video degrades gracefully because
// every one of these has a poster. Blocking images does not.
const MEDIA_PREFIXES = [
  "/site-videos/",
  "/site-assets/videos/",
  "/videos/",
];

// Known-good automation we must not break: search engines, link previews, uptime
// checks, and Google's Lighthouse runner (PageSpeed Insights - which Mission Control
// calls for its SEO reports).
const ALLOW_SUBSTRINGS = [
  "Chrome-Lighthouse",
  "Googlebot",
  "Google-InspectionTool",
  "bingbot",
  "DuckDuckBot",
  "Slackbot",
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "UptimeRobot",
  "Better Uptime",
  "Pingdom",
];

export default async (request, context) => {
  try {
    return decide(request, context);
  } catch {
    // Layer 1: anything unexpected -> serve normally.
    return context.next();
  }
};

function decide(request, context) {
  const ua = request.headers.get("user-agent") || "";

  // Allowlisted automation.
  for (const ok of ALLOW_SUBSTRINGS) {
    if (ua.includes(ok)) return context.next();
  }

  // Only Windows desktop Chrome is in scope. Phones, Mac, Safari, Firefox: untouched.
  const isWindowsDesktop = ua.includes("Windows NT");
  const chrome = ua.match(/Chrome\/(\d+)/);
  if (!isWindowsDesktop || !chrome) return context.next();

  // Edge and Opera embed "Chrome/NNN" too. Don't judge them by it.
  if (ua.includes("Edg/") || ua.includes("OPR/")) return context.next();

  const major = parseInt(chrome[1], 10);
  if (!Number.isFinite(major) || major >= MIN_CHROME) return context.next();

  // Stale Chrome from here down.
  const path = new URL(request.url).pathname;
  const isMedia = MEDIA_PREFIXES.some((p) => path.startsWith(p));
  if (!BLOCK_ALL_PATHS && !isMedia) return context.next();

  // ~40 bytes instead of up to 23.5 MB.
  return new Response("Forbidden\n", {
    status: 403,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-blocked-reason": "stale-chrome-" + major,
    },
  });
}

export const config = { path: "/*" };
