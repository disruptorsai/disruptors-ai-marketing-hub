import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'billboard-popup';
const COOLDOWNS_MS = [
  24 * 60 * 60 * 1000,      // 24 hours
  3 * 24 * 60 * 60 * 1000,  // 3 days
  7 * 24 * 60 * 60 * 1000,  // 7 days
];

function getState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function useBillboardPopup(delayMs = 1500) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const state = getState();
    if (state?.accepted) return;                              // permanent dismiss
    if (state?.dismissedAt) {
      const idx = Math.min((state.dismissCount || 1) - 1, COOLDOWNS_MS.length - 1);
      if (Date.now() - state.dismissedAt < COOLDOWNS_MS[idx]) return;  // still in cooldown
      setIsReturning(true);
    }
    if (sessionStorage.getItem(STORAGE_KEY)) return;          // already shown this page load

    let idleHandle;
    const reveal = () => {
      setIsOpen(true);
      sessionStorage.setItem(STORAGE_KEY, 'shown');
    };
    // Defer to browser idle time after the delay so the popup never competes with LCP/initial paint
    const timer = setTimeout(() => {
      idleHandle = typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(reveal, { timeout: 1000 })
        : setTimeout(reveal, 0);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      if (idleHandle != null) {
        (window.cancelIdleCallback || clearTimeout)(idleHandle);
      }
    };
  }, [delayMs]);

  const close = useCallback(() => {
    setIsOpen(false);
    const state = getState() || {};
    saveState({ ...state, dismissedAt: Date.now(), dismissCount: (state.dismissCount || 0) + 1 });
  }, []);

  const accept = useCallback(() => {
    setIsOpen(false);
    saveState({ accepted: true, acceptedAt: Date.now() });
  }, []);

  return { isOpen, isReturning, close, accept };
}
