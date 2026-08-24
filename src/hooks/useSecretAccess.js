import { useState, useEffect, useCallback } from 'react';

export const useSecretAccess = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showMatrixLogin, setShowMatrixLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const REQUIRED_CLICKS = 5;
  const TIME_WINDOW = 3000; // 3 seconds

  // Reset click sequence
  const resetSequence = useCallback(() => {
    setClickCount(0);
    setIsTimerActive(false);
  }, []);

  // Handle logo click
  const handleLogoClick = useCallback(() => {
    setClickCount(prev => {
      const newCount = prev + 1;

      // Start timer on first click
      if (newCount === 1) {
        setIsTimerActive(true);
        // Reset after time window
        setTimeout(() => {
          setClickCount(0);
          setIsTimerActive(false);
        }, TIME_WINDOW);
      }

      // Check if sequence is complete
      if (newCount >= REQUIRED_CLICKS) {
        setShowMatrixLogin(true);
        resetSequence();
      }

      return newCount;
    });
  }, [resetSequence]);

  // Handle successful login
  const handleLoginSuccess = useCallback((username, sessionData) => {
    setIsAdminAuthenticated(true);
    setAdminUser(username);
    setShowMatrixLogin(false);

    // Store admin session with Supabase session data
    const sessionInfo = {
      authenticated: true,
      user: username,
      timestamp: Date.now(),
      session_id: sessionData?.session_id || null,
      session_token: sessionData?.session_token || null,
      expires_at: sessionData?.expires_at || null
    };

    sessionStorage.setItem('disruptors_admin', JSON.stringify(sessionInfo));

    // Set the session context in supabase storage
    if (sessionData?.session_id) {
      import('@/lib/supabase-media-storage').then(({ supabaseMediaStorage }) => {
        supabaseMediaStorage.setAdminContext(username, sessionData.session_id);
      });
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    sessionStorage.removeItem('disruptors_admin');
  }, []);

  // Handle matrix login close
  const handleCloseMatrix = useCallback(() => {
    setShowMatrixLogin(false);
    resetSequence();
  }, [resetSequence]);

  // Check for existing admin session on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('disruptors_admin');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const isRecent = Date.now() - session.timestamp < 24 * 60 * 60 * 1000; // 24 hours

        if (session.authenticated && isRecent) {
          setIsAdminAuthenticated(true);
          setAdminUser(session.user);
        } else {
          sessionStorage.removeItem('disruptors_admin');
        }
      } catch {
        sessionStorage.removeItem('disruptors_admin');
      }
    }
  }, []);

  // Keyboard shortcut for quick access (Ctrl + Shift + D)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (!isAdminAuthenticated) {
          setShowMatrixLogin(true);
        }
      }

      // Emergency escape (Ctrl + Shift + Escape)
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        handleLogout();
        setShowMatrixLogin(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAdminAuthenticated, handleLogout]);

  // Debug mode - log click progress in development
  useEffect(() => {
    if (import.meta.env.DEV && isTimerActive) {
      console.log(`🔐 Secret access progress: ${clickCount}/${REQUIRED_CLICKS} clicks`);
      if (clickCount >= REQUIRED_CLICKS) {
        console.log('🚀 Matrix login activated!');
      }
    }
  }, [clickCount, isTimerActive]);

  return {
    // State
    clickCount,
    isTimerActive,
    showMatrixLogin,
    isAdminAuthenticated,
    adminUser,

    // Actions
    handleLogoClick,
    handleLoginSuccess,
    handleLogout,
    handleCloseMatrix,
    resetSequence,

    // Constants for UI feedback
    REQUIRED_CLICKS,
    TIME_WINDOW,

    // Progress calculation
    progress: isTimerActive ? (clickCount / REQUIRED_CLICKS) * 100 : 0
  };
};