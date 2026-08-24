import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Plus, Trash2, Edit2, Check, X, AlertCircle, TestTube, Settings, Wrench, Send, RefreshCw, Image, Sparkles, Eye, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pullBlogDataFromSheets, pushBlogDataToSheets, initializeGoogleSheetsIntegration, getCurrentColumnMapping } from '@/lib/google-sheets-service';
import { testGoogleSheetsConnection } from '@/utils/test-google-sheets';
import { runFullDiagnostics } from '@/utils/google-sheets-diagnostics';
import ColumnMappingConfig from '@/components/shared/ColumnMappingConfig';
import { customClient } from '@/lib/custom-sdk';
import { batchGenerateArticles } from '@/lib/anthropic-blog-writer';
import GenerationQueue from '@/components/admin/GenerationQueue';

const initialBlogData = [
  {
    id: 1,
    title: "The Ultimate Guide to AI-Powered SEO in 2025",
    excerpt: "Discover how generative engines are changing search and what you need to do to stay ahead of the curve. This is the new SEO.",
    author: "Tyler Gordon",
    date: "2024-10-15",
    image: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop",
    category: "SEO & GEO",
    slug: "ai-powered-seo-2025",
    is_published: true,
    content: "Full article content here...",
    tags: "AI, SEO, 2025, generative engines",
    metaDescription: "Learn how AI is transforming SEO and what strategies you need to implement in 2025.",
    publishDate: "2024-10-15",
    articleLink: ""
  },
  {
    id: 2,
    title: "5 Cold Email Templates That Actually Get Replies",
    excerpt: "We send millions of cold emails. Steal our top-performing templates and start filling your pipeline with qualified leads today.",
    author: "Kyle Painter",
    date: "2024-10-10",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2070&auto=format&fit=crop",
    category: "Lead Generation",
    slug: "cold-email-templates",
    is_published: true,
    content: "Cold email templates content...",
    tags: "cold email, templates, lead generation",
    metaDescription: "Proven cold email templates that get replies and fill your sales pipeline.",
    publishDate: "2024-10-10",
    articleLink: ""
  },
  {
    id: 3,
    title: "How We Built a Custom AI App in 48 Hours",
    excerpt: "A behind-the-scenes look at our rapid development process and how you can turn ideas into functional tools faster than ever.",
    author: "Will Welsh",
    date: "2024-10-05",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop",
    category: "Custom Apps",
    slug: "building-ai-app",
    is_published: false,
    content: "Custom AI app development content...",
    tags: "AI, custom apps, development, rapid prototyping",
    metaDescription: "Behind-the-scenes look at building a custom AI application in just 48 hours.",
    publishDate: "2024-10-05",
    articleLink: ""
  }
];

const DEFAULT_COLUMNS = [
  { key: 'title', label: 'Title', width: 200, minWidth: 100, type: 'text' },
  { key: 'author', label: 'Author', width: 120, minWidth: 80, type: 'text' },
  { key: 'category', label: 'Category', width: 120, minWidth: 80, type: 'text' },
  { key: 'is_published', label: 'Published', width: 100, minWidth: 80, type: 'select', options: ['true', 'false'] },
  { key: 'publishDate', label: 'Publish Date', width: 120, minWidth: 100, type: 'date' },
  { key: 'excerpt', label: 'Excerpt', width: 250, minWidth: 150, type: 'textarea' },
  { key: 'tags', label: 'Tags', width: 150, minWidth: 100, type: 'text' },
  { key: 'slug', label: 'Slug', width: 150, minWidth: 100, type: 'text' },
  { key: 'image', label: 'Image URL', width: 200, minWidth: 150, type: 'text' },
  { key: 'metaDescription', label: 'Meta Description', width: 200, minWidth: 150, type: 'textarea' },
  { key: 'content', label: 'Content', width: 300, minWidth: 200, type: 'textarea' },
  { key: 'articleLink', label: 'Article Link', width: 200, minWidth: 150, type: 'text' }
];

const EditableCell = ({ value, onChange, type, options, isEditing, onStartEdit, onFinishEdit, onCancelEdit }) => {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(editValue);
    onFinishEdit();
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancelEdit();
  };

  if (!isEditing) {
    return (
      <div
        className="p-2 min-h-[40px] cursor-pointer hover:bg-gray-50 rounded flex items-center justify-between group"
        onClick={onStartEdit}
      >
        <span className="truncate flex-grow">
          {type === 'textarea' ? (value?.length > 50 ? `${value?.substring(0, 50)}...` : value) : value}
        </span>
        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50 ml-2 flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="p-1 flex items-center gap-1">
      {type === 'select' ? (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-grow text-sm border rounded px-2 py-1"
          autoFocus
        >
          {options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-grow text-sm min-h-[80px] resize-none"
          autoFocus
        />
      ) : (
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-grow text-sm"
          autoFocus
        />
      )}
      <Button size="sm" variant="ghost" onClick={handleSave} className="p-1 h-6 w-6">
        <Check className="w-3 h-3" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel} className="p-1 h-6 w-6">
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default function BlogManagement() {
  const [blogData, setBlogData] = useState(initialBlogData);
  const [editingCell, setEditingCell] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetsIntegrationReady, setSheetsIntegrationReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [, setCurrentMapping] = useState({});
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeData, setResizeData] = useState({ columnKey: null, startX: 0, startWidth: 0 });
  const [isGeneratingArticles, setIsGeneratingArticles] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [queueItems, setQueueItems] = useState([]);
  const [showQueue, setShowQueue] = useState(false);

  const handleCellChange = (rowId, columnKey, newValue) => {
    setBlogData(prev => prev.map(row =>
      row.id === rowId ? { ...row, [columnKey]: newValue } : row
    ));
  };

  const handleStartEdit = (rowId, columnKey) => {
    setEditingCell({ rowId, columnKey });
  };

  const handleFinishEdit = () => {
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleAddRow = () => {
    const newId = Math.max(...blogData.map(row => row.id), 0) + 1;
    const newRow = {
      id: newId,
      title: "New Blog Post",
      author: "",
      category: "",
      is_published: false,
      publishDate: new Date().toISOString().split('T')[0],
      excerpt: "",
      tags: "",
      slug: "",
      image: "",
      metaDescription: "",
      content: "",
      articleLink: ""
    };
    setBlogData(prev => [...prev, newRow]);
  };

  const handleDeleteRow = (rowId) => {
    setBlogData(prev => prev.filter(row => row.id !== rowId));
  };

  // Initialize Google Sheets integration on component mount
  useEffect(() => {
    initializeGoogleSheetsIntegration().then(setSheetsIntegrationReady);
    setCurrentMapping(getCurrentColumnMapping());
  }, []);

  const handlePullFromGoogleSheets = async () => {
    if (!sheetsIntegrationReady) {
      setStatusMessage('Google Sheets integration not configured. Please set VITE_GOOGLE_SHEETS_API_KEY.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Pulling data from Google Sheets...');

    try {
      const sheetsData = await pullBlogDataFromSheets();
      if (sheetsData.length > 0) {
        setBlogData(sheetsData);
        setStatusMessage(`Successfully pulled ${sheetsData.length} blog posts from Google Sheets!`);
      } else {
        setStatusMessage('No data found in Google Sheets or sheet is empty.');
      }
    } catch (error) {
      console.error('Error pulling from Google Sheets:', error);
      setStatusMessage(`Error pulling data: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handlePushToGoogleSheets = async () => {
    if (!sheetsIntegrationReady) {
      setStatusMessage('Google Sheets integration not configured. Please set VITE_GOOGLE_SHEETS_API_KEY.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Pushing data to Google Sheets...');

    try {
      await pushBlogDataToSheets(blogData);
      setStatusMessage(`Successfully prepared ${blogData.length} blog posts for Google Sheets. Check console for CSV data to copy manually.`);
    } catch (error) {
      console.error('Error pushing to Google Sheets:', error);
      setStatusMessage(`Error pushing data: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 10000);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setStatusMessage('Testing Google Sheets connection...');

    try {
      const success = await testGoogleSheetsConnection();
      if (success) {
        setStatusMessage('Google Sheets connection test passed! Check console for detailed results.');
        setSheetsIntegrationReady(true);
        setCurrentMapping(getCurrentColumnMapping()); // Update mapping after test
      } else {
        setStatusMessage('Google Sheets connection test failed. Check console for details.');
        setSheetsIntegrationReady(false);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setStatusMessage(`Connection test failed: ${error.message}`);
      setSheetsIntegrationReady(false);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  const handleMappingUpdate = (newMapping) => {
    setCurrentMapping(newMapping);
    setStatusMessage('Column mapping updated successfully! Try pulling data again.');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleRunDiagnostics = async () => {
    setIsLoading(true);
    setStatusMessage('Running comprehensive diagnostics... Check console for detailed results.');

    try {
      await runFullDiagnostics();
      setStatusMessage('Diagnostics complete! Check the browser console (F12) for detailed analysis and troubleshooting steps.');
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setStatusMessage(`Diagnostics failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 10000);
    }
  };

  // Column resizing functionality
  const handleColumnDoubleClick = (columnKey) => {
    // Auto-expand column based on content
    const maxContentLength = Math.max(
      ...blogData.map(row => (row[columnKey] || '').toString().length),
      columns.find(col => col.key === columnKey)?.label?.length || 0
    );

    const newWidth = Math.min(Math.max(maxContentLength * 8 + 40, 100), 500); // min 100px, max 500px

    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, width: newWidth } : col
    ));
  };

  const handleResizeStart = (e, columnKey) => {
    e.preventDefault();
    const column = columns.find(col => col.key === columnKey);
    if (!column) return;

    setIsResizing(true);
    setResizeData({
      columnKey,
      startX: e.clientX,
      startWidth: column.width
    });

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !resizeData.columnKey) return;

    const deltaX = e.clientX - resizeData.startX;
    const newWidth = Math.max(
      resizeData.startWidth + deltaX,
      columns.find(col => col.key === resizeData.columnKey)?.minWidth || 80
    );

    setColumns(prev => prev.map(col =>
      col.key === resizeData.columnKey ? { ...col, width: newWidth } : col
    ));
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeData({ columnKey: null, startX: 0, startWidth: 0 });

    // Remove global mouse event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Blog Post Workflow Actions
  const handleApprovePost = async (postId) => {
    try {
      const post = blogData.find(p => p.id === postId);
      if (post) {
        // Update status to Published
        handleCellChange(postId, 'is_published', true);

        // Set publish date to today if not already set
        if (!post.publishDate) {
          const today = new Date().toISOString().split('T')[0];
          handleCellChange(postId, 'publishDate', today);
        }

        console.log(`Post "${post.title}" has been approved and published!`);
        // TODO: Implement actual publishing to live site
      }
    } catch (error) {
      console.error('Error approving post:', error);
    }
  };

  const handleRequestRewrite = async (postId) => {
    try {
      const post = blogData.find(p => p.id === postId);
      if (post) {
        // Update status to needs revision
        handleCellChange(postId, 'is_published', false);

        console.log(`Rewrite requested for post "${post.title}"`);
        // TODO: Implement actual rewrite request workflow (notifications, comments, etc.)
      }
    } catch (error) {
      console.error('Error requesting rewrite:', error);
    }
  };

  const handleGenerateImage = async (postId) => {
    try {
      const post = blogData.find(p => p.id === postId);
      if (post) {
        console.log(`Generating image for post "${post.title}"`);
        // TODO: Implement AI image generation based on title and content
        // For now, we'll set a placeholder
        const placeholderImageUrl = `https://via.placeholder.com/800x400/6366f1/ffffff?text=${encodeURIComponent(post.title || 'Blog Post')}`;
        handleCellChange(postId, 'imageUrl', placeholderImageUrl);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const handleEnrichFields = async (postId) => {
    try {
      const post = blogData.find(p => p.id === postId);
      if (post) {
        console.log(`Enriching fields for post "${post.title}"`);

        // Auto-generate slug if missing
        if (!post.slug && post.title) {
          const slug = post.title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          handleCellChange(postId, 'slug', slug);
        }

        // Auto-generate meta description if missing
        if (!post.metaDescription && post.excerpt) {
          const metaDesc = post.excerpt.length > 160
            ? post.excerpt.substring(0, 157) + '...'
            : post.excerpt;
          handleCellChange(postId, 'metaDescription', metaDesc);
        }

        // Auto-generate tags if missing and content exists
        if (!post.tags && post.content) {
          // Simple keyword extraction (in real implementation, use AI)
          const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
          const words = post.content.toLowerCase().split(/\W+/)
            .filter(word => word.length > 3 && !commonWords.includes(word))
            .slice(0, 5);
          handleCellChange(postId, 'tags', words.join(', '));
        }

        console.log(`Fields enriched for post "${post.title}"`);
      }
    } catch (error) {
      console.error('Error enriching fields:', error);
    }
  };

  const handlePreviewPost = (postId) => {
    const post = blogData.find(p => p.id === postId);
    if (post) {
      console.log(`Opening preview for post "${post.title}"`);
      // TODO: Implement preview functionality
      window.open(`/blog/${post.slug || post.id}`, '_blank');
    }
  };

  // Send to Supabase with intelligent field mapping
  const handleSendToSupabase = async () => {
    setIsLoading(true);
    setStatusMessage('Sending blog posts to Supabase...');

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const post of blogData) {
        try {
          // Map blog management fields to Supabase posts table schema
          const supabasePost = {
            // Required fields
            title: post.title || 'Untitled Post',
            slug: post.slug || post.title?.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim() || `post-${Date.now()}`,

            // Content fields
            excerpt: post.excerpt || '',
            content: post.content || '',
            content_type: 'blog', // Default to blog type

            // Media fields
            featured_image: post.image || post.imageUrl || null,
            gallery_images: post.gallery_images
              ? (typeof post.gallery_images === 'string' ? post.gallery_images.split(',').map(t => t.trim()) : Array.isArray(post.gallery_images) ? post.gallery_images : [post.gallery_images])
              : [],

            // Author (will need to link to actual user ID in production)
            author_id: null, // TODO: Map author name to user ID

            // Categorization
            category: post.category || null,
            tags: post.tags
              ? (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : Array.isArray(post.tags) ? post.tags : [post.tags])
              : [],

            // Publishing - FIXED: Use is_published directly as boolean
            is_published: post.is_published === true || post.is_published === 'true',
            is_featured: false, // Can be enhanced later
            published_at: post.publishDate && (post.is_published === true || post.is_published === 'true')
              ? new Date(post.publishDate).toISOString()
              : null,

            // SEO fields (auto-generate if missing)
            seo_title: post.seo_title || post.title || null,
            seo_description: post.metaDescription || post.excerpt?.substring(0, 160) || null,
            seo_keywords: post.seo_keywords
              ? (typeof post.seo_keywords === 'string' ? post.seo_keywords.split(',').map(t => t.trim()) : Array.isArray(post.seo_keywords) ? post.seo_keywords : [post.seo_keywords])
              : (post.tags ? (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : Array.isArray(post.tags) ? post.tags : [post.tags]) : []),

            // Metadata
            read_time_minutes: post.read_time_minutes || (post.content ? Math.ceil(post.content.split(/\s+/).length / 200) : null)
          };

          // Check if post with this slug already exists
          const existingPosts = await customClient.entities.Post.filter({ slug: supabasePost.slug });

          if (existingPosts && existingPosts.length > 0) {
            // Update existing post
            await customClient.entities.Post.update(existingPosts[0].id, supabasePost);
            console.log(`✅ Updated post: "${supabasePost.title}"`);
          } else {
            // Create new post
            await customClient.entities.Post.create(supabasePost);
            console.log(`✅ Created post: "${supabasePost.title}"`);
          }

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({ post: post.title, error: error.message });
          console.error(`❌ Error saving post "${post.title}":`, error);
        }
      }

      if (errorCount === 0) {
        setStatusMessage(`✅ Successfully sent ${successCount} blog posts to Supabase!`);
      } else {
        setStatusMessage(`⚠️ Sent ${successCount} posts successfully, ${errorCount} failed. Check console for details.`);
        console.error('Failed posts:', errors);
      }
    } catch (error) {
      console.error('Error sending to Supabase:', error);
      setStatusMessage(`❌ Error sending to Supabase: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  // Pull from Supabase
  const handlePullFromSupabase = async () => {
    setIsLoading(true);
    setStatusMessage('Pulling blog posts from Supabase...');

    try {
      // Fetch all posts from Supabase
      const supabasePosts = await customClient.entities.Post.list('-created_at');

      if (supabasePosts && supabasePosts.length > 0) {
        // Map Supabase posts back to blog management format
        const mappedPosts = supabasePosts.map((post, index) => ({
          id: index + 1, // Local ID for management
          supabaseId: post.id, // Store Supabase ID for updates
          title: post.title,
          excerpt: post.excerpt,
          author: post.author_id ? 'User ' + post.author_id.substring(0, 8) : '', // Placeholder
          date: post.created_at ? new Date(post.created_at).toISOString().split('T')[0] : '',
          image: post.featured_image || '',
          imageUrl: post.featured_image || '',
          category: post.category || '',
          slug: post.slug,
          is_published: post.is_published || false,
          content: post.content || '',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
          metaDescription: post.seo_description || '',
          publishDate: post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : '',
          seo_title: post.seo_title || '',
          seo_keywords: Array.isArray(post.seo_keywords) ? post.seo_keywords.join(', ') : post.seo_keywords || '',
          read_time_minutes: post.read_time_minutes || null
        }));

        setBlogData(mappedPosts);
        setStatusMessage(`✅ Successfully pulled ${mappedPosts.length} blog posts from Supabase!`);
      } else {
        setStatusMessage('ℹ️ No blog posts found in Supabase.');
      }
    } catch (error) {
      console.error('Error pulling from Supabase:', error);
      setStatusMessage(`❌ Error pulling from Supabase: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  // Write Articles using Anthropic API with detailed queue tracking
  const handleWriteArticles = async () => {
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setStatusMessage('❌ VITE_ANTHROPIC_API_KEY not configured. Please add it to your .env file.');
      return;
    }

    const postsToGenerate = blogData.filter(post => {
      // Only generate for posts that have minimal content or no content
      const hasContent = post.content && post.content.length > 200;
      return !hasContent;
    });

    if (postsToGenerate.length === 0) {
      setStatusMessage('ℹ️ All posts already have content. Clear content to regenerate articles.');
      setTimeout(() => setStatusMessage(''), 5000);
      return;
    }

    const confirmGenerate = window.confirm(
      `Generate ${postsToGenerate.length} article(s) using AI?\n\n` +
      `This will use the Anthropic API and may take several minutes.\n\n` +
      `Posts with existing content will be skipped.\n\n` +
      `Continue?`
    );

    if (!confirmGenerate) return;

    // Initialize queue
    const initialQueue = postsToGenerate.map(post => ({
      post,
      status: 'pending',
      message: 'Waiting to start...'
    }));

    setQueueItems(initialQueue);
    setShowQueue(true);
    setIsGeneratingArticles(true);
    setIsLoading(true);
    setGenerationProgress({ current: 0, total: postsToGenerate.length });
    setStatusMessage(`🤖 Starting article generation for ${postsToGenerate.length} posts...`);

    try {
      const results = await batchGenerateArticles(
        postsToGenerate,
        // Progress callback
        (current, total, result) => {
          setGenerationProgress({ current, total });
          setStatusMessage(`🤖 Generating articles: ${current}/${total} - ${result.title}`);
        },
        // Status update callback
        (postId, status, message) => {
          setQueueItems(prev => prev.map(item =>
            item.post.id === postId
              ? { ...item, status, message }
              : item
          ));
        }
      );

      // Update blog data with generated content
      const updatedBlogData = blogData.map(post => {
        const result = results.find(r => r.postId === post.id);
        if (result && result.success) {
          return {
            ...post,
            content: result.content,
            // Update read time based on new content
            read_time_minutes: Math.ceil(result.content.split(/\s+/).length / 200)
          };
        }
        return post;
      });

      setBlogData(updatedBlogData);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        setStatusMessage(`✅ Successfully generated ${successCount} articles! Review and send to Supabase when ready.`);
      } else {
        setStatusMessage(`⚠️ Generated ${successCount} articles, ${failCount} failed. Check console for details.`);
        console.error('Failed articles:', results.filter(r => !r.success));
      }
    } catch (error) {
      console.error('Error generating articles:', error);
      setStatusMessage(`❌ Error generating articles: ${error.message}`);
    } finally {
      setIsGeneratingArticles(false);
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 10000);
      // Keep queue visible for review
    }
  };

  // Auto-fill all blog posts with intelligent defaults and staggered publish dates
  const handleAutoFillPosts = async () => {
    setIsLoading(true);
    setStatusMessage('Auto-filling blog posts with intelligent defaults...');

    try {
      const today = new Date();

      const updatedPosts = await Promise.all(blogData.map(async (post, index) => {
        // Calculate publish date: today + (index * 3 days) - skipping 2 days each time
        const publishDate = new Date(today);
        publishDate.setDate(today.getDate() + (index * 3));
        const formattedPublishDate = publishDate.toISOString().split('T')[0];

        // Generate slug if missing
        const slug = post.slug || post.title?.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim() || `post-${index + 1}`;

        // Generate excerpt if missing (from content or default)
        const excerpt = post.excerpt || (post.content ? post.content.substring(0, 200) + '...' :
          `Discover insights about ${post.title || 'this topic'} and how it can transform your business.`);

        // Generate meta description if missing (from excerpt)
        const metaDescription = post.metaDescription || excerpt.substring(0, 160);

        // Generate tags if missing (from title and category)
        let tags = post.tags;
        if (!tags && post.title) {
          const titleWords = post.title.toLowerCase().split(' ').filter(word => word.length > 4);
          const categoryTags = post.category ? [post.category.toLowerCase()] : [];
          tags = [...new Set([...categoryTags, ...titleWords.slice(0, 3)])].join(', ');
        }

        // Calculate read time if content exists
        const readTimeMinutes = post.content ? Math.ceil(post.content.split(/\s+/).length / 200) : 5;

        // Try to fetch content from article link if provided and content is missing
        let content = post.content;
        if (post.articleLink && !content) {
          try {
            setStatusMessage(`Fetching content from article link for: ${post.title}...`);
            // Note: In a real implementation, you'd need a backend proxy to fetch Google Docs content
            // For now, we'll just note that the link exists
            content = `[Content available at: ${post.articleLink}]\n\nPlease manually copy content from the Google Doc or implement a backend service to fetch it.`;
          } catch (error) {
            console.error(`Error fetching content from article link for ${post.title}:`, error);
          }
        }

        // Set default author if missing
        const author = post.author || 'Disruptors AI';

        // Set default category if missing
        const category = post.category || 'AI & Marketing';

        // Set default image if missing
        const image = post.image || `https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop`;

        // Set is_published to false if not set (default to draft)
        const is_published = post.is_published === true || post.is_published === 'true' ? true : false;

        return {
          ...post,
          publishDate: formattedPublishDate,
          slug,
          excerpt,
          metaDescription,
          tags,
          content,
          author,
          category,
          image,
          is_published,
          read_time_minutes: readTimeMinutes,
          seo_title: post.seo_title || post.title,
          seo_keywords: post.seo_keywords || tags
        };
      }));

      setBlogData(updatedPosts);
      setStatusMessage(`✅ Successfully auto-filled ${updatedPosts.length} blog posts with publish dates starting ${today.toLocaleDateString()} (every 3 days)!`);
    } catch (error) {
      console.error('Error auto-filling posts:', error);
      setStatusMessage(`❌ Error auto-filling posts: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 10000);
    }
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Global resize cursor overlay when resizing */}
        {isResizing && (
          <div
            className="fixed inset-0 z-50 cursor-col-resize"
            style={{ backgroundColor: 'transparent' }}
          />
        )}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-lg border border-white/20"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Blog Management</h1>
              <p className="text-lg text-gray-600">Manage your blog posts with spreadsheet-like functionality</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={handleWriteArticles}
                  disabled={isLoading || isGeneratingArticles}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-xl"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  {isGeneratingArticles
                    ? `Writing ${generationProgress.current}/${generationProgress.total}...`
                    : 'Write Articles'}
                </Button>
                <Button
                  onClick={handleAutoFillPosts}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-xl"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Fill All
                </Button>
                <Button
                  onClick={handleSendToSupabase}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Supabase
                </Button>
                <Button
                  onClick={handlePullFromSupabase}
                  disabled={isLoading}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Pull from Supabase
                </Button>
                <Button
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Sheets
                </Button>
                <Button
                  onClick={handlePullFromGoogleSheets}
                  disabled={isLoading || !sheetsIntegrationReady}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Pull from Sheets
                </Button>
                <Button
                  onClick={handlePushToGoogleSheets}
                  disabled={isLoading || !sheetsIntegrationReady}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Push to Sheets
                </Button>
                <Button onClick={handleAddRow} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Post
                </Button>
                <Button
                  onClick={() => setShowColumnMapping(true)}
                  variant="outline"
                  className="border-indigo-200 hover:bg-indigo-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Mapping
                </Button>
                <Button
                  onClick={handleRunDiagnostics}
                  variant="outline"
                  disabled={isLoading}
                  className="border-orange-200 hover:bg-orange-50"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Run Diagnostics
                </Button>
              </div>
              {statusMessage && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                  statusMessage.includes('Error') || statusMessage.includes('not configured')
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Generation Queue - Shown during article generation */}
        {showQueue && queueItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mb-8 relative"
          >
            {/* Close button - only show when generation is complete */}
            {!isGeneratingArticles && (
              <button
                onClick={() => setShowQueue(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors"
                title="Close queue"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}

            <GenerationQueue
              queueItems={queueItems}
              currentIndex={generationProgress.current}
              totalPosts={generationProgress.total}
            />
          </motion.div>
        )}

        {/* Spreadsheet Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Table Header */}
              <div className="flex bg-gray-50/80 border-b border-gray-200">
                <div className="w-12 p-3 font-semibold text-gray-700 flex-shrink-0 border-r border-gray-200">
                  #
                </div>
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="relative font-semibold text-gray-700 border-r border-gray-200 flex-shrink-0 group"
                    style={{ width: `${column.width}px` }}
                  >
                    <div
                      className="p-3 cursor-pointer select-none hover:bg-gray-100/50 rounded transition-colors"
                      onDoubleClick={() => handleColumnDoubleClick(column.key)}
                      title={`Double-click to auto-fit "${column.label}" column\nCurrent width: ${column.width}px`}
                    >
                      {column.label}
                    </div>
                    {/* Resize handle - visible indicator */}
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize opacity-0 group-hover:opacity-70 hover:!opacity-100 bg-indigo-500 transition-all duration-200 hover:w-2"
                      onMouseDown={(e) => handleResizeStart(e, column.key)}
                      title={`Drag to resize "${column.label}" column`}
                    />
                    {/* Extended resize area for easier grabbing */}
                    <div
                      className="absolute top-0 right-0 w-4 h-full cursor-col-resize hover:bg-indigo-100/20"
                      onMouseDown={(e) => handleResizeStart(e, column.key)}
                      title={`Drag to resize "${column.label}" column`}
                    />
                  </div>
                ))}
                <div className="w-48 p-3 font-semibold text-gray-700 flex-shrink-0 text-center">
                  Actions
                </div>
              </div>

              {/* Table Body */}
              {blogData.map((row) => (
                <div key={row.id} className="flex border-b border-gray-200 hover:bg-gray-50/50">
                  <div className="w-12 p-3 text-sm text-gray-500 flex-shrink-0 border-r border-gray-200 flex items-center">
                    {row.id}
                  </div>
                  {columns.map((column) => (
                    <div
                      key={`${row.id}-${column.key}`}
                      className="border-r border-gray-200 flex-shrink-0"
                      style={{ width: `${column.width}px` }}
                    >
                      <EditableCell
                        value={row[column.key]}
                        onChange={(newValue) => handleCellChange(row.id, column.key, newValue)}
                        type={column.type}
                        options={column.options}
                        isEditing={editingCell?.rowId === row.id && editingCell?.columnKey === column.key}
                        onStartEdit={() => handleStartEdit(row.id, column.key)}
                        onFinishEdit={handleFinishEdit}
                        onCancelEdit={handleCancelEdit}
                      />
                    </div>
                  ))}
                  {/* Blog Post Actions */}
                  <div className="w-48 p-2 flex-shrink-0 flex items-center justify-center gap-1">
                    {/* Approve/Publish */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleApprovePost(row.id)}
                      className="p-1 h-7 w-7 text-green-600 hover:text-green-800 hover:bg-green-50"
                      title="Approve & Publish Post"
                    >
                      <Check className="w-3 h-3" />
                    </Button>

                    {/* Request Rewrite */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRequestRewrite(row.id)}
                      className="p-1 h-7 w-7 text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                      title="Request Rewrite"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>

                    {/* Generate/Upload Image */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleGenerateImage(row.id)}
                      className="p-1 h-7 w-7 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      title="Generate Image"
                    >
                      <Image className="w-3 h-3" />
                    </Button>

                    {/* Auto-Enrich Fields */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEnrichFields(row.id)}
                      className="p-1 h-7 w-7 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                      title="Auto-Enrich Fields"
                    >
                      <Sparkles className="w-3 h-3" />
                    </Button>

                    {/* Preview Post */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePreviewPost(row.id)}
                      className="p-1 h-7 w-7 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                      title="Preview Post"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1 h-7 w-7 text-red-600 hover:text-red-800 hover:bg-red-50"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{blogData.length}</div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {blogData.filter(post => post.is_published === true || post.is_published === 'true').length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {blogData.filter(post => post.is_published === false || post.is_published === 'false').length}
                </div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {new Set(blogData.map(post => post.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Column Mapping Configuration Modal */}
          <ColumnMappingConfig
            isOpen={showColumnMapping}
            onClose={() => setShowColumnMapping(false)}
            onMappingUpdate={handleMappingUpdate}
          />
        </div>
      </div>
    </>
  );
}