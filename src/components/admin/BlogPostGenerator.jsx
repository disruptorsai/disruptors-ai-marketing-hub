import { useState } from 'react';
import { Wand2, Save, Loader2, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateBlogArticle } from '@/lib/anthropic-blog-writer';
import { customSDK } from '@/lib/custom-sdk';

/**
 * BlogPostGenerator Component
 *
 * Generate individual blog posts with Claude using keyword research data
 * Features:
 * - Pre-filled keywords from research
 * - Custom title and meta description
 * - Real-time generation with streaming
 * - Preview generated content
 * - Save to database
 * - Regenerate with different prompts
 */
export default function BlogPostGenerator({ initialKeywords = null, postId = null, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaDescription: '',
    primaryKeyword: initialKeywords?.primary || '',
    secondaryKeywords: initialKeywords?.secondary?.join(', ') || '',
    additionalInstructions: ''
  });

  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
   * Update form field
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  /**
   * Generate blog article with Claude
   */
  const handleGenerate = async () => {
    if (!formData.title || !formData.primaryKeyword) {
      setError('Title and primary keyword are required');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse secondary keywords
      const secondaryKeywords = formData.secondaryKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      // Generate article
      const result = await generateBlogArticle(
        formData.title,
        formData.primaryKeyword,
        secondaryKeywords,
        formData.additionalInstructions
      );

      setGeneratedContent(result.content);
      setShowPreview(true);
    } catch (err) {
      setError(err.message || 'Failed to generate article');
      console.error('Generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Save blog post to database
   */
  const handleSave = async () => {
    if (!generatedContent) {
      setError('Please generate content first');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse secondary keywords
      const secondaryKeywords = formData.secondaryKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: generatedContent,
        excerpt: formData.metaDescription || generatedContent.substring(0, 160),
        meta_description: formData.metaDescription,
        primary_keyword: formData.primaryKeyword,
        secondary_keywords: secondaryKeywords,
        status: 'draft',
        published_at: null,
        author_id: 'claude-ai', // Or get from auth context
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (postId) {
        // Update existing post
        await customSDK.update('posts', postId, postData);
      } else {
        // Create new post
        await customSDK.create('posts', postData);
      }

      setSuccess(true);

      if (onSaved) {
        onSaved(postData);
      }
    } catch (err) {
      setError(err.message || 'Failed to save post');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generate Blog Post
          </CardTitle>
          <CardDescription>
            Create SEO-optimized blog content with Claude AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Article Title *
            </label>
            <Input
              placeholder="e.g., The Ultimate Guide to HVAC Marketing in 2025"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL Slug
            </label>
            <Input
              placeholder="auto-generated-from-title"
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
            />
          </div>

          {/* Primary Keyword */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Primary Keyword *
            </label>
            <Input
              placeholder="e.g., hvac marketing"
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
              placeholder="e.g., hvac advertising, hvac lead generation, hvac seo"
              value={formData.secondaryKeywords}
              onChange={(e) => updateField('secondaryKeywords', e.target.value)}
              rows={3}
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Meta Description
            </label>
            <Textarea
              placeholder="Brief description for search results (optional)"
              value={formData.metaDescription}
              onChange={(e) => updateField('metaDescription', e.target.value)}
              rows={2}
            />
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Instructions (optional)
            </label>
            <Textarea
              placeholder="Any specific requirements, tone, or focus areas..."
              value={formData.additionalInstructions}
              onChange={(e) => updateField('additionalInstructions', e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={generating || !formData.title || !formData.primaryKeyword}
              className="flex-1"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Article
                </>
              )}
            </Button>

            {generatedContent && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </>
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
              ✓ Blog post saved successfully!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {generatedContent && showPreview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Content</CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {generatedContent.split(' ').length} words
                </Badge>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: generatedContent.replace(/\n/g, '<br/>') }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords Display */}
      {initialKeywords && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">Primary</Badge>
                <span className="font-medium">{initialKeywords.primary}</span>
              </div>
              {initialKeywords.secondary && initialKeywords.secondary.length > 0 && (
                <div>
                  <Badge variant="secondary" className="mb-2">Secondary</Badge>
                  <div className="flex flex-wrap gap-2">
                    {initialKeywords.secondary.map((keyword, index) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
