import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useSplinePerformance Hook
 *
 * Custom hook for managing Spline 3D scene performance optimization
 * across different devices and screen sizes. Provides intelligent
 * performance management for production-ready 3D experiences.
 *
 * Features:
 * - Automatic device capability detection
 * - Performance-based quality adjustment
 * - Memory usage monitoring
 * - Frame rate optimization
 * - Battery level consideration (when available)
 * - Network-aware loading strategies
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableMobileOptimization - Enable mobile performance optimizations
 * @param {boolean} options.enableAdaptiveQuality - Enable adaptive quality based on performance
 * @param {number} options.targetFPS - Target frame rate for performance optimization
 * @param {boolean} options.enableBatteryOptimization - Consider battery level in optimizations
 *
 * @returns {Object} Performance management utilities and state
 */
export const useSplinePerformance = ({
  enableMobileOptimization = true,
  enableAdaptiveQuality = true,
  targetFPS = 60,
  enableBatteryOptimization = true
} = {}) => {
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isMobile: false,
    isTablet: false,
    isLowEnd: false,
    hasWebGL2: false,
    maxTextureSize: 0,
    concurrentConnections: 0,
    deviceMemory: 0,
    hardwareConcurrency: 0
  });

  const [performanceSettings, setPerformanceSettings] = useState({
    quality: 'high', // 'low', 'medium', 'high', 'ultra'
    enableShadows: true,
    enableAntialiasing: true,
    renderScale: 1.0,
    maxLights: 8,
    enablePostProcessing: true
  });

  const [batteryInfo, setBatteryInfo] = useState({
    level: 1,
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity
  });

  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false
  });

  const performanceMonitorRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Detect device capabilities
  useEffect(() => {
    const detectCapabilities = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|mobile/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

      // Detect low-end devices
      const isLowEnd = (
        navigator.hardwareConcurrency <= 2 ||
        (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
        (!gl || (gl.getParameter && gl.getParameter(gl.MAX_TEXTURE_SIZE) < 4096))
      );

      setDeviceCapabilities({
        isMobile,
        isTablet,
        isLowEnd,
        hasWebGL2: !!canvas.getContext('webgl2'),
        maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
        concurrentConnections: navigator.hardwareConcurrency || 4,
        deviceMemory: navigator.deviceMemory || 4,
        hardwareConcurrency: navigator.hardwareConcurrency || 4
      });

      canvas.remove();
    };

    detectCapabilities();

    // Re-detect on resize (orientation change)
    const handleResize = () => {
      setTimeout(detectCapabilities, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor battery status
  useEffect(() => {
    if (!enableBatteryOptimization || !navigator.getBattery) return;

    navigator.getBattery().then(battery => {
      const updateBatteryInfo = () => {
        setBatteryInfo({
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        });
      };

      updateBatteryInfo();

      battery.addEventListener('chargingchange', updateBatteryInfo);
      battery.addEventListener('levelchange', updateBatteryInfo);

      return () => {
        battery.removeEventListener('chargingchange', updateBatteryInfo);
        battery.removeEventListener('levelchange', updateBatteryInfo);
      };
    }).catch(() => {
      // Battery API not supported, use defaults
    });
  }, [enableBatteryOptimization]);

  // Monitor network information
  useEffect(() => {
    if (!navigator.connection) return;

    const updateNetworkInfo = () => {
      setNetworkInfo({
        effectiveType: navigator.connection.effectiveType || '4g',
        downlink: navigator.connection.downlink || 10,
        rtt: navigator.connection.rtt || 100,
        saveData: navigator.connection.saveData || false
      });
    };

    updateNetworkInfo();
    navigator.connection.addEventListener('change', updateNetworkInfo);

    return () => {
      navigator.connection.removeEventListener('change', updateNetworkInfo);
    };
  }, []);

  // Adaptive performance adjustment
  useEffect(() => {
    if (!enableAdaptiveQuality) return;

    const adjustPerformanceSettings = () => {
      let newSettings = { ...performanceSettings };

      // Base adjustments for device type
      if (deviceCapabilities.isMobile || deviceCapabilities.isLowEnd) {
        newSettings = {
          quality: 'medium',
          enableShadows: false,
          enableAntialiasing: false,
          renderScale: 0.8,
          maxLights: 4,
          enablePostProcessing: false
        };
      }

      // Battery level adjustments
      if (enableBatteryOptimization && !batteryInfo.charging && batteryInfo.level < 0.3) {
        newSettings.quality = 'low';
        newSettings.renderScale = Math.min(newSettings.renderScale, 0.6);
        newSettings.enableShadows = false;
        newSettings.enablePostProcessing = false;
      }

      // Network-based adjustments
      if (networkInfo.saveData || networkInfo.effectiveType === '2g' || networkInfo.effectiveType === '3g') {
        newSettings.quality = 'low';
        newSettings.renderScale = Math.min(newSettings.renderScale, 0.7);
      }

      // Low memory adjustments
      if (deviceCapabilities.deviceMemory <= 2) {
        newSettings.maxLights = Math.min(newSettings.maxLights, 2);
        newSettings.enablePostProcessing = false;
      }

      setPerformanceSettings(newSettings);
    };

    adjustPerformanceSettings();
  }, [
    deviceCapabilities,
    batteryInfo,
    networkInfo,
    enableAdaptiveQuality,
    enableBatteryOptimization
  ]);

  // Performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    if (performanceMonitorRef.current) return;

    performanceMonitorRef.current = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        const fps = (frameCountRef.current * 1000) / delta;

        // Adjust quality based on FPS
        if (enableAdaptiveQuality && fps < targetFPS * 0.8) {
          setPerformanceSettings(prev => ({
            ...prev,
            quality: prev.quality === 'high' ? 'medium' : prev.quality === 'medium' ? 'low' : 'low',
            renderScale: Math.max(prev.renderScale - 0.1, 0.5)
          }));
        } else if (fps > targetFPS * 1.1 && performanceSettings.quality !== 'high') {
          setPerformanceSettings(prev => ({
            ...prev,
            quality: prev.quality === 'low' ? 'medium' : prev.quality === 'medium' ? 'high' : 'high',
            renderScale: Math.min(prev.renderScale + 0.1, 1.0)
          }));
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      } else {
        frameCountRef.current++;
      }
    }, 100);
  }, [enableAdaptiveQuality, targetFPS, performanceSettings.quality]);

  const stopPerformanceMonitoring = useCallback(() => {
    if (performanceMonitorRef.current) {
      clearInterval(performanceMonitorRef.current);
      performanceMonitorRef.current = null;
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopPerformanceMonitoring();
    };
  }, [stopPerformanceMonitoring]);

  // Get optimized Spline configuration
  const getSplineConfig = useCallback(() => {
    return {
      // Rendering settings
      antialias: performanceSettings.enableAntialiasing,
      alpha: true,
      powerPreference: deviceCapabilities.isLowEnd ? 'low-power' : 'high-performance',

      // Quality settings
      pixelRatio: Math.min(window.devicePixelRatio, performanceSettings.renderScale * 2),

      // Performance hints
      failIfMajorPerformanceCaveat: !deviceCapabilities.isLowEnd,
      preserveDrawingBuffer: false,
      premultipliedAlpha: true,

      // Mobile optimizations
      ...(deviceCapabilities.isMobile && enableMobileOptimization && {
        antialias: false,
        pixelRatio: 1,
        powerPreference: 'low-power'
      })
    };
  }, [performanceSettings, deviceCapabilities, enableMobileOptimization]);

  // Get loading strategy
  const getLoadingStrategy = useCallback(() => {
    const strategy = {
      preload: true,
      progressive: false,
      priority: 'high'
    };

    // Adjust based on network conditions
    if (networkInfo.saveData || networkInfo.effectiveType === '2g') {
      strategy.preload = false;
      strategy.progressive = true;
      strategy.priority = 'low';
    }

    // Adjust based on device capabilities
    if (deviceCapabilities.isLowEnd) {
      strategy.progressive = true;
      strategy.priority = 'medium';
    }

    return strategy;
  }, [networkInfo, deviceCapabilities]);

  return {
    deviceCapabilities,
    performanceSettings,
    batteryInfo,
    networkInfo,
    getSplineConfig,
    getLoadingStrategy,
    startPerformanceMonitoring,
    stopPerformanceMonitoring,

    // Utility methods
    isHighPerformanceDevice: !deviceCapabilities.isLowEnd && !deviceCapabilities.isMobile,
    shouldReduceQuality: performanceSettings.quality === 'low' ||
                        (enableBatteryOptimization && !batteryInfo.charging && batteryInfo.level < 0.2),
    recommendedRenderScale: performanceSettings.renderScale,

    // Debug info for development
    debugInfo: process.env.NODE_ENV === 'development' ? {
      fps: frameCountRef.current,
      deviceScore: (
        (deviceCapabilities.hardwareConcurrency * 25) +
        (deviceCapabilities.deviceMemory * 12.5) +
        (deviceCapabilities.hasWebGL2 ? 25 : 0) +
        (!deviceCapabilities.isLowEnd ? 25 : 0)
      ),
      batteryOptimal: batteryInfo.charging || batteryInfo.level > 0.5,
      networkOptimal: networkInfo.effectiveType === '4g' && !networkInfo.saveData
    } : undefined
  };
};

export default useSplinePerformance;