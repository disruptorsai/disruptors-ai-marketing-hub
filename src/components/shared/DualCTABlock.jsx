
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DualCTABlock({
  title = "Ready to grow?",
  cta1_text = "Book a Free Strategy Session",
  cta1_link = "book-strategy-session",
  cta2_text = "Get a Free AI Audit",
  cta2_link = "free-business-audit",
  backgroundImage = "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/ui/backgrounds/renaissance-fresco-pyramids.png",
  className = ""
}) {
  return (
    <div className={`relative text-white overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* 85% Black Overlay */}
      <div className="absolute inset-0 z-[1] bg-black/85"></div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Title */}
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black mb-8 tracking-tight">
            {title}
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button asChild size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 h-auto bg-yellow-600 text-gray-900 hover:bg-yellow-500 font-bold uppercase tracking-wide shadow-2xl hover:shadow-yellow-600/50 transition-all duration-300 w-full sm:w-auto">
                <Link to={createPageUrl(cta1_link)}>{cta1_text}</Link>
              </Button>
            </motion.div>
            {cta2_text && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 h-auto bg-transparent border-2 border-white/80 text-white hover:bg-white hover:text-gray-900 font-bold uppercase tracking-wide transition-all duration-300 w-full sm:w-auto">
                  <Link to={createPageUrl(cta2_link)}>{cta2_text}</Link>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
