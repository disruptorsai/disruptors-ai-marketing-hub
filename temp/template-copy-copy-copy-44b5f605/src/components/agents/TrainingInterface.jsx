import React, { useState, useEffect } from 'react';
import { Client } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BookOpen, Save, Loader2 } from 'lucide-react';

export default function TrainingInterface({ agent }) {
  const [client, setClient] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [directives, setDirectives] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClientData = async () => {
        setIsLoading(true);
        try {
            let clientData = await Client.list("name", 1);
            
            if (clientData.length === 0) {
              const defaultClient = await Client.create({
                name: "My Company",
                hourly_rate: 0,
                currency: "USD",
                color: "#4f46e5",
                status: "active"
              });
              clientData = [defaultClient];
            }
            
            const loadedClient = clientData[0];
            setClient(loadedClient);
            setKeywords(loadedClient.focus_keywords || '');
            setDirectives(loadedClient.ai_writing_directives || '');

        } catch (error) {
            console.error("Failed to load client settings", error);
            toast.error("Could not load training data.");
        } finally {
            setIsLoading(false);
        }
    }
    loadClientData();
  }, []);

  const handleSaveTrainingData = async () => {
    if (!client) return;
    
    setIsSaving(true);
    try {
      await Client.update(client.id, {
        focus_keywords: keywords,
        ai_writing_directives: directives,
      });
      toast.success("Training data saved successfully! The agent will now use this information for all content generation.", {
        duration: 4000
      });
    } catch (error) {
      console.error("Error saving training data:", error);
      toast.error("Failed to save training data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const agentDisplayName = agent?.display_name || agent?.name?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'AI Agent';
  
  if (isLoading) {
    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
                <CardTitle>Loading Training Data...</CardTitle>
            </CardHeader>
            <CardContent><Loader2 className="w-8 h-8 animate-spin" /></CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-700" />
            Global Training Data
          </CardTitle>
          <CardDescription>
            Configure the global training data that all agents will use to generate personalized, relevant content for <strong className="text-slate-800">{client?.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keywords" className="font-semibold">Focus SEO Keywords</Label>
            <p className="text-sm text-slate-500">Enter comma-separated keywords that are relevant to your company. The AI will strategically select 1-3 most relevant keywords per piece of content.</p>
            <Textarea
              id="keywords"
              placeholder="e.g., digital marketing, content strategy, SEO services"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              rows={4}
              className="bg-white"
            />
            <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-md">
              <p className="font-medium mb-1">💡 Modern SEO Strategy:</p>
              <p>AI agents will strategically select the most relevant keywords for each piece of content, avoiding keyword stuffing and focusing on natural integration that serves user intent and search rankings.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="directives" className="font-semibold">AI Writing Directives</Label>
            <p className="text-sm text-slate-500">Provide specific instructions about brand voice, target audience, writing style, and content preferences. Be as detailed as possible.</p>
            <Textarea
              id="directives"
              placeholder="e.g., Write in a professional yet approachable tone for B2B clients. Focus on providing actionable insights. Avoid overly casual language. End posts with an engaging question."
              value={directives}
              onChange={(e) => setDirectives(e.target.value)}
              rows={8}
              className="bg-white"
            />
          </div>

          {(keywords || directives) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-800 mb-2">Preview: How this training data will be used</h4>
              <div className="text-sm text-emerald-700 space-y-2">
                {keywords && (
                  <p><strong>Strategic Keywords:</strong> AI will select 1-3 most relevant from: <em>{keywords.split(',').slice(0, 3).join(', ')}{keywords.split(',').length > 3 ? '...' : ''}</em></p>
                )}
                {directives && (
                  <p><strong>Writing Style:</strong> All content will follow your specific brand guidelines and tone preferences.</p>
                )}
                <p><strong>SEO Strategy:</strong> Keywords will be integrated naturally based on content type, search intent, and modern SEO best practices.</p>
                <p><strong>Content Quality:</strong> User value and engagement take priority over keyword density.</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveTrainingData} 
              disabled={isSaving}
              className="bg-slate-800 hover:bg-slate-900"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Training Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Current Agent: {agentDisplayName}</CardTitle>
          <CardDescription>
            This agent specializes in {agent?.description?.toLowerCase() || 'content creation'}. It will use the global training data above to create tailored content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50 border rounded-md text-sm text-slate-700">
            <p className="font-medium mb-2">Agent Core Instructions:</p>
            <p>{agent?.description || "This agent helps create high-quality content tailored to your specific business needs."}</p>
            <p className="mt-3 text-xs text-slate-500">
              <strong>Note:</strong> The agent will automatically combine these core instructions with your client-specific training data above for personalized content generation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}