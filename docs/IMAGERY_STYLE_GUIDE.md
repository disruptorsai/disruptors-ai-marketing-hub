# Disruptors Media — Imagery Style Guide

**Owner:** Milo · **Scope:** §03 of the Website Action Plan
**Purpose:** Fix the three problems flagged in the website review — (1) images repeat the same palette, (2) blue tones clash with branding, (3) too much blank space — and give everyone one reference so new imagery stays on-brand.

---

## 1. Principles

1. **Warm, not cool.** Everything skews gold/amber/charcoal. **No blue casts.** If a source image is blue-tinted, warm-grade it before use.
2. **Cinematic classical × AI.** Our signature look is Renaissance / classical art fused with modern AI (frescoes, Roman/Greek figures, sculpture, painterly light). Keep the *motif*, but **vary the composition** so pages don't feel like the same picture twice.
3. **Depth over emptiness.** Never ship a big flat empty area. Fill space with a texture, a gradient, a gold glow, a device/panel, or motion — see §5.
4. **Gold is an accent, not a fill.** Use gold for highlights, edges, glows, and CTAs — not large flat gold fields, and never for long body text.
5. **One system, everywhere.** The service pages already encode this (charcoal + paper-texture sections, grayscale→gold hero media, gold accents). New imagery should drop into that system without re-theming.

---

## 2. Color palette

| Token | Hex | Use |
|---|---|---|
| Gold (primary) | `#BF953F` | Accents, edges, CTAs, icons on dark |
| Gold light | `#FCF6BA` | Highlights, glows, gradient tops |
| Gold dark | `#B38728` | Gradients, hovers |
| Gold deepest | `#AA771C` | Button hover, gradient bottoms |
| Gold on light | `#8a6a1f` | Gold accents on the paper/white sections (AA contrast) |
| Ink / charcoal | `#080a0d` → `#0b0b0c` | Dark section canvas |
| Panel | `#0f0f14` | Dark cards / product panels |
| Paper | site `main-bg.jpg` (warm plaster) | Light section canvas |
| Text on dark | `#fafafa` / `white/70` | Headings / body |
| Text on light | `#0b0b0c` / `black/60` | Headings / body |
| Border (dark) | `rgba(255,255,255,.10)` | Card/section edges |
| Border (light) | `rgba(0,0,0,.10)` | Card/section edges |

**Forbidden in imagery:** raw blues, teals, and cool grays as dominant tones. **Signal colors** (red/yellow/green terminal dots, status pips) are allowed only at tiny UI scale.

---

## 3. Imagery direction

**Do use:**
- Classical/Renaissance subjects reimagined with AI/tech (a Roman general at a laptop, a fresco of a data pipeline, sculpture with circuitry) — warm-graded.
- Painterly, cinematic lighting; shallow depth; texture (canvas, plaster, marble, brushed metal).
- Abstract gold "energy"/light forms for decorative backgrounds.

**Vary these so pages don't repeat:**
- Subject (figure vs object vs abstract), crop (wide vs tight), and composition (left-weighted vs centered). Two adjacent service pages should not read as the same image recolored.

**Standard treatments (already in the service template):**
- **Hero media:** `grayscale + contrast-125`, darkened with a top→bottom charcoal gradient, reveals to full color on hover. Keeps busy imagery from fighting the text.
- **Full-bleed video backdrop:** service video at `~30% opacity, grayscale`, fading into `#080a0d`.
- **Decorative graphics:** gold radial glows (`radial-gradient(circle, #BF953F33, transparent 70%)`, blurred), thin gold "flare" lines, dotted grids.

---

## 4. Fixing the "blue clash"

Before using any photo/still/video with cool tones:
1. Desaturate or warm-grade (push whites to warm, pull blues toward neutral/amber).
2. Prefer the grayscale→gold treatment (§3) — it neutralizes any residual blue automatically.
3. For generated imagery, bake the warm grade into the prompt (see §7) and reject cool-toned outputs.

---

## 5. Depth — never leave blank space

When a section or image feels empty, add one or more (in this order of subtlety):
1. **Paper/plaster texture** on light sections; **charcoal + subtle dot-grid** on dark.
2. **Gold radial glow** behind a focal point (30–40px blur, low opacity).
3. **Edge/flare lines** — thin gold gradient hairlines on panel corners.
4. **A panel or device** (the dark "browser-chrome" product panel, a data-node diagram, a stat band).
5. **Motion** — a looping darkened video backdrop, a shimmer, or a scroll-reveal.
6. **A side element** — an off-canvas figure/graphic bleeding in from one edge (per the review's "side element" note) instead of centered-with-margins.

---

## 6. Do's & Don'ts

**Do**
- Keep imagery warm (gold/charcoal/amber) and cinematic.
- Vary composition across adjacent pages.
- Use grayscale→gold / dark-overlay treatments so images support text, not fight it.
- Fill negative space with texture, glow, panels, or motion.

**Don't**
- Use blue/teal-dominant images, or leave a blue cast uncorrected.
- Repeat the exact same palette/composition on back-to-back pages.
- Put long text on top of a busy, un-overlaid image.
- Leave large flat empty regions.
- Use gold as a big flat fill or for body copy.

---

## 7. Generating on-brand imagery

Per `CLAUDE.md`, generate with **OpenAI gpt-image-1** or **Gemini 2.5 Flash** (never DALL·E). Bake the brand in:

> *"Cinematic, warm-graded [subject] in a Renaissance/classical-fresco style fused with subtle modern AI/tech elements. Amber and gold lighting, deep charcoal shadows, painterly texture. No blue or teal tones. Shallow depth of field, dramatic side light. [wide 16:9 / portrait 4:5] composition with room for [left/right] text overlay."*

Reject any output that reads cool/blue, looks like the previous page's image, or has no place for the text.

---

## 8. Specs

- **Aspect ratios:** hero portrait `4:5`; full-bleed bands `16:9`; product panels `~16:10`.
- **Formats:** `.webp` (photos/stills), `.mp4` (H.264, muted, looped) for motion, `.svg` for logos/marks.
- **Hosting/optimization:** Supabase Storage via `optimizeSupabaseImage()` or Cloudinary via `optimizeCloudinaryImage()/optimizeCloudinaryVideo()` (see `src/utils/`). Serve `f_auto,q_auto`, sized to the container.
- **Weight budget:** hero images ≤ ~250 KB after optimization; background videos compressed hard (see the character-video compression task) — a bright, busy full-res video is the #1 page-weight offender.
- **Accessibility:** meaningful `alt` on content images; `aria-hidden` on decorative graphics; maintain 4.5:1 text contrast over any image (that's what the dark overlays guarantee).

---

*Living document — update as the visual system evolves. The service-page template (`src/components/solutions/ServicePagePro.jsx`) is the canonical implementation of this guide.*
