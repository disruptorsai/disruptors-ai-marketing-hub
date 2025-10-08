-- =====================================================
-- VERIFY DATABASE SETUP IS COMPLETE
-- =====================================================
-- Run this to check which Business Brain tables exist
-- and what state your database is in
-- =====================================================

-- Check which tables exist
SELECT
  'business_brains' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_brains') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
  'brain_facts' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brain_facts') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
  'brand_rules' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_rules') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
  'brand_assets' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_assets') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
  'onboarding_sessions' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'onboarding_sessions') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
  'knowledge_sources' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_sources') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
  'posts_brain_facts' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts_brain_facts') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
ORDER BY table_name;

-- Expected Result: 7 rows, all showing "✅ EXISTS"

-- Additional check: Verify business_brains has all required columns
SELECT
  'Required Columns Check' as check_type,
  COUNT(*) as columns_found,
  CASE
    WHEN COUNT(*) >= 13 THEN '✅ All required columns present'
    ELSE '❌ Missing columns - need to run fix again'
  END as status
FROM information_schema.columns
WHERE table_name = 'business_brains'
  AND column_name IN (
    'id', 'business_name', 'website_url', 'industry', 'slug',
    'created_by', 'brain_level', 'confidence_score',
    'onboarding_completed', 'brand_colors', 'business_description',
    'created_at', 'updated_at'
  );

-- Check RLS (Row Level Security) is enabled
SELECT
  'Row Level Security' as check_type,
  CASE
    WHEN relrowsecurity THEN '✅ RLS enabled'
    ELSE '⚠️  RLS not enabled (run full migration for this)'
  END as status
FROM pg_class
WHERE relname = 'business_brains';
