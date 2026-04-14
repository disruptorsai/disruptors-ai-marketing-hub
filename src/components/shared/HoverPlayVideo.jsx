import React, { useRef, useState } from 'react';

/**
 * HoverPlayVideo - A simplified video component that displays as still image and plays on hover
 *
 * @param {string} videoSrc - Cloudinary video URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 */
export default function HoverPlayVideo({
  videoSrc,
  alt = '',
  className = ''
}) {
  const videoRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0; // Start from beginning
      video.play().catch(err => {
        console.warn('Video play failed:', err);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0; // Reset to beginning
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover"
        aria-label={alt}
        muted
        playsInline
        preload="metadata"
        loop
      />
    </div>
  );
}
