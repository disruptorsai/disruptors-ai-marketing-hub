import React, { useState, useEffect, useRef, useCallback } from 'react';

const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export default function TextScramble({ children, className = "", onHover = false }) {
  const [displayText, setDisplayText] = useState(children);
  const [isScrambling, setIsScrambling] = useState(false);
  const originalText = useRef(children);

  useEffect(() => {
    originalText.current = children;
    setDisplayText(children);
  }, [children]);

  const scrambleText = useCallback(() => {
    if (isScrambling) return;
    
    setIsScrambling(true);
    const text = originalText.current;
    
    // Pick 1-2 random characters to scramble
    const charsToScramble = Math.min(2, Math.max(1, Math.floor(text.length * 0.3)));
    const scrambleIndices = [];
    
    for (let i = 0; i < charsToScramble; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * text.length);
      } while (scrambleIndices.includes(randomIndex));
      scrambleIndices.push(randomIndex);
    }

    let step = 0;
    const maxSteps = 2;

    const scrambleStep = () => {
      if (step < maxSteps) {
        const scrambledText = text
          .split('')
          .map((char, index) => {
            if (scrambleIndices.includes(index)) {
              return chars[Math.floor(Math.random() * chars.length)];
            }
            return char;
          })
          .join('');
        
        setDisplayText(scrambledText);
        step++;
        setTimeout(scrambleStep, 100);
      } else {
        setDisplayText(text);
        setIsScrambling(false);
      }
    };

    scrambleStep();
  }, [isScrambling]);

  // Only scramble on hover if onHover is true
  if (onHover) {
    return (
      <span 
        className={`${className} ${isScrambling ? 'text-scramble' : ''}`}
        onMouseEnter={scrambleText}
      >
        {displayText}
      </span>
    );
  }

  // Return static text for non-hover usage
  return (
    <span className={className}>
      {children}
    </span>
  );
}