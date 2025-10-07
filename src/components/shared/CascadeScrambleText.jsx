import React, { useEffect, useRef, useState } from 'react';
import { useScramble } from 'use-scramble';

/**
 * Single word scramble component with delay support
 */
function ScrambleWord({ word, delay = 0, onComplete }) {
  const [displayText, setDisplayText] = useState('');

  const { ref } = useScramble({
    text: displayText,
    speed: 1,        // Full speed (60fps)
    tick: 1,         // Every tick
    step: 3,         // Move forward 3 characters per tick (fast)
    scramble: 2,     // 2 scrambles per character (quick flash)
    seed: 0,         // No extra randomness ahead
    playOnMount: true,
    range: [65, 90, 97, 122], // A-Z, a-z only
    onAnimationEnd: onComplete,
    overflow: false  // Don't overflow over previous text
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayText(word);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, word]);

  return <span ref={ref}></span>;
}

/**
 * CascadeScrambleText - Left-to-right cascading word scramble effect
 *
 * Features:
 * - Splits text into words
 * - Each word scrambles independently
 * - Left-to-right cascade with staggered delays
 * - Fast animation (< 1 second per word)
 * - Deceleration effect built into scramble algorithm
 *
 * @param {string} text - The text to display and scramble
 * @param {string} className - Additional CSS classes
 * @param {React.ElementType} as - HTML element to render (default: 'span')
 * @param {number} wordDelay - Delay between each word in ms (default: 80ms)
 * @param {boolean} enableRandomGlitch - Enable random letter glitches after load (default: false)
 */
export default function CascadeScrambleText({
  text,
  className = '',
  as: Component = 'span',
  wordDelay = 40, // 40ms between each word (faster cascade)
  enableRandomGlitch = false,
  ...props
}) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [completedWords, setCompletedWords] = useState(0);
  const glitchTimerRef = useRef(null);
  const containerRef = useRef(null);
  const isGlitchingRef = useRef(false);

  // Split text into words while preserving spaces
  const words = text.split(' ');
  const totalWords = words.length;

  const handleWordComplete = () => {
    setCompletedWords(prev => {
      const newCount = prev + 1;
      if (newCount === totalWords) {
        setHasLoaded(true);
      }
      return newCount;
    });
  };

  // Start random glitches after all words complete
  useEffect(() => {
    if (!hasLoaded || !enableRandomGlitch) return;

    const startRandomGlitches = () => {
      const scheduleNextGlitch = () => {
        // Random interval between 10-16 seconds
        const randomInterval = Math.random() * 6000 + 10000;

        glitchTimerRef.current = setTimeout(() => {
          if (!isGlitchingRef.current && containerRef.current) {
            performSingleCharacterGlitch();
          }
          scheduleNextGlitch();
        }, randomInterval);
      };

      scheduleNextGlitch();
    };

    startRandomGlitches();

    return () => {
      if (glitchTimerRef.current) {
        clearTimeout(glitchTimerRef.current);
      }
    };
  }, [hasLoaded, enableRandomGlitch]);

  const performSingleCharacterGlitch = () => {
    if (isGlitchingRef.current || !containerRef.current) return;

    isGlitchingRef.current = true;

    // Get all text nodes
    const textContent = containerRef.current.textContent;
    const nonSpaceIndices = [];
    for (let i = 0; i < textContent.length; i++) {
      if (textContent[i] !== ' ') {
        nonSpaceIndices.push(i);
      }
    }

    if (nonSpaceIndices.length === 0) {
      isGlitchingRef.current = false;
      return;
    }

    const randomIndex = nonSpaceIndices[Math.floor(Math.random() * nonSpaceIndices.length)];
    const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

    let glitchCount = 0;
    const maxGlitches = 3;
    const glitchSpeed = 50;

    const glitchInterval = setInterval(() => {
      if (glitchCount < maxGlitches) {
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        const newText = textContent.substring(0, randomIndex) + randomChar + textContent.substring(randomIndex + 1);

        if (containerRef.current) {
          containerRef.current.textContent = newText;
        }
        glitchCount++;
      } else {
        if (containerRef.current) {
          containerRef.current.textContent = text;
        }
        clearInterval(glitchInterval);
        isGlitchingRef.current = false;
      }
    }, glitchSpeed);
  };

  return (
    <Component ref={containerRef} className={className} {...props}>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <ScrambleWord
            word={word}
            delay={index * wordDelay}
            onComplete={handleWordComplete}
          />
          {index < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Component>
  );
}
