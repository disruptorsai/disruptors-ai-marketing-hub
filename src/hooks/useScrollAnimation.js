/**
 * useScrollAnimation Hook
 * Reusable GSAP ScrollTrigger animations for the Disruptors AI site
 * Based on patterns from the original Disruptors Media site (GSAP 3.12.5)
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Fade in from bottom animation
 * @param {Object} options - Animation options
 * @param {number} options.distance - Distance to travel (default: 50px)
 * @param {number} options.duration - Animation duration (default: 1s)
 * @param {string} options.start - ScrollTrigger start position (default: "top 80%")
 * @param {boolean} options.scrub - Whether to scrub animation (default: true)
 */
export function useFadeInUp(options = {}) {
  const ref = useRef(null);
  const {
    distance = 50,
    duration = 1,
    start = "top 80%",
    end = "top 50%",
    scrub = 1,
    markers = false
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animation = gsap.fromTo(
      element,
      {
        opacity: 0,
        y: distance,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start,
          end,
          scrub,
          markers,
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [distance, duration, start, end, scrub, markers]);

  return ref;
}

/**
 * Stagger children animation
 * @param {Object} options - Animation options
 * @param {number} options.stagger - Stagger delay between children (default: 0.2s)
 * @param {string} options.childSelector - CSS selector for children (default: direct children)
 */
export function useStaggerAnimation(options = {}) {
  const ref = useRef(null);
  const {
    stagger = 0.2,
    distance = 30,
    duration = 0.8,
    start = "top 75%",
    childSelector = "> *",
    markers = false
  } = options;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = childSelector === "> *"
      ? Array.from(container.children)
      : container.querySelectorAll(childSelector);

    const animation = gsap.fromTo(
      children,
      {
        opacity: 0,
        y: distance,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start,
          markers,
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [stagger, distance, duration, start, childSelector, markers]);

  return ref;
}

/**
 * Parallax scrolling effect
 * @param {Object} options - Animation options
 * @param {number} options.speed - Parallax speed multiplier (default: 0.5)
 */
export function useParallax(options = {}) {
  const ref = useRef(null);
  const { speed = 0.5, markers = false } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animation = gsap.to(element, {
      y: () => window.innerHeight * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        markers,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [speed, markers]);

  return ref;
}

/**
 * Scale on scroll animation
 * @param {Object} options - Animation options
 */
export function useScaleOnScroll(options = {}) {
  const ref = useRef(null);
  const {
    fromScale = 0.8,
    toScale = 1,
    duration = 1,
    start = "top 80%",
    end = "top 30%",
    scrub = 1,
    markers = false
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animation = gsap.fromTo(
      element,
      {
        scale: fromScale,
        opacity: 0,
      },
      {
        scale: toScale,
        opacity: 1,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start,
          end,
          scrub,
          markers,
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [fromScale, toScale, duration, start, end, scrub, markers]);

  return ref;
}

/**
 * Slide in from side animation
 * @param {Object} options - Animation options
 */
export function useSlideIn(options = {}) {
  const ref = useRef(null);
  const {
    direction = "left", // left, right, top, bottom
    distance = 100,
    duration = 1,
    start = "top 80%",
    end = "top 50%",
    scrub = 1,
    markers = false
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const axis = direction === "left" || direction === "right" ? "x" : "y";
    const multiplier = direction === "left" || direction === "top" ? -1 : 1;

    const animation = gsap.fromTo(
      element,
      {
        opacity: 0,
        [axis]: distance * multiplier,
      },
      {
        opacity: 1,
        [axis]: 0,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start,
          end,
          scrub,
          markers,
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [direction, distance, duration, start, end, scrub, markers]);

  return ref;
}

/**
 * Pin element while scrolling
 * @param {Object} options - Animation options
 */
export function usePinElement(options = {}) {
  const ref = useRef(null);
  const {
    start = "top top",
    end = "bottom bottom",
    pin = true,
    markers = false
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const st = ScrollTrigger.create({
      trigger: element,
      start,
      end,
      pin,
      markers,
    });

    return () => {
      st.kill();
    };
  }, [start, end, pin, markers]);

  return ref;
}

/**
 * Reveal animation (clip-path or mask effect)
 * @param {Object} options - Animation options
 */
export function useRevealAnimation(options = {}) {
  const ref = useRef(null);
  const {
    direction = "bottom", // bottom, top, left, right
    duration = 1.2,
    start = "top 70%",
    markers = false
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let fromClip, toClip;
    switch (direction) {
      case "bottom":
        fromClip = "inset(100% 0% 0% 0%)";
        toClip = "inset(0% 0% 0% 0%)";
        break;
      case "top":
        fromClip = "inset(0% 0% 100% 0%)";
        toClip = "inset(0% 0% 0% 0%)";
        break;
      case "left":
        fromClip = "inset(0% 100% 0% 0%)";
        toClip = "inset(0% 0% 0% 0%)";
        break;
      case "right":
        fromClip = "inset(0% 0% 0% 100%)";
        toClip = "inset(0% 0% 0% 0%)";
        break;
      default:
        fromClip = "inset(100% 0% 0% 0%)";
        toClip = "inset(0% 0% 0% 0%)";
    }

    const animation = gsap.fromTo(
      element,
      {
        clipPath: fromClip,
      },
      {
        clipPath: toClip,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start,
          markers,
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [direction, duration, start, markers]);

  return ref;
}

/**
 * Counter animation (number counting up)
 * @param {Object} options - Animation options
 */
export function useCounterAnimation(options = {}) {
  const ref = useRef(null);
  const {
    from = 0,
    to = 100,
    duration = 2,
    start = "top 80%",
    markers = false,
    decimals = 0,
    suffix = ""
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const counter = { value: from };

    const animation = gsap.to(counter, {
      value: to,
      duration,
      ease: "power1.out",
      onUpdate: () => {
        element.textContent = counter.value.toFixed(decimals) + suffix;
      },
      scrollTrigger: {
        trigger: element,
        start,
        markers,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [from, to, duration, start, markers, decimals, suffix]);

  return ref;
}

/**
 * Custom ScrollTrigger hook for advanced use cases
 * @param {Function} animationFn - Function that returns GSAP animation
 * @param {Object} scrollTriggerOptions - ScrollTrigger options
 */
export function useCustomScrollAnimation(animationFn, scrollTriggerOptions = {}, dependencies = []) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animation = animationFn(element, gsap);

    if (scrollTriggerOptions) {
      ScrollTrigger.create({
        trigger: element,
        ...scrollTriggerOptions,
        animation,
      });
    }

    return () => {
      if (animation?.scrollTrigger) {
        animation.scrollTrigger.kill();
      }
      if (animation?.kill) {
        animation.kill();
      }
    };
  }, dependencies);

  return ref;
}