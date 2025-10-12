import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * DynamicBackground - Cursor-reactive gradient mesh with scroll effects
 * Features:
 * - Gradient mesh that follows cursor
 * - Page-context aware color schemes
 * - Scroll-based blur/focus effects
 * - Smooth performance with requestAnimationFrame
 * - Customizable color palettes per page
 */

const COLOR_SCHEMES = {
  home: {
    primary: 'rgba(255, 215, 0, 0.15)', // Gold
    secondary: 'rgba(44, 107, 170, 0.15)', // Lapis Blue
    accent: 'rgba(201, 111, 76, 0.12)', // Terracotta
  },
  about: {
    primary: 'rgba(60, 122, 106, 0.15)', // Verdigris Green
    secondary: 'rgba(201, 165, 59, 0.15)', // Muted Gold
    accent: 'rgba(44, 107, 170, 0.12)', // Lapis Blue
  },
  work: {
    primary: 'rgba(0, 0, 0, 0)', // Transparent - no overlay
    secondary: 'rgba(0, 0, 0, 0)', // Transparent - no overlay
    accent: 'rgba(0, 0, 0, 0)', // Transparent - no overlay
  },
  solutions: {
    primary: 'rgba(201, 111, 76, 0.15)', // Terracotta
    secondary: 'rgba(60, 122, 106, 0.15)', // Verdigris Green
    accent: 'rgba(255, 215, 0, 0.1)', // Gold
  },
  contact: {
    primary: 'rgba(201, 165, 59, 0.18)', // Muted Gold
    secondary: 'rgba(201, 111, 76, 0.15)', // Terracotta
    accent: 'rgba(44, 107, 170, 0.1)', // Lapis Blue
  },
  default: {
    primary: 'rgba(255, 215, 0, 0.15)', // Gold
    secondary: 'rgba(44, 107, 170, 0.15)', // Lapis Blue
    accent: 'rgba(201, 165, 59, 0.12)', // Muted Gold
  },
};

export default function DynamicBackground({ pageContext = 'default', intensity = 1, children }) {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 }); // Normalized 0-1
  const targetPos = useRef({ x: 0.5, y: 0.5 });
  const animationRef = useRef(null);

  const { scrollYProgress } = useScroll();

  // Scroll-based blur effect
  const blurValue = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 10, 10, 20]);
  const blur = useTransform(blurValue, (value) => `blur(${value}px)`);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [1, 0.8, 0.8, 0.6]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e) => {
      targetPos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Get color scheme
    const colors = COLOR_SCHEMES[pageContext] || COLOR_SCHEMES.default;

    // Animation loop
    const animate = () => {
      // Smooth interpolation (easing)
      mousePos.current.x += (targetPos.current.x - mousePos.current.x) * 0.05;
      mousePos.current.y += (targetPos.current.y - mousePos.current.y) * 0.05;

      const { x, y } = mousePos.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Create gradient mesh
      const time = Date.now() * 0.0001;

      // Primary gradient (follows cursor)
      const gradient1 = ctx.createRadialGradient(
        x * width,
        y * height,
        0,
        x * width,
        y * height,
        Math.max(width, height) * 0.8 * intensity
      );
      gradient1.addColorStop(0, colors.primary);
      gradient1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Secondary gradient (opposite side)
      const gradient2 = ctx.createRadialGradient(
        (1 - x) * width,
        (1 - y) * height,
        0,
        (1 - x) * width,
        (1 - y) * height,
        Math.max(width, height) * 0.6 * intensity
      );
      gradient2.addColorStop(0, colors.secondary);
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Accent gradient (animated)
      const accentX = (0.5 + Math.sin(time) * 0.3) * width;
      const accentY = (0.5 + Math.cos(time * 0.7) * 0.3) * height;
      const gradient3 = ctx.createRadialGradient(
        accentX,
        accentY,
        0,
        accentX,
        accentY,
        Math.max(width, height) * 0.5 * intensity
      );
      gradient3.addColorStop(0, colors.accent);
      gradient3.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Draw gradients
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, width, height);

      // Animated noise overlay (optional)
      if (intensity > 0.5) {
        ctx.globalAlpha = 0.02;
        for (let i = 0; i < 50; i++) {
          const nx = Math.random() * width;
          const ny = Math.random() * height;
          const size = Math.random() * 100 + 50;
          const noiseGradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, size);
          noiseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
          noiseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = noiseGradient;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pageContext, intensity]);

  return (
    <div className="relative min-h-screen">
      {/* Canvas Background - renders immediately */}
      <motion.canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          filter: blur,
          opacity: opacity,
        }}
      />

      {/* Content - always render */}
      <div className="relative z-10">{children}</div>

      {/* Optional overlay for better text contrast */}
      <div className="fixed inset-0 pointer-events-none -z-5 bg-gradient-to-b from-transparent via-transparent to-white/20" />
    </div>
  );
}

/**
 * Utility component for scroll-based blur effects on sections
 */
export function BlurSection({ children, className = '', blurAmount = 8 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const blurValue = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [blurAmount, 0, 0, blurAmount]
  );

  const blur = useTransform(blurValue, (value) => `blur(${value}px)`);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        filter: blur,
        scale: scale,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Utility component for gradient mesh cards
 */
export function GradientCard({ children, className = '', colorScheme = 'default' }) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.default;

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
            mousePosition.y * 100
          }%, ${colors.primary} 0%, transparent 50%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
