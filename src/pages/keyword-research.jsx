/**
 * Keyword Research Tool
 *
 * Standalone keyword research application using DataForSEO API.
 * Find high-value keywords with search volume, difficulty, CPC, and trend data.
 *
 * Features:
 * - Search keyword suggestions and related keywords
 * - View search volume, competition, difficulty, CPC
 * - Opportunity score calculation (volume vs. competition)
 * - Multi-select keywords for export
 * - Premium UI matching AI Content Writer design
 * - Brand-themed accents
 */

import React, { useState } from 'react';
import { Search, TrendingUp, DollarSign, Target, Loader2, Download, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import BrainThemedLayout from '@/components/layout/BrainThemedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { dataForSEOClient } from '@/lib/dataforseo-client';

export default function KeywordResearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a keyword to research');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      const result = await dataForSEOClient.comprehensiveKeywordResearch(searchQuery, 100);

      setKeywords(result.keywords);
      toast.success(`Found ${result.keywords.length} keywords!`);
    } catch (error) {
      console.error('Keyword research error:', error);
      toast.error('Failed to fetch keywords. Please check your API credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyword = (keyword) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const selectAll = () => {
    setSelectedKeywords(new Set(keywords.map(k => k.keyword)));
  };

  const clearSelection = () => {
    setSelectedKeywords(new Set());
  };

  const exportKeywords = () => {
    const selected = keywords.filter(k => selectedKeywords.has(k.keyword));
    const csv = 'Keyword,Search Volume,Competition,Difficulty Level,CPC,Trend,Opportunity Score\\n' +
      selected.map(k =>
        `"${k.keyword}",${k.searchVolume},${(k.competition * 100).toFixed(0)},${k.competitionLevel},${k.cpc.toFixed(2)},${k.trend},${dataForSEOClient.calculateKeywordScore(k).toFixed(1)}`
      ).join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${searchQuery.replace(/\\s+/g, '-')}.csv`;
    a.click();

    toast.success(`Exported ${selected.length} keywords`);
  };

  const getDifficultyColor = (level) => {
    switch(level) {
      case 'Low': return 'var(--brand-primary)';
      case 'Medium': return '#F59E0B'; // Amber
      case 'High': return '#EF4444'; // Red
      default: return 'var(--text-secondary)';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'falling': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <BrainThemedLayout>
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Premium header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(var(--brand-primary-rgb), 0.1)' }}
            >
              <Search className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <h1
              className="text-[2rem] font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Keyword Research
            </h1>
          </div>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Find high-value keywords with search volume, competition, and trend data
          </p>
        </div>

        {/* Search bar */}
        <div
          className="bg-white rounded-xl p-8 mb-8"
          style={{
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Enter a seed keyword
            </label>
            <div className="flex gap-3">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
                placeholder="e.g., SEO tools, content marketing, keyword research..."
                className="flex-1 text-base px-4 py-3 rounded-lg"
                style={{
                  border: '1.5px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading}
              />
              <Button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  boxShadow: '0 2px 8px rgba(var(--brand-primary-rgb), 0.2)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find Keywords
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
              We'll find up to 100 related keywords with volume, difficulty, and CPC data
            </p>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <>
            {/* Stats summary */}
            {keywords.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div
                  className="bg-white rounded-xl p-6"
                  style={{
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Total Keywords
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {keywords.length}
                  </div>
                </div>

                <div
                  className="bg-white rounded-xl p-6"
                  style={{
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Selected
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedKeywords.size}
                  </div>
                </div>

                <div
                  className="bg-white rounded-xl p-6"
                  style={{
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Avg. Volume
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(keywords.reduce((sum, k) => sum + k.searchVolume, 0) / keywords.length).toLocaleString()}
                  </div>
                </div>

                <div
                  className="bg-white rounded-xl p-6"
                  style={{
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Avg. CPC
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    ${(keywords.reduce((sum, k) => sum + k.cpc, 0) / keywords.length).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Bulk actions */}
            {keywords.length > 0 && (
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  <Button
                    onClick={selectAll}
                    variant="outline"
                    className="text-sm"
                    style={{
                      border: '1.5px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    className="text-sm"
                    style={{
                      border: '1.5px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    disabled={selectedKeywords.size === 0}
                  >
                    Clear Selection
                  </Button>
                </div>

                <Button
                  onClick={exportKeywords}
                  disabled={selectedKeywords.size === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    boxShadow: '0 2px 8px rgba(var(--brand-primary-rgb), 0.2)',
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export Selected ({selectedKeywords.size})
                </Button>
              </div>
            )}

            {/* Keywords table */}
            {keywords.length > 0 ? (
              <div
                className="bg-white rounded-xl overflow-hidden"
                style={{
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          <Checkbox />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Keyword
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Volume
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Difficulty
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          CPC
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Trend
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((keyword, index) => (
                        <tr
                          key={index}
                          className="transition-colors cursor-pointer"
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            backgroundColor: selectedKeywords.has(keyword.keyword) ? 'rgba(var(--brand-primary-rgb), 0.05)' : 'white',
                          }}
                          onClick={() => toggleKeyword(keyword.keyword)}
                          onMouseEnter={(e) => {
                            if (!selectedKeywords.has(keyword.keyword)) {
                              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedKeywords.has(keyword.keyword)) {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <td className="px-6 py-4">
                            <Checkbox
                              checked={selectedKeywords.has(keyword.keyword)}
                              onCheckedChange={() => toggleKeyword(keyword.keyword)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {keyword.keyword}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {keyword.searchVolume.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className="px-2.5 py-1 rounded-md text-xs font-medium"
                              style={{
                                backgroundColor: `${getDifficultyColor(keyword.competitionLevel)}15`,
                                color: getDifficultyColor(keyword.competitionLevel),
                                border: `1px solid ${getDifficultyColor(keyword.competitionLevel)}33`,
                              }}
                            >
                              {keyword.competitionLevel} ({Math.round(keyword.competition * 100)}%)
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              ${keyword.cpc.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(keyword.trend)}
                              <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                                {keyword.trend}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="px-3 py-1.5 rounded-lg font-bold text-sm"
                                style={{
                                  backgroundColor: 'rgba(var(--brand-primary-rgb), 0.1)',
                                  color: 'var(--brand-primary)',
                                }}
                              >
                                {dataForSEOClient.calculateKeywordScore(keyword).toFixed(1)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div
                className="bg-white rounded-xl p-12 text-center"
                style={{
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No keywords found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Try a different search term or check your API credentials
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </BrainThemedLayout>
  );
}
