import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target, Zap, CheckCircle, ArrowUpRight, BarChart3, Globe } from 'lucide-react';

/**
 * CaseStudySection - High-end healthcare case studies with premium styling
 * Features magazine-style layout with frosted glass cards and animated metrics
 */

// Metric card for displaying key results
const MetricCard = ({ icon: Icon, value, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-yellow-400/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 bg-yellow-400/10 rounded-lg">
        <Icon className="w-5 h-5 text-yellow-600" />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  </motion.div>
);

// Featured flagship case study (hero card)
const FeaturedCaseStudy = ({ caseStudy }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    viewport={{ once: true }}
    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12 shadow-2xl border border-yellow-400/30 group"
  >
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-5">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />
    </div>

    {/* Badge */}
    <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-yellow-400/30">
      <Target className="w-4 h-4" />
      Flagship Case Study
    </div>

    <div className="relative z-10">
      {/* Title */}
      <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors duration-300">
        {caseStudy.title}
      </h3>

      {/* Approach & Execution */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Approach
          </h4>
          <p className="text-gray-300 leading-relaxed">{caseStudy.approach}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Execution
          </h4>
          <p className="text-gray-300 leading-relaxed">{caseStudy.execution}</p>
        </div>
      </div>

      {/* Results - Large featured metrics */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/20">
        <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-yellow-400" />
          Results That Speak Volumes
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {caseStudy.results.map((result, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-4 bg-white/5 rounded-xl border border-yellow-400/10 hover:border-yellow-400/30 transition-all duration-300"
            >
              <result.icon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{result.value}</p>
              <p className="text-xs text-gray-400">{result.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Impact statement */}
      {caseStudy.impact && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-6 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6"
        >
          <p className="text-white italic leading-relaxed">"{caseStudy.impact}"</p>
        </motion.div>
      )}
    </div>
  </motion.div>
);

// Standard case study card
const CaseStudyCard = ({ caseStudy, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40 hover:shadow-2xl hover:border-yellow-400/40 transition-all duration-300 group h-full flex flex-col"
  >
    {/* Header */}
    <div className="mb-4">
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300 flex items-start gap-2">
        <ArrowUpRight className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
        <span>{caseStudy.title}</span>
      </h3>
    </div>

    {/* Approach */}
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-yellow-600 mb-2 flex items-center gap-1">
        <Zap className="w-3 h-3" />
        Approach
      </h4>
      <p className="text-gray-700 text-sm leading-relaxed">{caseStudy.approach}</p>
    </div>

    {/* Execution */}
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-yellow-600 mb-2 flex items-center gap-1">
        <Target className="w-3 h-3" />
        Execution
      </h4>
      <p className="text-gray-700 text-sm leading-relaxed">{caseStudy.execution}</p>
    </div>

    {/* Results */}
    <div className="mt-auto pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
        <CheckCircle className="w-3 h-3 text-yellow-600" />
        Key Results
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {caseStudy.results.slice(0, 4).map((result, idx) => (
          <div
            key={idx}
            className="bg-yellow-50 rounded-lg p-2 border border-yellow-100"
          >
            <p className="text-lg font-bold text-gray-900">{result.value}</p>
            <p className="text-xs text-gray-600">{result.label}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

// Main case study section component
export default function CaseStudySection() {
  const caseStudies = [
    {
      title: 'Wellness & Hormone Therapy Clinic',
      approach: 'Focused Google Search campaigns around hormone therapy, intimacy wellness, and weight management, with retargeting for non-converting site visitors.',
      execution: 'Custom landing pages with patient testimonials and booking flows optimized for mobile.',
      results: [
        { icon: TrendingUp, value: '5.8%', label: 'CTR (industry avg. ~3%)' },
        { icon: DollarSign, value: '$72', label: 'Cost Per Lead' },
        { icon: Target, value: '11%', label: 'Conversion Rate' },
        { icon: BarChart3, value: '3.5X', label: 'ROI in 90 Days' },
      ],
    },
    {
      title: 'Telehealth Provider',
      approach: 'Always-on campaigns targeting urgent care and specialty telehealth, benchmarked at 25,000 impressions and 5+ weekly leads.',
      execution: 'Integrated with content marketing and SEO to reinforce messaging.',
      results: [
        { icon: TrendingUp, value: '65K+', label: 'Avg Weekly Impressions' },
        { icon: Users, value: '15-20', label: 'Weekly Leads (3-4X target)' },
        { icon: DollarSign, value: '$58', label: 'Cost Per Lead' },
        { icon: BarChart3, value: '4X', label: 'Return on Ad Spend' },
      ],
    },
    {
      title: 'Aesthetic & Body Contouring Clinic',
      approach: 'Multi-channel Google Ads across Search, Display, YouTube, and Shopping, timed with seasonal demand (summer prep, New Year promotions).',
      execution: 'Retargeted prior visitors with promotional offers and educational video ads.',
      results: [
        { icon: TrendingUp, value: '6.2%', label: 'Click-Through Rate' },
        { icon: Users, value: '350+', label: 'Consult Requests (6 months)' },
        { icon: DollarSign, value: '$210K+', label: 'Treatment Sales' },
        { icon: BarChart3, value: '3.3X', label: 'Return on Ad Spend' },
      ],
    },
    {
      title: 'Specialized Medical Services Practice',
      approach: 'Ran targeted Google Ads alongside an aggressive SEO/content push. Overcame ad restrictions in sensitive medical categories.',
      execution: 'Built keyword-rich content, secured backlinks, and retargeted high-intent audiences.',
      results: [
        { icon: TrendingUp, value: '+220%', label: 'Organic Traffic (6 months)' },
        { icon: Users, value: '200+', label: 'New Inquiries' },
        { icon: DollarSign, value: '$81', label: 'Cost Per Lead' },
        { icon: BarChart3, value: '3X', label: 'Return on Ad Spend' },
      ],
    },
    {
      title: 'Regional Multi-Location Clinic',
      approach: 'Performance Max campaigns with quizzes and incentives as lead magnets. Budget started small ($10/day) and scaled regionally.',
      execution: 'Landing pages pixeled for retargeting across Google and Meta.',
      results: [
        { icon: TrendingUp, value: '7.1%', label: 'Click-Through Rate' },
        { icon: Users, value: '450+', label: 'Leads Across 3 Locations' },
        { icon: DollarSign, value: '$180K+', label: 'Patient Package Sales' },
        { icon: BarChart3, value: '4X', label: 'Return on Ad Spend' },
      ],
    },
  ];

  const flagshipCaseStudy = {
    title: 'Enterprise-Scale Healthcare Campaign',
    approach: 'National-level Google Ads program with a monthly ad spend of $2M, targeting multiple service lines and patient demographics across the U.S.',
    execution: 'Comprehensive campaign mix including Search, Display, YouTube, and programmatic retargeting. Performance was tracked daily with advanced attribution modeling and conversion-optimized landing funnels.',
    results: [
      { icon: DollarSign, value: '$24M', label: 'Annual Ad Spend' },
      { icon: TrendingUp, value: '$300M', label: 'Annual Revenue Generated' },
      { icon: BarChart3, value: '12.5X', label: 'Return on Ad Spend' },
      { icon: Globe, value: 'National', label: 'Market Dominance' },
    ],
    impact: 'Established the client as one of the top providers in their category nationwide, with dominance across paid search in all major markets',
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Proven Results in <span className="text-yellow-600">Healthcare Marketing</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real campaigns, real data, real growth. See how we've helped healthcare providers achieve exceptional ROI through strategic digital marketing.
          </p>
        </motion.div>

        {/* Flagship Case Study */}
        <div className="mb-12">
          <FeaturedCaseStudy caseStudy={flagshipCaseStudy} />
        </div>

        {/* Grid of Case Studies */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((caseStudy, index) => (
            <CaseStudyCard
              key={index}
              caseStudy={caseStudy}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-gray-700 mb-4 font-medium">
            Ready to achieve similar results for your practice?
          </p>
          <div className="inline-flex items-center gap-2 bg-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-700 transition-colors duration-300 cursor-pointer shadow-lg hover:shadow-xl">
            Let's Build Your Success Story
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
