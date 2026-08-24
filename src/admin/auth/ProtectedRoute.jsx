/**
 * Protected Route Component
 * Wrapper that ensures only authenticated admins can access routes
 */

import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdmin, getSession, onAuthStateChange } from '../../api/auth'
import AdminLogin from './AdminLogin'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (session) {
        checkAuth()
      } else {
        setIsAuthenticated(false)
        setShowLogin(true)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    try {
      // Check if user authenticated via MatrixLogin with "nexus" password
      const nexusAuth = sessionStorage.getItem('admin-nexus-authenticated')
      if (nexusAuth === 'true') {
        setIsAuthenticated(true)
        setShowLogin(false)
        setLoading(false)
        return
      }

      // Fallback to Supabase session check
      const session = await getSession()
      if (!session) {
        setIsAuthenticated(false)
        setShowLogin(true)
        return
      }

      const adminStatus = await isAdmin()
      setIsAuthenticated(adminStatus)
      setShowLogin(!adminStatus)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setShowLogin(true)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setShowLogin(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-500 font-mono">
          <div className="animate-pulse text-xl">AUTHENTICATING...</div>
        </div>
      </div>
    )
  }

  if (showLogin) {
    return <AdminLogin onSuccess={handleLoginSuccess} />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
