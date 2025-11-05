# Cloudinary to Supabase Storage - Complete Migration Plan

**Date:** 2025-11-05
**Status:** 🟡 READY TO EXECUTE
**Estimated Time:** 2-3 hours

---

## Executive Summary

**Current Situation:**
- ❌ Gallery page uses Cloudinary URLs (38 assets)
- ❌ cloudinary-optimizer.js actively used
- ✅ Supabase Storage infrastructure exists (11 buckets)
- ✅ supabase-media-optimizer.js ready
- ⚠️ Previous backup (612 files) is missing

**Goal:** Complete migration from Cloudinary to Supabase Storage with zero downtime

**Approach:** Download, upload, update, test, deploy

---

## Phase 1: Asset Discovery & Backup (30 min)

### 1.1 Find ALL Cloudinary Assets

```bash
# Search for all Cloudinary URLs in codebase
grep -r "cloudinary.com" src/ --include="*.{js,jsx,ts,tsx}" > temp/cloudinary-urls-found.txt

# Count unique URLs
grep -oP 'https://res\.cloudinary\.com/[^\s"'\''<>]+' temp/cloudinary-urls-found.txt | sort -u | wc -l
```

**Expected Result:** List of ALL Cloudinary URLs currently in use

### 1.2 Create Backup Directory

```bash
mkdir -p cloudinary-backup/{images,videos,other}
```

### 1.3 Download ALL Assets

**Create download script:** `scripts/backup-cloudinary-assets.js`

```javascript
import https from 'https';
import fs from 'fs';
import path from 'path';

// Extract URLs from portfolio-assets.js
const portfolioAssets = await import('../src/data/portfolio-assets.js');
const assets = portfolioAssets.portfolioAssets || [];

console.log(`📥 Found ${assets.length} portfolio assets to backup`);

for (const asset of assets) {
  const url = asset.url;
  const fileName = asset.publicId + '.' + asset.format;
  const subfolder = asset.type === 'video' ? 'videos' : 'images';
  const filePath = path.join('cloudinary-backup', subfolder, fileName);

  console.log(`Downloading: ${fileName}`);

  // Download file
  await downloadFile(url, filePath);
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

console.log('✅ Backup complete');
```

**Run:**
```bash
node scripts/backup-cloudinary-assets.js
```

**Expected:** 38 files downloaded to `cloudinary-backup/`

---

## Phase 2: Upload to Supabase Storage (45 min)

### 2.1 Verify Buckets Exist

```bash
node temp/check-supabase-storage.js
```

**Expected buckets:**
- `site-images` (public)
- `site-videos` (public)

### 2.2 Create Upload Script

**Create:** `scripts/upload-portfolio-to-supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Read portfolio assets
const portfolioModule = await import('../src/data/portfolio-assets.js');
const assets = portfolioModule.portfolioAssets || [];

const urlMapping = [];

console.log(`📤 Uploading ${assets.length} assets to Supabase Storage...\n`);

for (const asset of assets) {
  const fileName = asset.publicId + '.' + asset.format;
  const bucket = asset.type === 'video' ? 'site-videos' : 'site-images';
  const localPath = path.join(__dirname, '..', 'cloudinary-backup', asset.type + 's', fileName);

  if (!fs.existsSync(localPath)) {
    console.log(`⚠️  Skipping ${fileName} - file not found in backup`);
    continue;
  }

  const fileBuffer = fs.readFileSync(localPath);
  const storagePath = `portfolio/${fileName}`;

  console.log(`Uploading ${fileName} to ${bucket}/${storagePath}...`);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType: asset.type === 'video' ? 'video/mp4' : 'image/' + asset.format,
      upsert: true
    });

  if (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    continue;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  // Store mapping
  urlMapping.push({
    oldUrl: asset.url,
    newUrl: publicUrl,
    publicId: asset.publicId,
    type: asset.type,
    format: asset.format
  });

  console.log(`✅ Uploaded: ${publicUrl}`);
}

// Save URL mapping
fs.writeFileSync(
  'temp/cloudinary-to-supabase-url-mapping.json',
  JSON.stringify(urlMapping, null, 2)
);

console.log(`\n✅ Upload complete! ${urlMapping.length} files uploaded`);
console.log('📝 URL mapping saved to temp/cloudinary-to-supabase-url-mapping.json');
```

**Run:**
```bash
node scripts/upload-portfolio-to-supabase.js
```

**Expected:** 38 files uploaded + URL mapping file created

---

## Phase 3: Update Codebase URLs (20 min)

### 3.1 Update portfolio-assets.js

**Create:** `scripts/update-portfolio-assets.js`

```javascript
import fs from 'fs';

// Read URL mapping
const mapping = JSON.parse(fs.readFileSync('temp/cloudinary-to-supabase-url-mapping.json', 'utf-8'));

// Read current portfolio-assets.js
let content = fs.readFileSync('src/data/portfolio-assets.js', 'utf-8');

// Replace each URL
let replacedCount = 0;
for (const map of mapping) {
  if (content.includes(map.oldUrl)) {
    content = content.replace(map.oldUrl, map.newUrl);
    replacedCount++;
    console.log(`✅ Replaced: ${map.publicId}`);
  }
}

// Update generation timestamp
const now = new Date().toISOString();
content = content.replace(
  /Generated on: [^\n]+/,
  `Generated on: ${now}`
);

// Save updated file
fs.writeFileSync('src/data/portfolio-assets.js', content);

console.log(`\n✅ Updated portfolio-assets.js`);
console.log(`📝 Replaced ${replacedCount} URLs`);
```

**Run:**
```bash
node scripts/update-portfolio-assets.js
```

### 3.2 Update Gallery Page

**Update:** `src/pages/gallery.jsx`

Replace imports:
```javascript
// OLD
import { optimizeCloudinaryImage, optimizeCloudinaryVideo, getVideoThumbnail, CLOUDINARY_PRESETS } from '@/utils/cloudinary-optimizer';

// NEW
import { optimizeSupabaseImage, optimizeSupabaseVideo, SUPABASE_PRESETS } from '@/utils/supabase-media-optimizer';
```

Replace usage in lightboxSlides:
```javascript
// OLD
src: optimizeCloudinaryImage(asset.url, {...})

// NEW
src: optimizeSupabaseImage(asset.url, {...})
```

```javascript
// OLD
src: optimizeCloudinaryVideo(asset.url, {...})

// NEW
src: optimizeSupabaseVideo(asset.url)
```

**Note:** Supabase doesn't have video transformation API, so `optimizeSupabaseVideo` just returns the URL

---

## Phase 4: Remove Cloudinary Dependencies (15 min)

### 4.1 Update or Remove Files

**Files to update:**
1. `src/utils/cloudinary-optimizer.js` → Deprecate or delete
2. `src/components/shared/OptimizedImage.jsx` → Use supabase-media-optimizer
3. `src/lib/supabase-media-storage.js` → Remove Cloudinary client import

### 4.2 Update Package.json

Remove Cloudinary package if installed:
```bash
npm uninstall cloudinary
```

### 4.3 Update Environment Variables

**.env.example:**
```bash
# Remove these lines:
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
```

### 4.4 Update MCP Configuration

**File:** `mcp-portable-config/mcp-config.json`

Move Cloudinary MCP to disabled:
```json
"_disabled_mcpServers": {
  "cloudinary": { ... }
}
```

---

## Phase 5: Testing (30 min)

### 5.1 Local Testing

```bash
# Start dev server
npm run dev

# Open gallery page
# http://localhost:5173/gallery
```

**Test Checklist:**
- [ ] Gallery page loads without errors
- [ ] All images display correctly
- [ ] All videos play correctly
- [ ] Lightbox opens and navigates
- [ ] Mouse wheel zoom works
- [ ] Arrow navigation works
- [ ] No Cloudinary URLs in Network tab
- [ ] All URLs are Supabase Storage URLs
- [ ] Image optimization works (WebP/AVIF)

### 5.2 Browser Console Check

**Expected:**
- ✅ No 404 errors
- ✅ No Cloudinary requests
- ✅ All Supabase URLs return 200

### 5.3 Performance Test

```bash
# Run Lighthouse audit
npm run perf:audit
```

**Expected:**
- Performance: 90+
- Images load quickly
- Videos stream smoothly

---

## Phase 6: Deployment (20 min)

### 6.1 Commit Changes

```bash
git add .
git commit -m "feat: Complete migration from Cloudinary to Supabase Storage

- Migrated 38 portfolio assets to Supabase Storage
- Updated gallery page to use supabase-media-optimizer
- Removed Cloudinary dependencies and utilities
- Updated environment configuration
- Tested all media loading and optimization

Breaking Changes:
- Removed cloudinary-optimizer.js (replaced with supabase-media-optimizer.js)
- Removed Cloudinary MCP server
- Removed Cloudinary environment variables

Migration Details:
- 38 assets uploaded to site-images and site-videos buckets
- URL mapping saved to temp/cloudinary-to-supabase-url-mapping.json
- Zero downtime migration with full testing

Cost Savings: ~$1,188/year (Cloudinary plan no longer needed)

🤖 Generated with Claude Code"
```

### 6.2 Deploy to Dev Site

```bash
npm run deploy:dev
```

**Test on dev site:**
- https://dev.disruptorsmedia.com/gallery

### 6.3 Monitor and Verify

Wait 15 minutes, check:
- [ ] Gallery loads correctly
- [ ] All images/videos display
- [ ] No console errors
- [ ] Performance is good

### 6.4 Deploy to Production

```bash
npm run deploy:prod
```

**Test on production:**
- https://dm4.wjwelsh.com/gallery

---

## Phase 7: Documentation Updates (15 min)

### 7.1 Update CLAUDE.md

Remove Cloudinary references:
```markdown
# OLD
- Cloudinary MCP server for image optimization
- cloudinary-optimizer.js utility

# NEW
- Supabase Storage for all media assets
- supabase-media-optimizer.js utility
```

### 7.2 Update Technology Stack

**File:** `docs/TECHNOLOGY_STACK.md`

```markdown
# OLD
**Media Storage:** Cloudinary CDN

# NEW
**Media Storage:** Supabase Storage (Cloudflare CDN)
```

### 7.3 Archive Old Documentation

```bash
mkdir -p docs/archive/cloudinary
mv docs/agents/cloudinary-optimizer.md docs/archive/cloudinary/
mv temp/CLOUDINARY_*.md docs/archive/cloudinary/
```

### 7.4 Create Migration Record

**File:** `docs/migrations/2025-11-05-cloudinary-to-supabase.md`

Document the migration for future reference

---

## Phase 8: Cleanup (10 min)

### 8.1 Archive Backup

```bash
# Compress backup
tar -czf cloudinary-backup-20251105.tar.gz cloudinary-backup/

# Move to archive directory
mkdir -p archives
mv cloudinary-backup-20251105.tar.gz archives/

# Remove uncompressed backup (keep .tar.gz)
rm -rf cloudinary-backup/
```

### 8.2 Cancel Cloudinary Account

**⚠️ WAIT 2 WEEKS BEFORE CANCELING**

After 2 weeks of stable operation:
1. Log into Cloudinary dashboard
2. Download final invoice
3. Export usage logs
4. Cancel subscription
5. Delete account

---

## Rollback Plan

If anything goes wrong:

### Quick Rollback (5 min)

```bash
# Revert portfolio-assets.js
git checkout HEAD~1 -- src/data/portfolio-assets.js

# Revert gallery page
git checkout HEAD~1 -- src/pages/gallery.jsx

# Restart dev server
npm run dev
```

### Full Rollback (10 min)

```bash
# Revert entire commit
git revert HEAD

# Redeploy
npm run deploy:dev
npm run deploy:prod
```

---

## Risk Assessment

**Risks:**
- 🟡 **Medium:** Images load slower (Supabase CDN vs Cloudinary CDN)
- 🟢 **Low:** Broken image URLs (mitigated by URL mapping verification)
- 🟢 **Low:** Video playback issues (direct URLs, no transformation)

**Mitigation:**
- Test thoroughly on dev site first
- Keep Cloudinary active during transition
- Maintain backup for 6 months
- Monitor performance metrics

---

## Success Criteria

**Migration is successful when:**
- ✅ Gallery page loads all assets correctly
- ✅ No Cloudinary URLs in Network tab
- ✅ All Supabase Storage URLs return 200
- ✅ Image optimization works (WebP/AVIF)
- ✅ Performance score 90+
- ✅ No console errors
- ✅ Production site stable for 1 week

---

## Cost Savings

**Current:** $99/month Cloudinary plan = $1,188/year
**After:** Supabase Storage free tier = $0/year

**Annual Savings:** $1,188
**5-Year Savings:** $5,940

**ROI:** Migration effort (3 hours) pays for itself in the first month

---

## Questions & Answers

**Q: Will video playback be slower?**
A: No. Direct Supabase Storage URLs are served via Cloudflare CDN (285 cities). Performance should be similar or better.

**Q: What about image optimization (WebP/AVIF)?**
A: Supabase has built-in image transformation API. supabase-media-optimizer.js handles format conversion automatically.

**Q: Can we rollback easily?**
A: Yes. Git revert + redeploy = 10 minutes to rollback.

**Q: When can we delete Cloudinary?**
A: After 2 weeks of stable production operation with monitoring.

---

## Next Steps

**Ready to execute?**

Run this command to start:
```bash
# Phase 1: Backup
node scripts/backup-cloudinary-assets.js

# Phase 2: Upload
node scripts/upload-portfolio-to-supabase.js

# Phase 3: Update URLs
node scripts/update-portfolio-assets.js

# Phase 4: Update gallery page
# (manual edit required)

# Phase 5: Test
npm run dev
# Test gallery at http://localhost:5173/gallery

# Phase 6: Deploy
npm run deploy:dev
# Test at https://dev.disruptorsmedia.com/gallery

npm run deploy:prod
# Monitor at https://dm4.wjwelsh.com/gallery
```

---

**Status:** 🟢 READY TO EXECUTE
**Estimated Time:** 2-3 hours
**Risk Level:** LOW (with proper testing)
**Cost Savings:** $1,188/year
