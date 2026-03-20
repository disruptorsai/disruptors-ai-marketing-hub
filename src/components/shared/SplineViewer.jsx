import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * SplineViewer Component
 *
 * A high-performance interactive Spline 3D animation component with
 * GSAP ScrollTrigger integration for scroll-based animation control.
 *
 * Features:
 * - Interactive 3D Spline scene with scroll-triggered animations
 * - Optimized loading and performance management
 * - Mobile-responsive with touch support
 * - Automatic cleanup and memory management
 * - Accessibility support with reduced motion
 * - Progressive enhancement with fallback
 *
 * @param {Object} props - Component props
 * @param {string} props.splineUrl - URL to the Spline scene
 * @param {string} props.title - Accessible title for the 3D scene
 * @param {string} props.description - Description text overlay
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.scrollTriggerOptions - Custom ScrollTrigger configuration
 * @param {string} props.fallbackImage - Fallback image URL if Spline fails to load
 */
const SplineViewer = ({
  splineUrl = "https://prod.spline.design/lylivpxHMsRXq3dw/scene.splinecode",
  title = "AI Innovation in 3D",
  description = "Experience our cutting-edge AI solutions through interactive 3D visualization",
  className = "",
  scrollTriggerOptions = {},
  fallbackImage = "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/v1/disruptors-media/3d-fallback.jpg"
}) => {
  const containerRef = useRef(null);
  const splineRef = useRef(null);
  const textRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;

    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Load Spline viewer script dynamically
    const loadSplineViewer = async () => {
      try {
        // Check if spline-viewer is already loaded
        if (!customElements.get('spline-viewer')) {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = 'https://unpkg.com/@splinetool/viewer@1.10.71/build/spline-viewer.js';
          script.onload = () => {
            console.log('Spline viewer loaded successfully');
            initializeSplineViewer();
          };
          script.onerror = () => {
            console.error('Failed to load Spline viewer');
            setHasError(true);
          };
          document.head.appendChild(script);
        } else {
          initializeSplineViewer();
        }
      } catch (error) {
        console.error('Error loading Spline viewer:', error);
        setHasError(true);
      }
    };

    const initializeSplineViewer = () => {
      if (splineRef.current) {
        // Create spline-viewer element
        const splineViewer = document.createElement('spline-viewer');
        splineViewer.setAttribute('url', splineUrl);
        splineViewer.style.width = '100%';
        splineViewer.style.height = '100%';
        splineViewer.style.background = 'transparent';

        // Handle Spline viewer events
        splineViewer.addEventListener('load', () => {
          console.log('Spline scene loaded');
          setIsLoaded(true);
          setupScrollAnimations();
        });

        splineViewer.addEventListener('error', (e) => {
          console.error('Spline scene failed to load:', e);
          setHasError(true);
        });

        // Add to container
        splineRef.current.appendChild(splineViewer);
      }
    };

    const setupScrollAnimations = () => {
      if (prefersReducedMotion) {
        // For users who prefer reduced motion, just show static scene
        return;
      }

      // Create ScrollTrigger animation for 3D scene interaction
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 1, // Smooth scrubbing with 1-second lag
        onUpdate: (self) => {
          const progress = self.progress;
          const splineViewer = splineRef.current?.querySelector('spline-viewer');

          if (splineViewer && splineViewer.contentDocument) {
            // Control 3D scene based on scroll progress
            // This requires access to Spline's internal API which may be limited
            // For now, we'll animate the container transform
            const rotationY = progress * 360; // Full rotation over scroll
            const scale = 0.8 + (progress * 0.4); // Scale from 0.8 to 1.2

            gsap.set(splineViewer, {
              rotationY: rotationY,
              scale: scale,
              transformOrigin: "center center",
              force3D: true
            });
          }
        },
        onEnter: () => {
          // Animate text reveal when section enters viewport
          gsap.fromTo(textElement,
            {
              opacity: 0,
              y: 50,
              filter: 'blur(10px)'
            },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 1.2,
              ease: "power2.out"
            }
          );
        },
        onLeave: () => {
          // Fade out text when leaving viewport
          gsap.to(textElement, {
            opacity: 0.3,
            duration: 0.5,
            ease: "power2.out"
          });
        },
        onEnterBack: () => {
          // Restore text when re-entering from below
          gsap.to(textElement, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
          });
        },
        ...scrollTriggerOptions
      });
    };

    // Initialize Spline viewer
    loadSplineViewer();

    // Cleanup function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [splineUrl, scrollTriggerOptions]);

  // Cleanup on unmount
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
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 ${className}`}
      role="region"
      aria-label="Interactive 3D showcase section"
    >
      {/* Spline 3D Viewer Container */}
      <div
        ref={splineRef}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: isLoaded && !hasError ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />

      {/* Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading 3D Experience...</p>
          </div>
        </div>
      )}

      {/* Error State / Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={fallbackImage}
            alt={title}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.7)' }}
          />
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

      {/* Content Overlay */}
      <div
        ref={textRef}
        className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="max-w-4xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-xl sm:text-2xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Interactive Hint */}
          {isLoaded && !hasError && (
            <div className="mt-8">
              <p className="text-sm text-gray-400 uppercase tracking-wide">
                Scroll to interact • Drag to explore
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-70 z-10">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium tracking-wide uppercase">
            {isLoaded && !hasError ? 'Scroll to animate' : 'Scroll to explore'}
          </span>
          <div className="w-px h-12 bg-white/50 animate-pulse" />
        </div>
      </div>

      {/* Performance hint */}
      <link rel="preconnect" href="https://prod.spline.design" />
      <link rel="dns-prefetch" href="https://unpkg.com" />
    </section>
  );
};

export default SplineViewer;