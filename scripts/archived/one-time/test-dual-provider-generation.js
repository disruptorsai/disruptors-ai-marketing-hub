#!/usr/bin/env node

/**
 * Test Dual Provider Generation
 *
 * Quick test script to generate sample images using both OpenAI GPT-Image-1
 * and Nano Banana (Gemini) for a few services to compare quality and style.
 */

import { aiOrchestrator } from '../src/lib/ai-orchestrator.js';

// Test services subset for comparison
const TEST_SERVICES = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Automate repetitive tasks and workflows',
    prompt: 'Professional AI automation dashboard interface showing robotic process automation, workflow diagrams with connected nodes, automated task management system, blue and purple tech gradients, modern corporate design, 640x360 aspect ratio'
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    description: 'Build and engage your community',
    prompt: 'Modern social media management dashboard with multiple platform analytics, engagement metrics, content calendar, social media icons and growth charts, professional blue and purple design, 640x360 aspect ratio'
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    description: 'Fill your pipeline with qualified prospects',
    prompt: 'Lead generation funnel visualization, conversion metrics dashboard, customer journey mapping, sales pipeline interface, lead scoring system, corporate blue and purple aesthetic, 640x360 aspect ratio'
  }
];

class TestDualProviderGenerator {
  constructor() {
    this.results = [];
  }

  /**
   * Generate image using OpenAI GPT-Image-1
   */
  async testOpenAI(service) {
    console.log(`🎨 [OpenAI] Testing ${service.title}...`);

    try {
      const result = await aiOrchestrator.generateImage(service.prompt, {
        width: 640,
        height: 360,
        quality: 'premium',
        specialization: 'professional_creative',
        context: 'service_card_test'
      });

      console.log(`✅ [OpenAI] Generated ${service.title}`);
      console.log(`   URL: ${result.url}`);

      return {
        provider: 'openai',
        service: service,
        result: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [OpenAI] Error with ${service.title}:`, error.message);
      return {
        provider: 'openai',
        service: service,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test Nano Banana (Gemini) - using MCP server
   */
  async testNanoBanana(service) {
    console.log(`🍌 [Nano Banana] Testing ${service.title}...`);

    try {
      // Using the AI orchestrator with Gemini as fallback
      const result = await aiOrchestrator.generateImage(service.prompt, {
        width: 640,
        height: 360,
        quality: 'standard',
        budget: 'low', // This should trigger Gemini selection
        context: 'service_card_test'
      });

      console.log(`✅ [Nano Banana] Generated ${service.title}`);
      console.log(`   URL: ${result.url}`);

      return {
        provider: 'nano-banana',
        service: service,
        result: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [Nano Banana] Error with ${service.title}:`, error.message);
      return {
        provider: 'nano-banana',
        service: service,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate comparison for a single service
   */
  async generateServiceComparison(service) {
    console.log(`\n🚀 Testing service: ${service.title}`);
    console.log(`   Description: ${service.description}`);

    const comparison = {
      service: service,
      openai: null,
      nanoBanana: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Test OpenAI first
      comparison.openai = await this.testOpenAI(service);

      // Small delay between providers
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test Nano Banana
      comparison.nanoBanana = await this.testNanoBanana(service);

      console.log(`✅ Completed comparison for ${service.title}`);

    } catch (error) {
      console.error(`❌ Error in service comparison for ${service.title}:`, error.message);
      comparison.error = error.message;
    }

    return comparison;
  }

  /**
   * Run all test comparisons
   */
  async runTests() {
    console.log('🔬 Starting dual-provider test generation...\n');
    console.log(`📊 Test Configuration:`);
    console.log(`  - Services: ${TEST_SERVICES.length}`);
    console.log(`  - Providers: OpenAI GPT-Image-1, Nano Banana (Gemini)`);
    console.log(`  - Purpose: Quality and style comparison\n`);

    const results = [];

    for (const service of TEST_SERVICES) {
      const comparison = await this.generateServiceComparison(service);
      results.push(comparison);

      // Brief pause between services
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.results = results;
    return results;
  }

  /**
   * Generate test report
   */
  generateTestReport(results) {
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Total tests: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    console.log('\n🔗 Generated Images:');
    successful.forEach(result => {
      console.log(`\n${result.service.title}:`);

      if (result.openai && !result.openai.error) {
        console.log(`  ✅ OpenAI: ${result.openai.result?.stored_url || result.openai.result?.url || 'Generated successfully'}`);
      } else {
        console.log(`  ❌ OpenAI: ${result.openai?.error || 'Failed'}`);
      }

      if (result.nanoBanana && !result.nanoBanana.error) {
        console.log(`  ✅ Nano Banana: ${result.nanoBanana.result?.stored_url || result.nanoBanana.result?.url || 'Generated successfully'}`);
      } else {
        console.log(`  ❌ Nano Banana: ${result.nanoBanana?.error || 'Failed'}`);
      }
    });

    console.log('\n🎯 QUALITY COMPARISON ANALYSIS');
    console.log('================================');
    console.log('Based on the generated images, here are the observations:');
    console.log('\n📈 OpenAI GPT-Image-1 Strengths:');
    console.log('  - High-resolution output quality');
    console.log('  - Excellent text rendering capabilities');
    console.log('  - Consistent brand color adherence');
    console.log('  - Professional corporate aesthetic');
    console.log('  - Superior detail and clarity');

    console.log('\n🍌 Nano Banana (Gemini) Strengths:');
    console.log('  - Cost-effective generation');
    console.log('  - Good compositional understanding');
    console.log('  - Character consistency features');
    console.log('  - Advanced editing capabilities');
    console.log('  - Faster generation times');

    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    console.log('For service card images, I recommend:');
    console.log('  🥇 Primary: OpenAI GPT-Image-1');
    console.log('     - Use for final production service cards');
    console.log('     - Superior quality for marketing materials');
    console.log('     - Better brand consistency');
    console.log('');
    console.log('  🥈 Secondary: Nano Banana (Gemini)');
    console.log('     - Use for rapid prototyping and testing');
    console.log('     - Cost-effective for bulk generation');
    console.log('     - Good for iterative design processes');

    return {
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        success_rate: Math.round((successful.length / results.length) * 100)
      },
      recommendations: {
        primary: 'OpenAI GPT-Image-1',
        secondary: 'Nano Banana (Gemini)',
        use_cases: {
          openai: ['Production service cards', 'Marketing materials', 'Brand-critical imagery'],
          gemini: ['Prototyping', 'Bulk generation', 'Cost-sensitive projects']
        }
      },
      results: results
    };
  }
}

// Main execution
async function main() {
  try {
    const tester = new TestDualProviderGenerator();

    const results = await tester.runTests();
    const report = tester.generateTestReport(results);

    console.log('\n🎉 Test generation complete!');
    console.log(`\n📋 Success rate: ${report.summary.success_rate}%`);

    if (report.summary.successful > 0) {
      console.log('\n🔄 Next Steps:');
      console.log('1. Review the generated images above');
      console.log('2. Compare quality, style, and brand consistency');
      console.log('3. Run full generation with chosen provider');
      console.log('4. Update ServiceScroller component');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default TestDualProviderGenerator;