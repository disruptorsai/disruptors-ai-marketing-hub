# Archived Home Page Sections
**Archived on:** 2025-10-06
**Branch:** v2.2
**Reason:** Content optimization - removing redundant sections

---

## INNOVATION Section (AlternatingLayout)

```javascript
{
  kicker: "INNOVATION",
  headline: "Cutting-Edge AI Solutions",
  body: "From automated lead generation to intelligent customer insights, we deploy the latest AI technologies to give your business a competitive edge in the digital marketplace.",
  video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259181/social_u4455988764_Inside_a_grand_marble_hall_scholars_tend_to_cryst_b343eebf-1f3d-4deb-a5be-912076e91fe1_0_soeuwu.mp4",
  imageAlt: "AI Innovation Technology",
  backgroundColor: "bg-gray-900",
  textColor: "text-white"
}
```

---

## RESULTS Section (AlternatingLayout)

```javascript
{
  kicker: "RESULTS",
  headline: "Proven Success Stories",
  body: "Our clients see average growth increases of 300% within the first 6 months. We don't just promise results—we deliver measurable outcomes that transform businesses.",
  video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759116522/full-animation_online-video-cutter.com_zzpok1.mp4",
  imageAlt: "Business Growth Analytics",
  backgroundColor: "bg-transparent",
  textColor: "text-black"
}
```

---

## MISSION Section (AlternatingLayout)

```javascript
{
  kicker: "MISSION",
  headline: "Your Partner in AI Excellence",
  body: "Technology should free you from repetitive tasks. We leverage AI to eliminate monotony so you can focus on what only you can do: connect with the people you serve and grow your impact.",
  video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259174/social_u4455988764_httpss.mj.runf65BhPN_EZo_make_the_clouds_slowly_s_3321fb69-fe0e-43bf-91c7-01e7551a7e85_0_f4rib5.mp4",
  imageAlt: "Human-AI Partnership",
  backgroundColor: "bg-gray-900",
  textColor: "text-white",
  cta: {
    label: "Partner With Us",
    link: "book-strategy-session"
  }
}
```

---

## Three Pillars Section (ThreePillars Component)

**Title:** "We Tailor Every Strategy to the Soul of Your Business."

**Pillars:**

1. **Consultative First**
   - We start by understanding your business's struggles, then we create a plan.

2. **Individualized & Transparent**
   - We'll implement what you need and walk you through every step.

3. **AI-Powered Efficiency**
   - From lead generation to operations, we automate what slows you down.

**Component Code:**
```jsx
{/* Our Approach (3 Pillars) */}
<section className="bg-gray-900 text-white py-8 sm:py-12">
  <ThreePillars />
</section>
```

---

## Dual CTA Block (DualCTABlock Component)

**Title:** "Ready to grow?"

**CTAs:**
- **Primary CTA:** "Book a Free Strategy Session" → `/book-strategy-session`
- **Secondary CTA:** "Get a Free Business Audit" → `/free-business-audit`

**Component Code:**
```jsx
{/* CTA Block */}
<section className="bg-gray-900 text-white">
  <DualCTABlock />
</section>
```

---

## Restoration Instructions

If you need to restore any of these sections:

1. **AlternatingLayout Sections:** Add the section objects back to the `alternatingData` array in `Home.jsx`
2. **ThreePillars Section:** Add the section JSX back to the Home.jsx component (around line 191)
3. **DualCTABlock Section:** Add the section JSX back to the Home.jsx component (around line 196)
4. **Rendering Logic:** Ensure `alternatingData.slice(2)` includes the restored sections

---

## Related Components

- `src/components/shared/AlternatingLayout.jsx`
- `src/components/shared/ThreePillars.jsx`
- `src/components/shared/DualCTABlock.jsx`
