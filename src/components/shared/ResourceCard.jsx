import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';

/**
 * ResourceCard - App store style card for individual tools/resources
 * @param {Object} props
 * @param {string} props.title - Tool/resource name
 * @param {string} props.description - Brief description
 * @param {string} props.category - Category tag (e.g., "AI Tools", "Analytics")
 * @param {string} props.image - Image URL or placeholder
 * @param {string} props.icon - Lucide icon component
 * @param {boolean} props.comingSoon - Whether tool is locked/coming soon
 * @param {Function} props.onClick - Click handler (opens waitlist modal)
 */
export default function ResourceCard({
  title,
  description,
  category,
  image,
  icon: Icon,
  comingSoon = true,
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
        {/* App Icon - No Border, Clean Drop Shadow */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-contain rounded-3xl group-hover:scale-110 transition-transform duration-300"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))'
              }}
            >
              {Icon && <Icon className="w-16 h-16 text-[#FFD700]/50" strokeWidth={1.5} />}
            </div>
          )}
        </div>

        {/* Title on Hover - Appears Below Icon */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          <h3 className="text-sm font-semibold text-white bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            {title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
