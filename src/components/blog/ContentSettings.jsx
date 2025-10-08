/**
 * ContentSettings Component
 *
 * Configuration panel for AI content generation settings:
 * - Focus keywords for title and article generation
 * - AI writing directives (tone, style, voice)
 * - Default word count range
 * - AI model preferences
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

/**
 * ContentSettings Component
 */
export default function ContentSettings({ brainId }) {
  const [settings, setSettings] = useState({
    focus_keywords: [],
    ai_writing_directives: '',
    default_word_count_min: 1500,
    default_word_count_max: 3000,
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brainId]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Try to load existing settings
      const { data, error } = await supabase
        .from('content_settings')
        .select('*')
        .eq('brain_id', brainId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine
        throw error;
      }

      if (data) {
        setSettings({
          focus_keywords: data.focus_keywords || [],
          ai_writing_directives: data.ai_writing_directives || '',
          default_word_count_min: data.default_word_count_min || 1500,
          default_word_count_max: data.default_word_count_max || 3000,
        });
      }
    } catch (error) {
      console.error('Error loading content settings:', error);
      // Don't show error toast on initial load - settings might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      // Upsert settings (insert or update)
      const { error } = await supabase
        .from('content_settings')
        .upsert(
          {
            brain_id: brainId,
            focus_keywords: settings.focus_keywords,
            ai_writing_directives: settings.ai_writing_directives,
            default_word_count_min: settings.default_word_count_min,
            default_word_count_max: settings.default_word_count_max,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'brain_id' }
        );

      if (error) throw error;

      toast.success('Settings saved successfully!', {
        description: 'Your content generation preferences have been updated',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings', {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = () => {
    const keyword = newKeyword.trim();
    if (!keyword) return;

    if (settings.focus_keywords.includes(keyword)) {
      toast.error('Keyword already added');
      return;
    }

    setSettings({
      ...settings,
      focus_keywords: [...settings.focus_keywords, keyword],
    });
    setNewKeyword('');
    toast.success('Keyword added', {
      description: `"${keyword}" added to focus keywords`,
    });
  };

  const handleRemoveKeyword = (keyword) => {
    setSettings({
      ...settings,
      focus_keywords: settings.focus_keywords.filter((k) => k !== keyword),
    });
    toast.success('Keyword removed');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Content Generation Settings
          </CardTitle>
          <CardDescription>
            Configure AI behavior for blog title and article generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Focus Keywords */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="focusKeywords" className="text-base font-semibold">
                Focus Keywords
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Primary SEO keywords to target in generated titles and articles
              </p>
            </div>

            {/* Keyword Input */}
            <div className="flex gap-2">
              <Input
                id="focusKeywords"
                placeholder="e.g., digital marketing, SEO optimization"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
              />
              <Button onClick={handleAddKeyword} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Keywords List */}
            {settings.focus_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.focus_keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5">
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg text-center">
                No keywords added yet. Add keywords to improve AI content generation.
              </div>
            )}
          </div>

          {/* AI Writing Directives */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="aiDirectives" className="text-base font-semibold">
                AI Writing Directives
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Customize tone, style, and voice for AI-generated content
              </p>
            </div>
            <Textarea
              id="aiDirectives"
              placeholder="e.g., Write in a professional, conversational tone for small business owners. Use real-world examples and actionable tips. Avoid jargon and keep sentences clear and concise."
              value={settings.ai_writing_directives}
              onChange={(e) =>
                setSettings({ ...settings, ai_writing_directives: e.target.value })
              }
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: Be specific about your audience, tone, and style preferences
            </p>
          </div>

          {/* Word Count Range */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-semibold">Default Word Count Range</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Set the target word count range for generated articles
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minWords">Minimum Words</Label>
                <Input
                  id="minWords"
                  type="number"
                  min="500"
                  max="5000"
                  step="100"
                  value={settings.default_word_count_min}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_word_count_min: parseInt(e.target.value) || 1500,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWords">Maximum Words</Label>
                <Input
                  id="maxWords"
                  type="number"
                  min="500"
                  max="5000"
                  step="100"
                  value={settings.default_word_count_max}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_word_count_max: parseInt(e.target.value) || 3000,
                    })
                  }
                />
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>
                  Articles will be generated between{' '}
                  <strong>{settings.default_word_count_min}</strong> and{' '}
                  <strong>{settings.default_word_count_max}</strong> words
                </span>
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">How Settings Are Used</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <strong className="text-foreground">Focus Keywords</strong> are used when
              generating blog titles and are naturally incorporated throughout article content
              for SEO optimization.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <strong className="text-foreground">AI Writing Directives</strong> guide the AI's
              tone, style, and approach when generating content. Be specific about your audience
              and preferences.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <div>
              <strong className="text-foreground">Word Count Range</strong> sets the default
              target length for articles. You can still adjust this per-article in the
              generator.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
