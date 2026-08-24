import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Plus, Trash2, Edit2, Check, X, AlertCircle, TestTube, Settings, Wrench, Send, RefreshCw, Image, Sparkles, Eye, PenTool, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pullBlogDataFromSheets, pushBlogDataToSheets, initializeGoogleSheetsIntegration, getCurrentColumnMapping } from '@/lib/google-sheets-service';
import { testGoogleSheetsConnection } from '@/utils/test-google-sheets';
import { runFullDiagnostics } from '@/utils/google-sheets-diagnostics';
import ColumnMappingConfig from '@/components/shared/ColumnMappingConfig';
import { customClient } from '@/lib/custom-sdk';
import { batchGenerateArticles } from '@/lib/anthropic-blog-writer';
import GenerationQueue from '@/components/admin/GenerationQueue';

const initialBlogData = [];

const DEFAULT_COLUMNS = [
  { key: 'title', label: 'TITLE', width: 200, minWidth: 100, type: 'text' },
  { key: 'author', label: 'AUTHOR', width: 120, minWidth: 80, type: 'text' },
  { key: 'category', label: 'CATEGORY', width: 120, minWidth: 80, type: 'text' },
  { key: 'is_published', label: 'STATUS', width: 100, minWidth: 80, type: 'select', options: ['true', 'false'] },
  { key: 'publishDate', label: 'PUBLISH DATE', width: 120, minWidth: 100, type: 'date' },
  { key: 'excerpt', label: 'EXCERPT', width: 250, minWidth: 150, type: 'textarea' },
  { key: 'tags', label: 'TAGS', width: 150, minWidth: 100, type: 'text' },
  { key: 'slug', label: 'SLUG', width: 150, minWidth: 100, type: 'text' },
  { key: 'image', label: 'IMAGE URL', width: 200, minWidth: 150, type: 'text' },
  { key: 'metaDescription', label: 'META DESC', width: 200, minWidth: 150, type: 'textarea' },
  { key: 'content', label: 'CONTENT', width: 300, minWidth: 200, type: 'textarea' },
  { key: 'articleLink', label: 'ARTICLE LINK', width: 200, minWidth: 150, type: 'text' }
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
        className="p-2 min-h-[40px] cursor-pointer hover:bg-green-400/10 rounded flex items-center justify-between group transition-colors"
        onClick={onStartEdit}
      >
        <span className="truncate flex-grow text-green-400/90">
          {type === 'textarea' ? (value?.length > 50 ? `${value?.substring(0, 50)}...` : value) : value}
        </span>
        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50 ml-2 flex-shrink-0 text-green-400" />
      </div>
    );
  }

  return (
    <div className="p-1 flex items-center gap-1">
      {type === 'select' ? (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-grow text-sm border border-green-400/30 rounded px-2 py-1 bg-black text-green-400"
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
          className="flex-grow text-sm min-h-[80px] resize-none bg-black border-green-400/30 text-green-400"
          autoFocus
        />
      ) : (
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-grow text-sm bg-black border-green-400/30 text-green-400"
          autoFocus
        />
      )}
      <Button size="sm" variant="ghost" onClick={handleSave} className="p-1 h-6 w-6 text-green-400 hover:bg-green-400/20">
        <Check className="w-3 h-3" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel} className="p-1 h-6 w-6 text-red-400 hover:bg-red-400/20">
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default function AdminBlogManager() {
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
      setStatusMessage('> Google Sheets integration not configured');
      return;
    }

    setIsLoading(true);
    setStatusMessage('> Pulling data from Google Sheets...');

    try {
      const sheetsData = await pullBlogDataFromSheets();
      if (sheetsData.length > 0) {
        setBlogData(sheetsData);
        setStatusMessage(`> SUCCESS: Loaded ${sheetsData.length} posts from Google Sheets`);
      } else {
        setStatusMessage('> WARNING: No data found in Google Sheets');
      }
    } catch (error) {
      console.error('Error pulling from Google Sheets:', error);
      setStatusMessage(`> ERROR: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handlePushToGoogleSheets = async () => {
    if (!sheetsIntegrationReady) {
      setStatusMessage('> Google Sheets integration not configured');
      return;
    }

    setIsLoading(true);
    setStatusMessage('> Pushing data to Google Sheets...');

    try {
      await pushBlogDataToSheets(blogData);
      setStatusMessage(`> SUCCESS: Prepared ${blogData.length} posts for export`);
    } catch (error) {
      console.error('Error pushing to Google Sheets:', error);
      setStatusMessage(`> ERROR: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 10000);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setStatusMessage('> Testing Google Sheets connection...');

    try {
      const success = await testGoogleSheetsConnection();
      if (success) {
        setStatusMessage('> SUCCESS: Connection test passed');
        setSheetsIntegrationReady(true);
        setCurrentMapping(getCurrentColumnMapping());
      } else {
        setStatusMessage('> ERROR: Connection test failed');
        setSheetsIntegrationReady(false);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setStatusMessage(`> ERROR: ${error.message}`);
      setSheetsIntegrationReady(false);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  const handleMappingUpdate = (newMapping) => {
    setCurrentMapping(newMapping);
    setStatusMessage('> Column mapping updated');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleRunDiagnostics = async () => {
    setIsLoading(true);
    setStatusMessage('> Running comprehensive diagnostics...');

    try {
      await runFullDiagnostics();
      setStatusMessage('> Diagnostics complete - check console for details');
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setStatusMessage(`> ERROR: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 10000);
    }
  };

  // Column resizing functionality
  const handleColumnDoubleClick = (columnKey) => {
    const maxContentLength = Math.max(
      ...blogData.map(row => (row[columnKey] || '').toString().length),
      columns.find(col => col.key === columnKey)?.label?.length || 0
    );

    const newWidth = Math.min(Math.max(maxContentLength * 8 + 40, 100), 500);

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

    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Blog Post Workflow Actions
  const handleApprovePost = async (postId) => {
    try {
      const post = blogData.find(p => p.id === postId);
      if (post) {
        handleCellChange(postId, 'is_published', true);
        if (!post.publishDate) {
          const today = new Date().toISOString().split('T')[0];
          handleCellChange(postId, 'publishDate', today);
        }
        console.log(`Post "${post.title}" approved and published`);
      }
    } catch (error) {
      console.error('Error approving post:', error);
    }
  };

  const handleRequestRewrite = async (postId) => {
    try {
      const post = blogData.find(p => p.id === postId);
      if (post) {
        handleCellChange(postId, 'is_published', false);
        console.log(`Rewrite requested for "${post.title}"`);
      }
    } catch (error) {
      console.error('Error requesting rewrite:', error);
    }
  };

  const handleGenerateImage = async (postId) => {
    try {
      const post = blogData.find(p => p.id === postId);
      if (post) {
        console.log(`Generating image for "${post.title}"`);
        const placeholderImageUrl = `https://via.placeholder.com/800x400/00ff00/000000?text=${encodeURIComponent(post.title || 'Blog Post')}`;
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
        console.log(`Enriching fields for "${post.title}"`);

        if (!post.slug && post.title) {
          const slug = post.title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          handleCellChange(postId, 'slug', slug);
        }

        if (!post.metaDescription && post.excerpt) {
          const metaDesc = post.excerpt.length > 160
            ? post.excerpt.substring(0, 157) + '...'
            : post.excerpt;
          handleCellChange(postId, 'metaDescription', metaDesc);
        }

        if (!post.tags && post.content) {
          const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
          const words = post.content.toLowerCase().split(/\W+/)
            .filter(word => word.length > 3 && !commonWords.includes(word))
            .slice(0, 5);
          handleCellChange(postId, 'tags', words.join(', '));
        }

        console.log(`Fields enriched for "${post.title}"`);
      }
    } catch (error) {
      console.error('Error enriching fields:', error);
    }
  };

  const handlePreviewPost = (postId) => {
    const post = blogData.find(p => p.id === postId);
    if (post) {
      console.log(`Opening preview for "${post.title}"`);
      window.open(`/blog/${post.slug || post.id}`, '_blank');
    }
  };

  // Send to Supabase with intelligent field mapping
  const handleSendToSupabase = async () => {
    setIsLoading(true);
    setStatusMessage('> Sending blog posts to Supabase...');

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const post of blogData) {
        try {
          const supabasePost = {
            title: post.title || 'Untitled Post',
            slug: post.slug || post.title?.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim() || `post-${Date.now()}`,
            excerpt: post.excerpt || '',
            content: post.content || '',
            content_type: 'blog',
            featured_image: post.image || post.imageUrl || null,
            gallery_images: post.gallery_images
              ? (typeof post.gallery_images === 'string' ? post.gallery_images.split(',').map(t => t.trim()) : Array.isArray(post.gallery_images) ? post.gallery_images : [post.gallery_images])
              : [],
            author_id: null,
            category: post.category || null,
            tags: post.tags
              ? (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : Array.isArray(post.tags) ? post.tags : [post.tags])
              : [],
            is_published: post.is_published === true || post.is_published === 'true',
            is_featured: false,
            published_at: post.publishDate && (post.is_published === true || post.is_published === 'true')
              ? new Date(post.publishDate).toISOString()
              : null,
            seo_title: post.seo_title || post.title || null,
            seo_description: post.metaDescription || post.excerpt?.substring(0, 160) || null,
            seo_keywords: post.seo_keywords
              ? (typeof post.seo_keywords === 'string' ? post.seo_keywords.split(',').map(t => t.trim()) : Array.isArray(post.seo_keywords) ? post.seo_keywords : [post.seo_keywords])
              : (post.tags ? (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : Array.isArray(post.tags) ? post.tags : [post.tags]) : []),
            read_time_minutes: post.read_time_minutes || (post.content ? Math.ceil(post.content.split(/\s+/).length / 200) : null)
          };

          const existingPosts = await customClient.entities.Post.filter({ slug: supabasePost.slug });

          if (existingPosts && existingPosts.length > 0) {
            await customClient.entities.Post.update(existingPosts[0].id, supabasePost);
            console.log(`✓ Updated: "${supabasePost.title}"`);
          } else {
            await customClient.entities.Post.create(supabasePost);
            console.log(`✓ Created: "${supabasePost.title}"`);
          }

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({ post: post.title, error: error.message });
          console.error(`✗ Error saving "${post.title}":`, error);
        }
      }

      if (errorCount === 0) {
        setStatusMessage(`> SUCCESS: ${successCount} posts sent to Supabase`);
      } else {
        setStatusMessage(`> PARTIAL: ${successCount} sent, ${errorCount} failed`);
        console.error('Failed posts:', errors);
      }
    } catch (error) {
      console.error('Error sending to Supabase:', error);
      setStatusMessage(`> ERROR: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  // Pull from Supabase
  const handlePullFromSupabase = async () => {
    setIsLoading(true);
    setStatusMessage('> Pulling blog posts from Supabase...');

    try {
      const supabasePosts = await customClient.entities.Post.list('-created_at');

      if (supabasePosts && supabasePosts.length > 0) {
        const mappedPosts = supabasePosts.map((post, index) => ({
          id: index + 1,
          supabaseId: post.id,
          title: post.title,
          excerpt: post.excerpt,
          author: post.author_id ? 'User ' + post.author_id.substring(0, 8) : '',
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
        setStatusMessage(`> SUCCESS: Loaded ${mappedPosts.length} posts from Supabase`);
      } else {
        setStatusMessage('> INFO: No blog posts found in Supabase');
      }
    } catch (error) {
      console.error('Error pulling from Supabase:', error);
      setStatusMessage(`> ERROR: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  // Write Articles using Anthropic API with detailed queue tracking
  const handleWriteArticles = async () => {
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setStatusMessage('> ERROR: VITE_ANTHROPIC_API_KEY not configured');
      return;
    }

    const postsToGenerate = blogData.filter(post => {
      const hasContent = post.content && post.content.length > 200;
      return !hasContent;
    });

    if (postsToGenerate.length === 0) {
      setStatusMessage('> INFO: All posts already have content');
      setTimeout(() => setStatusMessage(''), 5000);
      return;
    }

    const confirmGenerate = window.confirm(
      `NEURAL PROTOCOL: Generate ${postsToGenerate.length} articles?\n\n` +
      `This will engage the Anthropic API and may take several minutes.\n\n` +
      `Posts with existing content will be skipped.\n\n` +
      `Confirm?`
    );

    if (!confirmGenerate) return;

    // Initialize queue
    const initialQueue = postsToGenerate.map(post => ({
      post,
      status: 'pending',
      message: 'Waiting in queue...'
    }));

    setQueueItems(initialQueue);
    setShowQueue(true);
    setIsGeneratingArticles(true);
    setIsLoading(true);
    setGenerationProgress({ current: 0, total: postsToGenerate.length });
    setStatusMessage(`> NEURAL PROCESS: Generating ${postsToGenerate.length} articles...`);

    try {
      const results = await batchGenerateArticles(
        postsToGenerate,
        (current, total, result) => {
          setGenerationProgress({ current, total });
          setStatusMessage(`> PROCESSING: ${current}/${total} - ${result.title}`);
        },
        (postId, status, message) => {
          setQueueItems(prev => prev.map(item =>
            item.post.id === postId
              ? { ...item, status, message }
              : item
          ));
        }
      );

      const updatedBlogData = blogData.map(post => {
        const result = results.find(r => r.postId === post.id);
        if (result && result.success) {
          return {
            ...post,
            content: result.content,
            read_time_minutes: Math.ceil(result.content.split(/\s+/).length / 200)
          };
        }
        return post;
      });

      setBlogData(updatedBlogData);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        setStatusMessage(`> SUCCESS: ${successCount} articles generated - ready for review`);
      } else {
        setStatusMessage(`> PARTIAL: ${successCount} generated, ${failCount} failed - check logs`);
        console.error('Failed articles:', results.filter(r => !r.success));
      }
    } catch (error) {
      console.error('Error generating articles:', error);
      setStatusMessage(`> ERROR: ${error.message}`);
    } finally {
      setIsGeneratingArticles(false);
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 10000);
    }
  };

  // Auto-fill all blog posts
  const handleAutoFillPosts = async () => {
    setIsLoading(true);
    setStatusMessage('> Auto-filling blog posts with intelligent defaults...');

    try {
      const today = new Date();

      const updatedPosts = await Promise.all(blogData.map(async (post, index) => {
        const publishDate = new Date(today);
        publishDate.setDate(today.getDate() + (index * 3));
        const formattedPublishDate = publishDate.toISOString().split('T')[0];

        const slug = post.slug || post.title?.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim() || `post-${index + 1}`;

        const excerpt = post.excerpt || (post.content ? post.content.substring(0, 200) + '...' :
          `Discover insights about ${post.title || 'this topic'} and how it can transform your business.`);

        const metaDescription = post.metaDescription || excerpt.substring(0, 160);

        let tags = post.tags;
        if (!tags && post.title) {
          const titleWords = post.title.toLowerCase().split(' ').filter(word => word.length > 4);
          const categoryTags = post.category ? [post.category.toLowerCase()] : [];
          tags = [...new Set([...categoryTags, ...titleWords.slice(0, 3)])].join(', ');
        }

        const readTimeMinutes = post.content ? Math.ceil(post.content.split(/\s+/).length / 200) : 5;

        let content = post.content;
        if (post.articleLink && !content) {
          try {
            setStatusMessage(`> Fetching content from article link for: ${post.title}...`);
            content = `[Content available at: ${post.articleLink}]\n\nPlease manually copy content from the Google Doc or implement a backend service to fetch it.`;
          } catch (error) {
            console.error(`Error fetching content from article link for ${post.title}:`, error);
          }
        }

        const author = post.author || 'Disruptors AI';
        const category = post.category || 'AI & Marketing';
        const image = post.image || `https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop`;
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
      setStatusMessage(`> SUCCESS: Auto-filled ${updatedPosts.length} posts (staggered every 3 days from ${today.toLocaleDateString()})`);
    } catch (error) {
      console.error('Error auto-filling posts:', error);
      setStatusMessage(`> ERROR: ${error.message}`);
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
    <div className={`${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      {/* Matrix Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, #00ff00 1px, transparent 0),
              linear-gradient(45deg, transparent 40%, #00ff0010 40%, #00ff0010 60%, transparent 60%)
            `,
            backgroundSize: '20px 20px, 40px 40px'
          }}
        />
      </div>

      {/* Global resize cursor overlay */}
      {isResizing && (
        <div
          className="fixed inset-0 z-50 cursor-col-resize"
          style={{ backgroundColor: 'transparent' }}
        />
      )}

      {/* Header Card */}
      <Card className="mb-8 bg-black/50 border-green-400/30">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-400 text-2xl font-bold">BLOG MANAGEMENT SYSTEM</CardTitle>
              <CardDescription className="text-green-400/60">
                Neural content management interface with AI generation capabilities
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleWriteArticles}
              disabled={isLoading || isGeneratingArticles}
              className="bg-gradient-to-r from-indigo-500 to-cyan-0 hover:from-indigo-600 hover:to-cyan-0 text-white border-0"
            >
              <PenTool className="w-4 h-4 mr-2" />
              {isGeneratingArticles
                ? `WRITING ${generationProgress.current}/${generationProgress.total}...`
                : 'WRITE ARTICLES'}
            </Button>

            <Button
              onClick={handleAutoFillPosts}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-0 to-pink-500 hover:from-cyan-0 hover:to-pink-600 text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AUTO-FILL
            </Button>

            <Button
              onClick={handleSendToSupabase}
              disabled={isLoading}
              className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/20"
              variant="outline"
            >
              <Send className="w-4 h-4 mr-2" />
              SEND TO DB
            </Button>

            <Button
              onClick={handlePullFromSupabase}
              disabled={isLoading}
              className="border-teal-400 text-teal-400 hover:bg-teal-400/20"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              PULL FROM DB
            </Button>

            <Button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="border-cyan-0 text-cyan-0 hover:bg-cyan-0/20"
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              TEST SHEETS
            </Button>

            <Button
              onClick={handlePullFromGoogleSheets}
              disabled={isLoading || !sheetsIntegrationReady}
              className="border-green-400 text-green-400 hover:bg-green-400/20 disabled:opacity-30"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              PULL SHEETS
            </Button>

            <Button
              onClick={handlePushToGoogleSheets}
              disabled={isLoading || !sheetsIntegrationReady}
              className="border-blue-400 text-blue-400 hover:bg-blue-400/20 disabled:opacity-30"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              PUSH SHEETS
            </Button>

            <Button
              onClick={handleAddRow}
              className="border-indigo-400 text-indigo-400 hover:bg-indigo-400/20"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              ADD POST
            </Button>

            <Button
              onClick={() => setShowColumnMapping(true)}
              variant="outline"
              className="border-gray-400 text-gray-400 hover:bg-gray-400/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              CONFIG
            </Button>

            <Button
              onClick={handleRunDiagnostics}
              variant="outline"
              disabled={isLoading}
              className="border-orange-400 text-orange-400 hover:bg-orange-400/20"
            >
              <Wrench className="w-4 h-4 mr-2" />
              DIAGNOSTICS
            </Button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg font-mono ${
              statusMessage.includes('ERROR')
                ? 'bg-red-400/10 text-red-400 border border-red-400/30'
                : statusMessage.includes('WARNING') || statusMessage.includes('PARTIAL')
                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                : 'bg-green-400/10 text-green-400 border border-green-400/30'
            }`}>
              <AlertCircle className="w-4 h-4" />
              {statusMessage}
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-sm text-green-400/70 pt-2 border-t border-green-400/20">
            <div className="flex items-center gap-4">
              <div>TOTAL POSTS: <span className="text-green-400 font-bold">{blogData.length}</span></div>
              <div>PUBLISHED: <span className="text-green-400 font-bold">{blogData.filter(p => p.is_published === true || p.is_published === 'true').length}</span></div>
              <div>DRAFTS: <span className="text-green-400 font-bold">{blogData.filter(p => p.is_published === false || p.is_published === 'false').length}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Queue */}
      {showQueue && queueItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="mb-8 relative"
        >
          {!isGeneratingArticles && (
            <button
              onClick={() => setShowQueue(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black hover:bg-green-400/20 border border-green-400/30 transition-colors"
              title="Close queue"
            >
              <X className="w-4 h-4 text-green-400" />
            </button>
          )}

          <div className="bg-black/50 border border-green-400/30 rounded-lg p-4">
            <GenerationQueue
              queueItems={queueItems}
              currentIndex={generationProgress.current}
              totalPosts={generationProgress.total}
            />
          </div>
        </motion.div>
      )}

      {/* Spreadsheet Table */}
      <Card className="bg-black/50 border-green-400/30">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Table Header */}
            <div className="flex bg-green-400/5 border-b border-green-400/30">
              <div className="w-12 p-3 font-semibold text-green-400 flex-shrink-0 border-r border-green-400/30 text-xs">
                ID
              </div>
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="relative font-semibold text-green-400 border-r border-green-400/30 flex-shrink-0 group text-xs"
                  style={{ width: `${column.width}px` }}
                >
                  <div
                    className="p-3 cursor-pointer select-none hover:bg-green-400/10 transition-colors"
                    onDoubleClick={() => handleColumnDoubleClick(column.key)}
                    title={`Double-click to auto-fit\nCurrent width: ${column.width}px`}
                  >
                    {column.label}
                  </div>
                  {/* Resize handle */}
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize opacity-0 group-hover:opacity-70 hover:!opacity-100 bg-green-400 transition-all duration-200 hover:w-2"
                    onMouseDown={(e) => handleResizeStart(e, column.key)}
                    title={`Drag to resize "${column.label}"`}
                  />
                  <div
                    className="absolute top-0 right-0 w-4 h-full cursor-col-resize hover:bg-green-400/10"
                    onMouseDown={(e) => handleResizeStart(e, column.key)}
                    title={`Drag to resize "${column.label}"`}
                  />
                </div>
              ))}
              <div className="w-48 p-3 font-semibold text-green-400 flex-shrink-0 text-center text-xs">
                ACTIONS
              </div>
            </div>

            {/* Table Body */}
            {blogData.map((row) => (
              <div key={row.id} className="flex border-b border-green-400/20 hover:bg-green-400/5">
                <div className="w-12 p-3 text-sm text-green-400/70 flex-shrink-0 border-r border-green-400/20 flex items-center">
                  {row.id}
                </div>
                {columns.map((column) => (
                  <div
                    key={`${row.id}-${column.key}`}
                    className="border-r border-green-400/20 flex-shrink-0"
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

                {/* Action Buttons */}
                <div className="w-48 p-2 flex-shrink-0 flex items-center justify-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleApprovePost(row.id)}
                    className="p-1 h-7 w-7 text-green-400 hover:bg-green-400/20"
                    title="Approve & Publish"
                  >
                    <Check className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRequestRewrite(row.id)}
                    className="p-1 h-7 w-7 text-orange-400 hover:bg-orange-400/20"
                    title="Request Rewrite"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerateImage(row.id)}
                    className="p-1 h-7 w-7 text-blue-400 hover:bg-blue-400/20"
                    title="Generate Image"
                  >
                    <Image className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEnrichFields(row.id)}
                    className="p-1 h-7 w-7 text-cyan-0 hover:bg-cyan-0/20"
                    title="Auto-Enrich Fields"
                  >
                    <Sparkles className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreviewPost(row.id)}
                    className="p-1 h-7 w-7 text-indigo-400 hover:bg-indigo-400/20"
                    title="Preview Post"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteRow(row.id)}
                    className="p-1 h-7 w-7 text-red-400 hover:bg-red-400/20"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Column Mapping Configuration Modal */}
      <ColumnMappingConfig
        isOpen={showColumnMapping}
        onClose={() => setShowColumnMapping(false)}
        onMappingUpdate={handleMappingUpdate}
      />
    </div>
  );
}
