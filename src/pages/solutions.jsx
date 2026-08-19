import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ServicesScrollingRows from '../components/shared/ServicesScrollingRows';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';
import FastVideo from '@/components/shared/FastVideo';
import YouTubeFacade from '@/components/shared/YouTubeFacade';
import { optimizeCloudinaryVideo, getVideoThumbnail } from '@/utils/cloudinary-optimizer';
import { optimizeSupabaseImage } from '@/utils/supabase-media-optimizer';
import { ArrowUpRight, Search, Crosshair, Cpu, Rocket, SlidersHorizontal } from 'lucide-react';

const HAND_IMG = optimizeSupabaseImage('https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/services/graphics/hand-robot_point_left.png', { width: 940, height: 309, quality: 78 });
const PAPER_BG = {
  backgroundColor: '#efece5',
  backgroundImage: `url(${optimizeSupabaseImage('https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/images/disruptors-media/ui/backgrounds/main-bg.jpg', { width: 1600, height: 1600, quality: 70 })})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

// Walkthrough video for the closing proof section. Poster is self-hosted (pulled from
// YouTube's maxresdefault) so the prerendered page doesn't depend on a third-party image.
const WALKTHROUGH = {
  videoId: 'WaF_4bUFT24',
  title: 'How I Grew 10K Followers in 90 Days (Full AI Workflow)',
  poster: '/images/solutions/ai-workflow-video.jpg?v=1',
};

// Five-step "Our Process" framework (ported from the billboard funnel).
const frameworkSteps = [
  { icon: Search, num: '01', title: 'Audit', desc: "We take an honest look at your business — what's working, what's leaking, and where the quick wins are." },
  { icon: Crosshair, num: '02', title: 'Analyze', desc: 'We study your top competitors and reverse-engineer what makes them dominate their market.' },
  { icon: Cpu, num: '03', title: 'Architect', desc: 'We design AI systems to fill your funnel gaps — lead generation, follow-up, content, and conversion.' },
  { icon: Rocket, num: '04', title: 'Execute', desc: 'We launch the systems and put them to work across every channel that moves the needle.' },
  { icon: SlidersHorizontal, num: '05', title: 'Optimize', desc: 'We continuously tune and improve using real performance data — not guesswork.' },
];

export default function Solutions() {
  usePageMeta({
    title: 'AI Marketing Solutions & Services | Disruptors Media',
    description:
      "Disruptors Media's AI-powered marketing solutions: SEO & GEO, AI automation, social, paid ads, lead generation, content, and fractional CMO.",
    path: '/solutions',
    jsonLd: [
      breadcrumb('Solutions', '/solutions'),
      {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: WALKTHROUGH.title,
        description:
          'A full walkthrough of the AI content workflow Disruptors Media builds for clients — the same system used to grow an audience to 10,000 followers in 90 days.',
        thumbnailUrl: `https://i.ytimg.com/vi/${WALKTHROUGH.videoId}/maxresdefault.jpg`,
        uploadDate: '2026-08-13T16:30:14-07:00',
        duration: 'PT13M12S',
        embedUrl: `https://www.youtube.com/embed/${WALKTHROUGH.videoId}`,
        contentUrl: `https://www.youtube.com/watch?v=${WALKTHROUGH.videoId}`,
        publisher: {
          '@type': 'Organization',
          name: 'Disruptors Media',
          url: 'https://disruptorsmedia.com',
        },
      },
    ],
  });

  // Wrist-hinge rotation for the background hand (desktop; harmless on touch).
  // Pivots from the image's right edge / vertical-center — where the forearm exits
  // frame — and tracks the cursor angle, so the hand hinges at the wrist instead
  // of sliding as a whole.
  const heroRef = useRef(null);
  const handRef = useRef(null);
  // Cached in screen coords, measured while unrotated: rotating around the
  // transform-origin doesn't move that point, but getBoundingClientRect() on an
  // already-rotated element returns the rotated shape's axis-aligned box, not the
  // original corner — so re-reading it every mousemove drifts the pivot estimate.
  const pivotRef = useRef(null);
  const rot = useMotionValue(0);
  const srot = useSpring(rot, { stiffness: 60, damping: 18, mass: 0.8 });

  useEffect(() => {
    const measurePivot = () => {
      const r = handRef.current?.getBoundingClientRect();
      if (!r) return;
      pivotRef.current = { x: r.right, y: r.top + r.height / 2 };
    };
    measurePivot();
    window.addEventListener('resize', measurePivot);
    return () => window.removeEventListener('resize', measurePivot);
  }, []);

  const handleHeroMouse = (e) => {
    const p = pivotRef.current;
    if (!p) return;
    const angle = Math.atan2(e.clientY - p.y, e.clientX - p.x) * (180 / Math.PI);
    let delta = angle - 180; // 0 == hand's drawn (resting) pose
    if (delta < -180) delta += 360; // normalize: resting pose sits on the atan2 +/-180 branch cut
    if (delta > 180) delta -= 360;
    rot.set(Math.max(-28, Math.min(28, delta)));
  };
  const resetHero = () => rot.set(0);

  return (
    <div className="bg-[#080a0d]">
      {/* Real page heading (kept out of view; the visual title lives in the hero) */}
      <h1 className="sr-only">AI Marketing Solutions &amp; Services | Disruptors Media</h1>

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouse}
        onMouseLeave={resetHero}
        className="relative flex min-h-[86vh] items-center overflow-hidden bg-[#080a0d]"
      >
        {/* Background hand — hinges at the wrist, follows the cursor */}
        <motion.img
          ref={handRef}
          src={HAND_IMG}
          alt=""
          aria-hidden="true"
          style={{ rotate: srot, y: '-50%', transformOrigin: '100% 50%' }}
          className="pointer-events-none absolute right-[-12%] top-1/2 w-[80vw] min-w-[440px] max-w-[940px] opacity-80 grayscale-0 md:opacity-95"
        />
        {/* Left-dark → right-transparent gradient for text legibility */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #080a0d 0%, rgba(8,10,13,.72) 44%, rgba(8,10,13,.1) 100%)' }} />
        {/* Fade the bottom edge into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#080a0d]" />
        {/* Gold ambient glow */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 top-1/3 h-80 w-80 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(191,149,63,.14) 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[#BF953F]/25 bg-[#BF953F]/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-gold-shine backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#BF953F]" /> Full-Funnel AI
            </span>
            <h2 className="mt-6 text-[clamp(40px,7vw,80px)] font-bold leading-[0.98] tracking-tight text-[#fafafa]">
              One partner for the <span className="text-gold-shine inline-block pr-[0.08em] -mr-[0.08em]" style={{ fontStyle: 'italic' }}>whole funnel</span>.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
              From first click to closed deal, we build the AI systems that run your marketing, sales, and operations — installed inside your business, and owned by you.
            </p>
            <div className="mt-9">
              <Link
                to={createPageUrl('book-strategy-session')}
                className="inline-flex rounded-[3px] bg-[#BF953F] px-7 py-3.5 text-center font-medium text-[#0b0b0c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#AA771C]"
              >
                Book a Strategy Session
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Horizontal Scrolling Carousel */}
      <section id="services" className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FastVideo
            src={optimizeCloudinaryVideo(
              '/site-videos/dmsite/home/gallery-bg.mp4',
              { width: 1920, quality: 'auto' }
            )}
            poster={getVideoThumbnail(
              '/site-videos/dmsite/home/gallery-bg.mp4',
              { width: 1920 }
            )}
            autoplay
            loop
            muted
            playsInline
            preload="metadata"
            lazy={true}
            preset="fullscreen"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/50"></div>
        {/* Top fade: blends the carousel video up into the hero's black (no harsh seam) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-40 bg-gradient-to-b from-[#080a0d] to-transparent"></div>
        <div className="relative z-10">
          <ServicesScrollingRows title="Choose Your Path to Growth" compact ctaDropdown />
        </div>
      </section>

      {/* What We Do Section — aligned with the service-page system (plaster + gold + Neue Montreal) */}
      <section className="py-16 text-[#0b0b0c] sm:py-24" style={PAPER_BG}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Introduction */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-28"
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#8a6a1f]">Our approach</span>
              <h2 className="mt-4 text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
                What we do
              </h2>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-black/70 sm:text-xl">
                Call us traditional, but we believe in the old-fashioned way of connection. And no, we don't mean Myspace. You can have a killer product or service, but that's not what sets you apart. It's how people feel after each interaction.
              </p>
              <a
                href="https://audit.disruptorsmedia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#BF953F] px-8 py-4 text-sm font-bold uppercase tracking-wide text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#AA771C]"
              >
                <span>Start Your Assessment</span>
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>

            {/* Right Column - Accordion */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="border-t border-black/15"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b border-black/15">
                  <AccordionTrigger className="group py-7 text-left hover:no-underline">
                    <div className="flex w-full items-start gap-5 pr-4">
                      <span className="mt-1 font-mono text-sm text-[#8a6a1f]">01</span>
                      <h3 className="text-2xl font-bold uppercase tracking-tight transition-colors group-hover:text-[#8a6a1f] sm:text-3xl">
                        Creative &amp; Strategy
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-7 pl-11 text-base leading-relaxed text-black/70 sm:text-lg">
                    We craft personalized, AI-driven strategies that bridge the gap between your goals and tangible results. We also captivate audiences with compelling content and design, fueled by the power of AI-assisted creativity.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-b border-black/15">
                  <AccordionTrigger className="group py-7 text-left hover:no-underline">
                    <div className="flex w-full items-start gap-5 pr-4">
                      <span className="mt-1 font-mono text-sm text-[#8a6a1f]">02</span>
                      <h3 className="text-2xl font-bold uppercase tracking-tight transition-colors group-hover:text-[#8a6a1f] sm:text-3xl">
                        Digital Marketing &amp; Presence
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-7 pl-11 text-base leading-relaxed text-black/70 sm:text-lg">
                    Elevate your digital presence with our comprehensive strategies. We ensure your brand stands out, driving traffic and enhancing visibility. <Link to="/contact" className="text-[#8a6a1f] underline underline-offset-4 hover:text-[#AA771C]">Contact us</Link> to disrupt your industry.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-b border-black/15">
                  <AccordionTrigger className="group py-7 text-left hover:no-underline">
                    <div className="flex w-full items-start gap-5 pr-4">
                      <span className="mt-1 font-mono text-sm text-[#8a6a1f]">03</span>
                      <h3 className="text-2xl font-bold uppercase tracking-tight transition-colors group-hover:text-[#8a6a1f] sm:text-3xl">
                        Optimization &amp; Analytics
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-7 pl-11 text-base leading-relaxed text-black/70 sm:text-lg">
                    Refine your strategy with our AI-powered tools and data insights for peak performance. We turn data into actionable intelligence. <Link to="/contact" className="text-[#8a6a1f] underline underline-offset-4 hover:text-[#AA771C]">Contact us</Link> to optimize your marketing efforts.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Process — five-step framework (ported from the billboard funnel) */}
      <section className="relative overflow-hidden bg-[#080a0d] py-20 sm:py-28">
        {/* Gold divider top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
        {/* Gold ambient glow */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(191,149,63,.12) 0%, transparent 70%)' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-gold-shine">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#BF953F]" /> Our Process
            </span>
            <h2 className="mt-5 text-[clamp(32px,5vw,56px)] font-bold tracking-tight text-[#fafafa]">
              Five steps to <span className="text-gold-shine">unstoppable growth</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/60">
              A proven framework that turns an honest self-assessment into installed, AI-powered systems you own.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {frameworkSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-4 flex justify-center">
                  <step.icon className="h-11 w-11 icon-gold-shine" />
                </div>
                <div className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-gold-shine">Step {step.num}</div>
                <h3 className="mt-1.5 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* See It Work — walkthrough video + closing CTA */}
      <section className="relative overflow-hidden bg-[#080a0d] py-20 sm:py-28">
        {/* Gold divider top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
        {/* Gold ambient glow */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(191,149,63,.12) 0%, transparent 70%)' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-gold-shine">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#BF953F]" /> Proof
            </span>
            <h2 className="mt-5 text-[clamp(32px,5vw,56px)] font-bold tracking-tight text-[#fafafa]">
              Watch the system <span className="text-gold-shine">actually run</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/60">
              Not a pitch — the full workflow, start to finish. Our founder Kyle Painter walks through the exact AI content system we install for clients, and the 90 days it took to grow an audience to 10,000 followers with it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl"
          >
            <YouTubeFacade
              videoId={WALKTHROUGH.videoId}
              poster={WALKTHROUGH.poster}
              title={WALKTHROUGH.title}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="mx-auto max-w-xl text-lg text-white/70">
              Want this running inside your business instead of your feed?
            </p>
            <Link
              to={createPageUrl('book-strategy-session')}
              className="mt-6 inline-flex rounded-[3px] bg-[#BF953F] px-7 py-3.5 text-center font-medium text-[#0b0b0c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#AA771C]"
            >
              Book a Strategy Session
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
