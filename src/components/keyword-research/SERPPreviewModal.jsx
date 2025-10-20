/**
 * SERP Preview Modal
 * Shows live search results for a keyword
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, TrendingUp, Award } from 'lucide-react';
import { serpClient } from '@/lib/serp-client';

export function SERPPreviewModal({ keyword, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [serpData, setSerpData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && keyword) {
      fetchSERPData();
    }
  }, [isOpen, keyword]);

  async function fetchSERPData() {
    setLoading(true);
    setError(null);

    try {
      const results = await serpClient.getOrganicResults(keyword, 2840, 'en', 10);

      // Separate organic from features
      const organic = results.filter(item => item.type === 'organic');
      const features = results.filter(item => item.type !== 'organic');

      setSerpData({
        organic,
        features,
        keyword
      });
    } catch (err) {
      console.error('[SERPPreviewModal] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            SERP Preview: "{keyword}"
          </DialogTitle>
          <DialogDescription>
            Live Google search results for this keyword
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Fetching live SERP data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">Error loading SERP data: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSERPData}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && serpData && (
          <div className="space-y-6">
            {/* SERP Features */}
            {serpData.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  SERP Features ({serpData.features.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {serpData.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary">
                      {feature.type.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Organic Results */}
            <div>
              <h3 className="font-semibold mb-3">
                Top 10 Organic Results
              </h3>
              <div className="space-y-3">
                {serpData.organic.slice(0, 10).map((result, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            #{result.rank_absolute || idx + 1}
                          </Badge>
                          <span className="text-xs text-gray-500 truncate">
                            {new URL(result.url).hostname}
                          </span>
                        </div>
                        <h4 className="font-medium text-blue-600 mb-1 line-clamp-1">
                          {result.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(result.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Insights</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {serpData.features.length} SERP features detected</li>
                <li>• Top position: {serpData.organic[0]?.url ? new URL(serpData.organic[0].url).hostname : 'N/A'}</li>
                {serpData.features.some(f => f.type.includes('featured_snippet')) && (
                  <li>• Featured snippet opportunity available</li>
                )}
                {serpData.features.some(f => f.type.includes('people_also_ask')) && (
                  <li>• People Also Ask questions present</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
