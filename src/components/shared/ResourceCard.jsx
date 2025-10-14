import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import LazyImage from './LazyImage';

/**
 * ResourceCard - App store style card for individual tools/resources
 * Optimized with WebP support and lazy loading for 90%+ size reduction
 *
 * @param {Object} props
 * @param {string} props.title - Tool/resource name
 * @param {string} props.description - Brief description
 * @param {string} props.category - Category tag (e.g., "AI Tools", "Analytics")
 * @param {string} props.image - Image URL or placeholder (WebP recommended)
 * @param {string} props.fallbackImage - Fallback PNG/JPG for older browsers
 * @param {string} props.icon - Lucide icon component
 * @param {boolean} props.isLive - Whether tool is live and accessible
 * @param {Function} props.onClick - Click handler (opens waitlist modal or navigates)
 */
export default function ResourceCard({
  title,
  description,
  category,
  image,
  fallbackImage,
  icon: Icon,
  isLive = false,
  onClick
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer relative"
      onClick={onClick}
    >
      {/* Clean App Icon Only */}
      <div className="flex flex-col items-center text-center">
        {/* App Icon - Large, No Border, Clean Drop Shadow - Now with LazyImage */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
          {image ? (
            <div className="w-full h-full opacity-60 group-hover:opacity-85 group-hover:scale-110 transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5))'
              }}
            >
              <LazyImage
                src={image}
                fallbackSrc={fallbackImage}
                alt={title}
                className="w-full h-full object-contain rounded-3xl"
                aspectRatio="1/1"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center opacity-60 group-hover:opacity-85 group-hover:scale-110 transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5))'
              }}
            >
              {Icon && <Icon className="w-20 h-20 md:w-24 md:h-24 text-[#FFD700]/50" strokeWidth={1.5} />}
            </div>
          )}

          {/* Live Badge */}
          {isLive && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
              LIVE
            </div>
          )}
        </div>

        {/* Title on Hover - Appears Below Icon */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
          <h3 className="text-base font-bold text-white bg-black/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#FFD700]/30">
            {title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
