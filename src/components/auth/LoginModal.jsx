/**
 * Premium Login Modal - Glassmorphism Design with Disruptors Branding
 *
 * Features:
 * - Glassmorphism with gradient background
 * - Google OAuth and email/password authentication
 * - Smooth animations with Framer Motion
 * - Responsive design
 * - Auto-opens onboarding after first signup
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles, Brain, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export default function LoginModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setMode('signin');
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
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

      // OAuth redirect will happen automatically
      toast.success('Redirecting to Google...');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      let result;
      if (mode === 'signup') {
        // Sign up
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (result.error) throw result.error;

        if (result.data?.user?.identities?.length === 0) {
          toast.error('Email already registered', {
            description: 'Please sign in instead'
          });
          setMode('signin');
          return;
        }

        toast.success('Account created!', {
          description: 'Check your email to verify your account'
        });

        // Call onAuthSuccess with isNewUser flag
        if (onAuthSuccess) {
          onAuthSuccess(result.data.user, true);
        }
        onClose();
      } else {
        // Sign in
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) throw result.error;

        toast.success('Welcome back!');

        // Call onAuthSuccess
        if (onAuthSuccess) {
          onAuthSuccess(result.data.user, false);
        }
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(mode === 'signup' ? 'Sign up failed' : 'Sign in failed', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="pointer-events-auto w-full max-w-md"
            >
              {/* Glassmorphism Card */}
              <div className="relative overflow-hidden rounded-3xl">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-500/20 to-blue-700/20" />

                {/* Glass Effect */}
                <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  <div className="p-8">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] mb-4 shadow-lg"
                      >
                        <Brain className="w-8 h-8 text-white" />
                      </motion.div>

                      <h2 className="text-3xl font-bold text-white mb-2">
                        Welcome to Disruptors
                      </h2>
                      <p className="text-white/70">
                        {mode === 'signup'
                          ? 'Create your AI-powered marketing account'
                          : 'Sign in to access your AI tools'}
                      </p>
                    </div>

                    {/* Google Login Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-white/90 text-gray-900 font-semibold flex items-center justify-center gap-3 transition-colors shadow-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </motion.button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-transparent text-white/60">or continue with email</span>
                      </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      {/* Email Input */}
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            disabled={loading}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                          </>
                        ) : (
                          <>
                            <LogIn className="w-5 h-5" />
                            {mode === 'signup' ? 'Create Account' : 'Sign In'}
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Toggle Sign In/Sign Up */}
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        disabled={loading}
                        className="text-white/80 hover:text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {mode === 'signup'
                          ? 'Already have an account? Sign in'
                          : "Don't have an account? Sign up"}
                      </button>
                    </div>

                    {/* Powered by Badge */}
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                        <Sparkles className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-white/60 text-xs">Powered by Business Brain AI</span>
                      </div>
                    </div>
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
