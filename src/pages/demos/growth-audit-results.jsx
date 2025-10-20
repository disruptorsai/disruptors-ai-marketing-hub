import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Zap,
  Target,
  Link2,
  BarChart3,
} from 'lucide-react';
import { effortToLabel, impactToLabel, scoreToColor } from '@/lib/growth-audit/utils';

/**
 * Growth Audit Results Page
 * Displays the results of a growth audit with progress updates
 */
export default function GrowthAuditResults() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  // Poll for results (since Netlify Functions don't support true SSE)
  useEffect(() => {
    let intervalId;

    const pollResults = async () => {
      try {
        const response = await fetch(
          `/.netlify/functions/growth-audit-stream?jobId=${jobId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError('Audit not found');
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();

        if (data.status === 'completed') {
          setProfile(data.result);
          setEvents(data.events || []);
          setIsComplete(true);
          setIsLoading(false);
          clearInterval(intervalId);
        } else if (data.status === 'failed') {
          setError(data.error || 'Audit failed');
          setIsLoading(false);
          clearInterval(intervalId);
        } else if (data.status === 'running') {
          setPollCount((prev) => prev + 1);
          // Continue polling
        }
      } catch (err) {
        console.error('Poll error:', err);
        if (pollCount > 20) {
          // Stop after 20 polls (~60 seconds)
          setError('Audit timed out');
          setIsLoading(false);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border-[#FFD700]/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#FFD700]" />
              <CardTitle className="text-white">Analyzing Your Business...</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse" />
                <p className="text-sm text-slate-300">Crawling website</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FFA500] rounded-full animate-pulse animation-delay-200" />
                <p className="text-sm text-slate-300">Detecting brand</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-400" />
                <p className="text-sm text-slate-300">Running performance audit</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse animation-delay-600" />
                <p className="text-sm text-slate-300">AI analyzing opportunities</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">This usually takes 30-60 seconds...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <CardTitle>Analysis Failed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/demos/growth-audit')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isComplete && profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold">Analysis Complete!</h1>
            </div>
            <Button onClick={() => navigate('/demos/growth-audit')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Audit
            </Button>
          </div>

          {/* Brand Section */}
          {profile.brand && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Name</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile.brand.name || 'Not detected'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tagline</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile.brand.tagline || 'Not detected'}
                    </p>
                  </div>
                  {profile.brand.palette && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold mb-2">Color Palette</h3>
                      <div className="flex gap-2">
                        {profile.brand.palette.primary && (
                          <div
                            className="w-16 h-16 rounded-lg border"
                            style={{ backgroundColor: profile.brand.palette.primary }}
                            title={`Primary: ${profile.brand.palette.primary}`}
                          />
                        )}
                        {profile.brand.palette.secondary && (
                          <div
                            className="w-16 h-16 rounded-lg border"
                            style={{ backgroundColor: profile.brand.palette.secondary }}
                            title={`Secondary: ${profile.brand.palette.secondary}`}
                          />
                        )}
                        {profile.brand.palette.neutrals?.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-16 h-16 rounded-lg border"
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

          {/* SEO Section */}
          {profile.seo && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>SEO & Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.seo.pagespeed && (
                    <>
                      <div>
                        <h3 className="font-semibold mb-2">Mobile Performance</h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl font-bold ${scoreToColor(
                              profile.seo.pagespeed.mobileScore / 100
                            )}`}
                          >
                            {profile.seo.pagespeed.mobileScore}
                          </span>
                          <span className="text-gray-500">/100</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Desktop Performance</h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl font-bold ${scoreToColor(
                              profile.seo.pagespeed.desktopScore / 100
                            )}`}
                          >
                            {profile.seo.pagespeed.desktopScore}
                          </span>
                          <span className="text-gray-500">/100</span>
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">Open Graph Tags</h3>
                    <Badge variant={profile.seo.ogPresent ? 'default' : 'destructive'}>
                      {profile.seo.ogPresent ? 'Present' : 'Missing'}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Schema Markup</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile.seo.jsonLdTypes?.length || 0} types detected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SERP Visibility & Competitive Analysis */}
          {profile.serpVisibility && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <CardTitle>SERP Visibility & Competitors</CardTitle>
                </div>
                <CardDescription>Search engine rankings and competitive positioning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Visibility Score</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-purple-600">
                        {profile.serpVisibility.visibility_score}
                      </span>
                      <span className="text-gray-500">/100</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Ranking Keywords</h3>
                    <p className="text-2xl font-bold">{profile.serpVisibility.ranking_keywords}</p>
                    <p className="text-xs text-gray-500">of {profile.serpVisibility.total_keywords_analyzed} analyzed</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Avg. Position</h3>
                    <p className="text-2xl font-bold">
                      {profile.serpVisibility.avg_position ? `#${profile.serpVisibility.avg_position}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Competitors Found</h3>
                    <p className="text-2xl font-bold">{profile.serpVisibility.competitors.length}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Competitors */}
                  {profile.serpVisibility.competitors.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Top Competitors</h3>
                      <div className="space-y-1 text-sm">
                        {profile.serpVisibility.competitors.slice(0, 5).map((comp, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 truncate max-w-[180px]">{comp.domain}</span>
                            <div className="flex gap-2 items-center">
                              <Badge variant="outline" className="text-xs">{comp.appearances} keywords</Badge>
                              <span className="text-gray-500">Avg #{comp.avg_position}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keyword Gaps */}
                  {profile.serpVisibility.keyword_gaps && profile.serpVisibility.keyword_gaps.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Keyword Opportunities</h3>
                      <div className="space-y-1 text-sm">
                        {profile.serpVisibility.keyword_gaps.slice(0, 5).map((gap, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 truncate max-w-[180px]">{gap.keyword}</span>
                              <Badge
                                variant={gap.opportunity_level === 'high' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {gap.opportunity_level}
                              </Badge>
                            </div>
                            {gap.top_competitor && (
                              <p className="text-gray-500 mt-0.5">
                                {gap.top_competitor} ranks #{gap.top_competitor_position}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SERP Features */}
                {profile.serpVisibility.serp_features && profile.serpVisibility.serp_features.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-semibold mb-2">SERP Features Detected</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.serpVisibility.serp_features.slice(0, 5).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature.type.replace(/_/g, ' ')}
                          {feature.count > 1 && ` (${feature.count})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Growth Opportunities */}
          {profile.quickWins && profile.quickWins.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Growth Opportunities ({profile.quickWins.length})</CardTitle>
                  <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-slate-900 font-bold border-0">
                    AI-Identified
                  </Badge>
                </div>
                <CardDescription>
                  Prioritized by impact, effort, and confidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.quickWins.map((opportunity) => (
                    <Card key={opportunity.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{opportunity.category}</Badge>
                              <Badge variant="secondary">{effortToLabel(opportunity.effort)}</Badge>
                              <Badge className="bg-green-600">
                                Impact: {opportunity.impactBand.likely}/10
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {opportunity.whyItMatters}
                            </CardDescription>
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.round(opportunity.confidence * 100)}% confidence
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Action Steps:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              {opportunity.steps.map((step, idx) => (
                                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                          {opportunity.evidence && opportunity.evidence.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Evidence:</h4>
                              <ul className="space-y-1">
                                {opportunity.evidence.map((ev, idx) => (
                                  <li key={idx} className="text-sm">
                                    <a
                                      href={ev.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
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
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Site Overview */}
          {profile.site && (
            <Card>
              <CardHeader>
                <CardTitle>Site Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Domain</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.site.primaryDomain}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Pages Analyzed</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.site.topPages?.length || 0}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Sitemap</h3>
                    <Badge variant={profile.site.sitemapFound ? 'default' : 'destructive'}>
                      {profile.site.sitemapFound ? 'Found' : 'Not Found'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
}
