/**
 * Test Script for Blog Humanization System
 *
 * Tests all three humanization providers:
 * 1. EdgeShop.ai (free, undocumented)
 * 2. Undetectable.ai (paid, reliable)
 * 3. Claude Sonnet 4.5 (fallback)
 *
 * Usage:
 *   node scripts/test-blog-humanization.js
 *   node scripts/test-blog-humanization.js --provider=edgeshop
 *   node scripts/test-blog-humanization.js --postId=uuid
 */

import { createClient } from '@supabase/supabase-js';
import { humanizeText, humanizeBlogPost } from '../netlify/functions/shared/humanize-text.js';

// Test sample text (AI-generated example)
const SAMPLE_AI_TEXT = `Artificial intelligence has revolutionized the way businesses operate in today's digital landscape, enabling unprecedented levels of efficiency and innovation. Organizations are increasingly leveraging AI-powered solutions to streamline operations, enhance customer experiences, and drive competitive advantage.

The integration of machine learning algorithms and natural language processing capabilities has fundamentally transformed traditional business processes. Companies can now analyze vast amounts of data in real-time, generating actionable insights that inform strategic decision-making. This technological advancement represents a paradigm shift in how enterprises approach problem-solving and opportunity identification.

Furthermore, the deployment of AI systems facilitates the automation of repetitive tasks, allowing human resources to focus on higher-value activities that require creative thinking and emotional intelligence. This optimization of workforce allocation contributes significantly to enhanced productivity metrics and overall organizational performance.`;

// Get command-line arguments
const args = process.argv.slice(2);
const provider = args.find(arg => arg.startsWith('--provider='))?.split('=')[1] || 'auto';
const postId = args.find(arg => arg.startsWith('--postId='))?.split('=')[1] || null;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Test 1: Simple Text Humanization
 */
async function testSimpleHumanization() {
  console.log('\n🧪 TEST 1: Simple Text Humanization');
  console.log('=' .repeat(60));
  console.log(`Provider: ${provider}`);
  console.log(`Sample text length: ${SAMPLE_AI_TEXT.length} chars\n`);

  const startTime = Date.now();

  const result = await humanizeText(SAMPLE_AI_TEXT, {
    preferredProvider: provider
  });

  const duration = Date.now() - startTime;

  console.log(`\n✅ Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Provider used: ${result.provider || 'none'}`);
  console.log(`AI Score: ${result.aiScore || 'N/A'}`);
  console.log(`Cost: $${result.cost?.toFixed(4) || '0.0000'}`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);

  if (result.success && result.humanizedText) {
    console.log('\n📝 Original vs Humanized:');
    console.log('\nOriginal (first 200 chars):');
    console.log(SAMPLE_AI_TEXT.substring(0, 200) + '...\n');
    console.log('Humanized (first 200 chars):');
    console.log(result.humanizedText.substring(0, 200) + '...\n');
  }

  if (!result.success) {
    console.error('❌ Error:', result.error);
    if (result.attemptedProviders) {
      console.error('Attempted providers:', result.attemptedProviders.join(', '));
    }
  }

  return result;
}

/**
 * Test 2: Multi-Provider Fallback
 */
async function testMultiProviderFallback() {
  console.log('\n🧪 TEST 2: Multi-Provider Fallback');
  console.log('=' .repeat(60));
  console.log('Testing automatic fallback through all providers\n');

  const providers = ['edgeshop', 'undetectable', 'claude'];
  const results = {};

  for (const prov of providers) {
    console.log(`\n▶ Testing ${prov}...`);
    const startTime = Date.now();

    const result = await humanizeText(SAMPLE_AI_TEXT, {
      preferredProvider: prov
    });

    const duration = Date.now() - startTime;

    results[prov] = {
      success: result.success,
      duration: duration,
      cost: result.cost || 0,
      aiScore: result.aiScore
    };

    console.log(`  ${result.success ? '✅' : '❌'} ${prov}: ${result.success ? 'Success' : result.error}`);
    console.log(`     Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`     Cost: $${(result.cost || 0).toFixed(4)}`);
    if (result.aiScore !== null && result.aiScore !== undefined) {
      console.log(`     AI Score: ${result.aiScore}`);
    }
  }

  console.log('\n📊 Provider Comparison:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

/**
 * Test 3: Blog Post Humanization
 */
async function testBlogPostHumanization() {
  console.log('\n🧪 TEST 3: Blog Post Humanization (Section-by-Section)');
  console.log('=' .repeat(60));

  // Create a multi-section blog
  const blogContent = `# AI Marketing Revolution

## Introduction

${SAMPLE_AI_TEXT}

## Key Benefits

Artificial intelligence offers numerous advantages for modern marketing teams. Machine learning algorithms can analyze customer behavior patterns, predict future trends, and optimize campaign performance in real-time. This capability enables marketers to achieve unprecedented levels of personalization and efficiency.

## Implementation Strategy

Organizations seeking to implement AI-powered marketing solutions should follow a structured approach. Begin by identifying specific use cases, assessing available data resources, and selecting appropriate technology platforms. This methodical framework ensures successful deployment and measurable return on investment.

## FAQ Section

### How does AI improve marketing ROI?

AI enhances marketing return on investment through data-driven optimization, automated decision-making, and precise audience targeting capabilities.

### What are the costs involved?

Implementation costs vary significantly based on organizational size, technical requirements, and selected solution providers.`;

  console.log(`Blog content: ${blogContent.length} chars, ~${blogContent.split('## ').length} sections\n`);

  const startTime = Date.now();

  const result = await humanizeBlogPost(blogContent, {
    preferredProvider: provider
  });

  const duration = Date.now() - startTime;

  console.log(`\n✅ Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Sections processed: ${result.sectionsProcessed}`);
  console.log(`Total cost: $${result.totalCost?.toFixed(4) || '0.0000'}`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);

  if (result.success) {
    console.log('\n📝 Content comparison:');
    console.log(`Original length: ${result.originalContent.length} chars`);
    console.log(`Humanized length: ${result.humanizedContent.length} chars`);
    console.log(`Difference: ${result.humanizedContent.length - result.originalContent.length} chars`);
  }

  return result;
}

/**
 * Test 4: Database Integration (Real Post)
 */
async function testDatabaseIntegration() {
  console.log('\n🧪 TEST 4: Database Integration (Real Post)');
  console.log('=' .repeat(60));

  let testPostId = postId;

  // If no postId provided, fetch a recent post
  if (!testPostId) {
    console.log('Fetching recent blog post from database...');

    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content')
      .not('content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !posts || posts.length === 0) {
      console.error('❌ Failed to fetch post:', error?.message || 'No posts found');
      return null;
    }

    testPostId = posts[0].id;
    console.log(`✅ Found post: "${posts[0].title}" (${testPostId})`);
  }

  // Fetch post content
  const { data: post, error } = await supabase
    .from('posts')
    .select('id, title, content')
    .eq('id', testPostId)
    .single();

  if (error || !post) {
    console.error('❌ Failed to fetch post:', error?.message);
    return null;
  }

  console.log(`\nPost: "${post.title}"`);
  console.log(`Content length: ${post.content?.length || 0} chars\n`);

  if (!post.content || post.content.length < 100) {
    console.error('❌ Post content is too short or empty');
    return null;
  }

  // Humanize the post
  console.log('Humanizing post content...');
  const startTime = Date.now();

  const result = await humanizeBlogPost(post.content, {
    preferredProvider: provider
  });

  const duration = Date.now() - startTime;

  console.log(`\n✅ Humanization ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Sections processed: ${result.sectionsProcessed}`);
  console.log(`Total cost: $${result.totalCost?.toFixed(4) || '0.0000'}`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);

  if (result.success) {
    // Optionally save to database
    console.log('\n💾 Save humanized content to database? (not implemented in test)');
    console.log('   Use the blog-humanize Netlify function with saveToDatabase: true');
  }

  return result;
}

/**
 * Test 5: EdgeShop.ai Direct API Test
 */
async function testEdgeShopDirectAPI() {
  console.log('\n🧪 TEST 5: EdgeShop.ai Direct API Test');
  console.log('=' .repeat(60));
  console.log('Testing direct API call to api.edgeshop.ai\n');

  try {
    const response = await fetch('https://api.edgeshop.ai/rewrite/text-detection', {
      method: 'POST',
      headers: {
        'User-Agent': 'disruptors-test/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'original_text',
        text: SAMPLE_AI_TEXT,
        detectionTypeList: ['COPYLEAKS', 'HEMINGWAY']
      })
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return null;
    }

    const data = await response.json();

    console.log('\n✅ API Response:');
    console.log(JSON.stringify(data, null, 2));

    // Extract AI score
    const copyleaksResult = data.find(r => r.detectionType === 'COPYLEAKS');
    if (copyleaksResult && copyleaksResult.detectionResult) {
      console.log('\n📊 AI Detection Score:');
      console.log(`   AI: ${copyleaksResult.detectionResult.ai}`);
      console.log(`   Human: ${copyleaksResult.detectionResult.human}`);
      console.log(`   Classification: ${copyleaksResult.detectionResult.classification}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('\n🚀 Blog Humanization System - Test Suite');
  console.log('=' .repeat(60));
  console.log(`Test run: ${new Date().toISOString()}`);
  console.log(`Provider preference: ${provider}`);

  // Check environment variables
  console.log('\n🔍 Environment Check:');
  console.log(`  VITE_ANTHROPIC_API_KEY: ${process.env.VITE_ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  UNDETECTABLE_API_KEY: ${process.env.UNDETECTABLE_API_KEY ? '✅ Set' : '⚠️  Not set (optional)'}`);
  console.log(`  VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  VITE_SUPABASE_SERVICE_ROLE_KEY: ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);

  try {
    // Run tests
    await testSimpleHumanization();
    await testMultiProviderFallback();
    await testBlogPostHumanization();
    await testEdgeShopDirectAPI();

    // Only run database test if Supabase is configured
    if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
      await testDatabaseIntegration();
    } else {
      console.log('\n⚠️  Skipping database integration test (Supabase not configured)');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ All tests completed!');
    console.log('=' .repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
