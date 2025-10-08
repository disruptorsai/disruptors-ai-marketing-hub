/**
 * OAuth Callback Page
 * Handles OAuth redirects from Google, etc.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session) {
        setStatus('success');
        toast.success('Successfully signed in!');

        // Wait a moment then redirect
        setTimeout(() => {
          navigate('/');
        }, 1500);
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

  return (
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
  );
}
