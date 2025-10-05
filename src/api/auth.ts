/**
 * Authentication utilities for Admin Nexus
 * Handles JWT tokens, role verification, and session management
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'api-auth', // Unique storage key to avoid conflicts with other clients
    autoRefreshToken: true,
    persistSession: true,
  }
})

/**
 * Admin login with email/password
 */
export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  // Verify admin role
  const role = data.user?.app_metadata?.role
  if (role !== 'admin') {
    await supabase.auth.signOut()
    throw new Error('User is not authorized as admin')
  }

  return data
}

/**
 * Request admin role for current user
 * Requires admin secret key
 */
export async function requestAdminRole(secretKey: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  // Call Edge Function to set admin role
  const response = await fetch(`${supabaseUrl}/functions/v1/set-admin-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
    },
    body: JSON.stringify({
      userId: user.id,
      email: user.email,
      secretKey
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to grant admin role')
  }

  // Refresh session to get updated JWT with admin role
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError) throw refreshError

  return refreshData
}

/**
 * Logout admin
 */
export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Get current user
 */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getUser()
    return user?.app_metadata?.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Get JWT claims
 */
export async function getJWTClaims() {
  const session = await getSession()
  if (!session) return null

  // Decode JWT (client-side, for display only - server validates)
  const payload = session.access_token.split('.')[1]
  const decoded = JSON.parse(atob(payload))
  return decoded
}

/**
 * Auth state listener
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Check for secret admin access pattern
 * Returns true if admin access should be granted
 */
export function checkSecretPattern(): boolean {
  // This would be triggered by your existing secret access logic
  // (5 logo clicks or Ctrl+Shift+D)
  return localStorage.getItem('admin_access_granted') === 'true'
}

/**
 * Grant secret admin access
 */
export function grantSecretAccess() {
  localStorage.setItem('admin_access_granted', 'true')
  localStorage.setItem('admin_access_at', new Date().toISOString())
}

/**
 * Revoke secret admin access
 */
export function revokeSecretAccess() {
  localStorage.removeItem('admin_access_granted')
  localStorage.removeItem('admin_access_at')
}

/**
 * Check if secret access is still valid (24 hours)
 */
export function isSecretAccessValid(): boolean {
  const grantedAt = localStorage.getItem('admin_access_at')
  if (!grantedAt) return false

  const grantTime = new Date(grantedAt).getTime()
  const now = new Date().getTime()
  const hoursElapsed = (now - grantTime) / (1000 * 60 * 60)

  return hoursElapsed < 24
}
