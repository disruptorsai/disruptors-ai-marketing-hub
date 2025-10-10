import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DualCTABlock from '../components/shared/DualCTABlock';
import PageTitle from '../components/shared/PageTitle';
import BentoGrid from '../components/shared/BentoGrid';
import DynamicBackground, { BlurSection } from '../components/shared/DynamicBackground';
import { caseStudies } from '@/data/caseStudies';

export default function Work() {
  return (
    <div className="min-h-screen">
      <DynamicBackground pageContext="work" intensity={0.8}>
        <div>
          {/* Premium Hero Section */}
          <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Gold Accent Lines */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Kicker */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-block mb-6"
                >
                  <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-yellow-500 text-sm font-bold tracking-wider uppercase">Portfolio</span>
                  </div>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 tracking-tight"
                >
                  <span className="text-white">Real Clients.</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500">
                    Real Results.
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
                >
                  Growth systems that speak for themselves. See how we've helped businesses simplify, scale, and succeed with AI-powered marketing.
                </motion.p>

                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="flex flex-wrap justify-center gap-8 sm:gap-12"
                >
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-black text-yellow-500 mb-2">50+</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Projects Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-black text-yellow-500 mb-2">10M+</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">In Client Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-black text-yellow-500 mb-2">300%</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Avg ROI</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex flex-col items-center space-y-2 text-yellow-500">
                <span className="text-xs font-medium tracking-wide uppercase">Scroll to explore</span>
                <div className="w-px h-12 bg-yellow-500/50 animate-pulse"></div>
              </div>
            </div>
          </section>

        {/* Bento Grid Portfolio */}
        <BlurSection blurAmount={4}>
          <section className="py-8 sm:py-12 overflow-x-hidden">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              <BentoGrid items={caseStudies} />
            </div>
          </section>
        </BlurSection>

        {/* Mini CTA Block */}
        <BlurSection>
          <section className="py-8 sm:py-12 text-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-white/20"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Wondering What This Could Look Like for Your Business?
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Let's audit your systems and uncover the untapped growth potential in your pipeline, marketing, and operations.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button asChild size="lg" className="text-lg px-8 py-3">
                    <Link to={createPageUrl("book-strategy-session")}>Book a Free Strategy Session</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                    <Link to={createPageUrl("marketing-audit")}>Get a Free Marketing Consultation</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </BlurSection>

        {/* Final CTA Block */}
        <section className="bg-gray-900 text-white relative z-10">
          <DualCTABlock />
        </section>
        </div>
      </DynamicBackground>
    </div>
  );
}
