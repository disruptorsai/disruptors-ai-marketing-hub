/**
 * Seed Lead Magnet Resources
 *
 * Seeds the database with 3 initial lead magnet resources:
 * - n8n Workflows
 * - ChatGPT Prompts
 * - Content Workflow
 *
 * Usage: node scripts/seed-lead-magnet-resources.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - VITE_SUPABASE_URL')
  console.error('   - VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const SEED_RESOURCES = [
  {
    slug: 'n8n-workflows',
    title: '5 Ready-to-Import n8n Workflows',
    subtitle: 'Automate marketing for $50/month instead of $500+',
    description: `Stop paying Zapier $500/month when n8n can do the same thing for $50.

These 5 workflows handle the boring stuff so you can focus on growing your business:
- Auto-post LinkedIn content from your blog
- Generate weekly social media carousels from one idea
- Send personalized cold emails with AI research
- Auto-respond to form submissions with brand-specific answers
- Monitor competitors and send Slack alerts

Each workflow is tested, documented, and ready to import in 2 clicks.`,
    category: 'automation',
    tags: ['n8n', 'automation', 'workflows', 'ai', 'zapier-alternative'],
    icon_name: 'Workflow',
    icon_color: 'text-purple-500',
    preview_image_url: '',
    file_url: 'https://drive.google.com/file/d/YOUR_FILE_ID/view', // TODO: Replace with actual URL
    file_type: 'zip',
    file_size: '2.5 MB',
    download_count: 0,
    view_count: 0,
    is_featured: true,
    is_active: true,
    seo_title: '5 Free n8n Workflows - Replace Zapier for 90% Less',
    seo_description: 'Download 5 battle-tested n8n workflows that automate marketing tasks. LinkedIn posting, email sequences, competitor monitoring, and more.',
    seo_keywords: ['n8n workflows', 'zapier alternative', 'marketing automation', 'free workflows', 'n8n templates'],
    whats_inside: [
      '5 JSON workflow files (import in 2 clicks)',
      'Video setup guide (22 minutes)',
      'AI prompt library (50+ tested prompts)',
      'Brand voice training template',
      'Troubleshooting guide'
    ],
    related_resources: [],
  },
  {
    slug: 'chatgpt-prompts',
    title: '50 ChatGPT Marketing Prompts',
    subtitle: 'Stop getting generic AI outputs—use prompts with brand voice built-in',
    description: `Generic ChatGPT prompts give you generic content. These 50 prompts come with a "Business Brain Formula" that teaches ChatGPT your brand voice before generating content.

What you get:
- 50 copy-paste ready prompts (blog posts, emails, ads, social posts)
- Business Brain Formula template (teaches ChatGPT who you are)
- Custom GPT setup guide (build your own brand-specific GPT)
- Real examples showing good vs. bad outputs
- Monthly prompt updates (delivered via email)

Each prompt follows a proven structure: Context → Task → Format → Constraints → Examples.`,
    category: 'ai',
    tags: ['chatgpt', 'prompts', 'ai', 'content', 'copywriting', 'brand-voice'],
    icon_name: 'Sparkles',
    icon_color: 'text-blue-500',
    preview_image_url: '',
    file_url: 'https://drive.google.com/file/d/YOUR_FILE_ID/view', // TODO: Replace with actual URL
    file_type: 'pdf',
    file_size: '1.8 MB',
    download_count: 0,
    view_count: 0,
    is_featured: true,
    is_active: true,
    seo_title: '50 Free ChatGPT Marketing Prompts with Brand Voice',
    seo_description: 'Stop getting generic AI outputs. Download 50 ChatGPT prompts designed to maintain your brand voice across all marketing content.',
    seo_keywords: ['chatgpt prompts', 'ai marketing prompts', 'brand voice ai', 'chatgpt templates', 'marketing automation'],
    whats_inside: [
      '50 copy-paste ready prompts',
      'Business Brain Formula template',
      'Custom GPT setup guide (18 min video)',
      'Real examples (good vs. bad outputs)',
      'Monthly prompt updates'
    ],
    related_resources: [],
  },
  {
    slug: 'content-workflow',
    title: 'The 30-Minute AI Content Factory',
    subtitle: 'One idea → 15 pieces of content in half an hour',
    description: `Most people use AI to write one blog post at a time. This workflow shows you how to generate 15 pieces of content from a single idea in 30 minutes.

Here's the system:
1. Start with one core idea (blog post, case study, webinar)
2. Extract 5 key insights using AI
3. Generate 15 content variations (LinkedIn posts, tweets, emails, carousels, video scripts)
4. Customize for your brand voice
5. Schedule everything for the next 2 weeks

Includes:
- Step-by-step workflow (6 phases, fully documented)
- Prompt templates for each content type
- Brand voice training guide
- Tool stack comparison ($0 to $100/month options)
- 45-minute video walkthrough`,
    category: 'content',
    tags: ['content', 'ai', 'workflow', 'automation', 'repurposing', 'social-media'],
    icon_name: 'Zap',
    icon_color: 'text-orange-500',
    preview_image_url: '',
    file_url: 'https://drive.google.com/file/d/YOUR_FILE_ID/view', // TODO: Replace with actual URL
    file_type: 'pdf',
    file_size: '3.2 MB',
    download_count: 0,
    view_count: 0,
    is_featured: true,
    is_active: true,
    seo_title: 'Free AI Content Workflow - 1 Idea → 15 Pieces in 30 Minutes',
    seo_description: 'Download the exact system to repurpose one idea into 15 pieces of content using AI. Includes prompts, tools, and video walkthrough.',
    seo_keywords: ['ai content workflow', 'content repurposing', 'ai marketing', 'content automation', 'social media automation'],
    whats_inside: [
      '6-phase workflow (step-by-step)',
      'Prompt templates (copy-paste ready)',
      'Brand voice training guide',
      'Tool stack comparison ($0-$100/month)',
      'Video walkthrough (45 minutes)'
    ],
    related_resources: [],
  },
]

async function seedResources() {
  console.log('🌱 Seeding lead magnet resources...\n')

  try {
    // Check if resources already exist
    const { data: existing, error: checkError } = await supabase
      .from('lead_magnet_resources')
      .select('slug')
      .in('slug', SEED_RESOURCES.map(r => r.slug))

    if (checkError) {
      throw checkError
    }

    if (existing && existing.length > 0) {
      console.log('⚠️  Some resources already exist:')
      existing.forEach(r => console.log(`   - ${r.slug}`))
      console.log('\n❓ Do you want to update them? (Ctrl+C to cancel)\n')

      // Wait 3 seconds for user to cancel
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Delete existing resources
      const { error: deleteError } = await supabase
        .from('lead_magnet_resources')
        .delete()
        .in('slug', existing.map(r => r.slug))

      if (deleteError) {
        throw deleteError
      }

      console.log('🗑️  Deleted existing resources\n')
    }

    // Insert new resources
    const { data, error } = await supabase
      .from('lead_magnet_resources')
      .insert(SEED_RESOURCES)
      .select()

    if (error) {
      throw error
    }

    console.log('✅ Successfully seeded resources:\n')
    data.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title}`)
      console.log(`   - Slug: ${resource.slug}`)
      console.log(`   - Category: ${resource.category}`)
      console.log(`   - Tags: ${resource.tags.join(', ')}`)
      console.log(`   - Featured: ${resource.is_featured ? 'Yes' : 'No'}`)
      console.log(`   - Active: ${resource.is_active ? 'Yes' : 'No'}`)
      console.log('')
    })

    console.log('🎉 Seeding complete!')
    console.log('\n📝 Next steps:')
    console.log('   1. Update file_url fields with actual Google Drive/Cloudinary URLs')
    console.log('   2. Add preview images (optional)')
    console.log('   3. Visit /free-resources to see the public page')
    console.log('   4. Visit /admin/secret/lead-magnets to manage resources')
    console.log('')

  } catch (error) {
    console.error('❌ Error seeding resources:', error.message)
    process.exit(1)
  }
}

// Run the seed function
seedResources()
