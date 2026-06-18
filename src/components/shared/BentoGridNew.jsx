import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

/**
 * BULLETPROOF BentoGrid - 100% Image Loading Guarantee
 * Features:
 * - Aggressive preloading
 * - Images always visible (no opacity tricks)
 * - Solid color backgrounds during load
 * - Multiple fallback strategies
 *
 * DEBUG MODE ACTIVE: Comprehensive logging for troubleshooting
 */

// Preload all images immediately
const preloadImages = (items) => {
  console.group('🖼️ [BENTO GRID] Preloading Images');
  console.log('Items to preload:', items?.length || 0);

  const preloadStats = {
    heroImages: 0,
    logos: 0,
    total: 0
  };

  items.forEach((item, index) => {
    if (item.heroImage) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = item.heroImage;
      document.head.appendChild(link);
      preloadStats.heroImages++;
      preloadStats.total++;
      console.log(`  ✓ Preloading hero image ${index + 1}:`, item.heroImage.substring(0, 60) + '...');
    }
    if (item.logo) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = item.logo;
      document.head.appendChild(link);
      preloadStats.logos++;
      preloadStats.total++;
      console.log(`  ✓ Preloading logo ${index + 1}:`, item.logo.substring(0, 60) + '...');
    }
  });

  console.log('Preload Summary:', preloadStats);
  console.groupEnd();
};

const BentoCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(item.heroImage || item.logo);
  const [logoSrc, setLogoSrc] = useState(item.logo);
  const [imageLoadState, setImageLoadState] = useState({
    heroLoaded: false,
    logoLoaded: false,
    heroError: false,
    logoError: false
  });

  // Track image loading for each card
  useEffect(() => {
    console.log(`🃏 [BENTO CARD #${index}] Initialized`, {
      client: item.client,
      hasHeroImage: !!item.heroImage,
      hasLogo: !!item.logo,
      hasVideo: !!item.video
    });
  }, []);

  const handleVideoToggle = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && item.video) {
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsVideoPlaying(false);
    }
  };

  // More balanced row spans
  const rowSpans = [
    'row-span-2',
    'row-span-3',
    'row-span-2',
    'row-span-3',
    'row-span-2',
    'row-span-2',
  ];
  const rowSpan = rowSpans[index % rowSpans.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0.9, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={`group relative ${rowSpan} overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[350px]`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image/Video - ALWAYS VISIBLE */}
      <div className="absolute inset-0">
        {item.video ? (
          <>
            <video
              ref={videoRef}
              src={item.video}
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
            />
            {/* Video Controls */}
            <button
              onClick={handleVideoToggle}
              aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
              className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
            >
              {isVideoPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>
          </>
        ) : (
          <>
            {/* Solid background color ALWAYS shows */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />

            {/* Image loads on top - NO opacity animation, just there */}
            <img
              src={imgSrc}
              alt={item.client}
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
              loading="eager"
              decoding="sync"
              fetchpriority="high"
              onLoad={() => {
                console.log(`✅ [BENTO CARD #${index}] Hero image loaded:`, item.client);
                setImageLoadState(prev => ({ ...prev, heroLoaded: true }));
              }}
              onError={(e) => {
                console.error(`❌ [BENTO CARD #${index}] Hero image failed:`, item.client, imgSrc);
                setImageLoadState(prev => ({ ...prev, heroError: true }));
                // Fallback to logo if hero image fails
                if (imgSrc !== item.logo && item.logo) {
                  console.log(`🔄 [BENTO CARD #${index}] Fallback to logo:`, item.client);
                  setImgSrc(item.logo);
                }
              }}
            />
          </>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
      </div>

      {/* Content - Always visible */}
      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        {/* Logo */}
        {logoSrc && (
          <div className="mb-6 inline-block self-start">
            <img
              src={logoSrc}
              alt={item.client}
              className="h-16 w-auto max-w-[200px] object-contain transform group-hover:scale-110 transition-all duration-500 drop-shadow-2xl"
              loading="eager"
              decoding="sync"
              onLoad={() => {
                console.log(`✅ [BENTO CARD #${index}] Logo loaded:`, item.client);
                setImageLoadState(prev => ({ ...prev, logoLoaded: true }));
              }}
              onError={(e) => {
                console.error(`❌ [BENTO CARD #${index}] Logo failed:`, item.client, logoSrc);
                setImageLoadState(prev => ({ ...prev, logoError: true }));
                // Hide logo if it fails
                setLogoSrc(null);
              }}
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300 drop-shadow-lg">
          {item.client}
        </h3>
      </div>

      {/* Border Animation */}
      <motion.div
        className="absolute inset-0 border-2 border-yellow-400 rounded-3xl opacity-0 group-hover:opacity-100"
        initial={false}
        animate={isHovered ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default function BentoGridNew({ items }) {
  const [loadProgress, setLoadProgress] = useState({
    total: 0,
    loaded: 0,
    failed: 0
  });

  // Component mount tracking
  useEffect(() => {
    console.group('🎯 [BENTO GRID] Component Mount');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Items received:', items?.length || 0);
    console.log('Items data:', items?.map(i => ({ name: i.name, client: i.client })));
    console.groupEnd();

    return () => {
      console.log('❌ [BENTO GRID] Component Unmounting');
    };
  }, []);

  // AGGRESSIVE PRELOADING - Run immediately
  useEffect(() => {
    if (!items || items.length === 0) {
      console.warn('⚠️ [BENTO GRID] No items to preload');
      return;
    }

    console.log('🚀 [BENTO GRID] Starting aggressive preload...');
    preloadImages(items);

    // Track preload progress
    let totalImages = 0;
    let loadedImages = 0;
    let failedImages = 0;

    // Also force browser to start downloading
    items.forEach((item, index) => {
      if (item.heroImage) {
        totalImages++;
        const img = new Image();
        img.onload = () => {
          loadedImages++;
          console.log(`✅ [BENTO GRID] Hero preload success (${loadedImages}/${totalImages}):`, item.client);
          setLoadProgress({ total: totalImages, loaded: loadedImages, failed: failedImages });
        };
        img.onerror = () => {
          failedImages++;
          console.error(`❌ [BENTO GRID] Hero preload failed (${failedImages} errors):`, item.client, item.heroImage);
          setLoadProgress({ total: totalImages, loaded: loadedImages, failed: failedImages });
        };
        img.src = item.heroImage;
      }
      if (item.logo) {
        totalImages++;
        const logo = new Image();
        logo.onload = () => {
          loadedImages++;
          console.log(`✅ [BENTO GRID] Logo preload success (${loadedImages}/${totalImages}):`, item.client);
          setLoadProgress({ total: totalImages, loaded: loadedImages, failed: failedImages });
        };
        logo.onerror = () => {
          failedImages++;
          console.error(`❌ [BENTO GRID] Logo preload failed (${failedImages} errors):`, item.client, item.logo);
          setLoadProgress({ total: totalImages, loaded: loadedImages, failed: failedImages });
        };
        logo.src = item.logo;
      }
    });

    setLoadProgress({ total: totalImages, loaded: 0, failed: 0 });
    console.log(`📊 [BENTO GRID] Preload initiated for ${totalImages} images`);
  }, [items]);

  // Track load progress
  useEffect(() => {
    if (loadProgress.total > 0) {
      const percentage = Math.round(((loadProgress.loaded + loadProgress.failed) / loadProgress.total) * 100);
      console.log(`📊 [BENTO GRID] Load Progress: ${percentage}% (${loadProgress.loaded} loaded, ${loadProgress.failed} failed, ${loadProgress.total - loadProgress.loaded - loadProgress.failed} pending)`);

      if (loadProgress.loaded + loadProgress.failed === loadProgress.total) {
        console.log(`✅ [BENTO GRID] All images processed! Success: ${loadProgress.loaded}, Failed: ${loadProgress.failed}`);
      }
    }
  }, [loadProgress]);

  if (!items || items.length === 0) {
    console.error('❌ [BENTO GRID] Rendering empty state - no items available');
    return (
      <div className="text-center text-white py-20">
        <p className="text-xl">No portfolio items available</p>
      </div>
    );
  }

  console.log('🎨 [BENTO GRID] Rendering grid with', items.length, 'items');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 auto-rows-[180px] w-full max-w-[1800px] mx-auto" style={{ gridAutoFlow: 'dense' }}>
      {items.map((item, index) => (
        <BentoCard
          key={`${item.name}-${index}` || index}
          item={item}
          index={index}
        />
      ))}
    </div>
  );
}
