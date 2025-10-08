/**
 * Protected Route - Authentication Guard for App Routes
 *
 * Wraps protected content and shows login modal if user not authenticated
 * Manages login + onboarding flow for new users
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import LoginModal from './LoginModal';
import OnboardingFlow from './OnboardingFlow';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check current session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        setShowLogin(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        setShowLogin(false);
      } else {
        setShowLogin(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setShowLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (authUser, isNew) => {
    setUser(authUser);
    setShowLogin(false);

    // Show onboarding for new users
    if (isNew) {
      setIsNewUser(true);
      setShowOnboarding(true);
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    setIsNewUser(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user && !showOnboarding ? children : null}

      <LoginModal
        isOpen={showLogin && !user}
        onClose={() => {}} // Can't close without logging in
        onAuthSuccess={handleAuthSuccess}
      />

      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        user={user}
      />
    </>
  );
}
