# Lead Magnet Manager Deployment Guide

## Overview

The Lead Magnet Manager is a complete system for managing downloadable resources (lead magnets) with:
- **Admin Nexus Module**: CRUD operations, analytics, and resource management
- **Public Resources Page**: `/free-resources` with search, filtering, and categorization
- **Database Integration**: Full RLS policies and analytics tracking
- **Analytics**: Download tracking, view counting, and performance metrics

---

## Files Created

### Database
- `supabase/migrations/20250117000000_lead_magnet_resources.sql` - Database schema, RLS policies, views

### Admin System
- `src/admin/modules/LeadMagnetManager.jsx` - Admin interface module
- `src/lib/admin/lead-magnet-api.js` - Admin API functions (CRUD operations)

### Public System
- `src/pages/free-resources.jsx` - Public resources page
- `src/lib/lead-magnet-api.js` - Public API functions (read-only)

### Utilities
- `scripts/seed-lead-magnet-resources.js` - Database seeding script

### Updated Files
- `src/admin/routes.jsx` - Added Lead Magnet Manager route
- `src/admin/AdminShell.jsx` - Added navigation item
- `src/pages/index.jsx` - Added `/free-resources` route
- `src/pages/lead-magnet-landing.jsx` - Integrated with database instead of hardcoded data

---

## Deployment Steps

### 1. Apply Database Migration

**Option A: Using Supabase CLI (Recommended)**
```bash
# Make sure you're in the project root
cd C:\Users\Will\OneDrive\Documents\Projects\dm4\disruptors-ai-marketing-hub

# Apply migration
npx supabase db push
```

**Option B: Manual Application**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250117000000_lead_magnet_resources.sql`
3. Paste and execute

**Verify Migration:**
```sql
-- Check table exists
SELECT * FROM lead_magnet_resources LIMIT 1;

-- Check views exist
SELECT * FROM popular_resources;
SELECT * FROM featured_resources;
SELECT * FROM resource_stats;
```

### 2. Seed Initial Resources

```bash
# Install dependencies if needed
npm install dotenv @supabase/supabase-js

# Run seed script
node scripts/seed-lead-magnet-resources.js
```

**Expected Output:**
```
🌱 Seeding lead magnet resources...

✅ Successfully seeded resources:

1. 5 Ready-to-Import n8n Workflows
   - Slug: n8n-workflows
   - Category: automation
   - Tags: n8n, automation, workflows, ai, zapier-alternative
   - Featured: Yes
   - Active: Yes

2. 50 ChatGPT Marketing Prompts
   - Slug: chatgpt-prompts
   - Category: ai
   - Tags: chatgpt, prompts, ai, content, copywriting, brand-voice
   - Featured: Yes
   - Active: Yes

3. The 30-Minute AI Content Factory
   - Slug: content-workflow
   - Category: content
   - Tags: content, ai, workflow, automation, repurposing, social-media
   - Featured: Yes
   - Active: Yes

🎉 Seeding complete!
```

### 3. Update Resource File URLs

After seeding, you need to upload the actual files and update the `file_url` field:

**Option A: Using Admin Nexus**
1. Navigate to `/admin/secret/lead-magnets`
2. Click on a resource to edit
3. Update the `file_url` field with Google Drive or Cloudinary URL
4. Save changes

**Option B: Using SQL**
```sql
UPDATE lead_magnet_resources
SET file_url = 'https://drive.google.com/file/d/YOUR_ACTUAL_FILE_ID/view'
WHERE slug = 'n8n-workflows';

UPDATE lead_magnet_resources
SET file_url = 'https://drive.google.com/file/d/YOUR_ACTUAL_FILE_ID/view'
WHERE slug = 'chatgpt-prompts';

UPDATE lead_magnet_resources
SET file_url = 'https://drive.google.com/file/d/YOUR_ACTUAL_FILE_ID/view'
WHERE slug = 'content-workflow';
```

### 4. Deploy to Production

```bash
# Build and deploy
npm run build
npm run deploy:prod
```

### 5. Verify Deployment

**Admin Panel:**
1. Visit `/admin/secret`
2. Click "Lead Magnets" in sidebar
3. Verify all 3 resources appear
4. Test CRUD operations:
   - Create a test resource
   - Edit an existing resource
   - Toggle featured status
   - Delete (soft delete)

**Public Page:**
1. Visit `/free-resources`
2. Verify all 3 resources display
3. Test search functionality
4. Test category filtering
5. Test sorting (Popular, Newest, A-Z)
6. Click a resource → should redirect to `/l/:slug`

**Lead Magnet Landing:**
1. Visit `/l/n8n-workflows`
2. Verify data loads from database (not hardcoded)
3. Check that view count increments

---

## Usage Guide

### Admin: Create New Resource

1. Navigate to `/admin/secret/lead-magnets`
2. Click **CREATE_NEW** button
3. Fill in the form:
   - **Slug**: URL-friendly identifier (e.g., `seo-checklist`)
   - **Title**: Display name (e.g., `100-Point SEO Checklist`)
   - **Subtitle**: One-line description
   - **Description**: Full description (markdown supported)
   - **Category**: Choose from dropdown
   - **Tags**: Add relevant tags
   - **Icon Name**: Lucide icon name (e.g., `CheckCircle`, `Sparkles`)
   - **Icon Color**: Tailwind class (e.g., `text-blue-500`)
   - **File URL**: Google Drive or Cloudinary URL
   - **File Type**: pdf, zip, notion, video
   - **File Size**: Display value (e.g., `2.5 MB`)
   - **What's Inside**: List of bullet points
   - **Flags**: Featured, Active
4. Click **SAVE**

### Admin: View Analytics

1. Navigate to `/admin/secret/lead-magnets`
2. Click **DASHBOARD** tab
3. View:
   - Total resources, active, featured, downloads
   - Top performers (by downloads)
   - Recent resources

4. For detailed analytics (coming soon):
   - Click **ANALYTICS** tab
   - View conversion rates, trends, etc.

### Public: Browse Resources

Users can:
1. Visit `/free-resources`
2. Search by keyword
3. Filter by category
4. Sort by popularity, date, or A-Z
5. Click resource to go to landing page `/l/:slug`
6. Sign up to download

---

## Analytics Integration

### How View Tracking Works

When a user visits `/l/:slug`:
1. `lead-magnet-landing.jsx` calls `leadMagnetAPI.trackResourceView(slug)`
2. Telemetry event created: `resource_viewed`
3. Admin can see view counts in Lead Magnet Manager dashboard

### How Download Tracking Works

When a user downloads from `/g/:slug`:
1. (Future integration) Call `leadMagnetAPI.trackResourceDownload(slug, leadCaptureId)`
2. Increments `download_count` in database
3. Links to `lead_captures` table for conversion tracking

### Viewing Analytics

**Admin Dashboard:**
```
Total Downloads: 247
Total Views: 1,543
Conversion Rate: 16%

Top Performers:
1. n8n Workflows - 127 downloads
2. ChatGPT Prompts - 89 downloads
3. Content Workflow - 31 downloads
```

---

## Database Schema Reference

### Table: `lead_magnet_resources`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `slug` | TEXT | URL-friendly identifier (unique) |
| `title` | TEXT | Display name |
| `subtitle` | TEXT | One-line description |
| `description` | TEXT | Full description (markdown) |
| `category` | TEXT | automation, ai, content, seo, etc. |
| `tags` | TEXT[] | Array of tags for filtering |
| `icon_name` | TEXT | Lucide icon name |
| `icon_color` | TEXT | Tailwind color class |
| `preview_image_url` | TEXT | Optional thumbnail |
| `file_url` | TEXT | Google Drive or Cloudinary URL |
| `file_type` | TEXT | pdf, zip, notion, video |
| `file_size` | TEXT | Display value (e.g., "2.5 MB") |
| `download_count` | INTEGER | Incremented on each download |
| `view_count` | INTEGER | Incremented on each page view |
| `is_featured` | BOOLEAN | Show on homepage |
| `is_active` | BOOLEAN | Visible to public |
| `seo_title` | TEXT | Meta title |
| `seo_description` | TEXT | Meta description |
| `seo_keywords` | TEXT[] | Keywords array |
| `whats_inside` | JSONB | Array of bullet points |
| `related_resources` | UUID[] | Related resource IDs |
| `created_by` | UUID | Admin user ID |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `published_at` | TIMESTAMPTZ | Publish timestamp |

### Views

**`popular_resources`**
- Top 10 resources by download count
- Only active resources

**`featured_resources`**
- Resources where `is_featured = true`
- Only active resources
- Ordered by creation date (newest first)

**`resource_stats`**
- Aggregated stats by category
- Total resources, downloads, views per category

---

## API Reference

### Admin API (`src/lib/admin/lead-magnet-api.js`)

```javascript
// Get all resources (including inactive)
const { data, error } = await getAllResources()

// Get single resource
const { data, error } = await getResourceById(id)

// Create resource
const { data, error } = await createResource(resourceData)

// Update resource
const { data, error } = await updateResource(id, updates)

// Delete resource (soft delete)
const { success, error } = await deleteResource(id)

// Get analytics
const { data, error } = await getResourceAnalytics(id)
const { data, error } = await getDashboardStats()

// Increment counters
const { success, error } = await incrementDownloadCount(id)
const { success, error } = await incrementViewCount(id)

// Bulk operations
const { success, error } = await bulkUpdateResources(ids, updates)

// Get categories and tags
const { data, error } = await getCategories()
const { data, error } = await getTags()
```

### Public API (`src/lib/lead-magnet-api.js`)

```javascript
// Get active resources only
const { data, error } = await getActiveResources()

// Get featured resources
const { data, error } = await getFeaturedResources(limit)

// Get popular resources
const { data, error } = await getPopularResources(limit)

// Get by slug
const { data, error } = await getResourceBySlug(slug)

// Search and filter
const { data, error } = await searchResources(query)
const { data, error } = await getResourcesByCategory(category)
const { data, error } = await getResourcesByTags(tags)

// Analytics tracking
const { success, error } = await trackResourceView(slug)
const { success, error } = await trackResourceDownload(slug, leadCaptureId)

// Related resources
const { data, error } = await getRelatedResources(resourceId, limit)

// Get categories
const { data, error } = await getCategories()

// Get stats
const { data, error } = await getResourceStats()
```

---

## Security & RLS Policies

### Public Read Access
```sql
-- Anyone can view active resources
CREATE POLICY "Public can view active resources"
  ON lead_magnet_resources
  FOR SELECT
  USING (is_active = TRUE);
```

### Admin Full Access
```sql
-- Admins have full CRUD access
CREATE POLICY "Admin users have full access"
  ON lead_magnet_resources
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
     auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );
```

---

## Troubleshooting

### Resources not appearing on `/free-resources`

**Check:**
1. Are resources marked as `is_active = true`?
   ```sql
   SELECT slug, title, is_active FROM lead_magnet_resources;
   ```
2. RLS policies enabled?
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'lead_magnet_resources';
   ```

### Admin can't edit resources

**Check:**
1. User has admin role?
   ```sql
   SELECT raw_user_meta_data, raw_app_meta_data
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```
2. Run admin role setup:
   ```bash
   npm run admin:setup-role your-email@example.com
   ```

### View/download counts not incrementing

**Check:**
1. Telemetry events being created?
   ```sql
   SELECT * FROM telemetry_events
   WHERE name IN ('resource_viewed', 'resource_downloaded')
   ORDER BY created_at DESC
   LIMIT 10;
   ```
2. Database function exists (if using RPC)?
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name IN ('increment_resource_downloads', 'increment_resource_views');
   ```

### Migration fails

**Error: Table already exists**
```sql
-- Drop and recreate (CAUTION: loses data)
DROP TABLE IF EXISTS lead_magnet_resources CASCADE;
-- Then rerun migration
```

**Error: RLS policy conflicts**
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active resources" ON lead_magnet_resources;
DROP POLICY IF EXISTS "Admin users have full access" ON lead_magnet_resources;
-- Then rerun migration
```

---

## Future Enhancements

### Phase 2: Advanced Analytics
- [ ] Download trends chart (last 30 days)
- [ ] Conversion funnel visualization
- [ ] A/B testing for resource titles
- [ ] Geographic distribution of downloads

### Phase 3: Automation
- [ ] Auto-publish resources on schedule
- [ ] Email notifications for new resources
- [ ] Auto-generate preview images
- [ ] Cloudinary integration for file hosting

### Phase 4: User Experience
- [ ] Resource recommendations based on downloads
- [ ] User ratings and reviews
- [ ] Download history for logged-in users
- [ ] Personalized resource suggestions

---

## Support

**Issues:**
- Database errors: Check Supabase logs
- Frontend errors: Check browser console
- Admin access: Verify admin role setup

**Documentation:**
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Lucide Icons: https://lucide.dev/icons/

---

## Summary

You now have a complete Lead Magnet Manager system:

✅ Database schema with RLS policies
✅ Admin Nexus module for CRUD operations
✅ Public resources page with search/filter
✅ Analytics tracking (views, downloads)
✅ Integration with existing lead capture flow
✅ 3 seeded resources ready to use

**Next Steps:**
1. Apply migration
2. Run seed script
3. Update file URLs
4. Deploy to production
5. Test end-to-end flow
