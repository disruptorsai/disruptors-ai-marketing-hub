import { useState, useEffect } from 'react';
import { Save, Loader2, Eye, RefreshCw, Wand2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateBlogArticle } from '@/lib/anthropic-blog-writer';
import { customSDK } from '@/lib/custom-sdk';

/**
 * BlogPostEditor Component
 *
 * Edit existing blog posts with AI regeneration capabilities
 * Features:
 * - Load existing post data
 * - Edit all fields
 * - Regenerate content with Claude
 * - Preview changes
 * - Save or discard
 * - Delete post
 */
export default function BlogPostEditor({ postId, onSaved, onDeleted, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [originalPost, setOriginalPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaDescription: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    status: 'draft',
    featuredImage: ''
  });

  /**
   * Load post data
   */
  useEffect(() => {
    const loadPost = async () => {
      try {
        const post = await customSDK.read('posts', postId);

        setOriginalPost(post);
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          metaDescription: post.meta_description || '',
          primaryKeyword: post.primary_keyword || '',
          secondaryKeywords: Array.isArray(post.secondary_keywords)
            ? post.secondary_keywords.join(', ')
            : post.secondary_keywords || '',
          status: post.status || 'draft',
          featuredImage: post.featured_image || ''
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to load post: ' + err.message);
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);

  /**
   * Update form field
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSuccess(false);
  };

  /**
   * Generate slug from title
   */
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  /**
   * Regenerate content with Claude
   */
  const handleRegenerate = async () => {
    if (!formData.title || !formData.primaryKeyword) {
      setError('Title and primary keyword are required');
      return;
    }

    setRegenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const secondaryKeywords = formData.secondaryKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const result = await generateBlogArticle(
        formData.title,
        formData.primaryKeyword,
        secondaryKeywords,
        'Regenerate this article with fresh content while maintaining SEO optimization'
      );

      updateField('content', result.content);
      setShowPreview(true);
    } catch (err) {
      setError(err.message || 'Failed to regenerate content');
      console.error('Regeneration error:', err);
    } finally {
      setRegenerating(false);
    }
  };

  /**
   * Save changes
   */
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const secondaryKeywords = formData.secondaryKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        meta_description: formData.metaDescription,
        primary_keyword: formData.primaryKeyword,
        secondary_keywords: secondaryKeywords,
        status: formData.status,
        featured_image: formData.featuredImage,
        updated_at: new Date().toISOString()
      };

      await customSDK.update('posts', postId, postData);

      setSuccess(true);

      if (onSaved) {
        onSaved(postData);
      }
    } catch (err) {
      setError(err.message || 'Failed to save changes');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete post
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await customSDK.delete('posts', postId);

      if (onDeleted) {
        onDeleted(postId);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      console.error('Delete error:', err);
      setDeleting(false);
    }
  };

  /**
   * Check if form has changes
   */
  const hasChanges = () => {
    if (!originalPost) return false;

    return (
      formData.title !== originalPost.title ||
      formData.slug !== originalPost.slug ||
      formData.content !== originalPost.content ||
      formData.excerpt !== originalPost.excerpt ||
      formData.metaDescription !== originalPost.meta_description ||
      formData.primaryKeyword !== originalPost.primary_keyword ||
      formData.status !== originalPost.status
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Blog Post</CardTitle>
              <CardDescription>
                Make changes or regenerate content with AI
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                {formData.status}
              </Badge>
              {hasChanges() && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => {
                updateField('title', e.target.value);
                updateField('slug', generateSlug(e.target.value));
              }}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">URL Slug</label>
            <Input
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Primary Keyword */}
          <div>
            <label className="block text-sm font-medium mb-2">Primary Keyword</label>
            <Input
              value={formData.primaryKeyword}
              onChange={(e) => updateField('primaryKeyword', e.target.value)}
            />
          </div>

          {/* Secondary Keywords */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Secondary Keywords (comma-separated)
            </label>
            <Textarea
              value={formData.secondaryKeywords}
              onChange={(e) => updateField('secondaryKeywords', e.target.value)}
              rows={2}
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              rows={3}
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Meta Description</label>
            <Textarea
              value={formData.metaDescription}
              onChange={(e) => updateField('metaDescription', e.target.value)}
              rows={2}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Content</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                >
                  {regenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showPreview ? (
              <div className="p-4 border rounded-md prose max-w-none">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: formData.content.replace(/\n/g, '<br/>')
                  }}
                />
              </div>
            ) : (
              <Textarea
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm">
              ✓ Changes saved successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </>
              )}
            </Button>

            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges()}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Count */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Word Count: {formData.content.split(/\s+/).filter(w => w.length > 0).length}</span>
            <span>Character Count: {formData.content.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
