import React from 'react';
import { motion } from 'framer-motion';

/**
 * Large page title component for main pages
 * Displays page name in large, bold text at the top of the page
 * @param {string} title - The page title to display
 * @param {boolean} light - If true, uses white text (for dark backgrounds)
 */
export default function PageTitle({ title, light = false }) {
  return (
    <section className="w-full bg-transparent pt-8 pb-4 sm:pt-12 sm:pb-6 relative z-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black ${light ? 'text-white' : 'text-black'} tracking-tight text-center uppercase`}
        >
          {title}
        </motion.h1>
      </div>
    </section>
  );
}
