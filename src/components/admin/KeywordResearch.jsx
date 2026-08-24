import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataForSEOClient } from '@/lib/dataforseo-client';

/**
 * KeywordResearch Component
 *
 * Comprehensive keyword research interface using DataForSEO API
 * Features:
 * - Search keyword suggestions with stats
 * - Multi-select keywords
 * - Sort by volume, difficulty, CPC, score
 * - Visual indicators for trends and competition
 * - Export selected keywords for blog generation
 */
export default function KeywordResearch({ onKeywordsSelected }) {
  const [seedKeyword, setSeedKeyword] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('score'); // score, volume, difficulty, cpc

  /**
   * Perform keyword research
   */
  const handleResearch = async () => {
    if (!seedKeyword.trim()) {
      setError('Please enter a keyword to research');
      return;
    }

    setLoading(true);
    setError(null);
    setKeywords([]);
    setSelectedKeywords([]);

    try {
      const result = await dataForSEOClient.comprehensiveKeywordResearch(seedKeyword, 50);

      const formattedKeywords = result.keywords.map(kw =>
        dataForSEOClient.formatKeywordForUI(kw)
      );

      setKeywords(formattedKeywords);
    } catch (err) {
      setError(err.message || 'Failed to fetch keyword data');
      console.error('Keyword research error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle keyword selection
   */
  const toggleKeyword = (keyword) => {
    setSelectedKeywords(prev => {
      const isSelected = prev.some(k => k.keyword === keyword.keyword);
      if (isSelected) {
        return prev.filter(k => k.keyword !== keyword.keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  /**
   * Select all visible keywords
   */
  const selectAll = () => {
    setSelectedKeywords([...keywords]);
  };

  /**
   * Clear all selections
   */
  const clearSelection = () => {
    setSelectedKeywords([]);
  };

  /**
   * Sort keywords
   */
  const sortedKeywords = [...keywords].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return (b.raw.searchVolume || 0) - (a.raw.searchVolume || 0);
      case 'difficulty':
        return a.difficulty - b.difficulty;
      case 'cpc':
        return (b.raw.cpc || 0) - (a.raw.cpc || 0);
      case 'score':
      default:
        return b.score - a.score;
    }
  });

  /**
   * Submit selected keywords
   */
  const handleSubmit = () => {
    if (selectedKeywords.length === 0) {
      setError('Please select at least one keyword');
      return;
    }

    const primaryKeyword = selectedKeywords[0];
    const secondaryKeywords = selectedKeywords.slice(1);

    onKeywordsSelected({
      primary: primaryKeyword.keyword,
      secondary: secondaryKeywords.map(k => k.keyword),
      data: selectedKeywords.map(k => k.raw)
    });
  };

  /**
   * Get trend icon
   */
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  /**
   * Get difficulty badge color
   */
  const getDifficultyColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Keyword Research
          </CardTitle>
          <CardDescription>
            Research keywords with search volume, competition, and CPC data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter seed keyword (e.g., 'hvac marketing')"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
              disabled={loading}
            />
            <Button onClick={handleResearch} disabled={loading}>
              {loading ? 'Researching...' : 'Research'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {keywords.length > 0 && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{keywords.length}</div>
                <div className="text-sm text-muted-foreground">Keywords Found</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{selectedKeywords.length}</div>
                <div className="text-sm text-muted-foreground">Selected</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {keywords.reduce((sum, k) => sum + (k.raw.searchVolume || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ${(keywords.reduce((sum, k) => sum + (k.raw.cpc || 0), 0) / keywords.length).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Avg CPC</div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="score">Opportunity Score</option>
                    <option value="volume">Search Volume</option>
                    <option value="difficulty">Difficulty (Low-High)</option>
                    <option value="cpc">CPC (High-Low)</option>
                  </select>
                </div>

                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>

                {selectedKeywords.length > 0 && (
                  <Button onClick={handleSubmit} className="ml-auto">
                    Use {selectedKeywords.length} Selected Keyword{selectedKeywords.length !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keywords Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {sortedKeywords.map((keyword, index) => {
                  const isSelected = selectedKeywords.some(k => k.keyword === keyword.keyword);

                  return (
                    <div
                      key={index}
                      onClick={() => toggleKeyword(keyword)}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-all
                        hover:border-primary hover:bg-accent
                        ${isSelected ? 'border-primary bg-accent' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Keyword and Selection */}
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : (
                              <div className="w-5 h-5 border-2 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{keyword.keyword}</div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4" />
                                {keyword.volume} searches/mo
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {keyword.cpc}
                              </div>
                              <div className="flex items-center gap-1">
                                {getTrendIcon(keyword.trend)}
                                <span className="capitalize">{keyword.trend}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium">Score: {Math.round(keyword.score)}</div>
                            <div className="text-xs text-muted-foreground">Opportunity</div>
                          </div>
                          <Badge className={getDifficultyColor(keyword.difficultyLabel)}>
                            {keyword.difficultyLabel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
