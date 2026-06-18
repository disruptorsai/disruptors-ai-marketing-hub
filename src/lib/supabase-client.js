import { createClient } from '@supabase/supabase-js'

// Handle both Vite (import.meta.env) and Node.js (process.env) environments
const getEnvVar = (key, defaultValue) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue
  }
  // For Node.js environments
  if (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) {
    return globalThis.process.env[key] || defaultValue
  }
  return defaultValue
}

// Detect environment mode
const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.MODE === 'development' || import.meta.env.DEV
  : false

// Localhost defaults for development only
const LOCALHOST_URL = 'http://127.0.0.1:54321'
const LOCALHOST_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Get Supabase configuration with environment-aware fallbacks
let supabaseUrl = getEnvVar('VITE_SUPABASE_URL', isDevelopment ? LOCALHOST_URL : '')
let supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', isDevelopment ? LOCALHOST_ANON_KEY : '')

// Whether a usable Supabase configuration was found. Callers that depend on the data
// layer can import this to guard their calls.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Graceful degradation: if config is missing, warn loudly but DO NOT throw at import time.
// Throwing here crashes the entire SPA (blank #root) — including static marketing pages
// that don't need Supabase to render, and the build-time prerender. Instead we substitute
// inert placeholders so module init succeeds; any real Supabase request fails at call time.
if (!isSupabaseConfigured) {
  console.error('Missing Supabase configuration (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Data features are disabled; static pages will still render.')
  console.error('Current mode:', isDevelopment ? 'development' : 'production')
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET')
  supabaseUrl = supabaseUrl || 'https://placeholder.supabase.co'
  supabaseAnonKey = supabaseAnonKey || 'missing-anon-key'
}

// Development warning: Log when using localhost fallback
if (isDevelopment && supabaseUrl === LOCALHOST_URL) {
  console.warn('Supabase: Using localhost development instance (127.0.0.1:54321)')
  console.warn('To use production Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

// Production info: Log successful connection (without exposing keys)
if (!isDevelopment && supabaseUrl && !supabaseUrl.includes('127.0.0.1')) {
  console.info('Supabase: Connected to production instance:', supabaseUrl)
}

// Create main Supabase client (anon key for user operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'disruptors-ai-auth', // Single unique storage key for the entire app
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'disruptors-ai-marketing-hub',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Export as supabaseClient for backward compatibility
export const supabaseClient = supabase

// Service role client for admin operations (bypasses RLS)
const supabaseServiceKey = getEnvVar(
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  isDevelopment ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU' : ''
)

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        storageKey: 'disruptors-ai-admin-auth', // Separate storage key to avoid GoTrueClient conflicts
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'disruptors-ai-service-role',
        },
      },
    })
  : null

// Log service role availability
if (supabaseAdmin) {
  console.info('Supabase: Service role client initialized')
} else {
  console.warn('Supabase: Service role client not available (missing VITE_SUPABASE_SERVICE_ROLE_KEY)')
}