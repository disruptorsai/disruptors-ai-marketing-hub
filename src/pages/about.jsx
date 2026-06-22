import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { TeamMember } from '@/api/entities';
import FastVideo from '@/components/shared/FastVideo';
import AlternatingLayout from '../components/shared/AlternatingLayout';
import PageTitle from '../components/shared/PageTitle';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';

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
        src={member.headshot}
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
              src={member.headshot}
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

  const aboutIntroData = [
    {
      headline: "We're Not Here to Replace You with AI. We're Here to Empower You With It.",
      body: "Disruptors Media is a team of strategists, creatives, and technologists helping business owners embrace the future without losing their human touch. We're not just another marketing agency. We're a Fractional CMO and AI Infrastructure team built for business owners who want clarity, not complexity.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1760122863/social_u4455988764_wide_landscape_scene_in_an_ancient_GreekRoman_for_d1743cde-0bcd-4c10-8d24-bbd35b21bed2_0_krsrsm.mp4",
      imageAlt: "AI empowerment visualization",
      backgroundColor: "bg-transparent backdrop-blur-md",
      textColor: "text-black",
      cta: {
        label: "Get Started Today",
        link: "book-strategy-session"
      }
    }
  ];

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
        setTeam(activeMembers);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div>
      {/* Page Title */}
      <PageTitle title="ABOUT US" />

      {/* What is Disruptors Media? — self-contained answer block for AI citation (GEO) */}
      <section aria-labelledby="what-is-disruptors-media" className="bg-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="what-is-disruptors-media" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            What is Disruptors Media?
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Disruptors Media is a fractional Chief AI Officer (CAIO) and Chief Marketing Officer service. We build AI-powered marketing and sales systems — content, SEO, lead generation, and follow-up — directly inside your business, so you own everything we install. It's the output of a full agency without the bloated retainer or the dependency.
          </p>
        </div>
      </section>

      {/* Hero Video Section */}
      {/* <section className="w-full bg-transparent overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full overflow-hidden"
        >
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <video
              className="absolute top-0 left-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
              poster="https://res.cloudinary.com/dvcvxhzmt/video/upload/so_0/v1758170556/dm-abt_ypkipj.jpg"
            >
              <source src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758170556/dm-abt_ypkipj.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div> */}
        {/* Golden section divider */}
        {/* <div className="w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent" />
      </section> */}

      {/* Enhanced Intro Section */}
      <AlternatingLayout sections={aboutIntroData} />

      {/* Capabilities - What We Bring to the Table */}
      <section className="relative bg-black py-16 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <FastVideo
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/roman-army-painting.mp4"
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

      {/* Section 3: Meet the Team */}
      <section
        className="relative py-16"
        style={{
          backgroundImage: 'url(https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/images/disruptors-media/ui/backgrounds/main-bg.jpg)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >

        {/* Header with rounded card */}
        <div className="relative max-w-3xl mx-auto px-4 mb-12">
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
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md mx-auto">
              <p className="text-gray-600">Loading team members...</p>
            </div>
          ) : team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Partnership Section */}
      <AlternatingLayout sections={partnershipData} />

      {/* Team Member Modal */}
      {selectedMember && (
        <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}