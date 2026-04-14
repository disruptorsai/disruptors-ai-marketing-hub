import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle, Search, Crosshair, Cpu, Rocket, SlidersHorizontal,
  Globe, Zap, TrendingUp, Eye, Shield, ArrowUpRight, Brain
} from 'lucide-react';
import FastVideo from '@/components/shared/FastVideo';

// ─── URLs ─────────────────────────────────────────────────────────────
const HERO_IMAGE = 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/render/image/public/site-assets/videos/v1/dmsite/services/crm-management.jpg?width=1920&quality=80&format=origin';
const HERO_IMAGE_MOBILE = 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/render/image/public/site-assets/videos/v1/dmsite/services/crm-management.jpg?width=768&quality=75&format=origin';
const MAIN_BG = 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/images/disruptors-media/ui/backgrounds/main-bg.jpg';
const FRESCO_BG = 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/ui/backgrounds/renaissance-fresco-pyramids.png';
const ADAPT_VIDEO = 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/billboard/adapt-or-die.mp4';
const ROMAN_VIDEO = 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/roman-army-painting.mp4';

// ─── Case Studies Data ────────────────────────────────────────────────
const caseStudies = [
  {
    title: 'Enterprise-Scale National Campaign',
    badge: 'Healthcare Enterprise',
    approach: 'Full-funnel AI-driven media buying across 40+ markets with real-time optimization and predictive bidding.',
    metrics: [
      { label: 'Ad Spend', value: '$24M' },
      { label: 'Revenue', value: '$300M' },
      { label: 'ROAS', value: '12.5X' },
      { label: 'Reach', value: 'National' },
    ],
  },
  {
    title: 'Wellness & Hormone Therapy Clinic',
    badge: 'Healthcare',
    approach: 'Hyper-targeted paid campaigns with AI-generated creative and landing page optimization for patient acquisition.',
    metrics: [
      { label: 'CTR', value: '5.8%' },
      { label: 'CPL', value: '$72' },
      { label: 'Conversion', value: '11%' },
      { label: 'ROI', value: '3.5X' },
    ],
  },
  {
    title: 'Telehealth Provider',
    badge: 'Healthcare Tech',
    approach: 'Multi-channel awareness campaigns combining programmatic display, social, and AI-optimized search.',
    metrics: [
      { label: 'Impressions/wk', value: '65K+' },
      { label: 'Leads/wk', value: '15-20' },
      { label: 'CPL', value: '$58' },
      { label: 'ROAS', value: '4X' },
    ],
  },
  {
    title: 'Aesthetic & Body Contouring Clinic',
    badge: 'Medical Aesthetics',
    approach: 'AI-powered social proof campaigns with before/after content automation and retargeting funnels.',
    metrics: [
      { label: 'CTR', value: '6.2%' },
      { label: 'Consults', value: '350+' },
      { label: 'Sales', value: '$210K+' },
      { label: 'ROAS', value: '3.3X' },
    ],
  },
  {
    title: 'Specialized Medical Services Practice',
    badge: 'Healthcare',
    approach: 'GEO-targeted SEO and AI content strategy dominating local search and AI answer engines.',
    metrics: [
      { label: 'Traffic', value: '+220%' },
      { label: 'Inquiries', value: '200+' },
      { label: 'CPL', value: '$81' },
      { label: 'ROAS', value: '3X' },
    ],
  },
  {
    title: 'Regional Multi-Location Clinic',
    badge: 'Healthcare',
    approach: 'Coordinated lead generation across 5 locations with centralized AI follow-up and booking automation.',
    metrics: [
      { label: 'CTR', value: '7.1%' },
      { label: 'Leads', value: '450+' },
      { label: 'Sales', value: '$180K+' },
      { label: 'ROAS', value: '4X' },
    ],
  },
];

// ─── Five-Step Framework Data ─────────────────────────────────────────
const frameworkSteps = [
  { icon: Search, num: '01', title: 'Audit', desc: 'Take an honest look at your business — what\'s working, what\'s bleeding money, and where the quick wins are.' },
  { icon: Crosshair, num: '02', title: 'Analyze', desc: 'Look at top competitors and reverse-engineer what makes them dominate their market.' },
  { icon: Cpu, num: '03', title: 'Architect', desc: 'Create AI systems to fill funnel gaps — lead generation, follow-up, content, and conversion.' },
  { icon: Rocket, num: '04', title: 'Execute', desc: 'Launch the system and put it to work across every channel that moves the needle.' },
  { icon: SlidersHorizontal, num: '05', title: 'Optimize', desc: 'Continuously tweak and improve using real performance data — not guesswork.' },
];

// ─── Parallax background style ───────────────────────────────────────
const parallaxStyle = {
  backgroundImage: `url(${MAIN_BG})`,
  backgroundAttachment: 'fixed',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

export default function Billboard() {
  // ─── Booking Form State ───────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: '', businessName: '', email: '', phone: '',
    website: '', monthlyRevenue: '', notes: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');

  useEffect(() => {
    if (bookingUrl) {
      const script = document.createElement('script');
      script.src = 'https://link.msgsndr.com/js/form_embed.js';
      script.type = 'text/javascript';
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }
  }, [bookingUrl]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/.netlify/functions/ghl-calendar-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'billboard_landing_page' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit booking request');
      }
      const data = await response.json();
      if (data.bookingUrl) setBookingUrl(data.bookingUrl);
      setIsSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black text-white">

      {/* ═══════════════════ SECTION 1 — HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            srcSet={`${HERO_IMAGE_MOBILE} 768w, ${HERO_IMAGE} 1920w`}
            sizes="100vw"
            alt=""
            fetchpriority="high"
            decoding="async"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
          {/* Gold dot pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #BF953F 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="w-2 h-2 bg-[#BF953F] rounded-full animate-pulse" />
            <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">You Saw The Billboard</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
          >
            If You're Reading This…
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10"
          >
            That Means You're <span className="text-gold-shine font-bold">HONEST</span> About Your Business' Strengths And Weaknesses. <span className="text-gold-shine font-bold">CONGRATULATIONS!</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to={createPageUrl('book-strategy-session')}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#BF953F] hover:bg-[#AA771C] text-black font-bold rounded-lg transition-colors text-lg"
            >
              Book a Strategy Session
            </Link>
            <a
              href="#case-studies"
              className="inline-flex items-center justify-center px-8 py-4 border border-[#BF953F]/40 hover:border-[#BF953F] text-[#BF953F] font-medium rounded-lg transition-colors text-lg"
            >
              See Our Results
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 2 — WHY MOST MARKETING FAILS ═══════════════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden" style={parallaxStyle}>
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Why Most Marketing{' '}
                <span className="text-gold-shine">Fails</span>
                {' '}Today
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#BF953F] to-[#FCF6BA] mb-6" />
              <p className="text-gray-300 text-lg leading-relaxed">
                It's not that businesses aren't trying. It's that they're competing
                against competitors who've deployed AI systems that work 24/7 for
                pennies — while they're burning the midnight oil trying to keep up.
                The gap is widening every single day.
              </p>
            </motion.div>

            {/* Right column — 4 problem cards */}
            <div className="space-y-4">
              {[
                { icon: Cpu, title: 'AI employees that never sleep', desc: 'Your competitors have AI systems working around the clock — generating leads, answering questions, and closing deals while you sleep.' },
                { icon: Globe, title: 'Dominating Google & AI search', desc: 'AI-powered search is replacing traditional SEO. If you\'re not optimized for AI answer engines, you\'re invisible.' },
                { icon: Zap, title: 'Instant lead response, 24/7', desc: 'Speed to lead matters. Companies using AI respond in seconds, not hours. Every minute you wait costs you deals.' },
                { icon: TrendingUp, title: '10× better margins through AI', desc: 'AI automation reduces marketing costs by 60-80% while increasing output 10x. Your competitors know this.' },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF953F]/20 hover:border-[#BF953F]/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <card.icon className="w-6 h-6 icon-gold-shine flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                      <p className="text-gray-400 text-sm">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3 — PHILOSOPHY ═══════════════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={FRESCO_BG} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/85" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Human Principles.{' '}
              <span className="text-gold-shine">AI Infrastructure.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-900/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-[#BF953F]/20"
          >
            <p className="text-gray-300 text-center text-lg mb-10 max-w-2xl mx-auto">
              We don't replace your team. We give them superpowers. Our systems
              handle the repetitive heavy lifting so your people can focus on
              what actually grows the business.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: Eye, title: 'Strategy First', desc: 'Every system starts with understanding your unique market, audience, and goals before we touch any technology.' },
                { icon: Brain, title: 'AI-Powered Execution', desc: 'We deploy intelligent systems that handle content, ads, follow-up, and reporting at machine speed.' },
                { icon: Shield, title: 'Full Transparency', desc: 'Live dashboards, real numbers, no hidden fees. You always know exactly what\'s happening and why.' },
              ].map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <pillar.icon className="w-10 h-10 icon-gold-shine mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-gray-400 text-sm">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 4 — VIDEO ═══════════════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden" style={parallaxStyle}>
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              See How{' '}
              <span className="text-gold-shine">AI Infrastructure</span>
              {' '}Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A quick overview of how we build systems that generate, nurture, and close.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-900/90 rounded-3xl overflow-hidden border border-[#BF953F]/20"
          >
            <FastVideo
              src={ADAPT_VIDEO}
              poster="/video-thumbnail-billboard.webp"
              preset="hero"
              autoplay={false}
              muted={false}
              loop={false}
              controls={true}
              playsInline={true}
              preload="metadata"
              lazy={true}
              className="w-full aspect-video"
            />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 5 — FIVE-STEP FRAMEWORK ═══════════════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0 z-0">
          <FastVideo
            src={ROMAN_VIDEO}
            preset="fullscreen"
            autoplay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            fetchpriority="low"
            lazy={true}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/95" />
        </div>

        {/* Gold divider top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#BF953F] to-transparent z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#BF953F] rounded-full animate-pulse" />
              <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Our Process</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Five Steps to{' '}
              <span className="text-gold-shine">Unstoppable Growth</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A proven framework that turns honest self-assessment into explosive results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
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
                  <step.icon className="w-12 h-12 icon-gold-shine" />
                </div>
                <div className="text-gold-shine text-sm font-bold uppercase mb-1">Step {step.num}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gold divider bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#BF953F] to-transparent z-10" />
      </section>

      {/* ═══════════════════ SECTION 6 — CASE STUDIES MARQUEE ═══════════════════ */}
      <section id="case-studies" className="relative py-20 sm:py-28 overflow-hidden" style={parallaxStyle}>
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-3">
              Results That{' '}
              <span className="text-gold-shine">Speak Volumes</span>
            </h2>
            <p className="text-gray-400 text-lg">Real campaigns. Real data. Real growth.</p>
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="relative z-10 overflow-hidden">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/70 to-transparent z-20 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/70 to-transparent z-20 pointer-events-none" />

          <div className="flex animate-billboard-marquee" style={{ width: 'max-content' }}>
            {[...caseStudies, ...caseStudies].map((study, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[380px] mx-3 bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF953F]/20"
              >
                {/* Industry badge */}
                <div className="inline-block bg-[#BF953F]/10 border border-[#BF953F]/30 px-3 py-1 rounded-full text-[#BF953F] text-xs font-bold mb-3">
                  {study.badge}
                </div>

                {/* Title with arrow */}
                <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-1.5">
                  {study.title}
                  <ArrowUpRight className="w-4 h-4 text-[#BF953F] flex-shrink-0" />
                </h3>

                {/* Approach */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{study.approach}</p>

                {/* 2x2 results grid */}
                <div className="grid grid-cols-2 gap-2">
                  {study.metrics.map((m) => (
                    <div key={m.label} className="bg-black/40 rounded-lg p-2.5 text-center">
                      <div className="text-[#BF953F] text-base font-bold">{m.value}</div>
                      <div className="text-gray-500 text-xs">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 7 — BOOKING FORM ═══════════════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden" style={parallaxStyle}>
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#BF953F] rounded-full animate-pulse" />
              <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Free Strategy Session</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Book Your Free Strategy Session
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Let's discuss how we can tailor an AI-powered growth strategy for your business.
              This 45-minute session will give you actionable insights whether we work together or not.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-900/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-[#BF953F]/20"
          >
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 icon-gold-shine mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Thank You!</h3>
                <p className="text-gray-400 mb-8">
                  Our team will reach out within 24 hours to schedule your strategy session.
                </p>

                {/* What's Next card */}
                <div className="bg-black/40 border border-[#BF953F]/20 rounded-2xl p-6 max-w-md mx-auto mb-8">
                  <h4 className="font-semibold text-white mb-3">What's Next?</h4>
                  <ul className="text-sm text-gray-400 space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#BF953F] flex-shrink-0" />
                      We'll email you within 24 hours
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#BF953F] flex-shrink-0" />
                      Schedule a 45-minute strategy call
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#BF953F] flex-shrink-0" />
                      Receive a custom growth roadmap
                    </li>
                  </ul>
                </div>

                {/* GHL Calendar */}
                {bookingUrl && (
                  <div className="mt-6">
                    <h4 className="text-center font-semibold text-white mb-4">
                      Select Your Preferred Time
                    </h4>
                    <div className="bg-white rounded-2xl overflow-hidden" style={{ minHeight: '700px' }}>
                      <iframe
                        src={bookingUrl}
                        style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
                        scrolling="no"
                        id="ghl-calendar-billboard"
                        title="Book Strategy Session Calendar"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Can't see the calendar?{' '}
                      <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-[#BF953F] hover:underline">
                        Click here to book in a new window
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="bb-fullName" className="text-gray-300 font-semibold">Full Name *</Label>
                    <Input
                      id="bb-fullName" type="text" required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="mt-2 bg-black/40 border-[#BF953F]/30 text-white placeholder-gray-500 focus:border-[#BF953F]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bb-businessName" className="text-gray-300 font-semibold">Business Name</Label>
                    <Input
                      id="bb-businessName" type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="mt-2 bg-black/40 border-[#BF953F]/30 text-white placeholder-gray-500 focus:border-[#BF953F]"
                      placeholder="Your Company, Inc."
                    />
                  </div>
                </div>

                {/* Row 2: Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="bb-email" className="text-gray-300 font-semibold">Email Address *</Label>
                    <Input
                      id="bb-email" type="email" required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-2 bg-black/40 border-[#BF953F]/30 text-white placeholder-gray-500 focus:border-[#BF953F]"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bb-phone" className="text-gray-300 font-semibold">Phone Number</Label>
                    <Input
                      id="bb-phone" type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-2 bg-black/40 border-[#BF953F]/30 text-white placeholder-gray-500 focus:border-[#BF953F]"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Row 3: Website & Revenue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="bb-website" className="text-gray-300 font-semibold">Business Website</Label>
                    <Input
                      id="bb-website" type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="mt-2 bg-black/40 border-[#BF953F]/30 text-white placeholder-gray-500 focus:border-[#BF953F]"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bb-revenue" className="text-gray-300 font-semibold">Monthly Revenue</Label>
                    <Select onValueChange={(value) => handleInputChange('monthlyRevenue', value)}>
                      <SelectTrigger className="mt-2 bg-black/40 border-[#BF953F]/30 text-white focus:border-[#BF953F]">
                        <SelectValue placeholder="Select revenue range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-10k">$0 - $10K</SelectItem>
                        <SelectItem value="10k-50k">$10K - $50K</SelectItem>
                        <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                        <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                        <SelectItem value="500k+">$500K+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 4: Challenge */}
                <div>
                  <Label htmlFor="bb-notes" className="text-gray-300 font-semibold">
                    Your Biggest Marketing Challenge
                  </Label>
                  <Textarea
                    id="bb-notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="mt-2 h-24 bg-black/40 border-[#BF953F]/30 text-white placeholder-gray-500 focus:border-[#BF953F]"
                    placeholder="What's your biggest struggle with lead generation, operations, or growth?"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-[#BF953F] hover:bg-[#AA771C] disabled:opacity-50 text-black font-bold rounded-lg transition-colors text-lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Book My Free Strategy Session'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you consent to us contacting you to schedule your session.
                  We respect your privacy and will never share your information.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
