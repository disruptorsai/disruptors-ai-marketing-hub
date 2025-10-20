import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useNavigate } from 'react-router-dom';

/**
 * Google One Tap Component
 *
 * Provides frictionless one-click signup using Google's One Tap API.
 * Automatically renders on mount and handles credential exchange with Supabase.
 *
 * Features:
 * - Zero-click for returning users (auto sign-in)
 * - One-click for new users (immediate signup)
 * - No redirects or page reloads
 * - Works alongside existing LoginModal as fallback
 *
 * @param {Object} props
 * @param {string} props.clientId - Google OAuth Client ID (from Supabase Dashboard)
 * @param {Function} props.onSuccess - Callback after successful authentication
 * @param {Function} props.onError - Callback on error
 * @param {boolean} props.autoPrompt - Show prompt automatically (default: true)
 * @param {string} props.context - Usage context: 'signin' or 'signup' (default: 'signup')
 */
export default function GoogleOneTap({
  clientId,
  onSuccess,
  onError,
  autoPrompt = true,
  context = 'signup'
}) {
  const navigate = useNavigate();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const oneTapInitialized = useRef(false);

  // Load Google Identity Services script
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById('google-one-tap-script')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-one-tap-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google One Tap script');
      onError?.(new Error('Failed to load Google One Tap'));
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount - keep it for other components
    };
  }, []);

  // Initialize One Tap when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !clientId || oneTapInitialized.current) {
      return;
    }

    if (!window.google?.accounts?.id) {
      console.warn('Google Identity Services not available');
      return;
    }

    try {
      // Initialize Google One Tap
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        context: context,
        ux_mode: 'popup',
        auto_select: true, // Auto-select for returning users
        cancel_on_tap_outside: false, // Don't dismiss too easily
        itp_support: true, // Support Intelligent Tracking Prevention
      });

      // Render the One Tap prompt
      if (autoPrompt) {
        window.google.accounts.id.prompt((notification) => {
          // Handle prompt dismissal
          if (notification.isNotDisplayed()) {
            console.log('One Tap not displayed:', notification.getNotDisplayedReason());
            // Reasons: browser_not_supported, opt_out_or_no_session, etc.
          } else if (notification.isSkippedMoment()) {
            console.log('One Tap skipped:', notification.getSkippedReason());
            // User closed it or tapped outside
          }
        });
      }

      oneTapInitialized.current = true;
    } catch (error) {
      console.error('Error initializing Google One Tap:', error);
      onError?.(error);
    }
  }, [isScriptLoaded, clientId, autoPrompt, context]);

  /**
   * Handle credential response from Google One Tap
   * Exchange Google JWT for Supabase session
   */
  async function handleCredentialResponse(response) {
    try {
      const { credential } = response;

      if (!credential) {
        throw new Error('No credential received from Google');
      }

      // Exchange Google credential for Supabase session
      // This uses Supabase's signInWithIdToken which works with Google One Tap
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });

      if (error) {
        throw error;
      }

      // Success! User is now signed in
      console.log('✅ One Tap sign-in successful:', data.user.email);

      // Mark user as lead magnet signup (no onboarding required yet)
      // This flag will be checked by ProtectedRoute
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          signup_source: 'one_tap',
          onboarding_completed: false,
          signed_up_at: new Date().toISOString()
        }
      });

      if (updateError) {
        console.warn('Failed to update user metadata:', updateError);
      }

      // Call success callback
      onSuccess?.(data);

      // Don't navigate - let parent component handle this
      // They might want to show content immediately or redirect

    } catch (error) {
      console.error('❌ One Tap sign-in failed:', error);
      onError?.(error);
    }
  }

  // This component doesn't render anything visible
  // Google One Tap renders its own UI
  return null;
}

/**
 * Utility function to programmatically trigger One Tap
 * Useful for showing One Tap on specific user interactions
 */
export function triggerOneTap() {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt();
  } else {
    console.warn('Google One Tap not initialized');
  }
}

/**
 * Utility function to cancel One Tap prompt
 * Useful when showing other auth UI (like LoginModal)
 */
export function cancelOneTap() {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.cancel();
  }
}
