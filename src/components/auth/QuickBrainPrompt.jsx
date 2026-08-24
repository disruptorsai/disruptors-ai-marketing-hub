/**
 * Quick Brain Prompt
 *
 * Beautiful, brief explanation of Business Brain shown to one-tap users
 * when they first try to use an AI tool.
 *
 * Gives them choice:
 * - Set up Brain now (2-minute setup)
 * - Skip and use generic AI (can set up later)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, Target, X, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function QuickBrainPrompt({ isOpen, onSetupNow, onSkip, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Brain,
      title: "Meet Your Business Brain",
      description: "Your AI assistant that knows your brand inside and out",
      details: "Instead of generic AI responses, get content that sounds exactly like you—using your brand voice, values, and style.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Powers All Your AI Tools",
      description: "One Brain, infinite possibilities",
      details: "Once set up, your Brain powers every AI tool—Content Writer, Keyword Research, Growth Audits—all with your unique brand DNA baked in.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Zap,
      title: "Gets Smarter Over Time",
      description: "Learns as you work",
      details: "Every piece of content you create, every fact you teach it, makes your Brain better at representing your brand authentically.",
      gradient: "from-pink-500 to-red-600"
    }
  ];

  const currentSlideData = slides[currentSlide];
  const SlideIcon = currentSlideData.icon;

  function handleNext() {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onSetupNow();
    }
  }

  function handleSkip() {
    // Mark that user has seen the prompt (don't show again this session)
    sessionStorage.setItem('brain_prompt_seen', 'true');

    // Update user metadata to track they skipped
    supabase.auth.updateUser({
      data: {
        brain_prompt_shown: true,
        brain_prompt_skipped: true,
        brain_prompt_shown_at: new Date().toISOString()
      }
    });

    onSkip();
  }

  function handleSetupNow() {
    // Mark that user chose to set up
    supabase.auth.updateUser({
      data: {
        brain_prompt_shown: true,
        brain_prompt_accepted: true,
        brain_prompt_shown_at: new Date().toISOString()
      }
    });

    onSetupNow();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 opacity-30">
                <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} animate-pulse`}></div>
              </div>

              {/* Content */}
              <div className="relative p-8 md:p-12">
                {/* Close button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                  aria-label="Skip"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-8">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'w-8 bg-white'
                          : index < currentSlide
                          ? 'w-2 bg-green-400'
                          : 'w-2 bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Slide content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className={`bg-gradient-to-br ${currentSlideData.gradient} rounded-full p-6 shadow-lg`}>
                        <SlideIcon className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {currentSlideData.title}
                    </h2>

                    {/* Description */}
                    <p className="text-xl text-blue-200 mb-6">
                      {currentSlideData.description}
                    </p>

                    {/* Details */}
                    <p className="text-gray-300 text-lg leading-relaxed max-w-xl mx-auto">
                      {currentSlideData.details}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Action buttons */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  {currentSlide === slides.length - 1 ? (
                    <>
                      {/* Final slide buttons */}
                      <button
                        onClick={handleSetupNow}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg group"
                      >
                        <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Set Up My Brain</span>
                        <span className="text-sm opacity-75">(2 min)</span>
                      </button>
                      <button
                        onClick={handleSkip}
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                      >
                        Maybe Later
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Progress buttons */}
                      <button
                        onClick={handleSkip}
                        className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                      >
                        Skip for Now
                      </button>
                      <button
                        onClick={handleNext}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg group"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  )}
                </div>

                {/* Quick stats */}
                {currentSlide === slides.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-8 border-t border-white/10"
                  >
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white mb-1">2 min</div>
                        <div className="text-sm text-gray-400">Setup time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white mb-1">500+</div>
                        <div className="text-sm text-gray-400">Happy users</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white mb-1">10x</div>
                        <div className="text-sm text-gray-400">Faster content</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
