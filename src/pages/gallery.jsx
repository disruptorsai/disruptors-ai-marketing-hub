import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioAssets, portfolioImages, portfolioVideos } from '@/data/portfolio-assets';
import { X, Play, Image as ImageIcon, Video as VideoIcon, Grid3x3, ChevronLeft, ChevronRight, Presentation } from 'lucide-react';
import PageTitle from '../components/shared/PageTitle';

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
    <div className="relative min-h-screen">
      {/* Page Title */}
      <PageTitle title="GALLERY" light />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759268586/disruptors-ai/backgrounds/disruptors-ai/backgrounds/geometric-structure-black.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="fixed inset-0 z-[1] bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight mb-4">
              Portfolio Gallery
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A showcase of our creative work, AI-generated content, and project highlights
            </p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50 scale-105'
                      : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{option.label}</span>
                  <span className={`text-sm ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                    ({option.count})
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Masonry Grid */}
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredAssets.map((asset, index) => (
                <motion.div
                  key={asset.publicId}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.02 }}
                  className="break-inside-avoid mb-4"
                >
                  <GalleryItem
                    asset={asset}
                    onClick={() => setSelectedIndex(index)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredAssets.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-400 text-lg">No assets found for this filter.</p>
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

function GalleryItem({ asset, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden cursor-pointer group bg-transparent backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Asset */}
      {asset.type === 'image' ? (
        <img
          src={asset.url}
          alt="Portfolio item"
          className={`w-full h-auto transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      ) : (
        <video
          src={asset.url}
          className={`w-full h-auto transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
        />
      )}

      {/* Loading Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                <Play className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  {asset.duration?.toFixed(1)}s
                </span>
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
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
          className="absolute top-4 right-20 p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all duration-200 backdrop-blur-sm border border-blue-500/50 z-50 shadow-lg shadow-blue-600/50"
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
              <VideoIcon className="w-6 h-6 text-blue-400" />
            ) : (
              <ImageIcon className="w-6 h-6 text-blue-400" />
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
          initial={isScreensaver ? { scale: 1.1, opacity: 0, rotateY: -10 } : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={isScreensaver ? { scale: 0.9, opacity: 0, rotateY: 10 } : { scale: 0.9, opacity: 0 }}
          transition={isScreensaver ? { duration: 0.8, ease: "easeInOut" } : { duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {asset.type === 'image' ? (
            <img
              src={asset.url}
              alt="Portfolio item"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          ) : (
            <video
              src={asset.url}
              controls
              autoPlay
              loop
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}