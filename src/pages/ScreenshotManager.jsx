/**
 * Screenshot Manager Page
 *
 * Hidden page at /screenshot-manager route
 * Gallery view of all screenshots with timeline
 * Filter by page, date range, viewport
 * View before/after comparisons
 *
 * @module ScreenshotManager
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download, Trash2, ExternalLink, Filter, Search, Image as ImageIcon } from 'lucide-react';

/**
 * All pages in the application
 */
const ALL_PAGES = [
  '/',
  '/assessment',
  '/calculator',
  '/solutions',
  '/work',
  '/about',
  '/resources',
  '/contact',
  '/blog',
  '/work-saas-content-engine',
  '/work-tradeworx-usa',
  '/work-timber-view-financial',
  '/work-the-wellness-way',
  '/work-sound-corrections',
  '/work-segpro',
  '/work-neuro-mastery',
  '/work-muscle-works',
  '/work-granite-paving',
  '/work-auto-trim-utah',
  '/solutions-ai-automation',
  '/solutions-social-media',
  '/solutions-seo-geo',
  '/solutions-lead-generation',
  '/solutions-paid-advertising',
  '/solutions-podcasting',
  '/solutions-custom-apps',
  '/solutions-crm-management',
  '/solutions-fractional-cmo',
  '/podcast',
  '/gallery',
  '/faq'
];

/**
 * Viewport options
 */
const VIEWPORTS = ['desktop', 'tablet', 'mobile', 'large-desktop'];

/**
 * Screenshot Manager Component
 */
export default function ScreenshotManager() {
  const [screenshots, setScreenshots] = useState([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('all');
  const [selectedViewport, setSelectedViewport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareScreenshots, setCompareScreenshots] = useState([]);

  /**
   * Load screenshots from database
   */
  useEffect(() => {
    loadScreenshots();
    loadPairs();
  }, []);

  /**
   * Filter screenshots when filters change
   */
  useEffect(() => {
    filterScreenshots();
  }, [screenshots, selectedPage, selectedViewport, searchQuery, startDate, endDate]);

  /**
   * Load all screenshots
   */
  async function loadScreenshots() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('page_screenshots')
        .select('*')
        .order('captured_at', { ascending: false });

      if (error) throw error;

      setScreenshots(data || []);
    } catch (error) {
      console.error('Failed to load screenshots:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load screenshot pairs
   */
  async function loadPairs() {
    try {
      const { data, error } = await supabase
        .from('screenshot_pairs')
        .select('*')
        .order('before_captured_at', { ascending: false });

      if (error) throw error;

      setPairs(data || []);
    } catch (error) {
      console.error('Failed to load pairs:', error);
    }
  }

  /**
   * Filter screenshots based on current filters
   */
  function filterScreenshots() {
    let filtered = [...screenshots];

    // Filter by page
    if (selectedPage !== 'all') {
      filtered = filtered.filter(s => s.page_route === selectedPage);
    }

    // Filter by viewport
    if (selectedViewport !== 'all') {
      filtered = filtered.filter(s => s.viewport_size === selectedViewport);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.change_description.toLowerCase().includes(query) ||
        s.page_route.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(s => new Date(s.captured_at) >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(s => new Date(s.captured_at) <= endDate);
    }

    setFilteredScreenshots(filtered);
  }

  /**
   * Delete screenshot
   */
  async function deleteScreenshot(id) {
    if (!confirm('Are you sure you want to delete this screenshot?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('page_screenshots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reload screenshots
      await loadScreenshots();
    } catch (error) {
      console.error('Failed to delete screenshot:', error);
      alert('Failed to delete screenshot');
    }
  }

  /**
   * Download screenshot
   */
  async function downloadScreenshot(url, filename) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'screenshot.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download screenshot:', error);
      alert('Failed to download screenshot');
    }
  }

  /**
   * Batch download screenshots
   */
  async function batchDownload() {
    for (const screenshot of filteredScreenshots) {
      const filename = `${screenshot.page_route.replace(/\//g, '-')}_${screenshot.viewport_size}_${format(new Date(screenshot.captured_at), 'yyyyMMdd-HHmmss')}.png`;
      await downloadScreenshot(screenshot.screenshot_url, filename);
      // Wait between downloads to avoid overwhelming browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Toggle compare mode
   */
  function toggleCompareMode(screenshot) {
    if (!compareMode) {
      setCompareMode(true);
      setCompareScreenshots([screenshot]);
    } else {
      if (compareScreenshots.length < 2) {
        setCompareScreenshots([...compareScreenshots, screenshot]);
      } else {
        setCompareScreenshots([screenshot]);
      }
    }
  }

  /**
   * Clear filters
   */
  function clearFilters() {
    setSelectedPage('all');
    setSelectedViewport('all');
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
  }

  /**
   * Stats
   */
  const stats = {
    total: screenshots.length,
    pages: new Set(screenshots.map(s => s.page_route)).size,
    changes: new Set(screenshots.map(s => s.related_change_id)).size,
    pairs: pairs.length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Screenshot Manager</h1>
          <p className="text-lg text-gray-600">
            Visual change tracking and before/after comparisons
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Screenshots</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pages Covered</CardDescription>
              <CardTitle className="text-3xl">{stats.pages}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Changes Tracked</CardDescription>
              <CardTitle className="text-3xl">{stats.changes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Before/After Pairs</CardDescription>
              <CardTitle className="text-3xl">{stats.pairs}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Page filter */}
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="All Pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  {ALL_PAGES.map(page => (
                    <SelectItem key={page} value={page}>
                      {page === '/' ? 'Home' : page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Viewport filter */}
              <Select value={selectedViewport} onValueChange={setSelectedViewport}>
                <SelectTrigger>
                  <SelectValue placeholder="All Viewports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Viewports</SelectItem>
                  {VIEWPORTS.map(viewport => (
                    <SelectItem key={viewport} value={viewport}>
                      {viewport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date range */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Start Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'End Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="outline" onClick={batchDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download All ({filteredScreenshots.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="pairs">Before/After Pairs</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Gallery View */}
          <TabsContent value="gallery">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading screenshots...</p>
              </div>
            ) : filteredScreenshots.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No screenshots found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try adjusting your filters or capture new screenshots
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScreenshots.map(screenshot => (
                  <Card key={screenshot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-100 relative group cursor-pointer" onClick={() => setSelectedScreenshot(screenshot)}>
                      <img
                        src={screenshot.screenshot_url}
                        alt={screenshot.change_description}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button variant="secondary">View Full Size</Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{screenshot.change_description}</h3>
                          <p className="text-xs text-gray-500">{screenshot.page_route}</p>
                        </div>
                        <Badge variant={screenshot.captured_before_change ? 'default' : 'secondary'}>
                          {screenshot.captured_before_change ? 'Before' : 'After'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Badge variant="outline">{screenshot.viewport_size}</Badge>
                        <span>{format(new Date(screenshot.captured_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadScreenshot(screenshot.screenshot_url, `${screenshot.page_route}-${screenshot.viewport_size}.png`)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(screenshot.screenshot_url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCompareMode(screenshot)}
                        >
                          Compare
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteScreenshot(screenshot.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Before/After Pairs */}
          <TabsContent value="pairs">
            {pairs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No before/after pairs available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {pairs.map(pair => (
                  <Card key={pair.related_change_id}>
                    <CardHeader>
                      <CardTitle>{pair.change_description}</CardTitle>
                      <CardDescription>
                        {pair.page_route} • {pair.viewport_size}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before */}
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge>Before</Badge>
                            <span className="text-sm text-gray-500">
                              {format(new Date(pair.before_captured_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={pair.before_url}
                              alt="Before"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* After */}
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="secondary">After</Badge>
                            <span className="text-sm text-gray-500">
                              {pair.after_captured_at ? format(new Date(pair.after_captured_at), 'MMM d, h:mm a') : 'Not captured'}
                            </span>
                          </div>
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            {pair.after_url ? (
                              <img
                                src={pair.after_url}
                                alt="After"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <p>After screenshot not captured yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Timeline View */}
          <TabsContent value="timeline">
            <div className="space-y-4">
              {filteredScreenshots.map((screenshot, index) => {
                const prevDate = index > 0 ? new Date(filteredScreenshots[index - 1].captured_at).toDateString() : null;
                const currentDate = new Date(screenshot.captured_at).toDateString();
                const showDateHeader = prevDate !== currentDate;

                return (
                  <div key={screenshot.id}>
                    {showDateHeader && (
                      <div className="flex items-center gap-4 mb-4 mt-8 first:mt-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {format(new Date(screenshot.captured_at), 'MMMM d, yyyy')}
                        </h3>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                    )}

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={screenshot.screenshot_url}
                              alt={screenshot.change_description}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setSelectedScreenshot(screenshot)}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold mb-1">{screenshot.change_description}</h4>
                                <p className="text-sm text-gray-600">{screenshot.page_route}</p>
                              </div>
                              <Badge variant={screenshot.captured_before_change ? 'default' : 'secondary'}>
                                {screenshot.captured_before_change ? 'Before' : 'After'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                              <Badge variant="outline">{screenshot.viewport_size}</Badge>
                              <span>{format(new Date(screenshot.captured_at), 'h:mm a')}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadScreenshot(screenshot.screenshot_url)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteScreenshot(screenshot.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Screenshot Detail Dialog */}
        <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            {selectedScreenshot && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedScreenshot.change_description}</DialogTitle>
                  <DialogDescription>
                    {selectedScreenshot.page_route} • {selectedScreenshot.viewport_size} •{' '}
                    {format(new Date(selectedScreenshot.captured_at), 'MMM d, yyyy h:mm a')}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <img
                    src={selectedScreenshot.screenshot_url}
                    alt={selectedScreenshot.change_description}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => downloadScreenshot(selectedScreenshot.screenshot_url)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => window.open(selectedScreenshot.screenshot_url, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Compare Mode */}
        {compareMode && compareScreenshots.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Compare Mode ({compareScreenshots.length}/2)</h3>
                <Button variant="outline" onClick={() => { setCompareMode(false); setCompareScreenshots([]); }}>
                  Exit
                </Button>
              </div>
              {compareScreenshots.length === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  {compareScreenshots.map((screenshot, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium mb-2">{screenshot.change_description}</p>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={screenshot.screenshot_url}
                          alt={screenshot.change_description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
