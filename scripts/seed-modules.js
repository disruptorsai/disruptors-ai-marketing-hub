/**
 * Seed Modules Script
 *
 * Seeds the modules table with initial module data.
 * Run this after applying the modules migration.
 *
 * Usage: node scripts/seed-modules.js
 *
 * Requires environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(dirname(__dirname), '.env') });

// Initialize Supabase client with service role
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('ERROR: Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Module definitions to seed
 */
const modules = [
  {
    slug: 'keyword-research',
    name: 'Keyword Research',
    version: '1.0.0',
    description: 'AI-powered keyword research with real search volume, difficulty, and CPC data from DataForSEO. Find profitable keywords with opportunity scoring algorithm that balances high volume with low competition.',
    category: 'seo',
    status: 'approved',
    audience: ['internal', 'client', 'public'],
    requires_brain: true,
    requires_auth: true,
    runtime_preference: 'serverless',
    entry_point: 'src/modules/keyword-research/index.jsx',
    function_endpoint: '/.netlify/functions/module-keyword-research',
    component_path: 'src/modules/keyword-research/KeywordResearchUI.jsx',
    icon_url: '/generated/anachron-lite/keyword-research-icon-anachron-lite.png',
    color: '#2C6BAA',
    tags: ['seo', 'keywords', 'research', 'dataforseo', 'search-volume', 'competition'],
    input_schema: {
      type: 'object',
      properties: {
        seed_keyword: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'The seed keyword to research'
        },
        location: {
          type: 'string',
          default: '2840',
          description: 'Geographic location code (2840 = US, 2826 = UK, 2124 = Canada, 2036 = Australia, 2554 = New Zealand)'
        },
        language: {
          type: 'string',
          default: 'en',
          description: 'Language code for search results'
        },
        limit: {
          type: 'number',
          minimum: 10,
          maximum: 100,
          default: 50,
          description: 'Maximum number of keywords to return'
        }
      },
      required: ['seed_keyword']
    },
    output_schema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              keyword: { type: 'string' },
              search_volume: { type: 'number' },
              competition: { type: 'number' },
              competition_level: {
                type: 'string',
                enum: ['Low', 'Medium', 'High']
              },
              cpc: { type: 'number' },
              difficulty: { type: 'number' },
              trend: { type: 'number' },
              opportunity_score: { type: 'number' }
            }
          }
        },
        count: { type: 'number' },
        search_term: { type: 'string' },
        location: { type: 'string' },
        business_context: {
          type: 'object',
          properties: {
            industry: { type: 'string' },
            location: { type: 'string' }
          }
        }
      }
    },
    config_schema: {
      type: 'object',
      properties: {
        default_location: {
          type: 'string',
          default: '2840',
          description: 'Default location code for searches'
        },
        default_language: {
          type: 'string',
          default: 'en',
          description: 'Default language for results'
        },
        results_limit: {
          type: 'number',
          minimum: 10,
          maximum: 100,
          default: 50,
          description: 'Default number of results to return'
        },
        auto_save_to_posts: {
          type: 'boolean',
          default: false,
          description: 'Automatically save selected keywords to posts table'
        },
        show_trends: {
          type: 'boolean',
          default: true,
          description: 'Display trend indicators'
        },
        min_search_volume: {
          type: 'number',
          default: 0,
          description: 'Filter out keywords below this search volume'
        }
      }
    },
    wordpress_compatible: true,
    wordpress_shortcode: '[disruptors_keyword_research]',
    wordpress_block: 'disruptors/keyword-research',
    wordpress_embed_type: 'iframe',
    supports_batch: false,
    has_preview: true,
    is_experimental: false,
    default_daily_limit: 10,
    default_monthly_limit: 100,
    default_cost_per_run: 0.05,
    documentation_url: 'https://docs.disruptorsmedia.com/modules/keyword-research',
    changelog: 'v1.0.0 - Initial release with DataForSEO integration, opportunity scoring, and multi-location support'
  },
  {
    slug: 'ai-content-writer',
    name: 'AI Content Writer',
    version: '1.0.0',
    description: 'Generate SEO-optimized blog posts and web content powered by Claude AI. Automatically uses your Business Brain for brand-consistent, personalized content.',
    category: 'content',
    status: 'approved',
    audience: ['internal', 'client'],
    requires_brain: true,
    requires_auth: true,
    runtime_preference: 'serverless',
    entry_point: 'src/modules/ai-content-writer/index.jsx',
    function_endpoint: '/.netlify/functions/module-ai-content-writer',
    component_path: 'src/modules/ai-content-writer/AIContentWriterUI.jsx',
    icon_url: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1/disruptors-media/icons/content-icon.svg',
    color: '#8B5CF6',
    tags: ['content', 'writing', 'ai', 'claude', 'seo', 'blog'],
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', minLength: 3, maxLength: 200 },
        primary_keyword: { type: 'string' },
        secondary_keywords: { type: 'array', items: { type: 'string' } },
        tone: { type: 'string', enum: ['professional', 'casual', 'technical', 'conversational'] },
        word_count: { type: 'number', minimum: 300, maximum: 3000, default: 1200 }
      },
      required: ['topic']
    },
    output_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        meta_description: { type: 'string' },
        excerpt: { type: 'string' },
        slug: { type: 'string' }
      }
    },
    config_schema: {
      type: 'object',
      properties: {
        default_tone: { type: 'string', default: 'professional' },
        default_word_count: { type: 'number', default: 1200 },
        include_faq: { type: 'boolean', default: true }
      }
    },
    wordpress_compatible: true,
    wordpress_shortcode: '[disruptors_content_writer]',
    wordpress_block: 'disruptors/content-writer',
    wordpress_embed_type: 'rest-api',
    supports_batch: true,
    has_preview: true,
    is_experimental: false,
    default_daily_limit: 20,
    default_monthly_limit: 200,
    default_cost_per_run: 0.15,
    documentation_url: 'https://docs.disruptors.ai/modules/ai-content-writer',
    changelog: '1.0.0 - Initial release with Claude Sonnet 4.5 integration'
  },
  {
    slug: 'growth-audit',
    name: 'Growth Audit',
    version: '1.0.0',
    description: 'Instant AI-powered website analysis. Automatically detect opportunities across SEO, content, performance, CRO, and more. Get actionable recommendations with 30/60/90 day execution plans.',
    category: 'analytics',
    status: 'review',
    audience: ['internal', 'public'],
    requires_brain: false,
    requires_auth: false,
    runtime_preference: 'node-heavy',
    entry_point: 'src/modules/growth-audit/index.jsx',
    function_endpoint: '/.netlify/functions/module-growth-audit',
    component_path: 'src/modules/growth-audit/GrowthAuditUI.jsx',
    icon_url: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1/disruptors-media/icons/audit-icon.svg',
    color: '#10B981',
    tags: ['analytics', 'audit', 'seo', 'performance', 'growth'],
    input_schema: {
      type: 'object',
      properties: {
        website_url: { type: 'string', format: 'uri' },
        email: { type: 'string', format: 'email' },
        industry: { type: 'string' }
      },
      required: ['website_url', 'email']
    },
    output_schema: {
      type: 'object',
      properties: {
        job_id: { type: 'string' },
        status: { type: 'string' },
        opportunities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              priority: { type: 'string' },
              description: { type: 'string' },
              execution_plan: { type: 'string' }
            }
          }
        }
      }
    },
    config_schema: {
      type: 'object',
      properties: {
        max_opportunities: { type: 'number', default: 15 }
      }
    },
    wordpress_compatible: false,
    wordpress_shortcode: null,
    wordpress_block: null,
    wordpress_embed_type: 'iframe',
    supports_batch: false,
    has_preview: false,
    is_experimental: false,
    default_daily_limit: 3,
    default_monthly_limit: 10,
    default_cost_per_run: 0.50,
    documentation_url: 'https://docs.disruptors.ai/modules/growth-audit',
    changelog: '1.0.0 - Initial release with Firecrawl and Claude integration'
  },
  // Template module (for reference, testing status)
  {
    slug: 'module-template',
    name: 'Module Template',
    version: '1.0.0',
    description: 'Template for creating new modules in the Disruptors AI system. Use this as a starting point for building custom modules.',
    category: 'utility',
    status: 'testing',
    audience: ['internal'],
    requires_brain: true,
    requires_auth: true,
    runtime_preference: 'serverless',
    entry_point: 'src/modules/_template/index.jsx',
    function_endpoint: '/.netlify/functions/module-template',
    component_path: 'src/modules/_template/ModuleUI.jsx',
    icon_url: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1/disruptors-media/icons/template-icon.svg',
    color: '#6B7280',
    tags: ['template', 'example', 'starter'],
    input_schema: {
      type: 'object',
      properties: {
        input_text: { type: 'string' }
      },
      required: ['input_text']
    },
    output_schema: {
      type: 'object',
      properties: {
        result: { type: 'string' }
      }
    },
    config_schema: {
      type: 'object',
      properties: {
        setting_example: { type: 'boolean', default: true }
      }
    },
    wordpress_compatible: false,
    wordpress_shortcode: null,
    wordpress_block: null,
    wordpress_embed_type: 'iframe',
    supports_batch: false,
    has_preview: true,
    is_experimental: true,
    default_daily_limit: 10,
    default_monthly_limit: 100,
    default_cost_per_run: 0.0,
    documentation_url: 'https://docs.disruptors.ai/modules/template',
    changelog: '1.0.0 - Initial template'
  }
];

/**
 * Seed modules
 */
async function seedModules() {
  console.log('🌱 Seeding modules...\n');

  for (const module of modules) {
    try {
      // Check if module already exists
      const { data: existing } = await supabase
        .from('modules')
        .select('id, slug')
        .eq('slug', module.slug)
        .single();

      if (existing) {
        console.log(`⚠️  Module "${module.slug}" already exists, updating...`);

        // Update existing module
        const { error } = await supabase
          .from('modules')
          .update(module)
          .eq('slug', module.slug);

        if (error) {
          console.error(`   ❌ Error updating module: ${error.message}`);
        } else {
          console.log(`   ✅ Updated "${module.name}" (${module.status})`);
        }
      } else {
        // Insert new module
        const { error } = await supabase
          .from('modules')
          .insert(module);

        if (error) {
          console.error(`❌ Error inserting module "${module.slug}": ${error.message}`);
        } else {
          console.log(`✅ Inserted "${module.name}" (${module.status})`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing module "${module.slug}":`, error);
    }
  }

  console.log('\n✨ Module seeding complete!');
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Disruptors AI - Module Seeding Script');
  console.log('═══════════════════════════════════════════════════\n');

  // Test database connection
  const { data: testData, error: testError } = await supabase
    .from('modules')
    .select('count', { count: 'exact', head: true });

  if (testError) {
    console.error('❌ Database connection failed:', testError.message);
    console.error('\nMake sure the modules migration has been applied:');
    console.error('  supabase/migrations/20251010_modules_infrastructure.sql\n');
    process.exit(1);
  }

  console.log(`✅ Database connected (${testData ? 'modules table exists' : 'table missing'})\n`);

  await seedModules();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Done!');
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
