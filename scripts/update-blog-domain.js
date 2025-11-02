import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

/**
 * Update all blog content to replace dm4.wjwelsh.com with disruptorsmedia.com
 */

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function updateBlogDomains() {
  console.log('\n🔄 Updating blog domains from dm4.wjwelsh.com to disruptorsmedia.com\n');

  // Fetch all published blogs
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, slug, title, content')
    .eq('is_published', true);

  if (fetchError) {
    console.error('❌ Error fetching posts:', fetchError);
    process.exit(1);
  }

  console.log(`📚 Found ${posts.length} published blog(s)\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const post of posts) {
    const hasDM4 = post.content?.includes('dm4.wjwelsh.com');

    if (!hasDM4) {
      console.log(`⏭️  SKIP: ${post.title}`);
      console.log(`   No dm4 links found\n`);
      skippedCount++;
      continue;
    }

    console.log(`🔧 UPDATING: ${post.title}`);
    console.log(`   Slug: ${post.slug}`);

    // Replace all instances of dm4.wjwelsh.com with disruptorsmedia.com
    const updatedContent = post.content.replace(/dm4\.wjwelsh\.com/g, 'disruptorsmedia.com');

    // Count replacements
    const originalMatches = (post.content.match(/dm4\.wjwelsh\.com/g) || []).length;
    console.log(`   Replaced ${originalMatches} instance(s)`);

    // Update the post
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (updateError) {
      console.error(`   ❌ Error updating: ${updateError.message}\n`);
      continue;
    }

    console.log(`   ✅ Successfully updated\n`);
    updatedCount++;
  }

  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`Total blogs: ${posts.length}`);
  console.log(`✅ Updated: ${updatedCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log('\n✨ Domain update complete!\n');
}

updateBlogDomains();
