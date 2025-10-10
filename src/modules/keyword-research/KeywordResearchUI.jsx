import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  TrendingUp,
  DollarSign,
  Target,
  Download,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Filter,
  Zap,
  BarChart3,
  Lock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { locationOptions } from './schema.js';

/**
 * Keyword Research UI Component
 *
 * Three-Level Access:
 * - Internal: Unlimited searches, all features, no quotas
 * - Client: 10 searches/day, full results, quota displayed
 * - Public: 3 searches/day, limited to 10 keywords, upgrade CTA
 *
 * @param {Object} brain - Business Brain context
 * @param {string} audience - Access level (internal/client/public)
 * @param {Object} config - User configuration
 * @param {Object} access - Quota information
 * @param {Function} onRun - Execute module function
 * @param {boolean} loading - Loading state
 * @param {Object} result - Execution result
 * @param {Error} error - Execution error
 */
const KeywordResearchUI = ({
  brain,
  audience = 'internal',
  config = {},
  access = {},
  onRun,
  loading = false,
  result = null,
  error = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState(config.default_location || '2840');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [sortBy, setSortBy] = useState('opportunity_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    minVolume: config.min_search_volume || 0,
    maxDifficulty: 100,
    minCPC: 0
  });

  // Access level checks
  const isInternal = audience === 'internal';
  const isClient = audience === 'client';
  const isPublic = audience === 'public';

  // Get keywords from result
  const keywords = result?.keywords || [];

  /**
   * Handle search submission
   */
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    // Execute module
    await onRun({
      seed_keyword: searchTerm,
      location,
      language: config.default_language || 'en',
      limit: config.results_limit || 50
    });
  };

  /**
   * Toggle keyword selection
   */
  const toggleKeywordSelection = (keyword) => {
    setSelectedKeywords(prev => {
      const exists = prev.find(k => k.keyword === keyword.keyword);
      if (exists) {
        return prev.filter(k => k.keyword !== keyword.keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  /**
   * Sort keywords
   */
  const sortedKeywords = [...keywords].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  /**
   * Filter keywords
   */
  const filteredKeywords = sortedKeywords.filter(kw => {
    return (
      kw.search_volume >= filters.minVolume &&
      kw.difficulty <= filters.maxDifficulty &&
      parseFloat(kw.cpc) >= filters.minCPC
    );
  });

  /**
   * Toggle sort
   */
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  /**
   * Export keywords to CSV
   */
  const handleExportCSV = () => {
    const headers = ['Keyword', 'Volume', 'Difficulty', 'CPC', 'Competition', 'Opportunity Score'];
    const rows = filteredKeywords.map(kw => [
      kw.keyword,
      kw.search_volume,
      kw.difficulty,
      kw.cpc,
      kw.competition_level,
      kw.opportunity_score
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${searchTerm}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Get difficulty badge color
   */
  const getDifficultyColor = (difficulty) => {
    if (difficulty < 30) return 'bg-green-400/20 text-green-400 border-green-400';
    if (difficulty < 60) return 'bg-yellow-400/20 text-yellow-400 border-yellow-400';
    return 'bg-red-400/20 text-red-400 border-red-400';
  };

  /**
   * Get opportunity badge color
   */
  const getOpportunityColor = (score) => {
    if (score >= 70) return 'bg-green-400/20 text-green-400 border-green-400';
    if (score >= 40) return 'bg-yellow-400/20 text-yellow-400 border-yellow-400';
    return 'bg-red-400/20 text-red-400 border-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header with Quota Display */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-green-400 font-mono flex items-center gap-2">
            <Search className="w-6 h-6" />
            Keyword Research
          </h2>
          <p className="text-green-400/60 text-sm mt-1">
            {brain ? `${brain.business_name} - ${brain.industry}` : 'Discover high-value keywords'}
          </p>
        </div>

        {/* Quota Display */}
        {!isInternal && access && (
          <div className="text-right">
            <div className="text-sm text-green-400/60">Searches Today</div>
            <div className="text-xl font-bold text-green-400 font-mono">
              {access.daily_used || 0}/{access.daily_limit || 10}
            </div>
            {access.daily_used >= access.daily_limit && (
              <Badge className="mt-2 bg-red-500/20 text-red-500 border-red-500">
                Daily Limit Reached
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Search Interface */}
      <Card className="bg-black/50 border-green-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-green-400 font-mono mb-2 block">Seed Keyword</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
                placeholder="e.g., plumber, digital marketing, AI automation"
                className="bg-black border-green-400/30 text-green-400 font-mono"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block">Location</label>
              <Select value={location} onValueChange={setLocation} disabled={loading}>
                <SelectTrigger className="bg-black border-green-400/30 text-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-400/30">
                  {locationOptions.map(loc => (
                    <SelectItem key={loc.value} value={loc.value} className="text-green-400">
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters - Hidden for Public */}
          {!isPublic && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-green-400 font-mono mb-2 block">Min Volume</label>
                <Input
                  type="number"
                  value={filters.minVolume}
                  onChange={(e) => setFilters(prev => ({ ...prev, minVolume: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="bg-black border-green-400/30 text-green-400 font-mono"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm text-green-400 font-mono mb-2 block">Max Difficulty</label>
                <Input
                  type="number"
                  value={filters.maxDifficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDifficulty: parseInt(e.target.value) || 100 }))}
                  placeholder="100"
                  className="bg-black border-green-400/30 text-green-400 font-mono"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm text-green-400 font-mono mb-2 block">Min CPC ($)</label>
                <Input
                  type="number"
                  value={filters.minCPC}
                  onChange={(e) => setFilters(prev => ({ ...prev, minCPC: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  step="0.01"
                  className="bg-black border-green-400/30 text-green-400 font-mono"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="w-full bg-green-400 hover:bg-green-500 text-black font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Research Keywords
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-mono">{error.message || 'An error occurred'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {filteredKeywords.length > 0 && (
        <div className="space-y-4">
          {/* Actions Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-green-400 font-mono">
                {filteredKeywords.length} keywords found
              </span>
              {selectedKeywords.length > 0 && (
                <Badge className="bg-green-400/20 text-green-400">
                  {selectedKeywords.length} selected
                </Badge>
              )}
            </div>

            {!isPublic && (
              <div className="flex gap-2">
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>

          {/* Keywords Table */}
          <Card className="bg-black/50 border-green-400/30">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-green-400/30">
                    <tr className="text-left text-green-400 font-mono text-sm">
                      {!isPublic && <th className="p-4 w-12"></th>}
                      <th className="p-4 cursor-pointer hover:bg-green-400/5" onClick={() => handleSort('keyword')}>
                        <div className="flex items-center gap-2">
                          Keyword
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-green-400/5" onClick={() => handleSort('search_volume')}>
                        <div className="flex items-center gap-2">
                          Volume
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-green-400/5" onClick={() => handleSort('difficulty')}>
                        <div className="flex items-center gap-2">
                          Difficulty
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-green-400/5" onClick={() => handleSort('cpc')}>
                        <div className="flex items-center gap-2">
                          CPC
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      {config.show_trends !== false && (
                        <th className="p-4 cursor-pointer hover:bg-green-400/5" onClick={() => handleSort('trend')}>
                          <div className="flex items-center gap-2">
                            Trend
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      <th className="p-4 cursor-pointer hover:bg-green-400/5" onClick={() => handleSort('opportunity_score')}>
                        <div className="flex items-center gap-2">
                          Opportunity
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeywords.map((kw, index) => (
                      <motion.tr
                        key={kw.keyword}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-green-400/10 hover:bg-green-400/5 text-green-400/80"
                      >
                        {!isPublic && (
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedKeywords.some(sk => sk.keyword === kw.keyword)}
                              onChange={() => toggleKeywordSelection(kw)}
                              className="w-4 h-4"
                            />
                          </td>
                        )}
                        <td className="p-4 font-medium">{kw.keyword}</td>
                        <td className="p-4 font-mono">{kw.search_volume.toLocaleString()}</td>
                        <td className="p-4">
                          <Badge className={`${getDifficultyColor(kw.difficulty)} font-mono`}>
                            {kw.difficulty}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono">${kw.cpc}</td>
                        {config.show_trends !== false && (
                          <td className="p-4">
                            {parseFloat(kw.trend) > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <span className="text-green-400/40">-</span>
                            )}
                          </td>
                        )}
                        <td className="p-4">
                          <Badge className={`${getOpportunityColor(kw.opportunity_score)} font-mono`}>
                            {kw.opportunity_score}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Public Upgrade CTA */}
      {isPublic && filteredKeywords.length > 0 && (
        <Card className="bg-gradient-to-r from-green-400/10 to-blue-400/10 border-green-400/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Lock className="w-5 h-5" />
                <h3 className="text-xl font-bold font-mono">Want More Keywords?</h3>
              </div>
              <p className="text-green-400/80">
                Public access shows up to 10 keywords. Sign up for free to unlock:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-green-400/80">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Up to 50 keywords per search</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>10 searches per day (vs. 3)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Advanced filtering and sorting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Export to CSV</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Save keywords to your content calendar</span>
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
};

export default KeywordResearchUI;
