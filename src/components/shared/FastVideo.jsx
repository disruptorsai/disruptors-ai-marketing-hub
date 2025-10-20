/**
 * FastVideo Component
 * Optimized video component with instant playback using smart loading strategies
 *
 * Features:
 * - Priority loading with fetchpriority API
 * - Range request optimization for instant start
 * - Preload strategies (metadata, auto, none)
 * - Connection-aware quality
 * - Poster optimization
 * - Intersection Observer for lazy loading
 */

import React, { useRef, useEffect, useState } from 'react';
import { useAdaptiveVideo } from '@/hooks/useConnectionQuality';
import { useLazyLoad } from '@/hooks/useImageOptimization';
import { getViewportOptimizedDimensions } from '@/utils/cloudinary-optimizer';

/**
 * FastVideo Component
 * Drop-in replacement for <video> with automatic optimization
 *
 * @param {Object} props
 * @param {string} props.src - Video source URL
 * @param {string} props.poster - Poster image URL
 * @param {string} props.preset - Size preset (video, hero, fullscreen)
 * @param {boolean} props.autoplay - Autoplay video (muted required)
 * @param {boolean} props.muted - Mute video
 * @param {boolean} props.loop - Loop video
 * @param {boolean} props.controls - Show controls
 * @param {boolean} props.playsInline - Enable inline playback on mobile
 * @param {string} props.preload - Preload strategy: 'none', 'metadata', 'auto'
 * @param {string} props.fetchpriority - Fetch priority: 'high', 'low', 'auto'
 * @param {boolean} props.lazy - Enable lazy loading
 * @param {string} props.className - CSS classes
 * @param {Function} props.onLoad - Load callback
 * @param {Function} props.onPlay - Play callback
 */
export default function FastVideo({
  src,
  poster,
  preset = 'video',
  autoplay = false,
  muted = true,
  loop = false,
  controls = false,
  playsInline = true,
  preload = 'metadata',
  fetchpriority = 'auto',
  lazy = true,
  className = '',
  onLoad,
  onPlay,
  ...props
}) {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Get optimized video configuration
  const videoDimensions = getViewportOptimizedDimensions(preset);
  const { url: optimizedVideoUrl, shouldLoad: shouldLoadVideo } = useAdaptiveVideo(
    src,
    { width: videoDimensions.width }
  );

  // Lazy loading
  const { ref: containerRef, isVisible } = useLazyLoad({
    triggerOnce: true,
    threshold: 0.01
  });

  const shouldRender = !lazy || isVisible;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldRender || !shouldLoadVideo) return;

    // Enable range request support (allows seeking before full download)
    video.setAttribute('crossorigin', 'anonymous');

    const handleCanPlay = () => {
      setIsLoaded(true);
      onLoad?.();
      console.log('✅ Video ready to play:', {
        src: optimizedVideoUrl.split('/').pop(),
        dimensions: videoDimensions,
        buffered: video.buffered.length > 0 ? video.buffered.end(0) : 0
      });
    };

    const handlePlay = () => {
      onPlay?.();
    };

    const handleError = (e) => {
      console.warn('⚠️ Video load error:', e);
      setError(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('error', handleError);

    // Preload strategy optimization
    if (fetchpriority === 'high') {
      // For critical videos, use auto preload
      video.preload = 'auto';
    } else if (isVisible) {
      // For visible videos, load metadata
      video.preload = 'metadata';
    } else {
      // For off-screen videos, defer loading
      video.preload = 'none';
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('error', handleError);
    };
  }, [shouldRender, shouldLoadVideo, optimizedVideoUrl, videoDimensions, fetchpriority, isVisible, onLoad, onPlay]);

  // Don't load video on poor connections
  if (!shouldLoadVideo) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {poster && (
          <img
            src={poster}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {shouldRender ? (
        <>
          {/* Optimized video element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={poster}
            autoPlay={autoplay}
            muted={muted}
            loop={loop}
            controls={controls}
            playsInline={playsInline}
            preload={preload}
            // @ts-ignore - fetchpriority is valid but TypeScript may not recognize it
            fetchpriority={fetchpriority}
            {...props}
          >
            <source src={optimizedVideoUrl} type="video/mp4" />
            {poster && (
              <img src={poster} alt="Video fallback" />
            )}
          </video>

          {/* Loading indicator */}
          {!isLoaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Error state */}
          {error && poster && (
            <img
              src={poster}
              alt="Video unavailable"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </>
      ) : (
        // Placeholder while not visible
        <div className="w-full h-full bg-gray-800/20 animate-pulse" />
      )}
    </div>
  );
}
