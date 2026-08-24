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
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * SEO Keyword Research Component
 * Uses DataForSEO API to find and analyze keywords
 */
const SEOKeywordResearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('2840'); // United States
  const [language, setLanguage] = useState('en');
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('search_volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    minVolume: 0,
    maxDifficulty: 100,
    minCPC: 0
  });

  // Location options (common English-speaking markets)
  const locations = [
    { value: '2840', label: 'United States' },
    { value: '2826', label: 'United Kingdom' },
    { value: '2124', label: 'Canada' },
    { value: '2036', label: 'Australia' },
    { value: '2554', label: 'New Zealand' }
  ];

  /**
   * Search for keywords using DataForSEO API via Netlify Function
   */
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a keyword to search');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Call Netlify Function (credentials are secure server-side)
      const response = await fetch('/.netlify/functions/dataforseo-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchTerm,
          location,
          language
        })
      });

      // If function not found (local dev without netlify dev), use mock data
      if (response.status === 404) {
        console.warn('Netlify Function not available. Using mock data. Run "netlify dev" to test functions locally.');
        const mockKeywords = generateMockKeywords(searchTerm);
        setKeywords(mockKeywords);
        return;
      }

      if (!response.ok) {
        throw new Error(`Function error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      if (!data.keywords || data.keywords.length === 0) {
        setError('No keywords found. Try a different search term.');
        setKeywords([]);
        return;
      }

      setKeywords(data.keywords);

    } catch (err) {
      console.error('Search error:', err);

      // If it's a network error or function not available, use mock data in dev
      if (import.meta.env.DEV && (err.message.includes('404') || err.message.includes('Failed to fetch'))) {
        console.log('Using mock data for development. Deploy or run "netlify dev" for real data.');
        const mockKeywords = generateMockKeywords(searchTerm);
        setKeywords(mockKeywords);
      } else {
        setError(`Search failed: ${err.message}`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Generate mock keyword data for development
   */
  const generateMockKeywords = (seed) => {
    const variations = [
      seed,
      `${seed} services`,
      `${seed} solutions`,
      `best ${seed}`,
      `${seed} companies`,
      `${seed} tools`,
      `${seed} software`,
      `${seed} agency`,
      `${seed} consulting`,
      `affordable ${seed}`,
      `${seed} pricing`,
      `${seed} cost`,
      `${seed} providers`,
      `top ${seed}`,
      `${seed} examples`
    ];

    return variations.map((keyword, index) => ({
      keyword,
      search_volume: Math.floor(Math.random() * 10000) + 100,
      competition: Math.random(),
      competition_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      cpc: (Math.random() * 50).toFixed(2),
      difficulty: Math.floor(Math.random() * 100),
      trend: (Math.random() * 2 - 1).toFixed(2), // -1 to 1
      opportunity_score: Math.floor(Math.random() * 100)
    }));
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

    // Handle string values
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
   * Save selected keywords to blog post
   */
  const handleSaveToPost = async () => {
    if (selectedKeywords.length === 0) {
      setError('Please select at least one keyword');
      return;
    }

    try {
      // TODO: Integrate with DataManager to save to posts table
      // const primaryKeyword = selectedKeywords[0].keyword;
      // const secondaryKeywords = selectedKeywords.slice(1).map(k => k.keyword);

      console.log('Saving keywords:', {
        primary: selectedKeywords[0].keyword,
        secondary: selectedKeywords.slice(1).map(k => k.keyword)
      });

      alert(`Saved ${selectedKeywords.length} keywords (TODO: implement database save)`);
    } catch (err) {
      setError(`Save failed: ${err.message}`);
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
      {/* Search Interface */}
      <Card className="bg-black/50 border-green-400/30">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-6 h-6 text-green-400" />
            <div>
              <CardTitle className="text-green-400 font-mono">Keyword Research</CardTitle>
              <CardDescription className="text-green-400/60">
                Discover high-value keywords using DataForSEO API
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-green-400 font-mono mb-2 block">Seed Keyword</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., AI automation, digital marketing"
                className="bg-black border-green-400/30 text-green-400 font-mono"
              />
            </div>

            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="bg-black border-green-400/30 text-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-400/30">
                  {locations.map(loc => (
                    <SelectItem key={loc.value} value={loc.value} className="text-green-400">
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block">Min Volume</label>
              <Input
                type="number"
                value={filters.minVolume}
                onChange={(e) => setFilters(prev => ({ ...prev, minVolume: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="bg-black border-green-400/30 text-green-400 font-mono"
              />
            </div>

            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block">Max Difficulty</label>
              <Input
                type="number"
                value={filters.maxDifficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDifficulty: parseInt(e.target.value) || 100 }))}
                placeholder="100"
                max="100"
                className="bg-black border-green-400/30 text-green-400 font-mono"
              />
            </div>

            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block">Min CPC ($)</label>
              <Input
                type="number"
                step="0.01"
                value={filters.minCPC}
                onChange={(e) => setFilters(prev => ({ ...prev, minCPC: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="bg-black border-green-400/30 text-green-400 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-400 rounded">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="w-full bg-green-400 text-black hover:bg-green-300 font-mono"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching Keywords...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Keywords
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Summary */}
          <Card className="bg-black/50 border-green-400/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400 font-mono">{filteredKeywords.length}</div>
                  <div className="text-xs text-green-400/60">Keywords Found</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400 font-mono">{selectedKeywords.length}</div>
                  <div className="text-xs text-green-400/60">Selected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    {Math.round(filteredKeywords.reduce((sum, kw) => sum + kw.search_volume, 0) / filteredKeywords.length).toLocaleString()}
                  </div>
                  <div className="text-xs text-green-400/60">Avg Volume</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    {Math.round(filteredKeywords.reduce((sum, kw) => sum + kw.difficulty, 0) / filteredKeywords.length)}
                  </div>
                  <div className="text-xs text-green-400/60">Avg Difficulty</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    ${(filteredKeywords.reduce((sum, kw) => sum + parseFloat(kw.cpc), 0) / filteredKeywords.length).toFixed(2)}
                  </div>
                  <div className="text-xs text-green-400/60">Avg CPC</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleSaveToPost}
              disabled={selectedKeywords.length === 0}
              className="bg-green-400 text-black hover:bg-green-300 font-mono"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Post ({selectedKeywords.length})
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-green-400/50 text-green-400 hover:bg-green-400/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={handleSearch}
              variant="outline"
              className="border-green-400/50 text-green-400 hover:bg-green-400/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Keywords Table */}
          <Card className="bg-black/50 border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">
                Keyword Analysis ({filteredKeywords.length} results)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-400/30">
                      <th className="text-left py-3 px-2 text-green-400 font-mono">
                        <input
                          type="checkbox"
                          checked={selectedKeywords.length === filteredKeywords.length && filteredKeywords.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedKeywords([...filteredKeywords]);
                            } else {
                              setSelectedKeywords([]);
                            }
                          }}
                          className="mr-2"
                        />
                      </th>
                      <th
                        onClick={() => handleSort('keyword')}
                        className="text-left py-3 px-2 text-green-400 font-mono cursor-pointer hover:text-green-300"
                      >
                        Keyword <ArrowUpDown className="w-3 h-3 inline ml-1" />
                      </th>
                      <th
                        onClick={() => handleSort('search_volume')}
                        className="text-right py-3 px-2 text-green-400 font-mono cursor-pointer hover:text-green-300"
                      >
                        Volume <ArrowUpDown className="w-3 h-3 inline ml-1" />
                      </th>
                      <th
                        onClick={() => handleSort('difficulty')}
                        className="text-center py-3 px-2 text-green-400 font-mono cursor-pointer hover:text-green-300"
                      >
                        Difficulty <ArrowUpDown className="w-3 h-3 inline ml-1" />
                      </th>
                      <th
                        onClick={() => handleSort('cpc')}
                        className="text-right py-3 px-2 text-green-400 font-mono cursor-pointer hover:text-green-300"
                      >
                        CPC <ArrowUpDown className="w-3 h-3 inline ml-1" />
                      </th>
                      <th
                        onClick={() => handleSort('competition_level')}
                        className="text-center py-3 px-2 text-green-400 font-mono cursor-pointer hover:text-green-300"
                      >
                        Competition <ArrowUpDown className="w-3 h-3 inline ml-1" />
                      </th>
                      <th
                        onClick={() => handleSort('opportunity_score')}
                        className="text-center py-3 px-2 text-green-400 font-mono cursor-pointer hover:text-green-300"
                      >
                        Opportunity <ArrowUpDown className="w-3 h-3 inline ml-1" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeywords.map((kw, index) => {
                      const isSelected = selectedKeywords.find(k => k.keyword === kw.keyword);
                      return (
                        <tr
                          key={index}
                          onClick={() => toggleKeywordSelection(kw)}
                          className={`border-b border-green-400/10 cursor-pointer hover:bg-green-400/5 transition-colors ${
                            isSelected ? 'bg-green-400/10' : ''
                          }`}
                        >
                          <td className="py-3 px-2">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => {}}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-2 text-green-400 font-mono">{kw.keyword}</td>
                          <td className="py-3 px-2 text-right text-green-400 font-mono">
                            {kw.search_volume.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge className={getDifficultyColor(kw.difficulty)}>
                              {kw.difficulty}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-right text-green-400 font-mono">${kw.cpc}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge className={
                              kw.competition_level === 'Low' ? 'bg-green-400/20 text-green-400 border-green-400' :
                              kw.competition_level === 'Medium' ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400' :
                              'bg-red-400/20 text-red-400 border-red-400'
                            }>
                              {kw.competition_level}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge className={getOpportunityColor(kw.opportunity_score)}>
                              {kw.opportunity_score}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SEOKeywordResearch;
