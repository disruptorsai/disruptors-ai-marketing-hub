import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  Download,
  ChevronDown,
  ChevronUp,
  Globe,
  Building2,
  Mail,
  Lock,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { effortToLabel, scoreToColor } from '@/lib/growth-audit/utils';

/**
 * Growth Audit UI Component
 *
 * Two-phase interface:
 * 1. Input Form - URL, business details, options
 * 2. Real-time Results - SSE streaming with progress updates
 *
 * Three-Level Access:
 * - Internal: All features, no quota display, no email required
 * - Client: Quota display, email optional, Create Brain option
 * - Public: Quota display (5/day), email required, upgrade CTA
 *
 * @param {Object} brain - Business Brain context
 * @param {string} audience - Access level (internal/client/public)
 * @param {Object} config - User configuration
 * @param {Object} access - Quota information
 * @param {Function} onRun - Execute module function
 * @param {boolean} loading - Loading state
 * @param {Object} result - Execution result (contains job_id)
 * @param {Error} error - Execution error
 */
const GrowthAuditUI = ({
  brain,
  audience = 'internal',
  config = {},
  access = {},
  onRun,
  loading = false,
  result = null,
  error = null
}) => {
  // Access level checks
  const isInternal = audience === 'internal';
  const isClient = audience === 'client';
  const isPublic = audience === 'public';

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [email, setEmail] = useState('');
  const [createBrain, setCreateBrain] = useState(false);

  // Results state
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState('queued');
  const [progress, setProgress] = useState(0);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [expandedOpportunities, setExpandedOpportunities] = useState(new Set());
  const [pollCount, setPollCount] = useState(0);
  const [auditError, setAuditError] = useState(null);

  // Industry options
  const industries = [
    'Construction & Trades',
    'Home Services',
    'Healthcare',
    'Legal Services',
    'Real Estate',
    'Automotive',
    'Retail',
    'Restaurants & Food',
    'Professional Services',
    'Technology',
    'Other'
  ];

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!websiteUrl.trim()) {
      return;
    }

    // Public users must provide email
    if (isPublic && !email.trim()) {
      setAuditError('Email is required for public access');
      return;
    }

    // Check quota for non-internal users
    if (!isInternal && access.daily_used >= access.daily_limit) {
      setAuditError('Daily limit reached. Please upgrade or try again tomorrow.');
      return;
    }

    setAuditError(null);

    // Execute module
    await onRun({
      website_url: websiteUrl,
      business_name: businessName || null,
      industry: industry || null,
      email: email || null,
      create_brain: createBrain
    });
  };

  /**
   * Handle reset to start new audit
   */
  const handleReset = () => {
    setJobId(null);
    setJobStatus('queued');
    setProgress(0);
    setBusinessProfile(null);
    setOpportunities([]);
    setExpandedOpportunities(new Set());
    setPollCount(0);
    setAuditError(null);
    setWebsiteUrl('');
    setBusinessName('');
    setIndustry('');
    setEmail('');
    setCreateBrain(false);
  };

  /**
   * Toggle opportunity expansion
   */
  const toggleOpportunity = (opportunityId) => {
    const newExpanded = new Set(expandedOpportunities);
    if (newExpanded.has(opportunityId)) {
      newExpanded.delete(opportunityId);
    } else {
      newExpanded.add(opportunityId);
    }
    setExpandedOpportunities(newExpanded);
  };

  /**
   * Effect: Extract job_id from result and start polling
   */
  useEffect(() => {
    if (result && result.job_id) {
      setJobId(result.job_id);
      setJobStatus('queued');
      setProgress(0);
    }
  }, [result]);

  /**
   * Effect: Poll for results when job_id exists
   */
  useEffect(() => {
    if (!jobId) return;

    let intervalId;

    const pollResults = async () => {
      try {
        const response = await fetch(
          `/.netlify/functions/growth-audit-stream?jobId=${jobId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setAuditError('Audit not found');
            clearInterval(intervalId);
            return;
          }
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();

        // Update status and progress
        setJobStatus(data.status);
        setProgress(data.progress || 0);

        if (data.status === 'completed') {
          setBusinessProfile(data.result);
          if (data.result?.quickWins) {
            setOpportunities(data.result.quickWins);
          }
          clearInterval(intervalId);
        } else if (data.status === 'failed') {
          setAuditError(data.error || 'Audit failed');
          clearInterval(intervalId);
        } else if (data.status === 'running') {
          // Update any partial results
          if (data.result) {
            setBusinessProfile(data.result);
            if (data.result?.quickWins) {
              setOpportunities(data.result.quickWins);
            }
          }
          setPollCount((prev) => prev + 1);
        }
      } catch (err) {
        console.error('Poll error:', err);
        if (pollCount > 30) {
          // Stop after 30 polls (~90 seconds)
          setAuditError('Audit timed out');
          clearInterval(intervalId);
        }
      }
    };

    // Initial poll
    pollResults();

    // Poll every 3 seconds
    intervalId = setInterval(pollResults, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, pollCount]);

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <Card className="bg-black/50 border-green-400/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-green-400" />
          <CardTitle className="text-green-400 font-mono">Analyzing Your Business...</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-black border border-green-400/30 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-green-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-green-400/60 text-sm text-center mt-2 font-mono">
            {progress}% Complete
          </p>
        </div>

        {/* Status Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${progress >= 25 ? 'bg-green-400' : 'bg-green-400/30'} ${progress < 25 ? 'animate-pulse' : ''}`} />
            <p className="text-sm text-green-400/80 font-mono">Crawling website</p>
            {progress >= 25 && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-green-400' : 'bg-green-400/30'} ${progress >= 25 && progress < 50 ? 'animate-pulse' : ''}`} />
            <p className="text-sm text-green-400/80 font-mono">Detecting brand</p>
            {progress >= 50 && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${progress >= 75 ? 'bg-green-400' : 'bg-green-400/30'} ${progress >= 50 && progress < 75 ? 'animate-pulse' : ''}`} />
            <p className="text-sm text-green-400/80 font-mono">Running performance audit</p>
            {progress >= 75 && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-400' : 'bg-green-400/30'} ${progress >= 75 && progress < 100 ? 'animate-pulse' : ''}`} />
            <p className="text-sm text-green-400/80 font-mono">AI analyzing opportunities</p>
            {progress >= 100 && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
          </div>
        </div>

        <p className="text-xs text-green-400/50 mt-4 text-center font-mono">
          This usually takes 30-60 seconds...
        </p>
      </CardContent>
    </Card>
  );

  /**
   * Render results state
   */
  const renderResults = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-green-400 font-mono">Analysis Complete!</h2>
            <p className="text-green-400/60 text-sm font-mono">
              {businessProfile?.site?.primaryDomain || websiteUrl}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Audit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Brand Identity */}
      {businessProfile?.brand && (
        <Card className="bg-black/50 border-green-400/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono text-lg">Brand Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessProfile.brand.name && (
                <div>
                  <h3 className="font-semibold text-green-400/60 mb-2 font-mono text-sm">Name</h3>
                  <p className="text-green-400 font-mono">{businessProfile.brand.name}</p>
                </div>
              )}
              {businessProfile.brand.tagline && (
                <div>
                  <h3 className="font-semibold text-green-400/60 mb-2 font-mono text-sm">Tagline</h3>
                  <p className="text-green-400 font-mono">{businessProfile.brand.tagline}</p>
                </div>
              )}
              {businessProfile.brand.palette && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-green-400/60 mb-2 font-mono text-sm">Color Palette</h3>
                  <div className="flex gap-2">
                    {businessProfile.brand.palette.primary && (
                      <div
                        className="w-16 h-16 rounded-lg border border-green-400/30"
                        style={{ backgroundColor: businessProfile.brand.palette.primary }}
                        title={`Primary: ${businessProfile.brand.palette.primary}`}
                      />
                    )}
                    {businessProfile.brand.palette.secondary && (
                      <div
                        className="w-16 h-16 rounded-lg border border-green-400/30"
                        style={{ backgroundColor: businessProfile.brand.palette.secondary }}
                        title={`Secondary: ${businessProfile.brand.palette.secondary}`}
                      />
                    )}
                    {businessProfile.brand.palette.neutrals?.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-16 rounded-lg border border-green-400/30"
                        style={{ backgroundColor: color }}
                        title={`Neutral ${idx + 1}: ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO & Performance */}
      {businessProfile?.seo && (
        <Card className="bg-black/50 border-green-400/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono text-lg">SEO & Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {businessProfile.seo.pagespeed && (
                <>
                  <div>
                    <h3 className="font-semibold text-green-400/60 mb-2 font-mono text-sm">Mobile Performance</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xl font-bold font-mono ${scoreToColor(
                          businessProfile.seo.pagespeed.mobileScore / 100
                        )}`}
                      >
                        {businessProfile.seo.pagespeed.mobileScore}
                      </span>
                      <span className="text-green-400/50 font-mono">/100</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-400/60 mb-2 font-mono text-sm">Desktop Performance</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xl font-bold font-mono ${scoreToColor(
                          businessProfile.seo.pagespeed.desktopScore / 100
                        )}`}
                      >
                        {businessProfile.seo.pagespeed.desktopScore}
                      </span>
                      <span className="text-green-400/50 font-mono">/100</span>
                    </div>
                  </div>
                </>
              )}
              <div>
                <h3 className="font-semibold text-green-400/60 mb-2 font-mono text-sm">Open Graph Tags</h3>
                <Badge
                  className={businessProfile.seo.ogPresent ? 'bg-green-400/20 text-green-400 border-green-400' : 'bg-red-500/20 text-red-500 border-red-500'}
                >
                  {businessProfile.seo.ogPresent ? 'Present' : 'Missing'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Opportunities */}
      {opportunities.length > 0 && (
        <Card className="bg-black/50 border-green-400/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-400 font-mono text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Growth Opportunities ({opportunities.length})
                </CardTitle>
                <CardDescription className="text-green-400/60 font-mono">
                  Prioritized by impact, effort, and confidence
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-black font-mono border-0">
                AI-Identified
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.map((opportunity) => {
                const isExpanded = expandedOpportunities.has(opportunity.id);
                return (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-green-400/5 border-green-400/30 border-l-4 border-l-green-400">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className="bg-green-400/20 text-green-400 border-green-400/50 font-mono">
                                {opportunity.category}
                              </Badge>
                              <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/50 font-mono">
                                {effortToLabel(opportunity.effort)}
                              </Badge>
                              <Badge className="bg-green-600/80 text-white font-mono">
                                Impact: {opportunity.impactBand.likely}/10
                              </Badge>
                            </div>
                            <CardTitle className="text-lg text-green-400 font-mono">{opportunity.title}</CardTitle>
                            <CardDescription className="mt-2 text-green-400/80 font-mono text-sm">
                              {opportunity.whyItMatters}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-400/60 font-mono">
                              {Math.round(opportunity.confidence * 100)}% confidence
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOpportunity(opportunity.id)}
                              className="text-green-400 hover:bg-green-400/10"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-semibold text-sm mb-2 text-green-400 font-mono">Action Steps:</h4>
                                  <ol className="list-decimal list-inside space-y-1">
                                    {opportunity.steps.map((step, idx) => (
                                      <li key={idx} className="text-sm text-green-400/80 font-mono">
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                                {opportunity.evidence && opportunity.evidence.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2 text-green-400 font-mono">Evidence:</h4>
                                    <ul className="space-y-1">
                                      {opportunity.evidence.map((ev, idx) => (
                                        <li key={idx} className="text-sm">
                                          <a
                                            href={ev.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline inline-flex items-center gap-1 font-mono"
                                          >
                                            {ev.note}
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public Upgrade CTA */}
      {isPublic && (
        <Card className="bg-gradient-to-r from-green-400/10 to-blue-400/10 border-green-400/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Lock className="w-5 h-5" />
                <h3 className="text-xl font-bold font-mono">Unlock Full Growth Audit Access</h3>
              </div>
              <p className="text-green-400/80 font-mono">
                Public access is limited to 5 audits per day. Sign up for free to unlock:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-green-400/80">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="font-mono">10 audits per day (vs. 5)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="font-mono">Create Business Brain from audit results</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="font-mono">Save audits to your dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="font-mono">Export detailed PDF reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="font-mono">Priority support and custom recommendations</span>
                </li>
              </ul>
              <Button className="bg-green-400 hover:bg-green-500 text-black font-mono">
                <Sparkles className="w-4 h-4 mr-2" />
                Sign Up for Free
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  /**
   * Main render
   */
  return (
    <div className="space-y-6">
      {/* Header with Quota Display */}
      {jobStatus === 'queued' && !jobId && (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-green-400 font-mono flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Growth Audit
              </h2>
              <p className="text-green-400/60 text-sm mt-1 font-mono">
                AI-powered website analysis with instant growth opportunities
              </p>
            </div>

            {/* Quota Display */}
            {!isInternal && access && (
              <div className="text-right">
                <div className="text-sm text-green-400/60 font-mono">Audits Today</div>
                <div className="text-xl font-bold text-green-400 font-mono">
                  {access.daily_used || 0}/{access.daily_limit || 5}
                </div>
                {access.daily_used >= access.daily_limit && (
                  <Badge className="mt-2 bg-red-500/20 text-red-500 border-red-500">
                    Daily Limit Reached
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit}>
            <Card className="bg-black/50 border-green-400/30">
              <CardHeader>
                <CardTitle className="text-green-400 font-mono text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Website Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Website URL */}
                <div>
                  <label className="text-sm text-green-400 font-mono mb-2 block">
                    Website URL *
                  </label>
                  <Input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="bg-black border-green-400/30 text-green-400 font-mono"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Business Name */}
                <div>
                  <label className="text-sm text-green-400 font-mono mb-2 block flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Business Name (Optional)
                  </label>
                  <Input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={brain?.business_name || "Will be auto-detected"}
                    className="bg-black border-green-400/30 text-green-400 font-mono"
                    disabled={loading}
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="text-sm text-green-400 font-mono mb-2 block">
                    Industry (Optional)
                  </label>
                  <Select value={industry} onValueChange={setIndustry} disabled={loading}>
                    <SelectTrigger className="bg-black border-green-400/30 text-green-400 font-mono">
                      <SelectValue placeholder={brain?.industry || "Select industry..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-green-400/30">
                      {industries.map(ind => (
                        <SelectItem key={ind} value={ind} className="text-green-400 font-mono">
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email - Required for Public */}
                <div>
                  <label className="text-sm text-green-400 font-mono mb-2 block flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email {isPublic && <span className="text-red-500">*</span>}
                    {!isPublic && <span className="text-green-400/50">(Optional)</span>}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-black border-green-400/30 text-green-400 font-mono"
                    disabled={loading}
                    required={isPublic}
                  />
                  {isPublic && (
                    <p className="text-xs text-green-400/50 mt-1 font-mono">
                      Required for public access - we'll email your report
                    </p>
                  )}
                </div>

                {/* Create Brain Checkbox - Client/Internal only */}
                {!isPublic && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createBrain"
                      checked={createBrain}
                      onCheckedChange={setCreateBrain}
                      className="border-green-400 data-[state=checked]:bg-green-400 data-[state=checked]:text-black"
                      disabled={loading}
                    />
                    <label
                      htmlFor="createBrain"
                      className="text-sm text-green-400 cursor-pointer font-mono"
                    >
                      Create Business Brain from audit results
                    </label>
                  </div>
                )}

                {/* Public Limitation Notice */}
                {isPublic && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-mono">
                        Public access limited to 5 audits/day. Sign up for 10/day + Business Brain creation.
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {(error || auditError) && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span className="font-mono">{error?.message || auditError}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !websiteUrl.trim() || (isPublic && !email.trim())}
                  className="w-full bg-green-400 hover:bg-green-500 text-black font-mono"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Audit...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Growth Audit
                    </>
                  )}
                </Button>

                {/* Example URLs */}
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <span className="text-xs text-green-400/50 font-mono">Try examples:</span>
                  {['shopify.com', 'airbnb.com', 'stripe.com'].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setWebsiteUrl(`https://${example}`)}
                      className="px-2 py-1 rounded-full bg-green-400/10 border border-green-400/30 text-xs text-green-400 hover:bg-green-400/20 transition-colors font-mono"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </form>
        </>
      )}

      {/* Loading State */}
      {jobId && jobStatus !== 'completed' && jobStatus !== 'failed' && renderLoadingState()}

      {/* Results State */}
      {jobStatus === 'completed' && businessProfile && renderResults()}

      {/* Error State */}
      {(jobStatus === 'failed' || auditError) && !loading && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <CardTitle className="text-red-500 font-mono">Analysis Failed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-400 mb-4 font-mono">{auditError || error?.message || 'Unknown error'}</p>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GrowthAuditUI;
