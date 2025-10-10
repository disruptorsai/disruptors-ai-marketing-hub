import React, { useState } from 'react';
import { executeModule } from '@/lib/modules';
import KeywordResearchUI from '@/modules/keyword-research/KeywordResearchUI';
import { supabase } from '@/lib/supabase-client';

/**
 * Public Keyword Research Demo Page
 *
 * Lead magnet offering 3 free keyword searches per day.
 * Showcases the Keyword Research module with public access.
 *
 * Access Level: Public
 * Daily Limit: 3 searches
 * Results Limit: 10 keywords
 *
 * After 3 searches, users see email capture form for signup.
 */
const KeywordResearchDemo = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [access, setAccess] = useState({
    daily_limit: 3,
    daily_used: 0,
    allowed: true
  });

  /**
   * Execute module with public access
   */
  const handleRun = async (input) => {
    // Check if quota exceeded
    if (access.daily_used >= access.daily_limit) {
      setError({ message: 'Daily limit reached. Sign up for 10 searches per day!' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Execute module with public audience
      const res = await executeModule('keyword-research', input, {
        userId: null, // Anonymous
        brainId: null, // No brain context
        audience: 'public',
        sessionId: getSessionId(),
        ipAddress: null, // Would be set server-side
        userAgent: navigator.userAgent
      });

      if (res.success) {
        setResult(res);

        // Increment usage count
        setAccess(prev => ({
          ...prev,
          daily_used: prev.daily_used + 1
        }));

        // Store usage in localStorage
        const usageKey = 'keyword_research_demo_usage';
        const today = new Date().toDateString();
        const stored = JSON.parse(localStorage.getItem(usageKey) || '{}');

        if (stored.date !== today) {
          // Reset for new day
          localStorage.setItem(usageKey, JSON.stringify({
            date: today,
            count: 1
          }));
        } else {
          // Increment count
          localStorage.setItem(usageKey, JSON.stringify({
            date: today,
            count: stored.count + 1
          }));
        }
      } else {
        setError({ message: res.error || 'Search failed' });
      }
    } catch (err) {
      console.error('Module execution error:', err);
      setError({ message: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get or create session ID
   */
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('demo_session_id');
    if (!sessionId) {
      sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('demo_session_id', sessionId);
    }
    return sessionId;
  };

  /**
   * Load usage from localStorage on mount
   */
  React.useEffect(() => {
    const usageKey = 'keyword_research_demo_usage';
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(usageKey) || '{}');

    if (stored.date === today) {
      setAccess(prev => ({
        ...prev,
        daily_used: stored.count || 0
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-block">
            <span className="bg-green-400/20 text-green-400 px-4 py-2 rounded-full text-sm font-mono border border-green-400/30">
              FREE DEMO
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-green-400 font-mono">
            Keyword Research Tool
          </h1>

          <p className="text-xl text-green-400/80 max-w-3xl mx-auto">
            Discover profitable keywords with real search volume, competition, and CPC data.
            Powered by DataForSEO and AI-driven opportunity scoring.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-green-400/60">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>3 free searches per day</span>
            </div>
            <div className="flex items-center gap-2 text-green-400/60">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Real-time data</span>
            </div>
            <div className="flex items-center gap-2 text-green-400/60">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No signup required</span>
            </div>
          </div>
        </div>

        {/* Module UI */}
        <div className="max-w-6xl mx-auto">
          <KeywordResearchUI
            brain={null}
            audience="public"
            config={{
              default_location: '2840',
              default_language: 'en',
              results_limit: 10, // Limited for public
              show_trends: true
            }}
            access={access}
            onRun={handleRun}
            loading={loading}
            result={result}
            error={error}
          />
        </div>

        {/* Benefits Section */}
        {!result && (
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 font-mono">Real Data</h3>
              <p className="text-green-400/70">
                Live search volume, competition, and CPC data directly from Google Ads via DataForSEO
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 font-mono">Smart Scoring</h3>
              <p className="text-green-400/70">
                AI-powered opportunity algorithm balances high volume keywords with low competition
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 font-mono">Multi-Location</h3>
              <p className="text-green-400/70">
                Research keywords for United States, UK, Canada, Australia, and New Zealand markets
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 text-center space-y-6 bg-gradient-to-r from-green-400/10 to-blue-400/10 border border-green-400/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-green-400 font-mono">
            Ready for Unlimited Access?
          </h2>
          <p className="text-green-400/80 max-w-2xl mx-auto">
            Sign up for free to unlock 10 searches per day, advanced filters, CSV export, and save keywords to your content calendar.
          </p>
          <button className="bg-green-400 hover:bg-green-500 text-black px-8 py-4 rounded-lg font-mono font-bold text-lg transition-colors">
            Sign Up for Free →
          </button>
          <p className="text-sm text-green-400/60">
            No credit card required • 10 searches/day • Full access to all features
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeywordResearchDemo;
