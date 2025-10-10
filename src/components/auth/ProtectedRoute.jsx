/**
 * Protected Route - Authentication Guard for App Routes
 *
 * Wraps protected content and shows login modal if user not authenticated
 * Manages login + onboarding flow for new users
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase-client';
import { BrainAPI } from '@/lib/brain-api';
import { toast } from 'sonner';
import LoginModal from './LoginModal';
import OnboardingFlow from './OnboardingFlow';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    console.log('🔒 [PROTECTED_ROUTE] Component mounted - timestamp:', new Date().toISOString());
    // Check current session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔒 [PROTECTED_ROUTE] Auth state change:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        console.log('🔒 [PROTECTED_ROUTE] No session, showing login');
        setShowLogin(true);
      } else if (session.user) {
        console.log('🔒 [PROTECTED_ROUTE] User authenticated, checking onboarding status');
        // Check if new user needs onboarding
        const needsOnboarding = await checkIfNewUser(session.user.id);
        console.log('🔒 [PROTECTED_ROUTE] Onboarding check result:', needsOnboarding);
        if (needsOnboarding) {
          console.log('🔒 [PROTECTED_ROUTE] New user needs onboarding');
          setShowOnboarding(true);
          setIsNewUser(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      console.log('🔒 [PROTECTED_ROUTE] Checking user session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('🔒 [PROTECTED_ROUTE] Session check error:', sessionError);
        throw sessionError;
      }

      console.log('🔒 [PROTECTED_ROUTE] Session check result:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });

      if (session) {
        console.log('🔒 [PROTECTED_ROUTE] Valid session found, setting user');
        setUser(session.user);
        setShowLogin(false);

        // Check if new user needs onboarding
        console.log('🔒 [PROTECTED_ROUTE] Checking if user needs onboarding...');
        const needsOnboarding = await checkIfNewUser(session.user.id);
        console.log('🔒 [PROTECTED_ROUTE] Onboarding check result:', needsOnboarding);
        if (needsOnboarding) {
          console.log('🔒 [PROTECTED_ROUTE] User needs onboarding, showing onboarding flow');
          setShowOnboarding(true);
          setIsNewUser(true);
        }
      } else {
        console.log('🔒 [PROTECTED_ROUTE] No session found, showing login');
        setShowLogin(true);
      }
    } catch (error) {
      console.error('🔒 [PROTECTED_ROUTE] Auth check error:', error);
      setShowLogin(true);
    } finally {
      setLoading(false);
      console.log('🔒 [PROTECTED_ROUTE] User check completed');
    }
  };

  const checkIfNewUser = async (userId) => {
    try {
      console.log('🔒 [PROTECTED_ROUTE] Checking if user has brain for userId:', userId);
      // Try to get user's business brain
      const brain = await BrainAPI.getBrainByUser(userId);
      console.log('🔒 [PROTECTED_ROUTE] Brain API response:', {
        hasBrain: !!brain,
        brainId: brain?.id,
        businessName: brain?.business_name
      });
      return brain === null; // null = new user needs onboarding
    } catch (error) {
      // Error fetching brain - assume new user needs onboarding
      console.error('🔒 [PROTECTED_ROUTE] Error checking user brain:', error);
      return true;
    }
  };

  const handleAuthSuccess = async (authUser, isNew) => {
    setUser(authUser);
    setShowLogin(false);

    // If isNew is explicitly passed, use it. Otherwise check for brain.
    let needsOnboarding = isNew;
    if (!isNew && authUser) {
      needsOnboarding = await checkIfNewUser(authUser.id);
    }

    // Show onboarding for new users
    if (needsOnboarding) {
      setIsNewUser(true);
      setShowOnboarding(true);
      toast.info('Welcome! Let\'s set up your Business Brain');
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    setIsNewUser(false);
  };

  const handleLoginClose = () => {
    // User closed login modal without authenticating
    // Redirect to home page
    setShowLogin(false);
    navigate('/');
    toast.info('Login required to access this page');
  };

  if (loading) {
    console.log('🔒 [PROTECTED_ROUTE] Rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('🔒 [PROTECTED_ROUTE] Rendering with state:', {
    hasUser: !!user,
    showLogin,
    showOnboarding,
    isNewUser,
    shouldShowChildren: user && !showOnboarding
  });

  return (
    <>
      {user && !showOnboarding ? children : null}

      <LoginModal
        isOpen={showLogin && !user}
        onClose={handleLoginClose}
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
