/**
 * Manual Brain Setup Page
 *
 * Allows users to set up their Business Brain at any time.
 * Shown when:
 * - User clicks upgrade banner on lead magnet page
 * - User clicks "Set Up Your Brain" from email
 * - User accesses /app/setup-brain directly
 *
 * Reuses the OnboardingFlow component from the auth system.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { BrainAPI } from '@/lib/brain-api';
import { toast } from 'sonner';
import OnboardingFlow from '@/components/auth/OnboardingFlow';

export default function BrainSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [existingBrain, setExistingBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAuthAndBrain();
  }, []);

  async function checkAuthAndBrain() {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Not logged in - redirect to home with message
        toast.error('Please log in to set up your Business Brain');
        navigate('/');
        return;
      }

      setUser(session.user);

      // Check if user already has a brain
      const brain = await BrainAPI.getBrainByUser(session.user.id);

      if (brain) {
        // Already has a brain
        setExistingBrain(brain);
        setLoading(false);
      } else {
        // No brain yet - show onboarding
        setShowOnboarding(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth/brain:', error);
      toast.error('Something went wrong. Please try again.');
      navigate('/');
    }
  }

  function handleOnboardingComplete() {
    setShowOnboarding(false);

    // Update user metadata to mark onboarding as completed
    supabase.auth.updateUser({
      data: {
        onboarding_completed: true
      }
    });

    toast.success('Business Brain created successfully!');

    // Redirect to brain manager or content writer
    setTimeout(() => {
      navigate('/app/business-brain');
    }, 1500);
  }

  function handleOnboardingClose() {
    setShowOnboarding(false);

    // User closed without completing - go back
    toast.info('You can set up your Brain anytime from your dashboard');
    navigate('/resources');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding flow if user doesn't have a brain
  if (showOnboarding) {
    return (
      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        user={user}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // User already has a brain - show success message
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-white/60 hover:text-white transition-colors flex items-center gap-2 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20"
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-green-500/20 border border-green-500/50 rounded-full p-6"
            >
              <CheckCircle2 className="w-16 h-16 text-green-400" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
          >
            Your Business Brain is All Set!
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-gray-300 text-center mb-8"
          >
            Your AI already knows your brand voice, values, and style.
            <br />
            Time to put it to work!
          </motion.p>

          {/* Brain Info */}
          {existingBrain && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-3 flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {existingBrain.business_name}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {existingBrain.industry} • {existingBrain.total_facts || 0} facts learned
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-4"
          >
            <button
              onClick={() => navigate('/app/content-writer')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Start Writing Content</span>
            </button>

            <button
              onClick={() => navigate('/app/business-brain')}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Brain className="w-5 h-5" />
              <span>Manage Your Brain</span>
            </button>

            <button
              onClick={() => navigate('/resources')}
              className="w-full text-white/60 hover:text-white font-medium py-3 transition-colors"
            >
              Explore All Tools
            </button>
          </motion.div>

          {/* What You Can Do */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 pt-8 border-t border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              What You Can Do Now
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong className="text-white">Generate brand-consistent content</strong> - Blog posts, social media, emails, and more
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong className="text-white">Research keywords</strong> - Find high-value keywords for your niche
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong className="text-white">Teach your Brain</strong> - Add facts, update brand voice, refine style
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
