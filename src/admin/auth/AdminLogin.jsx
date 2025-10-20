/**
 * Admin Login Component
 * Supports both Supabase Auth and simple "nexus" password
 */

import React, { useState } from 'react'
import { supabase } from '../../lib/supabase-client'
import AdminOnboarding from '../components/AdminOnboarding'

const ADMIN_PASSWORD = 'nexus'

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loggedInEmail, setLoggedInEmail] = useState('')
  const [loginMode, setLoginMode] = useState('supabase') // 'supabase' or 'nexus'

  const handleSupabaseLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Attempt Supabase login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Check if user has admin role
      const isAdminUser = data.user?.user_metadata?.role === 'admin'

      if (!isAdminUser) {
        await supabase.auth.signOut()
        throw new Error('Access denied - Admin role required')
      }

      // Success - show onboarding for first-time users
      const hasSeenOnboarding = localStorage.getItem(`admin-onboarding-${email}`)

      setLoggedInEmail(email)
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      }

      // Mark as authenticated
      sessionStorage.setItem('admin-nexus-authenticated', 'true')

      setTimeout(() => {
        onSuccess({ authenticated: true })
      }, 500)

    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid email or password')
      setLoading(false)
    }
  }

  const handleNexusLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple password check for legacy "nexus" access
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin-nexus-authenticated', 'true')
      setTimeout(() => {
        onSuccess({ authenticated: true })
      }, 500)
    } else {
      setError('Invalid password')
      setLoading(false)
      setPassword('')
    }
  }

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <AdminOnboarding
          userEmail={loggedInEmail}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-cyan-500/10 animate-pulse" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Login form */}
        <div className="relative z-10 w-full max-w-md p-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Admin Nexus
              </h1>
              <p className="text-slate-400 text-sm">
                Secure access required
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 bg-slate-950/50 border border-slate-700/30 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setLoginMode('supabase')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  loginMode === 'supabase'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Email Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('nexus')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  loginMode === 'nexus'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Quick Access
              </button>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Supabase Email/Password Login */}
            {loginMode === 'supabase' && (
              <form onSubmit={handleSupabaseLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 text-white px-4 py-3 rounded-lg focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="admin@disruptorsmedia.com"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 text-white px-4 py-3 rounded-lg focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                <div className="text-center">
                  <p className="text-slate-500 text-xs">
                    Use your Supabase account credentials
                  </p>
                </div>
              </form>
            )}

            {/* Legacy Nexus Password */}
            {loginMode === 'nexus' && (
              <form onSubmit={handleNexusLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Access Code
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 text-white px-4 py-3 rounded-lg focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Enter access code"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                >
                  {loading ? 'Authenticating...' : 'Access'}
                </button>

                <div className="text-center">
                  <p className="text-slate-500 text-xs">
                    For legacy access only
                  </p>
                </div>
              </form>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800/50">
              <p className="text-slate-500 text-xs text-center">
                Disruptors & Co © 2025
              </p>
              <p className="text-slate-600 text-xs text-center mt-1">
                Unauthorized access prohibited
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
