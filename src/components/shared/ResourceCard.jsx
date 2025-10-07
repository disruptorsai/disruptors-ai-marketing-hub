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
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* Card Container */}
      <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#FFD700]/20 transition-all duration-300 h-full border border-white/10 hover:border-[#FFD700]/50">

        {/* Image/Thumbnail Section */}
        <div className="relative h-48 bg-gradient-to-br from-gray-900/50 to-black/70 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {Icon && <Icon className="w-20 h-20 text-[#FFD700]/30" strokeWidth={1.5} />}
            </div>
          )}

          {/* Coming Soon Badge */}
          {comingSoon && (
            <div className="absolute top-3 right-3 bg-[#FFD700] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Coming Soon
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white/90 border border-white/20">
            {category}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">
            {title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-sm font-bold text-[#FFD700] group-hover:text-white transition-colors uppercase tracking-wide">
              {comingSoon ? 'Join Waitlist' : 'Learn More'}
            </span>
            <ArrowRight className="w-5 h-5 text-[#FFD700] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-[#FFD700]/5 to-[#FFD700]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}
