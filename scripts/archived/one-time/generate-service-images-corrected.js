#!/usr/bin/env node

/**
 * Corrected Premium Service Images Generator
 * Fixed to handle base64 response format from GPT-Image-1
 * Generates one image at a time to avoid timeouts
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

class CorrectedServiceImageGenerator {
  constructor() {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY or OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async generateSingleImage(service) {
    console.log(`\n🎨 Generating ${service.title} (${service.concept})`);
    console.log(`🚫 Using GPT-Image-1 only - DALL-E 3 excluded`);

    try {
      const response = await this.openai.images.generate({
        model: "gpt-image-1", // NEVER use DALL-E 3
        prompt: service.prompt,
        n: 1,
        size: "1536x1024", // Landscape ratio
        quality: "high"
      });

      // Handle base64 response format
      const imageData = response.data[0];
      let imageUrl;

      if (imageData.b64_json) {
        // Convert base64 to data URL for browser compatibility
        imageUrl = `data:image/png;base64,${imageData.b64_json}`;
        console.log(`✅ Generated base64 image (${Math.round(imageData.b64_json.length / 1024)}KB)`);
      } else if (imageData.url) {
        imageUrl = imageData.url;
        console.log(`✅ Generated URL image: ${imageUrl}`);
      } else {
        throw new Error('No image data returned');
      }

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
        note: 'Generated with DALL-E 3 exclusion policy',
        hasBase64: !!imageData.b64_json,
        hasUrl: !!imageData.url
      };

    } catch (error) {
      console.error(`❌ Error generating ${service.title}:`, error.message);
      throw error;
    }
  }

  async saveResult(result) {
    const timestamp = new Date().toISOString().split('T')[0];
    const generatedDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(generatedDir, { recursive: true });

    const filename = `${result.serviceId}-image-${timestamp}.json`;
    const filepath = path.join(generatedDir, filename);

    await fs.writeFile(filepath, JSON.stringify(result, null, 2));
    console.log(`📄 Saved to: ${filename}`);

    return filepath;
  }
}

// Generate specific service image
async function generateService(serviceId) {
  const service = SERVICES.find(s => s.id === serviceId);
  if (!service) {
    console.error(`❌ Service not found: ${serviceId}`);
    process.exit(1);
  }

  try {
    const generator = new CorrectedServiceImageGenerator();
    const result = await generator.generateSingleImage(service);
    await generator.saveResult(result);

    console.log(`\n🎉 ${service.title} image generated successfully!`);
    console.log(`📊 Image format: ${result.hasBase64 ? 'Base64' : 'URL'}`);
    console.log(`🔗 Preview: Open the JSON file to view the image data`);

    return result;

  } catch (error) {
    console.error(`💥 Failed to generate ${service.title}:`, error.message);
    process.exit(1);
  }
}

// Main execution
const serviceId = process.argv[2];

if (!serviceId) {
  console.log('🚀 Premium Service Image Generator');
  console.log('🚫 DALL-E 3 is strictly excluded - GPT-Image-1 only');
  console.log('\nUsage: node generate-service-images-corrected.js <service-id>');
  console.log('\nAvailable services:');
  SERVICES.forEach(service => {
    console.log(`  ${service.id} - ${service.title} (${service.concept})`);
  });
  process.exit(1);
}

generateService(serviceId).catch(console.error);