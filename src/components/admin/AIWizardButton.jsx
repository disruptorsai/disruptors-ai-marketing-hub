/**
 * AI Wizard Button Component
 *
 * Intelligent auto-fill button that uses OpenAI GPT to populate form fields
 * throughout the Admin Nexus with contextually relevant content.
 *
 * Features:
 * - Business Brain integration for brand voice matching
 * - Module-specific prompt generation
 * - Loading states with progress indication
 * - Error handling with user-friendly messages
 * - Cost-optimized using gpt-4o-mini
 */

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AIWizardButton({
  moduleType = 'lead_magnet',
  currentFields = {},
  onPopulate,
  businessBrainId = null,
  disabled = false,
  className = '',
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleAIWizard = async () => {
    try {
      setIsLoading(true)
      setProgress(0)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Get Business Brain ID from localStorage if not provided
      const brainId = businessBrainId || localStorage.getItem('businessBrainId')

      if (!brainId) {
        clearInterval(progressInterval)
        throw new Error('No Business Brain found. Please create one in Business Brain Builder.')
      }

      // Call Netlify function
      const response = await fetch('/.netlify/functions/ai-wizard-populate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleType,
          currentFields,
          businessBrainId: brainId,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI Wizard request failed')
      }

      const result = await response.json()

      // Populate fields via callback
      if (onPopulate && result.fields) {
        onPopulate(result.fields)
      }

      const fieldCount = result.fields ? Object.keys(result.fields).length : 0

      toast.success('✨ Content generated successfully!', {
        description: `Generated ${fieldCount} fields. Review and edit as needed.`,
        duration: 5000,
      })

      // Log usage for analytics
      console.log('AI Wizard Usage:', {
        moduleType,
        tokensUsed: result.tokensUsed,
        fieldsGenerated: fieldCount,
        costEstimate: result.costEstimate,
      })

    } catch (error) {
      console.error('AI Wizard error:', error)

      toast.error('AI Wizard Error', {
        description: error.message || 'Failed to generate content. Please try again.',
        duration: 7000,
      })
    } finally {
      setIsLoading(false)
      setProgress(0)
    }
  }

  return (
    <>
      <button
        onClick={handleAIWizard}
        disabled={disabled || isLoading}
        type="button"
        className={`
          inline-flex items-center gap-2 px-4 py-2
          bg-gradient-to-r from-blue-500 to-cyan-500
          hover:from-blue-600 hover:to-cyan-600
          disabled:from-gray-500 disabled:to-gray-600
          disabled:cursor-not-allowed
          text-white font-medium rounded-lg
          shadow-lg hover:shadow-xl
          transition-all duration-200
          ${className}
        `}
        title="Use AI to auto-fill form fields based on your Business Brain"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Sparkles size={18} className="animate-pulse" />
        )}
        <span>{isLoading ? 'Generating...' : 'AI Wizard'}</span>
      </button>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-xl border border-blue-500/30 max-w-md w-full mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Sparkles className="text-blue-400 animate-pulse" size={24} />
                <div className="absolute inset-0 animate-ping opacity-75">
                  <Sparkles className="text-blue-400" size={24} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white">AI Wizard Working...</h3>
            </div>

            {/* Description */}
            <p className="text-slate-400 mb-6 text-sm">
              Analyzing your Business Brain and generating high-quality content tailored to your brand voice...
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Progress Text */}
            <p className="text-center text-slate-500 mt-3 text-xs">
              {progress < 30 && 'Fetching brand context...'}
              {progress >= 30 && progress < 60 && 'Generating content with GPT-4o-mini...'}
              {progress >= 60 && progress < 90 && 'Validating and formatting...'}
              {progress >= 90 && 'Almost done!'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Field-Level AI Wizard Icon Button
 * Smaller version for individual field auto-fill
 */
export function AIWizardIconButton({
  fieldName,
  moduleType = 'lead_magnet',
  currentFields = {},
  onPopulate,
  className = '',
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleFieldAI = async () => {
    try {
      setIsLoading(true)

      const brainId = localStorage.getItem('businessBrainId')
      if (!brainId) {
        toast.error('No Business Brain found')
        return
      }

      const response = await fetch('/.netlify/functions/ai-wizard-populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleType,
          currentFields,
          businessBrainId: brainId,
          targetField: fieldName,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate field')

      const result = await response.json()

      if (onPopulate && result.fields) {
        onPopulate(result.fields)
      }

      toast.success(`✨ ${fieldName} generated!`)
    } catch (error) {
      console.error('Field AI error:', error)
      toast.error('Failed to generate field')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFieldAI}
      disabled={isLoading}
      type="button"
      className={`
        text-blue-500 hover:text-blue-600
        disabled:text-gray-400
        transition-colors
        ${className}
      `}
      title={`Use AI to generate ${fieldName}`}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Sparkles size={16} />
      )}
    </button>
  )
}

export default AIWizardButton
