# Corporate Studio Section — Podcast Page

**Date:** 2026-03-04
**File:** `src/pages/podcast.jsx`
**Status:** Approved

## Summary

Add a second studio showcase section to the podcast page for the corporate/executive studio space. Placed directly after the existing "Cinematic Podcasting. Comfortable Energy." section, before testimonials.

## Requirements

- 7 corporate studio images (hosted on Supabase storage)
- H1: "Command the Room. Even on Camera."
- H2: "A refined studio environment built for leaders, teams, and brand credibility."
- 3 feature boxes below (different from the existing studio's boxes)
- Same gallery interaction pattern as existing studio section

## Images

```
https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235640.png
https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235602.png
https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235615.png
https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235700.png
https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235720.png
https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235626.png
https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235650.png
```

## Section Structure

### Header
- Gold pill badge: "Corporate Studio"
- H1: "Command the Room. Even on Camera."
- Subtitle: "A refined studio environment built for leaders, teams, and brand credibility."

### Image Gallery
- Large featured image (switchable, ~800px min-height, rounded-3xl, border)
- 7 thumbnails below in grid-cols-4 layout (row 1: 4 images, row 2: 3 images centered)
- Separate `activeCorporateImage` state (independent from existing gallery)
- Same fade transition and gold active-border styling

### 3 Feature Boxes

| # | Icon | Title | Description |
|---|------|-------|-------------|
| 1 | Crown | Executive-Ready Environment | A polished space designed for founders, leaders, and teams who need to look sharp on camera |
| 2 | Users | Team & Panel Sessions | Room for roundtables, team discussions, and multi-guest recordings with individual mic setups |
| 3 | Shield | Brand-Aligned Production | Lighting, backdrop, and framing calibrated to reinforce your corporate identity and standards |

### Visual Patterns (matching existing section)
- Same background gradient: `from-black via-gray-900 to-black`
- Same glassmorphic card style for feature boxes
- Same Framer Motion animations (fade-in-up)
- Same gold shimmer styling for badge and icons
