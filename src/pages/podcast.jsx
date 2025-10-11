import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Play, Mic, Headphones, Video, ArrowRight, Radio, Users, Sparkles, ExternalLink } from 'lucide-react';
import PageTitle from '../components/shared/PageTitle';

// Podcast episodes data - placeholder for actual content from old site
const episodes = [
  {
    id: 1,
    title: "Episode Title Placeholder",
    guest: "Guest Name",
    date: "Date TBD",
    description: "Episode description would go here. Professional podcast content that positions you as an industry leader.",
    duration: "45 min",
    platforms: {
      spotify: "#",
      apple: "#",
      youtube: "#"
    }
  },
  {
    id: 2,
    title: "Episode Title Placeholder",
    guest: "Guest Name",
    date: "Date TBD",
    description: "Episode description would go here. Professional podcast content that positions you as an industry leader.",
    duration: "52 min",
    platforms: {
      spotify: "#",
      apple: "#",
      youtube: "#"
    }
  },
  {
    id: 3,
    title: "Episode Title Placeholder",
    guest: "Guest Name",
    date: "Date TBD",
    description: "Episode description would go here. Professional podcast content that positions you as an industry leader.",
    duration: "38 min",
    platforms: {
      spotify: "#",
      apple: "#",
      youtube: "#"
    }
  }
];

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
    <div className="bg-[#0E0E0E] text-[#F1EDE9]">
      {/* Page Title */}
      <PageTitle title="PODCAST" />

      {/* Hero Section - Minimalist Brutalist Style */}
      <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
        {/* Background with subtle grid overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNDEsMjM3LDIzMywwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Uppercase Monospace Label */}
            <div className="mb-8">
              <span className="font-mono text-sm tracking-[0.3em] uppercase opacity-60">
                Production Studio
              </span>
            </div>

            {/* Main Heading - Bold, Minimal */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold mb-8 tracking-tight uppercase leading-none">
              PODCAST
            </h1>

            {/* Subheading */}
            <p className="font-mono text-base sm:text-lg max-w-3xl mx-auto mb-12 tracking-wide uppercase opacity-80 leading-relaxed">
              Professional audio & video production / Multi-camera recording / Full post-production / Distribution across all platforms
            </p>

            {/* Minimalist CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={createPageUrl('book-strategy-session')}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-[#F1EDE9] hover:bg-[#F1EDE9] hover:text-black transition-all duration-300"
              >
                <span className="font-mono text-sm tracking-[0.2em] uppercase">Book Session</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={createPageUrl('contact')}
                className="font-mono text-sm tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity"
              >
                Learn More →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F1EDE9]/30 to-transparent"></div>
      </section>

      {/* Episodes Section - Brutalist Grid */}
      <section className="relative bg-black py-24 border-t border-[#F1EDE9]/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="font-mono text-sm tracking-[0.3em] uppercase opacity-60 mb-4 block">
              Recent Episodes
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase">
              LATEST
            </h2>
          </motion.div>

          <div className="space-y-px">
            {episodes.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group border border-[#F1EDE9]/10 hover:border-[#F1EDE9]/30 transition-all duration-300 bg-black/50"
              >
                <div className="p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-40">
                        EP {String(episode.id).padStart(3, '0')}
                      </span>
                      <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-40">
                        {episode.duration}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 uppercase group-hover:opacity-70 transition-opacity">
                      {episode.title}
                    </h3>
                    <p className="font-mono text-sm opacity-60 mb-4 uppercase tracking-wide">
                      with {episode.guest} · {episode.date}
                    </p>
                    <p className="text-sm opacity-80 max-w-2xl">
                      {episode.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <a
                      href={episode.platforms.spotify}
                      className="font-mono text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
                    >
                      Spotify <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={episode.platforms.apple}
                      className="font-mono text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
                    >
                      Apple <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={episode.platforms.youtube}
                      className="font-mono text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
                    >
                      YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <a
              href="#"
              className="inline-flex items-center gap-3 font-mono text-sm tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity"
            >
              View All Episodes <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
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
                <span className="text-yellow-500 text-sm font-bold tracking-wider uppercase">Our Studio</span>
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
                    <Video className="w-8 h-8 text-yellow-500" />
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
                    <Headphones className="w-8 h-8 text-yellow-500" />
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
                    <Sparkles className="w-8 h-8 text-yellow-500" />
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
                <span className="text-yellow-500 text-sm font-bold tracking-wider uppercase">Testimonials</span>
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
                <span className="text-yellow-500 text-sm font-bold tracking-wider uppercase">Get Started</span>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Ready to Start Your Podcast?</h2>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Let's create a podcast that positions you as the authority in your industry and drives real business results
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={createPageUrl('book-strategy-session')}
                className="group relative inline-flex items-center justify-center h-16 px-10 text-lg font-bold text-black uppercase bg-[#FFD700] hover:bg-[#FFD700]/90 transition-all duration-300"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
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
