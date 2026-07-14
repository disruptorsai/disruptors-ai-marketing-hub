import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { caseStudies } from '@/data/caseStudies';
import { optimizeSupabaseImage } from '@/utils/supabase-media-optimizer';
import FastVideo from '@/components/shared/FastVideo';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';

/**
 * Work / Case Studies page — rebuilt in the charcoal + gold design system.
 * Layout: dark hero → spotlight tier (flagship studies) → filterable card grid.
 */

const GOLD = '#BF953F';

// Group the granular per-client industries into a few broad filterable categories.
const CATEGORY_MAP = {
  'Healthcare & Wellness': 'Healthcare',
  'Health & Cognitive Training': 'Healthcare',
  'Fitness & Wellness': 'Healthcare',
  'Financial Services': 'Finance',
  'Real Estate Finance': 'Finance',
  'Financial Planning': 'Finance',
  'M&A Advisory & Consulting': 'Finance',
  'Employee Benefits & Insurance': 'Finance',
  'Construction & Trading': 'Construction',
  'Construction & Landscaping': 'Construction',
  'Custom Home Construction': 'Construction',
  'Business Software Solutions': 'Tech',
  'Web Development & Design': 'Tech',
  'Education Technology': 'Tech',
  'Audio Engineering & Production': 'Other',
  'Industrial Safety': 'Other',
  'Automotive Services': 'Other',
};
const categoryOf = (industry) => CATEGORY_MAP[industry] || 'Other';

// Flagship studies to spotlight above the grid (they each have a detailed page).
const SPOTLIGHT_NAMES = ['the-wellness-way', 'tradeworx-usa', 'timber-view-financial'];

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-gold-shine">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: GOLD }} /> {children}
    </span>
  );
}

// Cards are intentionally non-navigating for now (no case-study or website link).
function CardLink({ study, className, children }) {
  return <div className={className}>{children}</div>;
}

function SpotlightCard({ study, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-60px' }}
    >
      <CardLink
        study={study}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f14] transition-all duration-300 hover:-translate-y-1 hover:border-[#BF953F]/60"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={optimizeSupabaseImage(study.heroImage, { width: 800, quality: 72 })}
            alt={study.client}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover grayscale-[.2] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f14] via-[#0f0f14]/30 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm">
            {study.industry}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-2xl font-bold tracking-tight text-white">{study.client}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55 line-clamp-2">{study.overview}</p>
        </div>
      </CardLink>
    </motion.div>
  );
}

function GridCard({ study, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
    >
      <CardLink
        study={study}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0f0f14] transition-all duration-300 hover:-translate-y-1 hover:border-[#BF953F]/60"
      >
        <div className="relative aspect-[16/11] overflow-hidden">
          <img
            src={optimizeSupabaseImage(study.heroImage, { width: 600, quality: 72 })}
            alt={study.client}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover grayscale-[.25] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f14] to-transparent opacity-80" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{study.industry}</span>
          <h3 className="mt-1.5 text-lg font-bold tracking-tight text-white transition-colors">
            {study.client}
          </h3>
        </div>
      </CardLink>
    </motion.div>
  );
}

export default function Work() {
  usePageMeta({
    title: 'Our Work — Client Case Studies | Disruptors Media',
    description:
      'See how Disruptors Media drives results with AI-powered marketing — case studies across healthcare, finance, construction, tech, and more.',
    path: '/work',
    jsonLd: breadcrumb('Work', '/work'),
  });

  const spotlight = useMemo(
    () => SPOTLIGHT_NAMES.map((n) => caseStudies.find((c) => c.name === n)).filter(Boolean),
    []
  );
  const rest = useMemo(
    () => caseStudies.filter((c) => !SPOTLIGHT_NAMES.includes(c.name)),
    []
  );

  const categories = useMemo(() => {
    const set = new Set(rest.map((c) => categoryOf(c.industry)));
    return ['All', ...Array.from(set)];
  }, [rest]);

  const [filter, setFilter] = useState('All');
  const filtered = useMemo(
    () => (filter === 'All' ? rest : rest.filter((c) => categoryOf(c.industry) === filter)),
    [filter, rest]
  );

  return (
    <div className="bg-[#080a0d]">
      <h1 className="sr-only">Our Work — Client Case Studies | Disruptors Media</h1>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[#080a0d] pt-[clamp(96px,16vw,150px)] pb-[clamp(48px,8vw,80px)]">
        {/* Hero background video */}
        <div aria-hidden="true" className="absolute inset-0 z-0">
          <FastVideo
            src="/site-videos/dmsite/home/handshake-landscape.mp4"
            preset="fullscreen"
            autoplay loop muted playsInline
            preload="metadata"
            lazy={false}
            className="h-full w-full object-cover opacity-[0.45] grayscale contrast-110"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,10,13,.5) 0%, rgba(8,10,13,.8) 60%, #080a0d 100%)' }} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 top-10 z-[1] h-80 w-80 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(191,149,63,.14) 0%, transparent 70%)' }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <Eyebrow>Our Work</Eyebrow>
            <h2 className="mt-6 text-[clamp(40px,7vw,80px)] font-bold leading-[0.98] tracking-tight text-[#fafafa]">
              Real clients. <span className="text-gold-shine inline-block pr-[0.08em] -mr-[0.08em]">Real results</span>.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65 sm:text-xl">
              We don't just run campaigns — we install growth infrastructure. Here's the measurable impact of AI-powered systems built inside real businesses.
            </p>
          </motion.div>
        </div>
        <div className="relative z-[2] mt-11 h-px w-full bg-gradient-to-r from-[#BF953F]/50 via-white/10 to-transparent" />
      </section>

      {/* ===== SPOTLIGHT TIER ===== */}
      <section className="bg-[#080a0d] py-[clamp(40px,7vw,80px)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Featured</Eyebrow>
              <h2 className="mt-4 text-[clamp(26px,3.6vw,40px)] font-bold tracking-tight text-white">Flagship transformations</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {spotlight.map((study, i) => (
              <SpotlightCard key={study.name} study={study} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FILTERABLE GRID ===== */}
      <section className="bg-[#080a0d] pb-[clamp(64px,10vw,120px)] pt-[clamp(24px,4vw,48px)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Eyebrow>All Work</Eyebrow>
            <h2 className="mt-4 text-[clamp(26px,3.6vw,40px)] font-bold tracking-tight text-white">Every client, every result</h2>
          </div>

          {/* Filter chips */}
          <div className="mb-10 flex flex-wrap gap-2.5">
            {categories.map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-all duration-300 ${
                    active
                      ? 'bg-[#BF953F] text-[#0b0b0c]'
                      : 'border border-white/15 text-white/70 hover:-translate-y-0.5 hover:border-[#BF953F] hover:text-[#BF953F]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((study, i) => (
              <GridCard key={study.name} study={study} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-[#080a0d] py-[clamp(56px,9vw,110px)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-[clamp(28px,4.4vw,48px)] font-bold tracking-tight text-[#fafafa]">
            Ready to be the next <span className="text-gold-shine">success story</span>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/60">
            Book a strategy session and we'll map the highest-impact systems to install in your business first.
          </p>
          <Link
            to={createPageUrl('book-strategy-session')}
            className="mt-9 inline-flex rounded-[3px] bg-[#BF953F] px-7 py-3.5 text-center font-medium text-[#0b0b0c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#AA771C]"
          >
            Book a Strategy Session
          </Link>
        </div>
      </section>
    </div>
  );
}
