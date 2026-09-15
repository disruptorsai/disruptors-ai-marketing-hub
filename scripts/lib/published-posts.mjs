/**
 * Fetch published blog posts (slug + dates) from Supabase for build-time scripts
 * (sitemap generation now; the prerender can reuse it).
 *
 * Uses the public anon key over the REST API; RLS exposes exactly the published posts.
 * Non-fatal by design: if env vars are missing or the request fails, it logs a warning and
 * returns [] so a Supabase outage never blocks a deploy.
 */
export async function fetchPublishedPosts() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[posts] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — skipping blog posts.');
    return [];
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/posts?select=slug,published_at,updated_at,created_at&is_published=eq.true&order=published_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    const posts = rows.filter((p) => p.slug);
    console.log(`[posts] ${posts.length} published blog post(s) from Supabase.`);
    return posts;
  } catch (err) {
    console.warn(`[posts] blog fetch failed (${err.message}) — skipping blog posts.`);
    return [];
  }
}
