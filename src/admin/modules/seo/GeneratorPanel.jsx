/**
 * Landing Page Generator Panel
 * AI-powered landing page creation with template system
 *
 * Features:
 * - Keyword selection from research
 * - Template selection with variable configuration
 * - AI content generation with Business Brain
 * - Uniqueness validation (85%+ required)
 * - Live preview before publishing
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../../api/auth'
import {
  parseTemplate,
  extractVariables,
  generateTitle,
  generateSlug,
  generateMetaDescription
} from '../../../lib/seo/template-parser'
import {
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Save,
  Wand2,
  X,
  ChevronRight,
  Brain,
  Target,
  Zap
} from 'lucide-react'

export default function GeneratorPanel({ templates = [], onClose, onComplete }) {
  const [step, setStep] = useState('select') // select, configure, generate, preview
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Selection step
  const [keywords, setKeywords] = useState([])
  const [selectedKeyword, setSelectedKeyword] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [businessBrains, setBusinessBrains] = useState([])
  const [selectedBrainId, setSelectedBrainId] = useState(null)

  // Configuration step
  const [variables, setVariables] = useState({})
  const [requiredVars, setRequiredVars] = useState([])
  const [contentType, setContentType] = useState('hybrid') // template, ai, hybrid

  // Generation step
  const [generatedContent, setGeneratedContent] = useState(null)
  const [progress, setProgress] = useState('')

  // Preview step
  const [editedContent, setEditedContent] = useState('')
  const [editedTitle, setEditedTitle] = useState('')
  const [editedSlug, setEditedSlug] = useState('')
  const [editedMetaDesc, setEditedMetaDesc] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      const vars = extractVariables(selectedTemplate.template_content || '')
      setRequiredVars(vars)

      // Pre-fill with selected keyword
      if (selectedKeyword) {
        setVariables(prev => ({
          ...prev,
          keyword: selectedKeyword.keyword,
          business_name: 'Disruptors & Co' // Default
        }))
      }
    }
  }, [selectedTemplate, selectedKeyword])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Load available keywords (high priority)
      const { data: keywordsData } = await supabase
        .from('keywords')
        .select('*')
        .in('assignment_status', ['available', 'in_progress'])
        .in('priority', ['critical', 'high'])
        .order('opportunity_score', { ascending: false })
        .limit(50)

      setKeywords(keywordsData || [])

      // Load Business Brains
      const { data: brainsData } = await supabase
        .from('business_brains')
        .select('id, business_name, industry')
        .order('business_name')

      setBusinessBrains(brainsData || [])

      // Auto-select first brain if available
      if (brainsData && brainsData.length > 0) {
        setSelectedBrainId(brainsData[0].id)
      }

    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load keywords and templates')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    // Validate required variables
    const missingVars = requiredVars.filter(v => !variables[v])
    if (missingVars.length > 0) {
      setError(`Missing required variables: ${missingVars.join(', ')}`)
      return
    }

    setLoading(true)
    setError(null)
    setStep('generate')
    setProgress('Preparing generation...')

    try {
      // Call Netlify function to generate content
      setProgress('Generating AI-enhanced content...')

      const response = await fetch('/.netlify/functions/seo-generate-landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: selectedKeyword.keyword,
          keywordId: selectedKeyword.id,
          templateId: selectedTemplate.id,
          templateContent: selectedTemplate.template_content,
          variables,
          businessBrainId: selectedBrainId,
          contentType,
          minUniqueness: 85
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed')
      }

      setProgress('Validating content quality...')

      // Show warnings if any
      if (result.validation.warnings.length > 0) {
        console.warn('Content warnings:', result.validation.warnings)
      }

      setGeneratedContent(result)
      setEditedContent(result.content)
      setEditedTitle(result.metadata.title)
      setEditedSlug(result.metadata.slug)
      setEditedMetaDesc(result.metadata.metaDescription)

      setStep('preview')

    } catch (err) {
      console.error('Generation failed:', err)
      setError(err.message || 'Failed to generate landing page')
      setStep('configure')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (status = 'draft') => {
    setLoading(true)
    setError(null)

    try {
      // Create post with landing page metadata
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: editedTitle,
          slug: editedSlug,
          content: editedContent,
          excerpt: editedMetaDesc,
          status,
          content_type: 'landing_page',
          is_landing_page: true,
          primary_keyword: selectedKeyword.keyword,
          word_count: generatedContent.metrics.wordCount,
          reading_time_minutes: generatedContent.metrics.readingTimeMinutes,
          seo_score: Math.round(
            (generatedContent.metrics.uniquenessScore +
              (generatedContent.metrics.keywordOptimal ? 100 : 50)) / 2
          ),
          published_at: status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (postError) throw postError

      // Create landing page metadata
      const { error: metaError } = await supabase
        .from('landing_pages_metadata')
        .insert({
          post_id: post.id,
          keyword_id: selectedKeyword.id,
          template_id: selectedTemplate.id,
          target_keyword: selectedKeyword.keyword,
          template_used: selectedTemplate.template_slug,
          template_variables: variables,
          uniqueness_score: generatedContent.metrics.uniquenessScore,
          keyword_density: generatedContent.metrics.keywordDensity,
          generation_method: contentType,
          business_brain_id: selectedBrainId
        })

      if (metaError) throw metaError

      // Update keyword assignment status
      await supabase
        .from('keywords')
        .update({
          assignment_status: 'assigned',
          assigned_post_id: post.id
        })
        .eq('id', selectedKeyword.id)

      // Success!
      onComplete()
      onClose()

    } catch (err) {
      console.error('Failed to publish:', err)
      setError('Failed to save landing page to database')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-500/10'
      case 'high': return 'text-orange-400 border-orange-500/30 bg-orange-500/10'
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      default: return 'text-green-400 border-green-500/30 bg-green-500/10'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-green-500 max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-green-500/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <Wand2 size={24} />
              LANDING_PAGE_GENERATOR
            </h2>
            <p className="text-green-500/70 text-sm mt-1">
              {step === 'select' && 'Select keyword and template'}
              {step === 'configure' && 'Configure template variables'}
              {step === 'generate' && 'Generating AI-enhanced content...'}
              {step === 'preview' && 'Preview and publish'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="border-b border-green-500/30 p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {['select', 'configure', 'generate', 'preview'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  step === s ? 'text-green-400' : 'text-green-500/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    step === s ? 'border-green-400 bg-green-500/20' : 'border-green-500/30'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-sm font-mono uppercase">{s}</span>
                </div>
                {idx < 3 && <ChevronRight size={16} className="mx-4 text-green-500/30" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Keyword & Template */}
          {step === 'select' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Keyword Selection */}
              <div>
                <label className="block text-green-400 font-mono text-sm mb-3 flex items-center gap-2">
                  <Target size={16} />
                  SELECT_TARGET_KEYWORD *
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto border border-green-500/30 p-4">
                  {keywords.length === 0 ? (
                    <div className="text-center text-green-500/50 py-8">
                      No high-priority keywords available. Run keyword research first!
                    </div>
                  ) : (
                    keywords.map(kw => (
                      <button
                        key={kw.id}
                        onClick={() => setSelectedKeyword(kw)}
                        className={`text-left p-4 border transition-colors ${
                          selectedKeyword?.id === kw.id
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-green-500/30 hover:border-green-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-green-400 font-medium">{kw.keyword}</div>
                            <div className="text-green-500/70 text-xs mt-1">
                              Volume: {kw.search_volume?.toLocaleString() || 'N/A'} ·
                              Difficulty: {kw.keyword_difficulty || 'N/A'} ·
                              Score: {kw.opportunity_score?.toFixed(1)}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs border ${getPriorityColor(kw.priority)}`}>
                            {kw.priority?.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-green-400 font-mono text-sm mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  SELECT_TEMPLATE *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {templates.length === 0 ? (
                    <div className="col-span-2 text-center text-green-500/50 py-8 border border-green-500/30">
                      No templates available. Please apply database migration first.
                    </div>
                  ) : (
                    templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`text-left p-4 border transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-green-500/30 hover:border-green-500/50'
                        }`}
                      >
                        <div className="text-green-400 font-medium mb-2">
                          {template.template_name}
                        </div>
                        <div className="text-green-500/70 text-xs mb-2">
                          {template.template_description}
                        </div>
                        <div className="text-green-500/50 text-xs">
                          Type: {template.template_category}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Business Brain Selection */}
              <div>
                <label className="block text-green-400 font-mono text-sm mb-3 flex items-center gap-2">
                  <Brain size={16} />
                  BUSINESS_BRAIN (Optional)
                </label>
                <select
                  value={selectedBrainId || ''}
                  onChange={(e) => setSelectedBrainId(e.target.value || null)}
                  className="w-full bg-black border border-green-500/30 text-green-400 px-4 py-2 focus:border-green-500 focus:outline-none"
                >
                  <option value="">No Business Brain (generic content)</option>
                  {businessBrains.map(brain => (
                    <option key={brain.id} value={brain.id}>
                      {brain.business_name} {brain.industry ? `- ${brain.industry}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-green-500/50 text-xs mt-2">
                  Business Brain adds personalized context and brand voice to your content
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure Variables */}
          {step === 'configure' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-black border border-green-500/30 p-4">
                <div className="text-green-400 font-mono text-sm mb-2">SELECTED_KEYWORD</div>
                <div className="text-green-500">{selectedKeyword?.keyword}</div>
              </div>

              <div className="bg-black border border-green-500/30 p-4">
                <div className="text-green-400 font-mono text-sm mb-2">TEMPLATE</div>
                <div className="text-green-500">{selectedTemplate?.template_name}</div>
              </div>

              {/* Content Type Selection */}
              <div>
                <label className="block text-green-400 font-mono text-sm mb-3">
                  GENERATION_METHOD
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'template', label: 'Template Only', desc: 'Fast, uses template structure only' },
                    { value: 'hybrid', label: 'Hybrid (Recommended)', desc: 'Template + AI enhancement for quality' },
                    { value: 'ai', label: 'Full AI', desc: 'Complete AI generation (slower, highest quality)' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer p-3 border border-green-500/30 hover:border-green-500/50">
                      <input
                        type="radio"
                        name="contentType"
                        value={option.value}
                        checked={contentType === option.value}
                        onChange={(e) => setContentType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="text-green-400 font-medium">{option.label}</div>
                        <div className="text-green-500/70 text-xs">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Variable Inputs */}
              <div>
                <label className="block text-green-400 font-mono text-sm mb-3">
                  TEMPLATE_VARIABLES
                </label>
                <div className="space-y-3">
                  {requiredVars.map(varName => (
                    <div key={varName}>
                      <label className="block text-green-500/70 text-xs mb-1">
                        {varName} {requiredVars.includes(varName) && '*'}
                      </label>
                      <input
                        type="text"
                        value={variables[varName] || ''}
                        onChange={(e) => setVariables(prev => ({ ...prev, [varName]: e.target.value }))}
                        placeholder={`Enter ${varName}...`}
                        className="w-full bg-black border border-green-500/30 text-green-400 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  ))}

                  {requiredVars.length === 0 && (
                    <div className="text-green-500/50 text-sm">
                      No additional variables required for this template
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 'generate' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-6" />
              <p className="text-green-400 font-mono text-lg mb-2">{progress}</p>
              <p className="text-green-500/70 text-sm">
                This may take 10-30 seconds for high-quality AI content...
              </p>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 'preview' && generatedContent && (
            <div className="space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-black border border-green-500/30 p-3">
                  <div className="text-green-500/70 text-xs font-mono mb-1">UNIQUENESS</div>
                  <div className={`text-2xl font-bold ${
                    generatedContent.metrics.uniquenessScore >= 90 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {generatedContent.metrics.uniquenessScore}%
                  </div>
                </div>
                <div className="bg-black border border-green-500/30 p-3">
                  <div className="text-green-500/70 text-xs font-mono mb-1">WORD_COUNT</div>
                  <div className="text-2xl font-bold text-green-400">
                    {generatedContent.metrics.wordCount}
                  </div>
                </div>
                <div className="bg-black border border-green-500/30 p-3">
                  <div className="text-green-500/70 text-xs font-mono mb-1">KEYWORD_DENSITY</div>
                  <div className={`text-2xl font-bold ${
                    generatedContent.metrics.keywordOptimal ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {generatedContent.metrics.keywordDensity}%
                  </div>
                </div>
                <div className="bg-black border border-green-500/30 p-3">
                  <div className="text-green-500/70 text-xs font-mono mb-1">READ_TIME</div>
                  <div className="text-2xl font-bold text-green-400">
                    {generatedContent.metrics.readingTimeMinutes}m
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {generatedContent.validation.warnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4">
                  <div className="text-yellow-400 font-mono text-sm mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    WARNINGS
                  </div>
                  {generatedContent.validation.warnings.map((warning, idx) => (
                    <div key={idx} className="text-yellow-500/70 text-xs">• {warning}</div>
                  ))}
                </div>
              )}

              {/* SEO Metadata */}
              <div className="space-y-3">
                <div>
                  <label className="block text-green-400 font-mono text-xs mb-1">TITLE</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full bg-black border border-green-500/30 text-green-400 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-green-400 font-mono text-xs mb-1">SLUG</label>
                  <input
                    type="text"
                    value={editedSlug}
                    onChange={(e) => setEditedSlug(e.target.value)}
                    className="w-full bg-black border border-green-500/30 text-green-400 px-3 py-2 text-sm focus:border-green-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-green-400 font-mono text-xs mb-1">META_DESCRIPTION</label>
                  <textarea
                    value={editedMetaDesc}
                    onChange={(e) => setEditedMetaDesc(e.target.value)}
                    rows={2}
                    maxLength={160}
                    className="w-full bg-black border border-green-500/30 text-green-400 px-3 py-2 text-sm focus:border-green-500 focus:outline-none resize-none"
                  />
                  <div className="text-green-500/50 text-xs mt-1">
                    {editedMetaDesc.length}/160 characters
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <label className="block text-green-400 font-mono text-xs mb-2">CONTENT_PREVIEW</label>
                <div className="bg-black border border-green-500/30 p-6 max-h-[400px] overflow-y-auto">
                  <div className="prose prose-invert prose-green max-w-none text-green-300 text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{editedContent}</pre>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-green-500/30 p-4 flex items-center justify-between">
          <div className="text-green-500/70 text-xs">
            {step === 'select' && 'Select a keyword and template to continue'}
            {step === 'configure' && 'Fill in template variables and configure generation'}
            {step === 'preview' && 'Review content and publish when ready'}
          </div>
          <div className="flex gap-2">
            {step === 'select' && (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => setStep('configure')}
                  disabled={!selectedKeyword || !selectedTemplate}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CONFIGURE
                  <ChevronRight size={16} />
                </button>
              </>
            )}
            {step === 'configure' && (
              <>
                <button
                  onClick={() => setStep('select')}
                  className="px-6 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  BACK
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  GENERATE
                </button>
              </>
            )}
            {step === 'preview' && (
              <>
                <button
                  onClick={() => setStep('configure')}
                  className="px-6 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  REGENERATE
                </button>
                <button
                  onClick={() => handlePublish('draft')}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  SAVE_DRAFT
                </button>
                <button
                  onClick={() => handlePublish('published')}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  PUBLISH
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
