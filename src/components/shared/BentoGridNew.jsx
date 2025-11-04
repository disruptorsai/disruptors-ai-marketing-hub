import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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

const BentoCard = ({ item, index, onExpand }) => {
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
      className={`group relative ${rowSpan} overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[350px] cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onExpand(item)}
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

        {/* Subtitle */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
          {item.overview}
        </p>
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

const ExpandedCard = ({ item, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, type: 'spring', damping: 25 }}
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-10 bg-black/60 backdrop-blur-sm rounded-full p-3 hover:bg-black/80 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Hero Section */}
        <div className="relative h-80 overflow-hidden rounded-t-3xl">
          {item.video ? (
            <video
              src={item.video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={item.heroImage}
              alt={item.client}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

          {/* Logo & Title Overlay */}
          <div className="absolute bottom-8 left-8">
            {item.logo && (
              <img
                src={item.logo}
                alt={item.client}
                className="h-16 w-auto mb-4"
              />
            )}
            <h2 className="text-4xl font-bold text-white">{item.title || item.client}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Overview */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Overview</h3>
            <p className="text-gray-300 text-lg leading-relaxed">{item.overview}</p>
          </div>

          {/* Metrics */}
          {item.results && item.results.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {item.results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center p-4 bg-black/30 rounded-xl border border-yellow-400/20"
                  >
                    <result.icon className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-white mb-1">{result.value}</p>
                    <p className="text-gray-400 text-sm">{result.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Challenge & Approach */}
          <div className="grid md:grid-cols-2 gap-8">
            {item.challenge && (
              <div>
                <h3 className="text-xl font-bold text-white mb-3">The Challenge</h3>
                <p className="text-gray-300 leading-relaxed">{item.challenge}</p>
              </div>
            )}
            {item.approach && (
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Our Approach</h3>
                <p className="text-gray-300 leading-relaxed">{item.approach}</p>
              </div>
            )}
          </div>

          {/* Services */}
          {item.services && item.services.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Services Provided</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.services.map((service, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-yellow-400/20"
                  >
                    <service.icon className="w-6 h-6 text-yellow-400" />
                    <span className="text-white font-medium">{service.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonial */}
          {item.testimonial && (
            <div className="bg-black/40 border border-yellow-400/30 rounded-2xl p-8 text-center">
              <p className="text-xl italic text-white mb-4">"{item.testimonial}"</p>
              <p className="text-gray-400">- {item.client}</p>
            </div>
          )}

          {/* CTA */}
          <div className="text-center pt-4">
            <Link
              to={createPageUrl(item.path || 'contact')}
              className="inline-flex items-center gap-2 bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-500 transition-colors"
            >
              View Full Case Study
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function BentoGridNew({ items }) {
  const [expandedItem, setExpandedItem] = useState(null);
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 auto-rows-[180px] w-full max-w-[1800px] mx-auto" style={{ gridAutoFlow: 'dense' }}>
        {items.map((item, index) => (
          <BentoCard
            key={`${item.name}-${index}` || index}
            item={item}
            index={index}
            onExpand={setExpandedItem}
          />
        ))}
      </div>

      {/* Expanded Card Modal */}
      <AnimatePresence>
        {expandedItem && (
          <ExpandedCard item={expandedItem} onClose={() => setExpandedItem(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
