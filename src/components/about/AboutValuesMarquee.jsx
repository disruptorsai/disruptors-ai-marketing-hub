import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Users,
  Award,
  Zap,
  Heart,
  Lightbulb,
  Shield
} from 'lucide-react';

export default function AboutValuesMarquee() {
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Drag to scroll functionality
  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    const handleMouseDown = (e) => {
      setIsDragging(true);
      setStartX(e.pageX - slider.offsetLeft);
      setScrollLeft(slider.scrollLeft);
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  const values = [
    {
      icon: Target,
      label: "Results-Driven",
      stat: "300% Avg ROI"
    },
    {
      icon: Heart,
      label: "Human-First AI",
      stat: "AI + Heart"
    },
    {
      icon: TrendingUp,
      label: "Growth Focused",
      stat: "10x Faster"
    },
    {
      icon: Users,
      label: "Local Expertise",
      stat: "SLC Based"
    },
    {
      icon: Zap,
      label: "AI Powered",
      stat: "24/7 Systems"
    },
    {
      icon: Award,
      label: "Industry Leaders",
      stat: "Expert Team"
    },
    {
      icon: Lightbulb,
      label: "Innovation",
      stat: "Cutting Edge"
    },
    {
      icon: Shield,
      label: "Transparency",
      stat: "We Teach"
    }
  ];

  // Triple the array for smooth scrolling
  const marqueeItems = [...values, ...values, ...values];

  return (
    <div className="py-16 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 overflow-hidden relative">
      {/* Industrial grid pattern background */}
      <div className="absolute inset-0 opacity-[0.15]" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Diagonal stripes subtle overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
      }} />

      {/* Top yellow accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

      <div className="relative">
        {/* Gradient fade edges - matching the gray background */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-100 via-gray-100/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-100 via-gray-100/80 to-transparent z-10 pointer-events-none" />

        {/* Draggable scrollable container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex gap-8 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content' }}>
            {marqueeItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="flex-shrink-0 group"
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl px-8 py-5 border border-yellow-500/20 shadow-xl overflow-hidden">
                    {/* Animated gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Yellow glow effect */}
                    <div className="absolute inset-0 bg-yellow-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative flex items-center space-x-4">
                      {/* Icon */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-md group-hover:bg-yellow-500/30 transition-all duration-300" />
                        <div className="relative bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/30 group-hover:border-yellow-500/50 transition-all duration-300">
                          <Icon className="w-7 h-7 text-yellow-500 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-left">
                        <div className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors duration-300">{item.label}</div>
                        <div className="text-xs font-semibold text-yellow-500/80 group-hover:text-yellow-500 transition-colors duration-300">{item.stat}</div>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom yellow accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
    </div>
  );
}
