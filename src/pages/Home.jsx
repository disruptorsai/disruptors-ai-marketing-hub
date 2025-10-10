import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AlternatingLayout from '../components/shared/AlternatingLayout';
import ClientLogoMarquee from '../components/shared/ClientLogoMarquee';
import GoogleReviewsSection from '../components/shared/GoogleReviewsSection';
import ServicesScrollingRows from '../components/shared/ServicesScrollingRows';

export default function Home() {
  // Horizontal scroll capabilities section
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Drag to scroll functionality
  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    const handleMouseDown = (e) => {
      setIsDragging(true);
      setStartX(e.pageX - slider.offsetLeft);
      setScrollLeft(slider.scrollLeft);
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  const alternatingData = [
    {
      kicker: "",
      headline: "More Than an Agency. Your Growth Partner.",
      body: "We help companies generate leads, streamline operations, and scale using AI-powered systems—all with complete transparency so you stay in control of your growth journey.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1760046691/dmsite/home/handshake-landscape.mp4",
      imageAlt: "Growth Partnership Visualization",
      backgroundColor: "bg-transparent backdrop-blur-sm",
      textColor: "text-black",
      videoStyle: { transform: "scale(0.8)" }
    }
  ];

  return (
    <div className="text-gray-800">
      {/* Full-Screen Hero with Video Background */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center bg-[#0E0E0E] text-white">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758645813/Website_Demo_Reel_edited_udorcp.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
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
              src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png"
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
        {/* Gold divider top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent z-10" />

        <ClientLogoMarquee />

        {/* Gold divider bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent z-10" />
      </div>

      {/* PARTNERSHIP Section */}
      <AlternatingLayout sections={alternatingData} />

      {/* Capabilities Horizontal Scroller - What We Bring to the Table */}
      <section className="relative bg-black py-12 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759269831/social_u4455988764_a_michealangelo_painting_of_the_roman_army_in_a_w_c2966bc6-6ae4-4a6c-a3a0-10417b7e23ee_0_vnc9jx.mp4" type="video/mp4" />
          </video>
          {/* Black overlay with 85% opacity */}
          <div className="absolute inset-0 bg-black/85" />
        </div>

        {/* Yellow accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent z-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
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

        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pb-4 select-none"
          >
            <div className="flex gap-12 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content' }}>
              {/* Expert Digital Marketing */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-yellow-500 transition-colors duration-300">Multi-channel</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Expert Digital Marketing
                      </h3>
                      <p className="text-white text-base leading-relaxed">
                        Proven strategies across SEO, social media, paid ads, and content to drive qualified traffic
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI Automation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-yellow-500 transition-colors duration-300">10x faster</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        AI Automation
                      </h3>
                      <p className="text-white text-base leading-relaxed">
                        Deploy intelligent systems that work 24/7, processing tasks in milliseconds instead of hours
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Marketing - Conversion Optimization */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-yellow-500 transition-colors duration-300">300% ROI</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Conversion Optimization
                      </h3>
                      <p className="text-white text-base leading-relaxed">
                        Data-driven campaigns designed to turn visitors into customers and maximize ROI
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI - Predictive Analytics */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-yellow-500 transition-colors duration-300">Smart insights</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Predictive Analytics
                      </h3>
                      <p className="text-white text-base leading-relaxed">
                        AI-powered insights that predict customer behavior and optimize your marketing spend
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Marketing - Performance Tracking */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-yellow-500 transition-colors duration-300">Live data</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Performance Tracking
                      </h3>
                      <p className="text-white text-base leading-relaxed">
                        Real-time dashboards showing exactly what's working and what needs adjustment
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI - Content at Scale */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-yellow-500 transition-colors duration-300">100+ pieces/day</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Content at Scale
                      </h3>
                      <p className="text-white text-base leading-relaxed">
                        AI generates high-quality marketing content that converts, from ads to blog posts
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Marketing - Lead Generation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-yellow-500 transition-colors duration-300">Qualified leads</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Lead Generation
                      </h3>
                      <p className="text-white text-base leading-relaxed">
                        Systematic approach to filling your pipeline with qualified prospects ready to buy
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI - Marketing Automation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.7 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-yellow-500 transition-colors duration-300">20+ hrs saved</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Marketing Automation
                      </h3>
                      <p className="text-white text-base leading-relaxed">
                        AI handles repetitive tasks, freeing your team to focus on strategy and relationships
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom yellow accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
      </section>

      {/* Free Marketing Consultation CTA */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6">
              Ready to Accelerate Your Growth?
            </h2>
            <p className="font-sans text-lg sm:text-xl text-black mb-10 max-w-2xl mx-auto">
              Get a free, comprehensive marketing consultation and discover untapped opportunities in your business.
            </p>
            <Link
              to={createPageUrl('marketing-audit')}
              className="font-sans group relative inline-flex items-center justify-center h-16 px-10 xl:px-12 text-lg font-bold text-[#FFD700] uppercase bg-black hover:bg-gray-900 border-2 border-[#FFD700] hover:bg-[#FFD700]/10 touch-manipulation transition-all duration-300"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                animation: 'goldPulse 3s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
              }}
            >
              <span>Free Marketing Consultation</span>
              <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services / Solutions */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758170550/gallery-bg_e0bwdz.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/50"></div>
        <div className="relative z-10">
          <ServicesScrollingRows />
        </div>
      </section>

      {/* Google Reviews Section */}
      <GoogleReviewsSection />
    </div>
  );
}