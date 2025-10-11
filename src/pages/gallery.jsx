import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioAssets, portfolioImages, portfolioVideos } from '@/data/portfolio-assets';
import { X, Play, Image as ImageIcon, Video as VideoIcon, Grid3x3, ChevronLeft, ChevronRight, Presentation } from 'lucide-react';
import PageTitle from '../components/shared/PageTitle';
import { optimizeCloudinaryImage, optimizeCloudinaryVideo, getVideoThumbnail, CLOUDINARY_PRESETS } from '@/utils/cloudinary-optimizer';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', icon: Grid3x3, count: portfolioAssets.length },
  { id: 'images', label: 'Images', icon: ImageIcon, count: portfolioImages.length },
  { id: 'videos', label: 'Videos', icon: VideoIcon, count: portfolioVideos.length }
];

export default function Gallery() {
  const [filter, setFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const filteredAssets = useMemo(() => {
    switch (filter) {
      case 'images':
        return portfolioImages;
      case 'videos':
        return portfolioVideos;
      default:
        return portfolioAssets;
    }
  }, [filter]);

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Page Title */}
      <PageTitle title="GALLERY" />

      {/* Content */}
      <div className="relative z-10 py-8 sm:py-12">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            {FILTER_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = filter === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/50 scale-105'
                      : 'bg-white/10 backdrop-blur-md text-black hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{option.label}</span>
                  <span className={`text-sm ${isActive ? 'text-black/80' : 'text-black/60'}`}>
                    ({option.count})
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8 auto-rows-[200px] w-full"
            style={{ gridAutoFlow: 'dense' }}
          >
            <AnimatePresence mode="popLayout">
              {filteredAssets.map((asset, index) => {
                // Vary card spans for bento effect
                const rowSpans = ['row-span-1', 'row-span-2', 'row-span-1', 'row-span-3', 'row-span-2', 'row-span-1'];
                const rowSpan = rowSpans[index % rowSpans.length];

                return (
                  <motion.div
                    key={asset.publicId}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: index * 0.02 }}
                    className={rowSpan}
                  >
                    <GalleryItem
                      asset={asset}
                      index={index}
                      onClick={() => setSelectedIndex(index)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredAssets.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-black text-lg">No assets found for this filter.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        assets={filteredAssets}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
      />
    </div>
  );
}

function GalleryItem({ asset, onClick, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef(null);
  const videoRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, []);

  // Handle video play/pause on hover
  useEffect(() => {
    if (videoRef.current && asset.type === 'video') {
      if (isHovered) {
        videoRef.current.play().catch(err => {
          console.log('Video play failed:', err);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // Reset to start
      }
    }
  }, [isHovered, asset.type]);

  // Optimize asset URL based on type
  const optimizedUrl = useMemo(() => {
    if (!isVisible) return null;

    if (asset.type === 'image') {
      return optimizeCloudinaryImage(asset.url, {
        ...CLOUDINARY_PRESETS.gallery,
        width: 800, // Gallery grid size
        quality: 'auto:good',
      });
    } else {
      // For videos, show thumbnail initially
      return getVideoThumbnail(asset.url, {
        width: 800,
        height: 600,
        position: '1', // 1 second into video
      });
    }
  }, [asset, isVisible]);

  return (
    <motion.div
      ref={itemRef}
      className="relative rounded-2xl overflow-hidden cursor-pointer group bg-gray-800 h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Asset - Only render when visible */}
      {isVisible && asset.type === 'image' ? (
        <motion.img
          layoutId={`gallery-asset-${asset.publicId}`}
          src={optimizedUrl}
          alt="Portfolio item"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          decoding="async"
        />
      ) : isVisible && asset.type === 'video' ? (
        <>
          {/* Video thumbnail - shown when not hovered */}
          <motion.img
            layoutId={`gallery-asset-${asset.publicId}`}
            src={optimizedUrl}
            alt="Video thumbnail"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
            decoding="async"
          />
          {/* Actual video - plays on hover */}
          <video
            ref={videoRef}
            src={optimizeCloudinaryVideo(asset.url, { quality: 'auto:good', width: 800 })}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            loop
            playsInline
            preload="metadata"
          />
        </>
      ) : null}

      {/* Loading Placeholder */}
      {(!isLoaded || !isVisible) && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          {isVisible && (
            <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6"
      >
        <div className="text-white">
          <div className="flex items-center gap-2">
            {asset.type === 'video' ? (
              <>
                <Play className="w-5 h-5 text-[#FFD700]" />
                <span className="text-sm font-semibold">
                  {asset.duration?.toFixed(1)}s
                </span>
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5 text-[#FFD700]" />
                <span className="text-sm font-semibold">
                  {asset.width} × {asset.height}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-1 uppercase tracking-wider">
            {asset.format}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Lightbox({ assets, selectedIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const [isScreensaver, setIsScreensaver] = useState(false);

  useEffect(() => {
    setCurrentIndex(selectedIndex);
  }, [selectedIndex]);

  const goToNext = useCallback(() => {
    if (assets && currentIndex !== null) {
      setCurrentIndex((prev) => (prev + 1) % assets.length);
    }
  }, [assets, currentIndex]);

  const goToPrevious = useCallback(() => {
    if (assets && currentIndex !== null) {
      setCurrentIndex((prev) => (prev - 1 + assets.length) % assets.length);
    }
  }, [assets, currentIndex]);

  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isScreensaver) {
          setIsScreensaver(false);
        } else {
          onClose();
        }
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        goToNext();
      } else if (e.deltaY < 0) {
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, goToNext, goToPrevious, onClose, isScreensaver]);

  // Screensaver auto-advance
  useEffect(() => {
    if (!isScreensaver || currentIndex === null) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isScreensaver, currentIndex, goToNext]);

  if (currentIndex === null || !assets || !assets[currentIndex]) return null;

  const asset = assets[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
        onClick={isScreensaver ? () => setIsScreensaver(false) : onClose}
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 1 }}
          animate={{ opacity: isScreensaver ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 backdrop-blur-sm border border-white/20 z-50"
          style={{ pointerEvents: isScreensaver ? 'none' : 'auto' }}
        >
          <X className="w-6 h-6" />
        </motion.button>

        {/* Screensaver Button */}
        <motion.button
          initial={{ opacity: 1 }}
          animate={{ opacity: isScreensaver ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsScreensaver(true);
          }}
          className="absolute top-4 right-20 p-3 bg-[#FFD700] hover:bg-[#FFD700]/90 rounded-full text-black transition-all duration-200 backdrop-blur-sm border border-[#FFD700]/50 z-50 shadow-lg shadow-[#FFD700]/50"
          style={{ pointerEvents: isScreensaver ? 'none' : 'auto' }}
          title="Start Screensaver"
        >
          <Presentation className="w-6 h-6" />
        </motion.button>

        {/* Asset Info */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isScreensaver ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white border border-white/20 z-50"
          style={{ pointerEvents: isScreensaver ? 'none' : 'auto' }}
        >
          <div className="flex items-center gap-3">
            {asset.type === 'video' ? (
              <VideoIcon className="w-6 h-6 text-[#FFD700]" />
            ) : (
              <ImageIcon className="w-6 h-6 text-[#FFD700]" />
            )}
            <div>
              <p className="font-semibold">
                {asset.width} × {asset.height}
              </p>
              <p className="text-sm text-gray-300">
                {asset.format.toUpperCase()}
                {asset.duration && ` • ${asset.duration.toFixed(1)}s`}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            {currentIndex + 1} / {assets.length}
          </div>
        </motion.div>

        {/* Navigation Arrows */}
        <motion.button
          initial={{ opacity: 1 }}
          animate={{ opacity: isScreensaver ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 backdrop-blur-sm border border-white/20 z-50"
          style={{ pointerEvents: isScreensaver ? 'none' : 'auto' }}
        >
          <ChevronLeft className="w-8 h-8" />
        </motion.button>

        <motion.button
          initial={{ opacity: 1 }}
          animate={{ opacity: isScreensaver ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 backdrop-blur-sm border border-white/20 z-50"
          style={{ pointerEvents: isScreensaver ? 'none' : 'auto' }}
        >
          <ChevronRight className="w-8 h-8" />
        </motion.button>

        {/* Content */}
        <motion.div
          key={currentIndex}
          className="w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {asset.type === 'image' ? (
            <motion.img
              layoutId={`gallery-asset-${asset.publicId}`}
              src={optimizeCloudinaryImage(asset.url, CLOUDINARY_PRESETS.fullscreen)}
              alt="Portfolio item"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              loading="eager"
              initial={false}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          ) : (
            <motion.div
              layoutId={`gallery-asset-${asset.publicId}`}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden"
              initial={false}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <video
                src={optimizeCloudinaryVideo(asset.url, { quality: 'auto:good', width: 1920 })}
                controls
                autoPlay
                loop
                preload="metadata"
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}