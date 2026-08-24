import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  User,
  Calendar,
  Tag,
  FileText,
  Zap,
  Sparkles,
  Upload,
  FileImage,
  Image as ImageIcon,
  Loader2,
  Cpu,
  Brain,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabaseAdmin } from '@/lib/supabase-client';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Convert PDF to images (one image per page)
 * Returns array of base64 image strings
 */
async function convertPdfToImages(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images = [];

  // Convert first 5 pages max (to avoid huge requests)
  const numPages = Math.min(pdf.numPages, 5);

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page to canvas
    await page.render({ canvasContext: context, viewport }).promise;

    // Convert canvas to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    images.push(imageData.split(',')[1]); // Remove data:image/jpeg;base64, prefix
  }

  return images;
}

/**
 * ChangeRequestsManager Component
 * Tracks all website change requests with full lifecycle management
 */
const ChangeRequestsManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    requester_name: '',
    requester_email: '',
    change_description: '',
    priority: 'medium',
    category: 'other'
  });

  // AI Analyzer state
  const [aiAnalyzerData, setAIAnalyzerData] = useState({
    requester_name: '',
    requester_email: '',
    input_method: 'text', // 'text', 'image', 'pdf'
    text_content: '',
    uploaded_file: null,
    file_preview: null
  });
  const [aiAnalyzing, setAIAnalyzing] = useState(false);
  const [aiAnalysisResult, setAIAnalysisResult] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('change_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);

      // Calculate stats
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        approved: data?.filter(r => r.status === 'approved').length || 0,
        inProgress: data?.filter(r => r.status === 'in_progress').length || 0,
        completed: data?.filter(r => r.status === 'completed').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading change requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.requester_name.trim() || !formData.change_description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('change_requests')
        .insert([{
          ...formData,
          status: 'pending'
        }])
        .select();

      if (error) throw error;

      // Reset form and refresh
      setFormData({
        requester_name: '',
        requester_email: '',
        change_description: '',
        priority: 'medium',
        category: 'other'
      });
      setShowForm(false);
      loadRequests();

      alert('Change request submitted successfully!');
    } catch (error) {
      console.error('Error submitting change request:', error);
      alert('Failed to submit change request. Please try again.');
    }
  };

  const updateRequestStatus = async (requestId, newStatus, additionalData = {}) => {
    try {
      const updateData = {
        status: newStatus,
        ...additionalData
      };

      // Add timestamps based on status
      if (newStatus === 'approved' && !additionalData.approved_at) {
        updateData.approved_at = new Date().toISOString();
      }
      if (newStatus === 'completed' && !additionalData.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabaseAdmin
        .from('change_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      loadRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Handle file upload for AI analysis
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG, WebP) or PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAIAnalyzerData({
          ...aiAnalyzerData,
          uploaded_file: file,
          file_preview: reader.result,
          input_method: 'image'
        });
      };
      reader.readAsDataURL(file);
    } else {
      // PDF - convert to images client-side
      setAIAnalyzerData({
        ...aiAnalyzerData,
        uploaded_file: file,
        file_preview: null,
        input_method: 'pdf'
      });
    }
  };

  // Handle AI analysis submission
  const handleAIAnalysis = async () => {
    // Validation
    if (!aiAnalyzerData.requester_name.trim()) {
      alert('Please enter the team member name');
      return;
    }

    if (aiAnalyzerData.input_method === 'text' && !aiAnalyzerData.text_content.trim()) {
      alert('Please enter or paste the change request text');
      return;
    }

    if ((aiAnalyzerData.input_method === 'image' || aiAnalyzerData.input_method === 'pdf') && !aiAnalyzerData.uploaded_file) {
      alert('Please upload a file');
      return;
    }

    setAIAnalyzing(true);
    setAIAnalysisResult(null);

    try {
      let content;
      let sourceType = aiAnalyzerData.input_method;

      if (sourceType === 'text') {
        content = aiAnalyzerData.text_content;
      } else if (sourceType === 'pdf') {
        // Convert PDF to images client-side
        console.log('🔄 Converting PDF to images...');
        const images = await convertPdfToImages(aiAnalyzerData.uploaded_file);
        console.log(`✅ Converted PDF to ${images.length} image(s)`);

        // Use first page image for analysis (GPT-4 Vision will analyze it)
        content = images[0];
        sourceType = 'image'; // Change to image since we're sending an image
      } else {
        // Convert image file to base64
        const reader = new FileReader();
        content = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(aiAnalyzerData.uploaded_file);
        });
      }

      // Call Netlify function
      const response = await fetch('/.netlify/functions/change-request-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterName: aiAnalyzerData.requester_name,
          requesterEmail: aiAnalyzerData.requester_email,
          sourceType,
          content
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Show success result
      setAIAnalysisResult(result);

      // Reset form
      setAIAnalyzerData({
        requester_name: '',
        requester_email: '',
        input_method: 'text',
        text_content: '',
        uploaded_file: null,
        file_preview: null
      });

      // Reload requests to show new ones
      loadRequests();

      alert(`Success! Created ${result.requestsCreated} change request(s)`);
    } catch (error) {
      console.error('AI analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setAIAnalyzing(false);
    }
  };

  const exportToCSV = () => {
    if (!requests || requests.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'ID',
      'Requester Name',
      'Requester Email',
      'Description',
      'Status',
      'Priority',
      'Category',
      'Notes',
      'Approved By',
      'Completed By',
      'Created At',
      'Updated At',
      'Approved At',
      'Completed At'
    ];

    const csvContent = [
      headers.join(','),
      ...requests.map(req => [
        req.id,
        `"${req.requester_name}"`,
        req.requester_email || '',
        `"${req.change_description.replace(/"/g, '""')}"`,
        req.status,
        req.priority,
        req.category,
        req.notes ? `"${req.notes.replace(/"/g, '""')}"` : '',
        req.approved_by || '',
        req.completed_by || '',
        req.created_at,
        req.updated_at,
        req.approved_at || '',
        req.completed_at || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `change_requests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterRequests = () => {
    let filtered = requests;

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(req => req.priority === filterPriority);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(req => req.category === filterCategory);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.requester_name.toLowerCase().includes(search) ||
        req.change_description.toLowerCase().includes(search) ||
        (req.requester_email && req.requester_email.toLowerCase().includes(search)) ||
        (req.notes && req.notes.toLowerCase().includes(search))
      );
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: Clock },
      approved: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CheckCircle },
      in_progress: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Zap },
      completed: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Check },
      rejected: { color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: XCircle }
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      urgent: 'bg-red-500/10 text-red-400 border-red-500/30'
    };

    return (
      <Badge variant="outline" className={colors[priority] || colors.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = {
      bug_fix: 'bg-red-500/10 text-red-400 border-red-500/30',
      feature: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      content_change: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      design_change: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      performance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      security: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      other: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    };

    return (
      <Badge variant="outline" className={colors[category] || colors.other}>
        {category.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getAutomationBadge = (feasibility, confidence) => {
    const config = {
      fully_automatable: {
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: Cpu,
        label: 'Fully Automatable'
      },
      partially_automatable: {
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        icon: Brain,
        label: 'Partially Automatable'
      },
      manual_required: {
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: User,
        label: 'Manual Required'
      },
      external_required: {
        color: 'bg-red-500/10 text-red-400 border-red-500/30',
        icon: AlertCircle,
        label: 'External Required'
      },
      not_analyzed: {
        color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        icon: Clock,
        label: 'Not Analyzed'
      }
    };

    const { color, icon: Icon, label } = config[feasibility] || config.not_analyzed;

    return (
      <Badge variant="outline" className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
        {confidence && (
          <span className="ml-1 text-xs opacity-70">
            ({Math.round(confidence * 100)}%)
          </span>
        )}
      </Badge>
    );
  };

  // Analyze automation feasibility for a request
  const analyzeAutomation = async (requestId) => {
    try {
      const response = await fetch('/.netlify/functions/change-request-automation-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Reload requests to show updated automation status
      loadRequests();

      return result;
    } catch (error) {
      console.error('Automation analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
    }
  };

  // Analyze all pending requests
  const analyzeAllPending = async () => {
    const pendingIds = requests
      .filter(r => r.status === 'pending' && r.automation_feasibility === 'not_analyzed')
      .map(r => r.id);

    if (pendingIds.length === 0) {
      alert('No pending requests to analyze');
      return;
    }

    if (!confirm(`Analyze ${pendingIds.length} pending request(s)?`)) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/change-request-automation-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestIds: pendingIds })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Batch analysis failed');
      }

      alert(`Analyzed ${result.analyzed} request(s) successfully!`);
      loadRequests();
    } catch (error) {
      console.error('Batch automation analysis error:', error);
      alert(`Batch analysis failed: ${error.message}`);
    }
  };

  const filteredRequests = filterRequests();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-white/70">Loading change requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Change Requests</h2>
          <p className="text-white/60">Track and manage all website change requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={loadRequests}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={analyzeAllPending}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
          >
            <Brain className="w-4 h-4 mr-2" />
            Analyze Automation
          </Button>
          <Button
            onClick={() => setShowAIAnalyzer(!showAIAnalyzer)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Analyzer
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border-slate-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-white/50 mt-1">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
            <p className="text-xs text-white/50 mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{stats.approved}</div>
            <p className="text-xs text-white/50 mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
            <p className="text-xs text-white/50 mt-1">In Progress</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{stats.completed}</div>
            <p className="text-xs text-white/50 mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{stats.rejected}</div>
            <p className="text-xs text-white/50 mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* New Request Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Submit New Change Request</CardTitle>
                <CardDescription className="text-white/60">
                  All fields marked with * are required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Your Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.requester_name}
                        onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                        placeholder="John Doe"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Your Email (optional)
                      </label>
                      <Input
                        type="email"
                        value={formData.requester_email}
                        onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                        placeholder="john@example.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Change Description *
                    </label>
                    <Textarea
                      value={formData.change_description}
                      onChange={(e) => setFormData({ ...formData, change_description: e.target.value })}
                      placeholder="Describe the change you need in detail..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Priority
                      </label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Category
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                          <SelectItem value="bug_fix">Bug Fix</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="content_change">Content Change</SelectItem>
                          <SelectItem value="design_change">Design Change</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowForm(false)}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    >
                      Submit Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Analyzer Form */}
      <AnimatePresence>
        {showAIAnalyzer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <span>AI-Powered Change Request Analyzer</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        GPT-4 Vision
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Upload documents, paste text, or upload images/PDFs containing change requests.
                      AI will automatically extract and create structured change requests with tasks.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Team Member Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Team Member Name *
                      </label>
                      <Input
                        type="text"
                        value={aiAnalyzerData.requester_name}
                        onChange={(e) => setAIAnalyzerData({ ...aiAnalyzerData, requester_name: e.target.value })}
                        placeholder="John Doe"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        disabled={aiAnalyzing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Email (optional)
                      </label>
                      <Input
                        type="email"
                        value={aiAnalyzerData.requester_email}
                        onChange={(e) => setAIAnalyzerData({ ...aiAnalyzerData, requester_email: e.target.value })}
                        placeholder="john@example.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        disabled={aiAnalyzing}
                      />
                    </div>
                  </div>

                  {/* Input Method Tabs */}
                  <Tabs
                    value={aiAnalyzerData.input_method}
                    onValueChange={(value) => setAIAnalyzerData({
                      ...aiAnalyzerData,
                      input_method: value,
                      text_content: '',
                      uploaded_file: null,
                      file_preview: null
                    })}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 bg-white/5">
                      <TabsTrigger value="text" disabled={aiAnalyzing}>
                        <FileText className="w-4 h-4 mr-2" />
                        Paste Text
                      </TabsTrigger>
                      <TabsTrigger value="image" disabled={aiAnalyzing}>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload Image
                      </TabsTrigger>
                      <TabsTrigger value="pdf" disabled={aiAnalyzing}>
                        <FileImage className="w-4 h-4 mr-2" />
                        Upload PDF
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="mt-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Paste Change Requests *
                        </label>
                        <Textarea
                          value={aiAnalyzerData.text_content}
                          onChange={(e) => setAIAnalyzerData({ ...aiAnalyzerData, text_content: e.target.value })}
                          placeholder="Paste your change requests here. Include all details like:&#10;&#10;- Fix the contact form validation&#10;- Update hero section with new copy&#10;- Add new testimonial slider&#10;&#10;The AI will automatically categorize and prioritize each request."
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[200px]"
                          disabled={aiAnalyzing}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Upload Image (Screenshots, Mockups, etc.) *
                          </label>
                          <div className="flex items-center space-x-4">
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg,image/webp"
                              onChange={handleFileUpload}
                              className="bg-white/5 border-white/10 text-white file:bg-purple-500/20 file:text-purple-300 file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                              disabled={aiAnalyzing}
                            />
                          </div>
                          <p className="text-xs text-white/50 mt-2">
                            Supported: JPEG, PNG, WebP (max 10MB)
                          </p>
                        </div>
                        {aiAnalyzerData.file_preview && (
                          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                            <p className="text-sm text-white/70 mb-2">Preview:</p>
                            <img
                              src={aiAnalyzerData.file_preview}
                              alt="Upload preview"
                              className="max-w-full max-h-64 rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="pdf" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Upload PDF Document *
                          </label>
                          <div className="flex items-center space-x-4">
                            <Input
                              type="file"
                              accept="application/pdf"
                              onChange={handleFileUpload}
                              className="bg-white/5 border-white/10 text-white file:bg-purple-500/20 file:text-purple-300 file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                              disabled={aiAnalyzing}
                            />
                          </div>
                          <p className="text-xs text-white/50 mt-2">
                            PDF files will be converted to text for analysis (max 10MB)
                          </p>
                        </div>
                        {aiAnalyzerData.uploaded_file && (
                          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                            <FileImage className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                            <p className="text-sm text-white/70 text-center">
                              {aiAnalyzerData.uploaded_file.name}
                            </p>
                            <p className="text-xs text-white/50 text-center mt-1">
                              {(aiAnalyzerData.uploaded_file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* AI Analysis Info Box */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      How AI Analysis Works
                    </h4>
                    <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
                      <li>AI extracts individual change requests from your content</li>
                      <li>Automatically categorizes (bug fix, feature, design, etc.)</li>
                      <li>Assigns priority based on urgency keywords</li>
                      <li>Creates detailed task breakdowns for complex requests</li>
                      <li>All requests are created with "pending" status for review</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAIAnalyzer(false);
                        setAIAnalyzerData({
                          requester_name: '',
                          requester_email: '',
                          input_method: 'text',
                          text_content: '',
                          uploaded_file: null,
                          file_preview: null
                        });
                      }}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      disabled={aiAnalyzing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAIAnalysis}
                      disabled={aiAnalyzing}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {aiAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze & Create Requests
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bug_fix">Bug Fix</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="content_change">Content Change</SelectItem>
                <SelectItem value="design_change">Design Change</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Change Requests ({filteredRequests.length})
            </h3>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-white/70 font-medium">Requester</th>
                  <th className="text-left p-3 text-white/70 font-medium">Description</th>
                  <th className="text-left p-3 text-white/70 font-medium">Status</th>
                  <th className="text-left p-3 text-white/70 font-medium">Priority</th>
                  <th className="text-left p-3 text-white/70 font-medium">Category</th>
                  <th className="text-left p-3 text-white/70 font-medium">Automation</th>
                  <th className="text-left p-3 text-white/70 font-medium">Created</th>
                  <th className="text-left p-3 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-emerald-400" />
                          <span className="text-white font-medium">{request.requester_name}</span>
                        </div>
                        {request.requester_email && (
                          <span className="text-xs text-white/50">{request.requester_email}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 max-w-md">
                      <p className="text-white/70 line-clamp-2" title={request.change_description}>
                        {request.change_description}
                      </p>
                    </td>
                    <td className="p-3">{getStatusBadge(request.status)}</td>
                    <td className="p-3">{getPriorityBadge(request.priority)}</td>
                    <td className="p-3">{getCategoryBadge(request.category)}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {getAutomationBadge(
                          request.automation_feasibility || 'not_analyzed',
                          request.automation_confidence
                        )}
                        {request.automation_feasibility === 'not_analyzed' && (
                          <Button
                            onClick={() => analyzeAutomation(request.id)}
                            size="sm"
                            variant="outline"
                            className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 h-6 text-xs px-2"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Analyze
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-white/70 text-sm">{formatDate(request.created_at)}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Select
                          value={request.status}
                          onValueChange={(value) => updateRequestStatus(request.id, value)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No change requests found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangeRequestsManager;
