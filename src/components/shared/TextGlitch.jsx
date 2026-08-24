import React from 'react';
import { useTextScramble } from '@/hooks/useTextScramble';
import './TextGlitch.css';

/**
 * TextGlitch Component
 *
 * High-end text scramble/glitch effect that activates on sustained hover.
 * Features:
 * - Subtle chromatic aberration on hover
 * - Character scrambling animation
 * - Configurable timing and behavior
 * - Zero layout shift
 * - Performant with requestAnimationFrame
 *
 * @example
 * <TextGlitch text="Disruptors AI" />
 *
 * @example With custom settings
 * <TextGlitch
 *   text="Premium Service"
 *   hoverDelay={1500}
 *   scrambleDuration={600}
 *   intensity="high"
 * />
 */
export const TextGlitch = ({
  text,
  className = '',
  hoverDelay = 2000,
  scrambleDuration = 800,
  intensity = 'subtle', // 'subtle' | 'medium' | 'high'
  as: Component = 'span',
  ...props
}) => {
  const { displayText, isScrambling, containerRef } = useTextScramble(text, {
    hoverDelay,
    scrambleDuration,
  });

  const intensityClass = {
    subtle: 'text-glitch--subtle',
    medium: 'text-glitch--medium',
    high: 'text-glitch--high'
  }[intensity];

  return (
    <Component
      ref={containerRef}
      className={`text-glitch ${intensityClass} ${isScrambling ? 'text-glitch--active' : ''} ${className}`}
      data-text={text}
      {...props}
    >
      {displayText}
    </Component>
  );
};

/**
 * TextGlitchWrapper Component
 *
 * Wraps existing text content with glitch effect.
 * Useful for applying effect to complex text structures.
 *
 * @example
 * <TextGlitchWrapper text="The original text">
 *   <h1 className="text-4xl font-bold">The original text</h1>
 * </TextGlitchWrapper>
 */
export const TextGlitchWrapper = ({
  text,
  children,
  hoverDelay = 2000,
  scrambleDuration = 800,
  intensity = 'subtle'
}) => {
  const { displayText, isScrambling, containerRef } = useTextScramble(text, {
    hoverDelay,
    scrambleDuration,
  });

  const intensityClass = {
    subtle: 'text-glitch--subtle',
    medium: 'text-glitch--medium',
    high: 'text-glitch--high'
  }[intensity];

  return (
    <div
      ref={containerRef}
      className={`text-glitch-wrapper ${intensityClass} ${isScrambling ? 'text-glitch--active' : ''}`}
      data-text={text}
    >
      {React.cloneElement(children, {
        children: displayText
      })}
    </div>
  );
};

export default TextGlitch;
