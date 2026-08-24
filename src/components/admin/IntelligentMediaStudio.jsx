import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Sparkles,
  Image as ImageIcon,
  Video,
  Wand2,
  Download,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Copy,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Anthropic from '@anthropic-ai/sdk';
import AIMediaOrchestrator from '@/lib/ai-orchestrator';
import { supabaseClient } from '@/lib/supabase-client';

/**
 * Intelligent Media Studio
 * Context-aware media generation using Claude for prompt engineering
 * and multiple image generation models
 */
const IntelligentMediaStudio = () => {
  const [step, setStep] = useState('describe'); // describe, analyze, generate, review
  const [userRequest, setUserRequest] = useState('');
  const [context, setContext] = useState({
    purpose: 'website',
    section: '',
    page: '',
    brandVoice: true,
    technicalDetails: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [selectedModel, setSelectedModel] = useState('flux-pro');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);

  // Available models
  const imageModels = [
    {
      id: 'flux-pro',
      name: 'Flux 1.1 Pro (Replicate)',
      description: 'Professional quality, best for marketing',
      speed: 'Medium',
      quality: 'Excellent',
      cost: 'High'
    },
    {
      id: 'gpt-image',
      name: 'GPT Image 1 (OpenAI)',
      description: 'High fidelity, C2PA metadata, natural scenes',
      speed: 'Fast',
      quality: 'Excellent',
      cost: 'Medium'
    },
    {
      id: 'gemini-image',
      name: 'Gemini 2.5 Flash Image',
      description: 'Fast generation, good for concepts',
      speed: 'Very Fast',
      quality: 'Good',
      cost: 'Low'
    }
  ];

  const purposes = [
    { value: 'website', label: 'Website Content' },
    { value: 'blog', label: 'Blog Post' },
    { value: 'service', label: 'Service Page' },
    { value: 'social', label: 'Social Media' },
    { value: 'client', label: 'Client Project' },
    { value: 'marketing', label: 'Marketing Campaign' }
  ];

  /**
   * Step 1: Analyze user request using Claude
   * Claude will understand context, brand voice, and generate optimized prompts
   */
  const handleAnalyzeRequest = async () => {
    if (!userRequest.trim()) {
      setError('Please describe what you need');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const systemPrompt = `You are an expert AI image prompt engineer for Disruptors AI, a premium marketing agency.

Brand Identity:
- Colors: Dark sophisticated (black/gray) with premium gold accents (#d4af37)
- Style: Professional, modern, technology-focused with timeless elegance
- Aesthetic: High-tech, AI-forward, business-professional with premium feel

Your task: Analyze the user's image request and generate 3 optimized prompts for different AI models:
1. Flux 1.1 Pro (Replicate) - Professional creative, best quality
2. GPT Image 1 (OpenAI) - High fidelity, natural scenes
3. Gemini 2.5 Flash (Google) - Fast, budget-friendly

Return JSON only in this format:
{
  "understanding": "Brief summary of what they need",
  "brandAlignment": "How well this aligns with brand",
  "technicalRequirements": "Image specs and requirements",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "prompts": [
    {
      "model": "flux-pro",
      "prompt": "Detailed prompt optimized for Flux Pro",
      "style": "Style name",
      "reasoning": "Why this approach"
    },
    {
      "model": "gpt-image",
      "prompt": "Detailed prompt optimized for GPT Image",
      "style": "Style name",
      "reasoning": "Why this approach"
    },
    {
      "model": "gemini-image",
      "prompt": "Detailed prompt optimized for Gemini",
      "style": "Style name",
      "reasoning": "Why this approach"
    }
  ]
}`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `User request: ${userRequest}\n\nContext:\n- Purpose: ${context.purpose}\n- Section: ${context.section || 'Not specified'}\n- Technical details: ${context.technicalDetails || 'None'}\n- Brand voice: ${context.brandVoice ? 'Match Disruptors AI brand' : 'Generic'}\n\nGenerate optimized prompts.`
        }]
      });

      const responseText = message.content[0].text;
      const analysisData = JSON.parse(responseText);

      setAnalysisResult({
        understanding: analysisData.understanding,
        brandAlignment: analysisData.brandAlignment,
        technicalRequirements: analysisData.technicalRequirements,
        recommendations: analysisData.recommendations
      });

      setGeneratedPrompts(analysisData.prompts);
      setStep('analyze');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Step 2: Generate images using selected prompt and model
   */
  const handleGenerateImage = async (promptIndex = selectedPromptIndex) => {
    setIsGenerating(true);
    setError(null);

    try {
      const selectedPrompt = generatedPrompts[promptIndex];
      const orchestrator = new AIMediaOrchestrator();

      // Map model IDs
      const modelMap = {
        'flux-pro': { specialization: 'professional_creative' },
        'gpt-image': {},
        'gemini-image': { budget: 'low' }
      };

      const options = modelMap[selectedPrompt.model] || {};

      const result = await orchestrator.generateImage(selectedPrompt.prompt, {
        ...options,
        width: 1024,
        height: 1024
      });

      const generatedImage = {
        url: result.url || result.output || result[0],
        prompt: selectedPrompt.prompt,
        model: selectedPrompt.model,
        style: selectedPrompt.style,
        timestamp: new Date().toISOString(),
        metadata: {
          provider: result.provider || 'unknown',
          modelUsed: result.model || selectedPrompt.model,
          ...result.metadata
        }
      };

      setGeneratedImages(prev => [...prev, generatedImage]);
      setStep('review');
    } catch (err) {
      console.error('Generation error:', err);
      setError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Save image to site_media table
   */
  const handleSaveToDatabase = async (image) => {
    try {
      const { data, error } = await supabaseClient
        .from('site_media')
        .insert({
          url: image.url,
          type: 'ai_generated_image',
          category: context.purpose,
          section: context.section || 'general',
          alt_text: userRequest.substring(0, 255),
          prompt: image.prompt,
          model: image.model,
          style: image.style,
          metadata: image.metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      alert(`Image saved successfully! ID: ${data.id}`);
      console.log('Saved to database:', data);
    } catch (err) {
      console.error('Save error:', err);
      setError(`Save failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="bg-black/50 border-green-400/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {['Describe', 'Analyze', 'Generate', 'Review'].map((label, index) => {
              const isActive = (
                (step === 'describe' && index === 0) ||
                (step === 'analyze' && index <= 1) ||
                (step === 'generate' && index <= 2) ||
                (step === 'review' && index <= 3)
              );

              return (
                <div key={label} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-green-400/30 text-green-400/50'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-mono ${isActive ? 'text-green-400' : 'text-green-400/50'}`}>
                    {label}
                  </span>
                  {index < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${isActive ? 'bg-green-400' : 'bg-green-400/30'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Describe What You Need */}
      {step === 'describe' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-black/50 border-green-400/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-green-400" />
                <div>
                  <CardTitle className="text-green-400 font-mono">Describe Your Vision</CardTitle>
                  <CardDescription className="text-green-400/60">
                    Tell me what you need in natural language. I'll use AI to understand and create the perfect prompts.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-green-400 font-mono mb-2 block">What do you need?</label>
                <Textarea
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  placeholder="Example: A hero image for our AI automation service page showing a modern office with holographic interfaces and data streams..."
                  className="min-h-[120px] bg-black border-green-400/30 text-green-400 font-mono placeholder:text-green-400/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-green-400 font-mono mb-2 block">Purpose</label>
                  <Select value={context.purpose} onValueChange={(val) => setContext(prev => ({ ...prev, purpose: val }))}>
                    <SelectTrigger className="bg-black border-green-400/30 text-green-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-green-400/30">
                      {purposes.map(p => (
                        <SelectItem key={p.value} value={p.value} className="text-green-400">
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-green-400 font-mono mb-2 block">Page/Section</label>
                  <Input
                    value={context.section}
                    onChange={(e) => setContext(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="e.g., Homepage Hero, About Team"
                    className="bg-black border-green-400/30 text-green-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-green-400 font-mono mb-2 block">Technical Details (optional)</label>
                <Input
                  value={context.technicalDetails}
                  onChange={(e) => setContext(prev => ({ ...prev, technicalDetails: e.target.value }))}
                  placeholder="e.g., 16:9 aspect ratio, dark mode, specific colors"
                  className="bg-black border-green-400/30 text-green-400 font-mono"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-400 rounded">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <Button
                onClick={handleAnalyzeRequest}
                disabled={isAnalyzing || !userRequest.trim()}
                className="w-full bg-green-400 text-black hover:bg-green-300 font-mono"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing with Claude...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Analyze & Generate Prompts
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Review Analysis & Prompts */}
      {step === 'analyze' && analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Analysis Summary */}
          <Card className="bg-black/50 border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Analysis Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm text-green-400 font-mono mb-2">Understanding:</h3>
                <p className="text-green-400/80 text-sm">{analysisResult.understanding}</p>
              </div>
              <div>
                <h3 className="text-sm text-green-400 font-mono mb-2">Brand Alignment:</h3>
                <Badge className="bg-green-400/20 text-green-400 border-green-400">
                  {analysisResult.brandAlignment}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm text-green-400 font-mono mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1 text-green-400/80 text-sm">
                  {analysisResult.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Generated Prompts */}
          <Card className="bg-black/50 border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">Generated Prompts ({generatedPrompts.length})</CardTitle>
              <CardDescription className="text-green-400/60">
                Select a prompt to generate your image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedPrompts.map((prompt, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPromptIndex(index)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPromptIndex === index
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-green-400/30 hover:border-green-400/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge className="bg-cyan-0/20 text-cyan-0 border-cyan-0 mb-2">
                        {prompt.style}
                      </Badge>
                      <p className="text-sm text-green-400/60 font-mono">
                        Model: {imageModels.find(m => m.id === prompt.model)?.name}
                      </p>
                    </div>
                    {selectedPromptIndex === index && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <p className="text-green-400 text-sm mb-2">{prompt.prompt}</p>
                  <p className="text-green-400/50 text-xs italic">{prompt.reasoning}</p>
                </div>
              ))}

              <div className="flex space-x-3">
                <Button
                  onClick={() => setStep('describe')}
                  variant="outline"
                  className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
                <Button
                  onClick={() => handleGenerateImage()}
                  disabled={isGenerating}
                  className="flex-1 bg-green-400 text-black hover:bg-green-300 font-mono"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3 & 4: Generated Images Review */}
      {step === 'review' && generatedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-black/50 border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">Generated Images ({generatedImages.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedImages.map((image, index) => (
                <div key={index} className="border border-green-400/30 rounded-lg overflow-hidden">
                  <img src={image.url} alt={image.style} className="w-full h-auto" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-cyan-0/20 text-cyan-0 border-cyan-0">
                        {image.style}
                      </Badge>
                      <Badge className="bg-blue-400/20 text-blue-400 border-blue-400">
                        {imageModels.find(m => m.id === image.model)?.name}
                      </Badge>
                    </div>
                    <p className="text-green-400/80 text-sm font-mono">{image.prompt}</p>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleSaveToDatabase(image)}
                        size="sm"
                        className="bg-green-400 text-black hover:bg-green-300"
                      >
                        <Save className="w-3 h-3 mr-2" />
                        Save to Database
                      </Button>
                      <Button
                        onClick={() => window.open(image.url, '_blank')}
                        size="sm"
                        variant="outline"
                        className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        View Full Size
                      </Button>
                      <Button
                        onClick={() => navigator.clipboard.writeText(image.url)}
                        size="sm"
                        variant="outline"
                        className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleGenerateImage()}
                  disabled={isGenerating}
                  variant="outline"
                  className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Another
                </Button>
                <Button
                  onClick={() => {
                    setStep('describe');
                    setGeneratedImages([]);
                    setUserRequest('');
                  }}
                  variant="outline"
                  className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                >
                  New Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default IntelligentMediaStudio;
