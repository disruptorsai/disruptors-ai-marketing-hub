import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogImages() {
  console.log('🔍 Checking blog post images...\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image, is_published')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching posts:', error);
    return;
  }

  console.log(`Found ${posts.length} published posts:\n`);

  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Featured Image: ${post.featured_image || '❌ NULL/EMPTY'}`);
    console.log('');
  });
}

checkBlogImages();
