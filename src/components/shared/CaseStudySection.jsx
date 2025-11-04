import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target, Zap, CheckCircle, ArrowUpRight, BarChart3, Globe, X, Maximize2, Calendar, Award } from 'lucide-react';

/**
 * CaseStudySection - Premium case studies with expandable detailed views
 * Features magazine-style layout with frosted glass cards, animated metrics, and modal expansion
 *
 * DEBUG MODE ACTIVE: Comprehensive logging for troubleshooting
 */

// Expanded Case Study Modal
const ExpandedCaseStudyModal = ({ caseStudy, onClose }) => {
  if (!caseStudy) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, type: 'spring', damping: 25 }}
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-10 bg-black/60 backdrop-blur-sm rounded-full p-3 hover:bg-black/80 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-8 clear-both">
          {/* Header with Industry Badge */}
          <div>
            {caseStudy.industry && (
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-yellow-400/30">
                <Award className="w-4 h-4" />
                {caseStudy.industry}
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{caseStudy.title}</h2>
            {caseStudy.subtitle && (
              <p className="text-xl text-gray-300">{caseStudy.subtitle}</p>
            )}
          </div>

          {/* Challenge Section */}
          {caseStudy.challenge && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-yellow-400" />
                The Challenge
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">{caseStudy.challenge}</p>
            </div>
          )}

          {/* Approach & Execution */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Our Approach
              </h3>
              <p className="text-gray-300 leading-relaxed">{caseStudy.approach}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-yellow-400" />
                Execution
              </h3>
              <p className="text-gray-300 leading-relaxed">{caseStudy.execution}</p>
            </div>
          </div>

          {/* Results - Large Metrics */}
          <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 backdrop-blur-md rounded-2xl p-8 border border-yellow-400/30">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              Results That Speak Volumes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {caseStudy.results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="text-center p-6 bg-white/10 rounded-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
                >
                  <result.icon className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                  <p className="text-4xl font-bold text-white mb-2">{result.value}</p>
                  <p className="text-sm text-gray-300">{result.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Impact Statement */}
          {caseStudy.impact && (
            <div className="bg-yellow-400/10 backdrop-blur-sm border-l-4 border-yellow-400 rounded-xl p-6">
              <p className="text-white text-xl italic leading-relaxed">"{caseStudy.impact}"</p>
            </div>
          )}

          {/* Timeline */}
          {caseStudy.timeline && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                Campaign Timeline
              </h3>
              <p className="text-gray-300">{caseStudy.timeline}</p>
            </div>
          )}

          {/* Testimonial */}
          {caseStudy.testimonial && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-yellow-400/20 text-center">
              <p className="text-2xl text-white italic mb-4">"{caseStudy.testimonial}"</p>
              {caseStudy.clientName && (
                <p className="text-gray-400 font-semibold">— {caseStudy.clientName}</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

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
const FeaturedCaseStudy = ({ caseStudy, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    viewport={{ once: true }}
    onClick={onClick}
    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12 shadow-2xl border border-yellow-400/30 group cursor-pointer hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02]"
  >
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-5">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />
    </div>

    {/* Badge & Industry Tag */}
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold border border-yellow-400/30">
        <Target className="w-4 h-4" />
        Flagship Case Study
      </div>
      {caseStudy.industry && (
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
          <Award className="w-4 h-4" />
          {caseStudy.industry}
        </div>
      )}
      {/* Click to expand hint */}
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">
        <Maximize2 className="w-4 h-4" />
        Click to expand
      </div>
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

// Standard case study card - Dark theme with white text
const CaseStudyCard = ({ caseStudy, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
    onClick={onClick}
    className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-md rounded-2xl p-6 shadow-xl border border-yellow-400/30 hover:shadow-2xl hover:border-yellow-400/60 transition-all duration-300 group flex-shrink-0 w-[400px] flex flex-col cursor-pointer hover:scale-105"
  >
    {/* Header with Industry Badge */}
    <div className="mb-4">
      {caseStudy.industry && (
        <div className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-yellow-400/30">
          <Award className="w-3 h-3" />
          {caseStudy.industry}
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300 flex items-start gap-2">
        <ArrowUpRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
        <span>{caseStudy.title}</span>
      </h3>
      {/* Expand hint */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-gray-400 flex items-center gap-1 mt-1">
        <Maximize2 className="w-3 h-3" />
        Click for full case study
      </div>
    </div>

    {/* Approach */}
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-1">
        <Zap className="w-3 h-3" />
        Approach
      </h4>
      <p className="text-gray-300 text-sm leading-relaxed">{caseStudy.approach}</p>
    </div>

    {/* Execution */}
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-1">
        <Target className="w-3 h-3" />
        Execution
      </h4>
      <p className="text-gray-300 text-sm leading-relaxed">{caseStudy.execution}</p>
    </div>

    {/* Results */}
    <div className="mt-auto pt-4 border-t border-gray-700">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1">
        <CheckCircle className="w-3 h-3 text-yellow-400" />
        Key Results
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {caseStudy.results.slice(0, 4).map((result, idx) => (
          <div
            key={idx}
            className="bg-yellow-400/10 rounded-lg p-2 border border-yellow-400/30"
          >
            <p className="text-lg font-bold text-white">{result.value}</p>
            <p className="text-xs text-gray-400">{result.label}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

// Main case study section component
export default function CaseStudySection() {
  const [expandedCaseStudy, setExpandedCaseStudy] = useState(null);
  const scrollContainerRef = React.useRef(null);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeft = React.useRef(0);
  const autoScrollRef = React.useRef(null);

  // Component mount tracking
  React.useEffect(() => {
    console.group('📚 [CASE STUDY SECTION] Component Mount');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Case Studies Count:', caseStudies.length);
    console.log('Flagship Case Study:', flagshipCaseStudy.title);
    console.groupEnd();

    return () => {
      console.log('❌ [CASE STUDY SECTION] Component Unmounting');
    };
  }, []);

  // Auto-scroll functionality
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      console.warn('⚠️ [CASE STUDY SECTION] Scroll container ref not available');
      return;
    }

    console.log('🎬 [CASE STUDY SECTION] Starting auto-scroll animation');

    let scrollDirection = 1; // 1 for right, -1 for left
    const scrollSpeed = 0.5; // pixels per frame

    const autoScroll = () => {
      if (!isDragging.current && container) {
        container.scrollLeft += scrollSpeed * scrollDirection;

        // Reverse direction at ends
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
          scrollDirection = -1;
        } else if (container.scrollLeft <= 10) {
          scrollDirection = 1;
        }
      }
      autoScrollRef.current = requestAnimationFrame(autoScroll);
    };

    autoScrollRef.current = requestAnimationFrame(autoScroll);

    return () => {
      console.log('🛑 [CASE STUDY SECTION] Stopping auto-scroll animation');
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, []);

  // Track modal expansion
  React.useEffect(() => {
    if (expandedCaseStudy) {
      console.log('🔍 [CASE STUDY SECTION] Case study expanded:', expandedCaseStudy.title);
    }
  }, [expandedCaseStudy]);

  // Drag to scroll functionality
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.style.cursor = 'grabbing';
    scrollContainerRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Multiply for faster scroll
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  console.log('🎨 [CASE STUDY SECTION] Rendering...');

  const caseStudies = [
    {
      title: 'Wellness & Hormone Therapy Clinic',
      industry: 'Healthcare',
      challenge: 'Limited online visibility in a competitive wellness market with strict advertising regulations for hormone therapy and sensitive medical services.',
      approach: 'Focused Google Search campaigns around hormone therapy, intimacy wellness, and weight management, with retargeting for non-converting site visitors.',
      execution: 'Custom landing pages with patient testimonials and booking flows optimized for mobile.',
      timeline: '6-month campaign with monthly optimization',
      testimonial: 'The results exceeded our expectations. We went from struggling to get noticed online to becoming the top choice in our region.',
      clientName: 'Clinic Medical Director',
      results: [
        { icon: TrendingUp, value: '5.8%', label: 'CTR (industry avg. ~3%)' },
        { icon: DollarSign, value: '$72', label: 'Cost Per Lead' },
        { icon: Target, value: '11%', label: 'Conversion Rate' },
        { icon: BarChart3, value: '3.5X', label: 'ROI in 90 Days' },
      ],
    },
    {
      title: 'Telehealth Provider',
      industry: 'Healthcare Tech',
      challenge: 'Needed to scale lead generation 4X while maintaining quality and cost-efficiency in a rapidly growing telehealth market.',
      approach: 'Always-on campaigns targeting urgent care and specialty telehealth, benchmarked at 25,000 impressions and 5+ weekly leads.',
      execution: 'Integrated with content marketing and SEO to reinforce messaging.',
      timeline: '12-month ongoing campaign',
      testimonial: 'We tripled our lead targets consistently month after month. The quality of leads has been exceptional.',
      clientName: 'Chief Marketing Officer',
      results: [
        { icon: TrendingUp, value: '65K+', label: 'Avg Weekly Impressions' },
        { icon: Users, value: '15-20', label: 'Weekly Leads (3-4X target)' },
        { icon: DollarSign, value: '$58', label: 'Cost Per Lead' },
        { icon: BarChart3, value: '4X', label: 'Return on Ad Spend' },
      ],
    },
    {
      title: 'Aesthetic & Body Contouring Clinic',
      industry: 'Medical Aesthetics',
      challenge: 'Seasonal demand fluctuations and high competition in aesthetic services required sophisticated multi-channel approach.',
      approach: 'Multi-channel Google Ads across Search, Display, YouTube, and Shopping, timed with seasonal demand (summer prep, New Year promotions).',
      execution: 'Retargeted prior visitors with promotional offers and educational video ads.',
      timeline: '6-month seasonal campaign',
      testimonial: 'The seasonal timing strategy was brilliant. Our consultation bookings were up 250% during peak periods.',
      clientName: 'Practice Owner',
      results: [
        { icon: TrendingUp, value: '6.2%', label: 'Click-Through Rate' },
        { icon: Users, value: '350+', label: 'Consult Requests (6 months)' },
        { icon: DollarSign, value: '$210K+', label: 'Treatment Sales' },
        { icon: BarChart3, value: '3.3X', label: 'Return on Ad Spend' },
      ],
    },
    {
      title: 'Specialized Medical Services Practice',
      industry: 'Healthcare',
      challenge: 'Strict advertising restrictions for sensitive medical categories required creative compliance and SEO-heavy strategy.',
      approach: 'Ran targeted Google Ads alongside an aggressive SEO/content push. Overcame ad restrictions in sensitive medical categories.',
      execution: 'Built keyword-rich content, secured backlinks, and retargeted high-intent audiences.',
      timeline: '6-month integrated campaign',
      testimonial: 'They navigated complex advertising restrictions while delivering exceptional growth in both paid and organic channels.',
      clientName: 'Medical Director',
      results: [
        { icon: TrendingUp, value: '+220%', label: 'Organic Traffic (6 months)' },
        { icon: Users, value: '200+', label: 'New Inquiries' },
        { icon: DollarSign, value: '$81', label: 'Cost Per Lead' },
        { icon: BarChart3, value: '3X', label: 'Return on Ad Spend' },
      ],
    },
    {
      title: 'Regional Multi-Location Clinic',
      industry: 'Healthcare',
      challenge: 'Needed to scale from single location to regional presence with limited initial budget and prove ROI before expansion.',
      approach: 'Performance Max campaigns with quizzes and incentives as lead magnets. Budget started small ($10/day) and scaled regionally.',
      execution: 'Landing pages pixeled for retargeting across Google and Meta.',
      timeline: '9-month scale-up campaign',
      testimonial: 'Started with just $10 a day and grew to dominate our region. The data-driven approach gave us confidence to expand.',
      clientName: 'Regional Director',
      results: [
        { icon: TrendingUp, value: '7.1%', label: 'Click-Through Rate' },
        { icon: Users, value: '450+', label: 'Leads Across 3 Locations' },
        { icon: DollarSign, value: '$180K+', label: 'Patient Package Sales' },
        { icon: BarChart3, value: '4X', label: 'Return on Ad Spend' },
      ],
    },
  ];

  const flagshipCaseStudy = {
    title: 'Enterprise-Scale National Campaign',
    industry: 'Healthcare Enterprise',
    subtitle: '$300M revenue generated from $24M ad spend',
    challenge: 'National healthcare provider needed to scale operations across multiple markets while maintaining brand consistency and tracking attribution across diverse service lines and demographics.',
    approach: 'National-level Google Ads program with a monthly ad spend of $2M, targeting multiple service lines and patient demographics across the U.S.',
    execution: 'Comprehensive campaign mix including Search, Display, YouTube, and programmatic retargeting. Performance was tracked daily with advanced attribution modeling and conversion-optimized landing funnels.',
    timeline: '12-month national rollout with ongoing optimization',
    testimonial: 'This campaign transformed our business. We achieved market leadership in every major metropolitan area we targeted.',
    clientName: 'VP of Marketing',
    results: [
      { icon: DollarSign, value: '$24M', label: 'Annual Ad Spend' },
      { icon: TrendingUp, value: '$300M', label: 'Annual Revenue Generated' },
      { icon: BarChart3, value: '12.5X', label: 'Return on Ad Spend' },
      { icon: Globe, value: 'National', label: 'Market Dominance' },
    ],
    impact: 'Established the client as one of the top providers in their category nationwide, with dominance across paid search in all major markets. Campaign became a case study for enterprise-scale digital marketing excellence.',
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
            Success Stories That <span className="text-yellow-600">Speak Volumes</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Real campaigns. Real data. Real growth. See how we've helped businesses across industries achieve exceptional ROI through strategic digital marketing.
          </p>
        </motion.div>

        {/* Flagship Case Study */}
        <div className="mb-12">
          <FeaturedCaseStudy
            caseStudy={flagshipCaseStudy}
            onClick={() => setExpandedCaseStudy(flagshipCaseStudy)}
          />
        </div>

        {/* Horizontal Scrolling Case Studies - Draggable & Auto-scroll */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide cursor-grab select-none"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ scrollBehavior: isDragging.current ? 'auto' : 'smooth' }}
          >
            <div className="flex gap-6">
              {caseStudies.map((caseStudy, index) => (
                <CaseStudyCard
                  key={index}
                  caseStudy={caseStudy}
                  index={index}
                  onClick={() => setExpandedCaseStudy(caseStudy)}
                />
              ))}
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* CSS for hiding scrollbar */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-gray-700 mb-4 font-medium">
            Ready to achieve similar results for your business?
          </p>
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-500 transition-colors duration-300 cursor-pointer shadow-lg hover:shadow-xl">
            Let's Build Your Success Story
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Expanded Case Study Modal */}
      <AnimatePresence>
        {expandedCaseStudy && (
          <ExpandedCaseStudyModal
            caseStudy={expandedCaseStudy}
            onClose={() => setExpandedCaseStudy(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
