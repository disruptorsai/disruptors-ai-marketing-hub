# Cloudinary Optimization Guide

## Current Situation

Your Cloudinary account has exceeded the credit limit, causing all images on your live site to stop working. You have two immediate options:

### Option 1: Emergency Migration to Supabase (FREE) ✅ RECOMMENDED

**Cost**: FREE (included in Supabase plan)
**Time**: 30-60 minutes
**Downtime**: Zero (seamless transition)

**Steps**:
1. Run migration script (downloads + uploads all assets)
2. Update URLs in codebase
3. Deploy to dev site for testing
4. Deploy to production

**See "Quick Start" section below for immediate action.**

---

### Option 2: Optimize Cloudinary Usage

If you want to keep using Cloudinary, here's how to get under the free tier limit:

#### Cloudinary Free Tier Limits
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

#### How to Check Your Usage

1. **Login to Cloudinary Dashboard**:
   ```
   https://cloudinary.com/console
   ```

2. **Check Usage**:
   - Go to "Dashboard" → "Usage"
   - See Storage, Bandwidth, and Transformations

3. **Identify Heavy Assets**:
   - Go to "Media Library"
   - Sort by "File Size" (largest first)
   - Look for videos > 10MB or images > 2MB

#### Quick Optimizations

**Delete Unused Assets**:
```bash
# Assets that can be safely deleted (not in current codebase):
- Old demo videos
- Unused AI-generated images
- Duplicate uploads
- Test assets
```

**Reduce Video Quality**:
- Service videos are the largest assets (~5-20MB each)
- Re-encode at lower bitrate (1080p → 720p)
- Use more aggressive compression

**Aggressive Transformation Settings**:
```javascript
// Current: q_auto:good (good quality)
// Change to: q_auto:low (more compression)

// Example:
https://res.cloudinary.com/dvcvxhzmt/video/upload/q_auto:low/v1/dmsite/services/ai-automation.mp4
```

---

## Quick Start: Emergency Migration to Supabase

### Step 1: Run Migration (5 minutes)

```bash
# Make sure you're in the project root
cd /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub

# Run the migration script
node scripts/emergency-cloudinary-migration.js
```

**What it does**:
- Creates 3 Supabase Storage buckets (images, videos, logos)
- Downloads all assets from Cloudinary
- Uploads to Supabase Storage
- Generates URL mapping file

**Expected output**:
```
🚨 EMERGENCY CLOUDINARY TO SUPABASE MIGRATION

Found 47 assets to migrate

📦 Creating/verifying Supabase Storage buckets...
✅ Created bucket: site-images
✅ Created bucket: site-videos
✅ Created bucket: site-logos

🔄 Starting migration...

[1/47] Migrating: logo.svg
  ⬇️  Downloading...
  ✓ Downloaded (0.05 MB)
  ⬆️  Uploading to site-logos...
  ✅ Uploaded to: https://ubqxflzuvxowigbjmqfb.supabase.co/storage/v1/object/public/site-logos/logo.svg
...

📊 MIGRATION SUMMARY
Total Assets: 47
✅ Successful: 47
❌ Failed: 0
```

---

### Step 2: Update Codebase URLs (2 minutes)

```bash
# First, run in dry-run mode to preview changes
node scripts/update-cloudinary-urls.js --dry-run

# Review the output, then apply changes
node scripts/update-cloudinary-urls.js
```

**What it does**:
- Finds all Cloudinary URLs in your codebase
- Replaces them with Supabase URLs
- Updates files in `src/` directory

---

### Step 3: Test Locally (5 minutes)

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# Check that images/videos load correctly
# Test key pages:
# - Home page (hero images, service videos)
# - About page
# - Work page (case study logos)
# - Blog page
```

---

### Step 4: Deploy to Dev Site (5 minutes)

```bash
# Deploy to dev site
npm run deploy:dev

# Wait for deployment to complete
# Test at: https://dev.disruptorsmedia.com
```

---

### Step 5: Deploy to Production (3 minutes)

**ONLY after dev site is working perfectly:**

```bash
# Deploy to production
npm run deploy:prod

# Test at: https://dm4.wjwelsh.com
```

---

## Asset Breakdown

### Critical Assets (Must Migrate First)

**Logos** (4 files, ~1MB total):
- `logo.svg` - Main logo
- `gold-logo.png` - Gold variant
- `gold-logo-banner.png` - Banner logo
- `logo_a4toul.png` - Alt logo

**Hero/Background Images** (6 files, ~10MB total):
- `main-bg.jpg` - Main background
- `about-hero-background.jpg` - About page hero
- `work-hero-background.jpg` - Work page hero
- `hero-poster.jpg` - Video poster
- `3d-fallback.jpg` - 3D fallback
- `loader-lft.jpg` - Loading screen

**Service Videos** (8 files, ~120MB total - LARGEST):
- `ai-automation.mp4` (~15MB)
- `crm-management.mp4` (~15MB)
- `custom-apps.mp4` (~15MB)
- `lead-generation.mp4` (~15MB)
- `paid-advertising.mp4` (~15MB)
- `podcasting.mp4` (~15MB)
- `seo-geo.mp4` (~15MB)
- `social-media-marketing.mp4` (~15MB)

**Case Study Logos** (9 files, ~2MB total):
- `autotrimutah_logo.png`
- `granitepaving_logo.png`
- `neuromastery_logo.webp`
- `segpro_logo.png`
- `soundcorrections_logo.svg`
- `thewellnessway_logo.webp`
- `timberviewfinancial_logo.webp`
- `tradeworxusa_logo.svg`
- `muscleworks_logo.png`

---

## Supabase Storage Costs

### Free Tier
- **Storage**: 1 GB (FREE)
- **Bandwidth**: 2 GB/month (FREE)
- **Requests**: Unlimited

### Paid Tier (if needed)
- **Storage**: $0.021/GB/month (~$2.50/month for 120GB)
- **Bandwidth**: $0.09/GB (~$10/month for 100GB traffic)

**Estimated cost for your site**: $5-10/month vs Cloudinary's $99/month

---

## Troubleshooting

### Migration Script Fails

**Error**: `Failed to download`
- **Solution**: Some Cloudinary URLs may be cached/transformed. The script will retry and log failures.

**Error**: `Supabase upload failed`
- **Solution**: Check your Supabase project limits. Free tier is 1GB storage.

### Images Don't Load After Migration

1. **Check Supabase Storage bucket is public**:
   ```bash
   # Go to Supabase Dashboard
   # Storage → [bucket] → Settings
   # Make sure "Public bucket" is enabled
   ```

2. **Check CORS settings**:
   - Supabase Storage should allow your domain
   - Default: allows all origins

3. **Check file actually uploaded**:
   ```bash
   # Go to Supabase Dashboard
   # Storage → site-images
   # Verify files are present
   ```

---

## Rollback Plan

If migration causes issues:

```bash
# Revert URL changes
git checkout src/

# Redeploy previous version
npm run deploy:prod
```

---

## Support

If you encounter issues:
1. Check the mapping file: `temp/cloudinary-to-supabase-mapping.json`
2. Review failed uploads in migration output
3. Test individual assets in Supabase Dashboard

---

## Timeline Estimate

**Total Time: 30-60 minutes**

- Migration script: 10-15 minutes
- URL updates: 2 minutes
- Local testing: 5 minutes
- Dev deployment: 5 minutes
- Dev testing: 10 minutes
- Production deployment: 3 minutes
- Production verification: 5 minutes

**Your site will be back online within the hour!**
