import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

/**
 * Audit-Proven Growth Section
 * Full-screen hero-style section emphasizing data-driven, audit-first approach
 * Inspired by "Most Agencies Guess. We Audit, Prove, and Guarantee."
 */
export default function AuditProvenGrowth() {
  const createPageUrl = (page) => `/${page}`;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/work/work-hero-background.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay - Dark with blue tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-[#2C6BAA]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Message */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Eyebrow */}
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-[#C96F4C] text-white text-sm font-bold uppercase tracking-wider">
                Data-Driven Results
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Most Agencies Guess.
              <br />
              <span className="text-[#C9A53B]">We Prove.</span>
            </h2>

            {/* Underline accent */}
            <div className="w-32 h-1 bg-[#C9A53B] mb-8" />

            {/* CTA Button */}
            <Link
              to={createPageUrl('marketing-audit')}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#C96F4C] hover:bg-[#B35D3A] text-white text-lg font-bold uppercase transition-all duration-300 shadow-lg hover:shadow-2xl group"
            >
              <span>Get Your Free Audit</span>
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
            </Link>
          </motion.div>

          {/* Right Column - Supporting Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 lg:p-10"
          >
            <h3 className="text-3xl font-bold text-white mb-6">
              Your Growth Isn't a Gamble—It's Science
            </h3>

            <div className="space-y-6 text-white/90 text-lg leading-relaxed">
              <p>
                Our free marketing audit reveals exactly where your money's being wasted and which opportunities you're missing.
              </p>

              <p>
                Whether you work with us or not, you'll leave with a clear roadmap to profitable growth—backed by real data, not hunches.
              </p>

              {/* Key Points */}
              <div className="space-y-4 mt-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#3C7A6A] flex-shrink-0 mt-1" />
                  <p className="text-white">
                    <span className="font-semibold">Audit first, strategize second.</span> No guesswork, no generic plans.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#3C7A6A] flex-shrink-0 mt-1" />
                  <p className="text-white">
                    <span className="font-semibold">Real numbers, real impact.</span> We show you exactly what's broken and how to fix it.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#3C7A6A] flex-shrink-0 mt-1" />
                  <p className="text-white">
                    <span className="font-semibold">No fluff, no long-term lock-ins.</span> Just actionable insights you can use today.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C96F4C] via-[#C9A53B] to-[#3C7A6A] z-20" />
    </section>
  );
}
