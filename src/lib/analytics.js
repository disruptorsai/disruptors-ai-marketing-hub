/**
 * Analytics & conversion tracking for Disruptors Media (GA4 + Meta Pixel).
 *
 * - GA4 loads only when VITE_GA4_MEASUREMENT_ID is set at build time. Without it, every
 *   GA call below is a no-op.
 * - Meta Pixel is loaded by index.html; trackLead() sends its Lead event.
 * - All tracking is skipped in automated browsers (navigator.webdriver), so the build-time
 *   prerender and plain headless tests never send events or bake tracking into HTML.
 *
 * Usage:
 * import { trackLead } from '@/lib/analytics';
 * trackLead({ source: 'book_strategy_session', formName: 'strategy_session' });
 */

// Static env access only: dynamic import.meta.env lookups inline every VITE_* var into the
// bundle (see src/lib/supabase-client.js).
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

const isAutomated = () => typeof navigator !== 'undefined' && navigator.webdriver === true;

// Load gtag.js. Call once at startup (src/main.jsx).
export const initAnalytics = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || isAutomated() || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // Page views are sent manually on every route change (Layout.jsx), so disable the automatic one.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

// Core event tracking function
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag && !isAutomated()) {
    window.gtag('event', eventName, eventParams);
  }
};

// Page view tracking for SPA navigation
export const trackPageView = (path, title) => {
  trackEvent('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title
  });
};

// Lead conversion: Meta Pixel "Lead" + GA4 "generate_lead". Call only after a form
// submission has actually succeeded. The shared eventID lets Meta de-duplicate this against
// a future server-side Conversions API event.
export const trackLead = ({ source, formName }) => {
  if (typeof window === 'undefined' || isAutomated()) return;
  const eventID = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', { content_name: formName, content_category: source }, { eventID });
  }
  trackEvent('generate_lead', { form_name: formName, lead_source: source, event_id: eventID });
};

// CTA (Call-to-Action) click tracking
export const trackCTAClick = (ctaLocation, ctaText = '') => {
  trackEvent('cta_click', {
    cta_location: ctaLocation,
    cta_text: ctaText,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Form submission tracking
export const trackFormSubmit = (formName, formData = {}) => {
  trackEvent('generate_lead', {
    form_name: formName,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...formData
  });
};

// Pricing page view tracking
export const trackPricingView = (plan = '') => {
  trackEvent('view_pricing', {
    pricing_plan: plan,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Service page view tracking
export const trackServiceView = (serviceName) => {
  trackEvent('view_service', {
    service_name: serviceName,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Blog post view tracking
export const trackBlogView = (postTitle, postSlug) => {
  trackEvent('view_blog_post', {
    post_title: postTitle,
    post_slug: postSlug,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Video play tracking
export const trackVideoPlay = (videoTitle, videoUrl) => {
  trackEvent('video_play', {
    video_title: videoTitle,
    video_url: videoUrl,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Download tracking
export const trackDownload = (fileName, fileType) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Scroll depth tracking
export const trackScrollDepth = (depth) => {
  trackEvent('scroll', {
    scroll_depth: depth,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Newsletter signup tracking
export const trackNewsletterSignup = (email) => {
  trackEvent('newsletter_signup', {
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Social share tracking
export const trackSocialShare = (platform, contentType, contentTitle) => {
  trackEvent('share', {
    method: platform,
    content_type: contentType,
    item_id: contentTitle,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Outbound link tracking
export const trackOutboundClick = (url, linkText) => {
  trackEvent('click', {
    link_url: url,
    link_text: linkText,
    outbound: true,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Search tracking (if implementing site search)
export const trackSearch = (searchTerm, resultsCount = 0) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Tool usage tracking (for AI tools)
export const trackToolUsage = (toolName, action, details = {}) => {
  trackEvent('tool_usage', {
    tool_name: toolName,
    tool_action: action,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Error tracking
export const trackError = (errorType, errorMessage, errorLocation) => {
  trackEvent('exception', {
    description: `${errorType}: ${errorMessage}`,
    error_location: errorLocation,
    fatal: false,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Conversion tracking
export const trackConversion = (conversionType, conversionValue = 0) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    conversion_value: conversionValue,
    currency: 'USD',
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Strategy session booking tracking
export const trackStrategySessionBook = (source = '') => {
  trackEvent('book_consultation', {
    booking_source: source,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  // Also track as conversion
  trackConversion('strategy_session_booking', 0);
};

// Engagement time tracking
export const trackEngagement = (timeOnPage, scrollDepth) => {
  trackEvent('user_engagement', {
    engagement_time: timeOnPage,
    scroll_depth: scrollDepth,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Initialize analytics with user ID (if logged in)
export const initializeAnalytics = (userId = null, userProperties = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    if (userId) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        user_id: userId,
        ...userProperties
      });
    }
    console.log('✅ Analytics initialized', userId ? `for user: ${userId}` : '');
  }
};

// Helper to track time on page
export const createTimeTracker = () => {
  const startTime = Date.now();

  return {
    getTimeSpent: () => Math.floor((Date.now() - startTime) / 1000),
    track: function() {
      const timeSpent = this.getTimeSpent();
      trackEngagement(timeSpent, 0);
      return timeSpent;
    }
  };
};

// Auto-track scroll depth
export const initScrollTracking = () => {
  if (typeof window === 'undefined') return;

  let maxScroll = 0;
  const depths = [25, 50, 75, 90];
  const tracked = new Set();

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = Math.floor((scrollTop / (documentHeight - windowHeight)) * 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      depths.forEach(depth => {
        if (scrollPercent >= depth && !tracked.has(depth)) {
          tracked.add(depth);
          trackScrollDepth(depth);
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleScroll);
};

// Auto-track outbound links
export const initOutboundLinkTracking = () => {
  if (typeof window === 'undefined') return;

  const handleClick = (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Check if external link
    const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);

    if (isExternal) {
      trackOutboundClick(href, link.textContent.trim());
    }
  };

  document.addEventListener('click', handleClick);

  return () => document.removeEventListener('click', handleClick);
};

// Export all tracking functions
export default {
  initAnalytics,
  trackEvent,
  trackPageView,
  trackLead,
  trackCTAClick,
  trackFormSubmit,
  trackPricingView,
  trackServiceView,
  trackBlogView,
  trackVideoPlay,
  trackDownload,
  trackScrollDepth,
  trackNewsletterSignup,
  trackSocialShare,
  trackOutboundClick,
  trackSearch,
  trackToolUsage,
  trackError,
  trackConversion,
  trackStrategySessionBook,
  trackEngagement,
  initializeAnalytics,
  createTimeTracker,
  initScrollTracking,
  initOutboundLinkTracking
};
