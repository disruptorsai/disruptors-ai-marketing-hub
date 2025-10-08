import React, { useState, useEffect } from 'react';
import { Brain, Search, Palette, MessageSquare, Plug2, Plus, Edit, Trash2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { BrainAPI } from '@/lib/brain-api';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/components/ui/use-toast';
import BrainThemedLayout, { BrandedHeading, BrandedButton } from '@/components/layout/BrainThemedLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Business Brain Manager - Main Dashboard for Managing Business Brain
 *
 * Features:
 * - Dashboard: Brain health metrics and quick stats
 * - Knowledge Explorer: Search, filter, and manage brain facts
 * - Brand Voice: View and edit brand guidelines
 * - Onboarding: AI-powered conversation for brain enhancement
 * - Integrations: Connect data sources (placeholder)
 *
 * @component
 */
export default function BusinessBrainManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBrain();
  }, []);

  const loadBrain = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to access Business Brain Manager');
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to access your Business Brain.',
          variant: 'destructive',
        });
        return;
      }

      const brainData = await BrainAPI.getBrainByUser(user.id);
      setBrain(brainData);
    } catch (err) {
      console.error('Failed to load brain:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load Business Brain. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BrainThemedLayout showLoading={true}>
        <LoadingState />
      </BrainThemedLayout>
    );
  }

  if (error || !brain) {
    return (
      <BrainThemedLayout showLoading={false}>
        <ErrorState error={error} onRetry={loadBrain} />
      </BrainThemedLayout>
    );
  }

  return (
    <BrainThemedLayout>
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-10 w-10 text-[var(--brand-primary)]" />
              <BrandedHeading level={1} className="text-4xl">
                Business Brain Manager
              </BrandedHeading>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage your AI-powered business knowledge hub for{' '}
              <span className="font-semibold text-[var(--brand-primary)]">
                {brain.business_name}
              </span>
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-2 data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white">
                <Search className="h-4 w-4" />
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="brand" className="gap-2 data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white">
                <Palette className="h-4 w-4" />
                Brand Voice
              </TabsTrigger>
              <TabsTrigger value="onboarding" className="gap-2 data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4" />
                Onboarding
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2 data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white">
                <Plug2 className="h-4 w-4" />
                Integrations
              </TabsTrigger>
            </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab brain={brain} onRefresh={loadBrain} />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeExplorerTab brainId={brain.id} />
          </TabsContent>

          <TabsContent value="brand">
            <BrandVoiceTab brainId={brain.id} brain={brain} />
          </TabsContent>

          <TabsContent value="onboarding">
            <OnboardingTab brainId={brain.id} brain={brain} onRefresh={loadBrain} />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </BrainThemedLayout>
  );
}

/**
 * Dashboard Tab - Brain health metrics and overview
 */
function DashboardTab({ brain, onRefresh }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, [brain]);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const healthData = await BrainAPI.getBrainHealth(brain.id);
      setHealth(healthData);
    } catch (err) {
      console.error('Failed to load health:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const healthColor =
    health.healthScore >= 80 ? 'text-green-600' :
    health.healthScore >= 50 ? 'text-yellow-600' :
    'text-red-600';

  const levelConfig = {
    starter: { color: 'bg-blue-100 text-blue-800', label: 'Starter' },
    enhanced: { color: 'bg-purple-100 text-purple-800', label: 'Enhanced' },
    expert: { color: 'bg-green-100 text-green-800', label: 'Expert' },
  };

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Brain Health Score
            <Badge className={levelConfig[health.brainLevel]?.color || 'bg-gray-100 text-gray-800'}>
              {levelConfig[health.brainLevel]?.label || 'Unknown'}
            </Badge>
          </CardTitle>
          <CardDescription>Overall brain performance and completeness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className={`text-6xl font-bold ${healthColor}`}>
              {health.healthScore}
            </div>
            <div className="text-2xl text-muted-foreground mb-2">/100</div>
          </div>
          <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                health.healthScore >= 80 ? 'bg-green-600' :
                health.healthScore >= 50 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${health.healthScore}%` }}
            />
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Last updated: {new Date(health.lastUpdated).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </CardFooter>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Facts"
          value={health.totalFacts}
          icon={<Brain className="h-5 w-5 text-blue-600" />}
          description="Knowledge entries in brain"
        />
        <MetricCard
          title="Verified Facts"
          value={health.verifiedFacts}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          description={`${Math.round(health.verificationRate * 100)}% verification rate`}
        />
        <MetricCard
          title="Confidence Score"
          value={`${Math.round(health.confidenceScore * 100)}%`}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          description="Data accuracy level"
        />
        <MetricCard
          title="Onboarding"
          value={health.onboardingCompleted ? 'Complete' : 'Incomplete'}
          icon={
            health.onboardingCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )
          }
          description={health.onboardingCompleted ? 'All set!' : 'Start onboarding to improve'}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and improvements</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Button variant="outline" className="justify-start" onClick={onRefresh}>
            <Brain className="mr-2 h-4 w-4" />
            Refresh Brain Data
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => document.querySelector('[value="knowledge"]').click()}
          >
            <Search className="mr-2 h-4 w-4" />
            Explore Knowledge
          </Button>
          {!health.onboardingCompleted && (
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => document.querySelector('[value="onboarding"]').click()}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Complete Onboarding
            </Button>
          )}
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => document.querySelector('[value="brand"]').click()}
          >
            <Palette className="mr-2 h-4 w-4" />
            Review Brand Voice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ title, value, icon, description }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Knowledge Explorer Tab - Search and manage brain facts
 */
function KnowledgeExplorerTab({ brainId }) {
  const { toast } = useToast();
  const [facts, setFacts] = useState([]);
  const [filteredFacts, setFilteredFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingFact, setEditingFact] = useState(null);

  useEffect(() => {
    loadFacts();
  }, [brainId]);

  useEffect(() => {
    filterFacts();
  }, [facts, searchQuery, categoryFilter, confidenceFilter]);

  const loadFacts = async () => {
    try {
      setLoading(true);
      const data = await BrainAPI.getFacts(brainId);
      setFacts(data);
      setFilteredFacts(data);
    } catch (err) {
      console.error('Failed to load facts:', err);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge facts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFacts = () => {
    let filtered = [...facts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.key?.toLowerCase().includes(query) ||
          f.value?.toLowerCase().includes(query) ||
          f.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((f) => f.category === categoryFilter);
    }

    // Confidence filter
    if (confidenceFilter !== 'all') {
      const minConfidence = confidenceFilter === 'high' ? 0.8 : confidenceFilter === 'medium' ? 0.5 : 0;
      const maxConfidence = confidenceFilter === 'high' ? 1 : confidenceFilter === 'medium' ? 0.8 : 0.5;
      filtered = filtered.filter((f) => f.confidence >= minConfidence && f.confidence < maxConfidence);
    }

    setFilteredFacts(filtered);
  };

  const handleDeleteFact = async (factId) => {
    if (!confirm('Are you sure you want to delete this fact?')) return;

    try {
      await BrainAPI.deleteFact(factId);
      toast({
        title: 'Success',
        description: 'Fact deleted successfully',
      });
      loadFacts();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete fact',
        variant: 'destructive',
      });
    }
  };

  const categories = [...new Set(facts.map((f) => f.category).filter(Boolean))];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Explorer</CardTitle>
          <CardDescription>Search and manage your brain's knowledge base</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <Input
                placeholder="Search facts by key, value, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence Levels</SelectItem>
                <SelectItem value="high">High (80%+)</SelectItem>
                <SelectItem value="medium">Medium (50-80%)</SelectItem>
                <SelectItem value="low">Low (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Manual Fact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Facts Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredFacts.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== 'all' || confidenceFilter !== 'all'
                  ? 'No facts match your filters'
                  : 'No facts found. Add some to get started!'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFacts.map((fact) => (
                  <TableRow key={fact.id}>
                    <TableCell className="font-medium">{fact.key}</TableCell>
                    <TableCell className="max-w-xs truncate">{fact.value}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{fact.category || 'general'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          fact.confidence >= 0.8
                            ? 'default'
                            : fact.confidence >= 0.5
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {Math.round(fact.confidence * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fact.source || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingFact(fact)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFact(fact.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Fact Dialog */}
      <FactDialog
        open={addDialogOpen || !!editingFact}
        onClose={() => {
          setAddDialogOpen(false);
          setEditingFact(null);
        }}
        fact={editingFact}
        brainId={brainId}
        onSuccess={loadFacts}
      />
    </div>
  );
}

/**
 * Fact Add/Edit Dialog
 */
function FactDialog({ open, onClose, fact, brainId, onSuccess }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    category: '',
    confidence: 1.0,
    source: 'user_input',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fact) {
      setFormData({
        key: fact.key || '',
        value: fact.value || '',
        category: fact.category || '',
        confidence: fact.confidence || 1.0,
        source: fact.source || 'user_input',
      });
    } else {
      setFormData({
        key: '',
        value: '',
        category: '',
        confidence: 1.0,
        source: 'user_input',
      });
    }
  }, [fact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (fact) {
        await BrainAPI.updateFact(fact.id, formData);
        toast({
          title: 'Success',
          description: 'Fact updated successfully',
        });
      } else {
        await BrainAPI.addFact(brainId, formData);
        toast({
          title: 'Success',
          description: 'Fact added successfully',
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to ${fact ? 'update' : 'add'} fact`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{fact ? 'Edit Fact' : 'Add Manual Fact'}</DialogTitle>
          <DialogDescription>
            {fact ? 'Update the fact details below' : 'Add a new fact to your brain'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Key</label>
            <Input
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="e.g., business_name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Value</label>
            <Input
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="e.g., Acme Corporation"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., company, services, contact"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Confidence: {Math.round(formData.confidence * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.confidence}
              onChange={(e) =>
                setFormData({ ...formData, confidence: parseFloat(e.target.value) })
              }
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : fact ? 'Update' : 'Add Fact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Brand Voice Tab - View and manage brand guidelines
 */
function BrandVoiceTab({ brainId, brain }) {
  const [brandRules, setBrandRules] = useState([]);
  const [brandAssets, setBrandAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandData();
  }, [brainId]);

  const loadBrandData = async () => {
    try {
      setLoading(true);
      const [rules, assets] = await Promise.all([
        BrainAPI.getBrandRules(brainId),
        BrainAPI.getBrandAssets(brainId),
      ]);
      setBrandRules(rules);
      setBrandAssets(assets);
    } catch (err) {
      console.error('Failed to load brand data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const groupedRules = brandRules.reduce((acc, rule) => {
    const category = rule.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(rule);
    return acc;
  }, {});

  const categoryLabels = {
    voice: 'Brand Voice',
    tone: 'Tone & Style',
    style: 'Writing Style',
    lexicon: 'Lexicon & Terminology',
    taboos: 'Words to Avoid',
    general: 'General Guidelines',
  };

  return (
    <div className="space-y-6">
      {/* Brand Colors and Assets */}
      {(brain.brand_colors || brandAssets.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Assets</CardTitle>
            <CardDescription>Visual identity and brand elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brain.brand_colors && (
              <div>
                <h4 className="text-sm font-medium mb-3">Brand Colors</h4>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(brain.brand_colors).map(([name, color]) => (
                    <div key={name} className="flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <div className="text-xs font-medium capitalize">{name}</div>
                        <div className="text-xs text-muted-foreground">{color}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {brandAssets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Brand Assets</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {brandAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 border rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{asset.asset_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.asset_type}
                        </div>
                      </div>
                      <Badge variant="outline">{asset.file_format}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Brand Rules */}
      {Object.keys(groupedRules).length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(groupedRules).map(([category, rules]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {categoryLabels[category] || category}
                </CardTitle>
                <CardDescription>{rules.length} guidelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-3 bg-muted rounded-lg">
                      <div className="font-medium text-sm mb-1">{rule.rule_key}</div>
                      <div className="text-sm text-muted-foreground">{rule.rule_value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No brand rules defined yet. Complete onboarding to set up your brand voice.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Brand Rules Button */}
      <Card>
        <CardContent className="pt-6">
          <Button className="w-full gap-2">
            <Edit className="h-4 w-4" />
            Edit Brand Guidelines
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Onboarding Tab - AI-powered conversation
 */
function OnboardingTab({ brainId, brain, onRefresh }) {
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSession();
  }, [brainId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await BrainAPI.getOnboardingSession(brainId);
      setSession(sessionData);
      if (sessionData?.conversation_history) {
        setConversationHistory(sessionData.conversation_history);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setProcessing(true);
      const result = await BrainAPI.enhanceBrain(brainId, 'onboarding', {
        conversationHistory: [],
      });

      if (result.session) {
        setSession(result.session);
        if (result.session.conversation_history) {
          setConversationHistory(result.session.conversation_history);
        }
      }

      toast({
        title: 'Success',
        description: 'Onboarding started!',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to start onboarding',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage = { role: 'user', content: currentInput };
    const updatedHistory = [...conversationHistory, userMessage];
    setConversationHistory(updatedHistory);
    setCurrentInput('');
    setProcessing(true);

    try {
      const result = await BrainAPI.enhanceBrain(brainId, 'onboarding', {
        conversationHistory: updatedHistory,
      });

      if (result.session?.conversation_history) {
        setConversationHistory(result.session.conversation_history);
        setSession(result.session);
      }

      if (result.session?.status === 'completed') {
        toast({
          title: 'Onboarding Complete!',
          description: 'Your Business Brain has been enhanced',
        });
        onRefresh();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to process message',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (brain.onboarding_completed) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Onboarding Complete!</h3>
          <p className="text-muted-foreground mb-6">
            Your Business Brain is fully set up and ready to use.
          </p>
          <Button onClick={startOnboarding} variant="outline">
            Start New Onboarding Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Start AI Onboarding</h3>
          <p className="text-muted-foreground mb-6">
            Answer 10 questions to help our AI understand your business better
          </p>
          <Button onClick={startOnboarding} size="lg" className="gap-2">
            <MessageSquare className="h-5 w-5" />
            Start Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>
            Question {session.current_question_index || 0} of {session.total_questions || 10}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${((session.current_question_index || 0) / (session.total_questions || 10)) * 100}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4 p-4 bg-muted/30 rounded-lg">
            {conversationHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Conversation will appear here...
              </p>
            ) : (
              conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {processing && (
              <div className="flex justify-start">
                <div className="bg-background border p-3 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !processing && sendMessage()}
              placeholder="Type your answer..."
              disabled={processing}
            />
            <Button onClick={sendMessage} disabled={processing || !currentInput.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Integrations Tab - Placeholder for future integrations
 */
function IntegrationsTab() {
  const integrations = [
    {
      name: 'Google Analytics',
      description: 'Import website traffic and user behavior data',
      status: 'coming_soon',
      icon: '📊',
    },
    {
      name: 'HubSpot',
      description: 'Sync CRM contacts and marketing data',
      status: 'coming_soon',
      icon: '🎯',
    },
    {
      name: 'Mailchimp',
      description: 'Import email marketing campaigns and metrics',
      status: 'coming_soon',
      icon: '✉️',
    },
    {
      name: 'Google My Business',
      description: 'Sync business location and review data',
      status: 'coming_soon',
      icon: '📍',
    },
    {
      name: 'Facebook/Instagram',
      description: 'Import social media posts and engagement',
      status: 'coming_soon',
      icon: '📱',
    },
    {
      name: 'Shopify',
      description: 'Sync e-commerce products and sales data',
      status: 'coming_soon',
      icon: '🛍️',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect external data sources to enhance your Business Brain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="p-4 border rounded-lg flex items-start gap-4 opacity-60"
              >
                <div className="text-4xl">{integration.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{integration.name}</h4>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Plug2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">More Integrations Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're working on adding more integrations to automatically sync data from your
            favorite tools. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Brain className="h-16 w-16 text-[var(--brand-primary)] mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading Business Brain...</p>
      </div>
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md border-2 border-[var(--brand-primary)]/20">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-[var(--brand-primary)]">Failed to Load Brain</h3>
          <p className="text-muted-foreground mb-6">
            {error || 'Could not find Business Brain for this user'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onRetry} variant="outline" className="border-[var(--brand-primary)] text-[var(--brand-primary)]">
              Try Again
            </Button>
            <BrandedButton variant="primary">Create New Brain</BrandedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
