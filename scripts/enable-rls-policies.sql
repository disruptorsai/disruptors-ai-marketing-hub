-- =====================================================
-- COMPREHENSIVE RLS POLICY IMPLEMENTATION
-- =====================================================
-- This script enables Row Level Security on all critical tables
-- and implements appropriate policies for the Disruptors AI Marketing Hub
--
-- Security Model:
-- - Users can only access their own data
-- - Service role bypasses all RLS (for admin operations)
-- - Public content (posts, services) readable by authenticated users
-- - Anonymous users can read published public content only
-- =====================================================

-- =====================================================
-- USERS TABLE
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can manage all users (already bypasses RLS)
-- No explicit policy needed

-- =====================================================
-- BUSINESS_BRAINS TABLE
-- =====================================================
ALTER TABLE business_brains ENABLE ROW LEVEL SECURITY;

-- Users can read their own business brains
CREATE POLICY "Users can view own business brains"
  ON business_brains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.id = business_brains.organization_id
    )
  );

-- Users can create their own business brains
CREATE POLICY "Users can create own business brains"
  ON business_brains FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.id = NEW.organization_id
    )
  );

-- Users can update their own business brains
CREATE POLICY "Users can update own business brains"
  ON business_brains FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.id = business_brains.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.id = business_brains.organization_id
    )
  );

-- Users can delete their own business brains
CREATE POLICY "Users can delete own business brains"
  ON business_brains FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.id = business_brains.organization_id
    )
  );

-- =====================================================
-- BRAIN_ASSETS TABLE
-- =====================================================
ALTER TABLE brain_assets ENABLE ROW LEVEL SECURITY;

-- Users can manage assets for their own brains
CREATE POLICY "Users can view own brain assets"
  ON brain_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = brain_assets.brain_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can create brain assets"
  ON brain_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = NEW.brain_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update brain assets"
  ON brain_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = brain_assets.brain_id
      AND users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = brain_assets.brain_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete brain assets"
  ON brain_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = brain_assets.brain_id
      AND users.id = auth.uid()
    )
  );

-- =====================================================
-- BRAIN_THEMES TABLE
-- =====================================================
ALTER TABLE brain_themes ENABLE ROW LEVEL SECURITY;

-- Users can manage themes for their own brains
CREATE POLICY "Users can view own brain themes"
  ON brain_themes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = brain_themes.brain_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can create brain themes"
  ON brain_themes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = NEW.brain_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update brain themes"
  ON brain_themes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = brain_themes.brain_id
      AND users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = brain_themes.brain_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete brain themes"
  ON brain_themes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM business_brains
      JOIN users ON users.id = business_brains.organization_id
      WHERE business_brains.id = brain_themes.brain_id
      AND users.id = auth.uid()
    )
  );

-- =====================================================
-- POSTS TABLE (Public Content)
-- =====================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- Authenticated users can view their own draft posts
CREATE POLICY "Users can view own draft posts"
  ON posts FOR SELECT
  USING (
    status = 'draft'
    AND created_by = auth.uid()
  );

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (created_by = auth.uid());

-- =====================================================
-- SERVICES TABLE (Public Content)
-- =====================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Anyone can read active services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (active = TRUE);

-- Authenticated users can view inactive services
CREATE POLICY "Authenticated users can view all services"
  ON services FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Service role manages services via backend (bypasses RLS)

-- =====================================================
-- MODULES TABLE
-- =====================================================
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view approved modules
CREATE POLICY "Authenticated users can view approved modules"
  ON modules FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'approved'
  );

-- Anyone can view public modules
CREATE POLICY "Anyone can view public modules"
  ON modules FOR SELECT
  USING (
    status = 'approved'
    AND audience ? 'public'
  );

-- Service role manages modules via backend (bypasses RLS)

-- =====================================================
-- MODULE_RUNS TABLE
-- =====================================================
ALTER TABLE module_runs ENABLE ROW LEVEL SECURITY;

-- Users can view their own module runs
CREATE POLICY "Users can view own module runs"
  ON module_runs FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own module runs
CREATE POLICY "Users can create module runs"
  ON module_runs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Public anonymous runs (user_id is NULL)
CREATE POLICY "Allow anonymous public module runs"
  ON module_runs FOR INSERT
  WITH CHECK (
    user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = NEW.module_id
      AND modules.audience ? 'public'
    )
  );

-- =====================================================
-- USER_MODULE_ACCESS TABLE
-- =====================================================
ALTER TABLE user_module_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own module access
CREATE POLICY "Users can view own module access"
  ON user_module_access FOR SELECT
  USING (user_id = auth.uid());

-- Service role manages access grants via backend (bypasses RLS)

-- =====================================================
-- TEAM_MEMBERS TABLE (Public Content)
-- =====================================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view team members
CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (TRUE);

-- Service role manages team via backend (bypasses RLS)

-- =====================================================
-- SITE_MEDIA TABLE (Public Content)
-- =====================================================
ALTER TABLE site_media ENABLE ROW LEVEL SECURITY;

-- Anyone can view public media
CREATE POLICY "Anyone can view site media"
  ON site_media FOR SELECT
  USING (TRUE);

-- Service role manages media via backend (bypasses RLS)

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Add recommended indexes from health check

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Business Brains indexes
CREATE INDEX IF NOT EXISTS idx_business_brains_organization_id ON business_brains(organization_id);
CREATE INDEX IF NOT EXISTS idx_business_brains_slug ON business_brains(slug);
CREATE INDEX IF NOT EXISTS idx_business_brains_brain_level ON business_brains(brain_level);

-- Brain Assets indexes
CREATE INDEX IF NOT EXISTS idx_brain_assets_brain_id ON brain_assets(brain_id);

-- Brain Themes indexes
CREATE INDEX IF NOT EXISTS idx_brain_themes_brain_id ON brain_themes(brain_id);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_by ON posts(created_by);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

-- Module Runs indexes
CREATE INDEX IF NOT EXISTS idx_module_runs_user_id ON module_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_module_runs_module_id ON module_runs(module_id);
CREATE INDEX IF NOT EXISTS idx_module_runs_created_at ON module_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_module_runs_status ON module_runs(status);

-- User Module Access indexes
CREATE INDEX IF NOT EXISTS idx_user_module_access_user_id ON user_module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_access_module_slug ON user_module_access(module_slug);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Ensure authenticated users can access their data

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Anon role limited to public content only
GRANT SELECT ON posts TO anon;
GRANT SELECT ON services TO anon;
GRANT SELECT ON modules TO anon;
GRANT SELECT ON team_members TO anon;
GRANT SELECT ON site_media TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify RLS is working:

-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'business_brains', 'posts', 'modules', 'module_runs');
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

COMMENT ON TABLE users IS 'RLS enabled: Users can only access their own profile data';
COMMENT ON TABLE business_brains IS 'RLS enabled: Users can only access their own business brains';
COMMENT ON TABLE brain_assets IS 'RLS enabled: Users can only access assets for their own brains';
COMMENT ON TABLE brain_themes IS 'RLS enabled: Users can only access themes for their own brains';
COMMENT ON TABLE posts IS 'RLS enabled: Published posts public, drafts private to author';
COMMENT ON TABLE services IS 'RLS enabled: Active services public, all visible to authenticated';
COMMENT ON TABLE modules IS 'RLS enabled: Approved modules visible to authenticated, public modules to all';
COMMENT ON TABLE module_runs IS 'RLS enabled: Users can only view their own runs';
COMMENT ON TABLE user_module_access IS 'RLS enabled: Users can only view their own access grants';
