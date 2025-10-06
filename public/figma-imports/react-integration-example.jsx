/**
 * Figma Data Integration Example
 *
 * This file demonstrates how to use extracted Figma data in React components.
 * Copy these patterns into your actual components.
 */

import React from 'react';
import figmaData from './selection-example-2025-10-05.json';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert Figma RGB (0-1 scale) to CSS hex color
 */
function rgbToHex(rgb) {
  if (!rgb) return '#000000';
  const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert Figma RGB to CSS rgba string
 */
function rgbToRgba(rgb, alpha = 1) {
  if (!rgb) return 'rgba(0, 0, 0, 1)';
  return `rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, ${alpha})`;
}

/**
 * Get fill color from Figma node
 */
function getFillColor(node, fallback = '#000000') {
  if (!node?.fills?.[0]) return fallback;
  const fill = node.fills[0];

  if (fill.type === 'SOLID') {
    return rgbToHex(fill.color);
  }

  if (fill.type === 'GRADIENT_LINEAR' && fill.gradientStops?.length >= 2) {
    const stops = fill.gradientStops.map((stop, i) =>
      `${rgbToRgba(stop.color, stop.color.a)} ${stop.position * 100}%`
    ).join(', ');
    return `linear-gradient(180deg, ${stops})`;
  }

  return fallback;
}

/**
 * Get text style object from Figma text node
 */
function getTextStyle(node) {
  if (!node?.style) return {};

  return {
    fontFamily: node.style.fontFamily || 'Inter',
    fontSize: `${node.style.fontSize}px`,
    fontWeight: node.style.fontWeight || 400,
    lineHeight: `${node.style.lineHeightPx}px`,
    letterSpacing: `${node.style.letterSpacing}px`,
    textAlign: node.style.textAlignHorizontal?.toLowerCase() || 'left',
    color: node.fills?.[0] ? rgbToHex(node.fills[0].color) : '#000000',
    opacity: node.fills?.[0]?.opacity ?? 1,
  };
}

/**
 * Get spacing/padding values from Figma node
 */
function getSpacing(node) {
  return {
    paddingTop: `${node.paddingTop || 0}px`,
    paddingRight: `${node.paddingRight || 0}px`,
    paddingBottom: `${node.paddingBottom || 0}px`,
    paddingLeft: `${node.paddingLeft || 0}px`,
  };
}

/**
 * Get dimensions from Figma node
 */
function getDimensions(node) {
  const box = node.absoluteBoundingBox;
  if (!box) return {};

  return {
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
}

/**
 * Extract all colors from Figma data
 */
function extractAllColors(nodes) {
  const colors = new Set();

  function traverse(node) {
    if (node.fills) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          colors.add(rgbToHex(fill.color));
        }
      });
    }
    if (node.strokes) {
      node.strokes.forEach(stroke => {
        if (stroke.type === 'SOLID' && stroke.color) {
          colors.add(rgbToHex(stroke.color));
        }
      });
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);
  return Array.from(colors);
}

/**
 * Find node by ID or name
 */
function findNode(nodes, idOrName) {
  function search(nodeList) {
    for (const node of nodeList) {
      if (node.id === idOrName || node.name === idOrName) {
        return node;
      }
      if (node.children) {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return null;
  }

  return search(nodes);
}

// ============================================================================
// DESIGN TOKENS EXTRACTED FROM FIGMA
// ============================================================================

export const designTokens = {
  colors: {
    primary: '#2C6BAA',
    secondary: '#C96F4C',
    accent: '#3C7A6A',
    text: {
      primary: '#1A1A1A',
      secondary: '#4D4D4D',
      white: '#FFFFFF',
    },
    background: {
      white: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #2C6BAA 0%, #3C7A6A 100%)',
    }
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: {
      display: '72px',
      h1: '48px',
      h2: '24px',
      body: '16px',
      bodyLarge: '18px',
      small: '14px',
    },
    fontWeight: {
      regular: 400,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.167,
      normal: 1.333,
      relaxed: 1.5,
    },
    letterSpacing: {
      tight: '-2px',
      normal: '0px',
      slightly: '-0.5px',
    }
  },
  spacing: {
    xs: '8px',
    sm: '16px',
    md: '32px',
    lg: '48px',
    xl: '64px',
    xxl: '80px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
  },
  shadows: {
    card: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  }
};

// ============================================================================
// EXAMPLE COMPONENTS BUILT FROM FIGMA DATA
// ============================================================================

/**
 * Hero Section Component - Built from Figma "Hero Section" frame
 */
export function HeroSection() {
  const { selection } = figmaData;
  const heroNode = findNode(selection.nodes, 'Hero Section');

  if (!heroNode) {
    return <div>Hero Section data not found</div>;
  }

  const headline = findNode([heroNode], 'Headline');
  const subheadline = findNode([heroNode], 'Subheadline');
  const ctaButton = findNode([heroNode], 'CTA Button');

  const heroStyle = {
    ...getDimensions(heroNode),
    ...getSpacing(heroNode),
    background: getFillColor(heroNode),
    display: 'flex',
    flexDirection: 'column',
    gap: `${heroNode.itemSpacing}px`,
  };

  return (
    <section style={heroStyle} className="hero-section">
      {headline && (
        <h1 style={getTextStyle(headline)}>
          {headline.characters}
        </h1>
      )}

      {subheadline && (
        <p style={getTextStyle(subheadline)}>
          {subheadline.characters}
        </p>
      )}

      {ctaButton && (
        <CTAButton node={ctaButton} />
      )}
    </section>
  );
}

/**
 * CTA Button Component - Extracted from Figma button
 */
function CTAButton({ node }) {
  const buttonText = findNode([node], 'Button Text');

  const buttonStyle = {
    ...getDimensions(node),
    ...getSpacing(node),
    background: getFillColor(node),
    borderRadius: `${node.cornerRadius}px`,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${node.itemSpacing || 0}px`,
  };

  return (
    <button style={buttonStyle}>
      {buttonText && (
        <span style={getTextStyle(buttonText)}>
          {buttonText.characters}
        </span>
      )}
    </button>
  );
}

/**
 * Feature Card Component - Built from Figma component
 */
export function FeatureCard({ icon, title, description }) {
  const { selection } = figmaData;
  const cardNode = findNode(selection.nodes, 'Feature Card');

  if (!cardNode) {
    return <div>Feature Card template not found</div>;
  }

  const cardStyle = {
    ...getDimensions(cardNode),
    ...getSpacing(cardNode),
    background: getFillColor(cardNode),
    borderRadius: `${cardNode.cornerRadius}px`,
    border: cardNode.strokes?.[0] ? `${cardNode.strokeWeight}px solid ${rgbToHex(cardNode.strokes[0].color)}` : 'none',
    boxShadow: designTokens.shadows.card,
    display: 'flex',
    flexDirection: 'column',
    gap: `${cardNode.itemSpacing}px`,
  };

  const titleNode = findNode([cardNode], 'Title');
  const descNode = findNode([cardNode], 'Description');

  return (
    <div style={cardStyle} className="feature-card">
      {icon && (
        <div className="feature-icon" style={{ width: '48px', height: '48px' }}>
          {icon}
        </div>
      )}

      {titleNode && (
        <h3 style={getTextStyle(titleNode)}>
          {title || titleNode.characters}
        </h3>
      )}

      {descNode && (
        <p style={getTextStyle(descNode)}>
          {description || descNode.characters}
        </p>
      )}
    </div>
  );
}

/**
 * Stats Item Component
 */
export function StatsItem({ number, label }) {
  const { selection } = figmaData;
  const statsGrid = findNode(selection.nodes, 'Stats Grid');
  const statsItem = statsGrid ? findNode([statsGrid], 'Stat Item 1') : null;

  if (!statsItem) return null;

  const numberNode = findNode([statsItem], 'Number');
  const labelNode = findNode([statsItem], 'Label');

  const containerStyle = {
    ...getDimensions(statsItem),
    display: 'flex',
    flexDirection: 'column',
    gap: `${statsItem.itemSpacing}px`,
  };

  return (
    <div style={containerStyle} className="stats-item">
      {numberNode && (
        <div style={getTextStyle(numberNode)}>
          {number || numberNode.characters}
        </div>
      )}

      {labelNode && (
        <div style={getTextStyle(labelNode)}>
          {label || labelNode.characters}
        </div>
      )}
    </div>
  );
}

/**
 * Logo Component - Extracted from Figma logo group
 */
export function Logo() {
  const { selection } = figmaData;
  const logoNode = findNode(selection.nodes, 'Logo');

  if (!logoNode) return null;

  const logoText = findNode([logoNode], 'Logo Text');

  const containerStyle = {
    ...getDimensions(logoNode),
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  return (
    <div style={containerStyle} className="logo">
      {/* Logo mark would be SVG/image here */}
      <div style={{ width: '48px', height: '48px', background: '#FFFFFF' }} />

      {logoText && (
        <span style={getTextStyle(logoText)}>
          {logoText.characters}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE PAGE USING FIGMA COMPONENTS
// ============================================================================

export default function FigmaIntegrationExample() {
  return (
    <div className="figma-page">
      <Logo />
      <HeroSection />

      <section className="features" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: designTokens.spacing.lg,
        padding: designTokens.spacing.xxl,
      }}>
        <FeatureCard
          icon={<span>🤖</span>}
          title="AI-Powered Analysis"
          description="Get deep insights into your marketing performance with advanced AI analytics."
        />
        <FeatureCard
          icon={<span>📊</span>}
          title="Real-time Dashboard"
          description="Monitor your campaigns in real-time with comprehensive analytics."
        />
        <FeatureCard
          icon={<span>⚡</span>}
          title="Instant Automation"
          description="Set up automated workflows that save hours of manual work."
        />
      </section>

      <section style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: designTokens.spacing.xxl,
        gap: designTokens.spacing.lg,
      }}>
        <StatsItem number="10M+" label="Marketing Campaigns Optimized" />
        <StatsItem number="500K+" label="Active Users" />
        <StatsItem number="99.9%" label="Uptime Guarantee" />
      </section>
    </div>
  );
}

// ============================================================================
// COLOR PALETTE REFERENCE
// ============================================================================

export function ColorPalette() {
  const colors = extractAllColors(figmaData.selection.nodes);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Extracted Color Palette</h2>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {colors.map(color => (
          <div key={color} style={{ textAlign: 'center' }}>
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: color,
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }} />
            <p style={{
              marginTop: '8px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}>
              {color}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*

STEP 1: Import components
import { HeroSection, FeatureCard, StatsItem, designTokens } from './figma-integration-example';

STEP 2: Use in your app
function App() {
  return (
    <div>
      <HeroSection />
      <FeatureCard
        title="Custom Title"
        description="Custom description"
        icon={<YourIconComponent />}
      />
    </div>
  );
}

STEP 3: Use design tokens in Tailwind config
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2C6BAA',
        secondary: '#C96F4C',
        accent: '#3C7A6A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
};

STEP 4: Replace example data with real Figma extraction
1. Use Claude Code with MCP tools to extract actual Figma selection
2. Replace the import: import figmaData from './selection-[timestamp].json';
3. Components will automatically use the real data

*/
