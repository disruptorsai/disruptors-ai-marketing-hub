# Lead Magnet Manager - Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Prerequisites
- Supabase project configured
- Admin user with role set up
- Node.js and npm installed

---

## Step 1: Apply Database Migration (2 min)

**Option A: Supabase CLI**
```bash
npx supabase db push
```

**Option B: Supabase Dashboard**
1. Go to: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy contents of: `supabase/migrations/20250117000000_lead_magnet_resources.sql`
3. Paste and click "Run"

**Verify:**
```sql
SELECT COUNT(*) FROM lead_magnet_resources;
-- Should return 0 (table exists)
```

---

## Step 2: Seed Resources (1 min)

```bash
node scripts/seed-lead-magnet-resources.js
```

**Expected Output:**
```
🌱 Seeding lead magnet resources...
✅ Successfully seeded resources:
1. 5 Ready-to-Import n8n Workflows
2. 50 ChatGPT Marketing Prompts
3. The 30-Minute AI Content Factory
🎉 Seeding complete!
```

**Verify:**
```sql
SELECT slug, title, is_active FROM lead_magnet_resources;
-- Should return 3 resources
```

---

## Step 3: Update File URLs (1 min)

**Important:** The seeded resources have placeholder URLs. Update them:

**Via Admin Panel:**
1. Visit: `/admin/secret/lead-magnets`
2. Click on each resource
3. Update "FILE URL" field with actual Google Drive/Cloudinary URL
4. Save

**Example URLs:**
```
https://drive.google.com/file/d/YOUR_FILE_ID/view
https://res.cloudinary.com/YOUR_CLOUD/raw/upload/v123/file.zip
```

---

## Step 4: Test Everything (1 min)

### Admin Panel Test
1. Visit: `/admin/secret/lead-magnets`
2. Verify 3 resources appear in table
3. Click "CREATE_NEW" → form appears ✅
4. Toggle featured on a resource ✅
5. Click "DASHBOARD" → stats appear ✅

### Public Page Test
1. Visit: `/free-resources`
2. Verify 3 resources display ✅
3. Type in search → filters work ✅
4. Click category filter → updates ✅
5. Click a resource → redirects to `/l/:slug` ✅

### Lead Landing Test
1. Visit: `/l/n8n-workflows`
2. Verify title/description load from database ✅
3. Check "What's Inside" bullets appear ✅
4. Refresh Supabase → view_count increased ✅

---

## Step 5: Deploy (Optional)

```bash
npm run build
npm run deploy:prod
```

---

## 🎯 Quick Reference

### URLs
- **Admin Panel:** `/admin/secret/lead-magnets`
- **Public Page:** `/free-resources`
- **Landing Pages:** `/l/:slug` (e.g., `/l/n8n-workflows`)

### Admin Operations
```javascript
// Create resource
import * as api from '@/lib/admin/lead-magnet-api'

const newResource = {
  slug: 'my-resource',
  title: 'My Resource',
  subtitle: 'Short description',
  category: 'automation',
  tags: ['tag1', 'tag2'],
  icon_name: 'FileText',
  icon_color: 'text-blue-500',
  whats_inside: ['Bullet 1', 'Bullet 2'],
  is_featured: true,
  is_active: true,
}

const { data, error } = await api.createResource(newResource)
```

### Public Operations
```javascript
// Get all active resources
import * as api from '@/lib/lead-magnet-api'

const { data, error } = await api.getActiveResources()

// Track view
await api.trackResourceView('n8n-workflows')
```

---

## 🐛 Troubleshooting

### "Table does not exist"
→ Run migration: `npx supabase db push`

### "Resources not appearing on public page"
→ Check: `SELECT * FROM lead_magnet_resources WHERE is_active = true;`

### "Admin can't edit resources"
→ Set admin role: `npm run admin:setup-role your-email@example.com`

### "View count not incrementing"
→ Check telemetry: `SELECT * FROM telemetry_events WHERE name = 'resource_viewed' ORDER BY created_at DESC LIMIT 5;`

---

## 📊 Verify Success

Run this SQL to check everything:

```sql
-- Check resources
SELECT
  slug,
  title,
  category,
  is_active,
  is_featured,
  download_count,
  view_count
FROM lead_magnet_resources;

-- Check views work
SELECT * FROM popular_resources;
SELECT * FROM featured_resources;
SELECT * FROM resource_stats;

-- Check telemetry
SELECT * FROM telemetry_events
WHERE area = 'admin' AND name LIKE 'lead_magnet%'
ORDER BY created_at DESC LIMIT 10;
```

---

## ✅ Success Checklist

- [ ] Migration applied (table exists)
- [ ] 3 resources seeded
- [ ] File URLs updated
- [ ] Admin panel accessible at `/admin/secret/lead-magnets`
- [ ] Dashboard shows stats
- [ ] Can create new resource
- [ ] Public page shows resources at `/free-resources`
- [ ] Search/filter works
- [ ] Landing pages load data from DB
- [ ] View tracking increments

---

## 🎉 You're Done!

Your Lead Magnet Manager is live. Next steps:

1. **Upload actual files** to Google Drive or Cloudinary
2. **Update file URLs** in admin panel
3. **Create more resources** via admin interface
4. **Monitor analytics** in dashboard

**Need help?** See full docs:
- `docs/LEAD_MAGNET_MANAGER_DEPLOYMENT.md` - Complete guide
- `LEAD_MAGNET_MANAGER_SUMMARY.md` - Technical summary

---

**Deployment Time:** ~5 minutes
**Difficulty:** Easy
**Risk:** Low (isolated system)
