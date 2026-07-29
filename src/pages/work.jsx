import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { BarChart3, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { caseStudies } from '@/data/caseStudies';
import { healthcareSuccessStories } from '@/data/healthcareSuccessStories';
import { optimizeSupabaseImage } from '@/utils/supabase-media-optimizer';
import FastVideo from '@/components/shared/FastVideo';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';

/**
 * Work / Case Studies page — rebuilt in the charcoal + gold design system.
 * Layout: dark hero → healthcare success stories (real, verified figures) → filterable card grid.
 */

const GOLD = '#BF953F';

// Group the granular per-client industries into a few broad filterable categories.
const CATEGORY_MAP = {
  'Healthcare & Wellness': 'Healthcare',
  'Health & Cognitive Training': 'Healthcare',
  'Chiropractic Care': 'Healthcare',
  'Real Estate Investment': 'Finance',
  'Real Estate Finance': 'Finance',
  'Financial Planning': 'Finance',
  'Cost Segregation': 'Finance',
  'M&A Advisory & Consulting': 'Finance',
  'Employee Benefits & Insurance': 'Finance',
  'Skilled Trades Staffing': 'Construction',
  'Asphalt Paving': 'Construction',
  'Custom Home Construction': 'Construction',
  'Business Software Solutions': 'Tech',
  'Web Development & Design': 'Tech',
  'Education Technology': 'Tech',
  'Automotive Services': 'Other',
};
const categoryOf = (industry) => CATEGORY_MAP[industry] || 'Other';

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

function ResultStat({ value, label }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3.5">
      <div className="text-xl font-bold tracking-tight text-white sm:text-2xl">{value}</div>
      <div className="mt-1 text-xs leading-snug text-white/50">{label}</div>
    </div>
  );
}

function StoryCard({ story, index, onSelect }) {
  const headline = story.results[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-60px' }}
      onClick={() => onSelect(story)}
      className={`group flex h-full cursor-pointer flex-col rounded-xl border bg-[#0f0f14] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#BF953F]/60 ${
        story.flagship ? 'border-[#BF953F]/40' : 'border-white/10'
      }`}
    >
      <span className="w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70">
        {story.tag}
      </span>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-white transition-colors group-hover:text-gold-shine">{story.title}</h3>

      {headline && (
        <div className="mt-4">
          <div className="text-2xl font-bold tracking-tight text-white">{headline.value}</div>
          <div className="mt-1 text-xs text-white/50">{headline.label}</div>
        </div>
      )}

      <p className="mt-auto pt-4 text-xs text-white/40">Click for more info →</p>
    </motion.div>
  );
}

function SuccessStoryModal({ story, onClose }) {
  if (!story) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0f14] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-6 sm:p-8">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="rounded-full border border-[#BF953F]/40 bg-[#BF953F]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-gold-shine">
              {story.tag}
            </span>
            <h3 className="mt-4 pr-10 text-2xl font-bold tracking-tight text-white sm:text-3xl">{story.title}</h3>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-gold-shine">Approach</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{story.approach}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-gold-shine">Execution</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{story.execution}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-white/70">
                <BarChart3 className="h-3.5 w-3.5 text-gold-shine" /> Key Results
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {story.results.map((r) => (
                  <ResultStat key={r.label} value={r.value} label={r.label} />
                ))}
              </div>
            </div>

            {story.testimonial && (
              <p className="mt-6 border-l-2 border-[#BF953F]/50 pl-4 text-sm italic leading-relaxed text-white/55">
                "{story.testimonial}"
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
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
        {/* Company logos in full brand color on a soft warm off-white card — the classic
            "our clients" treatment: a decisive light panel (not an orphan tint) that pairs
            with the dark/gold page and keeps every logo crisp in its real colors. The few
            white-only logos (Timberview, Neuro, Auto Trim, Core Benefits) use dark variants
            so they read on the light card. object-contain so nothing is cropped. */}
        <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden border-b border-white/10 bg-[#f3f1ec] p-6 sm:p-8">
          <img
            src={study.logo}
            alt={`${study.client} logo`}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
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

// Client video testimonials. Videos are compressed 720p MP4s hosted in Supabase Storage;
// posters were captured from the source films. To add/replace: upload to the
// site-videos/case-studies/ bucket and update `src`/`poster` below.
const CS_VIDEO = 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/case-studies';
// `company` is the headline on each card; `person` is the speaker underneath.
const CASE_STUDY_VIDEOS = [
  { key: 'muscle-works', company: 'Muscle Works Chiropractic', person: 'Dr. Jason Painter', role: 'Chiropractor', duration: '2:03', poster: '/images/case-studies-video/muscle-works.jpg?v=2', src: `${CS_VIDEO}/muscle-works.mp4` },
  { key: 'sunflower', company: 'Sunflower Movement', person: 'Ashley Buckner', role: 'Licensed Therapist', duration: '2:08', poster: '/images/case-studies-video/sunflower-movement.jpg?v=2', src: `${CS_VIDEO}/sunflower-movement.mp4` },
  { key: 'bosshardt', company: 'We Eat Clay', person: 'Neal Bosshardt', role: 'Founder & Author', duration: '5:00', poster: '/images/case-studies-video/neal-bosshardt.jpg?v=2', src: `${CS_VIDEO}/neal-bosshardt.mp4` },
  { key: 'paasch', company: 'Paasch Construction & Consulting', person: 'Bobby Paasch', role: 'VP of Construction', duration: '1:38', poster: '/images/case-studies-video/paasch-construction.jpg?v=2', src: `${CS_VIDEO}/paasch-construction.mp4` },
  { key: 'tittle', company: 'Tittle Advisory Group', person: 'John Tittle', role: 'President', duration: '5:30', poster: '/images/case-studies-video/john-tittle.jpg?v=2', src: `${CS_VIDEO}/john-tittle.mp4` },
  { key: 'robyn', company: 'Karl G. Maeser Preparatory Academy', person: 'Robyn Ellis', role: 'Director', duration: '7:08', poster: '/images/case-studies-video/robyn.jpg?v=2', src: `${CS_VIDEO}/robyn.mp4` },
  { key: 'slc-bus-tours', company: 'SLC Bus Tours', person: 'Andre Olinov', role: 'Co-founder', duration: '2:04', poster: '/images/case-studies-video/slc-bus-tours.jpg?v=2', src: `${CS_VIDEO}/slc-bus-tours.mp4` },
];

/**
 * Portrait testimonial card for the carousel. Shows the poster still and, after a short
 * hover, expands (scales up) while silently playing the muted clip as a preview; clicking
 * opens the full 16:9 modal with sound. `preload="none"` keeps videos off the wire until hover.
 */
function TestimonialCard({ item, index = 0, onOpen }) {
  const vidRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const expandTimer = useRef(null);

  const start = () => {
    setPreview(true);
    const v = vidRef.current;
    if (v) { try { v.currentTime = 0; const p = v.play(); if (p) p.catch(() => {}); } catch { /* ignore */ } }
    clearTimeout(expandTimer.current);
    expandTimer.current = setTimeout(() => setExpanded(true), 500); // expand after a beat
  };
  const stop = () => {
    clearTimeout(expandTimer.current);
    setExpanded(false);
    setPreview(false);
    const v = vidRef.current;
    if (v) { try { v.pause(); } catch { /* ignore */ } }
  };
  useEffect(() => () => clearTimeout(expandTimer.current), []);

  return (
    <motion.button
      data-card
      type="button"
      onClick={() => onOpen(item)}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      aria-label={`Play ${item.company} testimonial with ${item.person}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{ zIndex: expanded ? 20 : 1 }}
      className={`group relative aspect-[3/4] w-[62%] shrink-0 overflow-hidden rounded-2xl border bg-[#0f0f14] text-left transition-[transform,border-color,box-shadow] duration-500 ease-out sm:w-[36%] lg:w-[21%] ${
        expanded
          ? 'scale-[1.22] border-[#BF953F]/70 shadow-[0_30px_70px_-18px_rgba(191,149,63,.55)]'
          : 'border-white/10 shadow-[0_10px_30px_-14px_rgba(0,0,0,.7)]'
      }`}
    >
      <img
        src={item.poster}
        alt={`${item.company} — ${item.person}`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <video
        ref={vidRef}
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${preview ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* subtle top vignette + a STRONG bottom scrim so the name/role stay legible over any video */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/85 to-transparent" />

      {/* duration chip */}
      <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-full bg-black/65 px-2 py-0.5 font-mono text-[10px] tracking-wider text-white/85 backdrop-blur-sm">
        {item.duration}
      </span>

      {/* bottom overlay: small play button beside the name (carousel-reference composition) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-3.5">
        <span aria-hidden="true" className="relative flex h-9 w-9 shrink-0 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-lg bg-[#BF953F]/40 blur-md"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: (index % 3) * 0.5 }}
          />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#BF953F] text-[#0b0b0c] shadow-lg transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-bold tracking-tight text-white [text-shadow:0_1px_4px_rgba(0,0,0,.95)]">{item.company}</h3>
          <p className="truncate text-[11px] text-white/75 [text-shadow:0_1px_4px_rgba(0,0,0,.95)]">{item.role ? `${item.person} · ${item.role}` : item.person}</p>
        </div>
      </div>
    </motion.button>
  );
}

/**
 * Horizontal, snap-scrolling carousel for the testimonial cards. Native touch/trackpad
 * scroll on any device, plus gold prev/next arrows on desktop that page by one card.
 */
function VideoCarousel({ items, onOpen }) {
  const ref = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [update]);

  // Gentle continuous auto-scroll that ping-pongs at the ends and pauses on interaction.
  // Respects prefers-reduced-motion.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf;
    let dir = 1;
    let pos = el.scrollLeft; // float accumulator — browsers round stored scrollLeft, so
                             // tracking the true sub-pixel position keeps a slow drift moving
    const speed = 1.1; // px per frame (~66px/s)
    const step = () => {
      if (!pausedRef.current) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 4) {
          pos += dir * speed;
          if (pos >= max) { pos = max; dir = -1; }
          else if (pos <= 0) { pos = 0; dir = 1; }
          el.scrollLeft = pos;
        }
      } else {
        pos = el.scrollLeft; // resync after manual scroll / arrows so resume is seamless
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };
  const pauseBriefly = (ms = 2600) => {
    pausedRef.current = true;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { pausedRef.current = false; }, ms);
  };
  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const page = (dir) => {
    const el = ref.current;
    if (!el) return;
    pauseBriefly();
    const card = el.querySelector('[data-card]');
    const amount = card ? card.offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const Arrow = ({ dir, disabled }) => (
    <button
      type="button"
      onClick={() => page(dir)}
      disabled={disabled}
      aria-label={dir < 0 ? 'Previous testimonials' : 'Next testimonials'}
      className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#0f0f14]/80 text-white backdrop-blur transition-all duration-300 hover:border-[#BF953F]/70 hover:text-gold-shine disabled:pointer-events-none disabled:opacity-30 sm:flex"
    >
      {dir < 0 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );

  return (
    <div className="relative">
      {/* arrows, top-right (sit above the track) */}
      <div className="mb-2 flex justify-end gap-2">
        <Arrow dir={-1} disabled={atStart} />
        <Arrow dir={1} disabled={atEnd} />
      </div>

      <div
        className="relative"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        {/* py gives room for the hover-expand scale so it isn't clipped */}
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto px-1 py-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((v, i) => (
            <TestimonialCard key={v.key} item={v} index={i} onOpen={onOpen} />
          ))}
        </div>
        {/* edge fades hint that the row scrolls */}
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#080a0d] to-transparent transition-opacity duration-300 ${atStart ? 'opacity-0' : 'opacity-100'}`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#080a0d] to-transparent transition-opacity duration-300 ${atEnd ? 'opacity-0' : 'opacity-100'}`} />
      </div>
    </div>
  );
}

function VideoTestimonialModal({ item, onClose }) {
  if (!item) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f14]"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80">
            <X className="h-5 w-5" />
          </button>
          <div className="relative aspect-video bg-black">
            {item.youtube ? (
              <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${item.youtube}?autoplay=1&rel=0`} title={item.company} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
            ) : item.src ? (
              <video className="absolute inset-0 h-full w-full" src={item.src} poster={item.poster} controls autoPlay playsInline />
            ) : (
              <>
                <img src={item.poster} alt={item.company} className="absolute inset-0 h-full w-full object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-shine">Video coming soon</p>
                </div>
              </>
            )}
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold tracking-tight text-white">{item.company}</h3>
            <p className="text-sm text-white/55">{item.role ? `${item.person} · ${item.role}` : item.person}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
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

  const rest = caseStudies;

  const categories = useMemo(() => {
    const set = new Set(rest.map((c) => categoryOf(c.industry)));
    // Named categories alphabetically, but keep the catch-all "Other" pinned last.
    const named = [...set].filter((c) => c !== 'Other').sort();
    return ['All', ...named, ...(set.has('Other') ? ['Other'] : [])];
  }, [rest]);

  const [filter, setFilter] = useState('All');
  const filtered = useMemo(
    () => (filter === 'All' ? rest : rest.filter((c) => categoryOf(c.industry) === filter)),
    [filter, rest]
  );

  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
            className="h-full w-full object-cover opacity-[0.75] grayscale-[.3] contrast-105"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,10,13,.28) 0%, rgba(8,10,13,.62) 60%, #080a0d 100%)' }} />
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

      {/* ===== CLIENT VIDEO TESTIMONIALS ===== */}
      <section className="relative overflow-hidden bg-[#080a0d] py-[clamp(48px,8vw,96px)]">
        {/* Depth: subtle dot-grid + gold ambient glows (per the imagery guide).
            No top hairline here — the hero section already renders one directly above. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-4 h-96 w-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(191,149,63,.16) 0%, transparent 70%)' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(191,149,63,.10) 0%, transparent 70%)' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <Eyebrow>In Their Words</Eyebrow>
              <h2 className="mt-4 text-[clamp(26px,3.6vw,40px)] font-bold tracking-tight text-white">Client video testimonials</h2>
              <p className="mt-3 text-white/55">Hear directly from the business owners behind the results.</p>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">Swipe · Click to watch</p>
          </div>

          <VideoCarousel items={CASE_STUDY_VIDEOS} onOpen={setSelectedVideo} />
        </div>
      </section>

      <VideoTestimonialModal item={selectedVideo} onClose={() => setSelectedVideo(null)} />

      {/* ===== SUCCESS STORIES (HEALTHCARE) ===== */}
      <section className="bg-[#080a0d] py-[clamp(40px,7vw,80px)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Eyebrow>Featured</Eyebrow>
            <h2 className="mt-4 text-[clamp(26px,3.6vw,40px)] font-bold tracking-tight text-white">Success stories that speak volumes</h2>
            <p className="mt-3 max-w-2xl text-white/55">Real campaigns, real data, real growth across our healthcare clients.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {healthcareSuccessStories.map((story, i) => (
              <StoryCard key={story.title} story={story} index={i} onSelect={setSelectedStory} />
            ))}
          </div>
        </div>
      </section>

      <SuccessStoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />

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
          <h2 className="whitespace-nowrap text-[clamp(20px,4.4vw,48px)] font-bold tracking-tight text-[#fafafa]">
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
