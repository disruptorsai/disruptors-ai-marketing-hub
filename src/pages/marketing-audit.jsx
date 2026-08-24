import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, TrendingUp, Target, Zap, Users, Globe, BarChart3, MessageSquare, Search, Mail, DollarSign } from 'lucide-react';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';

const STEPS = [
  { id: 1, title: 'Business Basics', icon: Globe },
  { id: 2, title: 'Current Marketing', icon: BarChart3 },
  { id: 3, title: 'Goals & Challenges', icon: Target },
  { id: 4, title: 'Digital Presence', icon: MessageSquare },
];

export default function MarketingAudit() {
  usePageMeta({
    title: 'Free Marketing Audit | Disruptors Media',
    description: 'Get a free AI-powered marketing audit. Answer a few questions and receive tailored recommendations to grow your business.',
    path: '/marketing-audit',
    jsonLd: breadcrumb('Marketing Audit', '/marketing-audit'),
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [auditResults, setAuditResults] = useState(null);
  const [formData, setFormData] = useState({
    // Step 1: Business Basics
    businessName: '',
    website: '',
    industry: '',
    monthlyRevenue: '',
    monthlyMarketingBudget: '',

    // Step 2: Current Marketing
    hasWebsite: '',
    hasSEO: '',
    hasSocialMedia: '',
    socialPlatforms: [],
    hasPaidAds: '',
    paidPlatforms: [],
    hasEmailMarketing: '',
    hasContentMarketing: '',
    contentTypes: [],

    // Step 3: Goals & Challenges
    primaryGoal: '',
    secondaryGoals: [],
    biggestChallenge: '',
    targetAudience: '',

    // Step 4: Digital Presence
    websiteAge: '',
    websiteTraffic: '',
    conversionTracking: '',
    hasAnalytics: '',
    competitorAwareness: '',
    mainCompetitors: '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);

    try {
      // Call the AI analysis function
      const response = await fetch('/.netlify/functions/marketing-audit-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setAuditResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing audit:', error);
      // Show fallback results
      setAuditResults(generateFallbackResults());
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFallbackResults = () => {
    return {
      overallScore: 65,
      maturityLevel: 'Growing',
      strengths: [
        'Active social media presence',
        'Consistent content creation',
        'Clear target audience understanding'
      ],
      weaknesses: [
        'Limited SEO optimization',
        'No conversion tracking',
        'Inconsistent brand messaging'
      ],
      recommendations: [
        {
          category: 'SEO & Content',
          priority: 'High',
          items: [
            'Implement comprehensive keyword research',
            'Optimize website technical SEO',
            'Create pillar content strategy'
          ]
        },
        {
          category: 'Conversion Optimization',
          priority: 'High',
          items: [
            'Set up Google Analytics 4',
            'Implement conversion tracking',
            'Create clear CTAs on all pages'
          ]
        },
        {
          category: 'Social Media',
          priority: 'Medium',
          items: [
            'Develop consistent posting schedule',
            'Increase engagement rate',
            'Add social proof elements'
          ]
        }
      ],
      nextSteps: [
        'Schedule a strategy call to discuss custom solutions',
        'Request detailed competitive analysis',
        'Begin with Core Package for comprehensive support'
      ]
    };
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.website && formData.industry;
      case 2:
        return formData.hasWebsite !== '' && formData.hasSEO !== '';
      case 3:
        return formData.primaryGoal && formData.biggestChallenge;
      case 4:
        return formData.websiteTraffic !== '' && formData.hasAnalytics !== '';
      default:
        return false;
    }
  };

  if (showResults) {
    return <ResultsPage results={auditResults} formData={formData} />;
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#2C6BAA] animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Marketing...</h2>
          <p className="text-gray-600 max-w-md">
            Our AI is analyzing your responses to create a comprehensive marketing assessment with personalized recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gray-900">Free AI-Powered </span>
            <span className="text-[#2C6BAA]">Marketing Assessment</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get a comprehensive analysis of your marketing strategy with actionable recommendations in minutes.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    currentStep >= step.id
                      ? 'bg-[#2C6BAA] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${
                    currentStep >= step.id ? 'text-[#2C6BAA]' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${
                    currentStep > step.id ? 'bg-[#2C6BAA]' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <Step1BusinessBasics formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 2 && (
                <Step2CurrentMarketing formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 3 && (
                <Step3GoalsChallenges formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 4 && (
                <Step4DigitalPresence formData={formData} updateFormData={updateFormData} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${
              isStepComplete()
                ? 'bg-[#2C6BAA] text-white hover:bg-[#234f88]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep === STEPS.length ? 'Get My Audit' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 1: Business Basics
function Step1BusinessBasics({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your business</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Name *
        </label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => updateFormData('businessName', e.target.value)}
          placeholder="Your Business Name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website URL *
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => updateFormData('website', e.target.value)}
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Industry *
        </label>
        <select
          value={formData.industry}
          onChange={(e) => updateFormData('industry', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        >
          <option value="">Select your industry</option>
          <option value="Healthcare">Healthcare & Wellness</option>
          <option value="Home Services">Home Services & Trades</option>
          <option value="Professional Services">Professional Services</option>
          <option value="Retail">Retail & E-commerce</option>
          <option value="Technology">Technology & SaaS</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Hospitality">Hospitality & Food Service</option>
          <option value="Education">Education & Training</option>
          <option value="Finance">Finance & Insurance</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monthly Revenue Range
        </label>
        <select
          value={formData.monthlyRevenue}
          onChange={(e) => updateFormData('monthlyRevenue', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        >
          <option value="">Select range</option>
          <option value="0-10k">$0 - $10,000</option>
          <option value="10k-50k">$10,000 - $50,000</option>
          <option value="50k-100k">$50,000 - $100,000</option>
          <option value="100k-250k">$100,000 - $250,000</option>
          <option value="250k+">$250,000+</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monthly Marketing Budget
        </label>
        <select
          value={formData.monthlyMarketingBudget}
          onChange={(e) => updateFormData('monthlyMarketingBudget', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        >
          <option value="">Select budget</option>
          <option value="0-1k">$0 - $1,000</option>
          <option value="1k-5k">$1,000 - $5,000</option>
          <option value="5k-10k">$5,000 - $10,000</option>
          <option value="10k-25k">$10,000 - $25,000</option>
          <option value="25k+">$25,000+</option>
        </select>
      </div>
    </div>
  );
}

// Step 2: Current Marketing
function Step2CurrentMarketing({ formData, updateFormData }) {
  const toggleArrayItem = (field, value) => {
    const currentArray = formData[field] || [];
    if (currentArray.includes(value)) {
      updateFormData(field, currentArray.filter(item => item !== value));
    } else {
      updateFormData(field, [...currentArray, value]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">What marketing are you doing now?</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you have a professional website? *
        </label>
        <div className="flex gap-4">
          {['Yes', 'No', 'Under Development'].map(option => (
            <button
              key={option}
              onClick={() => updateFormData('hasWebsite', option)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                formData.hasWebsite === option
                  ? 'bg-[#2C6BAA] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Are you doing SEO (Search Engine Optimization)? *
        </label>
        <div className="flex gap-4">
          {['Yes - Actively', 'Yes - Basic', 'No', 'Not Sure'].map(option => (
            <button
              key={option}
              onClick={() => updateFormData('hasSEO', option)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                formData.hasSEO === option
                  ? 'bg-[#2C6BAA] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Are you active on social media?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['Facebook', 'Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'YouTube'].map(platform => (
            <button
              key={platform}
              onClick={() => toggleArrayItem('socialPlatforms', platform)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                (formData.socialPlatforms || []).includes(platform)
                  ? 'bg-[#2C6BAA] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you run paid advertising?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['Google Ads', 'Facebook/Instagram Ads', 'LinkedIn Ads', 'Other Paid Ads'].map(platform => (
            <button
              key={platform}
              onClick={() => toggleArrayItem('paidPlatforms', platform)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                (formData.paidPlatforms || []).includes(platform)
                  ? 'bg-[#2C6BAA] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What type of content do you create?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['Blog Posts', 'Videos', 'Podcasts', 'Email Newsletters', 'Case Studies', 'Social Media Posts'].map(type => (
            <button
              key={type}
              onClick={() => toggleArrayItem('contentTypes', type)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                (formData.contentTypes || []).includes(type)
                  ? 'bg-[#2C6BAA] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Goals & Challenges
function Step3GoalsChallenges({ formData, updateFormData }) {
  const toggleArrayItem = (field, value) => {
    const currentArray = formData[field] || [];
    if (currentArray.includes(value)) {
      updateFormData(field, currentArray.filter(item => item !== value));
    } else {
      updateFormData(field, [...currentArray, value]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">What are your goals and challenges?</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's your primary marketing goal? *
        </label>
        <select
          value={formData.primaryGoal}
          onChange={(e) => updateFormData('primaryGoal', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        >
          <option value="">Select your primary goal</option>
          <option value="increase-leads">Increase Leads & Inquiries</option>
          <option value="increase-traffic">Increase Website Traffic</option>
          <option value="improve-conversions">Improve Conversion Rates</option>
          <option value="brand-awareness">Build Brand Awareness</option>
          <option value="increase-sales">Increase Online Sales</option>
          <option value="improve-roi">Improve Marketing ROI</option>
          <option value="compete-better">Better Compete in Market</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are your secondary goals? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 gap-3">
          {[
            'Improve SEO Rankings',
            'Grow Social Media Following',
            'Build Email List',
            'Create Better Content',
            'Improve Website Performance',
            'Better Target Audience',
          ].map(goal => (
            <button
              key={goal}
              onClick={() => toggleArrayItem('secondaryGoals', goal)}
              className={`px-4 py-3 rounded-lg font-medium text-left transition-all ${
                (formData.secondaryGoals || []).includes(goal)
                  ? 'bg-[#2C6BAA] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's your biggest marketing challenge? *
        </label>
        <select
          value={formData.biggestChallenge}
          onChange={(e) => updateFormData('biggestChallenge', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        >
          <option value="">Select your biggest challenge</option>
          <option value="not-enough-leads">Not Getting Enough Leads</option>
          <option value="low-traffic">Low Website Traffic</option>
          <option value="high-competition">Too Much Competition</option>
          <option value="no-strategy">No Clear Strategy</option>
          <option value="limited-budget">Limited Budget</option>
          <option value="limited-time">Limited Time/Resources</option>
          <option value="no-expertise">Lack of Marketing Expertise</option>
          <option value="poor-roi">Poor Return on Investment</option>
          <option value="outdated-website">Outdated Website/Brand</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Who is your target audience?
        </label>
        <textarea
          value={formData.targetAudience}
          onChange={(e) => updateFormData('targetAudience', e.target.value)}
          placeholder="Describe your ideal customer (e.g., homeowners age 35-55 in suburban areas looking for home services)"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Step 4: Digital Presence
function Step4DigitalPresence({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your digital presence</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How old is your current website?
        </label>
        <select
          value={formData.websiteAge}
          onChange={(e) => updateFormData('websiteAge', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        >
          <option value="">Select age</option>
          <option value="less-than-1">Less than 1 year</option>
          <option value="1-2">1-2 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5+">5+ years</option>
          <option value="dont-know">Don't know</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Approximately how much traffic does your website get per month? *
        </label>
        <select
          value={formData.websiteTraffic}
          onChange={(e) => updateFormData('websiteTraffic', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        >
          <option value="">Select traffic range</option>
          <option value="0-500">0 - 500 visitors</option>
          <option value="500-1k">500 - 1,000 visitors</option>
          <option value="1k-5k">1,000 - 5,000 visitors</option>
          <option value="5k-10k">5,000 - 10,000 visitors</option>
          <option value="10k+">10,000+ visitors</option>
          <option value="dont-know">Don't know</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you have Google Analytics or other tracking installed? *
        </label>
        <div className="flex gap-4">
          {['Yes', 'No', 'Not Sure'].map(option => (
            <button
              key={option}
              onClick={() => updateFormData('hasAnalytics', option)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                formData.hasAnalytics === option
                  ? 'bg-[#2C6BAA] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you track conversions (form fills, calls, sales)?
        </label>
        <div className="flex gap-4">
          {['Yes', 'No', 'Partially'].map(option => (
            <button
              key={option}
              onClick={() => updateFormData('conversionTracking', option)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                formData.conversionTracking === option
                  ? 'bg-[#2C6BAA] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Who are your main competitors?
        </label>
        <textarea
          value={formData.mainCompetitors}
          onChange={(e) => updateFormData('mainCompetitors', e.target.value)}
          placeholder="List 2-3 competitor names or websites"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6BAA] focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Results Page Component
function ResultsPage({ results, formData }) {
  const getScoreColor = (score) => {
    if (score >= 80) return '#3C7A6A'; // Verdigris Green
    if (score >= 60) return '#C9A53B'; // Muted Gold
    return '#C96F4C'; // Terracotta
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Needs Attention';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="inline-block mb-6"
          >
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={getScoreColor(results.overallScore)}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${results.overallScore * 3.51} 351`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{results.overallScore}</span>
                <span className="text-sm text-gray-600">Score</span>
              </div>
            </div>
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Marketing Assessment Results
          </h1>
          <p className="text-xl text-gray-600">
            Marketing Maturity Level: <span className="font-semibold text-[#2C6BAA]">{results.maturityLevel}</span>
          </p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#3C7A6A]" />
              <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {results.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-[#3C7A6A] mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-[#C96F4C]" />
              <h3 className="text-xl font-bold text-gray-900">Opportunities</h3>
            </div>
            <ul className="space-y-2">
              {results.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-[#C96F4C] mt-1">→</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalized Recommendations</h2>
          <div className="space-y-4">
            {results.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{rec.category}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rec.priority === 'High'
                      ? 'bg-red-100 text-red-700'
                      : rec.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <ul className="space-y-2">
                  {rec.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-gray-700">
                      <Zap className="w-5 h-5 text-[#2C6BAA] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Steps CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#2C6BAA] to-[#234f88] rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
          <p className="text-lg mb-6 opacity-90">
            Let's turn these insights into results. Schedule a free strategy call to discuss your custom growth plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-4 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Schedule Strategy Call
            </a>
            <button
              onClick={() => window.print()}
              className="px-8 py-4 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Download Report
            </button>
          </div>
        </motion.div>

        {/* Service Packages Hint */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Based on your audit, we recommend exploring our <span className="font-semibold">Core Package</span> or <span className="font-semibold">Scale Package</span>
          </p>
          <a href="/solutions" className="text-[#2C6BAA] font-semibold hover:underline">
            View Our Service Packages →
          </a>
        </div>
      </div>
    </div>
  );
}
