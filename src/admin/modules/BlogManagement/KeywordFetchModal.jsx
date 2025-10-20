/**
 * Keyword Fetch Modal
 * Fetches trending keywords from DataForSEO and creates blog entries
 */

import React, { useState } from 'react'
import { X, TrendingUp, Loader2, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function KeywordFetchModal({ onClose, onKeywordsImported }) {
  const [loading, setLoading] = useState(false)
  const [keywords, setKeywords] = useState([])
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [settings, setSettings] = useState({
    industry: 'AI marketing',
    location: 'United States',
    minVolume: 100,
    maxDifficulty: 50,
    count: 20
  })

  const handleFetchKeywords = async () => {
    try {
      setLoading(true)
      toast.info('Fetching keywords from DataForSEO...')

      const response = await fetch('/.netlify/functions/dataforseo-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trending_keywords',
          industry: settings.industry,
          location: settings.location,
          minVolume: settings.minVolume,
          maxDifficulty: settings.maxDifficulty,
          count: settings.count
        })
      })

      if (!response.ok) throw new Error('Failed to fetch keywords')

      const result = await response.json()

      setKeywords(result.keywords || [])
      toast.success(`Found ${result.keywords?.length || 0} trending keywords!`)

    } catch (error) {
      console.error('Failed to fetch keywords:', error)
      toast.error('Failed to fetch keywords')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBlogs = async () => {
    if (selectedKeywords.length === 0) {
      toast.error('Please select at least one keyword')
      return
    }

    try {
      setLoading(true)
      toast.info(`Creating ${selectedKeywords.length} blog entries...`)

      const response = await fetch('/.netlify/functions/admin-blog-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_from_keywords',
          keywords: selectedKeywords
        })
      })

      if (!response.ok) throw new Error('Failed to create blogs')

      const result = await response.json()

      toast.success(`Created ${result.created} blog(s) from keywords!`)
      onKeywordsImported && await onKeywordsImported()
      onClose()

    } catch (error) {
      console.error('Failed to create blogs:', error)
      toast.error('Failed to create blogs')
    } finally {
      setLoading(false)
    }
  }

  const toggleKeyword = (keyword) => {
    setSelectedKeywords(prev => {
      const exists = prev.find(k => k.keyword === keyword.keyword)
      if (exists) {
        return prev.filter(k => k.keyword !== keyword.keyword)
      } else {
        return [...prev, keyword]
      }
    })
  }

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 20) return 'text-green-400 border-green-400/30'
    if (difficulty <= 40) return 'text-yellow-400 border-yellow-400/30'
    if (difficulty <= 60) return 'text-orange-400 border-orange-400/30'
    return 'text-red-400 border-red-400/30'
  }

  const filteredKeywords = keywords.filter(kw =>
    kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-500/30 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-green-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-green-400">KEYWORD_DISCOVERY</h2>
            <p className="text-green-500/50 text-sm mt-1">Fetch trending keywords from DataForSEO</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 border-b border-green-500/30 bg-gray-800/50">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-green-500/70 text-xs mb-1 block">Industry</label>
              <input
                type="text"
                value={settings.industry}
                onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                className="w-full bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="AI marketing"
              />
            </div>
            <div>
              <label className="text-green-500/70 text-xs mb-1 block">Location</label>
              <select
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm outline-none focus:border-green-500"
              >
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
            </div>
            <div>
              <label className="text-green-500/70 text-xs mb-1 block">Min Volume</label>
              <input
                type="number"
                value={settings.minVolume}
                onChange={(e) => setSettings({ ...settings, minVolume: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm outline-none focus:border-green-500"
                min="0"
              />
            </div>
            <div>
              <label className="text-green-500/70 text-xs mb-1 block">Max Difficulty</label>
              <input
                type="number"
                value={settings.maxDifficulty}
                onChange={(e) => setSettings({ ...settings, maxDifficulty: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm outline-none focus:border-green-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="text-green-500/70 text-xs mb-1 block">Count</label>
              <input
                type="number"
                value={settings.count}
                onChange={(e) => setSettings({ ...settings, count: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm outline-none focus:border-green-500"
                min="1"
                max="100"
              />
            </div>
          </div>

          <button
            onClick={handleFetchKeywords}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                FETCHING_KEYWORDS...
              </>
            ) : (
              <>
                <TrendingUp size={16} />
                FETCH_TRENDING_KEYWORDS
              </>
            )}
          </button>
        </div>

        {/* Keywords List */}
        <div className="flex-1 overflow-y-auto p-6">
          {keywords.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp size={48} className="mx-auto text-green-500/30 mb-4" />
              <div className="text-green-500/50 mb-2">No keywords fetched yet</div>
              <div className="text-green-500/30 text-sm">
                Configure settings above and click "Fetch Trending Keywords"
              </div>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter keywords..."
                  className="w-full bg-gray-800 border border-green-500/30 text-green-400 px-4 py-2 outline-none focus:border-green-500"
                />
              </div>

              {/* Selected Count */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-green-500/70 text-sm">
                  {selectedKeywords.length} selected • {filteredKeywords.length} total
                </div>
                <button
                  onClick={() => setSelectedKeywords(filteredKeywords)}
                  className="text-green-400 text-sm hover:underline"
                >
                  Select All
                </button>
              </div>

              {/* Keywords Grid */}
              <div className="space-y-2">
                {filteredKeywords.map((keyword, index) => {
                  const isSelected = selectedKeywords.find(k => k.keyword === keyword.keyword)

                  return (
                    <button
                      key={index}
                      onClick={() => toggleKeyword(keyword)}
                      className={`w-full text-left p-4 border transition-all ${
                        isSelected
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-gray-800 border-green-500/30 hover:border-green-500/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-green-400 font-medium">{keyword.keyword}</div>
                            {isSelected && (
                              <div className="bg-green-500 text-black rounded-full p-1">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs">
                            <div className="text-green-500/70">
                              Volume: <span className="text-green-400">{keyword.search_volume?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div className="text-green-500/70">
                              CPC: <span className="text-green-400">${keyword.cpc?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="text-green-500/70">
                              Competition: <span className="text-green-400">{(keyword.competition * 100)?.toFixed(0) || 0}%</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 border text-xs ${getDifficultyColor(keyword.keyword_difficulty || 0)}`}>
                          KD: {keyword.keyword_difficulty || 'N/A'}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-green-500/30 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 border border-green-500/30 text-green-400 hover:bg-gray-700 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleCreateBlogs}
            disabled={loading || selectedKeywords.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                CREATING...
              </>
            ) : (
              <>
                <Plus size={16} />
                CREATE_{selectedKeywords.length}_BLOG{selectedKeywords.length !== 1 ? 'S' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
