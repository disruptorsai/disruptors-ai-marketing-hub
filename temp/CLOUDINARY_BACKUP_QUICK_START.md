# Cloudinary Complete Backup - Quick Start

## Step 1: Get Your Cloudinary API Secret (2 minutes)

**IMPORTANT**: You need your Cloudinary API Secret to download all assets.

### How to Get It:

1. **Login to Cloudinary**:
   ```
   https://cloudinary.com/console
   ```

2. **Go to Settings**:
   - Click the gear icon (⚙️) in top right
   - Go to "Security" tab OR "API Keys" section

3. **Reveal API Secret**:
   - You'll see "API Secret" with dots: `••••••••••••••••`
   - Click "Reveal" or the eye icon 👁️
   - Copy the secret (looks like: `AbCdEf1234567890aBcDeF`)

4. **Add to .env file**:
   ```bash
   # Open .env file and replace this line:
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

   # With your actual secret:
   CLOUDINARY_API_SECRET=AbCdEf1234567890aBcDeF
   ```

---

## Step 2: Run Complete Backup (10-30 minutes depending on asset count)

```bash
# Make sure you're in the project directory
cd /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub

# Run the backup script
node scripts/backup-all-cloudinary-assets.js
```

### What It Does:

✅ **Lists ALL assets** in your Cloudinary account (images + videos)
✅ **Downloads everything** to `cloudinary-backup/` folder
✅ **Preserves folder structure** (e.g., `disruptors-media/brand/logos/`)
✅ **Skips duplicates** (won't re-download if file already exists)
✅ **Creates manifest** with complete asset inventory
✅ **Organized by type** (images/, videos/)

### Expected Output:

```
🚨 CLOUDINARY COMPLETE BACKUP STARTING

Cloud Name: dvcvxhzmt
Backup Directory: cloudinary-backup/

============================================================
📸 BACKING UP IMAGES
============================================================

📋 Fetching image list from Cloudinary...
  ✓ Fetched 500 images (total: 500)
  ✓ Fetched 247 images (total: 747)

✓ Found 747 images

[1/747] disruptors-media/brand/logos/logo.svg
  Size: 0.05 MB
  ⬇️  Downloading...
  ✅ Saved to: cloudinary-backup/images/disruptors-media/brand/logos/logo.svg

[2/747] disruptors-media/services/fractional-cmo.jpg
  Size: 1.2 MB
  ⬇️  Downloading...
  ✅ Saved to: cloudinary-backup/images/disruptors-media/services/fractional-cmo.jpg

...

============================================================
🎥 BACKING UP VIDEOS
============================================================

📋 Fetching video list from Cloudinary...
  ✓ Fetched 43 videos (total: 43)

✓ Found 43 videos

[1/43] dmsite/services/ai-automation.mp4
  Size: 15.3 MB
  ⬇️  Downloading...
  ✅ Saved to: cloudinary-backup/videos/dmsite/services/ai-automation.mp4

...

============================================================
📊 BACKUP SUMMARY
============================================================
Total Assets: 790
  Images: 747
  Videos: 43

Total Size: 2,450.67 MB (2.4 GB)

✅ Downloaded: 790
⏭️  Skipped (already exists): 0
❌ Failed: 0

💾 Backup Location: cloudinary-backup/
📋 Manifest: cloudinary-backup/backup-manifest.json

🎉 BACKUP COMPLETE!
```

---

## Step 3: Review Your Backup

```bash
# Check the backup folder structure
ls -lh cloudinary-backup/

# Output:
# cloudinary-backup/
#   ├── images/          (all images organized by folder)
#   ├── videos/          (all videos organized by folder)
#   └── backup-manifest.json  (complete inventory)

# Check manifest file
cat cloudinary-backup/backup-manifest.json
```

### Manifest File Contains:

```json
{
  "backupDate": "2025-11-02T10:30:00.000Z",
  "cloudName": "dvcvxhzmt",
  "images": [
    {
      "public_id": "disruptors-media/brand/logos/logo",
      "format": "svg",
      "bytes": 52341,
      "secure_url": "https://res.cloudinary.com/...",
      "localPath": "cloudinary-backup/images/disruptors-media/brand/logos/logo.svg",
      "downloaded": true
    },
    ...
  ],
  "videos": [...],
  "stats": {
    "totalAssets": 790,
    "totalSizeMB": 2450.67,
    "downloaded": 790,
    "skipped": 0,
    "failed": 0
  }
}
```

---

## Step 4: Choose Your Next Step

### Option A: Continue Using Cloudinary (With Backup)

You now have a complete local backup! You can:

1. **Delete unused assets from Cloudinary** to get under free tier
2. **Optimize heavy videos** (re-encode at lower quality)
3. **Keep backup safe** for emergencies

### Option B: Migrate to Supabase

Use your local backup to upload to Supabase Storage:

```bash
# Run migration to Supabase
node scripts/emergency-cloudinary-migration.js

# Update URLs in codebase
node scripts/update-cloudinary-urls.js

# Deploy
npm run deploy:dev
npm run deploy:prod
```

### Option C: Hybrid Approach

- **Keep Cloudinary** for wjwelsh.com and anthemforge.wjwelsh.com
- **Migrate Disruptors AI** to Supabase
- **Have local backup** for everything

---

## Troubleshooting

### Error: "CLOUDINARY_API_SECRET not found"

```
❌ ERROR: CLOUDINARY_API_SECRET not found in .env
```

**Solution**: Follow Step 1 above to get your API secret from Cloudinary dashboard.

---

### Error: "API request failed: 401"

```
❌ Error fetching images: API request failed: 401
```

**Solution**: Your API Secret is incorrect. Double-check:
1. API Secret is correct (copy/paste from Cloudinary)
2. No extra spaces in .env file
3. API Secret matches your cloud name (dvcvxhzmt)

---

### Error: "Failed to download: 403"

**Solution**: Some assets may have restricted access. The script will log these and continue with others.

---

### Script Stops Mid-Download

**Solution**: The script is safe to re-run! It will:
- Skip files that were already downloaded
- Resume from where it left off
- Not duplicate downloads

Just run again:
```bash
node scripts/backup-all-cloudinary-assets.js
```

---

## File Organization

Your backup will be organized like this:

```
cloudinary-backup/
├── images/
│   ├── disruptors-media/
│   │   ├── brand/
│   │   │   └── logos/
│   │   │       ├── logo.svg
│   │   │       ├── gold-logo.png
│   │   │       └── gold-logo-banner.png
│   │   ├── services/
│   │   │   └── graphics/
│   │   │       ├── hand-human.png
│   │   │       └── ...
│   │   └── content/
│   │       ├── podcast/
│   │       └── studio/
│   ├── case-studies/
│   ├── dmsite/
│   └── ...
├── videos/
│   ├── dmsite/
│   │   └── services/
│   │       ├── ai-automation.mp4
│   │       ├── crm-management.mp4
│   │       └── ...
│   └── ...
└── backup-manifest.json
```

---

## Disk Space Requirements

**Estimated Space Needed**: ~3-5 GB

Check available space:
```bash
df -h .
```

If you need more space:
1. Clear browser cache
2. Delete old downloads
3. Use external drive: `/Volumes/ExternalDrive/cloudinary-backup/`

To backup to external drive:
```bash
# Edit scripts/backup-all-cloudinary-assets.js
# Change line:
const BACKUP_DIR = path.join(__dirname, '../cloudinary-backup');

# To:
const BACKUP_DIR = '/Volumes/ExternalDrive/cloudinary-backup';
```

---

## Timeline

- **Get API Secret**: 2 minutes
- **Run backup script**: 10-30 minutes (depending on asset count and size)
- **Review backup**: 2 minutes
- **Total**: ~15-35 minutes

**Your assets will be safely backed up locally!**
