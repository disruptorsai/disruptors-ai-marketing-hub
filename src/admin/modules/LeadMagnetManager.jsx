/**
 * Lead Magnet Manager Module
 * Manages downloadable resources with CRUD operations and analytics
 */

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Eye,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  Calendar,
  Tag,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react'
import * as adminAPI from '@/lib/admin/lead-magnet-api'

export default function LeadMagnetManager() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedResource, setSelectedResource] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats()
    }
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data, error } = await adminAPI.getAllResources()
      if (error) throw error
      setResources(data || [])

      // Extract unique categories and tags
      const uniqueCategories = [...new Set(data?.map(r => r.category).filter(Boolean))]
      const allTags = data?.flatMap(r => r.tags || [])
      const uniqueTags = [...new Set(allTags)].filter(Boolean)

      setCategories(uniqueCategories)
      setTags(uniqueTags)
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      const { data, error } = await adminAPI.getDashboardStats()
      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    }
  }

  const handleCreateNew = () => {
    setSelectedResource({
      slug: '',
      title: '',
      subtitle: '',
      description: '',
      category: 'automation',
      tags: [],
      icon_name: 'FileText',
      icon_color: 'text-blue-500',
      preview_image_url: '',
      file_url: '',
      file_type: 'pdf',
      file_size: '',
      is_featured: false,
      is_active: true,
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
      whats_inside: [],
      related_resources: [],
    })
    setIsEditing(true)
    setActiveTab('edit')
  }

  const handleEdit = (resource) => {
    setSelectedResource(resource)
    setIsEditing(true)
    setActiveTab('edit')
  }

  const handleSave = async () => {
    try {
      if (selectedResource.id) {
        // Update existing
        const { data, error } = await adminAPI.updateResource(
          selectedResource.id,
          selectedResource
        )
        if (error) throw error
      } else {
        // Create new
        const { data, error } = await adminAPI.createResource(selectedResource)
        if (error) throw error
      }

      await loadData()
      setIsEditing(false)
      setSelectedResource(null)
      setActiveTab('all')
    } catch (error) {
      console.error('Failed to save resource:', error)
      alert('Failed to save resource: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const { success, error } = await adminAPI.deleteResource(id)
      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Failed to delete resource:', error)
      alert('Failed to delete resource: ' + error.message)
    }
  }

  const handleToggleFeatured = async (id, currentValue) => {
    try {
      const { data, error } = await adminAPI.updateResource(id, {
        is_featured: !currentValue,
      })
      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Failed to toggle featured:', error)
    }
  }

  const handleToggleActive = async (id, currentValue) => {
    try {
      const { data, error } = await adminAPI.updateResource(id, {
        is_active: !currentValue,
      })
      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Failed to toggle active:', error)
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      !searchQuery ||
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.slug?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      filterCategory === 'all' || resource.category === filterCategory

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && resource.is_active) ||
      (filterStatus === 'inactive' && !resource.is_active) ||
      (filterStatus === 'featured' && resource.is_featured)

    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-green-500 animate-pulse">LOADING_RESOURCES...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-400">LEAD_MAGNET_MANAGER</h1>
          <p className="text-green-500/70 text-sm mt-1">
            Manage downloadable resources and track analytics
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          CREATE_NEW
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-green-500/20">
        {[
          { id: 'dashboard', label: 'DASHBOARD', icon: BarChart3 },
          { id: 'all', label: 'ALL_RESOURCES', icon: FileText },
          { id: 'analytics', label: 'ANALYTICS', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-mono flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-green-500/50 hover:text-green-400'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
        {isEditing && (
          <button
            className="px-4 py-2 font-mono flex items-center gap-2 text-green-400 border-b-2 border-green-400"
          >
            <Edit size={16} />
            {selectedResource?.id ? 'EDIT' : 'CREATE'}
          </button>
        )}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="TOTAL_RESOURCES"
              value={stats.overview.total}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="ACTIVE"
              value={stats.overview.active}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              label="FEATURED"
              value={stats.overview.featured}
              icon={Star}
              color="yellow"
            />
            <StatCard
              label="TOTAL_DOWNLOADS"
              value={stats.overview.totalDownloads}
              icon={Download}
              color="purple"
            />
          </div>

          {/* Top Performers */}
          <div className="bg-black/30 border border-green-500/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              TOP_PERFORMERS
            </h2>
            <div className="space-y-3">
              {stats.topPerformers?.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 bg-black/50 rounded border border-green-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${resource.icon_color}`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-green-400 font-medium">{resource.title}</p>
                      <p className="text-green-500/50 text-sm">{resource.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-green-400 font-mono">
                        {resource.download_count || 0}
                      </p>
                      <p className="text-green-500/50 text-xs">downloads</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-mono">{resource.view_count || 0}</p>
                      <p className="text-green-500/50 text-xs">views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Resources */}
          <div className="bg-black/30 border border-green-500/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              RECENT_RESOURCES
            </h2>
            <div className="space-y-2">
              {stats.recentResources?.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 bg-black/50 rounded border border-green-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${resource.icon_color}`}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-green-400">{resource.title}</p>
                      <p className="text-green-500/50 text-sm">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {resource.is_featured && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded">
                        FEATURED
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        resource.is_active
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {resource.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Resources Tab */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50"
              />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/20 rounded text-green-400 placeholder-green-500/30 focus:border-green-500/50 focus:outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          {/* Resources Table */}
          <div className="bg-black/30 border border-green-500/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-green-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-sm">
                    RESOURCE
                  </th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-sm">
                    CATEGORY
                  </th>
                  <th className="px-4 py-3 text-center text-green-400 font-mono text-sm">
                    DOWNLOADS
                  </th>
                  <th className="px-4 py-3 text-center text-green-400 font-mono text-sm">
                    VIEWS
                  </th>
                  <th className="px-4 py-3 text-center text-green-400 font-mono text-sm">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-right text-green-400 font-mono text-sm">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="border-b border-green-500/10 hover:bg-green-500/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`${resource.icon_color}`}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-green-400 font-medium">{resource.title}</p>
                          <p className="text-green-500/50 text-sm">{resource.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded">
                        {resource.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-green-400 font-mono">
                      {resource.download_count || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-green-400 font-mono">
                      {resource.view_count || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {resource.is_featured && (
                          <Star size={14} className="text-yellow-500" />
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            resource.is_active
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {resource.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleFeatured(resource.id, resource.is_featured)}
                          className="p-1 text-yellow-500 hover:bg-yellow-500/10 rounded"
                          title={resource.is_featured ? 'Unfeature' : 'Feature'}
                        >
                          {resource.is_featured ? <StarOff size={16} /> : <Star size={16} />}
                        </button>
                        <button
                          onClick={() => handleToggleActive(resource.id, resource.is_active)}
                          className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                          title={resource.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {resource.is_active ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(resource)}
                          className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredResources.length === 0 && (
              <div className="p-12 text-center text-green-500/50">No resources found</div>
            )}
          </div>
        </div>
      )}

      {/* Edit/Create Tab */}
      {activeTab === 'edit' && isEditing && selectedResource && (
        <ResourceForm
          resource={selectedResource}
          onChange={setSelectedResource}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false)
            setSelectedResource(null)
            setActiveTab('all')
          }}
          categories={categories}
          tags={tags}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-black/30 border border-green-500/20 rounded-lg p-6">
          <h2 className="text-lg font-bold text-green-400 mb-4">ANALYTICS_COMING_SOON</h2>
          <p className="text-green-500/70">
            Detailed analytics dashboard with charts and conversion tracking.
          </p>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  }

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} />
        <span className="text-2xl font-bold font-mono">{value}</span>
      </div>
      <p className="text-sm font-mono opacity-70">{label}</p>
    </div>
  )
}

// Resource Form Component
function ResourceForm({ resource, onChange, onSave, onCancel, categories, tags }) {
  const updateField = (field, value) => {
    onChange({ ...resource, [field]: value })
  }

  const addWhatsInsideItem = () => {
    const item = prompt('Enter bullet point:')
    if (item) {
      onChange({
        ...resource,
        whats_inside: [...(resource.whats_inside || []), item],
      })
    }
  }

  const removeWhatsInsideItem = (index) => {
    onChange({
      ...resource,
      whats_inside: resource.whats_inside.filter((_, i) => i !== index),
    })
  }

  const addTag = () => {
    const tag = prompt('Enter tag:')
    if (tag && !resource.tags?.includes(tag)) {
      onChange({
        ...resource,
        tags: [...(resource.tags || []), tag],
      })
    }
  }

  const removeTag = (tag) => {
    onChange({
      ...resource,
      tags: resource.tags.filter((t) => t !== tag),
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/30 border border-green-500/20 rounded-lg p-6">
        <h2 className="text-lg font-bold text-green-400 mb-4">
          {resource.id ? 'EDIT_RESOURCE' : 'CREATE_RESOURCE'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Basic Info */}
          <div className="space-y-4 col-span-2">
            <div>
              <label className="block text-green-400 text-sm mb-2">SLUG (URL-friendly)</label>
              <input
                type="text"
                value={resource.slug || ''}
                onChange={(e) => updateField('slug', e.target.value)}
                className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
                placeholder="n8n-workflows"
              />
            </div>

            <div>
              <label className="block text-green-400 text-sm mb-2">TITLE</label>
              <input
                type="text"
                value={resource.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
                placeholder="5 Ready-to-Import n8n Workflows"
              />
            </div>

            <div>
              <label className="block text-green-400 text-sm mb-2">SUBTITLE</label>
              <input
                type="text"
                value={resource.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
                placeholder="One-line description"
              />
            </div>

            <div>
              <label className="block text-green-400 text-sm mb-2">DESCRIPTION</label>
              <textarea
                value={resource.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
                placeholder="Full description (markdown supported)"
              />
            </div>
          </div>

          {/* Categorization */}
          <div>
            <label className="block text-green-400 text-sm mb-2">CATEGORY</label>
            <select
              value={resource.category || ''}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
            >
              <option value="automation">Automation</option>
              <option value="ai">AI</option>
              <option value="content">Content</option>
              <option value="seo">SEO</option>
              <option value="marketing">Marketing</option>
              <option value="tools">Tools</option>
            </select>
          </div>

          <div>
            <label className="block text-green-400 text-sm mb-2">FILE TYPE</label>
            <select
              value={resource.file_type || ''}
              onChange={(e) => updateField('file_type', e.target.value)}
              className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
            >
              <option value="pdf">PDF</option>
              <option value="zip">ZIP</option>
              <option value="notion">Notion</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* File Info */}
          <div>
            <label className="block text-green-400 text-sm mb-2">FILE URL</label>
            <input
              type="text"
              value={resource.file_url || ''}
              onChange={(e) => updateField('file_url', e.target.value)}
              className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div>
            <label className="block text-green-400 text-sm mb-2">FILE SIZE</label>
            <input
              type="text"
              value={resource.file_size || ''}
              onChange={(e) => updateField('file_size', e.target.value)}
              className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
              placeholder="2.5 MB"
            />
          </div>

          {/* Appearance */}
          <div>
            <label className="block text-green-400 text-sm mb-2">ICON NAME (Lucide)</label>
            <input
              type="text"
              value={resource.icon_name || ''}
              onChange={(e) => updateField('icon_name', e.target.value)}
              className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
              placeholder="Workflow"
            />
          </div>

          <div>
            <label className="block text-green-400 text-sm mb-2">ICON COLOR (Tailwind)</label>
            <input
              type="text"
              value={resource.icon_color || ''}
              onChange={(e) => updateField('icon_color', e.target.value)}
              className="w-full px-4 py-2 bg-black border border-green-500/20 rounded text-green-400 focus:border-green-500/50 focus:outline-none"
              placeholder="text-purple-500"
            />
          </div>

          {/* Tags */}
          <div className="col-span-2">
            <label className="block text-green-400 text-sm mb-2">TAGS</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {resource.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-red-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={addTag}
                className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded hover:bg-green-500/20"
              >
                + ADD TAG
              </button>
            </div>
          </div>

          {/* What's Inside */}
          <div className="col-span-2">
            <label className="block text-green-400 text-sm mb-2">WHAT'S INSIDE</label>
            <div className="space-y-2 mb-2">
              {resource.whats_inside?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-black/50 rounded border border-green-500/10"
                >
                  <span className="flex-1 text-green-400">{item}</span>
                  <button
                    onClick={() => removeWhatsInsideItem(index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addWhatsInsideItem}
                className="w-full px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded hover:bg-green-500/20"
              >
                + ADD BULLET POINT
              </button>
            </div>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-green-400">
              <input
                type="checkbox"
                checked={resource.is_featured || false}
                onChange={(e) => updateField('is_featured', e.target.checked)}
                className="rounded"
              />
              FEATURED
            </label>
            <label className="flex items-center gap-2 text-green-400">
              <input
                type="checkbox"
                checked={resource.is_active || false}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="rounded"
              />
              ACTIVE
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-green-500/20">
          <button
            onClick={onSave}
            className="px-6 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition-colors"
          >
            SAVE
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
