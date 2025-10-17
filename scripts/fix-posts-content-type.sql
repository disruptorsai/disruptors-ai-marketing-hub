-- Fix existing posts content_type values before applying SEO Suite migration
-- Run this FIRST, then run the main migration

-- Step 1: Check current content_type values
SELECT content_type, COUNT(*) as count
FROM posts
GROUP BY content_type
ORDER BY count DESC;

-- Step 2: Update NULL or invalid content_type values to 'blog_post'
UPDATE posts
SET content_type = 'blog_post'
WHERE content_type IS NULL
   OR content_type NOT IN ('blog_post', 'landing_page', 'guide', 'pillar', 'resource');

-- Step 3: Verify all rows are now valid
SELECT content_type, COUNT(*) as count
FROM posts
GROUP BY content_type
ORDER BY count DESC;

-- Should only show: blog_post, landing_page, guide, pillar, or resource

-- Step 4: Now you can safely run the SEO Suite migration
