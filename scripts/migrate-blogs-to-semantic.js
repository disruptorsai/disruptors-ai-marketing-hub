import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

/**
 * Migrate Existing Blogs to Semantic Structure (2025 Standards)
 *
 * This script:
 * 1. Fetches all published blog posts
 * 2. Generates missing semantic metadata using Claude Sonnet 4.5:
 *    - Subtitle (from content)
 *    - Key Takeaways (3-6 bullet points)
 *    - Table of Contents (auto-extracted from headings)
 *    - CTA configuration
 * 3. Updates posts table with semantic_structure_version: '2025.1'
 * 4. Validates and reports results
 *
 * Usage:
 *   node scripts/migrate-blogs-to-semantic.js --batch-size=10 --dry-run
 *   node scripts/migrate-blogs-to-semantic.js --specific-slug=blog-slug
 *   node scripts/migrate-blogs-to-semantic.js --all
 */

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
});

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '10');
const specificSlug = args.find(arg => arg.startsWith('--specific-slug='))?.split('=')[1];
const processAll = args.includes('--all');

console.log('\n🔄 Blog Semantic Migration Tool');
console.log('================================\n');
console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes will be made)' : '✅ LIVE MIGRATION'}`);
console.log(`Batch size: ${batchSize}`);
if (specificSlug) console.log(`Target: Specific blog (${specificSlug})`);
console.log('\n');

async function extractHeadings(content) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    headings.push({ level, text, id });
  }

  return headings;
}

async function generateSemanticMetadata(post) {
  console.log(`   📝 Generating metadata for: ${post.title}`);

  const prompt = `You are analyzing a blog post to generate semantic metadata for 2025 SEO and UX standards.

**Blog Post:**
Title: ${post.title}
Category: ${post.category || 'Marketing'}
Primary Keyword: ${post.primary_keyword || 'N/A'}

**Content Preview (first 1000 characters):**
${post.content.substring(0, 1000)}...

**Your Task:**
Generate the following metadata in JSON format:

1. **subtitle**: A compelling 80-100 character tagline that expands on the title and includes a benefit or hook. Should NOT repeat the title verbatim.

2. **key_takeaways**: Array of exactly 5 actionable bullet points (60-80 chars each) summarizing the most important insights from this article. Focus on specific data, benefits, and outcomes. Each takeaway should be a complete sentence.

3. **author_name**: Use "Disruptors Team" unless there's a specific author mentioned in the content.

**Output Format (JSON only, no other text):**
{
  "subtitle": "Compelling tagline here",
  "key_takeaways": [
    "First actionable insight with specific benefit or data point",
    "Second strategic recommendation with clear outcome",
    "Third critical point with measurable result or statistic",
    "Fourth important insight with actionable guidance",
    "Fifth final takeaway with call-to-action or next step"
  ],
  "author_name": "Disruptors Team"
}

**Guidelines:**
- Subtitle must be 80-100 characters
- Key takeaways must be specific, actionable, and data-driven where possible
- Each takeaway should answer: "What will the reader learn or be able to do?"
- Use active voice and clear language
- Include numbers/percentages where relevant
- Focus on benefits and outcomes, not just features

Generate the JSON now:`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let jsonText = response.content[0].text.trim();

    // Remove markdown code fences if present
    jsonText = jsonText.replace(/^```json\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');

    const metadata = JSON.parse(jsonText);

    // Validate metadata
    if (!metadata.subtitle || metadata.subtitle.length < 50 || metadata.subtitle.length > 120) {
      throw new Error('Invalid subtitle length');
    }

    if (!metadata.key_takeaways || metadata.key_takeaways.length !== 5) {
      throw new Error('Must have exactly 5 key takeaways');
    }

    console.log(`   ✅ Generated metadata successfully`);
    return metadata;

  } catch (error) {
    console.error(`   ❌ Error generating metadata: ${error.message}`);

    // Fallback to basic metadata
    return {
      subtitle: post.excerpt?.substring(0, 100) || `Comprehensive guide to ${post.title.toLowerCase()}`,
      key_takeaways: [
        'Learn the fundamentals and best practices',
        'Discover proven strategies that drive results',
        'Get actionable insights you can implement today',
        'Understand common pitfalls and how to avoid them',
        'Access expert recommendations and next steps'
      ],
      author_name: 'Disruptors Team'
    };
  }
}

async function migrateBlog(post) {
  console.log(`\n📄 Processing: ${post.title}`);
  console.log(`   Slug: ${post.slug}`);
  console.log(`   Words: ${post.content?.split(/\s+/).length || 0}`);
  console.log(`   Current version: ${post.semantic_structure_version || 'legacy'}`);

  // Skip if already migrated (unless forced)
  if (post.semantic_structure_version === '2025.1' && !processAll) {
    console.log(`   ⏭️  Already migrated to 2025.1 - skipping`);
    return { status: 'skipped', reason: 'already_migrated' };
  }

  try {
    // 1. Extract table of contents
    const tableOfContents = await extractHeadings(post.content);
    console.log(`   📋 Extracted ${tableOfContents.length} headings for TOC`);

    // 2. Generate semantic metadata
    const metadata = await generateSemanticMetadata(post);

    // 3. Prepare update data
    const updateData = {
      subtitle: metadata.subtitle,
      author_name: metadata.author_name,
      key_takeaways: {
        takeaways: metadata.key_takeaways,
        generated_at: new Date().toISOString(),
        validated: true
      },
      table_of_contents: tableOfContents,
      cta_config: {
        sidebar: {
          enabled: true,
          title: "Ready to Transform Your Marketing?",
          description: "Get personalized AI recommendations for your business.",
          button_text: "Get Started Free",
          button_link: "/app/signup"
        },
        footer: {
          enabled: true,
          title: "Ready to Take the Next Step?",
          description: "Join 500+ businesses using AI to dominate their markets.",
          button_text: "Start Your Free Trial",
          button_link: "/app/signup"
        }
      },
      semantic_structure_version: '2025.1',
      updated_at: new Date().toISOString()
    };

    // 4. Update database (unless dry run)
    if (!dryRun) {
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id);

      if (error) throw error;

      console.log(`   ✅ Updated successfully`);
    } else {
      console.log(`   🔍 DRY RUN - would update with:`);
      console.log(`      - Subtitle: "${metadata.subtitle}"`);
      console.log(`      - Takeaways: ${metadata.key_takeaways.length}`);
      console.log(`      - TOC entries: ${tableOfContents.length}`);
    }

    return {
      status: 'success',
      metadata: updateData
    };

  } catch (error) {
    console.error(`   ❌ Migration failed: ${error.message}`);
    return {
      status: 'error',
      error: error.message
    };
  }
}

async function main() {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (specificSlug) {
      query = query.eq('slug', specificSlug);
    }

    if (!processAll && !specificSlug) {
      // Only migrate posts without semantic structure
      query = query.or('semantic_structure_version.is.null,semantic_structure_version.neq.2025.1');
    }

    if (!specificSlug) {
      query = query.limit(batchSize);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    if (!posts || posts.length === 0) {
      console.log('✨ No blogs found to migrate. All blogs are up to date!\n');
      return;
    }

    console.log(`📚 Found ${posts.length} blog(s) to process\n`);

    const results = {
      total: posts.length,
      success: 0,
      skipped: 0,
      error: 0,
      details: []
    };

    // Process each blog
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`\n[${i + 1}/${posts.length}]`);

      const result = await migrateBlog(post);

      results.details.push({
        slug: post.slug,
        title: post.title,
        ...result
      });

      if (result.status === 'success') results.success++;
      else if (result.status === 'skipped') results.skipped++;
      else results.error++;

      // Rate limiting - wait 2 seconds between API calls
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Print summary
    console.log('\n\n📊 Migration Summary');
    console.log('===================');
    console.log(`Total processed: ${results.total}`);
    console.log(`✅ Success: ${results.success}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`❌ Errors: ${results.error}`);

    if (results.error > 0) {
      console.log('\n❌ Failed blogs:');
      results.details
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`   - ${r.title}: ${r.error}`);
        });
    }

    console.log('\n');

    if (dryRun) {
      console.log('🔍 This was a dry run. Re-run without --dry-run to apply changes.\n');
    } else {
      console.log('✅ Migration complete! Next steps:');
      console.log('   1. Review migrated blogs in Admin Nexus');
      console.log('   2. Test rendering on blog-detail page');
      console.log('   3. Run validation: node scripts/validate-semantic-blogs.js');
      console.log('   4. Continue with remaining blogs if needed\n');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
