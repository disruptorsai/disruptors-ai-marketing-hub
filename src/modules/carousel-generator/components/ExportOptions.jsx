import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileArchive, FileJson, Copy, CheckCircle2, ExternalLink, Instagram } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

/**
 * Export Options Component
 *
 * Display completed carousel and export options
 *
 * Props:
 * - carousel: object with slides, metadata
 * - exportData: object with ZIP URL, Canva JSON, captions
 * - onExport: (format) => void
 * - onRegenerateSlide: (slideNumber) => void (optional)
 */
export default function ExportOptions({
  carousel,
  exportData,
  onExport,
  onRegenerateSlide
}) {
  const [copied, setCopied] = useState(false);
  const [captionView, setCaptionView] = useState('main');

  const slides = carousel?.slides || [];
  const totalCost = carousel?.total_cost || 0;
  const generationTime = carousel?.generation_duration_ms || 0;

  const handleCopyCaption = (caption) => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Carousel Ready!
              </CardTitle>
              <CardDescription>
                {carousel?.topic}
              </CardDescription>
            </div>
            <div className="text-right space-y-1">
              <Badge variant="outline" className="font-mono">
                ${totalCost.toFixed(2)}
              </Badge>
              <p className="text-xs text-gray-500">
                {(generationTime / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Preview Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>
            {slides.length} slides • Swipe right on Instagram
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {slides.map((slide, index) => (
              <div key={slide.slide} className="space-y-2">
                <div className="relative group">
                  <img
                    src={slide.image_url}
                    alt={`Slide ${slide.slide}`}
                    className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200 dark:border-gray-800"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="text-white text-center p-2">
                      <p className="text-xs font-medium mb-2">Slide {slide.slide}</p>
                      <a
                        href={slide.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Full
                      </a>
                      {onRegenerateSlide && (
                        <button
                          onClick={() => onRegenerateSlide(slide.slide)}
                          className="block w-full mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                        >
                          Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                    {slide.slide}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {slide.text.split('\n')[0]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Download Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Download</CardTitle>
            <CardDescription>
              Export your carousel in multiple formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Individual PNGs */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Individual PNGs</p>
                  <p className="text-xs text-gray-500">
                    {slides.length} files • Download each slide separately
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {slides.map((slide) => (
                  <Button
                    key={slide.slide}
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href={slide.image_url} download={`slide_${slide.slide}.png`}>
                      #{slide.slide}
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            {/* ZIP Archive */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileArchive className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">ZIP Archive</p>
                  <p className="text-xs text-gray-500">
                    All slides in one file
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onExport('zip')}
                disabled={!exportData?.zip?.download_url}
              >
                <Download className="w-4 h-4 mr-2" />
                Download ZIP
              </Button>
            </div>

            {/* Canva JSON */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileJson className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Canva JSON</p>
                  <p className="text-xs text-gray-500">
                    Import into Canva for editing
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport('canva')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instagram Captions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Instagram className="w-5 h-5" />
              Instagram Captions
            </CardTitle>
            <CardDescription>
              AI-generated captions for your post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exportData?.captions && (
              <>
                <Tabs value={captionView} onValueChange={setCaptionView}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="main">Main Caption</TabsTrigger>
                    <TabsTrigger value="alternative">Alternative</TabsTrigger>
                  </TabsList>

                  <TabsContent value="main" className="space-y-2">
                    <Textarea
                      value={exportData.captions.main}
                      readOnly
                      rows={8}
                      className="text-sm font-mono resize-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCopyCaption(exportData.captions.main)}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? 'Copied!' : 'Copy Caption'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="alternative" className="space-y-2">
                    <Textarea
                      value={exportData.captions.alternative}
                      readOnly
                      rows={8}
                      className="text-sm font-mono resize-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCopyCaption(exportData.captions.alternative)}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? 'Copied!' : 'Copy Caption'}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Hashtags */}
                {exportData.captions.hashtags && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suggested Hashtags
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {exportData.captions.hashtags.slice(0, 10).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {slides.length}
              </p>
              <p className="text-xs text-gray-500">Slides Created</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Total Cost</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {(generationTime / 1000).toFixed(0)}s
              </p>
              <p className="text-xs text-gray-500">Generation Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {carousel?.research_examples_count || 0}
              </p>
              <p className="text-xs text-gray-500">Carousels Analyzed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
