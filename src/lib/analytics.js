/**
 * Analytics Tracking Utility
 * Google Analytics 4 Event Tracking for Disruptors Media
 *
 * Usage:
 * import { trackEvent, trackCTAClick, trackFormSubmit } from '@/lib/analytics';
 *
 * trackCTAClick('hero_section');
 * trackFormSubmit('contact_form');
 */

// Core event tracking function
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log('📊 Analytics Event:', eventName, eventParams);
  } else {
    console.warn('⚠️ Google Analytics not loaded');
  }
};

// Page view tracking for SPA navigation
export const trackPageView = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
      page_path: url,
      page_title: title
    });
    console.log('📄 Page View:', url, title);
  }
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
      window.gtag('config', window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
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
  trackEvent,
  trackPageView,
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
