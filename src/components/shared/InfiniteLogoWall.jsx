import React from 'react';
import { motion } from 'framer-motion';

/**
 * InfiniteLogoWall - Full-screen infinite scrolling wall of client logos
 * Features:
 * - Infinite horizontal scrolling animation
 * - Multiple rows with alternating directions
 * - Full-screen coverage
 * - Smooth, slow animation on load
 */

export default function InfiniteLogoWall({ items }) {
  // Extract unique logos from case studies
  const logos = items
    .filter(item => item.logo)
    .map(item => ({
      url: item.logo,
      alt: item.client,
      name: item.client
    }));

  // Create 8-10 rows of logos for fullscreen coverage
  const rows = Array.from({ length: 8 }, (_, rowIndex) => {
    // Each row repeats logos many times for infinite effect
    const repeatedLogos = Array.from({ length: 15 }, () => logos).flat();

    return {
      id: rowIndex,
      logos: repeatedLogos,
      direction: rowIndex % 2 === 0 ? 'left' : 'right', // Alternate directions
      speed: 60 + (rowIndex * 5) // Varying speeds for parallax effect
    };
  });

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-50">
      <div className="flex flex-col h-full justify-evenly">
        {rows.map((row) => (
          <div key={row.id} className="flex-shrink-0 overflow-hidden">
            <motion.div
              className="flex gap-12 items-center whitespace-nowrap"
              animate={{
                x: row.direction === 'left' ? [0, -2000] : [-2000, 0],
              }}
              transition={{
                duration: row.speed,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {row.logos.map((logo, index) => (
                <div
                  key={`${row.id}-${index}`}
                  className="flex-shrink-0 w-48 h-24 flex items-center justify-center bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={logo.url}
                    alt={logo.alt}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
