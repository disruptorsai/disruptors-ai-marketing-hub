/**
 * Competitor Monitor Component
 * Tracks SERP positions for competitor keywords
 */

import React, { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, Minus, RefreshCw, Target, Eye } from 'lucide-react'

export default function CompetitorMonitor({ brainId, domain }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (brainId) {
      loadStatus()
    }
  }, [brainId])

  const loadStatus = async () => {
    if (!brainId) return

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/competitor-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_status',
          brain_id: brainId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('[CompetitorMonitor] Failed to load status:', error)
      // Set placeholder data for now
      setStatus({
        brain_id: brainId,
        monitored_keywords: 0,
        last_check: null,
        next_check: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        position_changes: {
          improved: 0,
          declined: 0,
          stable: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddKeywords = async () => {
    if (!newKeyword.trim() || !brainId || !domain) return

    const keywords = newKeyword.split(',').map(k => k.trim()).filter(Boolean)

    try {
      const response = await fetch('/.netlify/functions/competitor-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_keywords',
          brain_id: brainId,
          keywords,
          domain
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      alert(`Added ${keywords.length} keywords to monitoring`)
      setNewKeyword('')
      setShowAddForm(false)
      await loadStatus()
    } catch (error) {
      console.error('[CompetitorMonitor] Failed to add keywords:', error)
      alert('Failed to add keywords')
    }
  }

  const handleRunCheck = async () => {
    if (!brainId) return

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/competitor-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_check',
          brain_id: brainId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      alert('Position check initiated! Results will be available in ~5 minutes.')
      setTimeout(loadStatus, 5000) // Reload after 5 seconds
    } catch (error) {
      console.error('[CompetitorMonitor] Failed to run check:', error)
      alert('Failed to initiate position check')
    } finally {
      setLoading(false)
    }
  }

  if (!brainId || !domain) {
    return (
      <div className="bg-gray-900 border border-yellow-500/30 p-4">
        <div className="text-yellow-500/70 text-sm">
          Configure domain in Business Brain settings to enable competitor monitoring
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-green-500/30 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="text-green-400" size={20} />
          <h2 className="text-lg font-bold text-green-400">COMPETITOR_MONITOR</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors text-sm"
          >
            <Plus size={14} />
            ADD_KEYWORDS
          </button>
          <button
            onClick={handleRunCheck}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            CHECK_NOW
          </button>
        </div>
      </div>

      {/* Add Keywords Form */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-black border border-green-500/20">
          <div className="text-green-500/70 text-xs mb-2">
            Enter keywords to monitor (comma-separated):
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="e.g., digital marketing, SEO agency, content writing"
              className="flex-1 bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={handleAddKeywords}
              className="px-4 py-2 bg-green-500/10 border border-green-500/30 hover:bg-green-500 hover:text-black transition-colors text-sm"
            >
              ADD
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewKeyword('')
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 hover:bg-gray-600 transition-colors text-sm"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Status Dashboard */}
      {status && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-black border border-green-500/20 p-3">
              <div className="text-green-500/70 text-xs mb-1">KEYWORDS</div>
              <div className="text-2xl text-green-400">{status.monitored_keywords}</div>
            </div>
            <div className="bg-black border border-green-500/20 p-3">
              <div className="text-green-500/70 text-xs mb-1">IMPROVED</div>
              <div className="flex items-center gap-1">
                <TrendingUp size={16} className="text-green-400" />
                <div className="text-2xl text-green-400">{status.position_changes.improved}</div>
              </div>
            </div>
            <div className="bg-black border border-green-500/20 p-3">
              <div className="text-green-500/70 text-xs mb-1">DECLINED</div>
              <div className="flex items-center gap-1">
                <TrendingDown size={16} className="text-red-400" />
                <div className="text-2xl text-red-400">{status.position_changes.declined}</div>
              </div>
            </div>
            <div className="bg-black border border-green-500/20 p-3">
              <div className="text-green-500/70 text-xs mb-1">STABLE</div>
              <div className="flex items-center gap-1">
                <Minus size={16} className="text-yellow-400" />
                <div className="text-2xl text-yellow-400">{status.position_changes.stable}</div>
              </div>
            </div>
          </div>

          {/* Check Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-black border border-green-500/20 p-3">
              <div className="text-green-500/70 text-xs mb-1">LAST_CHECK</div>
              <div className="text-sm text-green-400">
                {status.last_check ? new Date(status.last_check).toLocaleString() : 'Never'}
              </div>
            </div>
            <div className="bg-black border border-green-500/20 p-3">
              <div className="text-green-500/70 text-xs mb-1">NEXT_CHECK</div>
              <div className="text-sm text-green-400">
                {status.next_check ? new Date(status.next_check).toLocaleString() : 'Not scheduled'}
              </div>
            </div>
          </div>

          {/* Placeholder for keyword list */}
          {status.monitored_keywords === 0 && (
            <div className="bg-black border border-green-500/20 p-6 text-center">
              <Eye size={32} className="text-green-500/30 mx-auto mb-2" />
              <div className="text-green-500/70 text-sm mb-2">
                No keywords being monitored yet
              </div>
              <div className="text-green-500/50 text-xs">
                Click ADD_KEYWORDS to start tracking your SERP positions
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30">
        <div className="text-blue-400 text-xs font-semibold mb-1">COMPETITOR_INTELLIGENCE</div>
        <div className="text-blue-300/70 text-xs">
          Monitor SERP positions daily • Track competitor movements • Identify keyword opportunities •
          Costs ~$0.002 per keyword check
        </div>
      </div>
    </div>
  )
}
