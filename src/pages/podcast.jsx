import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, ExternalLink } from 'lucide-react';
import PageTitle from '../components/shared/PageTitle';

// Podcast episodes data - placeholder for actual content from old site
const episodes = [
  {
    id: 1,
    title: 'Episode Title Placeholder',
    guest: 'Guest Name',
    date: 'Date TBD',
    description: 'Episode description would go here. Professional podcast content that positions you as an industry leader.',
    duration: '45 min',
    platforms: {
      spotify: '#',
      apple: '#',
      youtube: '#'
    }
  },
  {
    id: 2,
    title: 'Episode Title Placeholder',
    guest: 'Guest Name',
    date: 'Date TBD',
    description: 'Episode description would go here. Professional podcast content that positions you as an industry leader.',
    duration: '52 min',
    platforms: {
      spotify: '#',
      apple: '#',
      youtube: '#'
    }
  },
  {
    id: 3,
    title: 'Episode Title Placeholder',
    guest: 'Guest Name',
    date: 'Date TBD',
    description: 'Episode description would go here. Professional podcast content that positions you as an industry leader.',
    duration: '38 min',
    platforms: {
      spotify: '#',
      apple: '#',
      youtube: '#'
    }
  }
];

const studioImages = [
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712352/disruptors-media/content/studio/gl3a0022.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712357/disruptors-media/content/studio/gl3a0026.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712362/disruptors-media/content/studio/gl3a0030.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712366/disruptors-media/content/studio/gl3a0042.jpg'
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

      {/* Studio Showcase - Minimal Grid */}
      <section className="relative py-24 bg-black border-t border-[#F1EDE9]/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="font-mono text-sm tracking-[0.3em] uppercase opacity-60 mb-4 block">
              Production Facility
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase">
              STUDIO
            </h2>
          </motion.div>

          {/* Main Image */}
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full aspect-[16/9] overflow-hidden border border-[#F1EDE9]/10 mb-8"
          >
            <img
              src={studioImages[activeImage]}
              alt="Studio Setup"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-4 gap-4 mb-16">
            {studioImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`aspect-video overflow-hidden border transition-all ${
                  activeImage === index
                    ? 'border-[#F1EDE9] opacity-100'
                    : 'border-[#F1EDE9]/20 opacity-40 hover:opacity-70'
                }`}
              >
                <img src={image} alt={`Studio ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#F1EDE9]/10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-black p-8 border border-[#F1EDE9]/10"
            >
              <h3 className="font-mono text-xs tracking-[0.2em] uppercase opacity-60 mb-4">01</h3>
              <h4 className="text-xl font-bold uppercase mb-3">Multi-Camera Video</h4>
              <p className="text-sm opacity-60">Professional 4K recording with cinematic lighting</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black p-8 border border-[#F1EDE9]/10"
            >
              <h3 className="font-mono text-xs tracking-[0.2em] uppercase opacity-60 mb-4">02</h3>
              <h4 className="text-xl font-bold uppercase mb-3">Broadcast Audio</h4>
              <p className="text-sm opacity-60">Studio-grade microphones and acoustic treatment</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-black p-8 border border-[#F1EDE9]/10"
            >
              <h3 className="font-mono text-xs tracking-[0.2em] uppercase opacity-60 mb-4">03</h3>
              <h4 className="text-xl font-bold uppercase mb-3">Full Post-Production</h4>
              <p className="text-sm opacity-60">Professional editing and multi-platform distribution</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials - Minimal List */}
      <section className="relative py-24 bg-black border-t border-[#F1EDE9]/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="font-mono text-sm tracking-[0.3em] uppercase opacity-60 mb-4 block">
              Guest Feedback
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase">
              TESTIMONIALS
            </h2>
          </motion.div>

          <div className="space-y-px">
            {[
              {
                name: 'Korina Flint',
                title: 'Health & Wellness Professional',
                quote: 'I am thoroughly impressed with Disruptors Media. They are super talented and knowledgeable, but what impressed me even more is their dedication to their mission. My experience shooting a podcast with them was amazing.'
              },
              {
                name: 'Sydney Osmun',
                title: 'Podcast Guest',
                quote: "I've been blown away by every detail from my entire experience. Their studio is top notch with different settings, high-class equipment, incredible host, and fast turnaround."
              },
              {
                name: 'Mariah Tyler Moore',
                title: 'Content Creator',
                quote: 'Working with Kyle to record the podcast was such a fun and invigorating experience! The discussion was incredible and the studio atmosphere is fantastic.'
              },
              {
                name: 'Portia Louder',
                title: 'Industry Expert',
                quote: 'I had a great experience recording a podcast. The host was well spoken and understood the topic. The studio is incredible.'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border border-[#F1EDE9]/10 p-8 bg-black/50"
              >
                <blockquote className="mb-6 text-base leading-relaxed opacity-80">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-bold uppercase text-sm">{testimonial.name}</div>
                  <div className="font-mono text-xs uppercase opacity-40 tracking-wider">{testimonial.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="relative py-32 bg-black border-t border-[#F1EDE9]/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold uppercase mb-8 leading-tight">
              Start Your
              <br />
              Podcast
            </h2>

            <p className="font-mono text-sm tracking-wide uppercase opacity-60 mb-12 max-w-2xl mx-auto">
              Professional production / Expert team / Multi-platform distribution
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={createPageUrl('book-strategy-session')}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-[#F1EDE9] hover:bg-[#F1EDE9] hover:text-black transition-all duration-300"
              >
                <span className="font-mono text-sm tracking-[0.2em] uppercase">Book Strategy Session</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={createPageUrl('contact')}
                className="font-mono text-sm tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity inline-flex items-center gap-2 py-4"
              >
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
