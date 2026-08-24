import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for creating parallax scroll effects
 * @param {Object} options - Configuration options
 * @param {number} options.speed - Parallax speed multiplier (default: 0.5, lower = slower)
 * @param {string} options.direction - Direction of parallax: 'up', 'down', 'left', 'right' (default: 'up')
 * @param {number} options.scale - Scale transformation (default: 1, >1 for zoom out effect)
 * @param {boolean} options.scrub - Enable smooth scrubbing (default: true)
 * @returns {Object} - Ref object to attach to the element
 */
export function useParallax({
  speed = 0.5,
  direction = 'up',
  scale = 1,
  scrub = true
} = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Calculate movement based on direction
    const getMovement = (value) => {
      switch (direction) {
        case 'up':
          return { y: value };
        case 'down':
          return { y: -value };
        case 'left':
          return { x: value };
        case 'right':
          return { x: -value };
        default:
          return { y: value };
      }
    };

    // Create parallax animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          ...getMovement(0),
          scale: scale,
        },
        {
          ...getMovement(100 * speed),
          scale: scale > 1 ? 1 : scale,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: scrub ? 1 : false,
            invalidateOnRefresh: true,
          },
        }
      );
    }, element);

    return () => ctx.revert();
  }, [speed, direction, scale, scrub]);

  return elementRef;
}

/**
 * Custom hook for creating layered parallax effects (multiple layers at different speeds)
 * @param {Array} layers - Array of layer configurations [{speed, direction, scale}]
 * @returns {Array} - Array of ref objects for each layer
 */
export function useLayeredParallax(layers = []) {
  const refsArray = useRef(layers.map(() => ({ current: null })));

  useEffect(() => {
    const animations = refsArray.current.map((ref, index) => {
      const element = ref.current;
      if (!element) return null;

      const { speed = 0.5, direction = 'up', scale = 1, scrub = true } = layers[index] || {};

      const getMovement = (value) => {
        switch (direction) {
          case 'up':
            return { y: value };
          case 'down':
            return { y: -value };
          case 'left':
            return { x: value };
          case 'right':
            return { x: -value };
          default:
            return { y: value };
        }
      };

      return gsap.fromTo(
        element,
        {
          ...getMovement(0),
          scale: scale,
        },
        {
          ...getMovement(100 * speed),
          scale: scale > 1 ? 1 : scale,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: scrub ? 1 : false,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    return () => {
      animations.forEach((anim) => {
        if (anim && anim.scrollTrigger) {
          anim.scrollTrigger.kill();
        }
        if (anim) {
          anim.kill();
        }
      });
    };
  }, [layers]);

  return refsArray.current;
}

/**
 * Custom hook for image parallax with scale effect
 * Perfect for background images that zoom and move
 * @param {Object} options - Configuration options
 * @param {number} options.speed - Movement speed (default: 0.3)
 * @param {number} options.scaleFrom - Starting scale (default: 1.2)
 * @param {number} options.scaleTo - Ending scale (default: 1)
 * @returns {Object} - Ref object to attach to the image
 */
export function useImageParallax({
  speed = 0.3,
  scaleFrom = 1.2,
  scaleTo = 1
} = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          y: -50 * speed,
          scale: scaleFrom,
        },
        {
          y: 50 * speed,
          scale: scaleTo,
          ease: 'none',
          scrollTrigger: {
            trigger: element.parentElement || element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    }, element);

    return () => ctx.revert();
  }, [speed, scaleFrom, scaleTo]);

  return elementRef;
}
