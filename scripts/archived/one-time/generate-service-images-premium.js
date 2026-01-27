#!/usr/bin/env node

/**
 * Premium Service Images Generator
 * High-end design approach inspired by Stripe, Notion, Figma
 * Uses GPT-Image-1 exclusively (DALL-E 3 forbidden)
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base design elements for consistency
const BRAND_COLORS = '#1e3a8a, #3730a3, #7c3aed, #8b5cf6';
const BASE_STYLE = 'professional corporate design, clean minimalist composition, sophisticated lighting with soft shadows, high-end SaaS aesthetic, modern geometric elements, floating interface components, strategic negative space, commercial photography quality, award-winning design, high resolution';

// Service definitions with high-end concepts
const SERVICES = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    concept: 'Workflow Network Visualization',
    prompt: `Abstract AI automation workflow network, floating dashboard interfaces with interconnected nodes and data streams, robotic process automation visualization, workflow diagrams with flowing connections, automated task management system, subtle gear and circuit elements integrated, modern tech workspace aesthetic, sophisticated blue to purple gradient background (${BRAND_COLORS}), ${BASE_STYLE}`
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    concept: 'Social Graph & Engagement',
    prompt: `Social network graph visualization with floating engagement metrics, modern social media dashboard interface, content calendar grid layout, social platform integration display, engagement analytics with likes, shares, comments visualized, community growth visualization, purple-dominant gradient with social connectivity elements (${BRAND_COLORS}), ${BASE_STYLE}`
  },
  {
    id: 'seo-geo',
    title: 'SEO & GEO',
    concept: 'Search Rankings & Maps',
    prompt: `SEO analytics dashboard with upward trending ranking charts, geographic targeting map interface with location pins, search engine optimization metrics display, local search results visualization, keyword ranking graphs floating in space, map-based targeting interface, blue-dominant gradient with geographic elements (${BRAND_COLORS}), ${BASE_STYLE}`
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    concept: 'Conversion Funnel Flow',
    prompt: `Lead generation funnel visualization with flowing prospect data, customer journey mapping interface, conversion rate displays and metrics, sales pipeline dashboard with stages, lead scoring visualization, prospect flow through conversion stages, gradient showing conversion progression (${BRAND_COLORS}), ${BASE_STYLE}`
  },
  {
    id: 'paid-advertising',
    title: 'Paid Advertising',
    concept: 'Multi-Platform ROI Dashboard',
    prompt: `Multi-platform advertising campaign dashboard, ROI charts and performance metrics floating, ad creative mockups with performance data, campaign management interface, cross-platform advertising analytics, cost-per-click visualization, advertising platform integration display, dynamic gradient showing growth metrics (${BRAND_COLORS}), ${BASE_STYLE}`
  },
  {
    id: 'podcasting',
    title: 'Podcasting',
    concept: 'Audio Waveform Studio',
    prompt: `Professional podcast studio visualization with audio waveforms, sound wave graphics flowing through space, podcast analytics dashboard, recording equipment and microphone elements, audio editing interface components, podcast platform distribution display, broadcasting control panel, audio-focused gradient design (${BRAND_COLORS}), ${BASE_STYLE}`
  },
  {
    id: 'custom-apps',
    title: 'Custom Apps',
    concept: 'Development Workflow',
    prompt: `Mobile and web app development workspace, floating device mockups (smartphone, tablet, laptop), code editor interface screens, development workflow visualization, app prototyping and wireframe elements, programming environment display, multi-device responsive design showcase, tech-focused gradient with UI elements (${BRAND_COLORS}), ${BASE_STYLE}`
  },
  {
    id: 'crm-management',
    title: 'CRM Management',
    concept: 'Relationship Network Map',
    prompt: `Customer relationship management network visualization, contact database interface with connection lines, relationship mapping between customers and business, CRM dashboard with customer data organization, sales pipeline and contact management display, customer journey tracking interface, data-focused gradient design (${BRAND_COLORS}), ${BASE_STYLE}`
  },
  {
    id: 'fractional-cmo',
    title: 'Fractional CMO',
    concept: 'Strategic Executive Dashboard',
    prompt: `Executive marketing strategy dashboard, strategic planning interface with growth metrics, business analytics and KPI visualization, marketing performance executive summary, strategic decision-making interface, leadership-level marketing analytics, growth trajectory visualization, executive-level gradient design (${BRAND_COLORS}), ${BASE_STYLE}`
  }
];

class PremiumServiceImageGenerator {
  constructor() {
    // Check for API key
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY or OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({ apiKey });
    this.results = [];
  }

  async generateServiceImage(service) {
    console.log(`🎨 Generating ${service.title} (${service.concept})...`);
    console.log(`🚫 Using GPT-Image-1 only - DALL-E 3 excluded`);

    try {
      const response = await this.openai.images.generate({
        model: "gpt-image-1", // NEVER use DALL-E 3
        prompt: service.prompt,
        n: 1,
        size: "1536x1024", // Landscape ratio for service cards
        quality: "high"
      });

      const imageUrl = response.data[0].url;

      console.log(`✅ Generated: ${service.title}`);
      console.log(`🔗 URL: ${imageUrl}`);

      return {
        serviceId: service.id,
        title: service.title,
        concept: service.concept,
        imageUrl: imageUrl,
        prompt: service.prompt,
        timestamp: new Date().toISOString(),
        model: 'gpt-image-1',
        size: '1536x1024',
        quality: 'high',
        note: 'Generated with DALL-E 3 exclusion policy'
      };

    } catch (error) {
      console.error(`❌ Error generating ${service.title}:`, error.message);
      return {
        serviceId: service.id,
        title: service.title,
        concept: service.concept,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateAll() {
    console.log('🚀 Starting Premium Service Image Generation');
    console.log('🔒 DALL-E 3 is strictly forbidden - using GPT-Image-1 only');
    console.log(`🎯 Generating ${SERVICES.length} high-end service images\n`);

    for (const service of SERVICES) {
      try {
        const result = await this.generateServiceImage(service);
        this.results.push(result);

        console.log(`✅ Completed: ${service.title}\n`);

        // Small delay to be respectful to API
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Failed to process ${service.title}:`, error.message);
        this.results.push({
          serviceId: service.id,
          title: service.title,
          concept: service.concept,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return this.results;
  }

  generateServiceScrollerCode() {
    const successfulResults = this.results.filter(result => !result.error && result.imageUrl);

    const services = successfulResults.map(result => ({
      title: result.title,
      hook: this.getServiceHook(result.serviceId),
      link: `solutions-${result.serviceId}`,
      image: result.imageUrl
    }));

    return `// Updated ServiceScroller services array
const services = [
${services.map(service => `  {
    title: "${service.title}",
    hook: "${service.hook}",
    link: "${service.link}",
    image: "${service.image}"
  }`).join(',\n')}
];`;
  }

  getServiceHook(serviceId) {
    const hooks = {
      'ai-automation': 'Automate repetitive tasks and workflows',
      'social-media-marketing': 'Build and engage your community',
      'seo-geo': 'Get found by your ideal customers',
      'lead-generation': 'Fill your pipeline with qualified prospects',
      'paid-advertising': 'Maximize ROI across all channels',
      'podcasting': 'Build authority through audio content',
      'custom-apps': 'Tailored solutions for your needs',
      'crm-management': 'Organize and nurture your relationships',
      'fractional-cmo': 'Strategic marketing leadership'
    };
    return hooks[serviceId] || 'Professional service solutions';
  }

  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    const generatedDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(generatedDir, { recursive: true });

    const output = {
      timestamp: new Date().toISOString(),
      generator: 'Premium Service Images Generator',
      model: 'gpt-image-1 (DALL-E 3 excluded)',
      approach: 'High-end SaaS design inspired by Stripe, Notion, Figma',
      brandColors: BRAND_COLORS,
      designPrinciples: [
        'Abstract conceptual visualization',
        'Consistent brand language',
        '3D floating interfaces',
        'Professional lighting and shadows',
        'Clean minimalist composition',
        'Modern data visualization'
      ],
      services: SERVICES,
      results: this.results,
      serviceScrollerCode: this.generateServiceScrollerCode(),
      summary: {
        total: SERVICES.length,
        successful: this.results.filter(r => !r.error).length,
        failed: this.results.filter(r => r.error).length,
        successRate: Math.round((this.results.filter(r => !r.error).length / SERVICES.length) * 100)
      }
    };

    const filename = `premium-service-images-${timestamp}.json`;
    const filepath = path.join(generatedDir, filename);

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`📄 Results saved to: ${filepath}`);

    return output;
  }
}

// Main execution
async function main() {
  try {
    const generator = new PremiumServiceImageGenerator();
    const results = await generator.generateAll();
    const output = await generator.saveResults();

    console.log('\n🎉 Premium Service Image Generation Complete!');
    console.log(`✅ Successful: ${output.summary.successful}`);
    console.log(`❌ Failed: ${output.summary.failed}`);
    console.log(`📈 Success rate: ${output.summary.successRate}%`);

    if (output.summary.successful > 0) {
      console.log('\n🔗 Generated Service Images:');
      results.filter(r => !r.error).forEach(result => {
        console.log(`  ${result.title}: ${result.imageUrl}`);
      });

      console.log('\n📝 ServiceScroller Component Code:');
      console.log(output.serviceScrollerCode);
    }

    if (output.summary.failed > 0) {
      console.log('\n❌ Failed Generations:');
      results.filter(r => r.error).forEach(result => {
        console.log(`  ${result.title}: ${result.error}`);
      });
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);