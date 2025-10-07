import React, { useEffect, useRef, useState } from 'react';
import { useScramble } from 'use-scramble';

/**
 * ScrambleText - Subtle text scramble effect for high-end UI
 *
 * Features:
 * - Initial scramble on mount (fast, 300ms)
 * - Random single-letter glitches every 10-16 seconds
 * - Nearly invisible - blink and you'll miss it
 *
 * @param {string} text - The text to display and scramble
 * @param {string} className - Additional CSS classes
 * @param {React.ElementType} as - HTML element to render (default: 'span')
 */
export default function ScrambleText({
  text,
  className = '',
  as: Component = 'span',
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const glitchTimerRef = useRef(null);
  const isGlitchingRef = useRef(false);

  // Initial scramble on mount - very fast and subtle
  const { ref } = useScramble({
    text,
    speed: 1,
    tick: 1,
    step: 2,
    scramble: 2,
    seed: 1,
    playOnMount: true,
    range: [65, 90, 97, 122], // A-Z, a-z only
    onAnimationEnd: () => {
      // Start random glitch interval after initial scramble completes
      startRandomGlitches();
    }
  });

  const startRandomGlitches = () => {
    const scheduleNextGlitch = () => {
      // Random interval between 10-16 seconds (10000-16000ms)
      const randomInterval = Math.random() * 6000 + 10000;

      glitchTimerRef.current = setTimeout(() => {
        if (!isGlitchingRef.current && text && text.length > 0) {
          performSingleCharacterGlitch();
        }
        scheduleNextGlitch(); // Schedule next glitch
      }, randomInterval);
    };

    scheduleNextGlitch();
  };

  const performSingleCharacterGlitch = () => {
    if (isGlitchingRef.current) return;

    isGlitchingRef.current = true;

    // Get a random character position (excluding spaces)
    const nonSpaceIndices = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') {
        nonSpaceIndices.push(i);
      }
    }

    if (nonSpaceIndices.length === 0) {
      isGlitchingRef.current = false;
      return;
    }

    const randomIndex = nonSpaceIndices[Math.floor(Math.random() * nonSpaceIndices.length)];
    const originalChar = text[randomIndex];

    // Character pool for glitch (uppercase, lowercase, special chars)
    const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

    let glitchCount = 0;
    const maxGlitches = 3; // Show 3 random characters before settling
    const glitchSpeed = 50; // 50ms between changes (150ms total)

    const glitchInterval = setInterval(() => {
      if (glitchCount < maxGlitches) {
        // Show random character
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        const newText = text.substring(0, randomIndex) + randomChar + text.substring(randomIndex + 1);

        if (ref.current) {
          ref.current.textContent = newText;
        }

        glitchCount++;
      } else {
        // Restore original character
        if (ref.current) {
          ref.current.textContent = text;
        }
        clearInterval(glitchInterval);
        isGlitchingRef.current = false;
      }
    }, glitchSpeed);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (glitchTimerRef.current) {
        clearTimeout(glitchTimerRef.current);
      }
    };
  }, []);

  // Update when text prop changes
  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  return <Component ref={ref} className={className} {...props} />;
}
