import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';

/**
 * Stop Wasting Budget Section
 * Full-screen hero-style section emphasizing budget waste and audit value
 * Inspired by "Most Marketing Budgets Are Wasted—Let's Fix That"
 */
export default function StopWastingBudget() {
  const createPageUrl = (page) => `/${page}`;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/about/about-hero-background.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay - Dark with terracotta tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/85 to-[#C96F4C]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Eyebrow */}
            <div className="mb-6 flex flex-wrap gap-3">
              <span className="inline-block px-4 py-2 bg-[#C96F4C] text-white text-sm font-bold uppercase tracking-wider">
                AI-Powered Marketing Intelligence
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Most Marketing Budgets Are{' '}
              <span className="text-[#C96F4C] relative">
                Wasted
                <span className="absolute bottom-2 left-0 right-0 h-1 bg-[#C96F4C]/40" />
              </span>
            </h2>

            <h3 className="text-3xl sm:text-4xl font-bold text-[#C9A53B] mb-8">
              Let's Fix That
            </h3>

            {/* Underline accent */}
            <div className="w-32 h-1 bg-[#C9A53B] mb-8" />

            {/* Supporting Text */}
            <div className="mb-10 space-y-4">
              <p className="text-xl text-white/90 leading-relaxed">
                After analyzing hundreds of businesses, we've found that{' '}
                <span className="font-bold text-[#C96F4C]">70%+ of marketing spend goes to waste</span>.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                We'll show you exactly where your budget is leaking—and how to plug the holes fast.
              </p>
            </div>

            {/* CTA Button */}
            <Link
              to={createPageUrl('marketing-audit')}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#C96F4C] hover:bg-[#B35D3A] text-white text-lg font-bold uppercase transition-all duration-300 shadow-lg hover:shadow-2xl group"
            >
              <span>Get Your Free Marketing Assessment</span>
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
            </Link>

            {/* Trust Indicator */}
            <p className="mt-6 text-sm text-white/60 uppercase tracking-wide">
              No strings attached • No sales pitch • Just pure value
            </p>
          </motion.div>

          {/* Right Column - Stats & Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Stat Cards */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#C96F4C]/20 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-[#C96F4C]" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Identify Budget Leaks
                  </h4>
                  <p className="text-white/80 leading-relaxed">
                    Discover which campaigns, channels, and tactics are burning cash with zero ROI.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#3C7A6A]/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-[#3C7A6A]" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Find Untapped Opportunities
                  </h4>
                  <p className="text-white/80 leading-relaxed">
                    Uncover high-impact growth channels your competitors are missing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#C9A53B]/20 rounded-lg">
                  <DollarSign className="w-8 h-8 text-[#C9A53B]" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Get a Clear Roadmap
                  </h4>
                  <p className="text-white/80 leading-relaxed">
                    Walk away with prioritized action steps that actually move the needle.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-4 bg-gradient-to-r from-[#2C6BAA]/20 to-[#3C7A6A]/20 backdrop-blur-md border border-white/20 rounded-xl p-6"
            >
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C9A53B] mb-2">AI-Powered</div>
                <div className="text-white/80 text-sm uppercase tracking-wider">
                  Data-Driven Insights in Minutes
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2C6BAA] via-[#C96F4C] to-[#C9A53B] z-20" />
    </section>
  );
}
