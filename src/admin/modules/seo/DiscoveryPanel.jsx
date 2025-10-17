/**
 * Keyword Discovery Panel
 * DataForSEO-powered keyword research interface
 *
 * Features:
 * - Seed keyword input with filters
 * - Location and language targeting
 * - Multiple discovery methods (suggestions, related, questions)
 * - Real-time opportunity scoring
 * - Batch keyword saving to database
 */

import React, { useState } from 'react'
import { supabase } from '../../../api/auth'
import { DataForSEOClient } from '../../../lib/dataforseo/client'
import { calculateOpportunityScore, batchCalculateOpportunityScores } from '../../../lib/seo/opportunity-scoring'
import {
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Filter,
  Globe,
  Target,
  Zap,
  Database,
  X
} from 'lucide-react'

export default function DiscoveryPanel({ onClose, onComplete }) {
  const [step, setStep] = useState('input') // input, discovering, results
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Input form state
  const [seedKeyword, setSeedKeyword] = useState('')
  const [location, setLocation] = useState('2840') // United States
  const [language, setLanguage] = useState('English')
  const [discoveryMethods, setDiscoveryMethods] = useState({
    suggestions: true,
    related: true,
    questions: false,
    siteKeywords: false
  })
  const [filters, setFilters] = useState({
    minVolume: 10,
    maxDifficulty: 100,
    includePattern: '',
    excludePattern: ''
  })

  // Results state
  const [discoveredKeywords, setDiscoveredKeywords] = useState([])
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' })

  const locations = [
    { code: '2840', name: 'United States' },
    { code: '2826', name: 'United Kingdom' },
    { code: '2124', name: 'Canada' },
    { code: '2036', name: 'Australia' },
    { code: '2554', name: 'New Zealand' }
  ]

  const handleDiscovery = async () => {
    if (!seedKeyword.trim()) {
      setError('Please enter a seed keyword')
      return
    }

    setLoading(true)
    setError(null)
    setStep('discovering')

    try {
      const client = new DataForSEOClient()
      let allKeywords = []
      let totalAPICalls = 0

      // Count total API calls for progress tracking
      const methodsEnabled = Object.values(discoveryMethods).filter(Boolean).length
      setProgress({ current: 0, total: methodsEnabled, message: 'Initializing...' })

      // Method 1: Keyword Suggestions (most comprehensive)
      if (discoveryMethods.suggestions) {
        setProgress(prev => ({ ...prev, message: 'Fetching keyword suggestions...' }))

        const suggestionFilters = []
        if (filters.minVolume > 0) {
          suggestionFilters.push(['search_volume', '>=', filters.minVolume])
        }
        if (filters.maxDifficulty < 100) {
          suggestionFilters.push(['keyword_difficulty', '<=', filters.maxDifficulty])
        }

        const suggestionsResult = await client.keywordSuggestions(
          seedKeyword,
          parseInt(location),
          suggestionFilters.length > 0 ? suggestionFilters : null,
          { language, limit: 500 }
        )

        if (suggestionsResult.tasks?.[0]?.result) {
          const keywords = suggestionsResult.tasks[0].result.map(item => ({
            keyword: item.keyword,
            search_volume: item.search_volume || 0,
            keyword_difficulty: item.keyword_difficulty || null,
            cpc: item.cpc || 0,
            competition: item.competition || null,
            trend_score: 0,
            source: 'suggestions'
          }))
          allKeywords.push(...keywords)
        }

        totalAPICalls++
        setProgress(prev => ({ ...prev, current: prev.current + 1 }))
      }

      // Method 2: Related Keywords
      if (discoveryMethods.related) {
        setProgress(prev => ({ ...prev, message: 'Fetching related keywords...' }))

        const relatedResult = await client.relatedKeywords(
          seedKeyword,
          parseInt(location),
          { language, limit: 300 }
        )

        if (relatedResult.tasks?.[0]?.result) {
          const keywords = relatedResult.tasks[0].result
            .filter(item => item.search_volume >= filters.minVolume)
            .filter(item => !filters.maxDifficulty || (item.keyword_difficulty || 0) <= filters.maxDifficulty)
            .map(item => ({
              keyword: item.keyword,
              search_volume: item.search_volume || 0,
              keyword_difficulty: item.keyword_difficulty || null,
              cpc: item.cpc || 0,
              competition: item.competition || null,
              trend_score: 0,
              source: 'related'
            }))
          allKeywords.push(...keywords)
        }

        totalAPICalls++
        setProgress(prev => ({ ...prev, current: prev.current + 1 }))
      }

      // Method 3: Question Keywords
      if (discoveryMethods.questions) {
        setProgress(prev => ({ ...prev, message: 'Fetching question keywords...' }))

        const questionFilters = [
          ['keyword', 'like', '%how%'],
          'or',
          ['keyword', 'like', '%what%'],
          'or',
          ['keyword', 'like', '%why%'],
          'or',
          ['keyword', 'like', '%when%'],
          'or',
          ['keyword', 'like', '%where%']
        ]

        const questionsResult = await client.keywordSuggestions(
          seedKeyword,
          parseInt(location),
          questionFilters,
          { language, limit: 200 }
        )

        if (questionsResult.tasks?.[0]?.result) {
          const keywords = questionsResult.tasks[0].result
            .filter(item => item.search_volume >= filters.minVolume)
            .map(item => ({
              keyword: item.keyword,
              search_volume: item.search_volume || 0,
              keyword_difficulty: item.keyword_difficulty || null,
              cpc: item.cpc || 0,
              competition: item.competition || null,
              trend_score: 0,
              source: 'questions'
            }))
          allKeywords.push(...keywords)
        }

        totalAPICalls++
        setProgress(prev => ({ ...prev, current: prev.current + 1 }))
      }

      // Remove duplicates and apply pattern filters
      setProgress({ current: totalAPICalls, total: methodsEnabled, message: 'Processing results...' })

      const uniqueKeywords = Array.from(
        new Map(allKeywords.map(kw => [kw.keyword.toLowerCase(), kw])).values()
      )

      let filteredKeywords = uniqueKeywords

      // Apply include pattern
      if (filters.includePattern) {
        const includeRegex = new RegExp(filters.includePattern, 'i')
        filteredKeywords = filteredKeywords.filter(kw => includeRegex.test(kw.keyword))
      }

      // Apply exclude pattern
      if (filters.excludePattern) {
        const excludeRegex = new RegExp(filters.excludePattern, 'i')
        filteredKeywords = filteredKeywords.filter(kw => !excludeRegex.test(kw.keyword))
      }

      // Calculate opportunity scores
      setProgress({ current: totalAPICalls, total: methodsEnabled, message: 'Calculating opportunity scores...' })

      const scoredKeywords = batchCalculateOpportunityScores(filteredKeywords)

      setDiscoveredKeywords(scoredKeywords)
      setStep('results')

      // Auto-select high-priority keywords
      const highPriority = scoredKeywords.filter(kw =>
        kw.priority === 'critical' || kw.priority === 'high'
      )
      setSelectedKeywords(highPriority.map(kw => kw.keyword))

    } catch (err) {
      console.error('Keyword discovery failed:', err)
      setError(err.message || 'Failed to discover keywords. Please check your DataForSEO credentials.')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveKeywords = async () => {
    if (selectedKeywords.length === 0) {
      setError('Please select at least one keyword to save')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const keywordsToSave = discoveredKeywords
        .filter(kw => selectedKeywords.includes(kw.keyword))
        .map(kw => ({
          keyword: kw.keyword,
          keyword_hash: btoa(kw.keyword.toLowerCase()),
          search_volume: kw.search_volume,
          keyword_difficulty: kw.keyword_difficulty,
          cpc: kw.cpc,
          competition: kw.competition,
          trend_score: kw.trend_score,
          opportunity_score: kw.score,
          priority: kw.priority,
          keyword_type: kw.metadata.keyword_type,
          search_intent: kw.metadata.search_intent,
          assignment_status: 'available',
          discovery_source: kw.source,
          discovery_location: location,
          discovery_language: language
        }))

      // Save to database (upsert to handle duplicates)
      const { error: saveError } = await supabase
        .from('keywords')
        .upsert(keywordsToSave, { onConflict: 'keyword_hash', ignoreDuplicates: false })

      if (saveError) throw saveError

      // Create research run record
      const { error: runError } = await supabase
        .from('keyword_research_runs')
        .insert({
          seed_keyword: seedKeyword,
          location_code: location,
          language: language,
          keywords_discovered: discoveredKeywords.length,
          keywords_saved: selectedKeywords.length,
          filters_applied: filters,
          discovery_methods: discoveryMethods,
          run_status: 'completed'
        })

      if (runError) console.error('Failed to save research run:', runError)

      // Success - close and refresh
      onComplete()
      onClose()

    } catch (err) {
      console.error('Failed to save keywords:', err)
      setError('Failed to save keywords to database')
    } finally {
      setLoading(false)
    }
  }

  const toggleKeywordSelection = (keyword) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-500/10'
      case 'high': return 'text-orange-400 border-orange-500/30 bg-orange-500/10'
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      case 'low': return 'text-green-400 border-green-500/30 bg-green-500/10'
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-green-500 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-green-500/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <Search size={24} />
              KEYWORD_DISCOVERY
            </h2>
            <p className="text-green-500/70 text-sm mt-1">
              {step === 'input' && 'Configure your keyword research parameters'}
              {step === 'discovering' && 'Discovering keywords from DataForSEO...'}
              {step === 'results' && `Found ${discoveredKeywords.length} keywords - Select to save`}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Input Form */}
          {step === 'input' && (
            <div className="space-y-6">
              {/* Seed Keyword */}
              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">
                  SEED_KEYWORD *
                </label>
                <input
                  type="text"
                  value={seedKeyword}
                  onChange={(e) => setSeedKeyword(e.target.value)}
                  placeholder="e.g., digital marketing"
                  className="w-full bg-black border border-green-500/30 text-green-400 px-4 py-2 focus:border-green-500 focus:outline-none font-mono"
                  autoFocus
                />
              </div>

              {/* Location & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 font-mono text-sm mb-2">
                    <Globe size={14} className="inline mr-1" />
                    LOCATION
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black border border-green-500/30 text-green-400 px-4 py-2 focus:border-green-500 focus:outline-none"
                  >
                    {locations.map(loc => (
                      <option key={loc.code} value={loc.code}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-green-400 font-mono text-sm mb-2">
                    LANGUAGE
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-black border border-green-500/30 text-green-400 px-4 py-2 focus:border-green-500 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>

              {/* Discovery Methods */}
              <div>
                <label className="block text-green-400 font-mono text-sm mb-3">
                  <Target size={14} className="inline mr-1" />
                  DISCOVERY_METHODS
                </label>
                <div className="space-y-2">
                  {Object.entries(discoveryMethods).map(([method, enabled]) => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setDiscoveryMethods(prev => ({ ...prev, [method]: e.target.checked }))}
                        className="w-4 h-4 bg-black border border-green-500/30 checked:bg-green-500"
                      />
                      <span className="text-green-500 text-sm">
                        {method === 'suggestions' && 'Keyword Suggestions (Comprehensive)'}
                        {method === 'related' && 'Related Keywords (Semantic)'}
                        {method === 'questions' && 'Question Keywords (How, What, Why, etc.)'}
                        {method === 'siteKeywords' && 'Site Keywords (Competitor Analysis)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-green-400 font-mono text-sm mb-3">
                  <Filter size={14} className="inline mr-1" />
                  FILTERS
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-green-500/70 text-xs mb-1">Min Search Volume</label>
                    <input
                      type="number"
                      value={filters.minVolume}
                      onChange={(e) => setFilters(prev => ({ ...prev, minVolume: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-black border border-green-500/30 text-green-400 px-3 py-1 text-sm focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-green-500/70 text-xs mb-1">Max Keyword Difficulty</label>
                    <input
                      type="number"
                      value={filters.maxDifficulty}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxDifficulty: parseInt(e.target.value) || 100 }))}
                      className="w-full bg-black border border-green-500/30 text-green-400 px-3 py-1 text-sm focus:border-green-500 focus:outline-none"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-green-500/70 text-xs mb-1">Include Pattern (regex)</label>
                    <input
                      type="text"
                      value={filters.includePattern}
                      onChange={(e) => setFilters(prev => ({ ...prev, includePattern: e.target.value }))}
                      placeholder="e.g., best|top|guide"
                      className="w-full bg-black border border-green-500/30 text-green-400 px-3 py-1 text-sm focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-green-500/70 text-xs mb-1">Exclude Pattern (regex)</label>
                    <input
                      type="text"
                      value={filters.excludePattern}
                      onChange={(e) => setFilters(prev => ({ ...prev, excludePattern: e.target.value }))}
                      placeholder="e.g., porn|casino|cheap"
                      className="w-full bg-black border border-green-500/30 text-green-400 px-3 py-1 text-sm focus:border-green-500 focus:outline-none"
                    />
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

          {/* Step 2: Discovering */}
          {step === 'discovering' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
              <p className="text-green-400 font-mono text-lg mb-2">
                {progress.message}
              </p>
              <p className="text-green-500/70 text-sm">
                Progress: {progress.current} / {progress.total} API calls
              </p>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 'results' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-black border border-green-500/30 p-3">
                  <div className="text-green-500/70 text-xs font-mono mb-1">DISCOVERED</div>
                  <div className="text-xl font-bold text-green-400">{discoveredKeywords.length}</div>
                </div>
                <div className="bg-black border border-green-500/30 p-3">
                  <div className="text-green-500/70 text-xs font-mono mb-1">SELECTED</div>
                  <div className="text-xl font-bold text-green-400">{selectedKeywords.length}</div>
                </div>
                <div className="bg-black border border-red-500/30 p-3">
                  <div className="text-red-500/70 text-xs font-mono mb-1">CRITICAL</div>
                  <div className="text-xl font-bold text-red-400">
                    {discoveredKeywords.filter(k => k.priority === 'critical').length}
                  </div>
                </div>
                <div className="bg-black border border-orange-500/30 p-3">
                  <div className="text-orange-500/70 text-xs font-mono mb-1">HIGH</div>
                  <div className="text-xl font-bold text-orange-400">
                    {discoveredKeywords.filter(k => k.priority === 'high').length}
                  </div>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedKeywords(discoveredKeywords.map(k => k.keyword))}
                  className="px-3 py-1 text-xs border border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  SELECT ALL
                </button>
                <button
                  onClick={() => setSelectedKeywords([])}
                  className="px-3 py-1 text-xs border border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  DESELECT ALL
                </button>
                <button
                  onClick={() => {
                    const highPriority = discoveredKeywords
                      .filter(k => k.priority === 'critical' || k.priority === 'high')
                      .map(k => k.keyword)
                    setSelectedKeywords(highPriority)
                  }}
                  className="px-3 py-1 text-xs border border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  SELECT HIGH PRIORITY
                </button>
              </div>

              {/* Keywords Table */}
              <div className="border border-green-500/30 max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-900">
                    <tr className="border-b border-green-500/30">
                      <th className="text-left p-2 text-green-400 font-mono text-xs">
                        <input
                          type="checkbox"
                          checked={selectedKeywords.length === discoveredKeywords.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedKeywords(discoveredKeywords.map(k => k.keyword))
                            } else {
                              setSelectedKeywords([])
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="text-left p-2 text-green-400 font-mono text-xs">KEYWORD</th>
                      <th className="text-left p-2 text-green-400 font-mono text-xs">VOLUME</th>
                      <th className="text-left p-2 text-green-400 font-mono text-xs">DIFFICULTY</th>
                      <th className="text-left p-2 text-green-400 font-mono text-xs">SCORE</th>
                      <th className="text-left p-2 text-green-400 font-mono text-xs">PRIORITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discoveredKeywords.map(kw => (
                      <tr
                        key={kw.keyword}
                        className="border-b border-green-500/10 hover:bg-green-500/5 cursor-pointer"
                        onClick={() => toggleKeywordSelection(kw.keyword)}
                      >
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedKeywords.includes(kw.keyword)}
                            onChange={() => toggleKeywordSelection(kw.keyword)}
                            className="w-4 h-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-2">
                          <div className="text-green-400 text-sm">{kw.keyword}</div>
                          <div className="text-green-500/50 text-xs">
                            {kw.metadata.keyword_type} · {kw.metadata.search_intent}
                          </div>
                        </td>
                        <td className="p-2 text-green-500 text-sm">
                          {kw.search_volume?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="p-2 text-green-500 text-sm">
                          {kw.keyword_difficulty || 'N/A'}
                        </td>
                        <td className="p-2">
                          <div className="text-green-400 font-bold text-sm">
                            {kw.score.toFixed(1)}
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 text-xs border ${getPriorityColor(kw.priority)}`}>
                            {kw.priority.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            {step === 'input' && 'Configure parameters and click Discover'}
            {step === 'discovering' && 'Please wait while we fetch keyword data...'}
            {step === 'results' && `${selectedKeywords.length} keywords selected for saving`}
          </div>
          <div className="flex gap-2">
            {step === 'input' && (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDiscovery}
                  disabled={loading || !seedKeyword.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap size={16} />
                  DISCOVER_KEYWORDS
                </button>
              </>
            )}
            {step === 'results' && (
              <>
                <button
                  onClick={() => setStep('input')}
                  className="px-6 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  BACK
                </button>
                <button
                  onClick={handleSaveKeywords}
                  disabled={loading || selectedKeywords.length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                  SAVE_{selectedKeywords.length}_KEYWORDS
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
