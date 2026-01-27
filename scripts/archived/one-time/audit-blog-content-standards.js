/**
 * Blog Content Standards Audit Script
 *
 * Analyzes all published blog posts against the official Blog Content Standards (docs/BLOG_CONTENT_STANDARDS.md)
 *
 * Checks:
 * - Minimum word count (≥1,200 words)
 * - FAQ section presence
 * - Em dash usage (should be 0)
 * - List count (max 2)
 * - Primary keyword in title and first 150 words
 * - Heading structure
 * - Links presence
 *
 * Usage: node scripts/audit-blog-content-standards.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Analyze a single blog post for standards compliance
 */
function analyzePost(post) {
  const issues = [];
  const warnings = [];
  let score = 100;

  // 1. Word Count Check (≥1,200 words)
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  if (wordCount < 1200) {
    issues.push(`Word count too low: ${wordCount} words (minimum: 1,200)`);
    score -= 20;
  }

  // 2. FAQ Section Check
  const hasFAQ = /##?\s+(FAQ|Frequently Asked Questions|Common Questions)/i.test(post.content || '');
  if (!hasFAQ) {
    issues.push('Missing FAQ section');
    score -= 15;
  } else {
    // Count FAQ questions (should be 5)
    const faqQuestions = (post.content || '').match(/###\s+.+\?/g) || [];
    if (faqQuestions.length < 5) {
      warnings.push(`Only ${faqQuestions.length} FAQ questions (expected: 5)`);
      score -= 5;
    } else if (faqQuestions.length > 5) {
      warnings.push(`${faqQuestions.length} FAQ questions (expected: 5)`);
      score -= 2;
    }
  }

  // 3. Em Dash Check (should be 0)
  const emDashCount = (post.content || '').match(/—/g)?.length || 0;
  if (emDashCount > 0) {
    issues.push(`Contains ${emDashCount} em dash(es) — should use commas or parentheses`);
    score -= 10;
  }

  // 4. List Count Check (max 2)
  const bulletLists = (post.content || '').match(/^[\s]*[-*+]\s+/gm) || [];
  const numberedLists = (post.content || '').match(/^[\s]*\d+\.\s+/gm) || [];

  // Estimate number of distinct lists (rough heuristic)
  let listCount = 0;
  if (bulletLists.length > 0) listCount++;
  if (numberedLists.length > 0) listCount++;

  // More sophisticated check: look for list blocks
  const listBlocks = (post.content || '').split(/\n\n+/);
  const actualLists = listBlocks.filter(block => /^[\s]*[-*+\d.]\s+/m.test(block)).length;

  if (actualLists > 2) {
    issues.push(`Contains ${actualLists} lists (maximum: 2)`);
    score -= 10;
  }

  // 5. Primary Keyword Check (if available)
  const primaryKeyword = Array.isArray(post.seo_keywords) && post.seo_keywords.length > 0
    ? post.seo_keywords[0]
    : post.primary_keyword;

  if (primaryKeyword && post.content) {
    // Check if keyword is in title
    const keywordInTitle = post.title.toLowerCase().includes(primaryKeyword.toLowerCase());
    if (!keywordInTitle) {
      warnings.push(`Primary keyword "${primaryKeyword}" not in title`);
      score -= 5;
    }

    // Check if keyword is in first 150 words
    const first150Words = post.content.split(/\s+/).slice(0, 150).join(' ');
    const keywordInOpening = first150Words.toLowerCase().includes(primaryKeyword.toLowerCase());
    if (!keywordInOpening) {
      warnings.push(`Primary keyword "${primaryKeyword}" not in first 150 words`);
      score -= 5;
    }
  }

  // 6. Heading Structure Check
  const h1Count = (post.content || '').match(/^#\s+/gm)?.length || 0;
  const h2Count = (post.content || '').match(/^##\s+/gm)?.length || 0;

  if (h1Count === 0) {
    issues.push('No H1 heading found');
    score -= 15;
  } else if (h1Count > 1) {
    warnings.push(`Multiple H1 headings (${h1Count}) - should have only 1`);
    score -= 5;
  }

  if (h2Count < 3) {
    warnings.push(`Only ${h2Count} H2 headings - articles typically need 4-6`);
    score -= 3;
  }

  // 7. Check for generic headings
  const genericHeadings = /(introduction|conclusion|summary|final thoughts)/i;
  if (genericHeadings.test(post.content || '')) {
    issues.push('Contains generic headings (Introduction/Conclusion) - use natural headings');
    score -= 8;
  }

  // 8. Links Check
  const internalLinks = (post.content || '').match(/\[.+?\]\(https?:\/\/dm4\.wjwelsh\.com.+?\)/g) || [];
  const externalLinks = (post.content || '').match(/\[.+?\]\(https?:\/\/(?!dm4\.wjwelsh\.com).+?\)/g) || [];

  if (internalLinks.length === 0) {
    warnings.push('No internal links found (recommended: 1-2)');
    score -= 5;
  }

  if (externalLinks.length === 0) {
    warnings.push('No external links found (recommended: 1-2)');
    score -= 5;
  }

  // 9. Code Fence Check (should be 0 - output should be pure Markdown)
  const codeFences = (post.content || '').match(/```/g)?.length || 0;
  if (codeFences > 0) {
    warnings.push(`Contains ${codeFences / 2} code block(s) - ensure they're necessary`);
    // Not reducing score as code blocks may be intentional in technical content
  }

  // Ensure score doesn't go negative
  score = Math.max(0, score);

  return {
    postId: post.id,
    title: post.title,
    slug: post.slug,
    wordCount,
    score,
    compliant: score >= 80,
    issues,
    warnings,
    stats: {
      wordCount,
      h1Count,
      h2Count,
      emDashCount,
      listCount: actualLists,
      faqQuestionCount: hasFAQ ? ((post.content || '').match(/###\s+.+\?/g) || []).length : 0,
      internalLinkCount: internalLinks.length,
      externalLinkCount: externalLinks.length
    }
  };
}

/**
 * Main audit function
 */
async function auditBlogPosts() {
  console.log('📊 Blog Content Standards Audit\n');
  console.log('Checking compliance with docs/BLOG_CONTENT_STANDARDS.md\n');
  console.log('═'.repeat(80) + '\n');

  try {
    // Fetch all published blog posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    if (!posts || posts.length === 0) {
      console.log('ℹ️  No published blog posts found.\n');
      return;
    }

    console.log(`Found ${posts.length} published blog post(s)\n`);

    // Analyze each post
    const results = posts.map(post => analyzePost(post));

    // Calculate summary statistics
    const compliantPosts = results.filter(r => r.compliant);
    const nonCompliantPosts = results.filter(r => !r.compliant);
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    // Display summary
    console.log('📈 SUMMARY\n');
    console.log(`Total Posts Analyzed:     ${results.length}`);
    console.log(`Compliant (score ≥80):    ${compliantPosts.length} (${((compliantPosts.length / results.length) * 100).toFixed(1)}%)`);
    console.log(`Non-Compliant (score <80): ${nonCompliantPosts.length} (${((nonCompliantPosts.length / results.length) * 100).toFixed(1)}%)`);
    console.log(`Average Compliance Score: ${averageScore.toFixed(1)}/100`);
    console.log('\n' + '═'.repeat(80) + '\n');

    // Display detailed results
    console.log('📋 DETAILED RESULTS\n');

    // Sort by score (lowest first - most in need of attention)
    results.sort((a, b) => a.score - b.score);

    results.forEach((result, index) => {
      const statusIcon = result.compliant ? '✅' : '❌';
      const scoreColor = result.score >= 90 ? '🟢' : result.score >= 80 ? '🟡' : '🔴';

      console.log(`${index + 1}. ${statusIcon} ${result.title}`);
      console.log(`   Score: ${scoreColor} ${result.score}/100`);
      console.log(`   Slug: ${result.slug}`);
      console.log(`   Word Count: ${result.wordCount} words`);

      if (result.issues.length > 0) {
        console.log(`   \n   ❌ Issues (${result.issues.length}):`);
        result.issues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      }

      if (result.warnings.length > 0) {
        console.log(`   \n   ⚠️  Warnings (${result.warnings.length}):`);
        result.warnings.forEach(warning => {
          console.log(`      - ${warning}`);
        });
      }

      console.log(`   \n   📊 Stats:`);
      console.log(`      H1: ${result.stats.h1Count}, H2: ${result.stats.h2Count}, Lists: ${result.stats.listCount}, FAQ Questions: ${result.stats.faqQuestionCount}`);
      console.log(`      Internal Links: ${result.stats.internalLinkCount}, External Links: ${result.stats.externalLinkCount}`);
      console.log('');
    });

    console.log('═'.repeat(80) + '\n');

    // Recommendations
    console.log('💡 RECOMMENDATIONS\n');

    if (nonCompliantPosts.length > 0) {
      console.log(`${nonCompliantPosts.length} post(s) need updating:\n`);

      const postsNeedingRegeneration = nonCompliantPosts.filter(r => r.score < 60);
      const postsNeedingMinorEdits = nonCompliantPosts.filter(r => r.score >= 60 && r.score < 80);

      if (postsNeedingRegeneration.length > 0) {
        console.log(`🔄 Recommend REGENERATION (score < 60): ${postsNeedingRegeneration.length} posts`);
        postsNeedingRegeneration.forEach(post => {
          console.log(`   - "${post.title}" (score: ${post.score})`);
        });
        console.log('');
      }

      if (postsNeedingMinorEdits.length > 0) {
        console.log(`✏️  Recommend MANUAL EDITING (score 60-79): ${postsNeedingMinorEdits.length} posts`);
        postsNeedingMinorEdits.forEach(post => {
          console.log(`   - "${post.title}" (score: ${post.score})`);
        });
        console.log('');
      }

      console.log('Next steps:');
      console.log('1. Review posts with score < 60 for regeneration using updated prompts');
      console.log('2. Manually edit posts with score 60-79 to fix specific issues');
      console.log('3. Use the Admin Blog Manager to regenerate or edit content');
      console.log('4. Re-run this audit after updates to verify compliance\n');
    } else {
      console.log('✅ All published posts meet the content standards!\n');
      console.log('Optional improvements:');
      console.log('- Review warnings for minor optimizations');
      console.log('- Consider adding more internal/external links where appropriate');
      console.log('- Ensure FAQ sections have exactly 5 questions\n');
    }

    console.log('═'.repeat(80) + '\n');
    console.log('Audit complete! 🎉\n');

  } catch (error) {
    console.error('❌ Error during audit:', error.message);
    process.exit(1);
  }
}

// Run audit
auditBlogPosts();
