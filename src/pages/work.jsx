
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
    <div className="min-h-screen bg-gray-50">
      <DynamicBackground pageContext="work" intensity={0.8}>
        <div>
          {/* Page Title */}
          <PageTitle title="WORK" />

          {/* Header Section */}
          <BlurSection>
            <section className="py-8 sm:py-12 text-center">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-white/40"
                >
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                  Real Clients. Real Results.
                </h1>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6">
                  Growth Systems That Speak for Themselves
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  We don't just create campaigns—we build growth infrastructure that delivers measurable results. Here's how we've helped real businesses simplify, scale, and succeed using the power of strategy + automation.
                </p>
              </motion.div>
            </div>
          </section>
        </BlurSection>

        {/* Bento Grid Portfolio */}
        <BlurSection blurAmount={4}>
          <section className="py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-white/40"
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
                    <Link to={createPageUrl("free-business-audit")}>Get a Free Business Audit</Link>
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
