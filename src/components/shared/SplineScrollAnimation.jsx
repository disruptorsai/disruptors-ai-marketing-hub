import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Spline from '@splinetool/react-spline';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * SplineScrollAnimation Component
 *
 * A high-performance 3D Spline animation component integrated with GSAP ScrollTrigger
 * for scroll-based interactions. Optimized for production use with mobile performance
 * considerations and accessibility features.
 *
 * Features:
 * - Scroll-triggered 3D scene animations using GSAP ScrollTrigger
 * - Mobile-optimized performance with reduced complexity on mobile devices
 * - Lazy loading and intersection observer optimization
 * - Automatic cleanup and memory management
 * - Reduced motion support for accessibility
 * - Production-ready error handling and fallbacks
 * - Custom scroll-based scene interactions
 *
 * @param {Object} props - Component props
 * @param {string} props.scene - URL to the Spline scene file (.splinecode)
 * @param {string} props.title - Accessible title for the 3D scene
 * @param {string} props.description - Description text overlay
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.scrollTriggerOptions - Custom ScrollTrigger configuration
 * @param {boolean} props.enableMobileOptimization - Enable mobile performance optimizations
 * @param {Object} props.fallbackImage - Fallback image when Spline fails to load
 * @param {Function} props.onLoad - Callback when Spline scene loads
 * @param {Function} props.onError - Callback when Spline scene fails to load
 */
const SplineScrollAnimation = ({
  scene = "/spline-animation.splinecode",
  title = "Interactive 3D Experience",
  description = "Explore our innovative 3D world through scroll interactions",
  className = "",
  scrollTriggerOptions = {},
  enableMobileOptimization = true,
  fallbackImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2564&q=80",
  onLoad = () => {},
  onError = () => {}
}) => {
  const containerRef = useRef(null);
  const splineRef = useRef(null);
  const textRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const sceneApplicationRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Detect mobile devices and reduced motion preference
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Intersection Observer for performance optimization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Spline scene load handler
  const handleSplineLoad = useCallback((splineApp) => {
    setIsLoading(false);
    setHasError(false);
    sceneApplicationRef.current = splineApp;

    console.log('Spline scene loaded successfully');
    onLoad(splineApp);

    // Setup scroll-triggered animations after scene loads
    setupScrollAnimations(splineApp);
  }, [onLoad]);

  // Spline scene error handler
  const handleSplineError = useCallback((error) => {
    console.error('Spline scene failed to load:', error);
    setIsLoading(false);
    setHasError(true);
    onError(error);
  }, [onError]);

  // Setup GSAP ScrollTrigger animations
  const setupScrollAnimations = useCallback((splineApp) => {
    const container = containerRef.current;
    const textElement = textRef.current;

    if (!container || !splineApp) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // For users who prefer reduced motion, just show static scene
      return;
    }

    // Create main ScrollTrigger animation
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        if (!sceneApplicationRef.current) return;

        try {
          const progress = self.progress;

          // Find and animate 3D objects based on scroll progress
          // These object names should match your Spline scene objects
          const mainObject = sceneApplicationRef.current.findObjectByName('MainObject');
          const cameraTarget = sceneApplicationRef.current.findObjectByName('CameraTarget');

          if (mainObject) {
            // Rotate main object based on scroll progress
            mainObject.rotation.y = progress * Math.PI * 2;
            mainObject.rotation.x = Math.sin(progress * Math.PI) * 0.3;

            // Scale animation
            const scale = 0.8 + (Math.sin(progress * Math.PI) * 0.2);
            mainObject.scale.set(scale, scale, scale);
          }

          if (cameraTarget) {
            // Camera movement based on scroll
            cameraTarget.position.y = Math.sin(progress * Math.PI * 2) * 2;
            cameraTarget.position.x = Math.cos(progress * Math.PI * 2) * 1;
          }

          // Trigger custom Spline events based on scroll position
          if (progress > 0.3 && progress < 0.7) {
            sceneApplicationRef.current.emitEvent('mouse', 'mouseHover');
          }

        } catch (error) {
          console.warn('Error animating Spline objects:', error);
        }
      },
      onEnter: () => {
        // Animate text reveal when section enters viewport
        gsap.fromTo(textElement,
          {
            opacity: 0,
            y: 60,
            filter: 'blur(15px)',
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            duration: 1.5,
            ease: "power3.out",
            stagger: 0.1
          }
        );

        // Trigger Spline entrance animation
        try {
          sceneApplicationRef.current?.emitEvent('mouse', 'mouseDown');
        } catch (error) {
          console.warn('Error triggering Spline entrance event:', error);
        }
      },
      onLeave: () => {
        // Fade out text when leaving viewport
        gsap.to(textElement, {
          opacity: 0.4,
          scale: 0.95,
          duration: 0.8,
          ease: "power2.out"
        });
      },
      onEnterBack: () => {
        // Restore text when re-entering from below
        gsap.to(textElement, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        });
      },
      ...scrollTriggerOptions
    });

    // Additional animation timeline for complex sequences
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top center",
        end: "bottom center",
        scrub: 2,
        onUpdate: (self) => {
          // Additional complex animations can be added here
          const progress = self.progress;

          // Example: Particle effects or lighting changes
          try {
            const lightObject = sceneApplicationRef.current.findObjectByName('DirectionalLight');
            if (lightObject) {
              lightObject.intensity = 0.5 + (progress * 0.5);
            }
          } catch (error) {
            console.warn('Error animating lighting:', error);
          }
        }
      }
    });

    // Performance optimization for mobile
    if (isMobile && enableMobileOptimization) {
      // Reduce animation complexity on mobile
      scrollTriggerRef.current.vars.scrub = 2; // Slower scrub for better performance

      // Disable some complex animations on mobile
      console.log('Mobile optimization enabled for Spline scene');
    }

  }, [isMobile, enableMobileOptimization, scrollTriggerOptions]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }

      if (sceneApplicationRef.current) {
        // Cleanup Spline scene
        try {
          sceneApplicationRef.current.dispose?.();
        } catch (error) {
          console.warn('Error disposing Spline scene:', error);
        }
        sceneApplicationRef.current = null;
      }

      ScrollTrigger.refresh();
    };
  }, []);

  // Loading component
  const LoadingComponent = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading 3D Experience...</p>
        <p className="text-sm text-gray-400 mt-2">Preparing interactive content</p>
      </div>
    </div>
  );

  // Error fallback component
  const ErrorFallback = () => (
    <div className="absolute inset-0 bg-gray-900">
      <img
        src={fallbackImage}
        alt={title}
        className="w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
        <div>
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-gray-300">{description}</p>
          <p className="text-sm text-gray-500 mt-4">3D content temporarily unavailable</p>
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black ${className}`}
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
            imageRendering: isMobile && enableMobileOptimization ? 'pixelated' : 'auto'
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
        <div className="max-w-4xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            {title}
          </h2>
          <p className="text-xl sm:text-2xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            {description}
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-70 z-20">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium tracking-wide uppercase">Scroll to interact</span>
          <div className="w-px h-12 bg-white/50 animate-pulse" />
        </div>
      </div>

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded z-30">
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Intersecting: {isIntersecting ? 'Yes' : 'No'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {hasError ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* Gradient Overlays for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
    </section>
  );
};

export default SplineScrollAnimation;