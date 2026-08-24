import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase-client';
import { Search, Download, Eye, Filter, TrendingUp, Users, BarChart3, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';

/**
 * SEO Audit Tool - Admin Module
 * View all audits, manage leads, track usage analytics
 */
export default function SEOAuditTool() {
  const [activeTab, setActiveTab] = useState('audits'); // audits, leads, analytics
  const [audits, setAudits] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load audits
      const { data: auditsData } = await supabaseAdmin
        .from('seo_audits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setAudits(auditsData || []);

      // Load leads
      const { data: leadsData } = await supabaseAdmin
        .from('seo_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setLeads(leadsData || []);

      // Calculate stats
      calculateStats(auditsData || [], leadsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (auditsData, leadsData) => {
    const total = auditsData.length;
    const completed = auditsData.filter(a => a.status === 'completed').length;
    const processing = auditsData.filter(a => a.status === 'processing').length;
    const failed = auditsData.filter(a => a.status === 'failed').length;

    const publicAudits = auditsData.filter(a => a.source === 'public').length;
    const internalAudits = auditsData.filter(a => a.source === 'internal').length;

    const totalLeads = leadsData.length;
    const newLeads = leadsData.filter(l => l.status === 'new').length;
    const contacted = leadsData.filter(l => l.contacted).length;
    const highInterest = leadsData.filter(l => l.interest_level === 'high').length;

    const avgScore = completed > 0
      ? Math.round(auditsData.filter(a => a.overall_score).reduce((sum, a) => sum + a.overall_score, 0) / completed)
      : 0;

    setStats({
      total,
      completed,
      processing,
      failed,
      publicAudits,
      internalAudits,
      totalLeads,
      newLeads,
      contacted,
      highInterest,
      avgScore,
      conversionRate: publicAudits > 0 ? Math.round((totalLeads / publicAudits) * 100) : 0
    });
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = !searchTerm ||
      audit.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.requester_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || audit.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const filteredLeads = leads.filter(lead => {
    return !searchTerm ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading SEO audit data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SEO Audit Tool</h1>
          <p className="text-gray-400 mt-1">Manage audits, track leads, and monitor performance</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC700] transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Total Audits"
            value={stats.total}
            subtext={`${stats.completed} completed`}
            color="blue"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Leads Captured"
            value={stats.totalLeads}
            subtext={`${stats.newLeads} new leads`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Avg SEO Score"
            value={`${stats.avgScore}/100`}
            subtext={`${stats.highInterest} high interest`}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Conversion Rate"
            value={`${stats.conversionRate}%`}
            subtext={`${stats.publicAudits} public audits`}
            color="purple"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-8">
          <TabButton
            active={activeTab === 'audits'}
            onClick={() => setActiveTab('audits')}
            icon={<BarChart3 className="w-5 h-5" />}
            label="Audits"
            count={audits.length}
          />
          <TabButton
            active={activeTab === 'leads'}
            onClick={() => setActiveTab('leads')}
            icon={<Users className="w-5 h-5" />}
            label="Leads"
            count={leads.length}
          />
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={<TrendingUp className="w-5 h-5" />}
            label="Analytics"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search domains, emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
          />
        </div>

        {activeTab === 'audits' && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
            >
              <option value="all">All Sources</option>
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
          </>
        )}
      </div>

      {/* Content */}
      {activeTab === 'audits' && (
        <AuditsTable audits={filteredAudits} onRefresh={loadData} />
      )}

      {activeTab === 'leads' && (
        <LeadsTable leads={filteredLeads} onRefresh={loadData} />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard stats={stats} audits={audits} leads={leads} />
      )}
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ icon, label, value, subtext, color }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );
}

/**
 * Tab Button Component
 */
function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
        active
          ? 'border-[#FFD700] text-[#FFD700]'
          : 'border-transparent text-gray-400 hover:text-gray-300'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className="px-2 py-0.5 text-xs bg-gray-700 rounded-full">{count}</span>
      )}
    </button>
  );
}

/**
 * Audits Table
 */
function AuditsTable({ audits, onRefresh }) {
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [viewingReport, setViewingReport] = useState(false);

  const viewAudit = async (auditId) => {
    const { data } = await supabaseAdmin
      .from('seo_audits')
      .select('*, seo_audit_sections(*), seo_audit_recommendations(*)')
      .eq('id', auditId)
      .single();

    setSelectedAudit(data);
    setViewingReport(true);
  };

  if (viewingReport && selectedAudit) {
    return (
      <AuditDetailView
        audit={selectedAudit}
        onClose={() => {
          setViewingReport(false);
          setSelectedAudit(null);
        }}
      />
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a] border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Keywords</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {audits.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No audits found
                </td>
              </tr>
            ) : (
              audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-[#0a0a0a] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-white">{audit.domain}</div>
                        {audit.requester_email && (
                          <div className="text-xs text-gray-500">{audit.requester_email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {audit.overall_score ? (
                      <div className="flex items-center">
                        <div className={`text-2xl font-bold ${
                          audit.overall_score >= 70 ? 'text-green-500' :
                          audit.overall_score >= 50 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {audit.overall_score}
                        </div>
                        <div className="text-xs text-gray-500 ml-1">/100</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{audit.ranked_keywords_count || 0}</div>
                    {audit.average_position && (
                      <div className="text-xs text-gray-500">Avg #{audit.average_position.toFixed(1)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={audit.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      audit.source === 'public'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {audit.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(audit.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewAudit(audit.id)}
                      className="text-[#FFD700] hover:text-[#FFC700] flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Leads Table
 */
function LeadsTable({ leads, onRefresh }) {
  const updateLeadStatus = async (leadId, updates) => {
    await supabaseAdmin
      .from('seo_leads')
      .update(updates)
      .eq('id', leadId);

    onRefresh();
  };

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a] border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">SEO Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Interest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {leads.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#0a0a0a] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{lead.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {lead.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${
                      lead.seo_score >= 70 ? 'text-green-500' :
                      lead.seo_score >= 50 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {lead.seo_score}/100
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.critical_issues_count} critical issues
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lead.interest_level === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : lead.interest_level === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {lead.interest_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, { status: e.target.value })}
                      className="px-3 py-1 bg-[#0a0a0a] border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-[#FFD700]"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => updateLeadStatus(lead.id, {
                        contacted: true,
                        contacted_at: new Date().toISOString()
                      })}
                      disabled={lead.contacted}
                      className={`px-3 py-1 rounded ${
                        lead.contacted
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-[#FFD700] text-black hover:bg-[#FFC700]'
                      }`}
                    >
                      {lead.contacted ? 'Contacted' : 'Mark Contacted'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Analytics Dashboard
 */
function AnalyticsDashboard({ stats, audits, leads }) {
  // Calculate time series data for charts
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const auditsByDay = last30Days.map(day => {
    return audits.filter(a => a.created_at?.startsWith(day)).length;
  });

  const leadsByDay = last30Days.map(day => {
    return leads.filter(l => l.created_at?.startsWith(day)).length;
  });

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Audit Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Public</span>
              <span className="text-white font-semibold">{stats.publicAudits}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Internal</span>
              <span className="text-white font-semibold">{stats.internalAudits}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Processing</span>
              <span className="text-yellow-500 font-semibold">{stats.processing}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Failed</span>
              <span className="text-red-500 font-semibold">{stats.failed}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Lead Quality</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">High Interest</span>
              <span className="text-red-400 font-semibold">{stats.highInterest}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">New Leads</span>
              <span className="text-white font-semibold">{stats.newLeads}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Contacted</span>
              <span className="text-green-500 font-semibold">{stats.contacted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Conversion</span>
              <span className="text-[#FFD700] font-semibold">{stats.conversionRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Avg SEO Score</span>
              <span className="text-white font-semibold">{stats.avgScore}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Completed</span>
              <span className="text-green-500 font-semibold">{stats.completed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Success Rate</span>
              <span className="text-white font-semibold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple activity chart */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">30-Day Activity</h3>
        <div className="h-64 flex items-end space-x-1">
          {auditsByDay.map((count, i) => {
            const maxCount = Math.max(...auditsByDay);
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div
                key={i}
                className="flex-1 bg-[#FFD700] rounded-t hover:bg-[#FFC700] transition-all cursor-pointer relative group"
                style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                title={`${last30Days[i]}: ${count} audits`}
              >
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {count} audits
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">Last 30 days</div>
      </div>
    </div>
  );
}

/**
 * Audit Detail View
 */
function AuditDetailView({ audit, onClose }) {
  const downloadReport = () => {
    const blob = new Blob([audit.report_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-${audit.domain}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white flex items-center space-x-2"
        >
          <span>← Back to Audits</span>
        </button>
        <button
          onClick={downloadReport}
          className="px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC700] transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Report</span>
        </button>
      </div>

      {/* Audit Overview */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{audit.domain}</h2>
            <p className="text-gray-400 mt-1">
              Created {new Date(audit.created_at).toLocaleDateString()} at {new Date(audit.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${
              audit.overall_score >= 70 ? 'text-green-500' :
              audit.overall_score >= 50 ? 'text-yellow-500' :
              'text-red-500'
            }`}>
              {audit.overall_score}
            </div>
            <div className="text-sm text-gray-400">Overall Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-sm text-gray-400">Keywords</div>
            <div className="text-2xl font-bold text-white">{audit.ranked_keywords_count || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Avg Position</div>
            <div className="text-2xl font-bold text-white">
              #{audit.average_position?.toFixed(1) || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Traffic</div>
            <div className="text-2xl font-bold text-white">{audit.organic_traffic_estimate || 0}/mo</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Critical Issues</div>
            <div className="text-2xl font-bold text-red-500">{audit.critical_issues_count || 0}</div>
          </div>
        </div>
      </div>

      {/* Sections Scores */}
      {audit.seo_audit_sections && audit.seo_audit_sections.length > 0 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Section Scores</h3>
          <div className="space-y-3">
            {audit.seo_audit_sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between">
                <span className="text-gray-300">{section.section_title}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        section.score >= 7 ? 'bg-green-500' :
                        section.score >= 5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(section.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold w-12 text-right">{section.score}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {audit.seo_audit_recommendations && audit.seo_audit_recommendations.length > 0 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
          <div className="space-y-4">
            {audit.seo_audit_recommendations.slice(0, 10).map((rec) => (
              <div key={rec.id} className="border-l-4 border-[#FFD700] pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{rec.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="text-xs text-gray-500">{rec.estimated_time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Report */}
      {audit.report_markdown && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Full Report Preview</h3>
          <div className="bg-[#0a0a0a] border border-gray-700 rounded p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {audit.report_markdown.substring(0, 2000)}...
            </pre>
          </div>
          <button
            onClick={downloadReport}
            className="mt-4 text-[#FFD700] hover:text-[#FFC700] flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download full report</span>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-green-500/20 text-green-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
    pending: 'bg-gray-500/20 text-gray-400'
  };

  const icons = {
    completed: <CheckCircle className="w-3 h-3" />,
    processing: <Clock className="w-3 h-3 animate-spin" />,
    failed: <AlertCircle className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 inline-flex ${styles[status]}`}>
      {icons[status]}
      <span className="capitalize">{status}</span>
    </span>
  );
}
