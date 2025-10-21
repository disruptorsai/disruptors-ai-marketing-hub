import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, Sparkles, ImageIcon, TrendingUp } from 'lucide-react';
import { styleTemplateOptions, costEstimates } from '../schema';

/**
 * Topic Input Component
 *
 * First step in carousel generation:
 * - Topic input
 * - Slide count selection
 * - Style template selection
 * - Simple vs Advanced mode toggle
 *
 * Props:
 * - onSubmit: (data) => void
 * - isLoading: boolean
 * - brainContext: object (optional)
 */
export default function TopicInput({ onSubmit, isLoading = false, brainContext }) {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [styleTemplate, setStyleTemplate] = useState('educational');
  const [advancedMode, setAdvancedMode] = useState(false);

  // Calculate cost estimate
  const costRange = costEstimates.getCarouselCostRange(slideCount);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      return;
    }

    onSubmit({
      topic: topic.trim(),
      slide_count: slideCount,
      style_template: styleTemplate,
      advanced_mode: advancedMode
    });
  };

  // Get selected style details
  const selectedStyle = styleTemplateOptions.find(opt => opt.value === styleTemplate);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Create Instagram Carousel
        </CardTitle>
        <CardDescription>
          AI-powered carousel generator with intelligent image sourcing
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Brain Context (if available) */}
          {brainContext && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Business Brain Active
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {brainContext.business_name} • {brainContext.industry}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Content will be personalized with your brand voice and target audience
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-base font-semibold">
              Carousel Topic
            </Label>
            <Textarea
              id="topic"
              placeholder="e.g., 5 AI Tools to Close More Real Estate Deals"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={200}
              rows={3}
              className="resize-none"
              required
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <p>Be specific for best results</p>
              <p>{topic.length}/200</p>
            </div>
          </div>

          {/* Slide Count */}
          <div className="space-y-2">
            <Label htmlFor="slide-count" className="text-base font-semibold">
              Number of Slides
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="slide-count"
                type="number"
                min={3}
                max={10}
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
                className="w-24"
              />
              <div className="flex-1">
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <Badge variant="outline" className="whitespace-nowrap">
                {slideCount} slides
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Recommended: 5-7 slides for optimal engagement
            </p>
          </div>

          {/* Style Template */}
          <div className="space-y-2">
            <Label htmlFor="style-template" className="text-base font-semibold">
              Carousel Style
            </Label>
            <Select value={styleTemplate} onValueChange={setStyleTemplate}>
              <SelectTrigger id="style-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styleTemplateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStyle && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedStyle.description}
                </p>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Examples:</p>
                  <ul className="mt-1 space-y-0.5">
                    {selectedStyle.examples.map((example, idx) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                        • {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Mode Toggle */}
          <div className="flex items-start justify-between p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="advanced-mode" className="text-sm font-semibold cursor-pointer">
                  Advanced Mode
                </Label>
                <Badge variant="secondary" className="text-xs">
                  Power Users
                </Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {advancedMode
                  ? 'Review and customize AI image strategy before generation'
                  : 'Fully automatic - AI decides best image sourcing strategy'}
              </p>
            </div>
            <Switch
              id="advanced-mode"
              checked={advancedMode}
              onCheckedChange={setAdvancedMode}
            />
          </div>

          {/* Cost Estimate */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Estimated Cost</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ${costRange.avg}
                </p>
                <p className="text-xs text-gray-500">
                  Range: ${costRange.min} - ${costRange.max}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <InfoIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Actual cost depends on AI's image sourcing strategy.
                {advancedMode && ' You can review and adjust before generation.'}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!topic.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {advancedMode ? 'Generating Strategy...' : 'Generating Carousel...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {advancedMode ? 'Generate Strategy' : 'Generate Carousel'}
              </>
            )}
          </Button>

          {/* Help Text */}
          <p className="text-xs text-center text-gray-500">
            {advancedMode ? (
              <>Next: Review AI's image strategy before generation</>
            ) : (
              <>Carousel will be generated automatically in ~2-3 minutes</>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
