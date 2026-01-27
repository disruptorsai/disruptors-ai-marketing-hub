-- Create team_members table with full schema from OLD project
-- Run this in NEW Supabase project SQL Editor

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,
  skills TEXT[],
  years_experience INTEGER,
  user_id UUID,
  headshot TEXT,
  social_links JSONB,
  can_write_content BOOLEAN DEFAULT false,
  default_agent_id UUID,
  content_permissions JSONB,
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Public read access (team info is public)
CREATE POLICY "Public read access" ON team_members
  FOR SELECT USING (true);

-- Authenticated users can manage
CREATE POLICY "Authenticated write access" ON team_members
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Service role full access
CREATE POLICY "Service role full access" ON team_members
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Insert team members data
INSERT INTO team_members (id, name, title, bio, image_url, email, order_index, is_active, created_at, updated_at, display_order, headshot, social_links, can_write_content, content_permissions) VALUES
('d19c9618-e16b-4d3e-afbd-0485acedff98', 'Josh Patel', 'Chief Executive Officer', 'After years of consulting billion-dollar companies on customer acquisition and high-level operations, he grew frustrated with marketing agencies that couldn''t bring his vision to life. Instead of hiring outside teams for every project, Josh built his own elite group of marketing experts to power all his current and future ventures.', 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490867/ChatGPT_Image_Sep_21_2025_03_33_46_PM_skmkuo.png', 'josh@disruptorsmedia.com', 0, TRUE, '2025-09-29T22:52:11.197119+00:00', '2025-10-02T22:21:38.117205+00:00', 0, 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490867/ChatGPT_Image_Sep_21_2025_03_33_46_PM_skmkuo.png', '{}', FALSE, '{}'),

('f89f81f5-31fc-481d-86c3-06fe1d909bb3', 'Kyle Painter', 'Chief Communications Officer', 'Kyle Painter is the Head of Communications at Disruptors Media, with extensive leadership experience guiding sales teams across the U.S. He has personally sold over $450,000 in revenue within nine months and trained teams that generated more than $1.5 million in just six months. With expertise in revenue strategy and AI-driven automation, Kyle designs and deploys AI employees that streamline every stage of the marketing and sales process.', 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490868/ChatGPT_Image_Sep_21_2025_03_32_34_PM_mgrkp3.png', 'kyle@disruptorsmedia.com', 0, TRUE, '2025-09-29T22:49:00.277017+00:00', '2025-10-02T22:21:38.033254+00:00', 0, 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490868/ChatGPT_Image_Sep_21_2025_03_32_34_PM_mgrkp3.png', '{}', FALSE, '{}'),

('b9ec630e-8e8f-4e73-acd8-d3c82bdf3395', 'Tyler Gordon', 'Chief Marketing Officer', 'A high-performing marketer with proven experience driving large-scale growth, including his work at TikTok. He specializes in cold outbound lead generation, managing 350k+ emails per week and overseeing hundreds of social media messaging automations. With expertise in social media growth and paid advertising, he has scaled pages to hundreds of thousands of followers and deployed significant ad spend across major social and search platforms.', 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490862/ChatGPT_Image_Sep_21_2025_03_33_56_PM_gwztyq.png', 'tyler@disruptorsmedia.com', 0, TRUE, '2025-09-29T22:47:55.202682+00:00', '2025-10-05T23:18:18.165865+00:00', 0, 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490491/ChatGPT_Image_Sep_21_2025_03_33_57_PM_xrteo4.png', '{}', FALSE, '{}'),

('4adc298e-c19d-46a0-b945-459c3a22a4a5', 'Carson Ireland', 'Creative Director', 'Carson brings years of experience as a social media brand specialist for top musicians like Mike. and Futuristic, as well as high-profile figures in the MLB and NFL. He excels at unlocking a brand''s creative potential and ensuring every message aligns with its core identity. With a sharp eye for storytelling, Carson transforms passive viewers into loyal fans through engaging, authentic content.', 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490868/ChatGPT_Image_Sep_21_2025_03_33_49_PM_sudbsq.png', 'carson@disruptorsmedia.com', 0, TRUE, '2025-09-29T22:50:05.126563+00:00', '2025-10-02T22:21:37.951566+00:00', 0, 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490868/ChatGPT_Image_Sep_21_2025_03_33_49_PM_sudbsq.png', '{}', FALSE, '{}'),

('91420ef1-57b9-482c-ad93-f4852383541e', 'William Welsh', 'AI Systems Engineer', 'Will pioneered the concept of the Business Brain, blending years of multidisciplinary engineering with deep AI experimentation. A creative problem solver at heart, he is passionate about using artificial intelligence to improve outdated systems and invent entirely new ones, ensuring Disruptors stays ahead of the curve in delivering client results.', 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490868/ChatGPT_Image_Sep_21_2025_03_33_51_PM_zssdph.png', 'will@disruptorsmedia.com', 0, TRUE, '2025-09-29T22:46:17.532966+00:00', '2025-10-02T22:21:38.185028+00:00', 0, 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490868/ChatGPT_Image_Sep_21_2025_03_33_51_PM_zssdph.png', '{}', FALSE, '{}')

ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Created team_members table with ' || count(*) || ' members' as status FROM team_members;
