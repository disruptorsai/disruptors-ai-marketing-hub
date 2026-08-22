/**
 * Rate limit on the HTML document only  (added 2026-08-22, bandwidth incident)
 *
 * WHY SCOPED TO "/" AND NOT "/*"
 * Measured traffic, one hour:
 *
 *   /            4,700 requests   269.72 MB     <- bots fetching HTML and leaving
 *   whole site   8,611 requests     1.6 GB
 *
 * If those 4,700 were real page loads the site total would be far higher, because
 * one real page load pulls ~46 resources (measured in Playwright). It isn't - the
 * heavy clients request the document and never fetch the assets.
 *
 * That difference is what makes this safe:
 *
 *   a person  hits "/" maybe 2-5x/min   (SPA navigation does not refetch it)
 *   a bot     hits "/" 16+x/min, endlessly
 *
 * A limit of 20/min on the document is invisible to a human and cuts the observed
 * pattern off. Note this could NOT be done on "/*": a real visitor needs 46 requests
 * for a single page, while the top offending IP averaged only ~16/min - so any
 * site-wide per-IP limit generous enough for humans would never catch these bots.
 *
 * Exceeding the limit returns HTTP 429 (a few bytes) instead of the ~57KB gzipped
 * document. Netlify allows 2 code-based rate-limit rules on this plan; this is one.
 *
 * TUNING: raise windowLimit if legitimate visitors report 429s. Netlify's own
 * guidance and general practice is to start generous and tighten using real logs.
 */

export default async (request, context) => {
  // No logic needed - the rate limit lives in `config` and is enforced by the edge
  // before this runs. Pass everything through untouched.
  return context.next();
};

export const config = {
  path: "/",
  rateLimit: {
    windowLimit: 20,      // requests...
    windowSize: 60,       // ...per 60 seconds
    aggregateBy: ["ip", "domain"],   // per visitor IP, per domain
  },
};
