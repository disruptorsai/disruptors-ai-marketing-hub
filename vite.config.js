import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // Using SWC for faster builds (2025 best practice)
import path from 'path'

// Custom plugin to ensure vendor-react loads BEFORE vendor-ui
function prioritizeReactChunk() {
  return {
    name: 'prioritize-react-chunk',
    enforce: 'post',
    transformIndexHtml(html) {
      // Move vendor-react modulepreload to FIRST position
      // This ensures React is available before any Radix UI components load
      const reactPreloadRegex = /<link rel="modulepreload"[^>]*vendor-react[^>]*>/;
      const reactPreloadMatch = html.match(reactPreloadRegex);

      if (reactPreloadMatch) {
        const reactPreload = reactPreloadMatch[0];
        // Remove vendor-react from current position
        html = html.replace(reactPreload, '');
        // Insert it as FIRST modulepreload (right after main script tag)
        html = html.replace(
          /(<script type="module"[^>]*><\/script>)/,
          `$1\n    ${reactPreload}`
        );
      }

      return html;
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), prioritizeReactChunk()],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    exclude: ['cloudinary'],
    include: ['@google/generative-ai', 'openai', 'replicate'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      define: {
        global: 'globalThis',
        'process.env': '{}'
      }
    },
  },
  build: {
    // Performance: Set chunk size warning limit to 250 KB
    chunkSizeWarningLimit: 250,
    // Ensure proper cache busting with hash-based filenames
    assetsInlineLimit: 4096, // 4kb - inline small assets as base64
    cssCodeSplit: true, // Split CSS by route for better caching
    sourcemap: false, // Disable source maps in production for smaller builds
    rollupOptions: {
      external: () => {
        // Don't externalize these in the browser build
        return false;
      },
      output: {
        // Ensure hash-based filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // Advanced route-based code splitting for optimal performance
        manualChunks(id) {
          // CRITICAL FIX: React MUST be in its own chunk that loads FIRST
          // This ensures React/ReactDOM are available before vendor-ui (Radix UI) loads
          // The issue was modulepreload causing vendor-ui to execute before main bundle
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // Radix UI components - used across site
          // NOTE: These depend on React, so vendor-react MUST load first
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-ui';
          }

          // Animation libraries - common across site
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/gsap')) {
            return 'vendor-animation';
          }

          // Utility libraries - common utilities
          if (id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/zod') ||
              id.includes('node_modules/react-hook-form')) {
            return 'vendor-utils';
          }

          // Database client - used across app
          if (id.includes('node_modules/@supabase/supabase-js') ||
              id.includes('node_modules/@base44/sdk')) {
            return 'vendor-database';
          }

          // 3D graphics (Spline) - Only for demo pages (already lazy-loaded)
          if (id.includes('node_modules/@splinetool')) {
            return 'vendor-3d';
          }

          // Admin-only chunks (large modules that should only load in admin)
          if (id.includes('/src/admin/') || id.includes('/src/components/admin/')) {
            if (id.includes('TelemetryDashboard')) {
              return 'admin-telemetry'; // 384 KB - admin only
            }
            if (id.includes('BusinessBrainBuilder') || id.includes('BrainThemedLayout')) {
              return 'admin-brain'; // Brain management
            }
            return 'admin-modules'; // Other admin modules
          }

          // App-only chunks (authenticated user features)
          if (id.includes('/src/pages/ai-content-writer') ||
              id.includes('/src/modules/ai-content-writer')) {
            return 'app-content-writer'; // 266 KB - app route only
          }

          if (id.includes('/src/pages/business-brain-manager')) {
            return 'app-business-brain';
          }

          if (id.includes('/src/modules/keyword-research')) {
            return 'app-keyword-research';
          }

          // AI libraries - Only load when AI features are used
          if (id.includes('node_modules/openai') ||
              id.includes('node_modules/@google/generative-ai') ||
              id.includes('node_modules/@google/genai') ||
              id.includes('node_modules/replicate')) {
            return 'vendor-ai'; // 366 KB - only for AI pages
          }

          // Growth audit - separate chunk
          if (id.includes('/src/lib/growth-audit/') ||
              id.includes('/src/pages/demos/growth-audit')) {
            return 'feature-growth-audit';
          }

          // Marketing audit - separate chunk
          if (id.includes('/src/pages/marketing-audit')) {
            return 'feature-marketing-audit';
          }

          // Large third-party libraries that should be separated
          if (id.includes('node_modules/chart.js')) {
            return 'vendor-charts';
          }

          if (id.includes('node_modules/howler')) {
            return 'vendor-audio';
          }

          // Default: let Vite handle automatic chunking for everything else
        },

        // Improve chunk distribution
        experimentalMinChunkSize: 20000 // 20 KB minimum chunk size
      }
    }
  }
}) 