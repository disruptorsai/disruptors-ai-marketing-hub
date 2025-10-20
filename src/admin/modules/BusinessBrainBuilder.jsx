/**
 * Business Brain Builder Module
 * Manage knowledge sources, brain facts, and brain health
 */

import React, { useState, useEffect } from 'react'
import { BusinessBrains, BrainFacts, KnowledgeSources, Ingest } from '../../api/entities.ts'
import { Plus, RefreshCw, Search, Trash2, Check } from 'lucide-react'
import CompetitorMonitor from '../components/CompetitorMonitor.jsx'

export default function BusinessBrainBuilder() {
  const [brain, setBrain] = useState(null)
  const [facts, setFacts] = useState([])
  const [sources, setSources] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadBrain()
  }, [])

  const loadBrain = async () => {
    try {
      const brains = await BusinessBrains.list()
      const defaultBrain = brains.find(b => b.slug === 'default') || brains[0]

      if (defaultBrain) {
        setBrain(defaultBrain)
        await Promise.all([
          loadFacts(defaultBrain.id),
          loadSources(defaultBrain.id),
          loadHealth(defaultBrain.id)
        ])
      }
    } catch (error) {
      console.error('Failed to load brain:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFacts = async (brainId) => {
    const data = await BrainFacts.list(brainId)
    setFacts(data)
  }

  const loadSources = async (brainId) => {
    const data = await KnowledgeSources.list(brainId)
    setSources(data)
  }

  const loadHealth = async (brainId) => {
    const data = await BusinessBrains.getHealth(brainId)
    setHealth(data)
  }

  const handleSearch = async () => {
    if (!brain || !searchQuery) return

    try {
      const results = await BrainFacts.search(brain.id, searchQuery)
      setFacts(results.results || [])
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleIngest = async (sourceId) => {
    if (!brain) return

    try {
      await Ingest.dispatch({ brainId: brain.id, sourceId })
      alert('Ingestion started! Check back in a few minutes.')
    } catch (error) {
      console.error('Ingestion failed:', error)
      alert('Failed to start ingestion')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-green-500 animate-pulse">LOADING_BRAIN...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-400">BUSINESS_BRAIN</h1>
          <p className="text-green-500/70 text-sm mt-1">
            {brain?.name || 'No brain selected'}
          </p>
        </div>

        <button
          onClick={() => loadBrain()}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors"
        >
          <RefreshCw size={16} />
          REFRESH
        </button>
      </div>

      {/* Health Dashboard */}
      {health && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-green-500/30 p-4">
            <div className="text-green-500/70 text-xs mb-1">TOTAL_FACTS</div>
            <div className="text-2xl text-green-400">{health.total_facts}</div>
          </div>
          <div className="bg-gray-900 border border-green-500/30 p-4">
            <div className="text-green-500/70 text-xs mb-1">VERIFIED</div>
            <div className="text-2xl text-green-400">{health.verified_percentage}%</div>
          </div>
          <div className="bg-gray-900 border border-green-500/30 p-4">
            <div className="text-green-500/70 text-xs mb-1">AVG_CONFIDENCE</div>
            <div className="text-2xl text-green-400">{health.avg_confidence || 'N/A'}</div>
          </div>
          <div className="bg-gray-900 border border-green-500/30 p-4">
            <div className="text-green-500/70 text-xs mb-1">STALE_FACTS</div>
            <div className="text-2xl text-yellow-400">{health.stale_facts}</div>
          </div>
        </div>
      )}

      {/* Competitor Monitor */}
      <CompetitorMonitor
        brainId={brain?.id}
        domain={brain?.domain || sources.find(s => s.config?.url)?.config?.url?.split('/')[2]}
      />

      {/* Knowledge Sources */}
      <div className="bg-gray-900 border border-green-500/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-green-400">KNOWLEDGE_SOURCES</h2>
          <button className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors text-sm">
            <Plus size={14} />
            ADD_SOURCE
          </button>
        </div>

        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-3 bg-black border border-green-500/20 hover:border-green-500/50 transition-colors"
            >
              <div>
                <div className="text-green-400">{source.config?.url || 'Manual'}</div>
                <div className="text-green-500/50 text-xs mt-1">
                  {source.type.toUpperCase()} • Last: {source.last_ingested_at ? new Date(source.last_ingested_at).toLocaleDateString() : 'Never'}
                </div>
              </div>
              <button
                onClick={() => handleIngest(source.id)}
                className="px-3 py-1 bg-green-500/10 border border-green-500/30 hover:bg-green-500 hover:text-black transition-colors text-sm"
              >
                INGEST
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fact Explorer */}
      <div className="bg-gray-900 border border-green-500/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-green-400">FACT_EXPLORER</h2>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search facts..."
            className="flex-1 bg-black border border-green-500/30 text-green-400 px-4 py-2 focus:border-green-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-500/10 border border-green-500/30 hover:bg-green-500 hover:text-black transition-colors"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Facts Table */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className="p-3 bg-black border border-green-500/20 hover:border-green-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-green-400 font-medium">{fact.key}</div>
                  <div className="text-green-500/70 text-sm mt-1">
                    {typeof fact.value === 'object' ? JSON.stringify(fact.value) : String(fact.value)}
                  </div>
                  {fact.source && (
                    <div className="text-green-500/50 text-xs mt-2">
                      Source: {fact.source}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {fact.last_verified_at && (
                    <Check size={16} className="text-green-400" />
                  )}
                  <div className="text-xs text-green-500/70">
                    {fact.confidence ? (fact.confidence * 100).toFixed(0) + '%' : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
