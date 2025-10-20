/**
 * Blog Management Module - Admin Nexus
 * Comprehensive blog automation system with:
 * - DataForSEO keyword integration
 * - Auto-scheduling (Mon/Wed/Fri → Tue/Thu)
 * - AI image generation (3 per blog)
 * - Approval workflow
 * - Real-time sync with public blog
 */

import React, { useState, useEffect, useCallback } from 'react'
import { supabaseAdmin } from '../../lib/supabase-client'
import {
  Calendar, Eye, Check, X, RefreshCw, Sparkles, Image as ImageIcon,
  TrendingUp, Loader2, Edit, Trash2, Clock, AlertCircle, ChevronDown,
  ChevronRight, Download, Upload, Filter, Search, Settings
} from 'lucide-react'
import { toast } from 'sonner'

// Sub-components
import BlogPreviewModal from './BlogManagement/BlogPreviewModal'
import BlogEditorModal from './BlogManagement/BlogEditorModal'
import ImageSelectorModal from './BlogManagement/ImageSelectorModal'
import KeywordFetchModal from './BlogManagement/KeywordFetchModal'
import BlogSettingsModal from './BlogManagement/BlogSettingsModal'

export default function BlogManagement() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedBlog, setExpandedBlog] = useState(null)

  // Modals
  const [previewModal, setPreviewModal] = useState({ open: false, blog: null })
  const [editorModal, setEditorModal] = useState({ open: false, blog: null })
  const [imageModal, setImageModal] = useState({ open: false, blog: null })
  const [keywordModal, setKeywordModal] = useState({ open: false })
  const [settingsModal, setSettingsModal] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending_review: 0,
    approved: 0,
    scheduled: 0,
    published: 0,
    buffer_count: 0
  })

  // System settings
  const [settings, setSettings] = useState(null)

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true)

      // Use the dashboard view for efficient loading
      let query = supabaseAdmin
        .from('blog_management_dashboard')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply status filter
      if (selectedStatus !== 'all') {
        query = query.eq('approval_status', selectedStatus)
      }

      const { data, error } = await query

      if (error) throw error

      setBlogs(data || [])

      // Calculate stats
      calculateStats(data || [])

    } catch (error) {
      console.error('Failed to load blogs:', error)
      toast.error('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('*')
        .in('setting_key', [
          'blog_schedule_phase_1',
          'blog_schedule_phase_2',
          'blog_buffer_size',
          'dataforseo_settings',
          'image_generation'
        ])

      if (error) throw error

      const settingsObj = {}
      data.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value
      })
      setSettings(settingsObj)

    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const calculateStats = (blogData) => {
    const newStats = {
      total: blogData.length,
      pending_review: blogData.filter(b => b.approval_status === 'pending_review').length,
      approved: blogData.filter(b => b.approval_status === 'approved').length,
      scheduled: blogData.filter(b => b.approval_status === 'scheduled').length,
      published: blogData.filter(b => b.is_published === true).length,
      buffer_count: blogData.filter(b =>
        b.approval_status === 'approved' || b.approval_status === 'scheduled'
      ).length
    }
    setStats(newStats)
  }

  useEffect(() => {
    loadBlogs()
    loadSettings()

    // Subscribe to real-time updates
    const subscription = supabaseAdmin
      .channel('blog_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, () => {
        loadBlogs()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [loadBlogs])

  // ============================================================================
  // BLOG ACTIONS
  // ============================================================================
  const handleApproveBlog = async (blogId) => {
    try {
      const { error } = await supabaseAdmin
        .from('posts')
        .update({
          approval_status: 'approved',
          approved_by: 'admin', // TODO: Get actual admin user
          approved_at: new Date().toISOString()
        })
        .eq('id', blogId)

      if (error) throw error

      toast.success('Blog approved! Auto-scheduling...')

      // Trigger auto-scheduling
      await autoScheduleApprovedPosts()
      await loadBlogs()

    } catch (error) {
      console.error('Failed to approve blog:', error)
      toast.error('Failed to approve blog')
    }
  }

  const handleRejectBlog = async (blogId) => {
    if (!confirm('Reject this blog? It will be marked for revision.')) return

    try {
      const { error } = await supabaseAdmin
        .from('posts')
        .update({
          approval_status: 'needs_revision'
        })
        .eq('id', blogId)

      if (error) throw error

      toast.success('Blog marked for revision')
      await loadBlogs()

    } catch (error) {
      console.error('Failed to reject blog:', error)
      toast.error('Failed to reject blog')
    }
  }

  const handleRegenerateBlog = async (blogId) => {
    if (!confirm('Regenerate this blog? Current content will be replaced.')) return

    try {
      const blog = blogs.find(b => b.id === blogId)
      if (!blog) return

      toast.info('Regenerating blog...')

      // Call generation function
      const response = await fetch('/.netlify/functions/admin-blog-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate',
          blogId,
          keyword: blog.keywords?.[0]?.keyword || blog.title
        })
      })

      if (!response.ok) throw new Error('Generation failed')

      toast.success('Blog regenerated successfully!')
      await loadBlogs()

    } catch (error) {
      console.error('Failed to regenerate blog:', error)
      toast.error('Failed to regenerate blog')
    }
  }

  const handleDeleteBlog = async (blogId) => {
    if (!confirm('Delete this blog permanently? This cannot be undone.')) return

    try {
      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', blogId)

      if (error) throw error

      toast.success('Blog deleted')
      await loadBlogs()

    } catch (error) {
      console.error('Failed to delete blog:', error)
      toast.error('Failed to delete blog')
    }
  }

  const handleGenerateImages = async (blogId) => {
    try {
      const blog = blogs.find(b => b.id === blogId)
      if (!blog) return

      toast.info('Generating 3 images...')

      // Call image generation function
      const response = await fetch('/.netlify/functions/admin-image-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId,
          title: blog.title,
          excerpt: blog.excerpt,
          count: 3
        })
      })

      if (!response.ok) throw new Error('Image generation failed')

      const result = await response.json()

      toast.success(`Generated ${result.images.length} images!`)
      setImageModal({ open: true, blog: { ...blog, image_options: result.images } })
      await loadBlogs()

    } catch (error) {
      console.error('Failed to generate images:', error)
      toast.error('Failed to generate images')
    }
  }

  // ============================================================================
  // AUTO-GENERATION & SCHEDULING
  // ============================================================================
  const autoScheduleApprovedPosts = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('auto_schedule_approved_posts')

      if (error) throw error

      if (data && data.length > 0) {
        toast.success(`Scheduled ${data.length} post(s)`)
      }

      return data

    } catch (error) {
      console.error('Failed to auto-schedule:', error)
      toast.error('Failed to auto-schedule posts')
    }
  }

  const handleGenerateBatch = async (count = 3) => {
    try {
      toast.info(`Generating ${count} new blogs...`)

      const response = await fetch('/.netlify/functions/admin-blog-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_batch',
          count
        })
      })

      if (!response.ok) throw new Error('Batch generation failed')

      const result = await response.json()

      toast.success(`Generated ${result.generated} blog(s)!`)
      await loadBlogs()

    } catch (error) {
      console.error('Failed to generate batch:', error)
      toast.error('Failed to generate blogs')
    }
  }

  const checkBufferAndGenerate = async () => {
    if (!settings) return

    const minBuffer = settings.blog_buffer_size?.min || 3
    const targetBuffer = settings.blog_buffer_size?.target || 5

    if (stats.buffer_count < minBuffer) {
      const needed = targetBuffer - stats.buffer_count
      toast.info(`Buffer low (${stats.buffer_count}/${minBuffer}). Generating ${needed} blogs...`)
      await handleGenerateBatch(needed)
    }
  }

  // ============================================================================
  // KEYWORD INTEGRATION
  // ============================================================================
  const handleFetchKeywords = async (keywords) => {
    try {
      toast.info('Fetching keywords from DataForSEO...')

      // This will be handled by the KeywordFetchModal component
      // which calls the DataForSEO API and creates blog entries
      setKeywordModal({ open: true })

    } catch (error) {
      console.error('Failed to fetch keywords:', error)
      toast.error('Failed to fetch keywords')
    }
  }

  // ============================================================================
  // FILTERING & SEARCH
  // ============================================================================
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = searchQuery === '' ||
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const getStatusColor = (status) => {
    const colors = {
      pending_review: 'text-yellow-400 border-yellow-400/30',
      approved: 'text-green-400 border-green-400/30',
      scheduled: 'text-blue-400 border-blue-400/30',
      published: 'text-green-500 border-green-500/30',
      needs_revision: 'text-red-400 border-red-400/30',
      rejected: 'text-red-500 border-red-500/30'
    }
    return colors[status] || 'text-gray-400 border-gray-400/30'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statuses = [
    { value: 'all', label: 'All Blogs', count: stats.total },
    { value: 'pending_review', label: 'Pending Review', count: stats.pending_review },
    { value: 'approved', label: 'Approved', count: stats.approved },
    { value: 'scheduled', label: 'Scheduled', count: stats.scheduled },
    { value: 'published', label: 'Published', count: stats.published }
  ]

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-green-500 animate-pulse font-mono">
          LOADING_BLOG_SYSTEM...
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="space-y-6 font-mono">
      {/* Header with Stats */}
      <div className="bg-gray-900 border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-400">BLOG_MANAGEMENT_SYSTEM</h1>
            <p className="text-green-500/70 text-sm mt-1">
              Auto-scheduling • Keyword integration • AI generation
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500/20 border border-slate-500/50 text-slate-400 hover:bg-slate-500/30 transition-colors"
              title="Blog Settings"
            >
              <Settings size={16} />
              SETTINGS
            </button>

            <button
              onClick={() => setKeywordModal({ open: true })}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <TrendingUp size={16} />
              GET_KEYWORDS
            </button>

            <button
              onClick={() => handleGenerateBatch(3)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              <Sparkles size={16} />
              GENERATE_BATCH
            </button>

            <button
              onClick={checkBufferAndGenerate}
              disabled={stats.buffer_count >= (settings?.blog_buffer_size?.min || 3)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} />
              CHECK_BUFFER
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-800 border border-green-500/20 p-4">
            <div className="text-green-400 text-2xl font-bold">{stats.total}</div>
            <div className="text-green-500/70 text-xs">TOTAL</div>
          </div>
          <div className="bg-gray-800 border border-yellow-500/20 p-4">
            <div className="text-yellow-400 text-2xl font-bold">{stats.pending_review}</div>
            <div className="text-yellow-500/70 text-xs">REVIEW</div>
          </div>
          <div className="bg-gray-800 border border-green-500/20 p-4">
            <div className="text-green-400 text-2xl font-bold">{stats.approved}</div>
            <div className="text-green-500/70 text-xs">APPROVED</div>
          </div>
          <div className="bg-gray-800 border border-blue-500/20 p-4">
            <div className="text-blue-400 text-2xl font-bold">{stats.scheduled}</div>
            <div className="text-blue-500/70 text-xs">SCHEDULED</div>
          </div>
          <div className="bg-gray-800 border border-green-500/20 p-4">
            <div className="text-green-500 text-2xl font-bold">{stats.published}</div>
            <div className="text-green-500/70 text-xs">PUBLISHED</div>
          </div>
          <div className={`bg-gray-800 border p-4 ${stats.buffer_count < (settings?.blog_buffer_size?.min || 3) ? 'border-red-500/50' : 'border-green-500/20'}`}>
            <div className={`text-2xl font-bold ${stats.buffer_count < (settings?.blog_buffer_size?.min || 3) ? 'text-red-400' : 'text-green-400'}`}>
              {stats.buffer_count}
            </div>
            <div className="text-green-500/70 text-xs">BUFFER</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 flex-wrap flex-1">
          {statuses.map(status => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 border transition-colors ${
                selectedStatus === status.value
                  ? 'bg-green-500 text-black border-green-500'
                  : 'bg-gray-900 text-green-500 border-green-500/30 hover:border-green-500/50'
              }`}
            >
              {status.label} ({status.count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-gray-900 border border-green-500/30 px-4 py-2 min-w-[300px]">
          <Search size={16} className="text-green-500/50" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-green-400 placeholder-green-500/50 outline-none"
          />
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-gray-900 border border-green-500/30 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-500/30">
              <th className="text-left p-4 text-green-400 text-sm w-12">#</th>
              <th className="text-left p-4 text-green-400 text-sm">TITLE</th>
              <th className="text-left p-4 text-green-400 text-sm w-32">STATUS</th>
              <th className="text-left p-4 text-green-400 text-sm w-40">SCHEDULED</th>
              <th className="text-left p-4 text-green-400 text-sm w-24">IMAGES</th>
              <th className="text-left p-4 text-green-400 text-sm w-48">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-12 text-green-500/50">
                  NO_BLOGS_FOUND
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog, index) => (
                <BlogRow
                  key={blog.id}
                  blog={blog}
                  index={index}
                  expanded={expandedBlog === blog.id}
                  onToggleExpand={() => setExpandedBlog(expandedBlog === blog.id ? null : blog.id)}
                  onApprove={handleApproveBlog}
                  onReject={handleRejectBlog}
                  onRegenerate={handleRegenerateBlog}
                  onDelete={handleDeleteBlog}
                  onGenerateImages={handleGenerateImages}
                  onPreview={(blog) => setPreviewModal({ open: true, blog })}
                  onEdit={(blog) => setEditorModal({ open: true, blog })}
                  onSelectImages={(blog) => setImageModal({ open: true, blog })}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {previewModal.open && (
        <BlogPreviewModal
          blog={previewModal.blog}
          onClose={() => setPreviewModal({ open: false, blog: null })}
        />
      )}

      {editorModal.open && (
        <BlogEditorModal
          blog={editorModal.blog}
          onClose={() => setEditorModal({ open: false, blog: null })}
          onSave={loadBlogs}
        />
      )}

      {imageModal.open && (
        <ImageSelectorModal
          blog={imageModal.blog}
          onClose={() => setImageModal({ open: false, blog: null })}
          onSelect={loadBlogs}
        />
      )}

      {keywordModal.open && (
        <KeywordFetchModal
          onClose={() => setKeywordModal({ open: false })}
          onKeywordsImported={loadBlogs}
        />
      )}

      <BlogSettingsModal
        isOpen={settingsModal}
        onClose={() => setSettingsModal(false)}
      />
    </div>
  )
}

// ============================================================================
// BLOG ROW COMPONENT
// ============================================================================
function BlogRow({
  blog,
  index,
  expanded,
  onToggleExpand,
  onApprove,
  onReject,
  onRegenerate,
  onDelete,
  onGenerateImages,
  onPreview,
  onEdit,
  onSelectImages,
  getStatusColor,
  formatDate
}) {
  return (
    <>
      <tr className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors">
        <td className="p-4 text-green-500/70 text-sm">{index + 1}</td>
        <td className="p-4">
          <div className="flex items-start gap-2">
            <button
              onClick={onToggleExpand}
              className="text-green-500/70 hover:text-green-400 mt-1"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="flex-1">
              <div className="text-green-400 font-medium">{blog.title}</div>
              {blog.excerpt && (
                <div className="text-green-500/50 text-xs mt-1 line-clamp-2">
                  {blog.excerpt}
                </div>
              )}
              {blog.keywords && blog.keywords.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {blog.keywords.slice(0, 3).map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs"
                    >
                      {kw.keyword} {kw.volume && `(${kw.volume})`}
                    </span>
                  ))}
                  {blog.keywords.length > 3 && (
                    <span className="text-green-500/50 text-xs px-2 py-0.5">
                      +{blog.keywords.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className={`px-3 py-1 border text-xs uppercase ${getStatusColor(blog.approval_status)}`}>
            {blog.approval_status?.replace('_', ' ')}
          </span>
        </td>
        <td className="p-4 text-green-500/70 text-xs">
          {blog.scheduled_for ? (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(blog.scheduled_for)}
            </div>
          ) : (
            '-'
          )}
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm">
              {blog.image_count || 0}/3
            </span>
            {blog.featured_image && (
              <img
                src={blog.featured_image}
                alt=""
                className="w-8 h-8 object-cover border border-green-500/30"
              />
            )}
          </div>
        </td>
        <td className="p-4">
          <div className="flex gap-1">
            <button
              onClick={() => onPreview(blog)}
              className="p-2 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
              title="Preview"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onEdit(blog)}
              className="p-2 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/30"
              title="Edit"
            >
              <Edit size={14} />
            </button>
            {blog.approval_status === 'pending_review' && (
              <>
                <button
                  onClick={() => onApprove(blog.id)}
                  className="p-2 text-green-400 hover:bg-green-500/20 border border-green-500/30"
                  title="Approve"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => onReject(blog.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                  title="Reject"
                >
                  <X size={14} />
                </button>
              </>
            )}
            {(blog.image_count || 0) < 3 && (
              <button
                onClick={() => onGenerateImages(blog.id)}
                className="p-2 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30"
                title="Generate Images"
              >
                <ImageIcon size={14} />
              </button>
            )}
            {(blog.image_count || 0) >= 1 && (
              <button
                onClick={() => onSelectImages(blog)}
                className="p-2 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30"
                title="Select Featured Image"
              >
                <Sparkles size={14} />
              </button>
            )}
            <button
              onClick={() => onRegenerate(blog.id)}
              className="p-2 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30"
              title="Regenerate"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => onDelete(blog.id)}
              className="p-2 text-red-400 hover:bg-red-500/20 border border-red-500/30"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-800/50">
          <td colSpan="6" className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-green-500/50 mb-1">Created</div>
                <div className="text-green-400">{formatDate(blog.created_at)}</div>
              </div>
              <div>
                <div className="text-green-500/50 mb-1">Updated</div>
                <div className="text-green-400">{formatDate(blog.updated_at)}</div>
              </div>
              {blog.approved_at && (
                <div>
                  <div className="text-green-500/50 mb-1">Approved</div>
                  <div className="text-green-400">{formatDate(blog.approved_at)}</div>
                </div>
              )}
              {blog.published_at && (
                <div>
                  <div className="text-green-500/50 mb-1">Published</div>
                  <div className="text-green-400">{formatDate(blog.published_at)}</div>
                </div>
              )}
              {blog.read_time_minutes && (
                <div>
                  <div className="text-green-500/50 mb-1">Read Time</div>
                  <div className="text-green-400">{blog.read_time_minutes} min</div>
                </div>
              )}
              {blog.auto_generated && (
                <div>
                  <div className="text-green-500/50 mb-1">Generation</div>
                  <div className="text-purple-400">AI Generated</div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
