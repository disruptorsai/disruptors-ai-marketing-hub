/**
 * useBrainTheming Hook
 *
 * Loads user's Business Brain and applies dynamic theming to the app interface.
 * Injects CSS custom properties for colors, typography, and logo URLs.
 *
 * Usage:
 * ```jsx
 * const { theme, loading, brain } = useBrainTheming();
 *
 * // Use in component
 * <div style={{ color: 'var(--brand-primary)' }}>
 *   Styled with business brain colors
 * </div>
 * ```
 */

import { useState, useEffect } from 'react';
import { BrainAPI } from '@/lib/brain-api';
import { supabase } from '@/lib/supabase-client';

/**
 * Default theme fallback (matches Disruptors & Co brand)
 */
const DEFAULT_THEME = {
  colors: {
    primary: '#C9A53B',   // Muted Gold
    secondary: '#2C6BAA', // Lapis Blue
    accent: '#C96F4C',    // Terracotta
    neutral: '#3C7A6A',   // Verdigris Green
  },
  typography: {
    heading: "'Raleway', sans-serif",
    body: "'Inter', sans-serif",
    accent: "'Playfair Display', serif",
  },
  logoUrl: null,
};

/**
 * Parse JSONB color object from brain
 */
const parseColors = (brandColors) => {
  if (!brandColors || typeof brandColors !== 'object') return DEFAULT_THEME.colors;

  return {
    primary: brandColors.primary || DEFAULT_THEME.colors.primary,
    secondary: brandColors.secondary || DEFAULT_THEME.colors.secondary,
    accent: brandColors.accent || DEFAULT_THEME.colors.accent,
    neutral: brandColors.neutral || DEFAULT_THEME.colors.neutral,
  };
};

/**
 * Parse JSONB typography object from brain
 */
const parseTypography = (typography) => {
  if (!typography || typeof typography !== 'object') return DEFAULT_THEME.typography;

  return {
    heading: typography.heading || DEFAULT_THEME.typography.heading,
    body: typography.body || DEFAULT_THEME.typography.body,
    accent: typography.accent || DEFAULT_THEME.typography.accent,
  };
};

/**
 * Parse JSONB logo URLs object from brain
 */
const parseLogoUrl = (logoUrls) => {
  if (!logoUrls || typeof logoUrls !== 'object') return null;

  return logoUrls.primary || logoUrls.icon || logoUrls.light || null;
};

/**
 * Helper: Convert hex to RGB values
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

/**
 * Inject CSS custom properties into document root
 */
const injectTheme = (theme) => {
  const root = document.documentElement;

  // Inject brand color variables (for accents only)
  root.style.setProperty('--brand-primary', theme.colors.primary);
  root.style.setProperty('--brand-primary-rgb', hexToRgb(theme.colors.primary));
  root.style.setProperty('--brand-secondary', theme.colors.secondary);
  root.style.setProperty('--brand-secondary-rgb', hexToRgb(theme.colors.secondary));
  root.style.setProperty('--brand-accent', theme.colors.accent);
  root.style.setProperty('--brand-accent-rgb', hexToRgb(theme.colors.accent));
  root.style.setProperty('--brand-neutral', theme.colors.neutral);
  root.style.setProperty('--brand-neutral-rgb', hexToRgb(theme.colors.neutral));

  // Inject base palette (professional slate colors - consistent across all users)
  root.style.setProperty('--text-primary', '#0F172A');     // slate-900
  root.style.setProperty('--text-secondary', '#64748B');   // slate-500
  root.style.setProperty('--text-tertiary', '#94A3B8');    // slate-400
  root.style.setProperty('--bg-base', '#FFFFFF');          // white
  root.style.setProperty('--bg-surface', '#F8FAFC');       // slate-50
  root.style.setProperty('--bg-muted', '#F1F5F9');         // slate-100
  root.style.setProperty('--border-default', '#E2E8F0');   // slate-200
  root.style.setProperty('--border-light', '#F1F5F9');     // slate-100

  // Inject shadow variables
  root.style.setProperty('--shadow-sm', '0 1px 3px rgba(0,0,0,0.04)');
  root.style.setProperty('--shadow-md', '0 4px 12px rgba(0,0,0,0.08)');
  root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0,0,0,0.12)');

  // Inject transition variables
  root.style.setProperty('--transition-fast', '150ms cubic-bezier(0.4, 0, 0.2, 1)');
  root.style.setProperty('--transition-medium', '250ms cubic-bezier(0.4, 0, 0.2, 1)');
  root.style.setProperty('--transition-slow', '400ms cubic-bezier(0.4, 0, 0.2, 1)');

  // Inject typography variables
  root.style.setProperty('--font-heading', theme.typography.heading);
  root.style.setProperty('--font-body', theme.typography.body);
  root.style.setProperty('--font-accent', theme.typography.accent);

  // Inject logo URL as CSS variable (for use in background-image)
  if (theme.logoUrl) {
    root.style.setProperty('--brand-logo-url', `url(${theme.logoUrl})`);
  }
};

/**
 * Remove injected CSS custom properties
 */
const removeTheme = () => {
  const root = document.documentElement;

  // Remove brand colors
  root.style.removeProperty('--brand-primary');
  root.style.removeProperty('--brand-primary-rgb');
  root.style.removeProperty('--brand-secondary');
  root.style.removeProperty('--brand-secondary-rgb');
  root.style.removeProperty('--brand-accent');
  root.style.removeProperty('--brand-accent-rgb');
  root.style.removeProperty('--brand-neutral');
  root.style.removeProperty('--brand-neutral-rgb');

  // Remove base palette
  root.style.removeProperty('--text-primary');
  root.style.removeProperty('--text-secondary');
  root.style.removeProperty('--text-tertiary');
  root.style.removeProperty('--bg-base');
  root.style.removeProperty('--bg-surface');
  root.style.removeProperty('--bg-muted');
  root.style.removeProperty('--border-default');
  root.style.removeProperty('--border-light');

  // Remove shadows
  root.style.removeProperty('--shadow-sm');
  root.style.removeProperty('--shadow-md');
  root.style.removeProperty('--shadow-lg');

  // Remove transitions
  root.style.removeProperty('--transition-fast');
  root.style.removeProperty('--transition-medium');
  root.style.removeProperty('--transition-slow');

  // Remove typography
  root.style.removeProperty('--font-heading');
  root.style.removeProperty('--font-body');
  root.style.removeProperty('--font-accent');
  root.style.removeProperty('--brand-logo-url');
};

/**
 * useBrainTheming Hook
 */
export function useBrainTheming() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBrainTheme();

    // Cleanup: remove theme on unmount
    return () => {
      removeTheme();
    };
  }, []);

  const loadBrainTheme = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // User not authenticated - use default theme
        injectTheme(DEFAULT_THEME);
        setTheme(DEFAULT_THEME);
        setLoading(false);
        return;
      }

      // Load user's business brain
      const brainData = await BrainAPI.getBrainByUser(user.id);

      if (!brainData) {
        // No brain found - use default theme
        injectTheme(DEFAULT_THEME);
        setTheme(DEFAULT_THEME);
        setLoading(false);
        return;
      }

      // Parse brain data into theme object
      const brainTheme = {
        colors: parseColors(brainData.brand_colors),
        typography: parseTypography(brainData.typography),
        logoUrl: parseLogoUrl(brainData.logo_urls),
      };

      // Inject theme into DOM
      injectTheme(brainTheme);

      setBrain(brainData);
      setTheme(brainTheme);
    } catch (err) {
      console.error('Failed to load brain theming:', err);
      setError(err.message);

      // Fallback to default theme on error
      injectTheme(DEFAULT_THEME);
      setTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  return {
    theme,
    brain,
    loading,
    error,
    reload: loadBrainTheme,
  };
}

export default useBrainTheming;
