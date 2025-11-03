import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DualCTABlock from '../components/shared/DualCTABlock';
import PageTitle from '../components/shared/PageTitle';
import BentoGrid from '../components/shared/BentoGrid';
import CaseStudySection from '../components/shared/CaseStudySection';
import DynamicBackground, { BlurSection } from '../components/shared/DynamicBackground';
import { caseStudies } from '@/data/caseStudies';

/**
 * Work Portfolio Page - Rebuilt from scratch
 * Showcases client case studies in a Bento Grid layout
 * Plus premium healthcare case studies section with detailed metrics
 */
export default function Work() {
  return (
    <DynamicBackground pageContext="work" intensity={0.8}>
      <div className="min-h-screen">
        {/* Page Title */}
        <PageTitle title="OUR WORK" />

        {/* Success Stories Section - Detailed Case Studies */}
        <BlurSection blurAmount={3}>
          <CaseStudySection />
        </BlurSection>

        {/* Hero Section - Moved after Case Studies */}
        <BlurSection>
          <section className="py-8 sm:py-12 text-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-white/40"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4">
                  Real Clients. <span className="text-yellow-600">Real Results.</span>
                </h1>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6">
                  Growth Systems That Speak for Themselves
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  We don't just create campaigns—we build growth infrastructure that delivers measurable results. See how we've helped businesses simplify, scale, and succeed with AI-powered marketing.
                </p>
              </motion.div>
            </div>
          </section>
        </BlurSection>

        {/* Portfolio Grid - Client Showcase */}
        <BlurSection blurAmount={4}>
          <section className="py-8 sm:py-12">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <BentoGrid items={caseStudies} />
            </div>
          </section>
        </BlurSection>

        {/* Footer CTA */}
        <section className="bg-gray-900 text-white relative z-10">
          <DualCTABlock cta2_text="" />
        </section>
      </div>
    </DynamicBackground>
  );
}
