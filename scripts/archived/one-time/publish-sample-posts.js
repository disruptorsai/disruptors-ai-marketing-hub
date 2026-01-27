import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('📝 Publishing sample blog posts...\n');

  // Get posts to publish (skip the error post)
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, title, slug')
    .order('created_at', { ascending: false })
    .limit(6); // Get first 6 posts

  if (fetchError) {
    console.error('Error fetching posts:', fetchError);
    return;
  }

  // Filter out the error post
  const postsToPublish = posts.filter(p =>
    !p.title.includes("I need you to provide")
  );

  let successCount = 0;
  const today = new Date();

  for (let i = 0; i < postsToPublish.length; i++) {
    const post = postsToPublish[i];

    // Stagger publish dates: today, -3 days, -6 days, etc.
    const publishDate = new Date(today);
    publishDate.setDate(today.getDate() - (i * 3));

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        is_published: true,
        published_at: publishDate.toISOString()
      })
      .eq('id', post.id);

    if (updateError) {
      console.error(`❌ Error publishing "${post.title}":`, updateError.message);
    } else {
      console.log(`✅ Published: "${post.title}"`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Publish Date: ${publishDate.toLocaleDateString()}\n`);
      successCount++;
    }
  }

  console.log(`\n📊 Summary: Published ${successCount} out of ${postsToPublish.length} posts`);
  console.log(`\n🌐 Visit http://localhost:5173/blog to see them live!`);
})();
