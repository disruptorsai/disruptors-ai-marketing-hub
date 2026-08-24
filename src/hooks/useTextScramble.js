import { useEffect, useRef, useState } from 'react';

/**
 * High-end text scramble effect hook
 * Activates after sustained hover with customizable animation parameters
 *
 * @param {Object} options - Configuration options
 * @param {number} options.hoverDelay - Delay in ms before effect starts (default: 2000)
 * @param {number} options.scrambleDuration - Duration of scramble animation in ms (default: 800)
 * @param {string} options.characters - Character set for scrambling (default: technical chars)
 * @param {number} options.revealSpeed - Speed of character reveal (default: 50ms per char)
 * @returns {Object} - { displayText, isScrambling, containerRef, activate }
 */
export const useTextScramble = (originalText, options = {}) => {
  const {
    hoverDelay = 2000,
    scrambleDuration = 400,
    characters = '-–—___________',
    revealSpeed = 30,
  } = options;

  const [displayText, setDisplayText] = useState(originalText);
  const [isScrambling, setIsScrambling] = useState(false);
  const containerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isHoveringRef = useRef(false);

  const scramble = () => {
    if (!originalText || isScrambling) return;

    setIsScrambling(true);
    const length = originalText.length;
    let frame = 0;
    const totalFrames = Math.ceil(scrambleDuration / 16); // ~60fps

    const animate = () => {
      const progress = frame / totalFrames;
      let output = '';

      for (let i = 0; i < length; i++) {
        const charProgress = Math.max(0, (progress * length) - i) / length;

        if (charProgress >= 1) {
          // Fully revealed
          output += originalText[i];
        } else if (charProgress > 0) {
          // Transitioning
          if (Math.random() < charProgress) {
            output += originalText[i];
          } else {
            output += characters[Math.floor(Math.random() * characters.length)];
          }
        } else {
          // Still scrambled
          output += characters[Math.floor(Math.random() * characters.length)];
        }
      }

      setDisplayText(output);

      if (frame < totalFrames) {
        frame++;
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(originalText);
        setIsScrambling(false);
      }
    };

    animate();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      isHoveringRef.current = true;
      hoverTimeoutRef.current = setTimeout(() => {
        if (isHoveringRef.current) {
          scramble();
        }
      }, hoverDelay);
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [originalText, hoverDelay]);

  // Update display text when original text changes
  useEffect(() => {
    if (!isScrambling) {
      setDisplayText(originalText);
    }
  }, [originalText, isScrambling]);

  return {
    displayText,
    isScrambling,
    containerRef,
    activate: scramble
  };
};
