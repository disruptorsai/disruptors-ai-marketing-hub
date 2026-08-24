/**
 * Marketing Image Batch Generator
 * Admin component for generating all marketing images in one batch
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Pause,
  Download,
  CheckCircle,
  XCircle,
  Loader,
  Image as ImageIcon,
  FileText,
  Bot,
  ExternalLink
} from 'lucide-react';
import { aiOrchestrator } from '@/lib/ai-orchestrator';

const MarketingImageBatchGenerator = ({ customPlan = null }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const [generationResults, setGenerationResults] = useState({
    serviceCards: [],
    blogPosts: [],
    aiEmployees: []
  });
  const [errorLog, setErrorLog] = useState([]);

  // Brand-consistent styling
  const brandStyle = `Professional corporate design, modern technology aesthetic, clean minimal design, sophisticated blue and purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), business-appropriate, high-quality commercial photography style, high resolution, professional photography, commercial quality, award-winning design, sharp details, optimal lighting, perfect composition`;

  const negativePrompts = `low quality, blurry, unprofessional, childish, cartoon, amateur, cluttered, messy, pixelated, distorted`;

  // Image definitions
  const imageDefinitions = {
    serviceCards: [
      {
        id: 'ai_automation',
        title: 'AI Automation',
        description: 'Automate repetitive tasks and workflows',
        prompt: `Abstract digital automation concept with interconnected robotic elements, flowing data streams, automated workflow visualization, AI-powered processes, modern tech interface elements, gears and circuits merging with digital displays, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: 'social_media_marketing',
        title: 'Social Media Marketing',
        description: 'Build and engage your community',
        prompt: `Social media engagement visualization with floating social icons, community connection networks, content creation elements, engagement metrics, likes and shares flowing, modern social platform interfaces, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: 'seo_geo',
        title: 'SEO & GEO',
        description: 'Get found by your ideal customers',
        prompt: `Search optimization concept with magnifying glass, search results interface, location pins floating over digital map, ranking charts going upward, SEO analytics dashboard, local search elements, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: 'lead_generation',
        title: 'Lead Generation',
        description: 'Fill your pipeline with qualified prospects',
        prompt: `Sales funnel visualization with prospect flow, lead magnets represented as attractive elements, pipeline filled with qualified leads, conversion metrics, targeting crosshairs, prospecting tools, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: 'paid_advertising',
        title: 'Paid Advertising',
        description: 'Maximize ROI across all channels',
        prompt: `Multi-channel advertising dashboard with ROI charts trending upward, ad performance metrics, targeting options, budget allocation visualization, campaign optimization elements, advertising platforms, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: 'podcasting',
        title: 'Podcasting',
        description: 'Build authority through audio content',
        prompt: `Professional podcast studio setup with modern microphone, audio waveforms, broadcasting elements, sound waves radiating, podcast platform interfaces, authority-building symbols, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: 'custom_apps',
        title: 'Custom Apps',
        description: 'Tailored solutions for your needs',
        prompt: `Custom software development concept with mobile app interfaces, code elements, app wireframes, development tools, customization options, tailored solution symbols, modern UI elements, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: 'crm_management',
        title: 'CRM Management',
        description: 'Organize and nurture your relationships',
        prompt: `Customer relationship management dashboard with contact organization, relationship networks, nurturing workflows, customer journey visualization, CRM interface elements, data organization, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: 'fractional_cmo',
        title: 'Fractional CMO',
        description: 'Strategic marketing leadership',
        prompt: `Strategic marketing leadership concept with business growth charts, marketing strategy elements, leadership symbols, growth metrics, strategic planning tools, executive dashboard, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1920, height: 1080 }
      }
    ],
    blogPosts: [
      {
        id: 'ai_seo_guide',
        title: 'The Ultimate Guide to AI-Powered SEO in 2025',
        category: 'SEO & GEO',
        prompt: `Futuristic SEO concept with AI brain analyzing search results, modern search optimization tools, 2025 technology elements, AI-powered SEO dashboard, futuristic search interface, advanced analytics, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1200, height: 800 }
      },
      {
        id: 'cold_email_templates',
        title: '5 Cold Email Templates That Actually Get Replies',
        category: 'Lead Generation',
        prompt: `Professional email marketing concept with inbox interface, email templates, reply notifications, engagement metrics, communication success symbols, email effectiveness visualization, open rates, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1200, height: 800 }
      },
      {
        id: 'custom_ai_app',
        title: 'How We Built a Custom AI App in 48 Hours',
        category: 'Custom Apps',
        prompt: `Rapid AI app development concept with coding interface, 48-hour timeline visualization, AI app creation process, development speed indicators, rapid prototyping elements, coding productivity tools, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1200, height: 800 }
      }
    ],
    aiEmployees: [
      {
        id: 'content_curator',
        title: 'Content Curator AI Employee',
        prompt: `Futuristic AI assistant organizing content, holographic content curation interface, social media management visualization, automated content systems, AI organizing digital content pieces with floating UI elements, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1024, height: 1024 }
      },
      {
        id: 'lead_nurturer',
        title: 'Lead Nurturer AI Employee',
        prompt: `AI assistant managing customer relationships, lead nurturing workflow visualization, customer journey automation interface, relationship management systems, AI handling prospect communication with care, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1024, height: 1024 }
      },
      {
        id: 'customer_support',
        title: 'Customer Support AI Employee',
        prompt: `24/7 AI chatbot interface, customer service automation visualization, support ticket management system, AI assistant helping customers with friendly demeanor, round-the-clock support symbols, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1024, height: 1024 }
      },
      {
        id: 'sales_qualifier',
        title: 'Sales Qualifier AI Employee',
        prompt: `AI sales assistant analyzing leads, lead qualification interface with scoring system, sales process automation, prospect scoring visualization, AI evaluating sales opportunities with intelligence, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1024, height: 1024 }
      },
      {
        id: 'data_analyst',
        title: 'Data Analysis AI Employee',
        prompt: `AI analyzing business data with advanced algorithms, analytics dashboard with AI insights, data visualization with charts and graphs, business intelligence interface, AI processing complex datasets efficiently, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1024, height: 1024 }
      },
      {
        id: 'content_writer',
        title: 'Content Writer AI Employee',
        prompt: `AI writing content with creative flair, automated copywriting interface, content creation visualization, AI generating marketing copy, writing assistance tools, creative writing process, ${brandStyle}. Avoid: ${negativePrompts}`,
        dimensions: { width: 1024, height: 1024 }
      }
    ]
  };

  const generateImages = async () => {
    setIsGenerating(true);
    setIsPaused(false);
    setCurrentProgress(0);
    setErrorLog([]);

    // Use custom plan if provided, otherwise use default definitions
    const allImages = customPlan ?
      customPlan.images.map(img => ({
        ...img,
        category: img.category || 'custom',
        dimensions: img.dimensions || { width: 1200, height: 800 }
      })) :
      [
        ...imageDefinitions.serviceCards.map(img => ({ ...img, category: 'serviceCards' })),
        ...imageDefinitions.blogPosts.map(img => ({ ...img, category: 'blogPosts' })),
        ...imageDefinitions.aiEmployees.map(img => ({ ...img, category: 'aiEmployees' }))
      ];

    const totalImages = allImages.length;
    let completedImages = 0;

    for (let i = 0; i < allImages.length; i++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = () => {
            if (!isPaused) resolve();
            else setTimeout(checkPause, 100);
          };
          checkPause();
        });
      }

      const imageConfig = allImages[i];
      setCurrentItem(`Generating: ${imageConfig.title}`);

      try {
        // Use Gemini as primary provider (avoiding DALL-E 3 as requested)
        const result = await aiOrchestrator.generateImage(imageConfig.prompt, {
          width: imageConfig.dimensions.width,
          height: imageConfig.dimensions.height,
          quality: 'premium',
          budget: 'medium', // This will select Gemini over OpenAI
          context: `marketing_batch_${imageConfig.category}_${imageConfig.id}`,
          specialization: 'professional_creative'
        });

        // Store result in appropriate category
        setGenerationResults(prev => ({
          ...prev,
          [imageConfig.category]: [
            ...prev[imageConfig.category],
            {
              ...imageConfig,
              result,
              success: true,
              cloudinaryUrl: result.stored_url || result.url,
              cloudinaryPublicId: result.cloudinary_public_id,
              provider: result.provider,
              cost: result.cost
            }
          ]
        }));

        completedImages++;
        setCurrentProgress((completedImages / totalImages) * 100);

      } catch (error) {
        console.error(`Failed to generate ${imageConfig.title}:`, error);

        setErrorLog(prev => [...prev, {
          title: imageConfig.title,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }]);

        // Store failed result
        setGenerationResults(prev => ({
          ...prev,
          [imageConfig.category]: [
            ...prev[imageConfig.category],
            {
              ...imageConfig,
              success: false,
              error: error.message
            }
          ]
        }));

        completedImages++;
        setCurrentProgress((completedImages / totalImages) * 100);
      }

      // Add delay between generations to avoid rate limiting
      if (i < allImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsGenerating(false);
    setCurrentItem('Generation Complete!');
  };

  const pauseGeneration = () => {
    setIsPaused(!isPaused);
  };

  const downloadAllResults = () => {
    const allResults = {
      service_cards: generationResults.serviceCards.filter(r => r.success),
      blog_posts: generationResults.blogPosts.filter(r => r.success),
      ai_employees: generationResults.aiEmployees.filter(r => r.success)
    };

    const jsonContent = JSON.stringify(allResults, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-images-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTotalResults = () => {
    return Object.values(generationResults).flat();
  };

  const getSuccessfulResults = () => {
    return getTotalResults().filter(r => r.success);
  };

  const getFailedResults = () => {
    return getTotalResults().filter(r => !r.success);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎨 Marketing Image Batch Generator
        </h1>
        <p className="text-lg text-gray-600">
          {customPlan ?
            `Generate ${customPlan.totalImages} custom AI images from your batch plan` :
            'Generate all marketing website images using AI (Gemini provider)'
          }
        </p>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Batch Generation Control</span>
            <Badge variant={isGenerating ? "default" : "secondary"}>
              {isGenerating ? "Generating..." : "Ready"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {customPlan ?
              `Generate ${customPlan.totalImages} AI-planned images (${customPlan.estimatedCost} estimated cost)` :
              'Generate 18 professional marketing images (9 service cards + 3 blog posts + 6 AI employees)'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentItem}</span>
                <span>{Math.round(currentProgress)}%</span>
              </div>
              <Progress value={currentProgress} className="w-full" />
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={generateImages}
              disabled={isGenerating}
              className="bg-gradient-to-r from-cyan-0 to-blue-600 hover:from-cyan-0 hover:to-blue-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Generation
                </>
              )}
            </Button>

            {isGenerating && (
              <Button
                onClick={pauseGeneration}
                variant="outline"
                size="lg"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            )}

            {getTotalResults().length > 0 && (
              <Button
                onClick={downloadAllResults}
                variant="outline"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Results
              </Button>
            )}
          </div>

          {/* Summary Stats */}
          {getTotalResults().length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-green-600">
                  {getSuccessfulResults().length}
                </div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-red-600">
                  {getFailedResults().length}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-blue-600">
                  {getTotalResults().length}
                </div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {getTotalResults().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Images</CardTitle>
            <CardDescription>
              All generated marketing images organized by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="service-cards" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="service-cards" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Service Cards ({generationResults.serviceCards.length})
                </TabsTrigger>
                <TabsTrigger value="blog-posts" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Blog Posts ({generationResults.blogPosts.length})
                </TabsTrigger>
                <TabsTrigger value="ai-employees" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Employees ({generationResults.aiEmployees.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="service-cards" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {generationResults.serviceCards.map((image, index) => (
                    <ImageResultCard key={index} image={image} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="blog-posts" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {generationResults.blogPosts.map((image, index) => (
                    <ImageResultCard key={index} image={image} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ai-employees" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {generationResults.aiEmployees.map((image, index) => (
                    <ImageResultCard key={index} image={image} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Error Log */}
      {errorLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Log</CardTitle>
            <CardDescription>
              Generation errors and issues encountered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errorLog.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-red-800">{error.title}</div>
                      <div className="text-sm text-red-600">{error.error}</div>
                    </div>
                    <div className="text-xs text-red-500">{error.timestamp}</div>
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

// Image Result Card Component
const ImageResultCard = ({ image }) => (
  <div className="border rounded-lg p-4 space-y-3">
    {image.success ? (
      <div>
        <img
          src={image.cloudinaryUrl || image.result?.url}
          alt={image.title}
          className="w-full h-48 object-cover rounded"
          loading="lazy"
        />
        <div className="mt-3 space-y-2">
          <h4 className="font-medium text-gray-900">{image.title}</h4>
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline" className="text-green-600">
              {image.provider} - ${image.cost?.toFixed(3) || '0.000'}
            </Badge>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          {image.cloudinaryUrl && (
            <Button
              onClick={() => window.open(image.cloudinaryUrl, '_blank')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Size
            </Button>
          )}
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">{image.title}</h4>
          <Badge variant="destructive">Generation Failed</Badge>
          <p className="text-xs text-red-600">{image.error}</p>
        </div>
      </div>
    )}
  </div>
);

export default MarketingImageBatchGenerator;