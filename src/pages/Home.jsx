import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AlternatingLayout from '../components/shared/AlternatingLayout';
import ClientLogoMarquee from '../components/shared/ClientLogoMarquee';
import GoogleReviewsSection from '../components/shared/GoogleReviewsSection';
import ServicesScrollingRows from '../components/shared/ServicesScrollingRows';
import FastVideo from '../components/shared/FastVideo';
import FAQAccordion from '../components/shared/FAQAccordion';
import BillboardModal from '../components/shared/BillboardModal';
import { useBillboardPopup } from '@/hooks/useBillboardPopup';
import { usePageMeta } from '@/hooks/usePageMeta';
import { faqPageSchema } from '@/data/faqContent';

export default function Home() {
  const navigate = useNavigate();
  const { isOpen, isReturning, close, accept } = useBillboardPopup(1500);

  usePageMeta({
    title: 'Disruptors Media — AI Marketing & Fractional CAIO/CMO',
    description:
      'A fractional Chief AI Officer (CAIO) & CMO service that builds AI-powered marketing systems — content, SEO, lead gen, and follow-up — inside your business.',
    path: '/',
    jsonLd: [
      faqPageSchema(),
      {
        // Process steps, also surfaced visibly in the FAQ ("How does Disruptors Media work?").
        // Kept as HowTo structured data for GEO / AI step extraction.
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How Disruptors Media installs AI-powered marketing',
        description: 'A four-step process to install AI-powered marketing systems inside your business.',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Audit', text: 'We map your current marketing, systems, and data to find the highest-impact opportunities.' },
          { '@type': 'HowToStep', position: 2, name: 'Research Competitors', text: 'We analyze your market and competitors to define how you win on search, content, and conversion.' },
          { '@type': 'HowToStep', position: 3, name: 'Create AI Systems', text: 'We build and install AI-powered systems for content, SEO, lead generation, and follow-up — that you own.' },
          { '@type': 'HowToStep', position: 4, name: 'Track & Optimize', text: "We measure performance with live dashboards and continuously improve what's working." },
        ],
      },
    ],
  });

  const handleBillboardYes = () => {
    accept();
    navigate('/billboard');
  };

  const alternatingData = [
    {
      kicker: "",
      headline: "More Than an Agency. Your Growth Partner.",
      body: "We help companies generate leads, streamline operations, and scale using AI-powered systems—all with complete transparency so you stay in control of your growth journey.",
      video: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/web/home/handshake-landscape.mp4",
      imageAlt: "Growth Partnership Visualization",
      backgroundColor: "bg-transparent backdrop-blur-sm",
      textColor: "text-black",
      videoStyle: { transform: "scale(0.8)" },
      cta: {
        label: "Partner With Us",
        link: "book-strategy-session"
      }
    }
  ];

  return (
    <div className="text-gray-800">
      {/* Full-Screen Hero with Video Background */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center bg-[#0E0E0E] text-white">
        {/* Background Video */}
        {/* PERF TODO: website-demo-reel.mp4 is 7.4 MB (the mobile hero payload now that it plays
            on mobile). Re-encode to ~2-3 MB (H.264 CRF ~26 / two-pass, or add an H.265/AV1 source)
            for a faster mobile LCP. gallery-bg.mp4 (2.4 MB, ~uncompressed) is also worth a pass. */}
        <div className="absolute inset-0 z-0">
          <FastVideo
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/web/home/website-demo-reel.mp4"
            poster="/site-videos/dmsite/home/website-demo-reel-poster.webp"
            preset="fullscreen"
            autoplay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            fetchpriority="high"
            lazy={false}
            disableOnMobile={true}
            className="w-full h-full object-cover"
            aria-label="Disruptors AI hero background video"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Logo */}
            <motion.img
              src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png"
              alt="Disruptors AI"
              width="800"
              height="160"
              fetchpriority="high"
              decoding="async"
              className="h-24 sm:h-32 lg:h-40 w-auto mx-auto mb-8 object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            <h1 className="font-sans text-4xl sm:text-6xl lg:text-8xl font-bold mb-6 tracking-tight">
              {/* Canonical page subject for SEO/GEO + screen readers (visual styling preserved below) */}
              <span className="sr-only">Disruptors Media — AI-Powered Marketing &amp; Fractional CAIO/CMO</span>
              <span aria-hidden="true">
                Digital Marketing
                <br />
                <span className="text-gold-shine">× AI Solutions</span>
              </span>
            </h1>

            <p className="font-sans text-lg sm:text-xl text-[#C7C7C7] max-w-2xl mx-auto">
              Most businesses are stuck with outdated tactics and broken systems. We help you fix that by automating and improving your marketing with AI.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Client Logos Marquee */}
      <div className="relative bg-gray-900 overflow-hidden">
        <ClientLogoMarquee />
      </div>

      {/* Billboard Banner (below client logos) */}
      <Link to="/billboard" className="group relative block overflow-hidden bg-black">
        <div className="relative max-w-5xl mx-auto px-4 py-6 sm:py-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src="/billboard.webp"
              alt="Your marketing sucks billboard"
              width="800"
              height="225"
              loading="lazy"
              decoding="async"
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
          <div className="flex items-center gap-2 text-[#BF953F] group-hover:text-[#FCF6BA] transition-colors">
            <span className="hidden sm:inline text-sm font-semibold uppercase tracking-wide">View</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>

      {/* PARTNERSHIP Section */}
      <AlternatingLayout sections={alternatingData} />

      {/* Capabilities - What We Bring to the Table */}
      <section className="relative bg-black py-16 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <FastVideo
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/web/home/roman-army-painting.mp4"
            preset="fullscreen"
            autoplay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            fetchpriority="low"
            lazy={true}
            disableOnMobile={true}
            className="absolute inset-0 w-full h-full object-cover"
            aria-label="Capabilities background video"
          />
          {/* Black overlay with 90% opacity */}
          <div className="absolute inset-0 bg-black/90" />
        </div>

        {/* White accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent z-10" />

        {/* Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Our Capabilities</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              What We Bring to the Table
            </h2>
            <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gold-shine max-w-3xl mx-auto">
              AI Powered Marketing
            </p>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Expert Marketing Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-10 h-10 icon-gold-shine group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <p className="text-gold-shine text-sm font-semibold tracking-wide uppercase">Multi-channel</p>
                  <h3 className="text-white text-2xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                    Expert Marketing Services
                  </h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Proven strategies across SEO, social media, paid ads, and content to drive qualified traffic
                  </p>
                </div>
              </div>
            </motion.div>

            {/* AI Automation Expertise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-10 h-10 icon-gold-shine group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <p className="text-gold-shine text-sm font-semibold tracking-wide uppercase">10x faster</p>
                  <h3 className="text-white text-2xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                    AI Automation Expertise
                  </h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Deploy intelligent systems that work 24/7, processing tasks in milliseconds instead of hours
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Content at Scale */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-10 h-10 icon-gold-shine group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gold-shine text-sm font-semibold tracking-wide uppercase">100+ pieces/day</p>
                  <h3 className="text-white text-2xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                    Content at Scale
                  </h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    AI generates high-quality marketing content that converts, from ads to blog posts
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Lead Generation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-10 h-10 icon-gold-shine group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gold-shine text-sm font-semibold tracking-wide uppercase">Qualified leads</p>
                  <h3 className="text-white text-2xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                    Lead Generation
                  </h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Systematic approach to filling your pipeline with qualified prospects ready to buy
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Live Performance Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-10 h-10 icon-gold-shine group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gold-shine text-sm font-semibold tracking-wide uppercase">Live data</p>
                  <h3 className="text-white text-2xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                    Live Performance Tracking
                  </h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Real-time dashboards showing exactly what's working and what needs adjustment
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom yellow accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
      </section>

      {/* Services / Solutions */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FastVideo
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/web/home/gallery-bg.mp4"
            preset="fullscreen"
            autoplay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            fetchpriority="low"
            lazy={true}
            disableOnMobile={true}
            className="w-full h-full object-cover"
            aria-label="Services section background"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/60"></div>
        <div className="relative z-10">
          <ServicesScrollingRows />
        </div>
      </section>

      {/* Google Reviews Section */}
      <GoogleReviewsSection />

      {/* Frequently Asked Questions (GEO: FAQ + FAQPage schema in index.html) */}
      <section aria-labelledby="home-faq-heading" className="bg-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="home-faq-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <FAQAccordion />
          <div className="mt-10 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              See all FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* Billboard Popup Modal */}
      <BillboardModal isOpen={isOpen} onClose={close} onYes={handleBillboardYes} isReturning={isReturning} />
    </div>
  );
}