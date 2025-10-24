import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Rocket, ArrowRight } from 'lucide-react';

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
          <source src="/videos/full-animation-scrub.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] bg-repeat" />

      {/* Content */}
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Icon */}
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-2xl"
          >
            <Rocket className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>

          {/* Text Content */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4 text-yellow-300" />
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
            className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-xl shadow-2xl hover:shadow-white/50 transition-all flex items-center gap-2 group flex-shrink-0"
          >
            Visit Our Website
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

      {/* Floating Sparkles */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </motion.div>
      </div>
    </motion.div>
  );
}
