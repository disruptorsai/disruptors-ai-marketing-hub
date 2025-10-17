/**
 * SEO Suite Module
 * Comprehensive SEO toolkit with keyword research, landing page generation, and analytics
 *
 * Features:
 * - Advanced Keyword Research (DataForSEO integration)
 * - Longtail Landing Page Generator (Template + AI hybrid)
 * - SERP Tracking & Analytics
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../api/auth'
import DiscoveryPanel from './seo/DiscoveryPanel'
import GeneratorPanel from './seo/GeneratorPanel'
import {
  Search,
  FileText,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Crown,
  AlertCircle
} from 'lucide-react'

export default function SEOSuite() {
  const [activeTab, setActiveTab] = useState('research')
  const [loading, setLoading] = useState(false)

  // Research tab state
  const [keywords, setKeywords] = useState([])
  const [researchRuns, setResearchRuns] = useState([])
  const [showDiscoveryPanel, setShowDiscoveryPanel] = useState(false)

  // Landing pages tab state
  const [landingPages, setLandingPages] = useState([])
  const [templates, setTemplates] = useState([])
  const [showGeneratorPanel, setShowGeneratorPanel] = useState(false)

  // Analytics tab state
  const [serpTracking, setSerpTracking] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)

  useEffect(() => {
    loadTabData()
  }, [activeTab])

  const loadTabData = async () => {
    try {
      setLoading(true)

      if (activeTab === 'research') {
        await loadKeywordsData()
      } else if (activeTab === 'landing-pages') {
        await loadLandingPagesData()
      } else if (activeTab === 'analytics') {
        await loadAnalyticsData()
      }
    } catch (error) {
      console.error('Failed to load tab data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadKeywordsData = async () => {
    // Load keywords from database
    const { data: keywordsData } = await supabase
      .from('keywords')
      .select('*')
      .order('opportunity_score', { ascending: false })
      .limit(100)

    setKeywords(keywordsData || [])

    // Load recent research runs
    const { data: runsData } = await supabase
      .from('keyword_research_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    setResearchRuns(runsData || [])
  }

  const loadLandingPagesData = async () => {
    // Load landing pages
    const { data: pagesData } = await supabase
      .from('posts')
      .select('*, landing_pages_metadata(*)')
      .eq('is_landing_page', true)
      .order('created_at', { ascending: false })

    setLandingPages(pagesData || [])

    // Load templates
    const { data: templatesData } = await supabase
      .from('landing_page_templates')
      .select('*')
      .order('template_name')

    setTemplates(templatesData || [])
  }

  const loadAnalyticsData = async () => {
    // Load SERP tracking data
    const { data: serpData } = await supabase
      .from('serp_tracking')
      .select('*')
      .order('tracked_at', { ascending: false })
      .limit(50)

    setSerpTracking(serpData || [])

    // Calculate analytics summary
    const totalPages = landingPages.length
    const avgRank = serpData.reduce((sum, item) => sum + (item.current_rank || 0), 0) / serpData.length || 0
    const topRankings = serpData.filter(item => item.current_rank <= 10).length

    setAnalyticsData({
      totalPages,
      avgRank: Math.round(avgRank * 10) / 10,
      topRankings,
      impressions: serpData.reduce((sum, item) => sum + (item.impressions || 0), 0),
      clicks: serpData.reduce((sum, item) => sum + (item.clicks || 0), 0)
    })
  }

  const tabs = [
    { id: 'research', label: 'Keyword Research', icon: Search, description: 'Discover high-opportunity keywords' },
    { id: 'landing-pages', label: 'Landing Pages', icon: FileText, description: 'Generate and manage landing pages' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Track rankings and performance' }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-500/10'
      case 'high': return 'text-orange-400 border-orange-500/30 bg-orange-500/10'
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      case 'low': return 'text-green-400 border-green-500/30 bg-green-500/10'
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10'
    }
  }

  if (loading && keywords.length === 0 && landingPages.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-green-500 animate-pulse">LOADING_SEO_SUITE...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-400">SEO_SUITE</h1>
          <p className="text-green-500/70 text-sm mt-1">
            Advanced keyword research, landing page generation, and SERP tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTabData}
            className="flex items-center gap-2 px-4 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
          >
            <RefreshCw size={16} />
            REFRESH
          </button>

          {activeTab === 'research' && (
            <button
              onClick={() => setShowDiscoveryPanel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors"
            >
              <Search size={16} />
              NEW_RESEARCH
            </button>
          )}

          {activeTab === 'landing-pages' && (
            <button
              onClick={() => setShowGeneratorPanel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors"
            >
              <Plus size={16} />
              GENERATE_PAGE
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-green-500/30">
        <nav className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                  isActive
                    ? 'border-green-500 text-green-400 bg-green-500/5'
                    : 'border-transparent text-green-500/50 hover:text-green-500/70 hover:bg-green-500/5'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {/* Research Tab */}
        {activeTab === 'research' && (
          <ResearchTab
            keywords={keywords}
            researchRuns={researchRuns}
            showDiscoveryPanel={showDiscoveryPanel}
            setShowDiscoveryPanel={setShowDiscoveryPanel}
            onRefresh={loadKeywordsData}
            getPriorityColor={getPriorityColor}
          />
        )}

        {/* Landing Pages Tab */}
        {activeTab === 'landing-pages' && (
          <LandingPagesTab
            landingPages={landingPages}
            templates={templates}
            showGeneratorPanel={showGeneratorPanel}
            setShowGeneratorPanel={setShowGeneratorPanel}
            onRefresh={loadLandingPagesData}
            getPriorityColor={getPriorityColor}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            serpTracking={serpTracking}
            analyticsData={analyticsData}
            onRefresh={loadAnalyticsData}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Research Tab Component
 * Keyword discovery and opportunity scoring
 */
function ResearchTab({ keywords, researchRuns, showDiscoveryPanel, setShowDiscoveryPanel, onRefresh, getPriorityColor }) {
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [filterPriority, setFilterPriority] = useState('all')

  const filteredKeywords = keywords.filter(kw => {
    if (filterPriority === 'all') return true
    return kw.priority === filterPriority
  })

  const priorityStats = {
    critical: keywords.filter(k => k.priority === 'critical').length,
    high: keywords.filter(k => k.priority === 'high').length,
    medium: keywords.filter(k => k.priority === 'medium').length,
    low: keywords.filter(k => k.priority === 'low').length
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">TOTAL_KEYWORDS</div>
          <div className="text-2xl font-bold text-green-400">{keywords.length}</div>
        </div>
        <div className="bg-gray-900 border border-red-500/30 p-4">
          <div className="text-red-500/70 text-xs font-mono mb-1">CRITICAL</div>
          <div className="text-2xl font-bold text-red-400">{priorityStats.critical}</div>
        </div>
        <div className="bg-gray-900 border border-orange-500/30 p-4">
          <div className="text-orange-500/70 text-xs font-mono mb-1">HIGH_PRIORITY</div>
          <div className="text-2xl font-bold text-orange-400">{priorityStats.high}</div>
        </div>
        <div className="bg-gray-900 border border-yellow-500/30 p-4">
          <div className="text-yellow-500/70 text-xs font-mono mb-1">MEDIUM</div>
          <div className="text-2xl font-bold text-yellow-400">{priorityStats.medium}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-green-500/50" />
        <div className="flex gap-2">
          {['all', 'critical', 'high', 'medium', 'low'].map(priority => (
            <button
              key={priority}
              onClick={() => setFilterPriority(priority)}
              className={`px-3 py-1 text-xs border transition-colors ${
                filterPriority === priority
                  ? 'bg-green-500 text-black border-green-500'
                  : 'bg-gray-900 text-green-500 border-green-500/30 hover:border-green-500/50'
              }`}
            >
              {priority.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-gray-900 border border-green-500/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-500/30">
              <th className="text-left p-4 text-green-400 font-mono text-xs">KEYWORD</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">VOLUME</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">DIFFICULTY</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">OPPORTUNITY</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">PRIORITY</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">STATUS</th>
              <th className="text-right p-4 text-green-400 font-mono text-xs">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-green-500/50">
                  No keywords found. Run keyword research to discover opportunities!
                </td>
              </tr>
            ) : (
              filteredKeywords.map(keyword => (
                <tr
                  key={keyword.id}
                  className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="text-green-400">{keyword.keyword}</div>
                    {keyword.keyword_type && (
                      <div className="text-green-500/50 text-xs mt-1">
                        {keyword.keyword_type} · {keyword.search_intent || 'unknown'}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-green-500">{keyword.search_volume?.toLocaleString() || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-500">{keyword.keyword_difficulty || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-400 font-bold">{keyword.opportunity_score?.toFixed(1) || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs border ${getPriorityColor(keyword.priority)}`}>
                      {keyword.priority?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-green-500/70 text-xs">
                      {keyword.assignment_status || 'available'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1 text-green-500 hover:text-green-400 transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1 text-green-500 hover:text-green-400 transition-colors"
                        title="Generate landing page"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Discovery Panel Modal */}
      {showDiscoveryPanel && (
        <DiscoveryPanel onClose={() => setShowDiscoveryPanel(false)} onComplete={onRefresh} />
      )}
    </div>
  )
}

/**
 * Landing Pages Tab Component
 * Template-based landing page generation and management
 */
function LandingPagesTab({ landingPages, templates, showGeneratorPanel, setShowGeneratorPanel, onRefresh, getPriorityColor }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">TOTAL_PAGES</div>
          <div className="text-2xl font-bold text-green-400">{landingPages.length}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">PUBLISHED</div>
          <div className="text-2xl font-bold text-green-400">
            {landingPages.filter(p => p.status === 'published').length}
          </div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">TEMPLATES</div>
          <div className="text-2xl font-bold text-green-400">{templates.length}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">AVG_UNIQUENESS</div>
          <div className="text-2xl font-bold text-green-400">
            {landingPages.length > 0
              ? Math.round(
                  landingPages.reduce((sum, p) => sum + (p.landing_pages_metadata?.[0]?.uniqueness_score || 0), 0) /
                    landingPages.length
                )
              : 0}%
          </div>
        </div>
      </div>

      {/* Landing Pages Table */}
      <div className="bg-gray-900 border border-green-500/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-500/30">
              <th className="text-left p-4 text-green-400 font-mono text-xs">TITLE</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">KEYWORD</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">TEMPLATE</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">UNIQUENESS</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">STATUS</th>
              <th className="text-right p-4 text-green-400 font-mono text-xs">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {landingPages.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-green-500/50">
                  No landing pages yet. Generate your first page from keywords!
                </td>
              </tr>
            ) : (
              landingPages.map(page => (
                <tr
                  key={page.id}
                  className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="text-green-400">{page.title}</div>
                    <div className="text-green-500/50 text-xs mt-1">
                      {page.word_count || 0} words · {page.reading_time_minutes || 0} min read
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-500">
                      {page.landing_pages_metadata?.[0]?.target_keyword || 'N/A'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-500/70 text-xs">
                      {page.landing_pages_metadata?.[0]?.template_used || 'custom'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`font-bold ${
                      (page.landing_pages_metadata?.[0]?.uniqueness_score || 0) >= 85
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }`}>
                      {page.landing_pages_metadata?.[0]?.uniqueness_score || 0}%
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-500/70 text-xs">
                      {page.status}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1 text-green-500 hover:text-green-400 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1 text-green-500 hover:text-green-400 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1 text-red-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Generator Panel Modal */}
      {showGeneratorPanel && (
        <GeneratorPanel
          templates={templates}
          onClose={() => setShowGeneratorPanel(false)}
          onComplete={onRefresh}
        />
      )}
    </div>
  )
}

/**
 * Analytics Tab Component
 * SERP tracking and performance monitoring
 */
function AnalyticsTab({ serpTracking, analyticsData, onRefresh }) {
  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">TRACKED_PAGES</div>
          <div className="text-2xl font-bold text-green-400">{analyticsData?.totalPages || 0}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">AVG_RANK</div>
          <div className="text-2xl font-bold text-green-400">{analyticsData?.avgRank || 0}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">TOP_10</div>
          <div className="text-2xl font-bold text-green-400">{analyticsData?.topRankings || 0}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">IMPRESSIONS</div>
          <div className="text-2xl font-bold text-green-400">
            {analyticsData?.impressions?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs font-mono mb-1">CLICKS</div>
          <div className="text-2xl font-bold text-green-400">
            {analyticsData?.clicks?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* SERP Tracking Table */}
      <div className="bg-gray-900 border border-green-500/30">
        <div className="border-b border-green-500/30 p-4">
          <h3 className="text-green-400 font-mono text-sm">RANK_TRACKING</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-500/30">
              <th className="text-left p-4 text-green-400 font-mono text-xs">KEYWORD</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">CURRENT_RANK</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">CHANGE</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">IMPRESSIONS</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">CLICKS</th>
              <th className="text-left p-4 text-green-400 font-mono text-xs">CTR</th>
            </tr>
          </thead>
          <tbody>
            {serpTracking.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-green-500/50">
                  No SERP tracking data yet. Data will appear once pages are indexed.
                </td>
              </tr>
            ) : (
              serpTracking.slice(0, 20).map(item => {
                const rankChange = (item.rank_change || 0)
                const ctr = item.impressions > 0 ? (item.clicks / item.impressions * 100).toFixed(2) : 0

                return (
                  <tr
                    key={item.id}
                    className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="text-green-400">{item.keyword}</div>
                    </td>
                    <td className="p-4">
                      <div className={`font-bold ${
                        item.current_rank <= 10 ? 'text-green-400' :
                        item.current_rank <= 20 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        #{item.current_rank || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1 ${
                        rankChange > 0 ? 'text-green-400' :
                        rankChange < 0 ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {rankChange > 0 ? '↑' : rankChange < 0 ? '↓' : '→'}
                        {Math.abs(rankChange)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-green-500">{item.impressions?.toLocaleString() || 0}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-green-500">{item.clicks?.toLocaleString() || 0}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-green-500">{ctr}%</div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


