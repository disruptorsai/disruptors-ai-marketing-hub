import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('title, slug, is_published, published_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Current posts status:\n');
    data.forEach((post, i) => {
      console.log(`${i+1}. ${post.title}`);
      console.log(`   Published: ${post.is_published ? 'YES' : 'NO'}`);
      console.log(`   Publish Date: ${post.published_at || 'Not set'}`);
      console.log('');
    });

    const publishedCount = data.filter(p => p.is_published).length;
    console.log(`\nSummary: ${publishedCount} published / ${data.length} total posts`);
  }
})();
