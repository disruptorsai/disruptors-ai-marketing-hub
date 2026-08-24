/**
 * BrainThemedLayout Component
 *
 * Wrapper layout that applies Business Brain theming to app interfaces.
 * Automatically loads user's brain and injects brand colors, typography, and logo.
 *
 * Usage:
 * ```jsx
 * <BrainThemedLayout>
 *   <YourAppContent />
 * </BrainThemedLayout>
 * ```
 *
 * CSS Variables Available:
 * - --brand-primary: Primary brand color
 * - --brand-secondary: Secondary brand color
 * - --brand-accent: Accent color
 * - --brand-neutral: Neutral color
 * - --font-heading: Heading font family
 * - --font-body: Body font family
 * - --font-accent: Accent font family
 * - --brand-logo-url: Logo URL (for background-image)
 *
 * Use in Tailwind: text-[var(--brand-primary)]
 * Use in inline styles: style={{ color: 'var(--brand-primary)' }}
 */

import React from 'react';
import { useBrainTheming } from '@/hooks/useBrainTheming';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Loading state while brain theme loads
 */
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

/**
 * Error state if brain theming fails
 */
function ErrorState({ error, children }) {
  return (
    <>
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Theme Loading Error</AlertTitle>
        <AlertDescription>
          {error || 'Failed to load Business Brain theming. Using default theme.'}
        </AlertDescription>
      </Alert>
      {children}
    </>
  );
}

/**
 * Brain-themed layout wrapper
 */
export default function BrainThemedLayout({ children, showLoading = true }) {
  const { theme, brain, loading, error } = useBrainTheming();

  // Show loading state while theme loads
  if (loading && showLoading) {
    return <LoadingState />;
  }

  return (
    <div
      className="min-h-screen brain-themed-app"
      style={{
        // Apply brain theme as inline styles for maximum compatibility
        '--brand-primary': theme.colors.primary,
        '--brand-secondary': theme.colors.secondary,
        '--brand-accent': theme.colors.accent,
        '--brand-neutral': theme.colors.neutral,
        '--font-heading': theme.typography.heading,
        '--font-body': theme.typography.body,
        '--font-accent': theme.typography.accent,
      }}
    >
      {error && <ErrorState error={error} />}

      {/* Optional: Display brain info header */}
      {brain && (
        <div className="bg-gradient-to-r from-[var(--brand-primary)]/10 to-[var(--brand-secondary)]/10 border-b border-[var(--brand-primary)]/20 py-2 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {theme.logoUrl && (
                <img
                  src={theme.logoUrl}
                  alt={brain.business_name}
                  className="h-6 w-auto"
                />
              )}
              <span className="font-medium text-[var(--brand-primary)]">
                {brain.business_name}
              </span>
              <span className="text-muted-foreground">
                Brain Level: {brain.brain_level}
              </span>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

/**
 * Utility component: Branded heading
 */
export function BrandedHeading({ children, level = 1, className = '' }) {
  const Tag = `h${level}`;

  return React.createElement(
    Tag,
    {
      className: `font-[var(--font-heading)] text-[var(--brand-primary)] ${className}`,
      style: {
        fontFamily: 'var(--font-heading)',
      }
    },
    children
  );
}

/**
 * Utility component: Primary button with brand colors
 */
export function BrandedButton({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white',
    secondary: 'bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/90 text-white',
    accent: 'bg-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/90 text-white',
    outline: 'border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10',
  };

  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Utility component: Branded card with accent border
 */
export function BrandedCard({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-card border-2 border-[var(--brand-primary)]/20 rounded-lg p-6 hover:border-[var(--brand-primary)]/40 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
