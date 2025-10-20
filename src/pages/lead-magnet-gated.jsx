/**
 * Gated Lead Magnet Content
 *
 * Shows the actual lead magnet content after successful authentication.
 * Includes subtle upgrade banner for Business Brain without being pushy.
 *
 * URL Pattern: /g/:slug (e.g., /g/ai-email-swipes)
 * Landing Page: /l/:slug (redirects here if not authenticated)
 *
 * Flow:
 * 1. Check authentication → redirect to /l/:slug if not logged in
 * 2. Show lead magnet content immediately
 * 3. Show dismissible upgrade banner for Business Brain
 * 4. Track content access for follow-up emails
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, X, Brain, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

// Lead magnet content - same as landing page for consistency
const LEAD_MAGNETS = {
  'ai-email-swipes': {
    title: '50 AI-Powered Email Swipes',
    downloadUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID/view',
    embedUrl: 'https://docs.google.com/document/d/YOUR_DOC_ID/preview',
    previewText: `
      Get access to 50 proven email templates that convert cold leads into hot prospects.

      These templates have generated over $2.5M in revenue for our clients and include:
      - Welcome sequences that build trust instantly
      - Nurture emails that educate without selling
      - Conversion emails that close deals effortlessly
      - Re-engagement campaigns that revive dead leads

      Each template includes:
      ✓ Subject line variations
      ✓ Personalization prompts for AI
      ✓ A/B testing suggestions
      ✓ Industry-specific adaptations
    `,
    icon: '📧'
  },
  'content-calendar': {
    title: '90-Day AI Content Calendar',
    downloadUrl: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit',
    embedUrl: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/preview',
    previewText: `
      Never run out of content ideas again with our AI-generated 90-day content calendar.

      This calendar includes:
      - 90 content ideas across all major platforms
      - Optimal posting times for each platform
      - Content formats (video, carousel, blog, etc.)
      - Engagement hooks and CTA suggestions

      Plus you get:
      ✓ Weekly themes to maintain consistency
      ✓ Trending topic alerts
      ✓ Seasonal content opportunities
      ✓ Cross-platform repurposing guide
    `,
    icon: '📅'
  },
  'lead-magnet-templates': {
    title: '25 High-Converting Lead Magnets',
    downloadUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID/view',
    embedUrl: 'https://docs.google.com/document/d/YOUR_DOC_ID/preview',
    previewText: `
      Build your email list on autopilot with these 25 proven lead magnet templates.

      Each template includes:
      - Complete landing page copy
      - Lead magnet content outline
      - Design and formatting guidelines
      - Conversion optimization checklist

      You'll get:
      ✓ Checklists and cheat sheets
      ✓ Templates and swipe files
      ✓ Calculators and assessments
      ✓ Mini-courses and challenges
      ✓ Resource libraries
    `,
    icon: '🧲'
  },
};

export default function LeadMagnetGated() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const leadMagnet = LEAD_MAGNETS[slug] || {
    title: 'Exclusive Resource',
    downloadUrl: '#',
    embedUrl: null,
    previewText: 'Your exclusive resource is ready to download.',
    icon: '🎁'
  };

  // Check authentication and load user
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('upgrade_banner_dismissed');
    if (dismissed) {
      setBannerDismissed(true);
      setShowUpgradeBanner(false);
    }
  }, []);

  // Track content access
  useEffect(() => {
    if (user) {
      trackAccess();
      fireAnalyticsEvent();
    }
  }, [user]);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Not logged in - redirect to landing page with params
        const queryString = searchParams.toString();
        navigate(`/l/${slug}${queryString ? `?${queryString}` : ''}`);
        return;
      }

      setUser(session.user);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate(`/l/${slug}`);
    }
  }

  async function trackAccess() {
    try {
      // Track that user accessed this lead magnet
      await fetch('/.netlify/functions/lead-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
          leadMagnetSlug: slug,
          accessedAt: new Date().toISOString(),
          utmParams: {
            utm_source: searchParams.get('utm_source'),
            utm_medium: searchParams.get('utm_medium'),
            utm_campaign: searchParams.get('utm_campaign'),
          }
        })
      });
    } catch (error) {
      console.warn('Failed to track access:', error);
    }
  }

  function fireAnalyticsEvent() {
    // Fire Google Analytics / dataLayer event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'lead_magnet_accessed',
        leadMagnetSlug: slug,
        userEmail: user.email,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    }
  }

  function dismissBanner() {
    setShowUpgradeBanner(false);
    sessionStorage.setItem('upgrade_banner_dismissed', 'true');

    // Fire dismiss event for potential retargeting
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'upgrade_banner_dismissed',
        leadMagnetSlug: slug
      });
    }
  }

  function handleUpgradeClick() {
    // Fire analytics event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'upgrade_banner_clicked',
        leadMagnetSlug: slug,
        source: 'lead_magnet_page'
      });
    }

    // Navigate to brain setup
    navigate('/app/setup-brain');
  }

  function handleDownload() {
    // Fire download event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'lead_magnet_downloaded',
        leadMagnetSlug: slug
      });
    }

    // Open download URL
    window.open(leadMagnet.downloadUrl, '_blank');
    toast.success('Opening download...');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 mb-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Success! Your content is ready
              </h2>
              <p className="text-green-200">
                Check your email for future updates and exclusive offers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upgrade Banner (Dismissible) */}
        <AnimatePresence>
          {showUpgradeBanner && !bannerDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50 rounded-2xl p-6 mb-6 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Dismiss Button */}
              <button
                onClick={dismissBanner}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 pr-8">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-3 flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Want AI to write content in YOUR brand voice?
                  </h3>
                  <p className="text-gray-200 mb-4">
                    Set up your Business Brain and get AI-powered content that sounds exactly like you.
                    Used by 500+ businesses to scale their content 10x faster.
                  </p>
                  <button
                    onClick={handleUpgradeClick}
                    className="bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span>Set Up Your Brain (Free)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4">
              <span className="text-4xl">{leadMagnet.icon}</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {leadMagnet.title}
              </h1>
              <p className="text-gray-300 mt-1">
                Delivered to {user?.email}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg mb-8 group"
          >
            <Download className="w-5 h-5 group-hover:animate-bounce" />
            <span>Download Now</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Preview Content */}
          <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              What's Inside
            </h3>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {leadMagnet.previewText}
            </div>
          </div>

          {/* Embedded Preview (if available) */}
          {leadMagnet.embedUrl && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-4">Preview</h3>
              <div className="bg-white rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src={leadMagnet.embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  title="Lead Magnet Preview"
                />
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong className="text-white">Check your email</strong> - We've sent you a copy plus bonus resources
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong className="text-white">Watch your inbox</strong> - You'll receive exclusive tips and offers
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong className="text-white">Explore our AI tools</strong> - See what else we can help you automate
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm mb-4">
            Want to explore more AI-powered marketing tools?
          </p>
          <a
            href="/resources"
            className="text-blue-400 hover:text-blue-300 font-semibold underline"
          >
            Browse All Tools →
          </a>
        </motion.div>
      </div>
    </div>
  );
}
