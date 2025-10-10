import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useImageParallax } from '@/hooks/useParallax';

export default function AlternatingLayout({ sections = [] }) {
  return (
    <div className="relative">
      {sections.map((section, index) => {
        const isEven = index % 2 === 0;
        const textOnLeft = isEven; // Text on left for even indices, right for odd

        return (
          <ParallaxSection
            key={index}
            section={section}
            textOnLeft={textOnLeft}
          />
        );
      })}
    </div>
  );
}

function ParallaxSection({ section, textOnLeft }) {
  const imageRef = useImageParallax({ speed: 0.4, scaleFrom: 1.15, scaleTo: 1 });

  return (
    <section className="relative flex items-center min-h-[500px] md:min-h-[600px] lg:min-h-[700px] overflow-hidden">
      {/* Full-width background image/video with parallax */}
      <div className="absolute inset-0 w-full h-full">
        {section.video ? (
          <video
            ref={imageRef}
            src={section.video}
            className="w-full h-full object-cover scale-110"
            style={section.videoStyle}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={section.imageAlt || section.headline || 'Section video'}
          />
        ) : section.image ? (
          <img
            ref={imageRef}
            src={section.image}
            alt={section.imageAlt || section.headline || 'Section image'}
            className="w-full h-full object-cover scale-110"
            loading="lazy"
          />
        ) : (
          <div
            ref={imageRef}
            className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center scale-110"
          >
            <div className="text-white text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
              <p className="text-lg font-medium">Premium Image</p>
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlay - directional based on text position */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: textOnLeft
            ? 'linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 25%, rgba(0, 0, 0, 0) 50%)'
            : 'linear-gradient(to left, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 25%, rgba(0, 0, 0, 0) 50%)'
        }}
      />

      {/* Content container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-12 md:py-16 lg:py-20">
        <div className={`max-w-2xl ${textOnLeft ? '' : 'ml-auto'}`}>
          {/* Text Content */}
          <motion.div
            className="space-y-3 sm:space-y-4 md:space-y-6"
            initial={{ opacity: 0, x: textOnLeft ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true, margin: "-10%" }}
          >
            {section.kicker && (
              <motion.p
                className="font-sans text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest mb-2 sm:mb-4 text-indigo-300"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {section.kicker}
              </motion.p>
            )}

            {section.headline && (
              <motion.h2
                className={`font-sans ${section.headlineSize || 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'} font-black leading-tight tracking-tight mb-4 sm:mb-6 md:mb-8 text-white drop-shadow-lg`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
              >
                {section.headline}
              </motion.h2>
            )}

            {section.body && (
              <motion.div
                className="font-sans text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl leading-relaxed font-light mb-6 sm:mb-8 text-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                viewport={{ once: true }}
              >
                {section.body}
              </motion.div>
            )}

            {section.cta && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Button
                  asChild
                  size="lg"
                  className="font-sans text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto font-semibold touch-manipulation w-full sm:w-auto"
                >
                  <Link to={createPageUrl(section.cta.link)}>
                    {section.cta.label}
                  </Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}