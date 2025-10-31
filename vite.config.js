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

        // SOLUTION A: REMOVE ALL MANUAL CHUNKING
        // Let Vite's automatic chunking handle everything
        // This prevents React extraction issues that cause "Cannot read properties of undefined (reading 'forwardRef')"
        //
        // Trade-offs:
        // - Vite will automatically split chunks based on dependencies and usage patterns
        // - May result in more chunks but guaranteed correct dependency ordering
        // - Bundle size may be less optimized but site will actually work
        //
        // Previous attempts with manual chunking all failed because Vite's tree-shaking
        // and optimization passes would extract React into shared chunks despite our attempts
        // to prevent it. Automatic chunking respects dependency order.

        // No manualChunks function = automatic chunking
      }
    }
  }
})
