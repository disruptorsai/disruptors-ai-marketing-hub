# Work Page Debug Guide

## Overview
Comprehensive debugging has been added to the Work page and all its components to help diagnose the loading issue that requires a hard browser refresh (Ctrl+Shift+R).

## What Was Added

### 1. Work.jsx (Main Page)
**Location:** `src/pages/Work.jsx`

**Debug Output:**
- 🔍 Component mount information
- 📊 Case studies data availability
- 🔄 Re-render tracking
- ✅ DOM load state
- 📈 Browser performance metrics
- 💾 Cache status (localStorage, sessionStorage)

**Console Groups:**
```
🔍 [WORK PAGE] Component Mount
📊 [WORK PAGE] Case Studies Data
```

**Key Metrics Tracked:**
- Navigation type (reload, navigate, etc.)
- DOM content loaded time
- Case studies count and data
- Browser cache state

### 2. BentoGridNew.jsx (Portfolio Grid)
**Location:** `src/components/shared/BentoGridNew.jsx`

**Debug Output:**
- 🎯 Component mount/unmount
- 🖼️ Image preloading progress
- ✅ Individual image load success
- ❌ Image load failures with URLs
- 📊 Load progress percentages
- 🃏 Individual card initialization

**Console Groups:**
```
🎯 [BENTO GRID] Component Mount
🖼️ [BENTO GRID] Preloading Images
```

**Key Features:**
- Tracks all 16+ case study images
- Shows preload summary (hero images, logos)
- Real-time load progress updates
- Error tracking with fallback logging
- Per-card image state tracking

### 3. CaseStudySection.jsx (Healthcare Case Studies)
**Location:** `src/components/shared/CaseStudySection.jsx`

**Debug Output:**
- 📚 Component mount/unmount
- 🎬 Auto-scroll animation start/stop
- 🔍 Modal expansion tracking

**Console Groups:**
```
📚 [CASE STUDY SECTION] Component Mount
```

**Key Features:**
- Case study count verification
- Scroll container ref availability
- Auto-scroll animation lifecycle

### 4. DynamicBackground.jsx (Animated Background)
**Location:** `src/components/shared/DynamicBackground.jsx`

**Debug Output:**
- 🎨 Component mount/unmount
- 🔄 Context/intensity changes
- 🎬 Canvas animation start/stop
- ⚠️ Canvas ref availability warnings

**Console Groups:**
```
🎨 [DYNAMIC BACKGROUND] Component Mount
```

**Key Features:**
- Page context verification
- Color scheme logging
- Canvas animation lifecycle
- Performance tracking

## How to Use This Debug System

### Step 1: Open Browser Console
1. Navigate to the Work page: `http://localhost:5173/work` (or dev site)
2. Open DevTools (F12 or Ctrl+Shift+I)
3. Go to Console tab
4. Clear console (Ctrl+L)

### Step 2: Test Normal Load
1. Navigate to Work page from another page
2. Watch console output in real-time
3. Look for the sequence:

```
🔍 [WORK PAGE] Component Mount
  ├─ Case Studies Count: 16
  ├─ Document Ready State: loading/interactive/complete
  └─ Cache Status: {...}

🎨 [DYNAMIC BACKGROUND] Component Mount
  └─ Page Context: work

🎯 [BENTO GRID] Component Mount
  └─ Items received: 16

🖼️ [BENTO GRID] Preloading Images
  ├─ Preloading hero image 1: https://...
  ├─ Preloading logo 1: https://...
  └─ Preload Summary: { heroImages: 16, logos: 16, total: 32 }

📊 [BENTO GRID] Load Progress: 10% (3 loaded, 0 failed, 29 pending)
📊 [BENTO GRID] Load Progress: 25% (8 loaded, 0 failed, 24 pending)
...
✅ [BENTO GRID] All images processed! Success: 32, Failed: 0

📚 [CASE STUDY SECTION] Component Mount
  └─ Case Studies Count: 5
```

### Step 3: Test After Hard Refresh
1. Press Ctrl+Shift+R to hard refresh
2. Compare console output with Step 2
3. Look for differences in:
   - Load order
   - Image success/failure rates
   - Component mount timing
   - Cache state

### Step 4: Look for Red Flags
**❌ Image Loading Failures:**
```
❌ [BENTO GRID] Hero preload failed (1 errors): TradeWorx USA https://...
❌ [BENTO CARD #0] Hero image failed: TradeWorx USA
```

**⚠️ Missing Data:**
```
⚠️ [BENTO GRID] No items to preload
❌ [BENTO GRID] Rendering empty state - no items available
```

**🔄 Fallback Scenarios:**
```
🔄 [BENTO CARD #3] Fallback to logo: Sound Corrections
```

## Common Issues to Diagnose

### Issue 1: Images Not Loading
**Symptoms:**
- Work page appears blank or with missing images
- Hard refresh fixes it

**What to Check:**
1. Look for "❌ Image failed" messages
2. Check if preload completes: `✅ [BENTO GRID] All images processed!`
3. Compare failed count vs total: `Success: 30, Failed: 2`
4. Note which URLs are failing

**Expected Output (Success):**
```
✅ [BENTO GRID] All images processed! Success: 32, Failed: 0
```

### Issue 2: Components Not Mounting
**Symptoms:**
- Page loads but content doesn't appear
- Console shows mount but no render

**What to Check:**
1. Verify mount sequence is complete
2. Check for missing "Component Mount" messages
3. Look for unmount messages (components dying early)
4. Check React errors in console

**Expected Output:**
```
🔍 [WORK PAGE] Component Mount ✓
🎨 [DYNAMIC BACKGROUND] Component Mount ✓
🎯 [BENTO GRID] Component Mount ✓
📚 [CASE STUDY SECTION] Component Mount ✓
```

### Issue 3: Cached Assets Issue
**Symptoms:**
- Works after hard refresh but not soft refresh
- Works on first visit but fails on subsequent visits

**What to Check:**
1. Browser Cache Status in Work page mount
2. Document Ready State timing
3. Performance navigation type
4. Look for stale chunk errors

**Expected Output (First Load):**
```
Browser Cache Status: { localStorage: [...], sessionStorage: [...] }
Window Performance: { navigation: 0, timing: { domContentLoaded: 1234, ... }}
```

**Expected Output (Cached Load):**
```
Window Performance: { navigation: 1, ... } // 1 = reload
```

### Issue 4: JavaScript Chunk Loading Failures
**Symptoms:**
- Console shows chunk load errors
- "Loading chunk X failed" messages

**What to Check:**
1. Network tab for failed JS requests
2. Console for ChunkLoadError
3. Retry attempts from lazyWithRetry

**This would indicate:**
- Deployment cache mismatch
- CDN caching issues
- Build hash mismatch

## Performance Metrics to Track

### Load Progress Timeline
Record these timestamps:
1. Page navigation start
2. Component mount time
3. Image preload initiation
4. First image loaded
5. All images loaded
6. Visual complete

### Success Metrics
- **Image Load Success Rate:** Should be 100% (32/32)
- **Component Mount Success:** All 4 components
- **Load Time:** Under 3 seconds for visual complete
- **No Console Errors:** Zero red messages

## Next Steps After Analysis

### If Images Fail to Load:
1. Check Cloudinary URLs are valid
2. Verify CORS headers
3. Test image URLs directly in browser
4. Check network throttling

### If Components Don't Mount:
1. Check for React errors
2. Verify lazy loading is working
3. Check for route mismatch
4. Verify data imports

### If Cache Is The Issue:
1. Clear browser cache completely
2. Test in incognito mode
3. Check service workers
4. Review Vite build config

### If Chunk Loading Fails:
1. Review lazyWithRetry implementation
2. Check Netlify deployment
3. Verify build artifacts
4. Test CDN cache headers

## Additional Debug Commands

### Check Image Preload Links
```javascript
console.log('Preload links:', [...document.querySelectorAll('link[rel="preload"][as="image"]')].map(l => l.href))
```

### Check React Root State
```javascript
console.log('React root:', document.getElementById('root').innerHTML.length)
```

### Check Case Studies Data
```javascript
import { caseStudies } from '@/data/caseStudies'
console.log('Case studies:', caseStudies.length, caseStudies)
```

## Summary

This debug system provides comprehensive visibility into:
- ✅ Component lifecycle
- ✅ Data loading
- ✅ Image preloading and loading
- ✅ Animation initialization
- ✅ Performance metrics
- ✅ Error tracking

Use the console output to identify exactly where the loading process fails or deviates from expected behavior. The color-coded emoji prefixes make it easy to scan for issues:
- 🔍 = Investigation/Info
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning
- 🔄 = State Change
- 📊 = Progress
- 🎨 = Render
- 🎬 = Animation Start
- 🛑 = Animation Stop
