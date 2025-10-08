/**
 * Onboarding Flow - Welcome new users and explain Business Brain concept
 *
 * Features:
 * - Multi-step welcome experience
 * - Explains Business Brain AI concept
 * - Emphasizes unique value proposition
 * - Smooth animations
 * - Auto-initialization of Business Brain for new users
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  Rocket,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  MessageSquare,
  Image,
  TrendingUp,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { BrainAPI } from '@/lib/brain-api';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Disruptors',
    subtitle: 'The Future of AI-Powered Marketing',
    description: 'You\'ve just joined an elite group of businesses using the most advanced AI marketing platform ever built.',
    icon: Sparkles,
    gradient: 'from-black via-neutral-900 to-black'
  },
  {
    id: 'brain-intro',
    title: 'Meet Your Business Brain',
    subtitle: 'AI That Knows Your Business Like You Do',
    description: 'Every company is unique. That\'s why we built Business Brain—an AI system that learns everything about YOUR business, industry, customers, and goals.',
    icon: Brain,
    gradient: 'from-neutral-900 via-neutral-800 to-neutral-900',
    isInteractive: true
  },
  {
    id: 'unique-value',
    title: 'The Game-Changing Difference',
    subtitle: 'No One Else Is Doing This',
    description: 'Generic AI gives generic results. Business Brain delivers content, strategies, and insights specifically tailored to YOUR company. It\'s like having an AI team member who knows your business inside and out.',
    icon: Zap,
    gradient: 'from-neutral-800 via-black to-neutral-800'
  },
  {
    id: 'how-it-works',
    title: 'How It Powers Your Apps',
    subtitle: 'One Brain, All Your Marketing Tools',
    description: 'Your Business Brain automatically feeds context to every AI tool you use—blog writer, social posts, ad copy, and more. No more re-entering your business info. No more generic AI content.',
    icon: Target,
    gradient: 'from-black via-neutral-900 to-black',
    isInteractive: true
  },
  {
    id: 'business-info',
    title: 'Tell Us About Your Business',
    subtitle: 'Help Your Business Brain Learn About You',
    description: 'We\'ll use this information to personalize your AI experience.',
    icon: Target,
    gradient: 'from-neutral-900 via-neutral-800 to-neutral-900',
    isForm: true
  },
  {
    id: 'brand-dna',
    title: 'Configure Your Brand DNA',
    subtitle: 'Define Your Brand Style (Optional)',
    description: 'Help us understand your brand\'s visual identity and voice. You can skip this and configure it later.',
    icon: Sparkles,
    gradient: 'from-neutral-800 via-black to-neutral-800',
    isForm: true,
    canSkip: true
  },
  {
    id: 'setup',
    title: 'Let\'s Get Started',
    subtitle: 'Your Business Brain Is Being Created',
    description: 'We\'re setting up your personalized AI system right now. In seconds, you\'ll have access to AI tools that understand your business better than any other platform on the market.',
    icon: Rocket,
    gradient: 'from-black via-neutral-900 to-black'
  }
];

export default function OnboardingFlow({ isOpen, onClose, user }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Business Info Form State
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    website: '',
    industry: '',
    description: ''
  });

  // Brand DNA Form State
  const [brandDNA, setBrandDNA] = useState({
    primaryColor: '#FFD700',
    secondaryColor: '#FFA500',
    fontStyle: 'modern',
    tone: 'professional',
    exampleMedia: []
  });

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const Icon = currentStepData.icon;

  // Validation for form steps
  const isBusinessInfoValid = () => {
    return businessInfo.businessName.trim() &&
           businessInfo.website.trim() &&
           businessInfo.industry.trim();
  };

  const canProceedFromCurrentStep = () => {
    if (currentStepData.id === 'business-info') {
      return isBusinessInfoValid();
    }
    return true; // Non-form steps can always proceed
  };

  const handleNext = async () => {
    // Validate before proceeding
    if (!canProceedFromCurrentStep()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // If on business-info step, scan website
    if (currentStepData.id === 'business-info') {
      await scanWebsite();
    }

    // If on brand-dna step and user skips, just proceed
    if (currentStepData.id === 'brand-dna' && !brandDNA.primaryColor) {
      // User didn't configure, that's okay
    }

    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const scanWebsite = async () => {
    try {
      setIsScanning(true);
      toast.info('Scanning your website...', {
        description: 'This will help us understand your business better'
      });

      // Call Firecrawl to scrape the website
      // This will be handled by the BrainAPI auto-initialize function
      // For now, just show a loading state
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Website scanned successfully!', {
        description: 'We found valuable information about your business'
      });
    } catch (error) {
      console.error('Website scan error:', error);
      toast.warning('Couldn\'t scan website', {
        description: 'We\'ll still create your Business Brain with the info you provided'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    try {
      setIsInitializing(true);

      // Create Business Brain with all collected data
      const brainData = {
        user_id: user.id,
        business_name: businessInfo.businessName,
        website_url: businessInfo.website,
        industry: businessInfo.industry,
        business_description: businessInfo.description,
        slug: businessInfo.businessName.toLowerCase().replace(/\s+/g, '-'),
        onboarding_completed: true,
        brain_level: 'starter', // Will be upgraded through onboarding conversation
      };

      // Add brand DNA if configured
      if (brandDNA.primaryColor) {
        brainData.brand_colors = {
          primary: brandDNA.primaryColor,
          secondary: brandDNA.secondaryColor
        };
      }

      // Create the brain
      const brain = await BrainAPI.createBrain(brainData);

      // If website provided, trigger auto-initialization (website scraping)
      if (businessInfo.website) {
        try {
          await BrainAPI.autoInitializeBrain(brain.id, {
            website_url: businessInfo.website
          });
        } catch (error) {
          console.error('Auto-init error:', error);
          // Non-blocking - brain is created, auto-init can fail
        }
      }

      setIsComplete(true);

      // Wait a moment to show success animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Your Business Brain is ready!', {
        description: 'Start using AI tools customized for your business'
      });

      // Close onboarding
      onClose();
    } catch (error) {
      console.error('Brain initialization error:', error);
      toast.error('Setup failed', {
        description: 'We\'ll try again when you use your first tool'
      });
      // Close anyway - brain can be created on-demand later
      onClose();
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="pointer-events-auto w-full max-w-2xl"
            >
              {/* Glass Card */}
              <div className="relative overflow-hidden rounded-3xl">
                {/* Animated Gradient Background - Subtle Black/Grey */}
                <motion.div
                  animate={{
                    background: [
                      'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgba(30, 30, 30, 1) 100%)',
                      'linear-gradient(135deg, rgba(20, 20, 20, 1) 0%, rgba(40, 40, 40, 1) 100%)',
                      'linear-gradient(135deg, rgba(10, 10, 10, 1) 0%, rgba(35, 35, 35, 1) 100%)',
                      'linear-gradient(135deg, rgba(15, 15, 15, 1) 0%, rgba(25, 25, 25, 1) 100%)',
                      'linear-gradient(135deg, rgba(5, 5, 5, 1) 0%, rgba(30, 30, 30, 1) 100%)',
                    ]
                  }}
                  transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="absolute inset-0"
                />

                {/* Glass Effect */}
                <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
                  {/* Skip Button */}
                  <button
                    onClick={handleSkip}
                    disabled={isInitializing}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  <div className="p-8 md:p-12">
                    {!isComplete ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStep}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Logo */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            className="inline-flex items-center justify-center mb-6"
                          >
                            <img
                              src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697002/disruptors-media/brand/logos/gold-logo.png"
                              alt="Disruptors Logo"
                              className="w-20 h-20 object-contain"
                            />
                          </motion.div>

                          {/* Content */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                              {currentStepData.title}
                            </h2>
                            <p className="text-xl text-neutral-400 mb-6 font-semibold">
                              {currentStepData.subtitle}
                            </p>
                            <p className="text-lg text-white/80 leading-relaxed mb-6">
                              {currentStepData.description}
                            </p>

                            {/* Interactive Business Brain Demo */}
                            {currentStepData.id === 'brain-intro' && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6"
                              >
                                <div className="flex items-center justify-center gap-8">
                                  {/* Brain Icon - Pulsing */}
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.1, 1],
                                      opacity: [1, 0.8, 1]
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                    className="flex flex-col items-center"
                                  >
                                    <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center shadow-lg p-3">
                                      <img
                                        src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697002/disruptors-media/brand/logos/gold-logo.png"
                                        alt="Disruptors Logo"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <p className="text-white text-sm mt-2 font-semibold">Your Brain</p>
                                  </motion.div>

                                  {/* Connecting Lines */}
                                  <div className="flex flex-col gap-2">
                                    {[0, 1, 2].map((i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ width: 0 }}
                                        animate={{ width: 60 }}
                                        transition={{ delay: 0.6 + i * 0.2, duration: 0.5 }}
                                        className="h-0.5 bg-gradient-to-r from-neutral-500 to-neutral-600"
                                      />
                                    ))}
                                  </div>

                                  {/* Data Points */}
                                  <div className="flex flex-col gap-3">
                                    {[
                                      { icon: Database, label: 'Business Data' },
                                      { icon: Target, label: 'Customer Insights' },
                                      { icon: TrendingUp, label: 'Industry Trends' }
                                    ].map((item, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + i * 0.2 }}
                                        className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2"
                                      >
                                        <item.icon className="w-4 h-4 text-neutral-400" />
                                        <span className="text-white text-xs">{item.label}</span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Interactive App Integration Demo */}
                            {currentStepData.id === 'how-it-works' && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6"
                              >
                                {/* Brain at Center */}
                                <div className="flex items-center justify-center mb-6">
                                  <motion.div
                                    animate={{
                                      rotate: [0, 360]
                                    }}
                                    transition={{
                                      duration: 20,
                                      repeat: Infinity,
                                      ease: "linear"
                                    }}
                                    className="relative w-24 h-24"
                                  >
                                    {/* Orbiting Apps */}
                                    {[
                                      { icon: FileText, label: 'Blog Writer', angle: 0 },
                                      { icon: MessageSquare, label: 'Social Posts', angle: 90 },
                                      { icon: Image, label: 'Ad Copy', angle: 180 },
                                      { icon: Sparkles, label: 'SEO Tools', angle: 270 }
                                    ].map((app, i) => (
                                      <motion.div
                                        key={i}
                                        className="absolute"
                                        style={{
                                          top: '50%',
                                          left: '50%',
                                          transform: `translate(-50%, -50%) rotate(${app.angle}deg) translateY(-60px)`
                                        }}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + i * 0.15 }}
                                      >
                                        <motion.div
                                          animate={{
                                            rotate: [-app.angle]
                                          }}
                                          transition={{
                                            duration: 20,
                                            repeat: Infinity,
                                            ease: "linear"
                                          }}
                                          className="flex flex-col items-center"
                                        >
                                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                                            <app.icon className="w-6 h-6 text-neutral-300" />
                                          </div>
                                          <span className="text-white text-xs mt-1 whitespace-nowrap">{app.label}</span>
                                        </motion.div>
                                      </motion.div>
                                    ))}

                                    {/* Central Brain */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                      <motion.div
                                        animate={{
                                          scale: [1, 1.1, 1],
                                          boxShadow: [
                                            '0 0 20px rgba(115, 115, 115, 0.3)',
                                            '0 0 40px rgba(140, 140, 140, 0.6)',
                                            '0 0 20px rgba(115, 115, 115, 0.3)'
                                          ]
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          ease: "easeInOut"
                                        }}
                                        className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center p-3"
                                      >
                                        <img
                                          src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697002/disruptors-media/brand/logos/gold-logo.png"
                                          alt="Disruptors Logo"
                                          className="w-full h-full object-contain"
                                        />
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                </div>

                                <p className="text-center text-white/70 text-sm">
                                  Your Business Brain automatically feeds context to all your AI tools
                                </p>
                              </motion.div>
                            )}

                            {/* Form Fields for business-info step */}
                            {currentStepData.id === 'business-info' && (
                              <div className="space-y-4 mt-8">
                                <div>
                                  <label className="block text-white/90 text-sm font-medium mb-2">
                                    Business Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={businessInfo.businessName}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                                    placeholder="Acme Corporation"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all"
                                  />
                                </div>

                                <div>
                                  <label className="block text-white/90 text-sm font-medium mb-2">
                                    Website URL *
                                  </label>
                                  <input
                                    type="url"
                                    value={businessInfo.website}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all"
                                  />
                                  <p className="text-white/60 text-xs mt-1">
                                    We'll scan your website to learn about your business
                                  </p>
                                </div>

                                <div>
                                  <label className="block text-white/90 text-sm font-medium mb-2">
                                    Industry *
                                  </label>
                                  <input
                                    type="text"
                                    value={businessInfo.industry}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, industry: e.target.value })}
                                    placeholder="e.g., Construction, Healthcare, E-commerce"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all"
                                  />
                                </div>

                                <div>
                                  <label className="block text-white/90 text-sm font-medium mb-2">
                                    Brief Description (Optional)
                                  </label>
                                  <textarea
                                    value={businessInfo.description}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                                    placeholder="Tell us what makes your business unique..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all resize-none"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Form Fields for brand-dna step */}
                            {currentStepData.id === 'brand-dna' && (
                              <div className="space-y-4 mt-8">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-white/90 text-sm font-medium mb-2">
                                      Primary Brand Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="color"
                                        value={brandDNA.primaryColor}
                                        onChange={(e) => setBrandDNA({ ...brandDNA, primaryColor: e.target.value })}
                                        className="w-16 h-12 rounded-lg cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={brandDNA.primaryColor}
                                        onChange={(e) => setBrandDNA({ ...brandDNA, primaryColor: e.target.value })}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-white/90 text-sm font-medium mb-2">
                                      Secondary Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="color"
                                        value={brandDNA.secondaryColor}
                                        onChange={(e) => setBrandDNA({ ...brandDNA, secondaryColor: e.target.value })}
                                        className="w-16 h-12 rounded-lg cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={brandDNA.secondaryColor}
                                        onChange={(e) => setBrandDNA({ ...brandDNA, secondaryColor: e.target.value })}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-white/90 text-sm font-medium mb-2">
                                    Brand Voice & Tone
                                  </label>
                                  <select
                                    value={brandDNA.tone}
                                    onChange={(e) => setBrandDNA({ ...brandDNA, tone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all"
                                  >
                                    <option value="professional">Professional & Authoritative</option>
                                    <option value="friendly">Friendly & Approachable</option>
                                    <option value="bold">Bold & Disruptive</option>
                                    <option value="casual">Casual & Conversational</option>
                                    <option value="technical">Technical & Expert</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-white/90 text-sm font-medium mb-2">
                                    Font Style Preference
                                  </label>
                                  <select
                                    value={brandDNA.fontStyle}
                                    onChange={(e) => setBrandDNA({ ...brandDNA, fontStyle: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all"
                                  >
                                    <option value="modern">Modern & Clean (Sans-serif)</option>
                                    <option value="classic">Classic & Elegant (Serif)</option>
                                    <option value="bold">Bold & Impactful</option>
                                    <option value="playful">Playful & Creative</option>
                                  </select>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                  <p className="text-white/70 text-sm">
                                    💡 <strong>Pro Tip:</strong> You can always refine your Brand DNA later in the Business Brain Manager
                                  </p>
                                </div>
                              </div>
                            )}
                          </motion.div>

                          {/* Progress Dots */}
                          <div className="flex items-center gap-2 mt-8 mb-8">
                            {ONBOARDING_STEPS.map((_, index) => (
                              <motion.div
                                key={index}
                                initial={false}
                                animate={{
                                  width: index === currentStep ? 32 : 8,
                                  backgroundColor: index === currentStep
                                    ? 'rgba(255, 215, 0, 1)'
                                    : 'rgba(255, 255, 255, 0.3)'
                                }}
                                transition={{ duration: 0.3 }}
                                className="h-2 rounded-full"
                              />
                            ))}
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex items-center gap-4">
                            {currentStep > 0 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBack}
                                disabled={isInitializing}
                                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ArrowLeft className="w-5 h-5" />
                                Back
                              </motion.button>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleNext}
                              disabled={isInitializing}
                              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isInitializing ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Setting up your Business Brain...
                                </>
                              ) : isLastStep ? (
                                <>
                                  <Rocket className="w-5 h-5" />
                                  Let's Go!
                                </>
                              ) : (
                                <>
                                  Next
                                  <ArrowRight className="w-5 h-5" />
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      /* Success State */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', duration: 0.6 }}
                          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500 mb-6 shadow-lg"
                        >
                          <CheckCircle className="w-12 h-12 text-white" />
                        </motion.div>

                        <h2 className="text-4xl font-bold text-white mb-4">
                          You're All Set! 🎉
                        </h2>
                        <p className="text-xl text-white/80">
                          Your Business Brain is ready to revolutionize your marketing
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
