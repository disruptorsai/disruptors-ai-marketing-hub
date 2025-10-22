import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Idle timer hook - returns to welcome screen after inactivity
 * @param {number} timeout - Timeout in milliseconds (default: 20000ms = 20s)
 * @param {Function} onIdle - Callback when idle timeout is reached
 */
export function useIdleTimer(timeout = 20000, onIdle) {
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      console.log('[Idle Timer] ⏱️ Timeout reached, executing callback');
      if (onIdle) {
        onIdle();
      } else {
        // Default: return to welcome
        navigate('/connect');
      }
    }, timeout);
  }, [timeout, onIdle, navigate]);

  useEffect(() => {
    // Events that reset the timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Set initial timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  return { resetTimer };
}
