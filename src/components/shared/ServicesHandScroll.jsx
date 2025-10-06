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

    // Ensure services image stays visible - it's an image plane with no material
    if (servicesObject) {
      servicesObject.visible = true;
    }

    // Main scroll trigger with improved scrub for 3D performance
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom top",
      scrub: 2, // Increased scrub for smoother 3D animations
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          try {
            // Animate hand - smooth rotation only
            if (handObject && initialRotations.hand) {
              gsap.to(handObject.rotation, {
                z: initialRotations.hand.z + (progress * Math.PI * 0.5),
                duration: 0.1,
                ease: "none",
                overwrite: true
              });
            }

            // Animate services image - KEEP IT VISIBLE, minimal movement
            if (servicesObject && initialPositions.services && initialRotations.services) {
              // Very subtle horizontal sway only - NO vertical movement
              const newX = initialPositions.services.x + (Math.sin(progress * Math.PI * 2) * 10);

              gsap.to(servicesObject.position, {
                x: newX,
                // y stays at initial position - don't move it down off screen!
                duration: 0.1,
                ease: "none",
                overwrite: true
              });

              // Very subtle rotation
              gsap.to(servicesObject.rotation, {
                z: initialRotations.services.z - (progress * Math.PI * 0.1),
                duration: 0.1,
                ease: "none",
                overwrite: true
              });
            }

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
      scrollTriggerRef.current.vars.scrub = 3;
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
