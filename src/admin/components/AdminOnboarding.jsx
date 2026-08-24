/**
 * Admin Onboarding Component
 * Shows instructions for first-time admin users
 */

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, ArrowRight, Key, Mail, Shield } from 'lucide-react'

const ADMIN_EMAILS = {
  'will@disruptorsmedia.com': {
    name: 'Will',
    hasAccount: true,
    role: 'Admin',
    instructions: [
      'You already have an account - use your existing password',
      'Access admin panel via Ctrl+Shift+D or click logo 5 times',
      'Navigate to Telemetry Dashboard to view all KPIs'
    ]
  },
  'kyle@disruptorsmedia.com': {
    name: 'Kyle',
    hasAccount: true,
    role: 'Admin',
    instructions: [
      'You already have an account - use your existing password',
      'Access admin panel via Ctrl+Shift+D or click logo 5 times',
      'Navigate to Telemetry Dashboard to view all KPIs'
    ]
  },
  'tyler@disruptorsmedia.com': {
    name: 'Tyler',
    hasAccount: false,
    role: 'Admin',
    instructions: [
      'You need to create an account first',
      'Go to /signup and create account with this email',
      'Then login and access admin panel via Ctrl+Shift+D'
    ],
    signupUrl: '/signup'
  },
  'josh@disruptorsmedia.com': {
    name: 'Josh',
    hasAccount: false,
    role: 'Admin',
    instructions: [
      'You need to create an account first',
      'Go to /signup and create account with this email',
      'Then login and access admin panel via Ctrl+Shift+D'
    ],
    signupUrl: '/signup'
  },
  'admin@disruptors.co': {
    name: 'Admin',
    hasAccount: true,
    role: 'Super Admin',
    instructions: [
      'You already have an account - use your existing password',
      'You have full system access',
      'Navigate to Telemetry Dashboard to view all KPIs'
    ]
  }
}

export default function AdminOnboarding({ userEmail, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const userInfo = ADMIN_EMAILS[userEmail?.toLowerCase()] || null

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem(`admin-onboarding-${userEmail}`)
    if (hasSeenOnboarding === 'true') {
      setDismissed(true)
    }
  }, [userEmail])

  const handleDismiss = () => {
    localStorage.setItem(`admin-onboarding-${userEmail}`, 'true')
    setDismissed(true)
    if (onClose) onClose()
  }

  const handleNext = () => {
    if (currentStep < userInfo.instructions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleDismiss()
    }
  }

  if (dismissed || !userInfo) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-xl rounded-xl">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Welcome to Admin Nexus, {userInfo.name}!
              </h2>
              <p className="text-blue-100 mt-1">
                {userInfo.role} Access Granted
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Account Status Banner */}
          {userInfo.hasAccount ? (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
              <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-medium">Account Found</p>
                <p className="text-green-400/80 text-sm mt-1">
                  You already have an account - use your existing password to login
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
              <Mail size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-300 font-medium">Account Setup Required</p>
                <p className="text-amber-400/80 text-sm mt-1">
                  You need to create an account first before accessing admin features
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Key size={20} className="text-blue-400" />
              Getting Started
            </h3>

            {userInfo.instructions.map((instruction, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  index === currentStep
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : index < currentStep
                    ? 'bg-slate-800/50 border-slate-700/50 opacity-50'
                    : 'bg-slate-800/30 border-slate-700/30 opacity-30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index === currentStep
                        ? 'bg-blue-500 text-white'
                        : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle size={16} />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`${
                        index === currentStep
                          ? 'text-white font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {instruction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Access Info */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Quick Access Methods:
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span>Keyboard: Press <code className="px-2 py-1 bg-slate-700 rounded text-blue-300">Ctrl+Shift+D</code></span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span>Mouse: Click logo <strong>5 times in 3 seconds</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span>Direct: Navigate to <code className="px-2 py-1 bg-slate-700 rounded text-blue-300">/admin/secret</code></span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                <span>Emergency Exit: <code className="px-2 py-1 bg-slate-700 rounded text-red-300">Ctrl+Shift+Escape</code></span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-slate-400 hover:text-white transition-all"
            >
              Skip
            </button>

            <div className="flex items-center gap-3">
              {!userInfo.hasAccount && userInfo.signupUrl && (
                <a
                  href={userInfo.signupUrl}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  Create Account
                  <ArrowRight size={16} />
                </a>
              )}

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-all flex items-center gap-2"
              >
                {currentStep < userInfo.instructions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Got it!
                    <CheckCircle size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / userInfo.instructions.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}
