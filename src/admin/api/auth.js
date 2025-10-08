/**
 * Admin Nexus Auth - Uses centralized Supabase client
 */

import { supabase } from '../../lib/supabase-client.js'

// Re-export supabase for backward compatibility
export { supabase }

// Session management utilities
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const checkAuth = async () => {
  const session = await getSession()
  return {
    authenticated: !!session,
    user: session?.user || null,
    isAdmin: session?.user?.user_metadata?.role === 'admin'
  }
}

export const isAdmin = async () => {
  // Check session storage first
  if (typeof window !== 'undefined') {
    const nexusAuth = sessionStorage.getItem('admin-nexus-authenticated')
    if (nexusAuth === 'true') return true
  }

  // Fallback to Supabase check
  const session = await getSession()
  return session?.user?.user_metadata?.role === 'admin'
}

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

export const logoutAdmin = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  // Clear all admin session storage
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin-session')
    sessionStorage.removeItem('admin-nexus-authenticated')
  }
}
