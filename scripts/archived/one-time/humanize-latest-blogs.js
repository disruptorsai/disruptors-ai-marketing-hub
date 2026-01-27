/**
 * Humanize Latest Blog Posts
 *
 * Fetches the 3 latest blog posts and humanizes them using the multi-provider system
 */

import { createClient } from '@supabase/supabase-js';
import { humanizeBlogPost } from '../netlify/functions/shared/humanize-text.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const POST_IDS = [
  'a1c9675a-c53b-4296-a593-98f7d508c25f', // AI-Powered Social Media Management
  '60cd6fe9-23d3-4795-8922-b1c500b77831', // How to Use AI for Local SEO
  'e8efb6c1-4862-4945-a3cf-4a9ef90067dd'  // Zero to Hero: Building an AI-First Marketing System
];

async function humanizeLatestBlogs() {
  console.log('🚀 Humanizing 3 Latest Blog Posts');
  console.log('=' .repeat(70));
  console.log(`Started: ${new Date().toISOString()}\n`);

  let totalCost = 0;
  const results = [];

  for (let i = 0; i < POST_IDS.length; i++) {
    const postId = POST_IDS[i];
    console.log(`\n[$${i + 1}/3] Processing post ${postId}...`);
    console.log('-' .repeat(70));

    try {
      // Fetch post
      const { data: post, error } = await supabase
        .from('posts')
        .select('id, title, slug, content')
        .eq('id', postId)
        .single();

      if (error || !post) {
        console.error(`❌ Failed to fetch post: ${error?.message || 'Not found'}`);
        results.push({ postId, success: false, error: error?.message });
        continue;
      }

      console.log(`📄 Title: "${post.title}"`);
      console.log(`📏 Content: ${post.content.length} chars`);
      console.log(`🔗 Slug: ${post.slug}\n`);

      // Humanize the post
      console.log('🤖 Humanizing content with Claude Sonnet 4.5...');
      const startTime = Date.now();

      const result = await humanizeBlogPost(post.content, {
        preferredProvider: 'claude'  // Use Claude Sonnet 4.5 for actual humanization
      });

      const duration = Date.now() - startTime;

      if (!result.success) {
        console.error(`❌ Humanization failed: ${result.error || 'Unknown error'}`);
        results.push({ postId, success: false, error: result.error });
        continue;
      }

      console.log(`✅ Humanization successful!`);
      console.log(`   Sections processed: ${result.sectionsProcessed}`);
      console.log(`   Original length: ${result.originalContent.length} chars`);
      console.log(`   Humanized length: ${result.humanizedContent.length} chars`);
      console.log(`   Difference: ${result.humanizedContent.length - result.originalContent.length} chars`);
      console.log(`   Cost: $${result.totalCost.toFixed(4)}`);
      console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);

      totalCost += result.totalCost;

      // Save to database
      console.log('\n💾 Saving humanized content to database...');

      const { error: updateError } = await supabase
        .from('posts')
        .update({
          content: result.humanizedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (updateError) {
        console.error(`❌ Failed to save: ${updateError.message}`);
        results.push({
          postId,
          success: false,
          error: updateError.message,
          humanized: true
        });
        continue;
      }

      console.log(`✅ Saved to database!`);

      results.push({
        postId,
        title: post.title,
        success: true,
        sectionsProcessed: result.sectionsProcessed,
        originalLength: result.originalContent.length,
        humanizedLength: result.humanizedContent.length,
        cost: result.totalCost,
        duration: duration
      });

      // Rate limiting: wait 3 seconds between posts
      if (i < POST_IDS.length - 1) {
        console.log('\n⏳ Waiting 3 seconds before next post...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`❌ Unexpected error: ${error.message}`);
      results.push({ postId, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log('📊 HUMANIZATION SUMMARY');
  console.log('=' .repeat(70));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);

  if (successful.length > 0) {
    console.log('\n✅ Successfully humanized posts:');
    successful.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.title}`);
      console.log(`      Sections: ${r.sectionsProcessed}, Cost: $${r.cost.toFixed(4)}, Duration: ${(r.duration / 1000).toFixed(2)}s`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed posts:');
    failed.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.postId}`);
      console.log(`      Error: ${r.error}`);
    });
  }

  console.log('\n' + '=' .repeat(70));
  console.log(`Completed: ${new Date().toISOString()}`);
  console.log('=' .repeat(70) + '\n');
}

// Run the humanization
humanizeLatestBlogs().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
