import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabaseAdmin } from '@/lib/supabase-client';

/**
 * SubmissionsManager Component
 * Comprehensive view of all lead captures, form submissions, and event signups
 */
const SubmissionsManager = () => {
  const [leadCaptures, setLeadCaptures] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [leadAccesses, setLeadAccesses] = useState([]);
  const [eventCheckins, setEventCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalContacts: 0,
    totalAccesses: 0,
    totalEventCheckins: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load lead captures (event signups)
      const { data: captures, error: capturesError } = await supabaseAdmin
        .from('lead_captures')
        .select('*')
        .order('captured_at', { ascending: false });

      if (capturesError) throw capturesError;

      // Load contact submissions
      const { data: contacts, error: contactsError } = await supabaseAdmin
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;

      // Load lead accesses
      const { data: accesses, error: accessesError } = await supabaseAdmin
        .from('lead_accesses')
        .select('*')
        .order('accessed_at', { ascending: false });

      if (accessesError) throw accessesError;

      // Load event check-ins
      const { data: checkins, error: checkinsError } = await supabaseAdmin
        .from('event_checkins')
        .select('*')
        .order('checked_in_at', { ascending: false });

      if (checkinsError && checkinsError.code !== 'PGRST116') {
        // Ignore table not found error, just log it
        console.warn('Event check-ins table not found - migration may not be applied yet');
      }

      setLeadCaptures(captures || []);
      setContactSubmissions(contacts || []);
      setLeadAccesses(accesses || []);
      setEventCheckins(checkins || []);

      // Calculate stats
      const totalLeads = (captures || []).length;
      const totalAccesses = (accesses || []).length;
      const conversionRate = totalLeads > 0 ? ((totalAccesses / totalLeads) * 100).toFixed(1) : 0;

      setStats({
        totalLeads,
        totalContacts: (contacts || []).length,
        totalAccesses,
        totalEventCheckins: (checkins || []).length,
        conversionRate
      });

    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get all unique keys from the data
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Handle arrays and objects
          if (Array.isArray(value)) return `"${value.join('; ')}"`;
          if (typeof value === 'object' && value !== null) return `"${JSON.stringify(value)}"`;
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterData = (data, emailField = 'email') => {
    if (!searchTerm) return data;

    return data.filter(item => {
      const email = item[emailField]?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      // Search in all string fields
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(search);
        }
        return false;
      });
    });
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

  const LeadCapturesTable = () => {
    const filteredData = filterData(leadCaptures);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Lead Magnet Signups ({filteredData.length})
          </h3>
          <Button
            onClick={() => exportToCSV(leadCaptures, 'lead_captures')}
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
                <th className="text-left p-3 text-white/70 font-medium">Email</th>
                <th className="text-left p-3 text-white/70 font-medium">Lead Magnet</th>
                <th className="text-left p-3 text-white/70 font-medium">Signup Method</th>
                <th className="text-left p-3 text-white/70 font-medium">UTM Source</th>
                <th className="text-left p-3 text-white/70 font-medium">UTM Campaign</th>
                <th className="text-left p-3 text-white/70 font-medium">Status</th>
                <th className="text-left p-3 text-white/70 font-medium">Captured At</th>
                <th className="text-left p-3 text-white/70 font-medium">Accessed At</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((capture) => (
                <tr key={capture.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">{capture.email}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      {capture.lead_magnet_slug}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      {capture.signup_method || 'N/A'}
                    </Badge>
                  </td>
                  <td className="p-3 text-white/70">{capture.utm_source || 'N/A'}</td>
                  <td className="p-3 text-white/70">{capture.utm_campaign || 'N/A'}</td>
                  <td className="p-3">
                    {capture.accessed ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accessed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-white/70 text-sm">{formatDate(capture.captured_at)}</td>
                  <td className="p-3 text-white/70 text-sm">{formatDate(capture.accessed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ContactSubmissionsTable = () => {
    const filteredData = filterData(contactSubmissions);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Contact Form Submissions ({filteredData.length})
          </h3>
          <Button
            onClick={() => exportToCSV(contactSubmissions, 'contact_submissions')}
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
                <th className="text-left p-3 text-white/70 font-medium">Email</th>
                <th className="text-left p-3 text-white/70 font-medium">Name</th>
                <th className="text-left p-3 text-white/70 font-medium">Company</th>
                <th className="text-left p-3 text-white/70 font-medium">Phone</th>
                <th className="text-left p-3 text-white/70 font-medium">Message</th>
                <th className="text-left p-3 text-white/70 font-medium">Services</th>
                <th className="text-left p-3 text-white/70 font-medium">Status</th>
                <th className="text-left p-3 text-white/70 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((submission) => (
                <tr key={submission.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">{submission.email}</span>
                    </div>
                  </td>
                  <td className="p-3 text-white/70">{submission.name || 'N/A'}</td>
                  <td className="p-3 text-white/70">{submission.company || 'N/A'}</td>
                  <td className="p-3 text-white/70">{submission.phone || 'N/A'}</td>
                  <td className="p-3 text-white/70 max-w-xs truncate" title={submission.message}>
                    {submission.message || 'N/A'}
                  </td>
                  <td className="p-3">
                    {submission.services_interested && Array.isArray(submission.services_interested) ? (
                      <div className="flex flex-wrap gap-1">
                        {submission.services_interested.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/50">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    {submission.is_processed ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Processed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-white/70 text-sm">{formatDate(submission.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const LeadAccessesTable = () => {
    const filteredData = filterData(leadAccesses);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Content Accesses ({filteredData.length})
          </h3>
          <Button
            onClick={() => exportToCSV(leadAccesses, 'lead_accesses')}
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
                <th className="text-left p-3 text-white/70 font-medium">Email</th>
                <th className="text-left p-3 text-white/70 font-medium">User ID</th>
                <th className="text-left p-3 text-white/70 font-medium">Lead Magnet</th>
                <th className="text-left p-3 text-white/70 font-medium">UTM Source</th>
                <th className="text-left p-3 text-white/70 font-medium">UTM Campaign</th>
                <th className="text-left p-3 text-white/70 font-medium">Accessed At</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((access) => (
                <tr key={access.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">{access.email}</span>
                    </div>
                  </td>
                  <td className="p-3 text-white/70 text-sm font-mono">{access.user_id?.substring(0, 8)}...</td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      {access.lead_magnet_slug}
                    </Badge>
                  </td>
                  <td className="p-3 text-white/70">{access.utm_source || 'N/A'}</td>
                  <td className="p-3 text-white/70">{access.utm_campaign || 'N/A'}</td>
                  <td className="p-3 text-white/70 text-sm">{formatDate(access.accessed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const EventCheckinsTable = () => {
    const filteredData = filterData(eventCheckins, 'email');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Event Check-ins ({filteredData.length})
          </h3>
          <Button
            onClick={() => exportToCSV(eventCheckins, 'event_checkins')}
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
                <th className="text-left p-3 text-white/70 font-medium">Name</th>
                <th className="text-left p-3 text-white/70 font-medium">Email</th>
                <th className="text-left p-3 text-white/70 font-medium">Company</th>
                <th className="text-left p-3 text-white/70 font-medium">Job Title</th>
                <th className="text-left p-3 text-white/70 font-medium">Phone</th>
                <th className="text-left p-3 text-white/70 font-medium">Primary Interest</th>
                <th className="text-left p-3 text-white/70 font-medium">Services</th>
                <th className="text-left p-3 text-white/70 font-medium">Follow-up</th>
                <th className="text-left p-3 text-white/70 font-medium">Checked In</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((checkin) => (
                <tr key={checkin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">{checkin.full_name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span className="text-white/70">{checkin.email}</span>
                    </div>
                  </td>
                  <td className="p-3 text-white/70">{checkin.company || 'N/A'}</td>
                  <td className="p-3 text-white/70">{checkin.job_title || 'N/A'}</td>
                  <td className="p-3 text-white/70">{checkin.phone || 'N/A'}</td>
                  <td className="p-3 text-white/70 max-w-xs truncate" title={checkin.survey_responses?.primary_interest}>
                    {checkin.survey_responses?.primary_interest || 'N/A'}
                  </td>
                  <td className="p-3">
                    {checkin.survey_responses?.services_interested && Array.isArray(checkin.survey_responses.services_interested) ? (
                      <div className="flex flex-wrap gap-1">
                        {checkin.survey_responses.services_interested.slice(0, 2).map((service, idx) => (
                          <Badge key={idx} variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                            {service}
                          </Badge>
                        ))}
                        {checkin.survey_responses.services_interested.length > 2 && (
                          <Badge variant="outline" className="bg-white/5 text-white/50 border-white/20 text-xs">
                            +{checkin.survey_responses.services_interested.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/50">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    {checkin.survey_responses?.follow_up_interest === 'yes' ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white/5 text-white/50 border-white/20">
                        No
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-white/70 text-sm">{formatDate(checkin.checked_in_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Show expanded survey details */}
          {filteredData.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="text-md font-semibold text-white border-t border-white/10 pt-4">
                Detailed Survey Responses
              </h4>
              {filteredData.map((checkin) => (
                <Card key={checkin.id} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">
                      {checkin.full_name} ({checkin.email})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {checkin.survey_responses?.current_challenges && (
                      <div>
                        <span className="text-white/70 font-medium">Current Challenges: </span>
                        <span className="text-white/90">{checkin.survey_responses.current_challenges}</span>
                      </div>
                    )}
                    {checkin.survey_responses?.additional_comments && (
                      <div>
                        <span className="text-white/70 font-medium">Comments: </span>
                        <span className="text-white/90">{checkin.survey_responses.additional_comments}</span>
                      </div>
                    )}
                    {checkin.referral_source && (
                      <div>
                        <span className="text-white/70 font-medium">Referral Source: </span>
                        <span className="text-white/90">{checkin.referral_source}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-white/70">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Submissions Manager</h2>
          <p className="text-white/60">View all event signups, form submissions, and content accesses</p>
        </div>
        <Button
          onClick={loadAllData}
          variant="outline"
          size="sm"
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center">
              <Users className="w-4 h-4 mr-2 text-emerald-400" />
              Lead Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalLeads}</div>
            <p className="text-xs text-white/50 mt-1">Total lead magnet captures</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-400" />
              Contact Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalContacts}</div>
            <p className="text-xs text-white/50 mt-1">Total form submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-purple-400" />
              Content Accesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalAccesses}</div>
            <p className="text-xs text-white/50 mt-1">Users who accessed content</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-orange-400" />
              Event Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalEventCheckins}</div>
            <p className="text-xs text-white/50 mt-1">Total event attendees</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-amber-400" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.conversionRate}%</div>
            <p className="text-xs text-white/50 mt-1">Signup to access rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                type="text"
                placeholder="Search by email, name, company, or any field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Tabs defaultValue="event_checkins" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="event_checkins" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            Event Check-ins
          </TabsTrigger>
          <TabsTrigger value="lead_captures" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            Lead Magnet Signups
          </TabsTrigger>
          <TabsTrigger value="contact_submissions" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Contact Forms
          </TabsTrigger>
          <TabsTrigger value="lead_accesses" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            Content Accesses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event_checkins" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <EventCheckinsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead_captures" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <LeadCapturesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact_submissions" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <ContactSubmissionsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead_accesses" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <LeadAccessesTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubmissionsManager;
