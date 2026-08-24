/**
 * Scroll Animation Examples
 * Demonstrates all GSAP scroll animation hooks from the old Disruptors Media site
 */

import React from 'react';
import {
  useFadeInUp,
  useStaggerAnimation,
  useParallax,
  useScaleOnScroll,
  useSlideIn,
  usePinElement,
  useRevealAnimation,
  useCounterAnimation,
  useCustomScrollAnimation
} from '@/hooks/useScrollAnimation';

/**
 * Example 1: Fade In Up - Basic scroll reveal
 */
export function FadeInUpExample() {
  const ref = useFadeInUp({ distance: 60, duration: 1.2 });

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div ref={ref} className="text-center p-8">
        <h2 className="text-5xl font-bold text-white mb-4">
          Fade In Animation
        </h2>
        <p className="text-xl text-gray-400">
          This section fades in from below as you scroll
        </p>
      </div>
    </section>
  );
}

/**
 * Example 2: Stagger Animation - Service cards or features
 */
export function StaggerExample() {
  const ref = useStaggerAnimation({ stagger: 0.15, distance: 40 });

  const services = [
    { title: "AI Automation", icon: "🤖" },
    { title: "Lead Generation", icon: "🎯" },
    { title: "SEO & GEO", icon: "🔍" },
    { title: "Social Media", icon: "📱" },
    { title: "Paid Advertising", icon: "💰" },
    { title: "CRM Management", icon: "📊" }
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-black py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Our Services
        </h2>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-8 rounded-lg border border-purple-500/20 hover:border-purple-500/60 transition-all"
            >
              <div className="text-6xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold text-white">{service.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Example 3: Parallax Effect - Background or decorative elements
 */
export function ParallaxExample() {
  const parallaxRef = useParallax({ speed: 0.3 });

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Parallax Background */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center p-8">
        <h2 className="text-5xl font-bold text-white mb-4">
          Parallax Scrolling
        </h2>
        <p className="text-xl text-gray-400">
          The background moves at a different speed
        </p>
      </div>
    </section>
  );
}

/**
 * Example 4: Scale on Scroll - Images or featured content
 */
export function ScaleExample() {
  const ref = useScaleOnScroll({ fromScale: 0.7, toScale: 1 });

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
      <div ref={ref} className="max-w-4xl mx-auto p-8">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-12 rounded-2xl shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Scale Animation
          </h2>
          <p className="text-xl text-white/90">
            This card scales up as it enters the viewport
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Example 5: Slide In - Content blocks
 */
export function SlideInExample() {
  const leftRef = useSlideIn({ direction: "left", distance: 150 });
  const rightRef = useSlideIn({ direction: "right", distance: 150 });

  return (
    <section className="min-h-screen flex items-center justify-center bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Slide from Left */}
          <div ref={leftRef} className="space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Slide From Left
            </h2>
            <p className="text-lg text-gray-400">
              This content slides in from the left side as you scroll down the page.
            </p>
          </div>

          {/* Slide from Right */}
          <div ref={rightRef} className="space-y-4">
            <div className="bg-gradient-to-br from-blue-600/40 to-purple-600/40 p-8 rounded-lg border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                From The Right
              </h3>
              <p className="text-gray-300">
                And this card slides in from the right side.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Example 6: Reveal Animation - Images or hero sections
 */
export function RevealExample() {
  const ref = useRevealAnimation({ direction: "bottom", duration: 1.5 });

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-4xl mx-auto p-8">
        <div ref={ref} className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
          <h2 className="text-5xl font-bold text-white">
            Reveal Effect
          </h2>
        </div>
        <p className="text-center text-gray-400 mt-6">
          This uses clip-path for a reveal animation
        </p>
      </div>
    </section>
  );
}

/**
 * Example 7: Counter Animation - Stats section
 */
export function CounterExample() {
  const counter1 = useCounterAnimation({ from: 0, to: 500, suffix: "+" });
  const counter2 = useCounterAnimation({ from: 0, to: 98, suffix: "%", decimals: 1 });
  const counter3 = useCounterAnimation({ from: 0, to: 10, suffix: "K+" });

  return (
    <section className="min-h-screen flex items-center justify-center bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Our Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8">
            <div ref={counter1} className="text-6xl font-bold text-purple-500 mb-4">
              0+
            </div>
            <p className="text-xl text-gray-400">Clients Served</p>
          </div>
          <div className="text-center p-8">
            <div ref={counter2} className="text-6xl font-bold text-blue-500 mb-4">
              0%
            </div>
            <p className="text-xl text-gray-400">Success Rate</p>
          </div>
          <div className="text-center p-8">
            <div ref={counter3} className="text-6xl font-bold text-green-500 mb-4">
              0K+
            </div>
            <p className="text-xl text-gray-400">Leads Generated</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Example 8: Custom Complex Animation
 * Demonstrates the useCustomScrollAnimation hook for advanced effects
 */
export function CustomAnimationExample() {
  const ref = useCustomScrollAnimation(
    (element, gsap) => {
      // Create a timeline with multiple animations
      const tl = gsap.timeline();

      const heading = element.querySelector('.heading');
      const description = element.querySelector('.description');
      const cta = element.querySelector('.cta');

      tl.from(heading, {
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      })
      .from(description, {
        x: -50,
        opacity: 0,
        duration: 0.6,
      }, "-=0.3")
      .from(cta, {
        y: 30,
        opacity: 0,
        duration: 0.6,
      }, "-=0.3");

      return tl;
    },
    {
      start: "top 70%",
      toggleActions: "play none none reverse"
    },
    []
  );

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-purple-900/20">
      <div ref={ref} className="text-center p-8 max-w-3xl">
        <h2 className="heading text-6xl font-bold text-white mb-6">
          Complex Timeline
        </h2>
        <p className="description text-xl text-gray-300 mb-8">
          This animation uses a GSAP timeline to sequence multiple elements with custom easing and overlapping animations.
        </p>
        <button className="cta px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:scale-105 transition-transform">
          Get Started
        </button>
      </div>
    </section>
  );
}

/**
 * Complete Demo Page
 */
export default function ScrollAnimationDemo() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40">
        <div className="text-center p-8">
          <h1 className="text-7xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            GSAP Scroll Animations
          </h1>
          <p className="text-2xl text-gray-400 mb-8">
            Scroll down to see the animations in action
          </p>
          <div className="text-4xl animate-bounce">⬇️</div>
        </div>
      </section>

      <FadeInUpExample />
      <StaggerExample />
      <ParallaxExample />
      <ScaleExample />
      <SlideInExample />
      <RevealExample />
      <CounterExample />
      <CustomAnimationExample />

      {/* Footer */}
      <section className="py-20 bg-black text-center">
        <p className="text-gray-500">
          Disruptors AI - GSAP ScrollTrigger Animations
        </p>
      </section>
    </div>
  );
}