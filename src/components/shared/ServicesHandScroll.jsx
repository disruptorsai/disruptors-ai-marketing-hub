import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Spline from '@splinetool/react-spline';

gsap.registerPlugin(ScrollTrigger);

/**
 * ServicesHandScroll Component
 *
 * Scroll-triggered Spline hand animation for the services/solutions page.
 * Animates hand imagery and service graphics based on scroll position using GSAP.
 *
 * Scene Objects:
 * - hand-srv.png: Main hand image
 * - services-img.png: Service graphics
 * - Text: Text element
 * - srv-cont-bg.e12b85655a1a0b7c9fde.jpg: Background image
 *
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.title - Hero title text
 * @param {string} props.description - Hero description text
 */
const ServicesHandScroll = ({
  className = "",
  title = "Our Services",
  description = "Transform your business with AI-powered solutions"
}) => {
  const containerRef = useRef(null);
  const splineRef = useRef(null);
  const textRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Spline scene load handler
  const handleSplineLoad = useCallback((splineApp) => {
    console.log('✅ Services hand scene loaded');
    setIsLoading(false);
    setHasError(false);
    splineRef.current = splineApp;

    // Setup scroll animations after scene loads
    setTimeout(() => setupScrollAnimations(splineApp), 100);
  }, []);

  // Spline scene error handler
  const handleSplineError = useCallback((error) => {
    console.error('❌ Spline scene failed:', error);
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Setup GSAP ScrollTrigger animations
  const setupScrollAnimations = useCallback((splineApp) => {
    const container = containerRef.current;
    if (!container || !splineApp) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Find scene objects
    let handObject, servicesObject, textObject, bgObject, cameraObject;

    try {
      handObject = splineApp.findObjectByName('hand-srv.png');
      servicesObject = splineApp.findObjectByName('services-img.png');
      textObject = splineApp.findObjectByName('Text');
      bgObject = splineApp.findObjectByName('srv-cont-bg.e12b85655a1a0b7c9fde.jpg');
      cameraObject = splineApp.findObjectByName('Camera');

      console.log('🎯 Objects found:', {
        hand: !!handObject,
        services: !!servicesObject,
        text: !!textObject,
        background: !!bgObject,
        camera: !!cameraObject
      });
    } catch (error) {
      console.warn('⚠️ Error finding objects:', error);
    }

    // Store initial positions
    const initialPositions = {
      hand: handObject ? { ...handObject.position } : null,
      services: servicesObject ? { ...servicesObject.position } : null,
      camera: cameraObject ? { ...cameraObject.position } : null,
      bg: bgObject ? { ...bgObject.position } : null
    };

    const initialRotations = {
      hand: handObject ? { ...handObject.rotation } : null,
      services: servicesObject ? { ...servicesObject.rotation } : null
    };

    // PERMANENTLY set services image to be fully visible (no animation)
    if (servicesObject) {
      servicesObject.visible = true;
      // Lock visibility and opacity permanently
      if (servicesObject.material) {
        servicesObject.material.opacity = 1;
        servicesObject.material.transparent = false; // Changed to false - fully opaque, no transparency
        servicesObject.material.needsUpdate = true;
      }
      // Prevent any scale changes
      if (servicesObject.scale) {
        servicesObject.scale.set(servicesObject.scale.x, servicesObject.scale.y, servicesObject.scale.z);
      }
    }

    // Main scroll trigger with improved scrub for 3D performance
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top 20%", // Start later - when top of container is 20% from top of viewport
      end: "bottom 40%", // End later - when bottom of container is 40% from top of viewport
      scrub: 3, // Increased from 2 to 3 for even smoother, slower animation
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          try {
            // Animate hand - smooth rotation only (even slower rotation)
            if (handObject && initialRotations.hand) {
              gsap.to(handObject.rotation, {
                z: initialRotations.hand.z + (progress * Math.PI * 0.08), // Reduced from 0.15 to 0.08 for slower rotation
                duration: 0.1,
                ease: "none",
                overwrite: true
              });
            }

            // Services image - PERMANENTLY VISIBLE, NO ANIMATION
            // (Animation removed - keeping it static and always visible)

            // Animate background - slow parallax
            if (bgObject && initialPositions.bg) {
              gsap.to(bgObject.position, {
                y: initialPositions.bg.y + (progress * 100),
                x: initialPositions.bg.x - (progress * 30),
                duration: 0.1,
                ease: "none",
                overwrite: true
              });
            }

            // Camera movement for depth
            if (cameraObject && initialPositions.camera) {
              gsap.to(cameraObject.position, {
                y: initialPositions.camera.y - (progress * 50),
                z: initialPositions.camera.z + (progress * 30),
                duration: 0.1,
                ease: "none",
                overwrite: true
              });
            }

            // Text fade based on scroll position
            if (textObject && textObject.material) {
              const textOpacity = Math.max(0, 1 - (progress * 1.5));
              textObject.material.opacity = textOpacity;
            }

          } catch (error) {
            console.warn('⚠️ Animation error:', error);
          }
        });
      }
    });

    // Increased scrub on mobile for better performance
    if (isMobile) {
      scrollTriggerRef.current.vars.scrub = 4;
    }

  }, [isMobile]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden ${className}`}
      style={{ background: 'transparent' }}
      role="region"
      aria-label="Services hero section with 3D animation"
    >
      {/* Spline 3D Scene */}
      {!hasError && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <Spline
            scene={`https://prod.spline.design/XBh0IU16gBCVNZ0V/scene.splinecode?v=${Date.now()}`}
            onLoad={handleSplineLoad}
            onError={handleSplineError}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              willChange: 'transform',
              transform: 'translateZ(0)'
            }}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading experience...</p>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-xl text-gray-600">{description}</p>
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex flex-col items-center space-y-2 text-gray-700">
          <span className="text-sm font-medium tracking-wide uppercase">Scroll to explore</span>
          <div className="w-px h-12 bg-gray-700/50 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default ServicesHandScroll;
