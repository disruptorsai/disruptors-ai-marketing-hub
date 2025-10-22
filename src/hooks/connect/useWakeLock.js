import { useEffect, useState, useCallback } from 'react';

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) {
      console.warn('[Wake Lock] Not supported in this browser');
      return false;
    }

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      setIsActive(true);
      setError(null);
      console.log('[Wake Lock] ✅ Acquired');

      lock.addEventListener('release', () => {
        console.log('[Wake Lock] ⚠️ Released');
        setIsActive(false);
      });

      return true;
    } catch (err) {
      console.error('[Wake Lock] ❌ Request failed:', err);
      setError(err.message);
      return false;
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsActive(false);
      console.log('[Wake Lock] Released manually');
    }
  }, [wakeLock]);

  // Re-acquire wake lock on visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isActive && isSupported) {
        console.log('[Wake Lock] Tab visible, re-acquiring...');
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isActive, isSupported, requestWakeLock, releaseWakeLock]);

  return {
    requestWakeLock,
    releaseWakeLock,
    isActive,
    isSupported,
    error
  };
}
