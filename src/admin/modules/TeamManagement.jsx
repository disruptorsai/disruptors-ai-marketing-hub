/**
 * Team Management Module
 * Manages YOUR team_members with content permissions
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../api/auth'
import { Users, Shield, Edit, CheckCircle, XCircle } from 'lucide-react'

export default function TeamManagement() {
  const [members, setMembers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setLoading(true)

      // Load team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .order('name')

      if (membersError) throw membersError

      // Load content stats for each member
      const membersWithStats = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: statsData } = await supabase
            .rpc('get_team_member_stats', { member_id: member.id })

          return {
            ...member,
            stats: statsData || {
              total_posts: 0,
              published_posts: 0,
              draft_posts: 0,
              total_words: 0,
              avg_reading_time: 0
            }
          }
        })
      )

      setMembers(membersWithStats)

      // Calculate overall stats
      const totalStats = membersWithStats.reduce((acc, member) => ({
        total_members: acc.total_members + 1,
        content_creators: acc.content_creators + (member.can_write_content ? 1 : 0),
        total_posts: acc.total_posts + member.stats.total_posts,
        total_words: acc.total_words + member.stats.total_words
      }), { total_members: 0, content_creators: 0, total_posts: 0, total_words: 0 })

      setStats(totalStats)

    } catch (error) {
      console.error('Failed to load team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleContentPermission = async (memberId, currentValue) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ can_write_content: !currentValue })
        .eq('id', memberId)

      if (error) throw error

      await loadMembers()
    } catch (error) {
      console.error('Failed to update permission:', error)
      alert('Failed to update permission')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-green-500 animate-pulse">LOADING_TEAM...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-green-400">TEAM_MANAGEMENT</h1>
        <p className="text-green-500/70 text-sm mt-1">
          Manage team members and content permissions
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs mb-1">TOTAL_MEMBERS</div>
          <div className="text-2xl text-green-400">{stats.total_members}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs mb-1">CONTENT_CREATORS</div>
          <div className="text-2xl text-green-400">{stats.content_creators}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs mb-1">TOTAL_POSTS</div>
          <div className="text-2xl text-green-400">{stats.total_posts}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs mb-1">TOTAL_WORDS</div>
          <div className="text-2xl text-green-400">{stats.total_words?.toLocaleString()}</div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-gray-900 border border-green-500/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-500/30">
              <th className="text-left p-4 text-green-400 font-mono text-sm">MEMBER</th>
              <th className="text-left p-4 text-green-400 font-mono text-sm">ROLE</th>
              <th className="text-left p-4 text-green-400 font-mono text-sm">CONTENT_RIGHTS</th>
              <th className="text-left p-4 text-green-400 font-mono text-sm">POSTS</th>
              <th className="text-left p-4 text-green-400 font-mono text-sm">WORDS</th>
              <th className="text-right p-4 text-green-400 font-mono text-sm">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr
                key={member.id}
                className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {member.image && (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-10 h-10 rounded-full border border-green-500/30"
                      />
                    )}
                    <div>
                      <div className="text-green-400">{member.name}</div>
                      {member.email && (
                        <div className="text-green-500/50 text-xs">{member.email}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-green-500 text-sm">{member.role || 'Team Member'}</div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleContentPermission(member.id, member.can_write_content)}
                    className="flex items-center gap-2"
                  >
                    {member.can_write_content ? (
                      <>
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-green-400 text-sm">Enabled</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-400" />
                        <span className="text-red-400 text-sm">Disabled</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="p-4">
                  <div className="text-green-500 text-sm">
                    {member.stats.published_posts}/{member.stats.total_posts}
                    <span className="text-green-500/50 text-xs ml-1">published</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-green-500 text-sm">
                    {member.stats.total_words.toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => alert('Edit functionality coming soon!')}
                      className="p-1 text-green-500 hover:text-green-400 transition-colors"
                      title="Edit permissions"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => alert('Assign agents functionality coming soon!')}
                      className="p-1 text-green-500 hover:text-green-400 transition-colors"
                      title="Assign agents"
                    >
                      <Shield size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
