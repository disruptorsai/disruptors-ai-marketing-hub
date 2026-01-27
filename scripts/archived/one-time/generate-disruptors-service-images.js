/**
 * Disruptors AI Marketing Hub - Service Images Generator
 * Multi-provider image generation for 9 core service cards
 * Using established "Disruptors ancient style" system prompt
 */

import OpenAI from 'openai';
import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Script starting...');
console.log('📁 Directory:', __dirname);

// Initialize AI providers
console.log('🔑 Initializing AI providers...');

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN
});

console.log('✅ AI providers initialized');

// Disruptors Ancient Style System Prompt
const DISRUPTORS_STYLE_PROMPT = `DISRUPTORS ANCIENT STYLE: Professional corporate design with sophisticated blue-to-purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), clean minimalist composition, floating dashboard interfaces with interconnected nodes and data streams, abstract technology visualization, modern geometric elements, strategic negative space, soft professional lighting with subtle shadows, high-end SaaS aesthetic inspired by Stripe/Notion/Figma, futuristic digital interface elements, commercial photography quality, award-winning design standards, business-appropriate sophistication, AI-forward design philosophy emphasizing automation and intelligence, sophisticated tech-forward aesthetic, modern data visualization, professional workspace ambiance. Focus on abstract conceptual visualization over literal representation, with floating interface mockups, analytics dashboards, workflow networks, and technology iconography subtly integrated.`;

// Service definitions with specific focus areas
const SERVICES = [
  {
    id: 'ai-automation',
    name: 'AI Automation',
    description: 'Automate repetitive tasks and workflows',
    focus: 'Tech dashboard interfaces, automation workflows, AI processing visualization',
    priority: 1
  },
  {
    id: 'social-media-marketing',
    name: 'Social Media Marketing',
    description: 'Build and engage your community',
    focus: 'Social media analytics dashboards, engagement metrics, community management interfaces',
    priority: 2
  },
  {
    id: 'seo-geo',
    name: 'SEO & GEO',
    description: 'Get found by your ideal customers',
    focus: 'Analytics dashboards with map overlays, search ranking visualization, geographic data',
    priority: 3
  },
  {
    id: 'lead-generation',
    name: 'Lead Generation',
    description: 'Fill your pipeline with qualified prospects',
    focus: 'Conversion funnels, pipeline visualization, lead scoring interfaces',
    priority: 4
  },
  {
    id: 'paid-advertising',
    name: 'Paid Advertising',
    description: 'Maximize ROI across all channels',
    focus: 'PPC campaign dashboards, ROI tracking, multi-channel advertising interfaces',
    priority: 5
  },
  {
    id: 'podcasting',
    name: 'Podcasting',
    description: 'Build authority through audio content',
    focus: 'Audio waveform visualization, podcast analytics, content creation interfaces',
    priority: 6
  },
  {
    id: 'custom-apps',
    name: 'Custom Apps',
    description: 'Tailored solutions for your needs',
    focus: 'Development environments, code interfaces, app building visualization',
    priority: 7
  },
  {
    id: 'crm-management',
    name: 'CRM Management',
    description: 'Organize and nurture your relationships',
    focus: 'Customer relationship dashboards, contact management interfaces, pipeline tracking',
    priority: 8
  },
  {
    id: 'fractional-cmo',
    name: 'Fractional CMO',
    description: 'Strategic marketing leadership',
    focus: 'Executive dashboards, strategic planning interfaces, high-level marketing analytics',
    priority: 9
  }
];

// Provider configurations
const PROVIDERS = {
  openai: {
    name: 'OpenAI GPT-Image-1',
    model: 'gpt-image-1',
    dimensions: '1536x1024'
  },
  gemini: {
    name: 'Google Gemini 2.5 Flash Image',
    model: 'gemini-2.5-flash-002'
  },
  replicate: {
    name: 'Replicate Flux Pro',
    model: 'black-forest-labs/flux-1.1-pro',
    dimensions: { width: 1536, height: 1024 }
  }
};

/**
 * Generate prompt for specific service
 */
function createServicePrompt(service) {
  return `${DISRUPTORS_STYLE_PROMPT}

SPECIFIC SERVICE: ${service.name} - ${service.description}
FOCUS ELEMENTS: ${service.focus}

Create a professional service card image that visualizes ${service.name.toLowerCase()} through abstract dashboard interfaces and technology visualization. The composition should feature floating UI mockups, data visualization elements, and workflow networks that conceptually represent ${service.description.toLowerCase()}. Maintain the sophisticated blue-to-purple gradient color scheme and high-end SaaS aesthetic throughout. The image should be suitable for a marketing website service card, emphasizing professionalism and technological sophistication.

Dimensions: 1536x1024 pixels (16:9 aspect ratio)
Style: Abstract, conceptual, dashboard-focused visualization`;
}

/**
 * Generate image using OpenAI
 */
async function generateWithOpenAI(service) {
  try {
    console.log(`🎨 Generating ${service.name} with OpenAI GPT-Image-1...`);

    const prompt = createServicePrompt(service);

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '1536x1024',
      quality: 'high'
    });

    return {
      provider: 'openai',
      model: 'gpt-image-1',
      url: response.data[0]?.url || 'base64_data',
      b64_json: response.data[0]?.b64_json,
      revised_prompt: response.data[0]?.revised_prompt,
      success: true
    };
  } catch (error) {
    console.error(`❌ OpenAI generation failed for ${service.name}:`, error.message);
    return {
      provider: 'openai',
      model: 'gpt-image-1',
      success: false,
      error: error.message
    };
  }
}

// Removed Gemini generation - focusing on OpenAI and Replicate for now

/**
 * Generate image using Replicate
 */
async function generateWithReplicate(service) {
  try {
    console.log(`🎨 Generating ${service.name} with Replicate Flux Pro...`);

    const prompt = createServicePrompt(service);

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: prompt,
          width: 1536,
          height: 1024,
          steps: 25,
          guidance: 3.5,
          seed: Math.floor(Math.random() * 100000),
          output_format: "webp",
          output_quality: 90
        }
      }
    );

    return {
      provider: 'replicate',
      model: 'flux-1.1-pro',
      url: output[0],
      success: true
    };
  } catch (error) {
    console.error(`❌ Replicate generation failed for ${service.name}:`, error.message);
    return {
      provider: 'replicate',
      model: 'flux-1.1-pro',
      success: false,
      error: error.message
    };
  }
}

/**
 * Download and save image (handles both URL and base64)
 */
async function saveImage(result, filename) {
  try {
    let buffer;

    if (result.url && result.url !== 'base64_data') {
      // Handle URL download
      const response = await fetch(result.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      buffer = await response.arrayBuffer();
    } else if (result.b64_json) {
      // Handle base64 data
      buffer = Buffer.from(result.b64_json, 'base64');
    } else {
      throw new Error('No URL or base64 data available');
    }

    const outputDir = path.join(__dirname, '..', 'generated');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, Buffer.from(buffer));

    console.log(`💾 Saved: ${filename}`);
    return filepath;
  } catch (error) {
    console.error(`❌ Save failed for ${filename}:`, error.message);
    return null;
  }
}

/**
 * Generate images for a single service across all providers
 */
async function generateServiceImages(service) {
  console.log(`\n🚀 Generating images for: ${service.name}`);

  const results = {
    service: service,
    generations: [],
    timestamp: new Date().toISOString()
  };

  // Generate with each provider
  const providers = [
    () => generateWithOpenAI(service),
    () => generateWithReplicate(service)
  ];

  for (const generateFn of providers) {
    try {
      const result = await generateFn();
      results.generations.push(result);

      // Save successful generations
      if (result.success && (result.url || result.b64_json)) {
        const extension = result.b64_json ? 'png' : 'webp';
        const filename = `${service.id}-${result.provider}-${Date.now()}.${extension}`;
        const filepath = await saveImage(result, filename);
        if (filepath) {
          result.local_path = filepath;
        }
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Provider generation error:`, error.message);
    }
  }

  return results;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎯 Disruptors AI Marketing Hub - Service Images Generator');
  console.log('===============================================\n');

  const allResults = {
    project: 'Disruptors AI Marketing Hub',
    style: 'Disruptors Ancient Style',
    dimensions: '1536x1024',
    total_services: SERVICES.length,
    services: [],
    generation_summary: {
      total_attempts: 0,
      successful_generations: 0,
      failed_generations: 0,
      providers_used: []
    },
    timestamp: new Date().toISOString()
  };

  // Generate images for each service
  for (const service of SERVICES) {
    const serviceResults = await generateServiceImages(service);
    allResults.services.push(serviceResults);

    // Update summary
    allResults.generation_summary.total_attempts += serviceResults.generations.length;
    serviceResults.generations.forEach(gen => {
      if (gen.success) {
        allResults.generation_summary.successful_generations++;
      } else {
        allResults.generation_summary.failed_generations++;
      }

      if (!allResults.generation_summary.providers_used.includes(gen.provider)) {
        allResults.generation_summary.providers_used.push(gen.provider);
      }
    });

    console.log(`✅ Completed ${service.name}: ${serviceResults.generations.filter(g => g.success).length}/${serviceResults.generations.length} successful`);
  }

  // Save comprehensive results
  const resultsFilename = `disruptors-service-images-${new Date().toISOString().split('T')[0]}.json`;
  const resultsPath = path.join(__dirname, '..', 'generated', resultsFilename);

  fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
  console.log(`\n📊 Results saved to: ${resultsFilename}`);

  // Print summary
  console.log('\n📈 GENERATION SUMMARY');
  console.log('=====================');
  console.log(`Total Services: ${allResults.total_services}`);
  console.log(`Total Attempts: ${allResults.generation_summary.total_attempts}`);
  console.log(`Successful: ${allResults.generation_summary.successful_generations}`);
  console.log(`Failed: ${allResults.generation_summary.failed_generations}`);
  console.log(`Success Rate: ${((allResults.generation_summary.successful_generations / allResults.generation_summary.total_attempts) * 100).toFixed(1)}%`);
  console.log(`Providers Used: ${allResults.generation_summary.providers_used.join(', ')}`);

  return allResults;
}

// Execute if called directly
console.log('✅ Executing main function...');
main().catch(console.error);

export default main;