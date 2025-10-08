/**
 * AI Content Writer - Business Brain-Powered Blog Content Generation
 *
 * Complete AI writing workflow:
 * 1. Title Generator - Generate 5 SEO-optimized blog titles
 * 2. Article Generator - Write full 1500-3000 word articles
 * 3. Post Editor - WYSIWYG editing with ReactQuill and auto-markdown conversion
 * 4. Content Library - Manage all published and draft content
 *
 * Features:
 * - Brain-powered content generation using Business Brain knowledge
 * - ReactQuill WYSIWYG editor with rich text formatting
 * - Auto-markdown to HTML conversion
 * - SEO metadata management
 * - Publishing workflow (Draft → Review → Approved → Scheduled → Published)
 * - Responsive design with Radix UI components
 */

import React, { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import { Loader2, Sparkles, FileText, Edit3, Library, Bot, User, Calendar, Trash2, Search, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { BrainAPI } from '@/lib/brain-api';
import { supabase } from '@/lib/supabase-client';

// Import new components
import CalendarView from '@/components/blog/CalendarView';
import ContentSettings from '@/components/blog/ContentSettings';
import BrainThemedLayout, { BrandedHeading, BrandedButton } from '@/components/layout/BrainThemedLayout';

// ReactQuill modules configuration
const quillModules = {
  toolbar: [
    [{ 'header': [2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image',
  'blockquote', 'code-block'
];

/**
 * Utility: Detect if content is markdown
 */
const isLikelyMarkdown = (content) => {
  if (!content || typeof content !== 'string') return false;
  const trimmed = content.trim();
  return trimmed.startsWith('#') ||
         trimmed.startsWith('* ') ||
         trimmed.startsWith('- ') ||
         trimmed.startsWith('1. ') ||
         trimmed.includes('```') ||
         /\[.+\]\(.+\)/.test(trimmed); // Markdown links
};

/**
 * Utility: Count words in HTML content
 */
const countWords = (html) => {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(word => word.length > 0).length;
};

/**
 * Utility: Get status badge variant
 */
const getStatusVariant = (status) => {
  switch (status) {
    case 'Draft': return 'secondary';
    case 'Needs Review': return 'outline';
    case 'Approved': return 'default';
    case 'Scheduled': return 'secondary';
    case 'Published': return 'default';
    default: return 'secondary';
  }
};

/**
 * Main AI Content Writer Component
 */
export default function AIContentWriter() {
  const [activeTab, setActiveTab] = useState('titles');
  const [userBrain, setUserBrain] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user's brain on mount
  useEffect(() => {
    loadUserBrain();
  }, []);

  const loadUserBrain = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to use AI Content Writer');
        setLoading(false);
        return;
      }

      // Get user's business brain
      const brain = await BrainAPI.getBrainByUser(user.id);
      setUserBrain(brain);

      if (brain) {
        toast.success('Brain loaded successfully!', {
          description: `Using brain: ${brain.business_name || 'Business Brain'}`
        });
      } else {
        toast.info('No Business Brain found', {
          description: 'Complete onboarding to create your Business Brain'
        });
      }
    } catch (error) {
      console.error('Error loading brain:', error);
      toast.error('Failed to load Business Brain', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BrainThemedLayout showLoading={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      </BrainThemedLayout>
    );
  }

  if (!userBrain) {
    return (
      <BrainThemedLayout showLoading={false}>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto border-2 border-[var(--brand-primary)]/20">
            <CardHeader>
              <CardTitle className="text-[var(--brand-primary)]">No Business Brain Found</CardTitle>
              <CardDescription>
                You need to create a Business Brain before using the AI Content Writer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandedButton variant="primary" onClick={() => window.location.href = '/business-brain-manager'}>
                Create Business Brain
              </BrandedButton>
            </CardContent>
          </Card>
        </div>
      </BrainThemedLayout>
    );
  }

  return (
    <BrainThemedLayout>
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Premium header with refined typography */}
        <div className="mb-12">
          <h1
            className="text-[2rem] font-semibold mb-3 tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            AI Content Writer
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Generate SEO-optimized blog content for{' '}
            <span className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              {userBrain.business_name}
            </span>
          </p>
        </div>

        {/* Premium stat cards with subtle brand accents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div
            className="bg-white rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 group"
            style={{
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(var(--brand-primary-rgb), 0.1)' }}
              >
                <Bot className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Brand Voice Active
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              All content matches your unique brand voice and tone
            </p>
          </div>

          <div
            className="bg-white rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 group"
            style={{
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(var(--brand-primary-rgb), 0.1)' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                SEO Optimized
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Automatically optimized for search engines and rankings
            </p>
          </div>

          <div
            className="bg-white rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 group"
            style={{
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(var(--brand-primary-rgb), 0.1)' }}
              >
                <FileText className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                AI Powered
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Claude Sonnet 4.5 generates high-quality, engaging content
            </p>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Premium pill-style tabs */}
        <div
          className="inline-flex p-1 rounded-xl mb-8 gap-1"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
          }}
        >
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'titles' ? '' : ''
            }`}
            style={{
              backgroundColor: activeTab === 'titles' ? 'white' : 'transparent',
              color: activeTab === 'titles' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'titles' ? 'var(--shadow-sm)' : 'none',
              borderLeft: activeTab === 'titles' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'titles' ? 600 : 500,
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Generate Titles</span>
            <span className="sm:hidden">Titles</span>
          </button>
          <button
            onClick={() => setActiveTab('article')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`}
            style={{
              backgroundColor: activeTab === 'article' ? 'white' : 'transparent',
              color: activeTab === 'article' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'article' ? 'var(--shadow-sm)' : 'none',
              borderLeft: activeTab === 'article' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'article' ? 600 : 500,
            }}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Write Article</span>
            <span className="sm:hidden">Article</span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`}
            style={{
              backgroundColor: activeTab === 'editor' ? 'white' : 'transparent',
              color: activeTab === 'editor' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'editor' ? 'var(--shadow-sm)' : 'none',
              borderLeft: activeTab === 'editor' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'editor' ? 600 : 500,
            }}
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit & Publish</span>
            <span className="sm:hidden">Edit</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`}
            style={{
              backgroundColor: activeTab === 'library' ? 'white' : 'transparent',
              color: activeTab === 'library' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'library' ? 'var(--shadow-sm)' : 'none',
              borderLeft: activeTab === 'library' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'library' ? 600 : 500,
            }}
          >
            <Library className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
            <span className="sm:hidden">Library</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`}
            style={{
              backgroundColor: activeTab === 'calendar' ? 'white' : 'transparent',
              color: activeTab === 'calendar' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'calendar' ? 'var(--shadow-sm)' : 'none',
              borderLeft: activeTab === 'calendar' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'calendar' ? 600 : 500,
            }}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
            <span className="sm:hidden">Cal</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`}
            style={{
              backgroundColor: activeTab === 'settings' ? 'white' : 'transparent',
              color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'settings' ? 'var(--shadow-sm)' : 'none',
              borderLeft: activeTab === 'settings' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              fontWeight: activeTab === 'settings' ? 600 : 500,
            }}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Set</span>
          </button>
        </div>

        {/* Get Keywords CTA */}
        <div className="mb-8">
          <div
            className="bg-gradient-to-r from-white to-white rounded-xl p-6 flex items-center justify-between"
            style={{
              border: '1.5px solid var(--brand-primary)',
              boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb), 0.1)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(var(--brand-primary-rgb), 0.1)' }}
              >
                <Search className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Need keyword ideas?
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Research high-value keywords with volume, difficulty, and trend data
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/keyword-research'}
              className="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2"
              style={{
                backgroundColor: 'var(--brand-primary)',
                boxShadow: '0 2px 8px rgba(var(--brand-primary-rgb), 0.2)',
              }}
            >
              <Search className="w-5 h-5" />
              Get Keywords
            </Button>
          </div>
        </div>

        <TabsContent value="titles" className="mt-6">
          <TitleGenerator brainId={userBrain.id} onTitleSelected={() => setActiveTab('article')} />
        </TabsContent>

        <TabsContent value="article" className="mt-6">
          <ArticleGenerator brainId={userBrain.id} onArticleSaved={() => setActiveTab('library')} />
        </TabsContent>

        <TabsContent value="editor" className="mt-6">
          <PostEditor brainId={userBrain.id} />
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <ContentLibrary brainId={userBrain.id} onEditPost={() => setActiveTab('editor')} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ContentCalendar brainId={userBrain.id} onPostSelect={() => setActiveTab('editor')} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ContentSettings brainId={userBrain.id} />
        </TabsContent>
      </Tabs>
      </div>
    </BrainThemedLayout>
  );
}

/**
 * Content Calendar Component - Wrapper for CalendarView
 */
function ContentCalendar({ brainId, onPostSelect }) {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brainId]);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('brain_id', brainId)
        .not('scheduled_date', 'is', null)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostSelect = (post) => {
    // Store post ID for editor
    localStorage.setItem('editPostId', post.id);
    onPostSelect();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <CalendarView posts={scheduledPosts} onPostSelect={handlePostSelect} />;
}

/**
 * 1. Title Generator Component
 */
function TitleGenerator({ brainId, onTitleSelected }) {
  const [topic, setTopic] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [titleCount, setTitleCount] = useState(5);
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateTitles = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    try {
      setGenerating(true);
      const result = await BrainAPI.generateContent(brainId, 'blog_title', {
        topic: topic.trim(),
        primaryKeyword: primaryKeyword.trim(),
        titleCount
      });

      if (result.titles && Array.isArray(result.titles)) {
        setGeneratedTitles(result.titles);
        toast.success(`Generated ${result.titles.length} titles!`);
      } else {
        toast.error('No titles generated');
      }
    } catch (error) {
      console.error('Title generation error:', error);
      toast.error('Failed to generate titles', {
        description: error.message
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleUseTitle = () => {
    if (!selectedTitle) {
      toast.error('Please select a title');
      return;
    }

    // Store selected title in localStorage for next tab
    localStorage.setItem('selectedBlogTitle', selectedTitle);
    toast.success('Title selected!', {
      description: 'Click "Write Article" tab to continue'
    });
    onTitleSelected();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Blog Titles</CardTitle>
          <CardDescription>
            Create 5 SEO-optimized blog titles based on your topic and keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Subject</Label>
            <Input
              id="topic"
              placeholder="e.g., How to improve website SEO"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryKeyword">Primary Keyword (optional)</Label>
            <Input
              id="primaryKeyword"
              placeholder="e.g., SEO optimization"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="titleCount">Number of Titles</Label>
            <Input
              id="titleCount"
              type="number"
              min="1"
              max="10"
              value={titleCount}
              onChange={(e) => setTitleCount(parseInt(e.target.value) || 5)}
            />
          </div>

          <Button
            onClick={handleGenerateTitles}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Titles...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Titles
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedTitles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Titles</CardTitle>
            <CardDescription>Select a title to use for your article</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {generatedTitles.map((title, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedTitle === title
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedTitle(title)}
              >
                <CardContent className="p-4">
                  <p className="font-medium">{title}</p>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={handleUseTitle}
              disabled={!selectedTitle}
              className="w-full mt-4"
            >
              Use Selected Title
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * 2. Article Generator Component
 */
function ArticleGenerator({ brainId, onArticleSaved }) {
  const [title, setTitle] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [targetWordCount, setTargetWordCount] = useState(1500);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Load selected title from previous tab
  useEffect(() => {
    const selectedTitle = localStorage.getItem('selectedBlogTitle');
    if (selectedTitle) {
      setTitle(selectedTitle);
      localStorage.removeItem('selectedBlogTitle');
    }
  }, []);

  // Update word count when content changes
  useEffect(() => {
    setWordCount(countWords(generatedContent));
  }, [generatedContent]);

  const handleGenerateArticle = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setGenerating(true);
      const result = await BrainAPI.generateContent(brainId, 'blog_article', {
        topic: title.trim(),
        primaryKeyword: primaryKeyword.trim(),
        secondaryKeywords: secondaryKeywords.split(',').map(k => k.trim()).filter(k => k),
        targetWordCount
      });

      if (result.content) {
        setGeneratedContent(result.content);
        toast.success('Article generated successfully!', {
          description: `${countWords(result.content)} words`
        });
      } else {
        toast.error('No content generated');
      }
    } catch (error) {
      console.error('Article generation error:', error);
      toast.error('Failed to generate article', {
        description: error.message
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !generatedContent.trim()) {
      toast.error('Please generate article content first');
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          brain_id: brainId,
          title: title.trim(),
          content: generatedContent,
          primary_keyword: primaryKeyword.trim() || null,
          secondary_keywords: secondaryKeywords.trim() || null,
          status: 'Draft',
          ai_generated: true,
          created_by: 'system'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Draft saved!', {
        description: 'View in Content Library'
      });

      // Clear form
      setTitle('');
      setPrimaryKeyword('');
      setSecondaryKeywords('');
      setGeneratedContent('');

      onArticleSaved();
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('Failed to save draft', {
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article Generator</CardTitle>
          <CardDescription>
            Generate comprehensive SEO-optimized blog articles (1500-3000 words) with FAQ section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="articleTitle">Article Title</Label>
            <Input
              id="articleTitle"
              placeholder="Enter or paste your blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryKeywordArticle">Primary Keyword</Label>
            <Input
              id="primaryKeywordArticle"
              placeholder="Main SEO keyword"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryKeywords">Secondary Keywords (comma-separated)</Label>
            <Input
              id="secondaryKeywords"
              placeholder="keyword 1, keyword 2, keyword 3"
              value={secondaryKeywords}
              onChange={(e) => setSecondaryKeywords(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wordCount">Target Word Count: {targetWordCount}</Label>
            <input
              type="range"
              id="wordCount"
              min="1500"
              max="3000"
              step="100"
              value={targetWordCount}
              onChange={(e) => setTargetWordCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1500 words</span>
              <span>3000 words</span>
            </div>
          </div>

          <Button
            onClick={handleGenerateArticle}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Article...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Article
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Article</span>
              <Badge variant="outline">
                {wordCount} words
              </Badge>
            </CardTitle>
            <CardDescription>
              Preview and save your generated content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <ReactQuill
                value={generatedContent}
                onChange={setGeneratedContent}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                className="bg-white"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveDraft} className="flex-1">
                Save Draft
              </Button>
              <Button variant="outline" onClick={() => setGeneratedContent('')}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * 3. Post Editor Component
 */
function PostEditor({ brainId }) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Draft');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [editorNotes, setEditorNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  const wordCount = useMemo(() => countWords(content), [content]);

  // Load posts for editing
  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brainId]);

  // Auto-markdown conversion
  useEffect(() => {
    if (content && isLikelyMarkdown(content) && !content.trim().startsWith('<')) {
      convertMarkdownToHTML(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPost]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('brain_id', brainId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Load posts error:', error);
    }
  };

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    setTitle(post.title || '');
    setContent(post.content || '');
    setStatus(post.status || 'Draft');
    setPrimaryKeyword(post.primary_keyword || '');
    setSecondaryKeywords(post.secondary_keywords || '');
    setMetaTitle(post.meta_title || '');
    setMetaDescription(post.meta_description || '');
    setSlug(post.slug || '');
    setScheduledDate(post.scheduled_date || '');
    setEditorNotes(post.editor_notes || '');
  };

  const convertMarkdownToHTML = async (markdown) => {
    try {
      setConverting(true);

      // Simple markdown to HTML conversion
      // In production, you'd call the LLM for this
      let html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n/gim, '<br />');

      setContent(html);
      toast.success('Markdown converted to HTML');
    } catch (error) {
      console.error('Markdown conversion error:', error);
      toast.error('Failed to convert markdown');
    } finally {
      setConverting(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPost) {
      toast.error('Please select a post to edit');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          status,
          primary_keyword: primaryKeyword || null,
          secondary_keywords: secondaryKeywords || null,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          slug: slug || null,
          scheduled_date: scheduledDate || null,
          editor_notes: editorNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPost.id);

      if (error) throw error;

      toast.success('Post saved successfully!');
      loadPosts();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save post', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Post Selector */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Select Post</CardTitle>
          <CardDescription>Choose a post to edit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={`cursor-pointer transition-all ${
                selectedPost?.id === post.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectPost(post)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusVariant(post.status)} className="text-xs">
                        {post.status}
                      </Badge>
                      {post.ai_generated && (
                        <Bot className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edit Post</span>
            {selectedPost && (
              <Badge variant="outline">
                {wordCount} words
              </Badge>
            )}
          </CardTitle>
          {converting && (
            <CardDescription>
              <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
              Converting markdown to HTML...
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedPost ? (
            <div className="text-center py-12 text-muted-foreground">
              Select a post from the list to start editing
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="postTitle">Title</Label>
                <Input
                  id="postTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postStatus">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Needs Review">Needs Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryKeywordEditor">Primary Keyword</Label>
                <Input
                  id="primaryKeywordEditor"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryKeywordsEditor">Secondary Keywords</Label>
                <Input
                  id="secondaryKeywordsEditor"
                  placeholder="keyword 1, keyword 2"
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                <Input
                  id="metaTitle"
                  placeholder="SEO meta title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO meta description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="url-friendly-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editorNotes">Editor Notes (Internal)</Label>
                <Textarea
                  id="editorNotes"
                  placeholder="Internal notes, feedback, or reminders for your team..."
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  These notes are for internal use only and won't be published
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPost(null);
                    setContent('');
                    setTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 4. Content Library Component
 */
function ContentLibrary({ brainId, onEditPost }) {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brainId, statusFilter, sortBy]);

  const loadPosts = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('posts')
        .select('*')
        .eq('brain_id', brainId);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply sorting
      const ascending = !sortBy.startsWith('-');
      const column = sortBy.replace('-', '');
      query = query.order(column, { ascending });

      const { data, error } = await query;
      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Load posts error:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post deleted successfully');
      loadPosts();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
    }
  };

  // Filter posts by search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;

    const query = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.title?.toLowerCase().includes(query) ||
      post.primary_keyword?.toLowerCase().includes(query) ||
      post.secondary_keywords?.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  // Paginate posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusFilterLibrary">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Needs Review">Needs Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Newest First</SelectItem>
                  <SelectItem value="created_at">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="-title">Title Z-A</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
          <CardDescription>
            Manage your published and draft content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : paginatedPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No posts found</p>
              <p className="text-sm">Create your first article in the "Write Article" tab</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedPosts.map((post) => (
                <Card key={post.id} className="hover:border-primary/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold truncate">{post.title}</h3>
                          {post.ai_generated ? (
                            <Bot className="w-4 h-4 text-primary flex-shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant={getStatusVariant(post.status)}>
                            {post.status}
                          </Badge>

                          {post.primary_keyword && (
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {post.primary_keyword}
                            </span>
                          )}

                          <span>{countWords(post.content || '')} words</span>

                          {post.scheduled_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.scheduled_date).toLocaleDateString()}
                            </span>
                          )}

                          <span>
                            Created {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Store post ID for editor
                            localStorage.setItem('editPostId', post.id);
                            onEditPost();
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
