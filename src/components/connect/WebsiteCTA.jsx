import React from 'react';
import { motion } from 'framer-motion';

export default function WebsiteCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/roman-army-painting.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] bg-repeat" />

      {/* Content */}
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-white text-sm font-semibold">Exclusive Offer</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Ready to Transform Your Marketing with AI?
            </h3>

            <p className="text-white/90 text-base md:text-lg leading-relaxed">
              Explore our full suite of AI-powered marketing tools and automation solutions designed to 10x your growth.
            </p>
          </div>

          {/* CTA Button */}
          <motion.a
            href="https://www.disruptorsmedia.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-black font-bold text-lg rounded-xl shadow-2xl hover:shadow-white/50 transition-all flex items-center gap-2 group flex-shrink-0"
          >
            Visit Our Website
          </motion.a>
        </div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 pt-6 border-t border-white/20"
        >
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {[
              "Free Growth Audit",
              "AI Tools Library",
              "Case Studies",
              "Marketing Resources"
            ].map((badge, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
