import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAdaptiveVideo } from '@/hooks/useConnectionQuality';
import { getViewportOptimizedDimensions } from '@/utils/cloudinary-optimizer';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * VideoScrollScrub Component
 *
 * A high-performance video scroll scrubbing component that synchronizes
 * video playback with scroll position using GSAP ScrollTrigger.
 *
 * Features:
 * - Frame-accurate video scrubbing based on scroll position
 * - Optimized for mobile performance (60fps)
 * - Automatic cleanup and memory management
 * - Reduced motion support for accessibility
 * - Lazy loading and intersection observer optimization
 *
 * @param {Object} props - Component props
 * @param {string} props.videoSrc - Source URL for the video file
 * @param {string} props.poster - Poster image URL for video placeholder
 * @param {string} props.title - Accessible title for the video
 * @param {string} props.description - Description text overlay
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.scrollTriggerOptions - Custom ScrollTrigger configuration
 */
const VideoScrollScrub = ({
  videoSrc = "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/website-demo-reel.mp4",
  poster = "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/ui/backgrounds/renaissance-fresco-pyramids.png",
  title = "AI-Powered Marketing Innovation",
  description = "Discover how we transform businesses with cutting-edge AI solutions",
  className = "",
  scrollTriggerOptions = {}
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  // Get adaptive video configuration based on connection quality
  const videoDimensions = getViewportOptimizedDimensions('video');
  const { url: optimizedVideoUrl, shouldLoad: shouldLoadVideo, quality } = useAdaptiveVideo(
    videoSrc,
    { width: videoDimensions.width }
  );

  const [showPosterFallback, setShowPosterFallback] = useState(!shouldLoadVideo);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const textElement = textRef.current;

    if (!video || !container) return;

    // Don't load video if connection is poor
    if (!shouldLoadVideo || showPosterFallback) {
      console.log('⚠️ Video disabled due to poor connection - showing poster');
      setShowPosterFallback(true);
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // For users who prefer reduced motion, just show static poster
      video.style.display = 'none';
      setShowPosterFallback(true);
      return;
    }

    // Video setup for optimal performance
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    // Wait for video metadata to load
    const handleLoadedMetadata = () => {
      console.log('✅ Video metadata loaded:', {
        duration: video.duration,
        videoSrc: optimizedVideoUrl,
        quality,
        readyState: video.readyState,
        dimensions: videoDimensions
      });

      // Set initial frame to first frame
      video.currentTime = 0;

      // Create ScrollTrigger animation
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 1, // Smooth scrubbing with 1-second lag
        markers: false, // Production: Hide scroll trigger markers
        onUpdate: (self) => {
          // Calculate video progress based on scroll progress
          const progress = self.progress;
          const targetTime = progress * video.duration;

          console.log('🎬 Scrubbing video:', {
            progress: progress.toFixed(2),
            targetTime: targetTime.toFixed(2),
            currentTime: video.currentTime.toFixed(2)
          });

          // Use requestVideoFrameCallback for frame-accurate updates when available
          if ('requestVideoFrameCallback' in video) {
            video.requestVideoFrameCallback(() => {
              video.currentTime = targetTime;
            });
          } else {
            video.currentTime = targetTime;
          }
        },
        onEnter: () => {
          // Animate text reveal when section enters viewport
          gsap.fromTo(textElement,
            {
              opacity: 0,
              y: 50,
              filter: 'blur(10px)'
            },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 1.2,
              ease: "power2.out"
            }
          );
        },
        onLeave: () => {
          // Fade out text when leaving viewport
          gsap.to(textElement, {
            opacity: 0.3,
            duration: 0.5,
            ease: "power2.out"
          });
        },
        onEnterBack: () => {
          // Restore text when re-entering from below
          gsap.to(textElement, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
          });
        },
        ...scrollTriggerOptions
      });
    };

    // Error handling for video loading
    const handleError = (e) => {
      console.warn('⚠️ Video failed to load:', e);
      console.log('Falling back to poster image');
      // Fallback to poster image
      setShowPosterFallback(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    // Performance optimization: Force hardware acceleration
    video.style.transform = 'translateZ(0)';
    video.style.willChange = 'auto';

    // Cleanup function
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);

      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }

      // Reset video properties
      if (video) {
        video.currentTime = 0;
        video.style.willChange = 'auto';
      }
    };
  }, [optimizedVideoUrl, scrollTriggerOptions, shouldLoadVideo, showPosterFallback, quality, videoDimensions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-transparent flex items-center justify-center ${className}`}
      role="region"
      aria-label="Video showcase section"
    >
      {/* Video Container - constrained to 85% width */}
      <div className="relative w-[85%] h-full overflow-hidden">
        {/* Poster Fallback for Poor Connections */}
        {showPosterFallback && (
          <img
            src={poster}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Video Element - Hidden on poor connections */}
        {!showPosterFallback && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            poster={poster}
            muted
            playsInline
            preload="metadata"
            aria-label={title}
          >
            <source src={optimizedVideoUrl} type="video/mp4" />
            <p className="text-white text-center p-8">
              Your browser does not support the video tag.
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </p>
          </video>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Content Overlay */}
        <div
          ref={textRef}
          className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-xl sm:text-2xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-70">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium tracking-wide uppercase">Scroll to explore</span>
            <div className="w-px h-12 bg-white/50 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoScrollScrub;