import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Play, Mic, Headphones, Video, ArrowRight, Radio, Users, Sparkles } from 'lucide-react';
import PageTitle from '../components/shared/PageTitle';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const studioImages = [
  "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712352/disruptors-media/content/studio/gl3a0022.jpg",
  "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712357/disruptors-media/content/studio/gl3a0026.jpg",
  "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712362/disruptors-media/content/studio/gl3a0030.jpg",
  "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712366/disruptors-media/content/studio/gl3a0042.jpg"
];

export default function Podcast() {
  const [activeImage, setActiveImage] = useState(0);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef(null);

  // Auto-scroll animation
  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    let scrollPosition = slider.scrollLeft || 0;
    const scrollSpeed = 0.3; // pixels per frame (slow scroll)

    const animate = () => {
      if (!isPaused && !isDragging) {
        scrollPosition += scrollSpeed;
        slider.scrollLeft = scrollPosition;

        // Loop back to start when reaching the end
        if (scrollPosition >= slider.scrollWidth - slider.clientWidth) {
          scrollPosition = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, isDragging]);

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
      const walk = (x - startX) * 2;
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

  return (
    <div className="text-white">
      {/* Page Title */}
      <PageTitle title="PODCAST PRODUCTION" />

      {/* Full-Screen Hero with Full-Width Image */}
      <section className="relative h-screen overflow-hidden flex items-center bg-[#0E0E0E]">
        {/* Full-Width Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/content/podcast/podcast-new-lg.jpg"
            alt="Podcast Studio"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay - Dark to transparent from left */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>

        {/* Hero Content - Positioned on Left Side */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-4">
                <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Broadcast Quality</span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight text-white">
                Build Authority
                <br />
                <span className="text-gold-shine">With Audio.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-200 mb-8 leading-relaxed">
                From concept to distribution, we create professional podcast content that positions you as an industry leader and drives real business growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={createPageUrl('book-strategy-session')}
                  className="group relative inline-flex items-center justify-center h-16 px-10 text-lg font-bold text-gold-shine uppercase bg-transparent border-2 border-[#BF953F] hover:bg-[#BF953F]/10 transition-all duration-300"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                    boxShadow: '0 0 20px rgba(191, 149, 63, 0.4)'
                  }}
                >
                  <span>Start Your Podcast</span>
                  <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
                </Link>
                <Button variant="outline" size="lg" className="border-white/60 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm h-16 px-8 text-lg">
                  View Our Work
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Production Services Horizontal Scroller */}
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
            <source src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1760046521/dmsite/services/podcasting.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/80" />
        </div>

        {/* White accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent z-10" />

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
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Full Production Service</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Podcast Like a Pro From Day One
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Studio-Ready Audio, Cinematic Video, Worldwide Distribution — All Included.
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
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex gap-12 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content' }}>
              {/* Multi-Camera Production */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <Video className="w-12 h-12 icon-gold-shine group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent" />
                      <span className="text-gold-shine text-xs font-bold tracking-[0.2em] uppercase">Production</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-yellow-500/70 text-sm font-semibold tracking-wide uppercase">Professional</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Multi-Camera Setup
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed">
                        Dynamic angles with seamless switching for engaging visual storytelling that keeps viewers watching
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Crystal Clear Audio */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <Headphones className="w-12 h-12 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
                      <span className="text-white/70 text-xs font-bold tracking-[0.2em] uppercase">Audio</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gold-shine text-sm font-semibold tracking-wide uppercase">Broadcast Quality</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Crystal Clear Audio
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed">
                        Professional microphones and acoustic treatment for pristine sound that rivals major podcasts
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Post-Production */}
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
                        <Sparkles className="w-12 h-12 icon-gold-shine group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent" />
                      <span className="text-gold-shine text-xs font-bold tracking-[0.2em] uppercase">Editing</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-yellow-500/70 text-sm font-semibold tracking-wide uppercase">Fast Turnaround</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Full Post-Production
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed">
                        Professional editing, color grading, sound mixing, and graphics to make every episode shine
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Distribution */}
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
                        <Radio className="w-12 h-12 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
                      <span className="text-white/70 text-xs font-bold tracking-[0.2em] uppercase">Distribution</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gold-shine text-sm font-semibold tracking-wide uppercase">All Platforms</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Multi-Platform Publishing
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed">
                        Apple Podcasts, Spotify, YouTube, and all major platforms with optimized metadata and artwork
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Guest Management */}
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
                        <Users className="w-12 h-12 icon-gold-shine group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent" />
                      <span className="text-gold-shine text-xs font-bold tracking-[0.2em] uppercase">Guests</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-yellow-500/70 text-sm font-semibold tracking-wide uppercase">Done for you</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Guest Outreach & Booking
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed">
                        Research, outreach, and scheduling with ideal guests who attract your target audience
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Content Repurposing */}
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
                        <Play className="w-12 h-12 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
                      <span className="text-white/70 text-xs font-bold tracking-[0.2em] uppercase">Content</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gold-shine text-sm font-semibold tracking-wide uppercase">Maximum ROI</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        Content Repurposing
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed">
                        Turn episodes into blog posts, social clips, audiograms, and graphics that multiply your reach
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom yellow accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent" />
      </section>

      {/* Studio Showcase with Glassmorphic Cards */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Our Studio</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              State-of-the-Art Podcast Studio
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional equipment, cinematic lighting, and acoustic perfection for broadcast-quality content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image Gallery */}
            <div className="relative lg:col-span-2">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl"
                style={{ minHeight: '800px' }}
              >
                <img
                  src={studioImages[activeImage]}
                  alt="Studio Setup"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <div className="grid grid-cols-4 gap-8 mt-12 max-w-6xl mx-auto">
                {studioImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-video rounded-2xl overflow-hidden border-4 transition-all ${
                      activeImage === index
                        ? 'border-yellow-500 shadow-lg shadow-yellow-500/50 scale-110'
                        : 'border-white/20 opacity-70 hover:opacity-100 hover:border-yellow-500/50 hover:scale-110'
                    }`}
                  >
                    <img src={image} alt={`Studio ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:col-span-2 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                    <Video className="w-8 h-8 icon-gold-shine" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-500 transition-colors">Professional Video Production</h3>
                    <p className="text-gray-400">Multi-camera setup with cinematic lighting and 4K recording for stunning visuals</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                    <Headphones className="w-8 h-8 icon-gold-shine" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-500 transition-colors">Broadcast-Quality Audio</h3>
                    <p className="text-gray-400">Premium microphones and acoustic treatment for pristine, professional sound</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                    <Sparkles className="w-8 h-8 icon-gold-shine" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-500 transition-colors">Complete Post-Production</h3>
                    <p className="text-gray-400">Professional editing, color grading, and distribution across all major platforms</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials - Glassmorphic Design */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759258610/gallery-bg_lrxadn.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Testimonials</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">What Our Guests Say</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real experiences from people who've recorded in our studio
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Korina Flint",
                title: "Health & Wellness Professional",
                initial: "K",
                gradient: "from-yellow-400 to-yellow-600",
                quote: "I am thoroughly impressed with Disruptors Media. They are super talented and knowledgeable, but what impressed me even more is their dedication to their mission. They truly want to help others spread the message of health and wellness. My experience shooting a podcast with them was amazing."
              },
              {
                name: "Sydney Osmun",
                title: "Podcast Guest",
                initial: "S",
                gradient: "from-yellow-400 to-yellow-600",
                quote: "I've been blown away by every detail from my entire experience. Their studio is top notch with different settings, high-class equipment, incredible host, and fast turnaround."
              },
              {
                name: "Mariah Tyler Moore",
                title: "Content Creator",
                initial: "M",
                gradient: "from-yellow-500 to-yellow-700",
                quote: "Working with Kyle to record the podcast was such a fun and invigorating experience! The discussion was incredible and the studio atmosphere is fantastic."
              },
              {
                name: "Portia Louder",
                title: "Industry Expert",
                initial: "P",
                gradient: "from-yellow-400 to-yellow-600",
                quote: "I had a great experience recording a podcast. The host was well spoken and understood the topic. The studio is incredible."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-yellow-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {testimonial.initial}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-gray-400">{testimonial.title}</p>
                  </div>
                </div>
                <blockquote className="text-gray-300 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Design */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Get Started</span>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Ready to Start Your Podcast?</h2>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Let's create a podcast that positions you as the authority in your industry and drives real business results
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={createPageUrl('book-strategy-session')}
                className="group relative inline-flex items-center justify-center h-16 px-10 text-lg font-bold text-gold-shine uppercase bg-transparent border-2 border-[#BF953F] hover:bg-[#BF953F]/10 transition-all duration-300"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                  boxShadow: '0 0 20px rgba(191, 149, 63, 0.4)'
                }}
              >
                <span>Book a Strategy Session</span>
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link to={createPageUrl('contact')}>
                <Button variant="outline" size="lg" className="border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm h-16 px-8 text-lg">
                  Get More Info
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
