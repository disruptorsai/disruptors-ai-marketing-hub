import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * ReadingProgress Component
 *
 * Displays a progress bar at the top of the viewport showing how far
 * the user has scrolled through the article content.
 *
 * Features:
 * - Smooth spring animation
 * - Fixed positioning at top
 * - Golden gradient color with glow effect
 * - Responds to scroll events
 * - Mobile-friendly
 */
export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      setProgress(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 transform-origin-left z-50 shadow-lg shadow-yellow-500/50"
        style={{ scaleX }}
      />

      {/* Golden shimmer effect */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white/40 to-transparent transform-origin-left z-[51] pointer-events-none"
        style={{ scaleX }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </>
  );
}
