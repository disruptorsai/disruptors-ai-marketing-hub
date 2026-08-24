/**
 * usePreChangeScreenshot Hook
 *
 * React hook that triggers screenshot capture before state changes
 * Automatically detects when changes are about to happen
 * Non-blocking - doesn't halt development
 *
 * @module usePreChangeScreenshot
 */

import { useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { screenshotCapture } from '../lib/screenshot-capture';

/**
 * Configuration for screenshot capture
 */
const DEFAULT_CONFIG = {
  enabled: import.meta.env.MODE === 'development', // Only in dev mode
  requireDescription: false, // Set to true to require manual description
  autoCapture: true, // Automatically capture on changes
  viewports: ['desktop'], // Default to desktop only
  promptForDescription: true // Prompt developer for description
};

/**
 * Hook to capture screenshots before changes
 *
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Enable screenshot capture
 * @param {boolean} options.autoCapture - Auto-capture on changes
 * @param {Array<string>} options.viewports - Viewports to capture
 * @returns {Object} Hook interface
 */
export function usePreChangeScreenshot(options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const location = useLocation();
  const lastCaptureRef = useRef(null);
  const changeIdRef = useRef(null);

  /**
   * Capture screenshot before a change
   *
   * @param {string} changeDescription - Description of the change
   * @param {Object} captureOptions - Additional capture options
   * @returns {Promise<string>} Change ID for linking before/after
   */
  const captureBeforeChange = useCallback(async (changeDescription, captureOptions = {}) => {
    if (!config.enabled) {
      console.log('[Screenshot] Skipped - disabled in config');
      return null;
    }

    try {
      // Generate or reuse change ID
      const changeId = changeIdRef.current || generateChangeId();
      changeIdRef.current = changeId;

      const pageRoute = location.pathname;
      const timestamp = Date.now();

      // Check if we recently captured this same change
      if (lastCaptureRef.current) {
        const timeSinceLastCapture = timestamp - lastCaptureRef.current.timestamp;
        const sameChange = lastCaptureRef.current.description === changeDescription;

        // Skip if captured within last 10 seconds
        if (sameChange && timeSinceLastCapture < 10000) {
          console.log('[Screenshot] Skipped - recently captured');
          return changeId;
        }
      }

      // Update last capture
      lastCaptureRef.current = {
        timestamp,
        description: changeDescription,
        changeId
      };

      // Capture for each viewport
      const viewports = captureOptions.viewports || config.viewports;
      const capturePromises = viewports.map(viewport =>
        screenshotCapture.captureScreenshot({
          pageRoute,
          changeDescription,
          viewport,
          capturedBeforeChange: true,
          relatedChangeId: changeId,
          ...captureOptions
        })
      );

      await Promise.all(capturePromises);

      console.log(`[Screenshot] Captured before change: "${changeDescription}"`);

      return changeId;
    } catch (error) {
      console.error('[Screenshot] Capture failed:', error);
      // Non-blocking - don't throw error
      return null;
    }
  }, [config, location.pathname]);

  /**
   * Capture screenshot after a change
   *
   * @param {string} changeId - Change ID from before capture
   * @param {Object} captureOptions - Additional capture options
   * @returns {Promise<void>}
   */
  const captureAfterChange = useCallback(async (changeId, captureOptions = {}) => {
    if (!config.enabled || !changeId) {
      return;
    }

    try {
      const pageRoute = location.pathname;
      const changeDescription = lastCaptureRef.current?.description || 'After change';

      // Capture for each viewport
      const viewports = captureOptions.viewports || config.viewports;
      const capturePromises = viewports.map(viewport =>
        screenshotCapture.captureScreenshot({
          pageRoute,
          changeDescription,
          viewport,
          capturedBeforeChange: false,
          relatedChangeId: changeId,
          ...captureOptions
        })
      );

      await Promise.all(capturePromises);

      console.log(`[Screenshot] Captured after change: "${changeDescription}"`);

      // Clear change ID after capturing after
      changeIdRef.current = null;
    } catch (error) {
      console.error('[Screenshot] After capture failed:', error);
      // Non-blocking - don't throw error
    }
  }, [config, location.pathname]);

  /**
   * Prompt developer for change description
   *
   * @returns {Promise<string|null>} Change description or null if cancelled
   */
  const promptForDescription = useCallback(async () => {
    return new Promise((resolve) => {
      const description = window.prompt(
        'Screenshot Capture\n\nDescribe the change you are about to make:',
        ''
      );

      resolve(description);
    });
  }, []);

  /**
   * Smart capture - prompts for description if enabled
   *
   * @param {string} changeDescription - Optional pre-filled description
   * @param {Object} captureOptions - Additional capture options
   * @returns {Promise<string>} Change ID
   */
  const smartCapture = useCallback(async (changeDescription = null, captureOptions = {}) => {
    let description = changeDescription;

    // Prompt for description if enabled and not provided
    if (!description && config.promptForDescription) {
      description = await promptForDescription();

      // User cancelled
      if (!description) {
        console.log('[Screenshot] Cancelled by user');
        return null;
      }
    }

    // Use default description if still not provided
    if (!description) {
      description = `Update on ${location.pathname}`;
    }

    return await captureBeforeChange(description, captureOptions);
  }, [config.promptForDescription, location.pathname, promptForDescription, captureBeforeChange]);

  /**
   * Manual capture - capture current state without before/after linking
   *
   * @param {string} description - Description of the screenshot
   * @param {Object} captureOptions - Additional capture options
   * @returns {Promise<void>}
   */
  const manualCapture = useCallback(async (description, captureOptions = {}) => {
    if (!config.enabled) {
      return;
    }

    try {
      const pageRoute = location.pathname;
      const viewports = captureOptions.viewports || config.viewports;

      const capturePromises = viewports.map(viewport =>
        screenshotCapture.captureScreenshot({
          pageRoute,
          changeDescription: description,
          viewport,
          capturedBeforeChange: true, // Mark as standalone
          relatedChangeId: generateChangeId(), // Unique ID for standalone
          ...captureOptions
        })
      );

      await Promise.all(capturePromises);

      console.log(`[Screenshot] Manual capture: "${description}"`);
    } catch (error) {
      console.error('[Screenshot] Manual capture failed:', error);
    }
  }, [config, location.pathname]);

  /**
   * Effect: Auto-capture on route change (optional)
   */
  useEffect(() => {
    if (config.autoCapture && config.enabled) {
      // Optionally auto-capture when navigating to a new page
      // This can be enabled for tracking navigation history
      // Currently disabled to avoid excessive captures
    }
  }, [location.pathname, config.autoCapture, config.enabled]);

  return {
    captureBeforeChange,
    captureAfterChange,
    smartCapture,
    manualCapture,
    promptForDescription,
    isEnabled: config.enabled,
    currentChangeId: changeIdRef.current
  };
}

/**
 * Generate unique change ID
 *
 * @returns {string} Change ID
 */
function generateChangeId() {
  return `change-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Example usage in components:
 *
 * ```jsx
 * import { usePreChangeScreenshot } from '@/hooks/usePreChangeScreenshot';
 *
 * function MyComponent() {
 *   const { smartCapture, captureAfterChange } = usePreChangeScreenshot({
 *     viewports: ['desktop', 'mobile']
 *   });
 *
 *   const handleUpdate = async () => {
 *     // Capture before change
 *     const changeId = await smartCapture('Update hero section layout');
 *
 *     // Make your changes
 *     await updateHeroSection();
 *
 *     // Capture after change
 *     await captureAfterChange(changeId);
 *   };
 *
 *   return <button onClick={handleUpdate}>Update Hero</button>;
 * }
 * ```
 *
 * Advanced usage with manual description:
 *
 * ```jsx
 * const { captureBeforeChange, captureAfterChange } = usePreChangeScreenshot({
 *   promptForDescription: false
 * });
 *
 * const handleCustomChange = async () => {
 *   const changeId = await captureBeforeChange('Convert header to full-width');
 *   // ... make changes ...
 *   await captureAfterChange(changeId);
 * };
 * ```
 *
 * Manual standalone capture:
 *
 * ```jsx
 * const { manualCapture } = usePreChangeScreenshot();
 *
 * const captureCurrentState = async () => {
 *   await manualCapture('Current homepage state before redesign', {
 *     viewports: ['desktop', 'tablet', 'mobile']
 *   });
 * };
 * ```
 */

export default usePreChangeScreenshot;
