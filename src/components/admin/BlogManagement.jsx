/**
 * BLOG MANAGEMENT ADMIN COMPONENT
 *
 * Complete admin interface for the Next-Gen Blog System:
 * - Content Idea Queue
 * - Draft Pipeline Dashboard
 * - QA Results Viewer
 * - Publishing Queue
 * - Performance Monitor
 * - Universal Content Mode management
 */

import { useState, useEffect } from 'react';
import {
  InternalKnowledge,
  ContentIdeas,
  BlogDrafts,
  Publishing,
  Monitoring,
  SystemConfig
} from '@/lib/blog-system/api';
import { supabaseAdmin } from '@/lib/supabase-client';

export default function BlogManagement() {
  const [activeTab, setActiveTab] = useState('ideas');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [ideasData, draftsData, publishedData] = await Promise.all([
        supabaseAdmin.from('content_ideas').select('status', { count: 'exact', head: true }),
        supabaseAdmin.from('blog_drafts').select('pipeline_stage', { count: 'exact', head: true }),
        supabaseAdmin.from('published_articles').select('status', { count: 'exact', head: true })
      ]);

      setStats({
        totalIdeas: ideasData.count || 0,
        totalDrafts: draftsData.count || 0,
        totalPublished: publishedData.count || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  return (
    <div className="blog-management">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Next-Gen Blog System</h1>
        <p className="text-gray-600">
          AI-powered blog creation with Google compliance and Universal Content Mode
        </p>
      </header>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Content Ideas"
            value={stats.totalIdeas}
            subtitle="Pending approval"
            icon="💡"
          />
          <StatCard
            title="Drafts in Progress"
            value={stats.totalDrafts}
            subtitle="Various pipeline stages"
            icon="✍️"
          />
          <StatCard
            title="Published Articles"
            value={stats.totalPublished}
            subtitle="Live on site"
            icon="🚀"
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tabs border-b border-gray-200 mb-6">
        <div className="flex space-x-4">
          <TabButton
            label="Ideas Queue"
            active={activeTab === 'ideas'}
            onClick={() => setActiveTab('ideas')}
          />
          <TabButton
            label="Draft Pipeline"
            active={activeTab === 'pipeline'}
            onClick={() => setActiveTab('pipeline')}
          />
          <TabButton
            label="Publishing Queue"
            active={activeTab === 'publishing'}
            onClick={() => setActiveTab('publishing')}
          />
          <TabButton
            label="Performance"
            active={activeTab === 'performance'}
            onClick={() => setActiveTab('performance')}
          />
          <TabButton
            label="Universal Mode"
            active={activeTab === 'universal'}
            onClick={() => setActiveTab('universal')}
          />
          <TabButton
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'ideas' && <IdeasQueue onRefresh={loadStats} />}
        {activeTab === 'pipeline' && <PipelineDashboard onRefresh={loadStats} />}
        {activeTab === 'publishing' && <PublishingQueue onRefresh={loadStats} />}
        {activeTab === 'performance' && <PerformanceMonitor />}
        {activeTab === 'universal' && <UniversalContentMode />}
        {activeTab === 'settings' && <BlogSystemSettings />}
      </div>
    </div>
  );
}

// ============================================================================
// IDEAS QUEUE
// ============================================================================

function IdeasQueue({ onRefresh }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    setLoading(true);
    try {
      const data = await ContentIdeas.getPending(50);
      setIdeas(data);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateIdeas(count) {
    setGenerating(true);
    try {
      const result = await ContentIdeas.generate(count);
      alert(`✅ Generated ${result.length} new content ideas!`);
      await loadIdeas();
      onRefresh();
    } catch (error) {
      alert(`❌ Failed to generate ideas: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  }

  async function approveIdea(ideaId) {
    try {
      await ContentIdeas.approve(ideaId);
      alert('✅ Idea approved and moved to drafting queue');
      await loadIdeas();
      onRefresh();
    } catch (error) {
      alert(`❌ Failed to approve: ${error.message}`);
    }
  }

  return (
    <div className="ideas-queue">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Content Ideas Queue</h2>
        <div className="space-x-2">
          <button
            onClick={() => generateIdeas(20)}
            disabled={generating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : '🤖 Generate 20 Ideas'}
          </button>
          <button
            onClick={loadIdeas}
            disabled={loading}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading ideas...</div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No pending ideas. Click "Generate Ideas" to create new content suggestions.
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} onApprove={approveIdea} />
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea, onApprove }) {
  return (
    <div className="border rounded-lg p-4 hover:border-blue-500 transition">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{idea.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{idea.description}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {idea.content_type}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              {idea.source_type}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Priority: {idea.priority}
            </span>
            {idea.search_volume > 0 && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                {idea.search_volume.toLocaleString()} searches/mo
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onApprove(idea.id)}
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
        >
          ✓ Approve & Draft
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PIPELINE DASHBOARD
// ============================================================================

function PipelineDashboard({ onRefresh }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState('all');

  const stages = [
    { value: 'all', label: 'All Stages' },
    { value: 'planning', label: 'Planning' },
    { value: 'drafting', label: 'Drafting' },
    { value: 'qa_fact_check', label: 'QA: Fact Check' },
    { value: 'qa_grammar', label: 'QA: Grammar' },
    { value: 'ready_to_publish', label: 'Ready to Publish' },
    { value: 'failed', label: 'Failed' }
  ];

  useEffect(() => {
    loadDrafts();
  }, [selectedStage]);

  async function loadDrafts() {
    setLoading(true);
    try {
      if (selectedStage === 'all') {
        const { data } = await supabaseAdmin
          .from('blog_drafts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        setDrafts(data || []);
      } else {
        const data = await BlogDrafts.getByStage(selectedStage, 50);
        setDrafts(data);
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function runQA(draftId) {
    try {
      const result = await BlogDrafts.runQA(draftId);
      alert(result.passed ? '✅ QA Passed!' : '⚠️ QA Issues Found - Check details');
      await loadDrafts();
      onRefresh();
    } catch (error) {
      alert(`❌ QA Failed: ${error.message}`);
    }
  }

  return (
    <div className="pipeline-dashboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Draft Pipeline</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {stages.map(stage => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadDrafts}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading drafts...</div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No drafts in this stage</div>
      ) : (
        <div className="space-y-4">
          {drafts.map(draft => (
            <DraftCard key={draft.id} draft={draft} onRunQA={runQA} />
          ))}
        </div>
      )}
    </div>
  );
}

function DraftCard({ draft, onRunQA }) {
  const stageColors = {
    planning: 'bg-gray-100 text-gray-800',
    drafting: 'bg-blue-100 text-blue-800',
    qa_fact_check: 'bg-yellow-100 text-yellow-800',
    qa_grammar: 'bg-yellow-100 text-yellow-800',
    ready_to_publish: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{draft.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{draft.excerpt}</p>
          <div className="flex flex-wrap gap-2 text-xs mb-2">
            <span className={`px-2 py-1 rounded ${stageColors[draft.pipeline_stage] || 'bg-gray-100'}`}>
              {draft.pipeline_stage.replace(/_/g, ' ').toUpperCase()}
            </span>
            {draft.qa_passed && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓ QA Passed</span>
            )}
            {draft.target_keyword && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                KW: {draft.target_keyword}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Created: {new Date(draft.created_at).toLocaleDateString()}
            {draft.last_qa_run && ` • Last QA: ${new Date(draft.last_qa_run).toLocaleDateString()}`}
          </div>
        </div>
        <div className="ml-4 space-x-2">
          <button
            onClick={() => onRunQA(draft.id)}
            className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm"
          >
            Run QA
          </button>
          <button
            onClick={() => window.open(`/admin/secret/blog/draft/${draft.id}`, '_blank')}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            View
          </button>
        </div>
      </div>

      {draft.qa_issues && draft.qa_issues.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 rounded text-xs">
          <strong>Issues:</strong> {draft.qa_issues.join(', ')}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PUBLISHING QUEUE
// ============================================================================

function PublishingQueue({ onRefresh }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(null);

  useEffect(() => {
    loadReadyDrafts();
  }, []);

  async function loadReadyDrafts() {
    setLoading(true);
    try {
      const data = await BlogDrafts.getByStage('ready_to_publish', 50);
      setDrafts(data);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function publishDraft(draftId) {
    setPublishing(draftId);
    try {
      const result = await Publishing.publishDraft(draftId);
      alert(`✅ Published! URL: ${result.url}`);
      await loadReadyDrafts();
      onRefresh();
    } catch (error) {
      alert(`❌ Publishing failed: ${error.message}`);
    } finally {
      setPublishing(null);
    }
  }

  return (
    <div className="publishing-queue">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Publishing Queue</h2>
        <button
          onClick={loadReadyDrafts}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No drafts ready to publish. Complete QA checks first.
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map(draft => (
            <div key={draft.id} className="border rounded-lg p-4 bg-green-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{draft.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{draft.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-green-600 text-white px-2 py-1 rounded">✓ QA Passed</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {draft.target_keyword}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => publishDraft(draft.id)}
                  disabled={publishing === draft.id}
                  className="ml-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {publishing === draft.id ? '⏳ Publishing...' : '🚀 Publish Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

function PerformanceMonitor() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPublishedArticles();
  }, []);

  async function loadPublishedArticles() {
    setLoading(true);
    try {
      const data = await Publishing.getRecent(50);
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="performance-monitor">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Performance Monitor</h2>
        <button
          onClick={loadPublishedArticles}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No published articles yet</div>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <ArticlePerformanceCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticlePerformanceCard({ article }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{article.title}</h3>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm hover:underline"
          >
            {article.url}
          </a>
          <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
            <div>
              <div className="text-gray-500">Impressions</div>
              <div className="font-semibold">{article.total_impressions?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div className="text-gray-500">Clicks</div>
              <div className="font-semibold">{article.total_clicks?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div className="text-gray-500">CTR</div>
              <div className="font-semibold">
                {article.avg_ctr ? `${(article.avg_ctr * 100).toFixed(2)}%` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Avg Position</div>
              <div className="font-semibold">{article.avg_position?.toFixed(1) || 'N/A'}</div>
            </div>
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className={`px-2 py-1 rounded ${
              article.compliance_status === 'compliant'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {article.compliance_status}
            </span>
            <span className="text-gray-500">
              Published: {new Date(article.published_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UNIVERSAL CONTENT MODE
// ============================================================================

function UniversalContentMode() {
  return (
    <div className="universal-content-mode">
      <h2 className="text-2xl font-semibold mb-6">Universal Content Mode</h2>
      <p className="text-gray-600 mb-6">
        Manage internal knowledge, case studies, methodologies, and tools that power
        self-sufficient content generation.
      </p>

      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">📚 Internal Knowledge</h3>
          <p className="text-sm text-gray-600 mb-3">Current work, roadmap, and expertise</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Manage Knowledge Base
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎯 Case Studies</h3>
          <p className="text-sm text-gray-600 mb-3">Client success stories and results</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Manage Case Studies
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎨 Methodologies</h3>
          <p className="text-sm text-gray-600 mb-3">Vibe Marketing and other frameworks</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Manage Methodologies
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🛠️ AI Marketing Tools</h3>
          <p className="text-sm text-gray-600 mb-3">Tools database and auto-discovery</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Manage Tools Database
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BLOG SYSTEM SETTINGS
// ============================================================================

function BlogSystemSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const [rateLimit, qaThresholds, contentSafety] = await Promise.all([
        SystemConfig.get('publishing_rate_limits'),
        SystemConfig.get('qa_thresholds'),
        SystemConfig.get('content_safety')
      ]);

      setConfig({ rateLimit, qaThresholds, contentSafety });
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div className="blog-system-settings">
      <h2 className="text-2xl font-semibold mb-6">Blog System Settings</h2>

      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Publishing Rate Limits</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-gray-600">Daily Limit</label>
              <div className="font-semibold text-lg">{config?.rateLimit.daily}</div>
            </div>
            <div>
              <label className="text-gray-600">Weekly Limit</label>
              <div className="font-semibold text-lg">{config?.rateLimit.weekly}</div>
            </div>
            <div>
              <label className="text-gray-600">Monthly Limit</label>
              <div className="font-semibold text-lg">{config?.rateLimit.monthly}</div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">QA Thresholds</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Fact Check:</span>
              <span className="font-semibold">{config?.qaThresholds.fact_check}</span>
            </div>
            <div className="flex justify-between">
              <span>Grammar:</span>
              <span className="font-semibold">{config?.qaThresholds.grammar}</span>
            </div>
            <div className="flex justify-between">
              <span>Toxicity (max):</span>
              <span className="font-semibold">{config?.qaThresholds.toxicity}</span>
            </div>
            <div className="flex justify-between">
              <span>Plagiarism (max):</span>
              <span className="font-semibold">{config?.qaThresholds.plagiarism}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Content Safety</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Require AI Disclosure:</span>
              <span className="font-semibold">
                {config?.contentSafety.require_ai_disclosure ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Require Citations:</span>
              <span className="font-semibold">
                {config?.contentSafety.require_citations ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Min Original Content:</span>
              <span className="font-semibold">
                {(config?.contentSafety.min_original_content * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium transition border-b-2 ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}
