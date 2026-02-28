import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Spline from '@splinetool/react-spline';
import { useSplinePerformance } from '../../hooks/useSplinePerformance';
import {
  SplineAnimationManager,
  scrollAnimationUtils,
  findObjectSafely,
  createScrollAnimationPreset
} from '../../utils/splineAnimations';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * SplineScrollAnimationEnhanced Component
 *
 * Production-ready 3D Spline animation component with comprehensive GSAP ScrollTrigger
 * integration, advanced performance optimizations, and professional animation presets.
 *
 * Key Features:
 * - Advanced scroll-triggered 3D scene animations with smooth interpolation
 * - Intelligent performance management with adaptive quality adjustments
 * - Mobile-first responsive design with battery and network optimization
 * - Professional animation presets for common marketing use cases
 * - Comprehensive error handling and graceful degradation
 * - Memory management and cleanup for production environments
 * - Accessibility compliance with reduced motion support
 * - Real-time performance monitoring and optimization
 *
 * @param {Object} props - Component props
 * @param {string} props.scene - URL to the Spline scene file (.splinecode)
 * @param {string} props.title - Accessible title for the 3D scene
 * @param {string} props.description - Description text overlay
 * @param {string} props.animationPreset - Animation preset ('rotate', 'scale', 'float', 'spiral', 'bounce')
 * @param {Object} props.customAnimations - Custom animation configuration
 * @param {Array<string>} props.targetObjects - Object names to animate in the scene
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.scrollTriggerOptions - Custom ScrollTrigger configuration
 * @param {boolean} props.enableMobileOptimization - Enable mobile performance optimizations
 * @param {Object} props.fallbackImage - Fallback image when Spline fails to load
 * @param {Function} props.onLoad - Callback when Spline scene loads
 * @param {Function} props.onError - Callback when Spline scene fails to load
 * @param {boolean} props.showPerformanceIndicator - Show performance debug info (dev only)
 */
const SplineScrollAnimationEnhanced = ({
  scene = "/spline-animation.splinecode",
  title = "Interactive 3D Experience",
  description = "Scroll to explore our AI-powered innovation in 3D",
  animationPreset = "rotate",
  customAnimations = {},
  targetObjects = ["MainObject", "CameraTarget", "DirectionalLight", "ParticleSystem"],
  className = "",
  scrollTriggerOptions = {},
  enableMobileOptimization = true,
  fallbackImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2564&q=80",
  onLoad = () => {},
  onError = () => {},
  showPerformanceIndicator = false
}) => {
  const containerRef = useRef(null);
  const splineRef = useRef(null);
  const textRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const sceneApplicationRef = useRef(null);
  const animationManagerRef = useRef(null);
  const sceneObjectsRef = useRef({});

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Performance management hook
  const {
    deviceCapabilities,
    performanceSettings,
    getSplineConfig,
    getLoadingStrategy,
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    isHighPerformanceDevice,
    shouldReduceQuality,
    debugInfo
  } = useSplinePerformance({
    enableMobileOptimization,
    enableAdaptiveQuality: true,
    targetFPS: 60,
    enableBatteryOptimization: true
  });

  // Initialize animation manager
  useEffect(() => {
    return () => {
      if (animationManagerRef.current) {
        animationManagerRef.current.stop();
        animationManagerRef.current = null;
      }
      stopPerformanceMonitoring();
    };
  }, [stopPerformanceMonitoring]);

  // Intersection Observer for performance optimization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);

        // Pause animations when not visible for performance
        if (animationManagerRef.current) {
          if (entry.isIntersecting) {
            animationManagerRef.current.start();
          } else {
            animationManagerRef.current.stop();
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px'
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Find and cache scene objects
  const cacheSceneObjects = useCallback(async (splineApp) => {
    const objects = {};

    for (const objectName of targetObjects) {
      try {
        const object = await findObjectSafely(splineApp, objectName, 3000);
        objects[objectName] = object;
        console.log(`Found and cached object: ${objectName}`);
      } catch (error) {
        console.warn(`Could not find object: ${objectName}`, error);
      }
    }

    sceneObjectsRef.current = objects;
    return objects;
  }, [targetObjects]);

  // Spline scene load handler with enhanced setup
  const handleSplineLoad = useCallback(async (splineApp) => {
    setIsLoading(false);
    setHasError(false);
    sceneApplicationRef.current = splineApp;

    try {
      // Initialize animation manager
      animationManagerRef.current = new SplineAnimationManager(splineApp);

      // Cache scene objects
      await cacheSceneObjects(splineApp);

      // Setup scroll-triggered animations
      setupScrollAnimations(splineApp);

      // Start performance monitoring
      startPerformanceMonitoring();

      console.log('Spline scene loaded and configured successfully');
      onLoad(splineApp);

    } catch (error) {
      console.error('Error setting up Spline scene:', error);
      setHasError(true);
      onError(error);
    }
  }, [onLoad, onError, cacheSceneObjects, startPerformanceMonitoring]);

  // Enhanced scroll animations setup
  const setupScrollAnimations = useCallback((splineApp) => {
    const container = containerRef.current;
    const textElement = textRef.current;

    if (!container || !splineApp) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // For users who prefer reduced motion, only show subtle animations
      gsap.set(textElement, { opacity: 1 });
      return;
    }

    // Get animation preset function
    const animationFunction = createScrollAnimationPreset(animationPreset, customAnimations);

    // Create main ScrollTrigger animation with enhanced performance
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      end: "bottom top",
      scrub: shouldReduceQuality ? 2 : 1, // Adjust scrub speed based on performance
      invalidateOnRefresh: true,
      refreshPriority: 1,
      onUpdate: (self) => {
        if (!sceneApplicationRef.current || !isIntersecting) return;

        try {
          const progress = self.progress;
          const objects = sceneObjectsRef.current;

          // Apply preset animation to main object
          const mainObject = objects.MainObject;
          if (mainObject) {
            const animationData = animationFunction(progress);

            if (animationData.x !== undefined || animationData.y !== undefined || animationData.z !== undefined) {
              // Position animation
              if (animationData.x !== undefined) mainObject.position.x = animationData.x;
              if (animationData.y !== undefined) mainObject.position.y = animationData.y;
              if (animationData.z !== undefined) mainObject.position.z = animationData.z;
            } else {
              // Rotation animation (default)
              mainObject.rotation.y = progress * Math.PI * 2;
              mainObject.rotation.x = Math.sin(progress * Math.PI) * 0.3;
              mainObject.rotation.z = Math.cos(progress * Math.PI * 2) * 0.1;
            }

            // Scale animation with bounce effect
            const baseScale = 0.8 + (Math.sin(progress * Math.PI) * 0.2);
            const bounceScale = 1 + Math.sin(progress * Math.PI * 6) * 0.05;
            const finalScale = baseScale * bounceScale;
            mainObject.scale.set(finalScale, finalScale, finalScale);
          }

          // Camera movement for cinematic effect
          const cameraTarget = objects.CameraTarget;
          if (cameraTarget && isHighPerformanceDevice) {
            const spiralMotion = scrollAnimationUtils.scrollToSpiralMotion(progress, 1.5, 2);
            cameraTarget.position.y = spiralMotion.y;
            cameraTarget.position.x = spiralMotion.x;
            cameraTarget.position.z = spiralMotion.z;
          }

          // Dynamic lighting based on scroll
          const light = objects.DirectionalLight;
          if (light) {
            light.intensity = 0.3 + (progress * 0.7);

            // Color temperature shift
            const temperature = 0.5 + (Math.sin(progress * Math.PI) * 0.5);
            if (light.color) {
              light.color.setHSL(0.6, 0.8, temperature);
            }
          }

          // Particle system activation
          const particles = objects.ParticleSystem;
          if (particles && isHighPerformanceDevice) {
            // Trigger particle effects at certain scroll points
            if (progress > 0.3 && progress < 0.7) {
              try {
                sceneApplicationRef.current.emitEvent('mouse', 'mouseHover');
              } catch (e) {
                // Ignore if event doesn't exist
              }
            }
          }

          // Performance-based quality adjustment
          if (!isHighPerformanceDevice && progress % 0.1 < 0.05) {
            // Only update on every 10% of scroll for low-end devices
            return;
          }

        } catch (error) {
          console.warn('Error in scroll animation update:', error);
        }
      },
      onEnter: () => {
        // Enhanced text reveal animation
        gsap.fromTo(textElement,
          {
            opacity: 0,
            y: 80,
            filter: 'blur(20px)',
            scale: 0.8,
            rotationX: 15
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            rotationX: 0,
            duration: 2,
            ease: "power3.out",
            stagger: 0.1
          }
        );

        // Trigger Spline entrance effects
        try {
          sceneApplicationRef.current?.emitEvent('mouse', 'mouseDown');

          // Add entrance animation to cached objects
          const objects = sceneObjectsRef.current;
          if (objects.MainObject && animationManagerRef.current) {
            animationManagerRef.current.addAnimation('entrance', {
              duration: 2000,
              update: (progress) => {
                const scale = 0.5 + (progress * 0.5);
                objects.MainObject.scale.set(scale, scale, scale);
              }
            });
          }
        } catch (error) {
          console.warn('Error triggering entrance animation:', error);
        }
      },
      onLeave: () => {
        // Smooth exit animation
        gsap.to(textElement, {
          opacity: 0.3,
          scale: 0.9,
          filter: 'blur(5px)',
          duration: 1,
          ease: "power2.out"
        });
      },
      onEnterBack: () => {
        // Re-entrance animation
        gsap.to(textElement, {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: "power2.out"
        });
      },
      ...scrollTriggerOptions
    });

    // Secondary animation timeline for complex sequences
    if (isHighPerformanceDevice) {
      gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top center",
          end: "bottom center",
          scrub: 3,
          onUpdate: (self) => {
            const progress = self.progress;
            const objects = sceneObjectsRef.current;

            // Advanced lighting effects
            if (objects.DirectionalLight) {
              const intensity = 0.2 + (Math.sin(progress * Math.PI * 2) * 0.3);
              objects.DirectionalLight.intensity = Math.max(0, intensity);
            }

            // Camera shake for dynamic feel
            if (objects.CameraTarget && progress > 0.5) {
              const shake = (progress - 0.5) * 0.1;
              objects.CameraTarget.position.x += (Math.random() - 0.5) * shake;
              objects.CameraTarget.position.y += (Math.random() - 0.5) * shake;
            }
          }
        }
      });
    }

  }, [animationPreset, customAnimations, isHighPerformanceDevice, shouldReduceQuality, scrollTriggerOptions]);

  // Spline scene error handler
  const handleSplineError = useCallback((error) => {
    console.error('Spline scene failed to load:', error);
    setIsLoading(false);
    setHasError(true);
    onError(error);
    stopPerformanceMonitoring();
  }, [onError, stopPerformanceMonitoring]);

  // Loading progress simulation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }

      if (animationManagerRef.current) {
        animationManagerRef.current.stop();
        animationManagerRef.current = null;
      }

      if (sceneApplicationRef.current) {
        try {
          sceneApplicationRef.current.dispose?.();
        } catch (error) {
          console.warn('Error disposing Spline scene:', error);
        }
        sceneApplicationRef.current = null;
      }

      sceneObjectsRef.current = {};
      ScrollTrigger.refresh();
    };
  }, []);

  // Enhanced loading component with progress
  const LoadingComponent = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <div className="text-center text-white max-w-md px-6">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
          <div
            className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
            style={{
              animationDuration: shouldReduceQuality ? '2s' : '1s'
            }}
          ></div>
        </div>

        <h3 className="text-xl font-bold mb-2">Loading 3D Experience</h3>
        <p className="text-sm text-gray-300 mb-4">Preparing interactive content</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${loadProgress}%` }}
          ></div>
        </div>

        <div className="text-xs text-gray-400">
          {loadProgress < 100 ? `${Math.round(loadProgress)}% loaded` : 'Initializing...'}
        </div>

        {shouldReduceQuality && (
          <div className="mt-4 text-xs text-gold-shine">
            Performance mode: Optimizing for your device
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced error fallback component
  const ErrorFallback = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
      <img
        src={fallbackImage}
        alt={title}
        className="w-full h-full object-cover opacity-50"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />
      <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
        <div className="max-w-lg">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-gray-300 mb-4">{description}</p>
          <p className="text-sm text-gray-500">
            Interactive 3D content is temporarily unavailable
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Static experience optimized for your connection
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-black ${className}`}
      role="region"
      aria-label="Interactive 3D experience section"
    >
      {/* Spline 3D Scene */}
      {isIntersecting && !hasError && (
        <div
          ref={splineRef}
          className="absolute inset-0 w-full h-full"
          style={{
            // Performance optimizations
            transform: 'translateZ(0)',
            willChange: isLoading ? 'auto' : 'transform',
            // Reduce quality on mobile for better performance
            imageRendering: shouldReduceQuality ? 'pixelated' : 'auto'
          }}
        >
          <Spline
            scene={scene}
            onLoad={handleSplineLoad}
            onError={handleSplineError}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent'
            }}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasError && <LoadingComponent />}

      {/* Error State */}
      {hasError && <ErrorFallback />}

      {/* Content Overlay */}
      <div
        ref={textRef}
        className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <div className="max-w-5xl">
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            {title}
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-200 font-light max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
            {description}
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-70 z-20">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium tracking-wide uppercase">Scroll to interact</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/70 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Performance indicator for development */}
      {(process.env.NODE_ENV === 'development' || showPerformanceIndicator) && debugInfo && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white text-xs p-3 rounded-lg z-30 font-mono">
          <div className="space-y-1">
            <div>Device: {deviceCapabilities.isMobile ? 'Mobile' : 'Desktop'}</div>
            <div>Performance: {performanceSettings.quality}</div>
            <div>Intersecting: {isIntersecting ? 'Yes' : 'No'}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Error: {hasError ? 'Yes' : 'No'}</div>
            <div>FPS: {debugInfo.fps || 'N/A'}</div>
            <div>Score: {Math.round(debugInfo.deviceScore || 0)}</div>
            <div>Battery: {debugInfo.batteryOptimal ? '✓' : '⚠'}</div>
            <div>Network: {debugInfo.networkOptimal ? '✓' : '⚠'}</div>
          </div>
        </div>
      )}

      {/* Gradient Overlays for Enhanced Visual Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-teal-900/20 pointer-events-none" />

      {/* Additional visual effects for high-performance devices */}
      {isHighPerformanceDevice && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent pointer-events-none animate-pulse"
               style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
               style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </>
      )}
    </section>
  );
};

export default SplineScrollAnimationEnhanced;