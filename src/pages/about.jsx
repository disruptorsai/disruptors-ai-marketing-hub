import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ArrowUpRight } from 'lucide-react';
import { TeamMember } from '@/api/entities';
import FastVideo from '@/components/shared/FastVideo';
import AlternatingLayout from '../components/shared/AlternatingLayout';
import { optimizeSupabaseImage } from '@/utils/supabase-media-optimizer';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';
import { createPageUrl } from '@/utils';

// Local fallback roster — used only when the Supabase team_members fetch fails or is
// empty (e.g. no DB configured for local dev). Mirrors the production seed data
// (scripts/supabase-migration/CREATE_TEAM_MEMBERS.sql) plus the two new hires; update
// the real team_members table for production changes, this is just a dev/testing net.
const FALLBACK_TEAM = [
  {
    id: 'fallback-josh',
    name: 'Josh Patel',
    title: 'Chief Executive Officer',
    bio: "After years of consulting billion-dollar companies on customer acquisition and high-level operations, he grew frustrated with marketing agencies that couldn't bring his vision to life. Instead of hiring outside teams for every project, Josh built his own elite group of marketing experts to power all his current and future ventures.",
    headshot: '/images/team/josh-patel.jpg',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'fallback-kyle',
    name: 'Kyle Painter',
    title: 'Chief Communications Officer',
    bio: 'Kyle Painter is the Head of Communications at Disruptors Media, with extensive leadership experience guiding sales teams across the U.S. He has personally sold over $450,000 in revenue within nine months and trained teams that generated more than $1.5 million in just six months. With expertise in revenue strategy and AI-driven automation, Kyle designs and deploys AI employees that streamline every stage of the marketing and sales process.',
    headshot: '/images/team/kyle.jpg',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'fallback-tyler',
    name: 'Tyler Gordon',
    title: 'Chief Marketing Officer',
    bio: 'A high-performing marketer with proven experience driving large-scale growth, including his work at TikTok. He specializes in cold outbound lead generation, managing 350k+ emails per week and overseeing hundreds of social media messaging automations. With expertise in social media growth and paid advertising, he has scaled pages to hundreds of thousands of followers and deployed significant ad spend across major social and search platforms.',
    headshot: '/images/team/tyler.jpg',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'fallback-camilo',
    name: 'Camilo Montejo',
    title: 'Client Strategist',
    // TODO: replace with real bio copy before this goes live.
    bio: 'Camilo works directly with clients to translate their goals into clear, actionable strategy — keeping every engagement focused on the results that matter.',
    headshot: '/images/team/camilo-montejo.jpg',
    is_active: true,
    display_order: 4,
  },
  {
    id: 'fallback-kimball',
    name: 'Kimball Mueller',
    title: 'Partner',
    // TODO: replace with real bio copy before this goes live.
    bio: 'Kimball helps guide the overall direction of Disruptors Media, bringing a partner-level perspective to how the team serves and grows with its clients.',
    headshot: '/images/team/kimball-mueller.jpg',
    is_active: true,
    display_order: 5,
  },
];

const TeamMemberCard = ({ member, delay, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer group"
    onClick={() => onSelect(member)}
  >
    <div className="aspect-square w-full overflow-hidden bg-gray-100">
      <img
        src={optimizeSupabaseImage(member.headshot, { width: 500, height: 500, quality: 74 })}
        alt={member.name}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
      <p className="text-purple-600 font-medium">{member.title}</p>
      {member.bio && (
        <p className="text-gray-400 text-xs mt-2">Tap to read more</p>
      )}
    </div>
  </motion.div>
);

const TeamMemberModal = ({ member, onClose }) => {
  if (!member) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img
              src={optimizeSupabaseImage(member.headshot, { width: 700, height: 700, quality: 76 })}
              alt={member.name}
              className="w-full aspect-[3/2] object-cover object-top"
            />
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
            <p className="text-purple-600 font-medium mb-4">{member.title}</p>
            {member.bio && (
              <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default function About() {
  usePageMeta({
    title: 'About Disruptors Media — Fractional CAIO & CMO Team',
    description:
      'Meet Disruptors Media — a fractional Chief AI Officer (CAIO) and CMO service that installs AI-powered marketing systems inside your business.',
    path: '/about',
    jsonLd: [
      breadcrumb('About', '/about'),
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Tyler Welsh',
        jobTitle: 'Founder',
        worksFor: { '@type': 'Organization', name: 'Disruptors Media', url: 'https://disruptorsmedia.com' },
        url: 'https://disruptorsmedia.com/about',
      },
    ],
  });

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  const partnershipData = [
    {
      headline: "Based in Utah. Serving Brands Nationwide.",
      body: "We work with brands in Utah and across the globe. We also host live and digital events that bring leaders together.",
      image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/about/utah-digital-globe.png",
      imageAlt: "Partnership and collaboration visualization",
      backgroundColor: "bg-transparent backdrop-blur-sm",
      textColor: "text-black",
      cta: {
        label: "Live Events",
        link: "event-checkin",
        variant: "solid"
      }
    }
  ];

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        // Fetch team members sorted by display_order
        const members = await TeamMember.list('display_order');
        // Filter only active members
        const activeMembers = members.filter(member => member.is_active && member.name !== 'William Welsh');
        setTeam(activeMembers.length > 0 ? activeMembers : FALLBACK_TEAM);
      } catch (error) {
        console.error('Error fetching team members, using local fallback roster:', error);
        setTeam(FALLBACK_TEAM);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div>
      {/* Real page heading (kept for SEO/GEO; the visual hero headline is below) */}
      <h1 className="sr-only">About Disruptors Media — Fractional CAIO &amp; CMO Team</h1>

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden bg-[#080a0d] pt-[clamp(96px,16vw,150px)] pb-[clamp(48px,8vw,80px)]">
        {/* Hero background video */}
        <div aria-hidden="true" className="absolute inset-0 z-0">
          <FastVideo
            src="/site-videos/dmsite/home/gallery-bg.mp4"
            preset="fullscreen"
            autoplay loop muted playsInline
            preload="metadata"
            lazy={false}
            className="h-full w-full scale-110 object-cover opacity-[0.9] grayscale-[.3] contrast-105"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,10,13,.1) 0%, rgba(8,10,13,.42) 60%, #080a0d 100%)' }} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 top-10 z-[1] h-80 w-80 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(191,149,63,.14) 0%, transparent 70%)' }} />
        <div className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl text-left">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#BF953F]">Who We Are</span>
            <h2 className="mt-6 text-5xl font-bold leading-[0.98] tracking-tight text-[#fafafa] sm:text-7xl lg:text-8xl">
              About <span className="text-gold-shine inline-block pr-[0.08em] -mr-[0.08em]">Us</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65 sm:text-xl">
              A fractional Chief AI Officer and CMO team, building AI-powered marketing systems for real businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Statement */}
      <section className="relative bg-[#080a0d] py-16 sm:py-20 lg:py-24">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#BF953F]">Our Philosophy</span>
            <h2 className="mt-6 text-[clamp(26px,3.6vw,42px)] font-bold leading-tight tracking-tight text-[#fafafa]">
              We're Not Here to Replace You with AI. We're Here to Empower You With It.
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-white/65 sm:text-xl">
              Disruptors Media is a team of strategists, creatives, and technologists helping business owners embrace the future without losing their human touch. We're not just another marketing agency. We're a Fractional CMO and AI Infrastructure team built for business owners who want clarity, not complexity.
            </p>
            <Link
              to={createPageUrl('book-strategy-session')}
              className="mt-8 inline-flex items-center gap-1.5 font-medium text-gold-shine transition-all duration-300 hover:gap-2.5"
            >
              Get Started Today <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Meet the Team — sits below the Philosophy section */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{
          backgroundImage: `url(${optimizeSupabaseImage('https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/images/disruptors-media/ui/backgrounds/main-bg.jpg', { width: 1600, height: 1600, quality: 70 })})`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Edge fades: eased, multi-stop gradients so the plaster emerges gradually. The long
            low-alpha tail (…0.3 → 0.08 → 0) removes the slope change that a plain linear
            from-#080a0d fade leaves visible where it meets the bright plaster. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 sm:h-36" style={{ background: 'linear-gradient(to bottom, #080a0d 0%, rgba(8,10,13,0.7) 34%, rgba(8,10,13,0.3) 60%, rgba(8,10,13,0.08) 82%, rgba(8,10,13,0) 100%)' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 sm:h-36" style={{ background: 'linear-gradient(to top, #080a0d 0%, rgba(8,10,13,0.7) 34%, rgba(8,10,13,0.3) 60%, rgba(8,10,13,0.08) 82%, rgba(8,10,13,0) 100%)' }} />

        {/* Header with rounded card */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl py-10 px-8 text-center shadow-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Meet the Disruptors</h2>
              <p className="text-lg text-gray-600">The disruptive personalities behind the creative genius of Disruptors Media.</p>
            </motion.div>
          </div>
        </div>

        {/* Team Cards Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md mx-auto">
              <p className="text-gray-600">Loading team members...</p>
            </div>
          ) : team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
              {[...team]
                .sort((a, b) => {
                  // Sort by display_order if available, otherwise by name hierarchy
                  if (a.display_order !== undefined && b.display_order !== undefined) {
                    return a.display_order - b.display_order;
                  }
                  if (a.name.toLowerCase().includes('josh')) return -1;
                  if (b.name.toLowerCase().includes('josh')) return 1;
                  if (a.name.toLowerCase().includes('tyler')) return -1;
                  if (b.name.toLowerCase().includes('tyler')) return 1;
                  if (a.name.toLowerCase().includes('kyle')) return -1;
                  if (b.name.toLowerCase().includes('kyle')) return 1;
                  return 0;
                })
                .map((member, index) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    delay={index * 0.1}
                    onSelect={setSelectedMember}
                  />
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md mx-auto">
              <p className="text-gray-600">No team members available at this time.</p>
            </div>
          )}
        </div>
      </section>

      {/* Capabilities - What We Bring to the Table */}
      <section className="relative bg-black py-16 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <FastVideo
            src="/site-videos/dmsite/home/roman-army-painting.mp4"
            preset="fullscreen"
            autoplay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            fetchpriority="low"
            lazy={true}
            className="absolute inset-0 w-full h-full object-cover"
            aria-label="Capabilities section background"
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
                      <svg className="w-10 h-10 text-white group-hover:text-yellow-500 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
                      <svg className="w-10 h-10 text-white group-hover:text-yellow-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
                      <svg className="w-10 h-10 text-white group-hover:text-yellow-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
                      <svg className="w-10 h-10 text-gold-shine group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
                      <svg className="w-10 h-10 text-white group-hover:text-yellow-500 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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

      {/* Mission & Vision Grid */}
      <section className="relative bg-[#080a0d] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-16 gap-y-14 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#BF953F]">What We Stand For</span>
              <p className="mt-4 text-2xl font-bold leading-tight tracking-tight text-[#fafafa] sm:text-3xl">
                We believe the systems we build for you should belong to you — not live locked inside an agency's black box.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#BF953F]">The Impact</span>
              <h3 className="mt-4 text-xl font-bold text-[#fafafa] sm:text-2xl">We're Making a Real Difference</h3>
              <p className="mt-4 leading-relaxed text-white/60">
                From lead generation to content at scale, our AI systems take the busywork off your plate so you can spend your time on what only you can do — leading your company.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#BF953F]">Our Mission</span>
              <h3 className="mt-4 text-xl font-bold text-[#fafafa] sm:text-2xl">
                A Fractional CMO and AI team, without the enterprise price tag.
              </h3>
              <p className="mt-4 leading-relaxed text-white/60">
                We install real marketing infrastructure — strategy, automation, and content — inside your business, built to outlast any single hire.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#BF953F]">Our Vision</span>
              <h3 className="mt-4 text-xl font-bold text-[#fafafa] sm:text-2xl">
                A future where every business runs on systems, not guesswork.
              </h3>
              <p className="mt-4 leading-relaxed text-white/60">
                We're building toward a world where AI handles the repetitive work of marketing, freeing business owners to spend their time on strategy, relationships, and growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <AlternatingLayout sections={partnershipData} />

      {/* Team Member Modal */}
      {selectedMember && (
        <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}