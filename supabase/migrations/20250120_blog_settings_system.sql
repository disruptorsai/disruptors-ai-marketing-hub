/**
 * Blog Settings System Migration
 * Adds configuration settings for blog automation control
 * Created: 2025-01-20
 */

-- Insert blog automation settings (these will be upserted by the settings modal)
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('blog_automation_enabled', 'true'::jsonb, 'Master automation toggle'),
  ('blog_auto_generation_enabled', 'true'::jsonb, 'Auto-generate blogs when buffer is low'),
  ('blog_auto_scheduling_enabled', 'true'::jsonb, 'Auto-schedule approved blogs')
ON CONFLICT (setting_key) DO NOTHING;

-- Default blog system prompt (can be customized in settings)
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  (
    'blog_system_prompt',
    '"Role: You are a top-performing SEO strategist and educator. Write epic, original blog posts that are practical, easy to follow, and consistently optimized for search and generative engines.\n\nCore Output Requirements:\n- Write at least 1,200 words in narrative style with H1/H2/H3 formatting\n- Optimize for {{PRIMARY_KEYWORD}} and support with {{SECONDARY_KEYWORD}}\n- Include 5 FAQs driven by real user search intent\n- Tone: Disruptors & Co — bold, attention-grabbing, no fluff, occasionally contrarian\n- Audience: non-experts in skilled trades and service businesses\n\nContent Structure:\n1. Hook: Start with a bold statement or contrarian take\n2. Problem: Define the pain point your reader is experiencing\n3. Solution: Provide actionable steps and frameworks\n4. Examples: Include real-world case studies or scenarios\n5. FAQs: Answer 5 common questions related to the topic\n6. CTA: End with a clear next step\n\nSEO Requirements:\n- Primary keyword in H1, first 100 words, at least 3 H2s\n- Secondary keywords distributed naturally (2-3% density)\n- Meta description under 160 characters\n- 1-2 internal links to related content\n- External links to authoritative sources\n\nWriting Style:\n- Short paragraphs (2-3 sentences max)\n- Bullet points and numbered lists for scannability\n- Active voice, second person (\"you\")\n- No jargon unless explained\n- Conversational but authoritative\n\nQuality Standards:\n- Original insights, not generic advice\n- Data-driven when possible (cite sources)\n- Actionable takeaways in every section\n- Optimized for featured snippets (answer questions directly)\n- Mobile-friendly formatting"'::jsonb,
    'System prompt for blog generation'
  )
ON CONFLICT (setting_key) DO NOTHING;

-- Blog generation parameters
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  (
    'blog_generation_params',
    '{"model": "claude-sonnet-4-20250514", "temperature": 0.7, "max_tokens": 4096, "min_words": 1200}'::jsonb,
    'AI generation parameters'
  )
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Buffer size already exists from previous migration, update if needed
UPDATE system_settings
SET setting_value = '{"min": 3, "target": 5, "max": 10}'::jsonb
WHERE setting_key = 'blog_buffer_size';

-- Schedule settings already exist from previous migration, but ensure they're present
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  (
    'blog_schedule_phase_1',
    '{"days": ["Monday", "Wednesday", "Friday"], "time": "09:00:00", "timezone": "America/New_York", "duration_days": 90}'::jsonb,
    'First 90 days: 3 posts per week'
  ),
  (
    'blog_schedule_phase_2',
    '{"days": ["Tuesday", "Thursday"], "time": "09:00:00", "timezone": "America/New_York"}'::jsonb,
    'After 90 days: 2 posts per week'
  )
ON CONFLICT (setting_key) DO NOTHING;

-- Create index on setting_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Add helpful comment
COMMENT ON TABLE system_settings IS 'System-wide configuration settings for blog automation and other features. Settings can be modified through the Admin Nexus Blog Settings interface.';
