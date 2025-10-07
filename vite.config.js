import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // Using SWC for faster builds (2025 best practice)
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
    rollupOptions: {
      external: () => {
        // Don't externalize these in the browser build
        return false;
      },
      output: {
        // Manual chunk splitting for optimal performance
        manualChunks: {
          // Core React bundle
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI component library (Radix UI)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-tooltip'
          ],

          // Animation libraries
          'vendor-animation': ['framer-motion', 'gsap'],

          // 3D graphics (Spline) - Only loaded when needed
          'vendor-3d': ['@splinetool/react-spline', '@splinetool/runtime'],

          // AI generation libraries
          'vendor-ai': ['openai', '@google/generative-ai', '@google/genai', 'replicate'],

          // Database client
          'vendor-database': ['@supabase/supabase-js', '@base44/sdk'],

          // Utility libraries
          'vendor-utils': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'date-fns',
            'zod',
            'react-hook-form'
          ]
        },

        // Improve chunk distribution
        experimentalMinChunkSize: 20000 // 20 KB minimum chunk size
      }
    }
  }
}) 