/**
 * Regenerate Single Blog with FAQ Section Enforcement
 *
 * This is a specialized regeneration script that ensures FAQ sections are included.
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const blogSlug = process.argv[2];

if (!blogSlug) {
  console.error('Usage: node scripts/regenerate-single-blog-with-faq.js <slug>');
  process.exit(1);
}

// Enhanced system prompt with FAQ emphasis
const BLOG_SYSTEM_PROMPT = `You are a top-performing SEO strategist and educator. Write epic, original blog posts that are practical, easy to follow, and consistently optimized for search and generative engines.

CRITICAL REQUIREMENT: You MUST include a Frequently Asked Questions section with exactly 5 questions. This is non-negotiable.

Core Output Requirements:
- Write at least 1,200 words in narrative, skimmable, conversational style with H1/H2/H3 formatting
- Output complete Markdown ONLY - no code fences, no backticks, no meta commentary. Start directly with the H1 title
- Optimize for {{PRIMARY_KEYWORD}} and support with {{SECONDARY_KEYWORD}}
- Include {{PRIMARY_KEYWORD}} in the H1 title naturally and again within the first 150 words
- Begin with one strong hook in the opening paragraph (story, problem, myth vs. reality, or quick scenario)
- Add 1–2 internal links to relevant pages within {{TARGET_URL}} using descriptive anchor text
- Add 1–2 external links to reputable, authoritative sources near key claims
- MANDATORY: Include exactly 5 FAQs using H2 "## Frequently Asked Questions" followed by 5 H3 questions (### format) ending with question marks
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

Article Structure (REQUIRED):
1. H1: {{TITLE}}
2. H2: Answer Box — 3–5 sentence direct answer for {{PRIMARY_KEYWORD}}
3. Key Facts mini-table or brief list
4. H2: Core Strategy (mapped to search intent)
   - H3: Step-by-Step Process
   - H3: Tools & Setup (Ahrefs-focused)
   - H3: Troubleshooting & Edge Cases
5. H2: Local SEO Block (if {{PRIMARY_LOCATION}} provided)
6. H2: Measurement Plan (3 KPIs)
7. H2: Frequently Asked Questions (MANDATORY - DO NOT SKIP)
   - ### Question 1? (must end with ?)
   - ### Question 2? (must end with ?)
   - ### Question 3? (must end with ?)
   - ### Question 4? (must end with ?)
   - ### Question 5? (must end with ?)
   - [Short one-sentence CTA after FAQs]
8. H2: Schema Hint (which types to implement)

REMINDER: The FAQ section is MANDATORY. Do not skip it. Include exactly 5 questions as H3 headings ending with question marks.

Final Output Format:
- The article must be self-contained, well-organized, and ready to publish as-is
- Output pure Markdown starting with the H1 title - no code fences, no backticks, no explanatory text
- Ensure complete with all required sections (especially FAQ!) and meets the 1,200+ word minimum
- Structure naturally flows from opening hook to FAQ section to final CTA line

Write compelling, original, SEO-optimized content that ranks well and engages readers.`;

async function regenerateBlog() {
  try {
    console.log(`\n🔄 Regenerating blog: ${blogSlug}\n`);

    // Fetch blog
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', blogSlug)
      .single();

    if (fetchError || !post) {
      throw new Error(`Failed to fetch blog: ${fetchError?.message || 'Not found'}`);
    }

    console.log(`📝 Title: "${post.title}"`);
    console.log(`📊 Current word count: ${post.content ? post.content.split(/\s+/).length : 0}`);

    // Extract keywords
    const keywords = post.seo_keywords || post.tags || [];
    const keywordArray = Array.isArray(keywords) ? keywords : typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : [];
    const primaryKeyword = keywordArray[0] || post.primary_keyword || post.title;
    const secondaryKeyword = keywordArray[1] || keywordArray[0] || post.category;

    console.log(`🎯 Keywords: ${primaryKeyword}, ${secondaryKeyword}`);

    // Prepare prompt
    const customizedPrompt = BLOG_SYSTEM_PROMPT
      .replace(/\{\{TITLE\}\}/g, post.title)
      .replace(/\{\{PRIMARY_KEYWORD\}\}/g, primaryKeyword)
      .replace(/\{\{SECONDARY_KEYWORD\}\}/g, secondaryKeyword)
      .replace(/\{\{TARGET_URL\}\}/g, 'https://dm4.wjwelsh.com')
      .replace(/\{\{PRIMARY_LOCATION\}\}/g, post.location || '');

    const userPrompt = `Write a complete blog article with the following details:

Title: ${post.title}
Primary Keyword: ${primaryKeyword}
Secondary Keyword: ${secondaryKeyword}
Target URL for internal links: https://dm4.wjwelsh.com
${post.location ? `Primary Location: ${post.location}` : ''}

CRITICAL REMINDER: You MUST include a "## Frequently Asked Questions" section with exactly 5 questions as ### headings. Do not skip this section.

Write the article now following all requirements, especially the FAQ section.`;

    console.log('\n🤖 Generating content with Claude Sonnet 4.5...');
    console.log('⚠️  Emphasizing FAQ requirement...\n');

    // Generate content
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: customizedPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const content = message.content[0].text;

    // Verify FAQ section
    const hasFAQ = /##?\s+(FAQ|Frequently Asked Questions)/i.test(content);
    const faqQuestions = content.match(/###\s+.+\?/g) || [];

    console.log('✓ Content generated!');
    console.log(`  FAQ section present: ${hasFAQ ? 'YES' : 'NO'}`);
    console.log(`  FAQ questions count: ${faqQuestions.length}`);

    if (!hasFAQ || faqQuestions.length < 5) {
      console.warn('\n⚠️  WARNING: Generated content missing proper FAQ section!');
      console.warn('  This may require manual editing or another regeneration.\n');
    }

    // Calculate stats
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    const excerpt = content.substring(0, 200).replace(/<[^>]*>/g, '').replace(/^#\s+.+\n+/, '') + '...';

    console.log(`📊 New word count: ${wordCount} words`);
    console.log(`⏱️  Reading time: ${readTime} minutes`);

    // Update database
    console.log('\n💾 Updating database...');

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
          regenerated_by: 'regenerate-single-blog-with-faq',
          regenerated_at: new Date().toISOString(),
          model: 'claude-sonnet-4-20250514',
          word_count: wordCount,
          primary_keyword: primaryKeyword,
          secondary_keyword: secondaryKeyword,
          faq_count: faqQuestions.length,
          standards_version: '1.0.0'
        }
      })
      .eq('id', post.id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('✅ Successfully regenerated!');
    console.log('\n📋 Summary:');
    console.log(`  Old word count: ${post.content ? post.content.split(/\s+/).length : 0}`);
    console.log(`  New word count: ${wordCount}`);
    console.log(`  FAQ questions: ${faqQuestions.length}/5`);

    console.log('\n💡 Next Steps:');
    console.log('  1. Run audit to verify: node scripts/audit-blog-content-standards.js');
    console.log('  2. Review content in admin panel');
    console.log('  3. Manually add FAQs if still missing');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

regenerateBlog();
