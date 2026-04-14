import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { customClient } from '@/lib/custom-sdk';
import { useImageParallax, useParallax } from '@/hooks/useParallax';
import FastVideo from '@/components/shared/FastVideo';

// Fallback hardcoded media (used if database fetch fails)
const FALLBACK_MEDIA = {
  background: {
    url: "",
    alt: ""
  },
  video: {
    url: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/website-demo-reel.mp4",
    alt: "Website demo reel"
  },
  logo: {
    url: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png",
    alt: "Disruptors Media Gold Logo"
  }
};

export default function Hero({
  h1 = "AI-Powered Marketing Agency",
  lead = "We combine deep marketing expertise with cutting-edge AI systems to create flexible growth strategies tailored to your business needs.",
}) {
  const [media, setMedia] = useState(FALLBACK_MEDIA);
  const [isLoading, setIsLoading] = useState(true);

  // Parallax refs
  const bgImageRef = useImageParallax({ speed: 0.3, scaleFrom: 1.2, scaleTo: 1 });
  const videoRef = useParallax({ speed: 0.2, direction: 'up' });

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      // Load hero media from database
      const dbMedia = await customClient.entities.SiteMedia.list('display_order', 100);

      if (dbMedia && dbMedia.length > 0) {
        // Filter for hero page assets
        const heroAssets = dbMedia.filter(asset =>
          asset.page_slug === 'hero' && asset.is_active !== false
        );

        if (heroAssets.length > 0) {
          const mediaMap = {
            background: FALLBACK_MEDIA.background,
            video: FALLBACK_MEDIA.video,
            logo: FALLBACK_MEDIA.logo
          };

          // Map database records to media slots by purpose
          heroAssets.forEach(asset => {
            const purpose = asset.purpose?.toLowerCase() || '';

            if (purpose.includes('background')) {
              mediaMap.background = {
                url: asset.media_url,
                alt: asset.alt_text || asset.purpose
              };
            } else if (purpose.includes('demo') || purpose.includes('reel')) {
              mediaMap.video = {
                url: asset.media_url,
                alt: asset.alt_text || asset.purpose
              };
            } else if (purpose.includes('logo')) {
              mediaMap.logo = {
                url: asset.media_url,
                alt: asset.alt_text || asset.purpose
              };
            }
          });

          setMedia(mediaMap);
          console.log(`✓ Loaded ${heroAssets.length} hero media assets from database`);
        } else {
          console.log('⚠ No hero assets found in database, using fallback media');
        }
      }
    } catch (error) {
      console.warn('⚠ Failed to load hero media from database:', error.message);
      setMedia(FALLBACK_MEDIA);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <section className="relative min-h-[100svh] overflow-hidden flex items-center justify-center bg-transparent py-8 sm:py-12 md:py-16">
      {/* Background Image Layer with Parallax */}
      {media.background.url && (
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            ref={bgImageRef}
            src={media.background.url}
            alt={media.background.alt}
            className="w-full h-full object-cover scale-110"
            loading="lazy"
          />
        </div>
      )}

      {/* Content Container - Constrained Width */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        {/* Video Container with Centered Logo and Parallax */}
        <motion.div
          ref={videoRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full"
        >
          <div className="relative overflow-hidden shadow-2xl aspect-video">
            <FastVideo
              src={media.video.url}
              preset="hero"
              autoplay={true}
              loop={true}
              muted={true}
              playsInline={true}
              preload="metadata"
              fetchpriority="high"
              lazy={false}
              className="w-full h-full object-cover scale-105"
              aria-label="Hero feature video"
            />
            {/* Black Transparent Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            {/* Centered Logo Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 gap-4 sm:gap-6">
              <img
                src={media.logo.url}
                alt={media.logo.alt}
                className="h-20 sm:h-28 md:h-36 lg:h-48 xl:h-56 w-auto object-contain"
              />
              {/* Text Overlay Below Logo */}
              <div className="text-center text-white max-w-2xl px-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg">
                  AI-Powered Marketing Agency
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-md">
                  We combine deep marketing expertise with cutting-edge AI systems to create flexible growth strategies tailored to your business needs.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}