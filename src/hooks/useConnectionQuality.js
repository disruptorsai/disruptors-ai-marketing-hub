/**
 * Connection Quality Detection Hook
 * Detects user's network connection quality and adjusts asset loading accordingly
 *
 * Features:
 * - Network Information API support
 * - Save-Data header detection
 * - Effective connection type (slow-2g, 2g, 3g, 4g)
 * - Bandwidth estimation
 * - Adaptive quality recommendations
 */

import { useState, useEffect } from 'react';

/**
 * Connection quality tiers
 */
export const CONNECTION_QUALITY = {
  OFFLINE: 'offline',
  POOR: 'poor',      // slow-2g, 2g, save-data enabled
  MODERATE: 'moderate', // 3g
  GOOD: 'good',      // 4g, fast wifi
  EXCELLENT: 'excellent' // 4g+, very fast wifi
};

/**
 * Quality presets for different connection types
 */
export const QUALITY_PRESETS = {
  [CONNECTION_QUALITY.OFFLINE]: {
    imageQuality: 'auto:low',
    videoQuality: 'auto:low',
    maxImageWidth: 640,
    maxVideoWidth: 640,
    enableVideo: false,
    enableAnimations: false,
    format: 'auto'
  },
  [CONNECTION_QUALITY.POOR]: {
    imageQuality: 'auto:low',
    videoQuality: 'auto:low',
    maxImageWidth: 768,
    maxVideoWidth: 480,
    enableVideo: false, // Disable video on poor connections
    enableAnimations: false,
    format: 'auto'
  },
  [CONNECTION_QUALITY.MODERATE]: {
    imageQuality: 'auto:good',
    videoQuality: 'auto:good',
    maxImageWidth: 1280,
    maxVideoWidth: 720,
    enableVideo: true,
    enableAnimations: true,
    format: 'auto'
  },
  [CONNECTION_QUALITY.GOOD]: {
    imageQuality: 'auto:good',
    videoQuality: 'auto:good',
    maxImageWidth: 1920,
    maxVideoWidth: 1080,
    enableVideo: true,
    enableAnimations: true,
    format: 'auto'
  },
  [CONNECTION_QUALITY.EXCELLENT]: {
    imageQuality: 'auto:best',
    videoQuality: 'auto:best',
    maxImageWidth: 2560,
    maxVideoWidth: 1920,
    enableVideo: true,
    enableAnimations: true,
    format: 'auto'
  }
};

/**
 * Hook to detect and monitor connection quality
 * @returns {Object} - Connection quality information and presets
 */
export function useConnectionQuality() {
  const [connectionInfo, setConnectionInfo] = useState({
    quality: CONNECTION_QUALITY.GOOD, // Default to good
    effectiveType: '4g',
    downlink: null,
    saveData: false,
    rtt: null,
    preset: QUALITY_PRESETS[CONNECTION_QUALITY.GOOD]
  });

  useEffect(() => {
    // Check if Network Information API is available
    const connection = navigator.connection ||
                      navigator.mozConnection ||
                      navigator.webkitConnection;

    const updateConnectionInfo = () => {
      // Check save-data preference
      const saveData = navigator.connection?.saveData || false;

      if (!connection) {
        // Fallback: Assume good connection if API not available
        setConnectionInfo({
          quality: CONNECTION_QUALITY.GOOD,
          effectiveType: '4g',
          downlink: null,
          saveData: false,
          rtt: null,
          preset: QUALITY_PRESETS[CONNECTION_QUALITY.GOOD]
        });
        return;
      }

      const effectiveType = connection.effectiveType || '4g';
      const downlink = connection.downlink; // Mbps
      const rtt = connection.rtt; // Round trip time in ms

      // Determine connection quality
      let quality = CONNECTION_QUALITY.GOOD;

      if (!navigator.onLine) {
        quality = CONNECTION_QUALITY.OFFLINE;
      } else if (saveData) {
        quality = CONNECTION_QUALITY.POOR;
      } else if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        quality = CONNECTION_QUALITY.POOR;
      } else if (effectiveType === '3g') {
        quality = CONNECTION_QUALITY.MODERATE;
      } else if (effectiveType === '4g') {
        // Further refine 4g based on actual bandwidth
        if (downlink >= 10) {
          quality = CONNECTION_QUALITY.EXCELLENT;
        } else if (downlink >= 5) {
          quality = CONNECTION_QUALITY.GOOD;
        } else {
          quality = CONNECTION_QUALITY.MODERATE;
        }
      }

      setConnectionInfo({
        quality,
        effectiveType,
        downlink,
        saveData,
        rtt,
        preset: QUALITY_PRESETS[quality]
      });

      console.log('🌐 Connection Quality Detected:', {
        quality,
        effectiveType,
        downlink: downlink ? `${downlink} Mbps` : 'unknown',
        rtt: rtt ? `${rtt} ms` : 'unknown',
        saveData
      });
    };

    // Initial detection
    updateConnectionInfo();

    // Monitor connection changes
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
    }

    // Monitor online/offline
    window.addEventListener('online', updateConnectionInfo);
    window.addEventListener('offline', updateConnectionInfo);

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
      window.removeEventListener('online', updateConnectionInfo);
      window.removeEventListener('offline', updateConnectionInfo);
    };
  }, []);

  return connectionInfo;
}

/**
 * Hook to get adaptive image URL based on connection
 * @param {string} baseUrl - Original image URL
 * @param {Object} options - Additional options
 * @returns {string} - Optimized image URL for current connection
 */
export function useAdaptiveImage(baseUrl, options = {}) {
  const { quality, preset } = useConnectionQuality();
  const [optimizedUrl, setOptimizedUrl] = useState(baseUrl);

  useEffect(() => {
    if (!baseUrl || !baseUrl.includes('cloudinary.com')) {
      setOptimizedUrl(baseUrl);
      return;
    }

    // Apply connection-aware transformations
    const uploadIndex = baseUrl.indexOf('/upload/');
    if (uploadIndex === -1) {
      setOptimizedUrl(baseUrl);
      return;
    }

    const base = baseUrl.substring(0, uploadIndex + 8);
    const asset = baseUrl.substring(uploadIndex + 8);

    const transformations = [
      'f_auto', // Automatic format
      `q_${preset.imageQuality}`, // Connection-aware quality
      options.width ? `w_${Math.min(options.width, preset.maxImageWidth)}` : `w_${preset.maxImageWidth}`,
      options.height ? `h_${options.height}` : null,
      'c_limit', // Don't upscale
      'fl_progressive', // Progressive loading
    ].filter(Boolean).join(',');

    setOptimizedUrl(`${base}${transformations}/${asset}`);
  }, [baseUrl, quality, preset, options.width, options.height]);

  return optimizedUrl;
}

/**
 * Hook to get adaptive video URL based on connection
 * @param {string} baseUrl - Original video URL
 * @param {Object} options - Additional options
 * @returns {Object} - { url, shouldLoad, quality }
 */
export function useAdaptiveVideo(baseUrl, options = {}) {
  const { quality, preset } = useConnectionQuality();
  const [videoConfig, setVideoConfig] = useState({
    url: baseUrl,
    shouldLoad: true,
    quality: 'auto:good'
  });

  useEffect(() => {
    if (!baseUrl || !baseUrl.includes('cloudinary.com')) {
      setVideoConfig({
        url: baseUrl,
        shouldLoad: preset.enableVideo,
        quality: preset.videoQuality
      });
      return;
    }

    // Don't load video on poor connections
    if (!preset.enableVideo) {
      setVideoConfig({
        url: baseUrl,
        shouldLoad: false,
        quality: preset.videoQuality
      });
      return;
    }

    // Apply connection-aware transformations
    const uploadIndex = baseUrl.indexOf('/upload/');
    if (uploadIndex === -1) {
      setVideoConfig({
        url: baseUrl,
        shouldLoad: preset.enableVideo,
        quality: preset.videoQuality
      });
      return;
    }

    const base = baseUrl.substring(0, uploadIndex + 8);
    const asset = baseUrl.substring(uploadIndex + 8);

    const transformations = [
      'f_auto', // Automatic format
      `q_${preset.videoQuality}`, // Connection-aware quality
      options.width ? `w_${Math.min(options.width, preset.maxVideoWidth)}` : `w_${preset.maxVideoWidth}`,
      'c_limit', // Don't upscale
      'vc_auto', // Auto video codec
    ].filter(Boolean).join(',');

    setVideoConfig({
      url: `${base}${transformations}/${asset}`,
      shouldLoad: true,
      quality: preset.videoQuality
    });
  }, [baseUrl, quality, preset, options.width]);

  return videoConfig;
}
