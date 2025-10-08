/**
 * Branded Components
 *
 * Reusable UI components that automatically inherit styling from user's Business Brain.
 * These components use CSS custom properties injected by useBrainTheming hook.
 *
 * Available CSS Variables:
 * - --brand-primary
 * - --brand-secondary
 * - --brand-accent
 * - --brand-neutral
 * - --font-heading
 * - --font-body
 * - --font-accent
 * - --brand-logo-url
 */

import React from 'react';
import { Card } from '@/components/ui/card';

/**
 * BrandedStatCard - Stat card with brand gradient background
 *
 * @param {string} title - Card title
 * @param {string} value - Stat value to display
 * @param {string} description - Card description
 * @param {React.ReactNode} icon - Icon component
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 */
export function BrandedStatCard({ title, value, description, icon, variant = 'primary' }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <div
      className="bg-gradient-to-br rounded-lg p-6 hover:shadow-lg transition-all"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${colorVar}15, ${colorVar}05)`,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: `${colorVar}33`,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div style={{ color: colorVar }}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colorVar }}>
          {title}
        </h3>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * BrandedMetricCard - Simple metric display card
 *
 * @param {string} label - Metric label
 * @param {string|number} value - Metric value
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {string} className - Additional CSS classes
 */
export function BrandedMetricCard({ label, value, variant = 'primary', className = '' }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-bold" style={{ color: colorVar }}>
        {value}
      </div>
    </Card>
  );
}

/**
 * BrandedProgressBar - Progress bar with brand colors
 *
 * @param {number} value - Progress value (0-100)
 * @param {string} label - Progress label
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {boolean} showPercentage - Show percentage label
 */
export function BrandedProgressBar({ value, label, variant = 'primary', showPercentage = true }) {
  const colorVar = `var(--brand-${variant})`;
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold" style={{ color: colorVar }}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: colorVar,
          }}
        />
      </div>
    </div>
  );
}

/**
 * BrandedBadge - Badge with brand colors
 *
 * @param {React.ReactNode} children - Badge content
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {string} className - Additional CSS classes
 */
export function BrandedBadge({ children, variant = 'primary', className = '' }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${colorVar}15`,
        color: colorVar,
        border: `1px solid ${colorVar}33`,
      }}
    >
      {children}
    </span>
  );
}

/**
 * BrandedDivider - Horizontal divider with brand accent
 *
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {string} className - Additional CSS classes
 */
export function BrandedDivider({ variant = 'primary', className = '' }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <div
      className={`h-px w-full ${className}`}
      style={{
        background: `linear-gradient(to right, transparent, ${colorVar}66, transparent)`,
      }}
    />
  );
}

/**
 * BrandedGradientText - Text with brand gradient
 *
 * @param {React.ReactNode} children - Text content
 * @param {string} from - Start color variant (primary, secondary, accent, neutral)
 * @param {string} to - End color variant
 * @param {string} className - Additional CSS classes
 */
export function BrandedGradientText({ children, from = 'primary', to = 'secondary', className = '' }) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-gradient-to-r ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, var(--brand-${from}), var(--brand-${to}))`,
      }}
    >
      {children}
    </span>
  );
}

/**
 * BrandedIcon - Icon wrapper with brand color
 *
 * @param {React.ReactNode} icon - Icon component
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {string} size - Icon size class (e.g., 'w-5 h-5')
 * @param {string} className - Additional CSS classes
 */
export function BrandedIcon({ icon, variant = 'primary', size = 'w-5 h-5', className = '' }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <div className={`${size} ${className}`} style={{ color: colorVar }}>
      {icon}
    </div>
  );
}

/**
 * BrandedLink - Link with brand color and hover effect
 *
 * @param {React.ReactNode} children - Link content
 * @param {string} href - Link URL
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {string} className - Additional CSS classes
 */
export function BrandedLink({ children, href, variant = 'primary', className = '', ...props }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <a
      href={href}
      className={`font-medium underline-offset-4 hover:underline transition-colors ${className}`}
      style={{ color: colorVar }}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * BrandedAlert - Alert box with brand accent
 *
 * @param {string} title - Alert title
 * @param {string} description - Alert description
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {React.ReactNode} icon - Icon component
 * @param {string} className - Additional CSS classes
 */
export function BrandedAlert({ title, description, variant = 'primary', icon, className = '' }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <div
      className={`rounded-lg p-4 ${className}`}
      style={{
        backgroundColor: `${colorVar}10`,
        border: `1px solid ${colorVar}33`,
      }}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div style={{ color: colorVar }}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1" style={{ color: colorVar }}>
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * BrandedGlassCard - Card with glassmorphism effect and brand tint
 *
 * @param {React.ReactNode} children - Card content
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {string} className - Additional CSS classes
 */
export function BrandedGlassCard({ children, variant = 'primary', className = '' }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <div
      className={`rounded-lg p-6 backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: `${colorVar}08`,
        border: `1px solid ${colorVar}22`,
        boxShadow: `0 4px 6px ${colorVar}11`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * BrandedSection - Section wrapper with brand accent border
 *
 * @param {string} title - Section title
 * @param {string} description - Section description
 * @param {React.ReactNode} children - Section content
 * @param {'primary'|'secondary'|'accent'|'neutral'} variant - Color variant
 * @param {string} className - Additional CSS classes
 */
export function BrandedSection({ title, description, children, variant = 'primary', className = '' }) {
  const colorVar = `var(--brand-${variant})`;

  return (
    <section
      className={`rounded-lg border-l-4 p-6 ${className}`}
      style={{
        borderLeftColor: colorVar,
        backgroundColor: `${colorVar}03`,
      }}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-semibold mb-1" style={{ color: colorVar }}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default {
  BrandedStatCard,
  BrandedMetricCard,
  BrandedProgressBar,
  BrandedBadge,
  BrandedDivider,
  BrandedGradientText,
  BrandedIcon,
  BrandedLink,
  BrandedAlert,
  BrandedGlassCard,
  BrandedSection,
};
