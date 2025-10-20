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
 * - Indigo gradient color
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

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform-origin-left z-50"
      style={{ scaleX }}
    />
  );
}
