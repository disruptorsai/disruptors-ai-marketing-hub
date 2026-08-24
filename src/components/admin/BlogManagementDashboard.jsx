import { useState } from 'react';
import { FileText, Search, Edit, Plus, Eye, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KeywordResearch from './KeywordResearch';
import BlogPostGenerator from './BlogPostGenerator';
import BlogPostEditor from './BlogPostEditor';

/**
 * BlogManagementDashboard Component
 *
 * Comprehensive blog management interface with:
 * - Keyword research tab
 * - Generate new posts
 * - Manage existing posts
 * - Edit individual posts
 *
 * Workflow:
 * 1. Research keywords
 * 2. Select keywords
 * 3. Generate blog post
 * 4. Review and save
 * 5. Edit later as needed
 */
export default function BlogManagementDashboard() {
  const [activeTab, setActiveTab] = useState('research');
  const [selectedKeywords, setSelectedKeywords] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);

  /**
   * Handle keywords selected from research
   */
  const handleKeywordsSelected = (keywords) => {
    setSelectedKeywords(keywords);
    setActiveTab('generate');
  };

  /**
   * Handle post saved
   */
  const handlePostSaved = (post) => {
    console.log('Post saved:', post);
    setSelectedKeywords(null);
    setActiveTab('manage');
  };

  /**
   * Handle post deleted
   */
  const handlePostDeleted = (postId) => {
    console.log('Post deleted:', postId);
    setEditingPostId(null);
    setActiveTab('manage');
  };

  /**
   * Start editing a post
   */
  const startEditing = (postId) => {
    setEditingPostId(postId);
    setActiveTab('edit');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Blog Management Dashboard
          </CardTitle>
          <CardDescription>
            Research keywords, generate AI-powered blog posts, and manage your content
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="research" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Keyword Research
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Generate Post
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Manage Posts
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!editingPostId}>
            <Edit className="w-4 h-4" />
            Edit Post
          </TabsTrigger>
        </TabsList>

        {/* Keyword Research Tab */}
        <TabsContent value="research">
          <KeywordResearch onKeywordsSelected={handleKeywordsSelected} />
        </TabsContent>

        {/* Generate Post Tab */}
        <TabsContent value="generate">
          <BlogPostGenerator
            initialKeywords={selectedKeywords}
            onSaved={handlePostSaved}
          />
        </TabsContent>

        {/* Manage Posts Tab */}
        <TabsContent value="manage">
          <PostsList onEdit={startEditing} />
        </TabsContent>

        {/* Edit Post Tab */}
        <TabsContent value="edit">
          {editingPostId && (
            <BlogPostEditor
              postId={editingPostId}
              onSaved={handlePostSaved}
              onDeleted={handlePostDeleted}
              onCancel={() => {
                setEditingPostId(null);
                setActiveTab('manage');
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * PostsList Component
 * Display and manage existing blog posts
 */
function PostsList({ onEdit }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load posts on mount
  useState(() => {
    const loadPosts = async () => {
      try {
        const { customSDK } = await import('@/lib/custom-sdk');
        const allPosts = await customSDK.list('posts');
        setPosts(allPosts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          Loading posts...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
            Error loading posts: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by researching keywords and generating your first blog post
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {post.excerpt || post.content?.substring(0, 150) + '...'}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {post.primary_keyword && (
                    <span className="flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      {post.primary_keyword}
                    </span>
                  )}
                  <span>{post.status}</span>
                  {post.created_at && (
                    <span>
                      Created {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(post.id)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
