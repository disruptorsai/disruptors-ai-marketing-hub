# Corporate Studio Section — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a corporate studio showcase section to the podcast page with 7 images, gallery interaction, and 3 feature boxes.

**Architecture:** Single-file edit to `src/pages/podcast.jsx`. Add a new image array, new state variable, and a new `<section>` block mirroring the existing studio showcase structure. No new components or files needed.

**Tech Stack:** React, Framer Motion, Lucide icons, Tailwind CSS

**Design doc:** `docs/plans/2026-03-04-corporate-studio-section-design.md`

**Note:** This project has no test framework. Verify via `npm run build` and manual browser check on dev server.

---

### Task 1: Add new icon imports and corporate image array

**Files:**
- Modify: `src/pages/podcast.jsx:6` (icon imports)
- Modify: `src/pages/podcast.jsx:13-18` (add array after existing `studioImages`)

**Step 1: Update the lucide-react import on line 6**

Add `Crown` and `Shield` to the existing import:

```jsx
import { Play, Mic, Headphones, Video, ArrowRight, Radio, Users, Sparkles, Crown, Shield } from 'lucide-react';
```

**Step 2: Add the `corporateStudioImages` array after the existing `studioImages` array (after line 18)**

```jsx
const corporateStudioImages = [
  "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235640.png",
  "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235602.png",
  "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235615.png",
  "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235700.png",
  "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235720.png",
  "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235626.png",
  "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/podcast/peerspace-imgs/Screenshot%202026-03-03%20235650.png"
];
```

**Step 3: Add state for the corporate gallery**

Inside the `Podcast` component, after `const [activeImage, setActiveImage] = useState(0);` (line 21), add:

```jsx
const [activeCorporateImage, setActiveCorporateImage] = useState(0);
```

---

### Task 2: Add the Corporate Studio section JSX

**Files:**
- Modify: `src/pages/podcast.jsx:594` (insert new section after closing `</section>` of existing studio showcase, before the testimonials `<section>`)

**Step 1: Insert the corporate studio section**

After line 594 (`</section>` closing the existing studio showcase) and before the `{/* Client Testimonials */}` comment on line 596, insert this entire section:

```jsx
      {/* Corporate Studio Showcase */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Corporate Studio</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Command the Room. <span className="text-gold-shine">Even on Camera.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A refined studio environment built for leaders, teams, and brand credibility.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image Gallery */}
            <div className="relative lg:col-span-2">
              <motion.div
                key={activeCorporateImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl"
                style={{ minHeight: '800px' }}
              >
                <img
                  src={corporateStudioImages[activeCorporateImage]}
                  alt="Corporate Studio Setup"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Thumbnails — 4 per row, second row centered */}
              <div className="mt-12 max-w-6xl mx-auto">
                <div className="grid grid-cols-4 gap-8">
                  {corporateStudioImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCorporateImage(index)}
                      className={`aspect-video rounded-2xl overflow-hidden border-4 transition-all ${
                        activeCorporateImage === index
                          ? 'border-yellow-500 shadow-lg shadow-yellow-500/50 scale-110'
                          : 'border-white/20 opacity-70 hover:opacity-100 hover:border-yellow-500/50 hover:scale-110'
                      }`}
                    >
                      <img src={image} alt={`Corporate Studio ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-8 mt-8">
                  <div className="col-start-1 col-span-3 grid grid-cols-3 gap-8 mx-auto w-full max-w-[calc(75%-0.5rem)]">
                    {corporateStudioImages.slice(4).map((image, index) => (
                      <button
                        key={index + 4}
                        onClick={() => setActiveCorporateImage(index + 4)}
                        className={`aspect-video rounded-2xl overflow-hidden border-4 transition-all ${
                          activeCorporateImage === index + 4
                            ? 'border-yellow-500 shadow-lg shadow-yellow-500/50 scale-110'
                            : 'border-white/20 opacity-70 hover:opacity-100 hover:border-yellow-500/50 hover:scale-110'
                        }`}
                      >
                        <img src={image} alt={`Corporate Studio ${index + 5}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:col-span-2 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                    <Crown className="w-8 h-8 icon-gold-shine" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-500 transition-colors">Executive-Ready Environment</h3>
                    <p className="text-gray-400">A polished space designed for founders, leaders, and teams who need to look sharp on camera</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                    <Users className="w-8 h-8 icon-gold-shine" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-500 transition-colors">Team & Panel Sessions</h3>
                    <p className="text-gray-400">Room for roundtables, team discussions, and multi-guest recordings with individual mic setups</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                    <Shield className="w-8 h-8 icon-gold-shine" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-500 transition-colors">Brand-Aligned Production</h3>
                    <p className="text-gray-400">Lighting, backdrop, and framing calibrated to reinforce your corporate identity and standards</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
```

---

### Task 3: Build and verify

**Step 1: Run the build**

```bash
npm run build
```

Expected: Build completes with no errors.

**Step 2: Start dev server and visually verify**

```bash
npm run dev
```

Open http://localhost:5173/podcast in browser and verify:
- Scroll past the existing "Cinematic Podcasting" studio section
- New "Corporate Studio" section appears with correct headings
- 7 thumbnails display (4 top row, 3 bottom row centered)
- Clicking thumbnails swaps the large image
- 3 feature boxes render below with Crown, Users, Shield icons
- Testimonials section follows after
- Existing studio gallery still works independently

**Step 3: Commit**

```bash
git add src/pages/podcast.jsx
git commit -m "feat: Add corporate studio showcase section to podcast page"
```

---

### Summary

| Task | What | Files |
|------|------|-------|
| 1 | Icon imports + image array + state | `src/pages/podcast.jsx` lines 6, 18, 21 |
| 2 | Corporate studio section JSX | `src/pages/podcast.jsx` after line 594 |
| 3 | Build, verify, commit | — |
