import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import TopicInput from './components/TopicInput';
import ProgressTracker from './components/ProgressTracker';
import ExportOptions from './components/ExportOptions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

/**
 * Carousel Generator UI Orchestrator
 *
 * Main component that manages the carousel generation workflow:
 * 1. Topic Input
 * 2. Generation Progress (with optional Strategy Preview for Advanced Mode)
 * 3. Export Options
 *
 * Supports both Simple Mode (fully automatic) and Advanced Mode (review strategy)
 */
export default function CarouselGeneratorUI() {
  const { user } = useAuth();
  const [step, setStep] = useState('input'); // 'input' | 'generating' | 'complete' | 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business Brain context
  const [brainContext, setBrainContext] = useState(null);

  // Generation state
  const [carouselId, setCarouselId] = useState(null);
  const [carousel, setCarousel] = useState(null);
  const [exportData, setExportData] = useState(null);

  // Progress tracking
  const [generationStatus, setGenerationStatus] = useState('researching');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);

  // Load Business Brain on mount
  useEffect(() => {
    if (user) {
      loadBusinessBrain();
    }
  }, [user]);

  /**
   * Load user's Business Brain
   */
  const loadBusinessBrain = async () => {
    try {
      const { data, error } = await supabase
        .from('business_brains')
        .select('*')
        .eq('created_by', user.id)
        .single();

      if (!error && data) {
        setBrainContext(data);
      }
    } catch (err) {
      console.error('Failed to load Business Brain:', err);
      // Non-fatal - continue without brain
    }
  };

  /**
   * Handle carousel generation
   */
  const handleGenerate = async (inputData) => {
    setIsLoading(true);
    setError(null);
    setStep('generating');
    setGenerationStatus('researching');

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }

      // Call Netlify function with "generate_all" action
      const response = await fetch('/.netlify/functions/module-carousel-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'generate_all',
          ...inputData
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Carousel generation failed');
      }

      // Success!
      setCarouselId(result.carousel_id);
      setCarousel(result);
      setSlides(result.slides || []);
      setStep('complete');

      // Fetch export data
      await fetchExportData(result.carousel_id);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'An unexpected error occurred');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch export data (ZIP, Canva JSON, captions)
   */
  const fetchExportData = async (carouselId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/.netlify/functions/module-carousel-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'export',
          carousel_id: carouselId
        })
      });

      const result = await response.json();

      if (result.success) {
        setExportData(result);
      }
    } catch (err) {
      console.error('Failed to fetch export data:', err);
      // Non-fatal
    }
  };

  /**
   * Handle export action
   */
  const handleExport = async (format) => {
    if (format === 'zip' && exportData?.exports?.zip?.download_url) {
      // Download ZIP
      window.open(exportData.exports.zip.download_url, '_blank');
    } else if (format === 'canva' && exportData?.exports?.canva_json) {
      // Download Canva JSON
      const dataStr = JSON.stringify(exportData.exports.canva_json, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carousel_${carouselId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  /**
   * Reset and start over
   */
  const handleStartOver = () => {
    setStep('input');
    setCarouselId(null);
    setCarousel(null);
    setExportData(null);
    setError(null);
    setSlides([]);
    setCurrentSlide(0);
    setGenerationStatus('researching');
  };

  /**
   * Render content based on current step
   */
  const renderContent = () => {
    switch (step) {
      case 'input':
        return (
          <TopicInput
            onSubmit={handleGenerate}
            isLoading={isLoading}
            brainContext={brainContext}
          />
        );

      case 'generating':
        return (
          <ProgressTracker
            slides={slides}
            currentSlide={currentSlide}
            totalSlides={carousel?.slide_count || 5}
            status={generationStatus}
          />
        );

      case 'complete':
        return (
          <>
            <ExportOptions
              carousel={carousel}
              exportData={exportData?.exports}
              onExport={handleExport}
            />

            {/* Start Over Button */}
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={handleStartOver}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Create Another Carousel
              </Button>
            </div>
          </>
        );

      case 'error':
        return (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-semibold">Generation Failed</p>
                <p className="text-sm mt-1">{error}</p>
              </AlertDescription>
            </Alert>

            <div className="flex justify-center gap-4">
              <Button onClick={handleStartOver}>
                Try Again
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Instagram Carousel Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-powered carousel creation with intelligent image sourcing
        </p>
      </div>

      {/* Main Content */}
      {renderContent()}

      {/* Module Info Footer */}
      {step === 'input' && (
        <div className="mt-12 text-center text-xs text-gray-500">
          <p>
            Powered by Claude Sonnet 4.5, OpenAI gpt-image-1, and Google Gemini Nano Banana
          </p>
          <p className="mt-1">
            Intelligently decides whether to generate, download, edit, or compose images for each slide
          </p>
        </div>
      )}
    </div>
  );
}
