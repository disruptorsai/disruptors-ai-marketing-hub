/**
 * Lead Magnet Landing Page
 *
 * Frictionless one-click signup for lead magnets from social media posts.
 * Features Google One Tap for immediate access with zero forms.
 *
 * URL Pattern: /l/:slug (e.g., /l/ai-email-swipes)
 * Gated Content: /g/:slug (redirects here if not authenticated)
 *
 * Flow:
 * 1. User clicks social link → lands here with UTM params
 * 2. Google One Tap appears automatically
 * 3. One click → signed up → redirect to /g/:slug
 * 4. Fallback: "Continue with Google" button if One Tap blocked
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Sparkles, Lock, Unlock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import GoogleOneTap, { cancelOneTap } from '@/components/auth/GoogleOneTap';
import LoginModal from '@/components/auth/LoginModal';
import * as leadMagnetAPI from '@/lib/lead-magnet-api';

// Fallback lead magnet configuration (used if database query fails or resource not found)
const FALLBACK_LEAD_MAGNET = {
  title: 'Exclusive Resource',
  description: 'Get instant access to this premium resource',
  benefits: ['Instant download', 'No credit card required', 'Lifetime access'],
  icon: '🎁',
  estimatedValue: 'FREE',
  whats_inside: [],
};

export default function LeadMagnetLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const leadMagnet = LEAD_MAGNETS[slug] || {
    title: 'Exclusive Resource',
    description: 'Get instant access to this premium resource',
    benefits: ['Instant download', 'No credit card required', 'Lifetime access'],
    icon: '🎁',
    estimatedValue: 'FREE'
  };

  // Preserve UTM parameters
  const utmParams = {
    utm_source: searchParams.get('utm_source'),
    utm_medium: searchParams.get('utm_medium'),
    utm_campaign: searchParams.get('utm_campaign'),
    utm_content: searchParams.get('utm_content'),
    utm_term: searchParams.get('utm_term'),
  };

  // Check if user is already authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Already logged in, redirect to gated content
        navigateToGatedContent();
      } else {
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsCheckingAuth(false);
    }
  }

  function navigateToGatedContent() {
    // Build query string with UTM params
    const queryString = new URLSearchParams(
      Object.entries(utmParams).filter(([_, v]) => v)
    ).toString();

    const destination = `/g/${slug}${queryString ? `?${queryString}` : ''}`;
    navigate(destination);
  }

  // Handle successful One Tap authentication
  async function handleOneTapSuccess(data) {
    setIsAuthenticating(true);

    // Track lead capture with UTM data
    try {
      await fetch('/.netlify/functions/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.user.email,
          leadMagnetSlug: slug,
          utmParams,
          signupMethod: 'one_tap',
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Failed to track lead capture:', error);
      // Don't block user flow if tracking fails
    }

    toast.success('Welcome! Redirecting to your content...');

    // Small delay for toast to show, then redirect
    setTimeout(() => {
      navigateToGatedContent();
    }, 800);
  }

  function handleOneTapError(error) {
    console.error('One Tap failed:', error);
    // Don't show error toast - just keep fallback button visible
  }

  // Handle fallback Google OAuth button
  async function handleGoogleSignIn() {
    try {
      setIsAuthenticating(true);

      // Cancel One Tap if it's showing
      cancelOneTap();

      // Store return path and UTM params
      const returnData = {
        path: `/g/${slug}`,
        utmParams,
        leadMagnetSlug: slug,
        signupMethod: 'oauth_button'
      };
      localStorage.setItem('lead_magnet_return', JSON.stringify(returnData));

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      toast.success('Redirecting to Google...');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Sign-in failed. Please try again.');
      setIsAuthenticating(false);
    }
  }

  // Loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      {/* Google One Tap - Invisible but auto-renders */}
      {googleClientId && !isAuthenticating && (
        <GoogleOneTap
          clientId={googleClientId}
          onSuccess={handleOneTapSuccess}
          onError={handleOneTapError}
          autoPrompt={true}
          context="signup"
        />
      )}

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6 shadow-lg"
            >
              <span className="text-5xl">{leadMagnet.icon}</span>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
          >
            {leadMagnet.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-gray-300 text-center mb-8"
          >
            {leadMagnet.description}
          </motion.p>

          {/* Value Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-6 py-2 mx-auto w-fit mb-8"
          >
            <p className="text-white font-bold text-sm">
              Value: <span className="line-through opacity-75">{leadMagnet.estimatedValue}</span> → FREE
            </p>
          </motion.div>

          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-3 mb-8"
          >
            {leadMagnet.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="bg-blue-500 rounded-full p-1 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-white text-lg">{benefit}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="space-y-4"
          >
            {/* One Tap Hint */}
            <p className="text-center text-sm text-gray-300 mb-4">
              👆 Click the Google prompt above for instant access
            </p>

            {/* Fallback Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isAuthenticating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  <span>Signing you in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400 pt-4">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>100% secure</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-center text-gray-400 text-sm mt-6"
        >
          By continuing, you agree to receive occasional emails from Disruptors AI.
          <br />
          Unsubscribe anytime with one click.
        </motion.p>
      </motion.div>

      {/* Login Modal Fallback (if needed) */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onAuthSuccess={handleOneTapSuccess}
      />
    </div>
  );
}
