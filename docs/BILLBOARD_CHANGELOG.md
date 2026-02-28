# Billboard Funnel — Complete Build Reference

Everything that was built/changed for the billboard funnel. Includes exact copy, code, URLs, backgrounds, and styling so you can easily modify any part.

---

## Table of Contents

1. [Billboard Popup Modal](#1-billboard-popup-modal)
2. [Billboard Landing Page](#2-billboard-landing-page)
3. [Homepage Integration](#3-homepage-integration)
4. [Gold Shimmer CSS Effects](#4-gold-shimmer-css-effects)
5. [Performance Optimizations](#5-performance-optimizations)
6. [GHL Booking Netlify Function](#6-ghl-booking-netlify-function)
7. [All URLs & Assets](#7-all-urls--assets)
8. [File Index](#8-file-index)

---

## 1. Billboard Popup Modal

**Files:**
- `src/components/shared/BillboardModal.jsx` — the modal UI
- `src/hooks/useBillboardPopup.js` — display logic + persistence

### How it works

The popup appears **1.5 seconds** after the homepage loads. It's rendered as a React Portal on `document.body` at `z-[100]`.

### Popup look & feel

- **Container:** `max-w-sm` (384px), `bg-[#1a1a1a]`, `rounded-2xl`, gold border (`border-[#BF953F]/30`), gold shadow (`shadow-[#BF953F]/10`)
- **Backdrop:** `bg-black/70 backdrop-blur-sm` — clicking backdrop does NOT close it (user must use buttons or X)
- **Close button:** top-right, `bg-black/40` circle with `X` icon (4x4)
- **Animation:** Spring entrance (`damping: 25, stiffness: 300`), scale from 0.95 with 20px y-offset

### 3 States — exact copy and layout

**STATE 1: "Ask"** (first-time visitor)
```
Heading:    "Did you see our billboard?"           (text-xl, font-bold, white)
Subtext:    "We had a feeling you might be         (text-sm, gray-400)
             the curious type."
Image:      /billboard.webp (full width, rounded-xl, gold border)
Button 1:   "Yes, I saw it"                        (gold bg #BF953F, black text, rounded-xl)
Button 2:   "Nope, just browsing"                  (outline, gray-600 border, gray-300 text)
Button 3:   "What billboard?"                      (text-gold-shine, underline on hover)
```

**STATE 1: "Ask"** (returning visitor — after cooldown expired)
```
Heading:    "Still thinking about it?"
Subtext:    "We're not going anywhere. But your competitors might be getting ahead."
Button 1:   "Okay, show me"
Button 2:   "Not yet"
Button 3:   (hidden for returning visitors)
```

**STATE 2: "Reveal"** (after clicking "What billboard?")
```
Heading:    "This one."                            (text-lg, font-bold, white)
Subtext:    "Ring any bells?"                      (text-sm, gray-400)
Image:      /billboard.webp (zoom-in animation: scale 0.8→1, duration 0.6s)
Indicator:  Gold pulsing dot + "Hold tight..." in mono font
```
Auto-advances to State 3 after **3 seconds**.

**STATE 3: "Followup"** (after reveal timer)
```
Heading:    "Now you've seen it."                  (text-lg, font-bold, white)
Subtext:    "Want to learn what we can actually     (text-sm, gray-400)
             do for your business?"
Image:      /billboard.webp (smaller — max-w-[200px], centered)
Button 1:   "Show me"                              (gold bg, black text)
Button 2:   "Not right now"                        (outline, gray border)
```

### Persistence logic (useBillboardPopup hook)

```
localStorage key: "billboard-popup"

Dismiss behavior:
  1st dismiss → 24 hour cooldown
  2nd dismiss → 3 day cooldown
  3rd+ dismiss → 7 day cooldown

Click "Yes" → permanently dismissed (accepted: true)
sessionStorage guard → max 1 popup per page load
```

### Full modal code

```jsx
// src/components/shared/BillboardModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BillboardModal({ isOpen, onClose, onYes, isReturning = false }) {
  const [viewState, setViewState] = useState('ask');

  useEffect(() => {
    if (viewState === 'reveal') {
      const timer = setTimeout(() => setViewState('followup'), 3000);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  useEffect(() => {
    if (isOpen) setViewState('ask');
  }, [isOpen]);

  const askHeading = isReturning ? "Still thinking about it?" : "Did you see our billboard?";
  const askSubtext = isReturning
    ? "We're not going anywhere. But your competitors might be getting ahead."
    : "We had a feeling you might be the curious type.";
  const yesLabel = isReturning ? "Okay, show me" : "Yes, I saw it";
  const noLabel = isReturning ? "Not yet" : "Nope, just browsing";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — no onClick */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-[#1a1a1a] rounded-2xl border border-[#BF953F]/30
                         shadow-2xl shadow-[#BF953F]/10 max-w-sm w-full
                         pointer-events-auto overflow-hidden"
            >
              {/* X close button */}
              <button onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40
                           hover:bg-black/60 text-gray-400 hover:text-white transition-colors z-10">
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {/* ... state content ... */}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

### Full hook code

```js
// src/hooks/useBillboardPopup.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'billboard-popup';
const COOLDOWNS_MS = [
  24 * 60 * 60 * 1000,      // 24 hours
  3 * 24 * 60 * 60 * 1000,  // 3 days
  7 * 24 * 60 * 60 * 1000,  // 7 days
];

function getState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function useBillboardPopup(delayMs = 1500) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const state = getState();
    if (state?.accepted) return;                              // permanent dismiss
    if (state?.dismissedAt) {
      const idx = Math.min((state.dismissCount || 1) - 1, COOLDOWNS_MS.length - 1);
      if (Date.now() - state.dismissedAt < COOLDOWNS_MS[idx]) return;  // still in cooldown
      setIsReturning(true);
    }
    if (sessionStorage.getItem(STORAGE_KEY)) return;          // already shown this page load
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(STORAGE_KEY, 'shown');
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const close = useCallback(() => {
    setIsOpen(false);
    const state = getState() || {};
    saveState({ ...state, dismissedAt: Date.now(), dismissCount: (state.dismissCount || 0) + 1 });
  }, []);

  const accept = useCallback(() => {
    setIsOpen(false);
    saveState({ accepted: true, acceptedAt: Date.now() });
  }, []);

  return { isOpen, isReturning, close, accept };
}
```

---

## 2. Billboard Landing Page

**File:** `src/pages/billboard.jsx`
**Route:** `/billboard` (lazy-loaded with `lazyWithRetry()` in `src/pages/index.jsx`)

### Section 1 — Hero (full-screen)

**Background:** Cloudinary video with 80% black overlay + gold dot pattern at 5% opacity
```
Video:      https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259181/social_u4455988764_Inside_a_grand_marble_hall_scholars_tend_to_cryst_b343eebf-1f3d-4deb-a5be-912076e91fe1_0_soeuwu.mp4
Overlay:    bg-black/80
Dot pattern: radial-gradient(circle at 2px 2px, #BF953F 1px, transparent 0), backgroundSize: 40px 40px, opacity-5
```

**Content:**
```
Badge:      "You Saw The Billboard"     (text-gold-shine, uppercase, pulsing gold dot)
Heading:    "You're Honest About"       (text-4xl sm:text-5xl lg:text-7xl, white)
            "Your Business!"            (text-gold-shine)
Subtext:    "You saw our billboard — that means you're honest about your business'
             strengths and weaknesses. Yours is the type of company we can take
             to a whole new level."     (text-xl sm:text-2xl, gray-300)
CTA 1:      "Book a Strategy Session"   (gold bg, black text, links to /book-strategy-session)
CTA 2:      "See Our Results"           (outline gold, links to #case-studies anchor)
```

**Sizing:** `min-h-screen`, content `max-w-4xl`, centered

### Section 2 — Why Most Marketing Fails (parallax)

**Background:**
```
Image:      https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/ui/backgrounds/main-bg.jpg
Style:      background-attachment: fixed, background-size: cover, background-position: center
Overlay:    bg-black/70
```

**Layout:** 2-column grid (`lg:grid-cols-2 gap-16`)

**Left column:**
```
Heading:    "Why Most Marketing"        (text-3xl sm:text-4xl lg:text-5xl, white)
            "Fails"                     (text-gold-shine)
            "Today"
Divider:    w-20 h-1 gradient from #BF953F to #FCF6BA
Body:       "It's not that businesses aren't trying. It's that they're competing
             against competitors who've deployed AI systems that work 24/7 for
             pennies — while they're burning the midnight oil trying to keep up.
             The gap is widening every single day."
```

**Right column — 4 problem cards:**
```
Card style: bg-gray-900/90 backdrop-blur-md rounded-2xl p-6, gold border (border-[#BF953F]/20, hover: /40)
Icon style: w-6 h-6 icon-gold-shine

Card 1: (Cpu icon)          "AI employees that never sleep"
Card 2: (Globe icon)        "Dominating Google & AI search"
Card 3: (Zap icon)          "Instant lead response, 24/7"
Card 4: (TrendingUp icon)   "10× better margins through AI"
```

Each card has a title (text-lg, bold, white) and body text (gray-400).

### Section 3 — Philosophy & AI Infrastructure

**Background:**
```
Image:      https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/v1759258608/u4455988764_A_vast_Renaissance_fresco_depicting_the_Great_Pyr_830a33dd-1da9-470b-99fa-8e12d1867455_3_l5wfrc.png
Overlay:    bg-black/85
```

**Content:** Glass card (`bg-gray-900/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border-[#BF953F]/20`)
```
Heading:    "Human Principles."          (white)
            "AI Infrastructure."         (text-gold-shine)
Body:       "We don't replace your team. We give them superpowers..."

3 pillars (sm:grid-cols-3):
  (Eye icon)     "Strategy First"         — "Every system starts with understanding..."
  (Brain icon)   "AI-Powered Execution"   — "We deploy intelligent systems..."
  (Shield icon)  "Full Transparency"      — "Live dashboards, real numbers..."

Icon style: w-10 h-10 icon-gold-shine
```

### Section 4 — Video Section (parallax)

**Background:** Same parallax `main-bg.jpg` with `bg-black/70` overlay

**Content:**
```
Heading:    "See How"                    (white)
            "AI Infrastructure"          (text-gold-shine)
            "Works"
Subtext:    "A quick overview of how we build systems that generate, nurture, and close."

Video:      https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/billboard/adapt-or-die.mp4
Poster:     /video-thumbnail-billboard.webp  ("How to DOMINATE with AI" image)
Container:  aspect-video rounded-3xl, gold border, bg-gray-900/90
FastVideo:  controls=true, autoplay=false, muted=false, lazy=true, preload="metadata"
```

### Section 5 — Five-Step Framework

**Background:**
```
Video:      https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/roman-army-painting.mp4
Overlay:    bg-black/95
Dividers:   Gold gradient lines top and bottom (h-1, from-transparent via-[#BF953F] to-transparent)
```

**Content:**
```
Badge:      "Our Process"                (text-gold-shine, pulsing dot)
Heading:    "Five Steps to"              (text-4xl sm:text-5xl lg:text-6xl, white)
            "Unstoppable Growth"         (text-gold-shine)
Subtext:    "A proven framework that turns honest self-assessment into explosive results."
```

**5 steps (lg:grid-cols-5):**
```
Icon style: w-12 h-12 icon-gold-shine
Step label: text-gold-shine text-sm uppercase

Step 01 (Search icon):            "Audit"      — "Take an honest look at your business..."
Step 02 (Crosshair icon):         "Analyze"    — "Look at top competitors..."
Step 03 (Cpu icon):               "Architect"  — "Create AI systems to fill funnel gaps..."
Step 04 (Rocket icon):            "Execute"    — "Launch the system and put it to work..."
Step 05 (SlidersHorizontal icon): "Optimize"   — "Continuously tweak and improve..."
```

### Section 6 — Case Studies Marquee (parallax)

**Background:** Same parallax `main-bg.jpg` with `bg-black/70` overlay
**Anchor:** `id="case-studies"` (linked from hero CTA)

**Content:**
```
Heading:    "Results That"               (text-4xl sm:text-5xl, white)
            "Speak Volumes"              (text-gold-shine)
Subtext:    "Real campaigns. Real data. Real growth."
```

**Marquee:** Auto-scrolling, 40s linear infinite, cards duplicated for seamless loop
```css
@keyframes billboard-marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

**Edge fades:** `w-24` gradient on left (from-black/70) and right (to-transparent)

**Card style:** `w-[380px] bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 border-[#BF953F]/20`

**6 case studies:**
| # | Title | Industry Badge | Key Results |
|---|-------|---------------|-------------|
| 1 | Enterprise-Scale National Campaign | Healthcare Enterprise | $24M spend, $300M revenue, 12.5X ROAS, National |
| 2 | Wellness & Hormone Therapy Clinic | Healthcare | 5.8% CTR, $72 CPL, 11% conv, 3.5X ROI |
| 3 | Telehealth Provider | Healthcare Tech | 65K+ impressions, 15-20 leads/wk, $58 CPL, 4X ROAS |
| 4 | Aesthetic & Body Contouring Clinic | Medical Aesthetics | 6.2% CTR, 350+ consults, $210K+ sales, 3.3X ROAS |
| 5 | Specialized Medical Services Practice | Healthcare | +220% traffic, 200+ inquiries, $81 CPL, 3X ROAS |
| 6 | Regional Multi-Location Clinic | Healthcare | 7.1% CTR, 450+ leads, $180K+ sales, 4X ROAS |

Each card has: industry badge (gold bg), title with ArrowUpRight icon, approach paragraph (line-clamp-2), and 2x2 results grid.

### Section 7 — Strategy Session Booking Form (parallax)

**Background:** Same parallax `main-bg.jpg` with `bg-black/70` overlay

**Content:**
```
Badge:      "Free Strategy Session"      (text-gold-shine, uppercase)
Heading:    "Book Your Free Strategy Session"
Subtext:    "Let's discuss how we can tailor an AI-powered growth strategy...
             This 45-minute session will give you actionable insights whether
             we work together or not."
```

**Form container:** `bg-gray-900/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border-[#BF953F]/20`

**Form fields:**
```
Row 1:  Full Name * (text)      |  Business Name (text)
Row 2:  Email Address * (email) |  Phone Number (tel)
Row 3:  Business Website (url)  |  Monthly Revenue (select dropdown)
Row 4:  Marketing challenge (textarea, optional)

Revenue options: $0-$10K, $10K-$50K, $50K-$100K, $100K-$500K, $500K+

Input style: bg-black/40 border-[#BF953F]/30 text-white placeholder-gray-500 focus:border-[#BF953F]
Submit btn:  "Book My Free Strategy Session" (full-width, gold bg, black text, py-6)
Disclaimer:  "By submitting, you consent to us contacting you..."
```

**Success state:**
```
Icon:       CheckCircle (w-16, icon-gold-shine)
Heading:    "Thank You!"
Body:       "Our team will reach out within 24 hours..."

What's Next card (bg-black/40, gold border):
  ✓ We'll email you within 24 hours
  ✓ Schedule a 45-minute strategy call
  ✓ Receive a custom growth roadmap

Calendar:   GHL iframe embed (bookingUrl from Netlify function)
Fallback:   "Can't see the calendar? Click here to book in a new window"
```

**Form submission endpoint:** `/.netlify/functions/ghl-calendar-booking` (POST)

---

## 3. Homepage Integration

**File:** `src/pages/Home.jsx`

### Popup integration

```jsx
import BillboardModal from '../components/shared/BillboardModal';
import { useBillboardPopup } from '@/hooks/useBillboardPopup';

export default function Home() {
  const navigate = useNavigate();
  const { isOpen, isReturning, close, accept } = useBillboardPopup(1500);

  const handleBillboardYes = () => {
    accept();           // permanently dismiss popup
    navigate('/billboard');
  };

  return (
    <div>
      <BillboardModal isOpen={isOpen} onClose={close} onYes={handleBillboardYes} isReturning={isReturning} />
      {/* ... rest of homepage */}
    </div>
  );
}
```

### Billboard banner on homepage (below client logos)

```jsx
<Link to="/billboard" className="group relative block overflow-hidden bg-black">
  <div className="relative max-w-5xl mx-auto px-4 py-6 sm:py-8 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 sm:gap-6">
      <img
        src="/billboard.png"
        alt="Your marketing sucks billboard"
        className="h-14 sm:h-20 w-auto rounded-lg border border-[#BF953F]/30
                   group-hover:border-[#BF953F]/60 transition-all duration-300"
      />
      <div>
        <p className="text-gold-shine text-xs font-bold tracking-wider uppercase mb-1">
          Saw Our Billboard?
        </p>
        <p className="text-white text-sm sm:text-base font-semibold
                      group-hover:text-gold-shine transition-colors">
          Learn what we can do for your business
        </p>
      </div>
    </div>
  </div>
</Link>
```

### Footer link

```jsx
// In src/components/shared/Footer.jsx — added to company links array:
{ name: 'Billboard', path: 'billboard' }
```

### Route registration

```jsx
// In src/pages/index.jsx
const Billboard = lazyWithRetry(() => import('./billboard.jsx'));
// ...
"billboard": Billboard,
```

---

## 4. Gold Shimmer CSS Effects

**File:** `src/index.css` (lines 91–122)

These CSS classes were applied across 49+ files, replacing all static `#FFD700` and `text-yellow-500`.

### `.text-gold-shine` — animated metallic text

```css
@keyframes gold-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.text-gold-shine {
  background: linear-gradient(110deg,
    #BF953F 0%,
    #FCF6BA 20%,
    #B38728 40%,
    #FBF5B7 60%,
    #AA771C 80%,
    #BF953F 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gold-shimmer 10s ease-in-out infinite;
}

/* SVG fallback — can't use background-clip on SVGs */
svg.text-gold-shine {
  -webkit-text-fill-color: unset;
  background: none;
  color: #FFD700;
}
```

### `.icon-gold-shine` — animated glowing SVG icons

```css
@keyframes icon-gold-shimmer {
  0%, 100% { color: #BF953F; filter: drop-shadow(0 0 6px rgba(191, 149, 63, 0.4)); }
  25%      { color: #FCF6BA; filter: drop-shadow(0 0 12px rgba(252, 246, 186, 0.6)); }
  50%      { color: #B38728; filter: drop-shadow(0 0 8px rgba(179, 135, 40, 0.4)); }
  75%      { color: #FBF5B7; filter: drop-shadow(0 0 12px rgba(251, 245, 183, 0.6)); }
}

.icon-gold-shine {
  animation: icon-gold-shimmer 4s ease-in-out infinite;
}
```

### Gold color palette used throughout

```
Primary gold:       #BF953F
Light gold:         #FCF6BA
Dark gold:          #B38728
Bright gold:        #FBF5B7
Deepest gold:       #AA771C
Solid fallback:     #FFD700
```

### Usage examples

```jsx
{/* Text shimmer */}
<span className="text-gold-shine">Your Business!</span>

{/* Icon glow */}
<Cpu className="w-6 h-6 icon-gold-shine" />

{/* Gold border + bg accent */}
<div className="border border-[#BF953F]/30 bg-[#BF953F]/10">
```

---

## 5. Performance Optimizations

### Billboard image (popup + homepage banner)

```
Original:   public/billboard.png  — 18.44 MB, 7744×2176 PNG
Optimized:  public/billboard.webp — 30 KB, 800px wide WebP (quality 82)
Reduction:  99.8%

Used in: BillboardModal.jsx (all 3 states)
Attributes: width={800} height={225} to prevent layout shift
```

The homepage banner still uses `billboard.png` for the small thumbnail (`h-14 sm:h-20`).

### Video thumbnail (billboard page section 4)

```
Original:   Downloads/hf_20260226...jpeg — 2.9 MB, 2752×1536 JPEG
Optimized:  public/video-thumbnail-billboard.webp — 74 KB, 1280px wide WebP (quality 82)

Used as: poster attribute on the Adapt or Die FastVideo component
```

### Lazy loading strategy

```
Hero video:     lazy=false, preload="auto"     (loads immediately — above the fold)
Section 4 vid:  lazy=true,  preload="metadata" (intersection observer, loads on scroll)
Section 5 vid:  lazy=true,  preload="metadata" (intersection observer, loads on scroll)
Billboard page: lazyWithRetry() route          (code-split, retries on chunk errors)
```

---

## 6. GHL Booking Netlify Function

**File:** `netlify/functions/ghl-calendar-booking.js`

```js
const GHL_WEBHOOK_URL = process.env.GHL_BOOKING_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL;
const GHL_LOCATION_ID = '1DrJ590uuFroxuiy2iME';
const CALENDAR_ID = '0R4D9EJK9OSWn7bkeVzj';

// Endpoint: POST /.netlify/functions/ghl-calendar-booking
// Required fields: fullName, email
// Optional: businessName, phone, website, monthlyRevenue, notes

// Sends to GHL webhook with:
//   full_name, business_name, email, phone, website, monthly_revenue, message
//   source: 'website_strategy_session'

// Returns calendar booking URL:
//   https://api.leadconnectorhq.com/widget/booking/0R4D9EJK9OSWn7bkeVzj
//   Pre-filled with: ?email=...&name=...&phone=...

// GHL embed script (loaded on success):
//   https://link.msgsndr.com/js/form_embed.js
```

**Env vars needed:**
```
GHL_BOOKING_WEBHOOK_URL  (or GHL_WEBHOOK_URL as fallback)
```

---

## 7. All URLs & Assets

### Images

| Asset | Path | Size | Used In |
|-------|------|------|---------|
| Billboard photo (original) | `public/billboard.png` | 18.44 MB | Homepage banner thumbnail |
| Billboard photo (optimized) | `public/billboard.webp` | 30 KB | Popup modal (all 3 states) |
| Video thumbnail | `public/video-thumbnail-billboard.webp` | 74 KB | Section 4 video poster |

### Videos

| Video | URL | Used In |
|-------|-----|---------|
| Hero bg (marble hall) | `https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259181/social_u4455988764_Inside_a_grand_marble_hall_scholars_tend_to_cryst_b343eebf-1f3d-4deb-a5be-912076e91fe1_0_soeuwu.mp4` | Section 1 hero background |
| Adapt or Die training | `https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/billboard/adapt-or-die.mp4` | Section 4 main video |
| Roman army painting | `https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/roman-army-painting.mp4` | Section 5 background |

### Background Images

| Image | URL | Used In |
|-------|-----|---------|
| Main parallax bg | `https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/ui/backgrounds/main-bg.jpg` | Sections 2, 4, 6, 7 (parallax) |
| Renaissance fresco | `https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/v1759258608/u4455988764_A_vast_Renaissance_fresco_depicting_the_Great_Pyr_830a33dd-1da9-470b-99fa-8e12d1867455_3_l5wfrc.png` | Section 3 background |

### External Services

| Service | URL/ID |
|---------|--------|
| GHL Calendar Widget | `https://api.leadconnectorhq.com/widget/booking/0R4D9EJK9OSWn7bkeVzj` |
| GHL Embed Script | `https://link.msgsndr.com/js/form_embed.js` |
| GHL Location ID | `1DrJ590uuFroxuiy2iME` |
| GHL Calendar ID | `0R4D9EJK9OSWn7bkeVzj` |

---

## 8. File Index

| File | What It Does |
|------|-------------|
| `src/components/shared/BillboardModal.jsx` | 3-state popup modal |
| `src/hooks/useBillboardPopup.js` | Popup display logic, cooldowns, localStorage persistence |
| `src/pages/billboard.jsx` | Full 7-section landing page |
| `src/pages/Home.jsx` | Imports modal + hook, has billboard banner below logos |
| `src/pages/index.jsx` | Route registration with `lazyWithRetry()` |
| `src/components/shared/Footer.jsx` | "Billboard" link in company section |
| `src/index.css` | `.text-gold-shine` and `.icon-gold-shine` CSS classes |
| `netlify/functions/ghl-calendar-booking.js` | GHL webhook + calendar URL function |
| `public/billboard.png` | Original billboard image (18.44 MB) |
| `public/billboard.webp` | Optimized billboard image (30 KB) |
| `public/video-thumbnail-billboard.webp` | Video poster thumbnail (74 KB) |
