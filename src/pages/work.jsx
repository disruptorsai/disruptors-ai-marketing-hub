import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DualCTABlock from '../components/shared/DualCTABlock';
import PageTitle from '../components/shared/PageTitle';
import BentoGridNew from '../components/shared/BentoGridNew';
import CaseStudySection from '../components/shared/CaseStudySection';
import DynamicBackground, { BlurSection } from '../components/shared/DynamicBackground';
import { caseStudies } from '@/data/caseStudies';

/**
 * Work Portfolio Page - Rebuilt from scratch
 * Showcases client case studies in a Bento Grid layout
 * Plus premium healthcare case studies section with detailed metrics
 *
 * DEBUG MODE ACTIVE: Comprehensive logging for troubleshooting load issues
 */
export default function Work() {
  const [debugInfo, setDebugInfo] = useState({
    mounted: false,
    renderCount: 0,
    caseStudiesLoaded: false,
    timestamp: Date.now()
  });

  // Track component lifecycle
  useEffect(() => {
    console.group('🔍 [WORK PAGE] Component Mount');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Case Studies Available:', !!caseStudies);
    console.log('Case Studies Count:', caseStudies?.length || 0);
    console.log('Browser Cache Status:', {
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage)
    });
    console.log('Document Ready State:', document.readyState);
    console.log('Window Performance:', {
      navigation: performance.navigation?.type,
      timing: {
        domContentLoaded: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart,
        domComplete: performance.timing?.domComplete - performance.timing?.navigationStart
      }
    });
    console.groupEnd();

    setDebugInfo(prev => ({
      ...prev,
      mounted: true,
      caseStudiesLoaded: !!(caseStudies && caseStudies.length > 0),
      renderCount: prev.renderCount + 1
    }));

    // Log when DOM is fully loaded
    if (document.readyState === 'complete') {
      console.log('✅ [WORK PAGE] DOM already complete');
    } else {
      window.addEventListener('load', () => {
        console.log('✅ [WORK PAGE] Window loaded');
      });
    }

    return () => {
      console.log('❌ [WORK PAGE] Component Unmounting');
    };
  }, []);

  // Track re-renders
  useEffect(() => {
    if (debugInfo.renderCount > 0) {
      console.log(`🔄 [WORK PAGE] Re-render #${debugInfo.renderCount}`);
    }
  }, [debugInfo.renderCount]);

  // Log case studies data
  useEffect(() => {
    console.group('📊 [WORK PAGE] Case Studies Data');
    console.log('Total Case Studies:', caseStudies?.length);
    console.log('First 3 Case Studies:', caseStudies?.slice(0, 3).map(cs => ({
      name: cs.name,
      client: cs.client,
      hasHeroImage: !!cs.heroImage,
      hasLogo: !!cs.logo,
      hasVideo: !!cs.video
    })));
    console.groupEnd();
  }, []);

  console.log('🎨 [WORK PAGE] Rendering...', { debugInfo });

  return (
    <DynamicBackground pageContext="work" intensity={0.8}>
      <div className="min-h-screen">
        {/* Page Title */}
        <PageTitle title="OUR WORK" />

        {/* Hero Section - Now at top */}
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
              <BentoGridNew items={caseStudies} />
            </div>
          </section>
        </BlurSection>

        {/* Success Stories Section - Detailed Case Studies */}
        <BlurSection blurAmount={3}>
          <CaseStudySection />
        </BlurSection>

        {/* Footer CTA */}
        <section className="bg-gray-900 text-white relative z-10">
          <DualCTABlock cta2_text="" />
        </section>
      </div>
    </DynamicBackground>
  );
}
