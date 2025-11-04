import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AlternatingLayout from '../components/shared/AlternatingLayout';
import ClientLogoMarquee from '../components/shared/ClientLogoMarquee';
import GoogleReviewsSection from '../components/shared/GoogleReviewsSection';
import ServicesScrollingRows from '../components/shared/ServicesScrollingRows';
import FastVideo from '../components/shared/FastVideo';

export default function Home() {

  const alternatingData = [
    {
      kicker: "",
      headline: "More Than an Agency. Your Growth Partner.",
      body: "We help companies generate leads, streamline operations, and scale using AI-powered systems—all with complete transparency so you stay in control of your growth journey.",
      video: "https://ubqxflzuvxowigbjmqfb.supabase.co/storage/v1/object/public/site-videos/dmsite/home/handshake-landscape.mp4",
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
        <div className="absolute inset-0 z-0">
          <FastVideo
            src="https://ubqxflzuvxowigbjmqfb.supabase.co/storage/v1/object/public/site-videos/dmsite/home/website-demo-reel.mp4"
            preset="fullscreen"
            autoplay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="auto"
            fetchpriority="high"
            lazy={false}
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
              src="https://ubqxflzuvxowigbjmqfb.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png"
              alt="Disruptors AI"
              className="h-24 sm:h-32 lg:h-40 w-auto mx-auto mb-8 object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            <h1 className="font-sans text-4xl sm:text-6xl lg:text-8xl font-bold mb-6 tracking-tight">
              Digital Marketing
              <br />
              <span className="text-[#FFD700]">× AI Solutions</span>
            </h1>

            <p className="font-sans text-lg sm:text-xl text-[#C7C7C7] max-w-2xl mx-auto">
              We drive growth with expert digital marketing, then multiply results with AI for business
            </p>
          </motion.div>
        </div>
      </section>

      {/* Client Logos Marquee */}
      <div className="relative bg-gray-900 overflow-hidden">
        <ClientLogoMarquee />
      </div>

      {/* PARTNERSHIP Section */}
      <AlternatingLayout sections={alternatingData} />

      {/* Capabilities - What We Bring to the Table */}
      <section className="relative bg-black py-16 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <FastVideo
            src="https://ubqxflzuvxowigbjmqfb.supabase.co/storage/v1/object/public/site-videos/dmsite/home/roman-army-painting.mp4"
            preset="fullscreen"
            autoplay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            fetchpriority="low"
            lazy={true}
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
                <span className="text-yellow-500 text-sm font-bold tracking-wider uppercase">Our Capabilities</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              What We Bring to the Table
            </h2>
            <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 max-w-3xl mx-auto">
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
                  <p className="text-yellow-500 text-sm font-semibold tracking-wide uppercase">Multi-channel</p>
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
                  <p className="text-yellow-500 text-sm font-semibold tracking-wide uppercase">10x faster</p>
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
                  <p className="text-yellow-500 text-sm font-semibold tracking-wide uppercase">100+ pieces/day</p>
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
                      <svg className="w-10 h-10 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-yellow-500 text-sm font-semibold tracking-wide uppercase">Qualified leads</p>
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
                  <p className="text-yellow-500 text-sm font-semibold tracking-wide uppercase">Live data</p>
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
          <video
            src="https://ubqxflzuvxowigbjmqfb.supabase.co/storage/v1/object/public/site-videos/dmsite/home/gallery-bg.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/60"></div>
        <div className="relative z-10">
          <ServicesScrollingRows />
        </div>
      </section>

      {/* Google Reviews Section */}
      <GoogleReviewsSection />
    </div>
  );
}