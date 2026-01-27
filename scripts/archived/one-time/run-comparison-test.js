#!/usr/bin/env node

/**
 * Simple test runner for Google vs OpenAI comparison
 */

import ImageGenerationComparison from './test-google-vs-openai-comparison.js';

async function main() {
  console.log('🚀 Starting Google vs OpenAI Image Generation Comparison');
  console.log('🎨 Theme: Ancient Art meets Futuristic Tech Concept Art');
  console.log('=' .repeat(70));

  // Check environment variables
  const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const replicateToken = process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

  if (!openaiKey) {
    console.error('❌ OpenAI API key not found. Set VITE_OPENAI_API_KEY or OPENAI_API_KEY');
    return;
  }

  if (!replicateToken) {
    console.error('❌ Replicate token not found. Set VITE_REPLICATE_API_TOKEN or REPLICATE_API_TOKEN');
    return;
  }

  console.log('✅ API keys configured');
  console.log(`   OpenAI: ${openaiKey.substring(0, 10)}...`);
  console.log(`   Replicate: ${replicateToken.substring(0, 10)}...`);
  console.log();

  try {
    const tester = new ImageGenerationComparison();

    // Start the tests
    console.log('🧪 Running image generation tests...');

    const results = await tester.runComparison();

    console.log('\n📊 TEST RESULTS');
    console.log('=' .repeat(50));
    console.log(`🔵 Google Gemini 2.5 Flash: ${results.google.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (!results.google.success && results.google.error) {
      console.log(`   Error: ${results.google.error}`);
    }

    console.log(`🟠 OpenAI GPT-Image-1: ${results.openai.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (!results.openai.success && results.openai.error) {
      console.log(`   Error: ${results.openai.error}`);
    }

    if (results.google.success) {
      console.log(`   Google Time: ${results.google.generation_time_ms}ms`);
      console.log(`   Google Cost: $${results.google.cost_estimate}`);
      console.log(`   Google URL: ${results.google.url?.substring(0, 50)}...`);
    }

    if (results.openai.success) {
      console.log(`   OpenAI Time: ${results.openai.generation_time_ms}ms`);
      console.log(`   OpenAI Cost: $${results.openai.cost_estimate}`);
    }

    // Generate and save analysis
    const analysis = tester.generateAnalysis(results);
    const savedPath = await tester.saveResults(results, analysis);

    console.log('\n🎯 KEY FINDINGS');
    console.log('=' .repeat(50));
    console.log('📋 Models Tested:');
    console.log('  • Google Gemini 2.5 Flash Image (released Aug 2025)');
    console.log('  • OpenAI GPT-Image-1 (DALL-E 3 excluded per project requirements)');

    console.log('\n🔍 Accessibility:');
    console.log(`  • Google: ${analysis.accessibility_comparison.browser_compatibility.google}`);
    console.log(`  • OpenAI: ${analysis.accessibility_comparison.browser_compatibility.openai}`);

    console.log('\n💰 Cost Comparison:');
    console.log(`  • Google: ${analysis.accessibility_comparison.cost_structure.google}`);
    console.log(`  • OpenAI: ${analysis.accessibility_comparison.cost_structure.openai}`);

    console.log('\n🏆 Recommendation:');
    console.log(`  ${analysis.recommendations.current_best_option}`);

    console.log(`\n📄 Full results saved to: ${savedPath}`);
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}

main().catch(console.error);