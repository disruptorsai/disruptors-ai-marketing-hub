/**
 * Image Selector Modal
 * Select featured image from 3 AI-generated options
 */

import React, { useState } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { supabaseAdmin } from '../../../lib/supabase-client'
import { toast } from 'sonner'

export default function ImageSelectorModal({ blog, onClose, onSelect }) {
  const [selectedImage, setSelectedImage] = useState(blog?.featured_image || null)
  const [saving, setSaving] = useState(false)

  if (!blog) return null

  const images = blog.image_options || []

  const handleSelectImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabaseAdmin
        .from('posts')
        .update({ featured_image: selectedImage })
        .eq('id', blog.id)

      if (error) throw error

      toast.success('Featured image updated!')
      onSelect && await onSelect()
      onClose()

    } catch (error) {
      console.error('Failed to update image:', error)
      toast.error('Failed to update image')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-green-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-green-400">SELECT_FEATURED_IMAGE</h2>
            <p className="text-green-500/50 text-sm mt-1">{blog.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-green-500/50 mb-4">No images generated yet</div>
              <div className="text-green-500/30 text-sm">
                Click "Generate Images" to create 3 AI-generated options
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image.url || image)}
                  className={`relative group border-2 transition-all ${
                    (selectedImage === (image.url || image))
                      ? 'border-green-500 shadow-lg shadow-green-500/50'
                      : 'border-green-500/30 hover:border-green-500/60'
                  }`}
                >
                  <img
                    src={image.url || image}
                    alt={`Option ${index + 1}`}
                    className="w-full aspect-video object-cover"
                  />

                  {/* Selection Overlay */}
                  {selectedImage === (image.url || image) && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="bg-green-500 text-black rounded-full p-2">
                        <Check size={24} />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-green-400 text-sm font-mono">
                      OPTION_{index + 1}
                    </div>
                  </div>

                  {/* Option Number Badge */}
                  <div className="absolute top-2 left-2 bg-black/80 text-green-400 px-2 py-1 text-xs font-mono border border-green-500/30">
                    {index + 1}/3
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Current Featured Image */}
          {blog.featured_image && (
            <div className="mt-6 pt-6 border-t border-green-500/30">
              <div className="text-green-500/50 text-xs mb-2 uppercase">Current Featured Image</div>
              <img
                src={blog.featured_image}
                alt="Current featured"
                className="w-full max-h-48 object-cover border border-green-500/30"
              />
            </div>
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
            onClick={handleSelectImage}
            disabled={saving || !selectedImage || images.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                SAVING...
              </>
            ) : (
              <>
                <Check size={16} />
                SET_AS_FEATURED
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
