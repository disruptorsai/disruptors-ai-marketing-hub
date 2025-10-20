/**
 * Blog Editor Modal
 * ReactQuill WYSIWYG editor for blog content modification
 */

import React, { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { supabaseAdmin } from '../../../lib/supabase-client'
import { toast } from 'sonner'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function BlogEditorModal({ blog, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    seo_title: '',
    seo_description: '',
    category: '',
    tags: [],
    slug: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        seo_title: blog.seo_title || blog.title || '',
        seo_description: blog.seo_description || blog.excerpt || '',
        category: blog.category || '',
        tags: Array.isArray(blog.tags) ? blog.tags : (blog.tags ? blog.tags.split(',').map(t => t.trim()) : []),
        slug: blog.slug || ''
      })
    }
  }, [blog])

  const handleSave = async () => {
    try {
      setSaving(true)

      // Auto-generate slug if empty
      let slug = formData.slug
      if (!slug && formData.title) {
        slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      }

      // Calculate read time
      const wordCount = formData.content.split(/\s+/).length
      const readTime = Math.ceil(wordCount / 200)

      const updateData = {
        ...formData,
        slug,
        read_time_minutes: readTime,
        approval_status: 'needs_revision', // Mark as needs revision after edit
        updated_at: new Date().toISOString()
      }

      const { error } = await supabaseAdmin
        .from('posts')
        .update(updateData)
        .eq('id', blog.id)

      if (error) throw error

      toast.success('Blog updated successfully!')
      onSave && await onSave()
      onClose()

    } catch (error) {
      console.error('Failed to save blog:', error)
      toast.error('Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ]
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-green-500/30 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="p-6 border-b border-green-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-green-400">BLOG_EDITOR</h2>
            <p className="text-green-500/50 text-sm mt-1">Edit content and metadata</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="text-green-400 text-sm mb-2 block">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-800 border border-green-500/30 text-green-400 px-4 py-2 outline-none focus:border-green-500"
              placeholder="Enter blog title..."
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-green-400 text-sm mb-2 block">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 border border-green-500/30 text-green-400 px-4 py-2 outline-none focus:border-green-500 resize-none"
              placeholder="Brief summary..."
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="text-green-400 text-sm mb-2 block">Content</label>
            <div className="bg-white border border-green-500/30">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                modules={quillModules}
                className="h-96"
              />
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-gray-800 border border-green-500/20 p-4 space-y-4">
            <div className="text-green-400 text-sm font-bold mb-4">SEO METADATA</div>

            <div>
              <label className="text-green-500/70 text-xs mb-1 block">SEO Title</label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                className="w-full bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="SEO optimized title..."
                maxLength={60}
              />
              <div className="text-green-500/50 text-xs mt-1">
                {formData.seo_title.length}/60 characters
              </div>
            </div>

            <div>
              <label className="text-green-500/70 text-xs mb-1 block">Meta Description</label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                rows={3}
                className="w-full bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm outline-none focus:border-green-500 resize-none"
                placeholder="SEO meta description..."
                maxLength={160}
              />
              <div className="text-green-500/50 text-xs mt-1">
                {formData.seo_description.length}/160 characters
              </div>
            </div>

            <div>
              <label className="text-green-500/70 text-xs mb-1 block">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-gray-900 border border-green-500/30 text-green-400 px-3 py-2 text-sm outline-none focus:border-green-500 font-mono"
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-green-400 text-sm mb-2 block">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-800 border border-green-500/30 text-green-400 px-4 py-2 outline-none focus:border-green-500"
                placeholder="e.g., SEO, AI Marketing"
              />
            </div>

            <div>
              <label className="text-green-400 text-sm mb-2 block">Tags (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
                className="w-full bg-gray-800 border border-green-500/30 text-green-400 px-4 py-2 outline-none focus:border-green-500"
                placeholder="SEO, marketing, AI"
              />
            </div>
          </div>
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
            onClick={handleSave}
            disabled={saving || !formData.title}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                SAVING...
              </>
            ) : (
              <>
                <Save size={16} />
                SAVE_CHANGES
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
