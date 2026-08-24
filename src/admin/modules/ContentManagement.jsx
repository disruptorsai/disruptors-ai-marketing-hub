/**
 * Content Management Module
 * Manages YOUR existing posts + AI-generated content
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../api/auth'
import { Agents, BusinessBrains } from '../../api/entities.ts'
import { Plus, Edit, Trash2, Eye, Calendar, Bot, User } from 'lucide-react'

export default function ContentManagement() {
  const [posts, setPosts] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showGenerator, setShowGenerator] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedStatus])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load posts with author details using the view
      let query = supabase
        .from('posts_with_authors')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }

      const { data: postsData, error: postsError } = await query

      if (postsError) throw postsError
      setPosts(postsData || [])

      // Load agents for generation
      const agentsData = await Agents.list()
      setAgents(agentsData || [])

    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (postId, newStatus) => {
    try {
      const updates = { status: newStatus }

      if (newStatus === 'published' && !posts.find(p => p.id === postId).published_at) {
        updates.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)

      if (error) throw error

      await loadData()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status')
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      await loadData()
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  const statuses = [
    { value: 'all', label: 'All Posts', count: posts.length },
    { value: 'draft', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
    { value: 'review', label: 'In Review', count: posts.filter(p => p.status === 'review').length },
    { value: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length },
    { value: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-green-500 animate-pulse">LOADING_CONTENT...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-400">CONTENT_MANAGEMENT</h1>
          <p className="text-green-500/70 text-sm mt-1">
            Manage existing posts and generate new content with AI
          </p>
        </div>

        <button
          onClick={() => setShowGenerator(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors"
        >
          <Bot size={16} />
          GENERATE_WITH_AI
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto">
        {statuses.map(status => (
          <button
            key={status.value}
            onClick={() => setSelectedStatus(status.value)}
            className={`px-4 py-2 border transition-colors whitespace-nowrap ${
              selectedStatus === status.value
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-gray-900 text-green-500 border-green-500/30 hover:border-green-500/50'
            }`}
          >
            {status.label} ({status.count})
          </button>
        ))}
      </div>

      {/* Posts table */}
      <div className="bg-gray-900 border border-green-500/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-500/30">
              <th className="text-left p-4 text-green-400 font-mono text-sm">TITLE</th>
              <th className="text-left p-4 text-green-400 font-mono text-sm">AUTHOR</th>
              <th className="text-left p-4 text-green-400 font-mono text-sm">STATUS</th>
              <th className="text-left p-4 text-green-400 font-mono text-sm">DATE</th>
              <th className="text-left p-4 text-green-400 font-mono text-sm">TYPE</th>
              <th className="text-right p-4 text-green-400 font-mono text-sm">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-green-500/50">
                  No posts found. Generate some content with AI!
                </td>
              </tr>
            ) : (
              posts.map(post => (
                <tr
                  key={post.id}
                  className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="text-green-400">{post.title}</div>
                    {post.word_count && (
                      <div className="text-green-500/50 text-xs mt-1">
                        {post.word_count} words · {post.reading_time_minutes || 0} min read
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-green-500">
                      {post.agent_name ? (
                        <>
                          <Bot size={14} />
                          <span className="text-xs">{post.agent_name}</span>
                        </>
                      ) : post.author_name ? (
                        <>
                          <User size={14} />
                          <span className="text-xs">{post.author_name}</span>
                        </>
                      ) : (
                        <span className="text-xs text-green-500/50">Unknown</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={post.status}
                      onChange={(e) => handleStatusChange(post.id, e.target.value)}
                      className="bg-black border border-green-500/30 text-green-400 px-2 py-1 text-xs focus:border-green-500 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="text-green-500 text-xs">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-500/70 text-xs">
                      {post.agent_id ? 'AI Generated' : 'Manual'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        className="p-1 text-green-500 hover:text-green-400 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => alert('Edit functionality coming soon!')}
                        className="p-1 text-green-500 hover:text-green-400 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
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

      {/* AI Generator Modal (placeholder) */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-green-500 p-8 max-w-2xl w-full m-4">
            <h2 className="text-xl font-bold text-green-400 mb-4">GENERATE_CONTENT</h2>
            <p className="text-green-500/70 mb-6">
              AI content generation coming soon! This will allow you to:
            </p>
            <ul className="text-green-500/70 space-y-2 mb-6">
              <li>• Select an agent</li>
              <li>• Provide a topic or keywords</li>
              <li>• Generate SEO-optimized content</li>
              <li>• Use business brain context</li>
              <li>• Apply brand DNA guidelines</li>
            </ul>
            <button
              onClick={() => setShowGenerator(false)}
              className="px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
