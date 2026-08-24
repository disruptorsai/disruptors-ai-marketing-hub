/**
 * Dashboard Overview Module
 * Overview of YOUR site's content, team, and activity
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../api/auth'
import { BusinessBrains } from '../../api/entities.ts'
import { FileText, Users, Image as ImageIcon, Bot, TrendingUp, Calendar } from 'lucide-react'

export default function DashboardOverview() {
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)

      // Load overview stats
      const [postsResult, membersResult, mediaResult, agentsResult, brainResult] = await Promise.all([
        supabase.from('posts').select('id, status', { count: 'exact', head: true }),
        supabase.from('team_members').select('id', { count: 'exact', head: true }),
        supabase.from('site_media').select('id', { count: 'exact', head: true }),
        supabase.from('agents').select('id', { count: 'exact', head: true }),
        BusinessBrains.list()
      ])

      const postsCount = postsResult.count || 0
      const publishedPosts = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')

      const brainHealth = brainResult[0]
        ? await BusinessBrains.getHealth(brainResult[0].id)
        : null

      setStats({
        total_posts: postsCount,
        published_posts: publishedPosts.count || 0,
        draft_posts: postsCount - (publishedPosts.count || 0),
        team_members: membersResult.count || 0,
        media_assets: mediaResult.count || 0,
        ai_agents: agentsResult.count || 0,
        brain_facts: brainHealth?.total_facts || 0,
        brain_verified: brainHealth?.verified_percentage || 0
      })

      // Load recent activity from telemetry
      const { data: activity } = await supabase
        .from('telemetry_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentActivity(activity || [])

    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-400 animate-pulse font-medium">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm mt-1">
          System status and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText size={20} className="text-blue-400" />
            </div>
            <div className="text-xs text-slate-500 font-medium">CONTENT</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total_posts}</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.published_posts} published
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Users size={20} className="text-cyan-400" />
            </div>
            <div className="text-xs text-slate-500 font-medium">TEAM</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.team_members}</div>
          <div className="text-xs text-slate-500 mt-1">
            members
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <ImageIcon size={20} className="text-cyan-400" />
            </div>
            <div className="text-xs text-slate-500 font-medium">MEDIA</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.media_assets}</div>
          <div className="text-xs text-slate-500 mt-1">
            assets
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Bot size={20} className="text-green-400" />
            </div>
            <div className="text-xs text-slate-500 font-medium">AI AGENTS</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.ai_agents}</div>
          <div className="text-xs text-slate-500 mt-1">
            configured
          </div>
        </div>
      </div>

      {/* Brain Health */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-xl">
        <h2 className="text-lg font-bold text-white mb-4">Business Brain Health</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-slate-400 text-sm mb-2 font-medium">Total Facts</div>
            <div className="text-3xl font-bold text-white">{stats.brain_facts}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-2 font-medium">Verified</div>
            <div className="text-3xl font-bold text-white">{stats.brain_verified}%</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-xl">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <a
            href="/admin/secret/business-brain"
            className="p-4 bg-slate-950/50 border border-slate-800/50 hover:border-blue-500/30 hover:bg-slate-950/80 transition-all rounded-lg text-center group"
          >
            <TrendingUp size={24} className="mx-auto text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-slate-300 text-sm font-medium">Manage Business Brain</div>
          </a>
          <a
            href="/admin/secret/agents"
            className="p-4 bg-slate-950/50 border border-slate-800/50 hover:border-cyan-500/30 hover:bg-slate-950/80 transition-all rounded-lg text-center group"
          >
            <Bot size={24} className="mx-auto text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-slate-300 text-sm font-medium">Configure Agents</div>
          </a>
          <button
            onClick={() => alert('Content generation coming soon!')}
            className="p-4 bg-slate-950/50 border border-slate-800/50 hover:border-cyan-500/30 hover:bg-slate-950/80 transition-all rounded-lg text-center group"
          >
            <FileText size={24} className="mx-auto text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-slate-300 text-sm font-medium">Generate Content</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-xl">
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {recentActivity.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8">
              No recent activity
            </div>
          ) : (
            recentActivity.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/30 hover:border-slate-700/50 transition-all rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-slate-500" />
                  <div>
                    <div className="text-slate-200 text-sm font-medium">{event.name}</div>
                    <div className="text-slate-500 text-xs">{event.area}</div>
                  </div>
                </div>
                <div className="text-slate-500 text-xs">
                  {new Date(event.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
