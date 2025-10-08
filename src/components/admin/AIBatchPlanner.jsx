/**
 * AI Batch Planner
 * Intelligent image generation planning using natural language and site knowledge
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Brain,
  Edit3,
  Trash2,
  Plus,
  Download,
  Play,
  Loader,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { aiOrchestrator } from '@/lib/ai-orchestrator';

const AIBatchPlanner = ({ onGenerateBatch }) => {
  const [planningPrompt, setPlanningPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [siteAnalysis, setSiteAnalysis] = useState(null);

  // Site knowledge for context
  const siteKnowledge = {
    services: [
      'AI Automation', 'Social Media Marketing', 'SEO & GEO', 'Lead Generation',
      'Paid Advertising', 'Podcasting', 'Custom Apps', 'CRM Management', 'Fractional CMO'
    ],
    pages: [
      'Home', 'About', 'Contact', 'Work', 'Solutions', 'Blog', 'Assessment', 'Calculator',
      'Gallery', 'Podcast', 'Privacy', 'Terms'
    ],
    clientWork: [
      'Vested Finance', 'BetterWorld Technology', 'FoundersCart', 'WealthDesk',
      'Stockal', 'Keka', 'Trade Brains', 'Policy Bazaar', 'Angel One'
    ],
    brandStyle: 'Professional corporate design, modern technology aesthetic, clean minimal design, sophisticated blue and purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), business-appropriate, high-quality commercial photography style',
    currentContent: 'Marketing website for Disruptors AI - a digital marketing agency specializing in AI-powered solutions'
  };

  // Example prompts for inspiration
  const examplePrompts = [
    "Create hero images for our new AI consulting service landing page",
    "Generate social media posts about our latest client success stories",
    "Design banner images for our upcoming webinar series on AI marketing",
    "Create product showcase images for our custom app development service",
    "Generate blog header images for our SEO optimization guide series",
    "Design testimonial graphics featuring our top client results"
  ];

  const generateBatchPlan = async () => {
    if (!planningPrompt.trim()) return;

    setIsAnalyzing(true);
    setGeneratedPlan(null);

    try {
      // Create comprehensive context for AI planning
      const planningContext = `
You are an expert digital marketing strategist and creative director for Disruptors AI, a premium digital marketing agency.

SITE CONTEXT:
- Company: Disruptors AI - AI-powered digital marketing agency
- Services: ${siteKnowledge.services.join(', ')}
- Current Pages: ${siteKnowledge.pages.join(', ')}
- Client Portfolio: ${siteKnowledge.clientWork.join(', ')}
- Brand Style: ${siteKnowledge.brandStyle}

USER REQUEST: "${planningPrompt}"

Create a detailed image generation plan with 3-8 specific images. For each image, provide:
1. title: Clear, descriptive title
2. description: Brief explanation of the image purpose
3. category: One of: "hero", "service", "blog", "social", "testimonial", "product", "general"
4. dimensions: {width: number, height: number} - choose appropriate sizes
5. prompt: Detailed AI generation prompt including brand style
6. context: How this fits into the site/marketing strategy
7. priority: "high", "medium", or "low"

Focus on:
- Brand consistency with Disruptors AI style
- Professional, modern, tech-forward aesthetic
- Clear business value and marketing purpose
- Varied but cohesive visual approach
- Practical applications for the website

Respond with valid JSON only:
{
  "analysis": "Brief analysis of the request and strategy",
  "totalImages": number,
  "estimatedCost": "Estimated cost range",
  "images": [array of image objects as described above]
}
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert marketing strategist and creative director. Respond with valid JSON only.'
            },
            {
              role: 'user',
              content: planningContext
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate batch plan');
      }

      const data = await response.json();
      const planData = JSON.parse(data.choices[0].message.content);

      setGeneratedPlan(planData);
      setSiteAnalysis(planData.analysis);

    } catch (error) {
      console.error('Batch planning error:', error);
      // Fallback to basic plan structure
      setGeneratedPlan({
        analysis: "Generated basic plan structure due to API limitations",
        totalImages: 1,
        estimatedCost: "$0.02 - $0.08",
        images: [{
          title: "Custom Marketing Image",
          description: planningPrompt,
          category: "general",
          dimensions: { width: 1200, height: 800 },
          prompt: `${planningPrompt}. ${siteKnowledge.brandStyle}. High quality, professional marketing image.`,
          context: "Custom request based on user input",
          priority: "high"
        }]
      });
    }

    setIsAnalyzing(false);
  };

  const editImage = (index, field, value) => {
    setGeneratedPlan(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const deleteImage = (index) => {
    setGeneratedPlan(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      totalImages: prev.totalImages - 1
    }));
  };

  const addCustomImage = () => {
    const newImage = {
      title: "New Custom Image",
      description: "Custom image description",
      category: "general",
      dimensions: { width: 1200, height: 800 },
      prompt: `Professional marketing image. ${siteKnowledge.brandStyle}. High quality commercial photography style.`,
      context: "Manually added custom image",
      priority: "medium"
    };

    setGeneratedPlan(prev => ({
      ...prev,
      images: [...prev.images, newImage],
      totalImages: prev.totalImages + 1
    }));
  };

  const exportPlan = () => {
    if (!generatedPlan) return;

    const exportData = {
      ...generatedPlan,
      createdAt: new Date().toISOString(),
      originalPrompt: planningPrompt,
      siteContext: siteKnowledge
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Planning Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-0" />
            AI Batch Planner
          </CardTitle>
          <CardDescription>
            Describe your image needs in plain English. AI will analyze your site and create a detailed generation plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">What images do you need?</label>
            <Textarea
              placeholder="Example: Create hero images for our new AI consulting service, or Generate social media posts about our latest client success stories..."
              value={planningPrompt}
              onChange={(e) => setPlanningPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={generateBatchPlan}
              disabled={!planningPrompt.trim() || isAnalyzing}
              className="bg-gradient-to-r from-cyan-0 to-blue-600 hover:from-cyan-0 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>

            {generatedPlan && (
              <>
                <Button onClick={exportPlan} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Plan
                </Button>
                <Button
                  onClick={() => onGenerateBatch?.(generatedPlan)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Generate Images
                </Button>
              </>
            )}
          </div>

          {/* Example Prompts */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Example Prompts:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPlanningPrompt(example)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Plan */}
      {generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Batch Plan</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{generatedPlan.totalImages} images</Badge>
                <Badge variant="outline">{generatedPlan.estimatedCost}</Badge>
              </div>
            </CardTitle>
            <CardDescription>
              {siteAnalysis || "AI-generated image batch plan based on your requirements"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedPlan.images.map((image, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {editingIndex === index ? (
                            <Input
                              value={image.title}
                              onChange={(e) => editImage(index, 'title', e.target.value)}
                              onBlur={() => setEditingIndex(null)}
                              autoFocus
                            />
                          ) : (
                            <span onClick={() => setEditingIndex(index)} className="cursor-pointer">
                              {image.title}
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{image.category}</Badge>
                          <Badge variant={image.priority === 'high' ? 'default' : 'secondary'}>
                            {image.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {image.dimensions.width}×{image.dimensions.height}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteImage(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{image.description}</p>

                    {editingIndex === index && (
                      <div className="space-y-3 p-3 bg-gray-50 rounded">
                        <div>
                          <label className="text-xs font-medium">Description:</label>
                          <Textarea
                            value={image.description}
                            onChange={(e) => editImage(index, 'description', e.target.value)}
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">AI Prompt:</label>
                          <Textarea
                            value={image.prompt}
                            onChange={(e) => editImage(index, 'prompt', e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      <strong>Context:</strong> {image.context}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={addCustomImage} variant="dashed" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIBatchPlanner;