import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function unpublishOldPosts() {
  console.log('🔄 Unpublishing older blog posts...\n');

  // Slugs of posts to unpublish
  const slugsToUnpublish = [
    'the-hidden-roi-of-content-creation-services-that-fortune-500-companies-dont-want-you-to-know',
    'why-smart-businesses-choose-a-podcasting-seo-agency-to-dominate-their-market',
    'how-a-360-marketing-agency-builds-revenue-streams-you-never-knew-existed',
    'the-power-of-systems-automations-for-creatives-who-want-more-time-to-create'
  ];

  for (const slug of slugsToUnpublish) {
    const { data, error } = await supabase
      .from('posts')
      .update({ is_published: false })
      .eq('slug', slug)
      .select('title');

    if (error) {
      console.error(`❌ Error unpublishing ${slug}:`, error);
    } else if (data && data.length > 0) {
      console.log(`✅ Unpublished: ${data[0].title}`);
    } else {
      console.log(`⚠️  Post not found: ${slug}`);
    }
  }

  console.log('\n🔍 Checking remaining published posts...\n');

  const { data: published, error: fetchError } = await supabase
    .from('posts')
    .select('title, slug')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ Error fetching published posts:', fetchError);
    return;
  }

  console.log(`✅ ${published.length} posts remain published:\n`);
  published.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
  });
}

unpublishOldPosts();
