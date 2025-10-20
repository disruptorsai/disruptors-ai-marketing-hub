import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

console.log('📦 Applying Blog Settings Migration...\n')

// Read the migration file
const migrationPath = join(__dirname, '../supabase/migrations/20250120_blog_settings_system.sql')
const migrationSQL = readFileSync(migrationPath, 'utf-8')

try {
  // Execute the migration
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL })

  if (error) {
    console.error('❌ Migration failed:', error)

    // Try a different approach - insert each setting individually
    console.log('\n⚠️  Trying alternative approach...\n')

    const settings = [
      {
        setting_key: 'blog_automation_enabled',
        setting_value: true,
        description: 'Master automation toggle'
      },
      {
        setting_key: 'blog_auto_generation_enabled',
        setting_value: true,
        description: 'Auto-generate blogs when buffer is low'
      },
      {
        setting_key: 'blog_auto_scheduling_enabled',
        setting_value: true,
        description: 'Auto-schedule approved blogs'
      },
      {
        setting_key: 'blog_system_prompt',
        setting_value: `Role: You are a top-performing SEO strategist and educator. Write epic, original blog posts that are practical, easy to follow, and consistently optimized for search and generative engines.

Core Output Requirements:
- Write at least 1,200 words in narrative style with H1/H2/H3 formatting
- Optimize for {{PRIMARY_KEYWORD}} and support with {{SECONDARY_KEYWORD}}
- Include 5 FAQs driven by real user search intent
- Tone: Disruptors & Co — bold, attention-grabbing, no fluff, occasionally contrarian
- Audience: non-experts in skilled trades and service businesses

Content Structure:
1. Hook: Start with a bold statement or contrarian take
2. Problem: Define the pain point your reader is experiencing
3. Solution: Provide actionable steps and frameworks
4. Examples: Include real-world case studies or scenarios
5. FAQs: Answer 5 common questions related to the topic
6. CTA: End with a clear next step

SEO Requirements:
- Primary keyword in H1, first 100 words, at least 3 H2s
- Secondary keywords distributed naturally (2-3% density)
- Meta description under 160 characters
- 1-2 internal links to related content
- External links to authoritative sources

Writing Style:
- Short paragraphs (2-3 sentences max)
- Bullet points and numbered lists for scannability
- Active voice, second person ("you")
- No jargon unless explained
- Conversational but authoritative

Quality Standards:
- Original insights, not generic advice
- Data-driven when possible (cite sources)
- Actionable takeaways in every section
- Optimized for featured snippets (answer questions directly)
- Mobile-friendly formatting`,
        description: 'System prompt for blog generation'
      },
      {
        setting_key: 'blog_generation_params',
        setting_value: {
          model: 'claude-sonnet-4-20250514',
          temperature: 0.7,
          max_tokens: 4096,
          min_words: 1200
        },
        description: 'AI generation parameters'
      }
    ]

    for (const setting of settings) {
      const { error: insertError } = await supabase
        .from('system_settings')
        .upsert(setting, { onConflict: 'setting_key' })

      if (insertError) {
        console.log(`❌ Failed to insert ${setting.setting_key}:`, insertError.message)
      } else {
        console.log(`✅ ${setting.setting_key} inserted/updated`)
      }
    }

    // Update buffer size
    const { error: bufferError } = await supabase
      .from('system_settings')
      .update({ setting_value: { min: 3, target: 5, max: 10 } })
      .eq('setting_key', 'blog_buffer_size')

    if (!bufferError) {
      console.log('✅ blog_buffer_size updated')
    }

  } else {
    console.log('✅ Migration applied successfully!')
  }

  // Verify all settings are present
  console.log('\n📊 Verifying settings...\n')

  const { data: settings } = await supabase
    .from('system_settings')
    .select('setting_key')
    .like('setting_key', 'blog_%')

  console.log(`✅ Found ${settings?.length || 0} blog settings:`)
  settings?.forEach(s => console.log(`   - ${s.setting_key}`))

  if (settings?.length >= 8) {
    console.log('\n🎉 All blog settings are present!')
  } else {
    console.log('\n⚠️  Some settings may be missing. Expected 8, found', settings?.length)
  }

} catch (error) {
  console.error('❌ Error:', error)
}

process.exit(0)
