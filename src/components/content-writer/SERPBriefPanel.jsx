/**
 * SERP Brief Panel
 * Displays SERP-based content brief for AI Content Writer
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  TrendingUp,
  Award,
  FileText,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { serpContentAnalyzer } from '@/lib/serp-content-analyzer';

export function SERPBriefPanel({ keyword, onApplyBrief }) {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (keyword) {
      generateBrief();
    }
  }, [keyword]);

  async function generateBrief() {
    setLoading(true);
    setError(null);

    try {
      const contentBrief = await serpContentAnalyzer.generateContentBrief(keyword);
      setBrief(contentBrief);
    } catch (err) {
      console.error('[SERPBriefPanel] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Analyzing top-ranking content...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Error generating brief: {error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateBrief}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                SERP Content Brief
              </CardTitle>
              <CardDescription>
                Insights from top-ranking content for "{keyword}"
              </CardDescription>
            </div>
            <Badge
              variant={
                brief.competition.level === 'High' ? 'destructive' :
                brief.competition.level === 'Medium' ? 'default' : 'secondary'
              }
            >
              {brief.competition.level} Competition
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Title Patterns */}
      {brief.title_patterns.patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Title Patterns from Top Rankers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                {brief.title_patterns.recommendation}
              </div>
              {brief.title_patterns.patterns.map((pattern, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{pattern.recommendation}</div>
                    <div className="text-gray-500 text-xs">
                      Found in {pattern.frequency} of top 5 results
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SERP Features Opportunities */}
      {brief.serp_features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-600" />
              SERP Features Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brief.serp_features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    feature.priority === 'high' ? 'bg-red-500' :
                    feature.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <div className="font-medium">{feature.type}</div>
                    <div className="text-gray-600 mt-1">{feature.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-600" />
            Content Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {brief.recommendations.map((rec, idx) => (
              <div key={idx} className="border-l-2 border-purple-200 pl-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-purple-900">{rec.category}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      rec.priority === 'high' ? 'border-red-500 text-red-700' :
                      rec.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                      'border-blue-500 text-blue-700'
                    }`}
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <div className="text-gray-700 mb-1">{rec.suggestion}</div>
                <div className="text-gray-500 text-xs">{rec.reasoning}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top Ranking Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {brief.top_pages.slice(0, 3).map((page, idx) => (
              <div key={idx} className="text-sm border-b last:border-0 pb-2 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">#{page.position}</Badge>
                  <span className="text-gray-500 text-xs">{page.domain}</span>
                </div>
                <div className="font-medium text-blue-600 line-clamp-1">{page.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apply Brief Button */}
      {onApplyBrief && (
        <Button
          onClick={() => onApplyBrief(brief)}
          className="w-full"
        >
          Apply SERP Insights to Content
        </Button>
      )}
    </div>
  );
}
