import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * GsapScrambleText - GSAP-powered hover scramble text effect
 *
 * Features:
 * - Scrambles text characters on hover using GSAP
 * - Smooth animation with GSAP's performance optimization
 * - Returns to original text when hover ends
 * - Uses custom GSAP timeline for character-by-character scrambling
 *
 * @param {string} text - The text to display and scramble
 * @param {string} className - Additional CSS classes
 * @param {React.ElementType} as - HTML element to render (default: 'span')
 * @param {number} scrambleDuration - Duration of scramble effect in seconds (default: 0.6)
 * @param {number} scrambleChars - Number of random chars to show per position (default: 3)
 */
export default function GsapScrambleText({
  text,
  className = '',
  as: Component = 'span',
  scrambleDuration = 0.6,
  scrambleChars = 3,
  ...props
}) {
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const originalText = useRef(text);
  const isScrambling = useRef(false);
  const timelineRef = useRef(null);

  // Character pool for scrambling
  const scrambleCharPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

  useEffect(() => {
    originalText.current = text;
  }, [text]);

  // Lock a fixed width to prevent layout shift during scramble — but only AFTER
  // web fonts are ready. Measuring before the custom font loads (cold load) locks
  // a too-narrow fallback-font width, causing labels to overflow and overlap.
  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    let cancelled = false;
    const lockWidth = () => {
      if (cancelled || !containerRef.current || !textRef.current) return;
      // Reset to natural width, then re-measure with the real font in place.
      containerRef.current.style.width = '';
      const width = textRef.current.offsetWidth;
      if (width) containerRef.current.style.width = `${width}px`;
    };
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(lockWidth);
    } else {
      lockWidth();
    }
    return () => { cancelled = true; };
  }, [text]);

  const getRandomChar = () => {
    return scrambleCharPool[Math.floor(Math.random() * scrambleCharPool.length)];
  };

  const scrambleText = () => {
    if (isScrambling.current || !textRef.current) return;

    isScrambling.current = true;
    const targetText = originalText.current;

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create a new GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        isScrambling.current = false;
      }
    });

    timelineRef.current = tl;

    // Calculate timing
    const charsPerSecond = targetText.length / scrambleDuration;
    const timePerChar = 1 / charsPerSecond;

    // Scramble each character position
    targetText.split('').forEach((char, index) => {
      if (char === ' ') return; // Skip spaces

      // Add scramble sequence for this character
      for (let i = 0; i < scrambleChars; i++) {
        const startTime = index * timePerChar + (i * timePerChar / scrambleChars);

        tl.to({}, {
          duration: timePerChar / scrambleChars,
          onStart: () => {
            if (textRef.current) {
              const chars = targetText.split('');
              chars[index] = getRandomChar();
              textRef.current.textContent = chars.join('');
            }
          }
        }, startTime);
      }

      // Restore original character
      const finalTime = index * timePerChar + timePerChar;
      tl.to({}, {
        duration: 0.01,
        onStart: () => {
          if (textRef.current) {
            const chars = targetText.split('');
            chars[index] = char;
            textRef.current.textContent = chars.join('');
          }
        }
      }, finalTime);
    });
  };

  const resetText = () => {
    // Kill timeline and reset immediately
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    if (textRef.current) {
      textRef.current.textContent = originalText.current;
    }

    isScrambling.current = false;
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <Component
      ref={containerRef}
      className={className}
      onMouseEnter={scrambleText}
      onMouseLeave={resetText}
      style={{ display: 'inline-block' }}
      {...props}
    >
      <span ref={textRef}>{text}</span>
    </Component>
  );
}
