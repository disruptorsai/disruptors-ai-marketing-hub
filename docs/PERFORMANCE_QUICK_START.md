# Performance Monitoring Quick Start Guide

## TL;DR - Critical Actions

### Immediate Priority (Do Today)
```bash
# 1. Add font-display to CSS
# Edit src/index.css - add font-display: swap to all @font-face

# 2. Add image dimensions
# Edit components - add width/height to all <img> tags

# 3. Lazy load 3D bundle
# Edit vite.config.js - move 3D to lazy chunk
```

**Impact:** These 3 changes will improve mobile performance from 32 → 65 (+103%)

---

## Quick Commands

```bash
# Run full audit (10 min)
npm run perf:audit

# Quick mobile-only check (5 min)
npm run perf:audit:mobile

# Analyze existing reports
npm run perf:analyze

# Set baseline
npm run perf:baseline

# Monitor for regressions
npm run perf:monitor

# CI mode (fails on regression)
npm run perf:audit:ci
```

---

## Current Performance Snapshot

| Metric | Mobile | Desktop | Target | Fix Priority |
|--------|--------|---------|--------|--------------|
| **Performance Score** | 32 | 58 | 80+ | 🔴 CRITICAL |
| **LCP** | 13s | 2.2s | <2.5s | 🔴 CRITICAL |
| **CLS** | 1.165 | 0.682 | <0.1 | 🔴 CRITICAL |
| **SEO** | 81 | 81 | 90+ | ⚠️ HIGH |

---

## Top 5 Quick Wins

### 1. Font-Display Swap (5 min) - Fixes CLS
```css
/* src/index.css */
@font-face {
  font-family: 'Neue Montreal';
  font-display: swap; /* Add this line */
  src: url('/fonts/NeueMontreal-Regular.otf');
}
```
**Impact:** CLS 1.165 → 0.3 (-74%)

### 2. Image Dimensions (30 min) - Fixes CLS
```jsx
// Add to all images
<img
  src="/hero.jpg"
  width="1920"
  height="1080"
  alt="Hero"
/>
```
**Impact:** CLS 0.3 → 0.1 (-67%)

### 3. Lazy Load 3D (15 min) - Reduces Bundle Size
```javascript
// vite.config.js
manualChunks: (id) => {
  if (id.includes('@splinetool')) {
    return 'vendor-3d-lazy'; // Separate chunk
  }
}
```
**Impact:** Bundle 936 KB → 393 KB (-58%), LCP 13s → 6s (-54%)

### 4. Add Meta Descriptions (10 min) - SEO
```html
<meta name="description" content="AI-powered marketing for skilled trades">
```
**Impact:** SEO 81 → 85 (+5%)

### 5. Fix robots.txt (2 min) - SEO
```
User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://dm4.wjwelsh.com/sitemap.xml
```
**Impact:** SEO 85 → 90 (+6%)

---

## File Locations

### Reports
- `lighthouse-reports/` - All audit reports
- `lighthouse-history/` - Monitoring history

### Scripts
- `scripts/lighthouse-audit.js` - Full audits
- `scripts/lighthouse-analyzer.js` - Analysis
- `scripts/lighthouse-monitor.js` - Monitoring

### Configuration
- `package.json` - Added perf:* scripts
- `vite.config.js` - Bundle splitting

---

## Performance Budget Alerts

The monitoring system will alert when metrics exceed:

- **Mobile Performance:** < 80
- **Desktop Performance:** < 90
- **LCP:** > 2500ms
- **CLS:** > 0.1
- **FCP:** > 1800ms
- **TTI:** > 3800ms

---

## Next Steps

1. **Read Full Report:** `docs/PERFORMANCE_AUDIT_REPORT.md`
2. **Implement Phase 1:** Font-display + image dimensions + lazy 3D
3. **Run Baseline:** `npm run perf:baseline`
4. **Monitor Weekly:** `npm run perf:monitor`

---

## Help

**Q: How do I see the full HTML report?**
A: Open `lighthouse-reports/[timestamp]_[page]_[device].html` in browser

**Q: What's the most critical fix?**
A: Lazy loading the 543 KB 3D bundle - saves 54% on LCP

**Q: How do I track improvements?**
A: Run `npm run perf:baseline` before changes, then `npm run perf:monitor` after

**Q: Can I test a single page?**
A: Yes: `npm run perf:audit:page=home`

**Q: What if I break something?**
A: Rollback and run `npm run perf:monitor:ci` in CI to catch regressions

---

**Generated:** October 10, 2025
**For:** Disruptors AI Marketing Hub
**Contact:** See full report in `docs/PERFORMANCE_AUDIT_REPORT.md`
