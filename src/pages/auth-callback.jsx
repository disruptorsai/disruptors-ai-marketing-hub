/**
 * OAuth Callback Page
 * Handles OAuth redirects from Google, etc.
 * Detects new users and triggers onboarding
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase-client';
import { BrainAPI } from '@/lib/brain-api';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import OnboardingFlow from '@/components/auth/OnboardingFlow';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error', 'onboarding'
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Fix malformed URL if present (e.g., http://https//domain.com)
    const currentUrl = window.location.href;
    if (currentUrl.includes('http://https//') || currentUrl.includes('https://https//')) {
      console.warn('Detected malformed redirect URL, fixing...');

      // Extract the hash (contains access_token, etc.)
      const hash = window.location.hash;

      // Construct correct URL
      const correctUrl = `https://disruptorsmedia.com/auth/callback${hash}`;

      // Replace current URL with correct one
      window.location.replace(correctUrl);
      return; // Stop execution, browser will reload with correct URL
    }

    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session) {
        const currentUser = data.session.user;
        setUser(currentUser);

        // Check if user is new by looking for existing Business Brain
        const isNewUser = await checkIfNewUser(currentUser.id);

        if (isNewUser) {
          // New user - show onboarding
          setStatus('onboarding');
          setShowOnboarding(true);
          toast.success('Welcome! Let\'s set up your Business Brain', {
            description: 'This will only take a minute'
          });
        } else {
          // Existing user - normal redirect
          setStatus('success');
          toast.success('Welcome back!');

          // Check if there's a stored return path
          const returnPath = localStorage.getItem('auth_return_path');
          localStorage.removeItem('auth_return_path'); // Clean up

          // Wait a moment then redirect to intended destination or home
          setTimeout(() => {
            navigate(returnPath || '/');
          }, 1500);
        }
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      toast.error('Authentication failed', {
        description: error.message
      });

      // Redirect to home after error
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  const checkIfNewUser = async (userId) => {
    try {
      // Try to get user's business brain
      const brain = await BrainAPI.getBrainByUser(userId);
      return brain === null; // null = new user, object = existing user
    } catch (error) {
      // Error fetching brain - assume new user
      console.error('Error checking user brain:', error);
      return true;
    }
  };

  const handleOnboardingComplete = () => {
    console.log('Onboarding complete - navigating...');
    setShowOnboarding(false);
    setStatus('success'); // Update status to show success message

    // Check if there's a stored return path
    const returnPath = localStorage.getItem('auth_return_path');
    localStorage.removeItem('auth_return_path');

    // Navigate to intended destination or home
    toast.success('Setup complete! Welcome to Disruptors', {
      description: 'Redirecting you now...'
    });

    // Immediate navigation
    setTimeout(() => {
      const destination = returnPath || '/app/content-writer';
      console.log('Navigating to:', destination);
      navigate(destination);
    }, 500);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-md w-full p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {status === 'processing' && (
              <>
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Completing sign in...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your account
                </p>
              </>
            )}

            {status === 'onboarding' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Authentication Complete!
                </h2>
                <p className="text-gray-600">
                  Opening onboarding wizard...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Success!
                </h2>
                <p className="text-gray-600">
                  Redirecting you now...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Authentication Failed
                </h2>
                <p className="text-gray-600 mb-4">
                  Something went wrong. Please try again.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Flow for New Users */}
      {showOnboarding && user && (
        <OnboardingFlow
          isOpen={showOnboarding}
          onClose={handleOnboardingComplete}
          user={user}
        />
      )}
    </>
  );
}
