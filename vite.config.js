import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // Using SWC for faster builds (2025 best practice)
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    fs: {
      strict: false
    }
  },
  // Increase SSR transform timeout
  ssr: {
    noExternal: []
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
      },
    },
  },
  // Increase worker threads for faster parallel processing
  worker: {
    format: 'es',
  },
  // Increase build timeout for large projects
  esbuild: {
    logLevel: 'info',
    logLimit: 0,
  },
  build: {
    // Performance: Set chunk size warning limit to 1MB (increased for large projects)
    chunkSizeWarningLimit: 1000,
    // Ensure proper cache busting with hash-based filenames
    assetsInlineLimit: 4096, // 4kb - inline small assets as base64
    cssCodeSplit: false, // Disable CSS code splitting to reduce build complexity
    sourcemap: false, // Disable source maps in production for smaller builds
    // Build optimizations for complex projects
    minify: 'esbuild', // Use esbuild for faster minification
    target: 'es2020', // Modern browsers only (reduces transformation overhead)
    reportCompressedSize: false, // Skip compressed size reporting (saves time)
    emptyOutDir: true, // Clean dist folder before build

    // CRITICAL FIX: Disable modulePreload
    // modulePreload causes vendor chunks to load in PARALLEL with main bundle
    // This means vendor-ui (Radix components) executes BEFORE React is available
    // Disabling forces SEQUENTIAL loading: main bundle first, then vendor chunks
    modulePreload: false,

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

        // PERFORMANCE: Smart vendor chunking
        // Separates large libraries into individual chunks for better caching and parallel loading
        // React core stays in main bundle to prevent initialization errors
        manualChunks: (id) => {
          // Keep React in main bundle to avoid forwardRef errors
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }

          // Supabase - frequently updated, separate for cache optimization
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }

          // UI component libraries - stable, good for long-term caching
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }

          // Animation libraries - moderate size, frequently used
          if (id.includes('framer-motion') || id.includes('gsap')) {
            return 'vendor-animation';
          }

          // Router - stable, good for caching
          if (id.includes('react-router')) {
            return 'vendor-router';
          }

          // Other large node_modules (>50KB) go into vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        }
      }
    }
  }
})
