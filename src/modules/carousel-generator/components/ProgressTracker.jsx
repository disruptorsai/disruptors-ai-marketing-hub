import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

/**
 * Progress Tracker Component
 *
 * Shows real-time progress during carousel generation
 *
 * Props:
 * - slides: array of slide objects with status
 * - currentSlide: number (currently processing)
 * - totalSlides: number
 * - status: string ('researching', 'strategy', 'generating', 'complete')
 */
export default function ProgressTracker({
  slides = [],
  currentSlide = 0,
  totalSlides = 5,
  status = 'researching'
}) {
  const progress = Math.round((currentSlide / totalSlides) * 100);

  const getStatusMessage = () => {
    switch (status) {
      case 'researching':
        return 'Researching successful Instagram carousels...';
      case 'strategy':
        return 'AI is analyzing and creating image strategy...';
      case 'generating':
        return `Generating slide ${currentSlide} of ${totalSlides}...`;
      case 'complete':
        return 'Carousel generation complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className={`w-5 h-5 ${status === 'complete' ? 'text-green-500' : 'text-blue-500 animate-spin'}`} />
          {status === 'complete' ? 'Generation Complete' : 'Generating Carousel'}
        </CardTitle>
        <CardDescription>{getStatusMessage()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Slide-by-slide Progress */}
        {status === 'generating' && slides.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Slides</p>
            <div className="space-y-2">
              {slides.map((slide, index) => {
                const slideNumber = index + 1;
                const isComplete = slide.status === 'complete';
                const isInProgress = slideNumber === currentSlide && !isComplete;
                const isPending = slideNumber > currentSlide;

                return (
                  <div
                    key={slideNumber}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isComplete
                        ? 'bg-green-50 dark:bg-green-950'
                        : isInProgress
                        ? 'bg-blue-50 dark:bg-blue-950'
                        : 'bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    {/* Icon */}
                    <div>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : isInProgress ? (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Slide {slideNumber}</span>
                        {slide.image_strategy_used && (
                          <span className="text-xs text-gray-500">
                            • {formatStrategy(slide.image_strategy_used)}
                          </span>
                        )}
                      </div>
                      {slide.text && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                          {slide.text.split('\n')[0]}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="text-xs text-gray-500">
                      {isComplete && slide.generation_time_ms && (
                        <span>{(slide.generation_time_ms / 1000).toFixed(1)}s</span>
                      )}
                      {isInProgress && <span>Processing...</span>}
                      {isPending && <span>Pending</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase Indicator */}
        {status !== 'generating' && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{getStatusMessage()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatStrategy(strategy) {
  const strategies = {
    generate: 'AI Generated',
    download: 'Downloaded',
    download_modify: 'Downloaded + Edited',
    download_combine: 'Downloaded + Composed'
  };
  return strategies[strategy] || strategy;
}
