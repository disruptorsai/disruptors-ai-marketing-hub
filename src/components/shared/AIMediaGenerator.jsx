import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader, Image, Video, Volume2, Sparkles, Zap, Crown } from 'lucide-react';
import { aiOrchestrator } from '@/lib/ai-orchestrator';

const AIMediaGenerator = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [generationOptions, setGenerationOptions] = useState({
    quality: 'standard',
    budget: 'medium',
    width: 1024,
    height: 1024,
    duration: 8,
    resolution: '720p',
    voice: 'professional',
    language: 'en'
  });

  const providerOptions = {
    image: [
      { value: 'auto', label: 'Auto Select (Recommended)', icon: Sparkles },
      { value: 'gpt-image-1', label: 'OpenAI GPT-Image-1', icon: Crown, description: 'Latest & Premium' },
      { value: 'gemini-2.5-flash-image', label: 'Google Gemini 2.5 Flash', icon: Image, description: 'Fast & Efficient' }
    ],
    video: [
      { value: 'auto', label: 'Auto Select (Recommended)', icon: Sparkles },
      { value: 'veo-2', label: 'Google Veo 2', icon: Crown, description: 'Premium Cinema' },
      { value: 'veo-3-fast', label: 'Google Veo 3 Fast', icon: Zap, description: 'Budget Option' },
      { value: 'kling-v2-1', label: 'Replicate Kling v2.1', icon: Video, description: 'Enhanced Motion' },
      { value: 'hailuo-2', label: 'Replicate Hailuo 2', icon: Video, description: 'Real Physics' }
    ],
    audio: [
      { value: 'auto', label: 'Auto Select (Recommended)', icon: Sparkles },
      { value: 'elevenlabs-chatterbox', label: 'ElevenLabs Chatterbox', icon: Crown, description: 'Premium Voice' },
      { value: 'openai-realtime', label: 'OpenAI Realtime', icon: Volume2, description: 'Conversational' },
      { value: 'resemble-multilingual', label: 'Resemble AI', icon: Volume2, description: 'Multilingual' }
    ]
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      let result;
      const options = {
        ...generationOptions,
        provider: selectedProvider === 'auto' ? undefined : selectedProvider
      };

      switch (activeTab) {
        case 'image':
          result = await aiOrchestrator.generateImage(prompt, options);
          break;
        case 'video':
          result = await aiOrchestrator.generateVideo(prompt, options);
          break;
        case 'audio':
          result = await aiOrchestrator.generateAudio(prompt, options);
          break;
        default:
          throw new Error('Invalid generation type');
      }

      setGeneratedResults(prev => [result, ...prev]);
    } catch (error) {
      console.error('Generation failed:', error);
      // Handle error appropriately
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || `generated-${Date.now()}.${getFileExtension(activeTab)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getFileExtension = (type) => {
    switch (type) {
      case 'image': return 'jpg';
      case 'video': return 'mp4';
      case 'audio': return 'mp3';
      default: return 'file';
    }
  };

  const getCurrentProviders = () => providerOptions[activeTab] || [];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Media Generation Orchestrator
        </h1>
        <p className="text-lg text-gray-600">
          Generate professional images, videos, and audio using the latest AI models
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Generate Content
          </CardTitle>
          <CardDescription>
            Create high-quality media content using state-of-the-art AI models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Audio
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you want to create
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe the ${activeTab} you want to generate...`}
                  className="w-full h-20"
                />
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model Provider
                </label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentProviders().map((provider) => {
                      const IconComponent = provider.icon;
                      return (
                        <SelectItem key={provider.value} value={provider.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{provider.label}</span>
                            {provider.description && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {provider.description}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Type-specific Options */}
              <TabsContent value="image" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality
                    </label>
                    <Select
                      value={generationOptions.quality}
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, quality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width
                    </label>
                    <Input
                      type="number"
                      value={generationOptions.width}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <Input
                      type="number"
                      value={generationOptions.height}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget
                    </label>
                    <Select
                      value={generationOptions.budget}
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, budget: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Budget</SelectItem>
                        <SelectItem value="medium">Standard</SelectItem>
                        <SelectItem value="high">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (seconds)
                    </label>
                    <Input
                      type="number"
                      min="5"
                      max="10"
                      value={generationOptions.duration}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resolution
                    </label>
                    <Select
                      value={generationOptions.resolution}
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, resolution: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget
                    </label>
                    <Select
                      value={generationOptions.budget}
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, budget: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Budget</SelectItem>
                        <SelectItem value="medium">Standard</SelectItem>
                        <SelectItem value="high">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voice Style
                    </label>
                    <Select
                      value={generationOptions.voice}
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, voice: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="expressive">Expressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <Select
                      value={generationOptions.language}
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget
                    </label>
                    <Select
                      value={generationOptions.budget}
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, budget: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Budget</SelectItem>
                        <SelectItem value="medium">Standard</SelectItem>
                        <SelectItem value="high">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating {activeTab}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate {activeTab}
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results */}
      {generatedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated media assets are ready for download and use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  {activeTab === 'image' && (
                    <img
                      src={result.url}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-48 object-cover rounded"
                      loading="lazy"
                    />
                  )}
                  {activeTab === 'video' && (
                    <video
                      src={result.url}
                      className="w-full h-48 object-cover rounded"
                      controls
                      preload="metadata"
                    />
                  )}
                  {activeTab === 'audio' && (
                    <audio
                      src={result.url}
                      className="w-full"
                      controls
                      preload="metadata"
                    />
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{result.provider}</Badge>
                      <span className="text-gray-500">${result.cost?.toFixed(3) || '0.000'}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {result.metadata?.prompt}
                    </p>
                    <Button
                      onClick={() => handleDownload(
                        result.url,
                        `${result.provider}-${activeTab}-${index + 1}.${getFileExtension(activeTab)}`
                      )}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIMediaGenerator;