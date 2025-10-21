/**
 * Batch Blog Regeneration Script
 *
 * Regenerates multiple existing blog posts using the updated prompts with Blog Content Standards.
 *
 * Features:
 * - Regenerate by blog IDs, slugs, or audit score threshold
 * - Dry-run mode to preview without making changes
 * - Progress tracking during batch processing
 * - Automatic backup of original content
 * - Rate limiting to avoid API throttling
 * - Summary report of regenerated blogs
 *
 * Usage:
 *   # Regenerate specific blogs by slug
 *   node scripts/batch-regenerate-blogs.js --slugs "blog-1,blog-2,blog-3"
 *
 *   # Regenerate all blogs with audit score < 60
 *   node scripts/batch-regenerate-blogs.js --score-threshold 60
 *
 *   # Regenerate all blogs (use with caution!)
 *   node scripts/batch-regenerate-blogs.js --all
 *
 *   # Dry-run mode (preview only, no changes)
 *   node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run
 *
 *   # Custom delay between regenerations (default: 3000ms)
 *   node scripts/batch-regenerate-blogs.js --all --delay 5000
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error('❌ Missing VITE_ANTHROPIC_API_KEY - required for blog generation');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Enhanced system prompt aligned with BLOG_CONTENT_STANDARDS.md
const BLOG_SYSTEM_PROMPT = `Role: You are a top-performing SEO strategist and educator. Write epic, original blog posts that are practical, easy to follow, and consistently optimized for search and generative engines.

Core Output Requirements:
- Write at least 1,200 words in narrative, skimmable, conversational style with H1/H2/H3 formatting
- Output complete Markdown ONLY - no code fences, no backticks, no meta commentary. Start directly with the H1 title
- Optimize for {{PRIMARY_KEYWORD}} and support with {{SECONDARY_KEYWORD}}
- Include {{PRIMARY_KEYWORD}} in the H1 title naturally and again within the first 150 words
- Begin with one strong hook in the opening paragraph (story, problem, myth vs. reality, or quick scenario)
- Add 1–2 internal links to relevant pages within {{TARGET_URL}} using descriptive anchor text
- Add 1–2 external links to reputable, authoritative sources near key claims
- Include exactly 5 FAQs using ### heading level for each question, driven by real user search intent
- End with a short CTA line (one sentence) after the FAQ section
- Tone: Disruptors & Co — bold, attention-grabbing, no fluff, occasionally contrarian
- Audience: non-experts in skilled trades and service businesses
- Reading level: roughly 12th grade. Use plain English and define jargon briefly on first use
- Paragraph Structure: Mostly 2-4 sentences with occasional shorter lines for rhythm

Hard Style Rules (must follow strictly):
- Do not use em dashes (use commas or parentheses instead)
- Use no more than two lists total (bulleted or numbered, each 3-7 items)
- Do not use first-person language unless specified
- Do not use typical blog headings like "Introduction" or "Conclusion" - write natural, descriptive headings
- Output Markdown only - no code fences (\`\`\`), no backticks around the article, no preface text
- Do not include tables with long sentences - avoid tables unless truly necessary
- Use bold/italics sparingly to emphasize key ideas - avoid over-formatting

Article Structure:
1. H1: {{TITLE}}
2. H2: Answer Box — 3–5 sentence direct answer for {{PRIMARY_KEYWORD}}
3. Key Facts mini-table or brief list
4. H2: Core Strategy (mapped to search intent)
   - H3: Step-by-Step Process
   - H3: Tools & Setup (Ahrefs-focused)
   - H3: Troubleshooting & Edge Cases
5. H2: Local SEO Block (if {{PRIMARY_LOCATION}} provided)
6. H2: Measurement Plan (3 KPIs)
7. H2: FAQs
   - ### Question 1 (using ### heading - based on real search intent)
   - ### Question 2
   - ### Question 3
   - ### Question 4
   - ### Question 5
   - [Short one-sentence CTA after FAQs]
8. H2: Schema Hint (which types to implement)

Final Output Format:
- The article must be self-contained, well-organized, and ready to publish as-is
- Output pure Markdown starting with the H1 title - no code fences, no backticks, no explanatory text
- Ensure complete with all required sections and meets the 1,200+ word minimum
- Structure naturally flows from opening hook to FAQ section to final CTA line

Write compelling, original, SEO-optimized content that ranks well and engages readers.`;

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    slugs: null,
    ids: null,
    scoreThreshold: null,
    all: false,
    dryRun: false,
    delay: 3000, // Default 3 second delay between regenerations
    skipBackup: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--slugs' && args[i + 1]) {
      options.slugs = args[i + 1].split(',').map(s => s.trim());
      i++;
    } else if (arg === '--ids' && args[i + 1]) {
      options.ids = args[i + 1].split(',').map(s => s.trim());
      i++;
    } else if (arg === '--score-threshold' && args[i + 1]) {
      options.scoreThreshold = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--delay' && args[i + 1]) {
      options.delay = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--skip-backup') {
      options.skipBackup = true;
    }
  }

  return options;
}

/**
 * Analyze a blog post for audit score (simplified version of audit script)
 */
function getAuditScore(post) {
  let score = 100;

  // Word count
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  if (wordCount < 1200) score -= 20;

  // FAQ section
  const hasFAQ = /##?\s+(FAQ|Frequently Asked Questions|Common Questions)/i.test(post.content || '');
  if (!hasFAQ) score -= 15;

  // Em dashes
  const emDashCount = (post.content || '').match(/—/g)?.length || 0;
  if (emDashCount > 0) score -= 10;

  // Lists (rough estimate)
  const listBlocks = (post.content || '').split(/\n\n+/);
  const actualLists = listBlocks.filter(block => /^[\s]*[-*+\d.]\s+/m.test(block)).length;
  if (actualLists > 2) score -= 10;

  // H1 heading
  const h1Count = (post.content || '').match(/^#\s+/gm)?.length || 0;
  if (h1Count === 0) score -= 15;
  else if (h1Count > 1) score -= 5;

  // Generic headings
  if (/(introduction|conclusion|summary|final thoughts)/i.test(post.content || '')) {
    score -= 8;
  }

  return Math.max(0, score);
}

/**
 * Generate blog article with new standards
 */
async function generateBlogArticle({ title, primaryKeyword, secondaryKeyword, targetUrl = 'https://dm4.wjwelsh.com', primaryLocation = '' }) {
  const customizedPrompt = BLOG_SYSTEM_PROMPT
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{PRIMARY_KEYWORD\}\}/g, primaryKeyword)
    .replace(/\{\{SECONDARY_KEYWORD\}\}/g, secondaryKeyword)
    .replace(/\{\{TARGET_URL\}\}/g, targetUrl)
    .replace(/\{\{PRIMARY_LOCATION\}\}/g, primaryLocation);

  const userPrompt = `Write a complete blog article with the following details:

Title: ${title}
Primary Keyword: ${primaryKeyword}
Secondary Keyword: ${secondaryKeyword}
Target URL for internal links: ${targetUrl}
${primaryLocation ? `Primary Location: ${primaryLocation}` : ''}

Write the article now following all requirements.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: customizedPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return message.content[0].text;
}

/**
 * Create backup of original content
 */
async function backupBlogContent(post) {
  const backupData = {
    post_id: post.id,
    original_content: post.content,
    original_title: post.title,
    original_excerpt: post.excerpt,
    original_word_count: post.content ? post.content.split(/\s+/).length : 0,
    backed_up_at: new Date().toISOString(),
    backup_reason: 'batch_regeneration'
  };

  // Create backups table entry
  const { error } = await supabase
    .from('blog_content_backups')
    .insert(backupData);

  if (error && error.code !== '42P01') { // Ignore "table doesn't exist" error
    console.warn(`   ⚠️  Backup warning: ${error.message}`);
  }
}

/**
 * Regenerate a single blog post
 */
async function regenerateBlog(post, options) {
  try {
    console.log(`\n📝 Regenerating: "${post.title}"`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Current word count: ${post.content ? post.content.split(/\s+/).length : 0}`);

    if (options.dryRun) {
      console.log('   🔍 DRY-RUN: Skipping actual regeneration');
      return { success: true, dryRun: true };
    }

    // Extract keywords
    const keywords = post.seo_keywords || post.tags || [];
    const keywordArray = Array.isArray(keywords) ? keywords : typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : [];
    const primaryKeyword = keywordArray[0] || post.primary_keyword || post.title;
    const secondaryKeyword = keywordArray[1] || keywordArray[0] || post.category;

    console.log(`   🎯 Keywords: ${primaryKeyword}, ${secondaryKeyword}`);

    // Backup original content
    if (!options.skipBackup) {
      console.log('   💾 Creating backup...');
      await backupBlogContent(post);
    }

    // Generate new content
    console.log('   🤖 Generating new content with Claude Sonnet 4.5...');
    const content = await generateBlogArticle({
      title: post.title,
      primaryKeyword,
      secondaryKeyword,
      targetUrl: 'https://dm4.wjwelsh.com',
      primaryLocation: post.location || ''
    });

    // Calculate new stats
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    const excerpt = content.substring(0, 200).replace(/<[^>]*>/g, '').replace(/^#\s+.+\n+/, '') + '...';

    console.log(`   📊 New word count: ${wordCount} words`);

    // Update blog in database
    console.log('   💾 Updating database...');
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content,
        excerpt,
        read_time_minutes: readTime,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
        generation_metadata: {
          ...post.generation_metadata,
          regenerated_by: 'batch-regeneration-script',
          regenerated_at: new Date().toISOString(),
          model: 'claude-sonnet-4-20250514',
          word_count: wordCount,
          primary_keyword: primaryKeyword,
          secondary_keyword: secondaryKeyword,
          standards_version: '1.0.0'
        }
      })
      .eq('id', post.id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('   ✅ Successfully regenerated!');

    return {
      success: true,
      postId: post.id,
      title: post.title,
      slug: post.slug,
      oldWordCount: post.content ? post.content.split(/\s+/).length : 0,
      newWordCount: wordCount
    };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      postId: post.id,
      title: post.title,
      slug: post.slug,
      error: error.message
    };
  }
}

/**
 * Ask for user confirmation
 */
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Main batch regeneration function
 */
async function batchRegenerateBlogs() {
  console.log('🔄 Batch Blog Regeneration Script\n');
  console.log('Using updated prompts aligned with BLOG_CONTENT_STANDARDS.md\n');
  console.log('═'.repeat(80) + '\n');

  const options = parseArgs();

  // Validate options
  const hasSelection = options.slugs || options.ids || options.scoreThreshold !== null || options.all;
  if (!hasSelection) {
    console.error('❌ Error: Must specify which blogs to regenerate\n');
    console.log('Usage examples:');
    console.log('  node scripts/batch-regenerate-blogs.js --slugs "blog-1,blog-2"');
    console.log('  node scripts/batch-regenerate-blogs.js --score-threshold 60');
    console.log('  node scripts/batch-regenerate-blogs.js --all');
    console.log('\nOptions:');
    console.log('  --slugs <slug1,slug2>       Regenerate specific blogs by slug');
    console.log('  --ids <id1,id2>             Regenerate specific blogs by ID');
    console.log('  --score-threshold <score>   Regenerate blogs with audit score < threshold');
    console.log('  --all                       Regenerate ALL published blogs (use with caution)');
    console.log('  --dry-run                   Preview without making changes');
    console.log('  --delay <ms>                Delay between regenerations (default: 3000ms)');
    console.log('  --skip-backup               Skip creating backups');
    process.exit(1);
  }

  try {
    // Fetch blogs to regenerate
    let query = supabase.from('posts').select('*').eq('is_published', true);

    if (options.slugs) {
      query = query.in('slug', options.slugs);
    } else if (options.ids) {
      query = query.in('id', options.ids);
    }
    // else options.all or options.scoreThreshold will get all published blogs

    const { data: posts, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    if (!posts || posts.length === 0) {
      console.log('ℹ️  No published blog posts found matching criteria.\n');
      return;
    }

    // Filter by score threshold if specified
    let postsToRegenerate = posts;
    if (options.scoreThreshold !== null) {
      postsToRegenerate = posts.filter(post => {
        const score = getAuditScore(post);
        return score < options.scoreThreshold;
      });

      console.log(`📊 Score Threshold Filter: ${options.scoreThreshold}`);
      console.log(`   Found ${posts.length} published blogs`);
      console.log(`   ${postsToRegenerate.length} blogs have score < ${options.scoreThreshold}\n`);
    }

    if (postsToRegenerate.length === 0) {
      console.log('✅ No blogs need regeneration!\n');
      return;
    }

    // Display summary
    console.log(`📋 Blogs to Regenerate: ${postsToRegenerate.length}\n`);
    postsToRegenerate.forEach((post, index) => {
      const score = getAuditScore(post);
      const wordCount = post.content ? post.content.split(/\s+/).length : 0;
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Score: ${score}/100, Word Count: ${wordCount}`);
    });
    console.log('');

    if (options.dryRun) {
      console.log('🔍 DRY-RUN MODE: No changes will be made\n');
    } else {
      console.log('⚠️  WARNING: This will regenerate blog content and REPLACE existing content');
      if (!options.skipBackup) {
        console.log('   Backups will be created before regeneration');
      }
      console.log('');
    }

    // Ask for confirmation
    if (!options.dryRun) {
      const confirmed = await askConfirmation(`Proceed with regenerating ${postsToRegenerate.length} blog(s)? (y/n): `);
      if (!confirmed) {
        console.log('\n❌ Regeneration cancelled by user\n');
        return;
      }
      console.log('');
    }

    // Regenerate blogs
    console.log('🚀 Starting batch regeneration...\n');
    console.log('═'.repeat(80));

    const results = [];

    for (let i = 0; i < postsToRegenerate.length; i++) {
      const post = postsToRegenerate[i];

      console.log(`\n[${i + 1}/${postsToRegenerate.length}]`);

      const result = await regenerateBlog(post, options);
      results.push(result);

      // Rate limiting delay (except for last item)
      if (i < postsToRegenerate.length - 1 && !options.dryRun) {
        console.log(`   ⏱️  Waiting ${options.delay}ms before next regeneration...`);
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 REGENERATION SUMMARY\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Total Blogs Processed:  ${results.length}`);
    console.log(`Successful:             ${successful.length} ✅`);
    console.log(`Failed:                 ${failed.length} ❌`);

    if (options.dryRun) {
      console.log('\n🔍 DRY-RUN: No changes were made');
    }

    if (successful.length > 0 && !options.dryRun) {
      console.log('\n✅ Successfully Regenerated:\n');
      successful.forEach((result, index) => {
        console.log(`${index + 1}. "${result.title}"`);
        console.log(`   Slug: ${result.slug}`);
        console.log(`   Word count: ${result.oldWordCount} → ${result.newWordCount} words`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed:\n');
      failed.forEach((result, index) => {
        console.log(`${index + 1}. "${result.title}"`);
        console.log(`   Slug: ${result.slug}`);
        console.log(`   Error: ${result.error}`);
      });
    }

    console.log('\n' + '═'.repeat(80));

    if (!options.dryRun && successful.length > 0) {
      console.log('\n💡 Next Steps:\n');
      console.log('1. Review regenerated blogs in the admin panel');
      console.log('2. Run audit script to verify improved scores:');
      console.log('   node scripts/audit-blog-content-standards.js');
      console.log('3. Publish updated blogs when ready');
    }

    console.log('\nBatch regeneration complete! 🎉\n');

  } catch (error) {
    console.error('❌ Error during batch regeneration:', error.message);
    process.exit(1);
  }
}

// Run batch regeneration
batchRegenerateBlogs();
