import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

/**
 * Semantic Blog Validation Script
 *
 * Validates all blog posts against 2025 semantic structure standards.
 * Checks for:
 * - Semantic metadata completeness (subtitle, key_takeaways, TOC)
 * - Content structure (headings, FAQ, word count)
 * - SEO optimization (keywords, meta descriptions)
 * - Accessibility (alt text, heading hierarchy)
 * - Semantic structure version
 *
 * Usage:
 *   node scripts/validate-semantic-blogs.js
 *   node scripts/validate-semantic-blogs.js --slug=specific-blog
 *   node scripts/validate-semantic-blogs.js --report
 */

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const args = process.argv.slice(2);
const specificSlug = args.find(arg => arg.startsWith('--slug='))?.split('=')[1];
const generateReport = args.includes('--report');

console.log('\n✅ Semantic Blog Validation Tool');
console.log('=================================\n');

const VALIDATION_RULES = {
  // Semantic metadata
  subtitle: {
    check: (post) => post.subtitle && post.subtitle.length >= 50 && post.subtitle.length <= 120,
    severity: 'warning',
    message: 'Subtitle missing or incorrect length (should be 50-120 chars)'
  },
  key_takeaways_count: {
    check: (post) => post.key_takeaways?.takeaways && post.key_takeaways.takeaways.length >= 3 && post.key_takeaways.takeaways.length <= 6,
    severity: 'error',
    message: 'Must have 3-6 key takeaways'
  },
  key_takeaways_length: {
    check: (post) => {
      if (!post.key_takeaways?.takeaways) return false;
      return post.key_takeaways.takeaways.every(t => t.length >= 40 && t.length <= 150);
    },
    severity: 'warning',
    message: 'Key takeaways should be 40-150 chars each'
  },
  table_of_contents: {
    check: (post) => {
      const wordCount = post.content?.split(/\s+/).length || 0;
      if (wordCount < 1500) return true; // Not required for short posts
      return post.table_of_contents && post.table_of_contents.length >= 3;
    },
    severity: 'warning',
    message: 'Posts >1500 words should have TOC with 3+ headings'
  },
  semantic_version: {
    check: (post) => post.semantic_structure_version === '2025.1',
    severity: 'error',
    message: 'Not migrated to semantic structure 2025.1'
  },

  // Content structure
  word_count: {
    check: (post) => {
      const wordCount = post.content?.split(/\s+/).length || 0;
      return wordCount >= 1200;
    },
    severity: 'error',
    message: 'Word count below minimum (1200 words)'
  },
  h2_sections: {
    check: (post) => {
      const h2Count = (post.content?.match(/^## /gm) || []).length;
      return h2Count >= 3;
    },
    severity: 'warning',
    message: 'Should have at least 3 main sections (H2 headings)'
  },
  faq_section: {
    check: (post) => {
      return /^## Frequently Asked Questions/m.test(post.content || '');
    },
    severity: 'error',
    message: 'Missing FAQ section'
  },
  faq_questions: {
    check: (post) => {
      const faqSection = post.content?.match(/## Frequently Asked Questions[\s\S]*$/m)?.[0] || '';
      const questionCount = (faqSection.match(/^### .+\?$/gm) || []).length;
      return questionCount === 5;
    },
    severity: 'warning',
    message: 'FAQ should have exactly 5 questions'
  },

  // SEO
  primary_keyword_in_title: {
    check: (post) => {
      if (!post.primary_keyword) return true; // Skip if no keyword set
      return post.title.toLowerCase().includes(post.primary_keyword.toLowerCase());
    },
    severity: 'error',
    message: 'Primary keyword not in title'
  },
  primary_keyword_in_content: {
    check: (post) => {
      if (!post.primary_keyword) return true;
      const firstPara = post.content?.substring(0, 500) || '';
      return firstPara.toLowerCase().includes(post.primary_keyword.toLowerCase());
    },
    severity: 'warning',
    message: 'Primary keyword not in first 500 characters'
  },
  meta_description: {
    check: (post) => {
      return post.meta_description &&
             post.meta_description.length >= 150 &&
             post.meta_description.length <= 160;
    },
    severity: 'warning',
    message: 'Meta description missing or wrong length (150-160 chars)'
  },

  // Accessibility
  images_alt_text: {
    check: (post) => {
      const images = post.content?.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];
      if (images.length === 0) return true; // No images is fine

      const imagesWithoutAlt = images.filter(img => {
        const altMatch = img.match(/!\[([^\]]*)\]/);
        return !altMatch || !altMatch[1] || altMatch[1].length < 10;
      });

      return imagesWithoutAlt.length === 0;
    },
    severity: 'error',
    message: 'Some images missing descriptive alt text (min 10 chars)'
  },
  heading_hierarchy: {
    check: (post) => {
      const h1Count = (post.content?.match(/^# /gm) || []).length;
      return h1Count <= 1; // Should have 0 or 1 H1 (title is separate)
    },
    severity: 'warning',
    message: 'Multiple H1 headings found (should be 0-1 in content)'
  },

  // Technical
  author_name: {
    check: (post) => post.author_name && post.author_name.length > 0,
    severity: 'info',
    message: 'Author name not set (defaults to "Disruptors Team")'
  },
  featured_image: {
    check: (post) => post.featured_image && post.featured_image.length > 0,
    severity: 'warning',
    message: 'No featured image set'
  },
  cta_config: {
    check: (post) => {
      return post.cta_config &&
             post.cta_config.sidebar &&
             post.cta_config.footer;
    },
    severity: 'info',
    message: 'CTA configuration not set (will use defaults)'
  }
};

async function validateBlog(post) {
  const issues = [];
  const wordCount = post.content?.split(/\s+/).length || 0;

  // Run all validation rules
  Object.entries(VALIDATION_RULES).forEach(([ruleName, rule]) => {
    try {
      if (!rule.check(post)) {
        issues.push({
          rule: ruleName,
          severity: rule.severity,
          message: rule.message
        });
      }
    } catch (error) {
      console.error(`Error checking rule ${ruleName}:`, error.message);
    }
  });

  // Calculate validation score
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  const totalChecks = Object.keys(VALIDATION_RULES).length;
  const passedChecks = totalChecks - errorCount - warningCount - infoCount;
  const score = Math.round((passedChecks / totalChecks) * 100);

  const status = errorCount === 0 ? 'pass' : 'fail';

  return {
    post_id: post.id,
    post_slug: post.slug,
    post_title: post.title,
    validated_at: new Date().toISOString(),
    semantic_version: post.semantic_structure_version || 'legacy',
    word_count: wordCount,
    status,
    score,
    issues: {
      errors: errorCount,
      warnings: warningCount,
      info: infoCount,
      total: issues.length
    },
    details: issues
  };
}

function printValidationReport(result) {
  const statusIcon = result.status === 'pass' ? '✅' : '❌';
  const scoreColor = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';

  console.log(`\n${statusIcon} ${result.post_title}`);
  console.log(`   Slug: ${result.post_slug}`);
  console.log(`   Version: ${result.semantic_version}`);
  console.log(`   ${scoreColor} Score: ${result.score}%`);
  console.log(`   Status: ${result.status.toUpperCase()}`);
  console.log(`   Words: ${result.word_count.toLocaleString()}`);
  console.log(`   Issues: ${result.issues.errors} errors, ${result.issues.warnings} warnings, ${result.issues.info} info`);

  if (result.details.length > 0) {
    console.log(`\n   Issues:`);
    result.details.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' :
                   issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`   ${icon} [${issue.rule}] ${issue.message}`);
    });
  }
}

async function main() {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (specificSlug) {
      query = query.eq('slug', specificSlug);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    if (!posts || posts.length === 0) {
      console.log('No published blogs found.\n');
      return;
    }

    console.log(`📚 Validating ${posts.length} blog post(s)...\n`);

    const results = [];
    const summary = {
      total: posts.length,
      passed: 0,
      failed: 0,
      totalScore: 0,
      semantic2025: 0,
      legacy: 0,
      errors: 0,
      warnings: 0,
      info: 0
    };

    // Validate each blog
    for (const post of posts) {
      const result = await validateBlog(post);
      results.push(result);

      if (result.status === 'pass') summary.passed++;
      else summary.failed++;

      summary.totalScore += result.score;
      summary.errors += result.issues.errors;
      summary.warnings += result.issues.warnings;
      summary.info += result.issues.info;

      if (result.semantic_version === '2025.1') summary.semantic2025++;
      else summary.legacy++;

      printValidationReport(result);
    }

    // Print overall summary
    console.log('\n\n📊 Validation Summary');
    console.log('====================');
    console.log(`Total blogs: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed} (${Math.round(summary.passed / summary.total * 100)}%)`);
    console.log(`❌ Failed: ${summary.failed} (${Math.round(summary.failed / summary.total * 100)}%)`);
    console.log(`📈 Average score: ${Math.round(summary.totalScore / summary.total)}%`);
    console.log(`\nSemantic Versions:`);
    console.log(`   2025.1: ${summary.semantic2025} (${Math.round(summary.semantic2025 / summary.total * 100)}%)`);
    console.log(`   Legacy: ${summary.legacy} (${Math.round(summary.legacy / summary.total * 100)}%)`);
    console.log(`\nIssue Breakdown:`);
    console.log(`   ❌ Errors: ${summary.errors}`);
    console.log(`   ⚠️  Warnings: ${summary.warnings}`);
    console.log(`   ℹ️  Info: ${summary.info}`);

    if (summary.failed > 0) {
      console.log(`\n❌ Blogs requiring attention:`);
      results
        .filter(r => r.status === 'fail')
        .sort((a, b) => a.score - b.score)
        .forEach(r => {
          console.log(`   - ${r.post_title} (${r.score}% - ${r.issues.errors} errors)`);
        });
    }

    if (summary.legacy > 0) {
      console.log(`\n🔄 Blogs needing migration to 2025.1:`);
      results
        .filter(r => r.semantic_version !== '2025.1')
        .slice(0, 10)
        .forEach(r => {
          console.log(`   - ${r.post_title}`);
        });
      if (summary.legacy > 10) {
        console.log(`   ... and ${summary.legacy - 10} more`);
      }
      console.log(`\n   Run: node scripts/migrate-blogs-to-semantic.js --batch-size=10`);
    }

    // Generate detailed report if requested
    if (generateReport) {
      const reportPath = `temp/semantic-validation-report-${new Date().toISOString().split('T')[0]}.json`;
      const fs = await import('fs');
      fs.writeFileSync(reportPath, JSON.stringify({
        generated_at: new Date().toISOString(),
        summary,
        results
      }, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run validation
main();
