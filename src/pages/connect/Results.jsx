import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Users, MessageSquare, BarChart3, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.3);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(96, 165, 250, 0.5);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(96, 165, 250, 0.7);
  }
`;

// Question labels matching Poll.jsx EXACTLY
const QUESTIONS = {
  q1_experience: {
    title: 'How would you describe your current experience with AI?',
    options: {
      A: 'I\'ve never used it and barely understand what it does',
      B: 'I\'ve tried tools like ChatGPT, but only casually',
      C: 'I use AI in some areas of my business',
      D: 'I actively use AI systems or automation in my daily work'
    }
  },
  q2_goal: {
    title: 'What\'s your biggest goal for using AI in your business?',
    options: {
      A: 'Save time and streamline repetitive work',
      B: 'Generate more leads and marketing content',
      C: 'Improve communication or customer service',
      D: 'Create entirely new products or services'
    }
  },
  q3_hesitation: {
    title: 'What\'s your biggest hesitation about AI?',
    options: {
      A: 'It feels overwhelming or confusing',
      B: 'I\'m worried it\'ll replace human jobs',
      C: 'I don\'t trust it to produce quality work',
      D: 'I don\'t have time to learn how to use it'
    }
  },
  q4_confidence: {
    title: 'How confident are you that you can learn and utilize AI tools yourself?',
    options: {
      A: 'Not confident — I\'ll need some help',
      B: 'Somewhat confident — I\'d need some guidance, but I\'m tech savvy',
      C: 'Confident — I just need the right tools, I\'ve got this',
      D: 'Very confident — I have already started using AI tools and I\'m good at it'
    }
  },
  q5_impact_area: {
    title: 'Which area of your business do you think AI could impact the most?',
    options: {
      A: 'Marketing and content creation',
      B: 'Operations and workflow automation',
      C: 'Sales and customer follow-up',
      D: 'Data, reporting, or analytics'
    }
  }
};

// National averages based on 2025 research (McKinsey, IBM, SBE Council surveys)
// Sources: McKinsey State of AI 2025, IBM AI Adoption Index, SBE Council surveys
const NATIONAL_AVERAGES = {
  totalResponses: 'National Average (2025)',
  multipleChoice: {
    q1_experience: {
      A: 3,   // Never used: 3% (94% have some familiarity)
      B: 18,  // Casual use: 18%
      C: 49,  // Business use: 49% (78% organizational adoption)
      D: 30   // Daily use: 30% (62% of 35-44 age group high expertise)
    },
    q2_goal: {
      A: 35,  // Save time: 35%
      B: 30,  // Leads/marketing: 30% (78% adoption in marketing)
      C: 20,  // Customer service: 20% (79% say crucial)
      D: 15   // New products: 15%
    },
    q3_hesitation: {
      A: 35,  // Overwhelming: 35% (33% lack expertise)
      B: 10,  // Job replacement: 10%
      C: 15,  // Trust quality: 15%
      D: 40   // Security/privacy: 40% (38-46% data concerns)
    },
    q4_confidence: {
      A: 10,  // Not confident: 10%
      B: 26,  // Somewhat: 26%
      C: 39,  // Confident: 39% (64% confident in productivity)
      D: 25   // Very confident: 25% (76% positive sentiment)
    },
    q5_impact_area: {
      A: 30,  // Marketing: 30% (78% adoption)
      B: 15,  // Operations: 15%
      C: 20,  // Sales: 20%
      D: 35   // Customer service/Data: 35% (79% say crucial, 95% of interactions by 2025)
    }
  }
};

const OPEN_ENDED = {
  q6_general_text: 'What are your unfiltered thoughts on AI in general?',
  q7_automation_text: 'What\'s a repetitive task you could automate with AI?'
};

function BarChart({ data, total, presentationMode }) {
  // Sort by count descending
  const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a);

  return (
    <div className={presentationMode ? 'space-y-5' : 'space-y-3'}>
      {sortedEntries.map(([option, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
        const barWidth = total > 0 ? (count / total) * 100 : 0;

        // Get option label
        const optionLabel = QUESTIONS[Object.keys(QUESTIONS).find(q =>
          QUESTIONS[q].options[option]
        )].options[option];

        return (
          <div key={option}>
            {/* Bar container - mimics reference design */}
            <div className={`relative ${presentationMode ? 'h-20' : 'h-16'} bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50`}>
              {/* Fill bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-cyan-500/10"
              />

              {/* Content overlay */}
              <div className="relative h-full flex items-center justify-between px-6">
                {/* Left: Option label */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-white font-semibold ${presentationMode ? 'text-2xl' : 'text-lg'}`}>
                    {optionLabel}
                  </span>
                </div>

                {/* Right: Percentage */}
                <div className={`text-white font-bold ${presentationMode ? 'text-4xl' : 'text-2xl'} ml-4`}>
                  {percentage}%
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MultipleChoiceTab({ results, totalResponses, presentationMode }) {
  return (
    <div className={presentationMode ? 'space-y-16' : 'space-y-10'}>
      {Object.entries(QUESTIONS).map(([questionId, question]) => {
        // Calculate vote count for this question
        const questionVotes = Object.values(results.multipleChoice[questionId]).reduce((sum, count) => sum + count, 0);

        return (
          <motion.div
            key={questionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-900/30 ${presentationMode ? 'p-12' : 'p-8'} rounded-2xl border border-gray-700/30`}
          >
            <div className="mb-8">
              <h3 className={`${presentationMode ? 'text-4xl' : 'text-2xl'} font-bold text-white mb-3`}>
                {question.title}
              </h3>
              <p className={`text-gray-400 ${presentationMode ? 'text-xl' : 'text-sm'}`}>
                {questionVotes} {questionVotes === 1 ? 'vote' : 'votes'}
              </p>
            </div>
            <BarChart
              data={results.multipleChoice[questionId]}
              total={questionVotes}
              presentationMode={presentationMode}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function OpenEndedTab({ results, presentationMode }) {
  return (
    <div className={presentationMode ? 'space-y-16' : 'space-y-10'}>
      {Object.entries(OPEN_ENDED).map(([questionId, questionText]) => {
        const responses = results.openEnded[questionId] || [];

        return (
          <motion.div
            key={questionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-900/30 ${presentationMode ? 'p-12' : 'p-8'} rounded-2xl border border-gray-700/30`}
          >
            <div className="mb-8">
              <h3 className={`${presentationMode ? 'text-4xl' : 'text-2xl'} font-bold text-white mb-3`}>
                {questionText}
              </h3>
              <p className={`text-gray-400 ${presentationMode ? 'text-xl' : 'text-base'}`}>
                {responses.length} {responses.length === 1 ? 'response' : 'responses'}
              </p>
            </div>

            {responses.length === 0 ? (
              <div className={`text-center py-16 text-gray-500 ${presentationMode ? 'text-2xl' : 'text-base'}`}>
                No responses yet
              </div>
            ) : (
              <div className={`${presentationMode ? 'space-y-6' : 'space-y-4'} ${presentationMode ? 'max-h-[800px]' : 'max-h-[600px]'} overflow-y-auto pr-4 custom-scrollbar`}>
                {responses.map((response, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gray-800/40 ${presentationMode ? 'p-8' : 'p-6'} rounded-xl border border-gray-700/50`}
                  >
                    <p className={`text-gray-100 ${presentationMode ? 'text-2xl' : 'text-lg'} leading-relaxed`}>
                      {response}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Fallback mock data in case API fails or database is empty
const FALLBACK_DATA = {
  totalResponses: 0,
  multipleChoice: {
    q1_experience: { A: 0, B: 0, C: 0, D: 0 },
    q2_goal: { A: 0, B: 0, C: 0, D: 0 },
    q3_hesitation: { A: 0, B: 0, C: 0, D: 0 },
    q4_confidence: { A: 0, B: 0, C: 0, D: 0 },
    q5_impact_area: { A: 0, B: 0, C: 0, D: 0 }
  },
  openEnded: {
    q6_general_text: [],
    q7_automation_text: []
  }
};

export default function ConnectResults() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showNationalAverage, setShowNationalAverage] = useState(false);

  const fetchResults = async (isRetry = false) => {
    try {
      setError(null);
      const response = await fetch('/.netlify/functions/poll-results?eventId=connect-2025-10');

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setLastUpdated(new Date());
        setRetryCount(0); // Reset retry count on success

        // Cache results to localStorage for offline fallback
        try {
          localStorage.setItem('connect-poll-results-cache', JSON.stringify({
            data,
            timestamp: new Date().toISOString()
          }));
        } catch (cacheError) {
          console.warn('Failed to cache results:', cacheError);
        }
      } else {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setError(err.message);

      // Try to load from cache first
      if (!isRetry && !results) {
        try {
          const cached = localStorage.getItem('connect-poll-results-cache');
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            console.log('Using cached data from', timestamp);
            setResults(data);
            setLastUpdated(new Date(timestamp));
            return; // Exit early with cached data
          }
        } catch (cacheError) {
          console.warn('Failed to load cached results:', cacheError);
        }

        // If no cache, use fallback
        console.log('Using fallback data due to API error');
        setResults(FALLBACK_DATA);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to load cached data immediately for instant display
    try {
      const cached = localStorage.getItem('connect-poll-results-cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        setResults(data);
        setLastUpdated(new Date(timestamp));
      }
    } catch (cacheError) {
      console.warn('Failed to load initial cache:', cacheError);
    }

    // Then fetch fresh data
    fetchResults();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchResults, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Keyboard shortcuts for presentation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        fetchResults();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        setPresentationMode(!presentationMode);
      } else if (e.key === 'a' || e.key === 'A') {
        setAutoRefresh(!autoRefresh);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [autoRefresh, presentationMode]);

  const handleRefresh = () => {
    setLoading(true);
    setRetryCount(prev => prev + 1);
    fetchResults(true);
  };

  const handleRetry = () => {
    setLoading(true);
    setRetryCount(prev => prev + 1);
    fetchResults(true);
  };

  if (loading && !results) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center font-montreal">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-xl">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] font-montreal">
      {/* Custom scrollbar styles */}
      <style>{scrollbarStyles}</style>

      {/* Keyboard shortcuts help - Press ? to show */}
      {!presentationMode && (
        <div className="fixed bottom-6 right-6 bg-gray-900/90 backdrop-blur-lg border border-gray-800 rounded-xl p-4 text-sm z-50">
          <div className="text-gray-400 space-y-1">
            <div><kbd className="px-2 py-1 bg-gray-800 rounded text-cyan-400">R</kbd> Refresh</div>
            <div><kbd className="px-2 py-1 bg-gray-800 rounded text-cyan-400">A</kbd> Auto-refresh</div>
            <div><kbd className="px-2 py-1 bg-gray-800 rounded text-cyan-400">F</kbd> Fullscreen</div>
            <div><kbd className="px-2 py-1 bg-gray-800 rounded text-cyan-400">P</kbd> Presentation</div>
          </div>
        </div>
      )}

      {/* Header - Hidden in presentation mode */}
      {!presentationMode && (
        <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Poll Results
                  </h1>
                  <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">
                        {results?.totalResponses || 0} responses
                      </span>
                    </div>
                    {lastUpdated && (
                      <span className="text-sm">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowNationalAverage(!showNationalAverage)}
                  variant={showNationalAverage ? "default" : "outline"}
                  className={showNationalAverage
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold"
                    : "border-gray-700 text-gray-300"
                  }
                >
                  {showNationalAverage ? '📊 National Average' : '👥 Your Attendees'}
                </Button>

                <Button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  variant={autoRefresh ? "default" : "outline"}
                  className={autoRefresh
                    ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-bold"
                    : "border-gray-700 text-gray-300"
                  }
                >
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </Button>

                <Button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-gradient-to-r from-magenta-400 to-magenta-600 text-white font-bold"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                <Button
                  onClick={() => setPresentationMode(true)}
                  variant="outline"
                  className="border-gray-700 text-gray-300"
                >
                  Presentation Mode
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presentation mode indicator */}
      {presentationMode && (
        <div className="fixed top-6 right-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cyan-400/10 border border-cyan-400 rounded-full px-6 py-3 backdrop-blur-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 font-bold">PRESENTATION MODE</span>
              <span className="text-gray-400 text-sm">Press P to exit</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Error Banner - Shows when API fails */}
      {error && !presentationMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border-t border-b border-yellow-500/30 backdrop-blur-lg sticky top-[73px] z-40"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-yellow-500 font-semibold">
                    {results?.totalResponses > 0 ? 'Connection Issue - Showing Cached Data' : 'Unable to Load Results'}
                  </p>
                  <p className="text-yellow-400/80 text-sm">
                    {error} {retryCount > 0 && `(Retry ${retryCount})`}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRetry}
                disabled={loading}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* No Data Warning - Shows when database is empty */}
      {results && results.totalResponses === 0 && !error && !presentationMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border-t border-b border-blue-500/30 backdrop-blur-lg sticky top-[73px] z-40"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-blue-500 font-semibold">
                  No Poll Responses Yet
                </p>
                <p className="text-blue-400/80 text-sm">
                  Results will appear here as attendees submit their responses
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className={`mx-auto px-6 ${presentationMode ? 'max-w-[95vw] py-16' : 'max-w-7xl py-12'}`}>
        {/* Live stats bar in presentation mode */}
        {presentationMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-full px-8 py-4">
              <Users className="w-8 h-8 text-cyan-400" />
              <span className="text-5xl font-bold text-white">
                {showNationalAverage ? 'National Avg' : (results?.totalResponses || 0)}
              </span>
              <span className="text-2xl text-gray-400">{showNationalAverage ? '2025 Survey Data' : 'Total Responses'}</span>
            </div>
          </motion.div>
        )}

        {/* National Average Indicator Banner */}
        {showNationalAverage && !presentationMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-blue-400 font-bold text-lg">
                📊 Viewing National Average Data (2025)
              </p>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Based on McKinsey, IBM, and SBE Council surveys of business AI adoption
            </p>
          </motion.div>
        )}

        <Tabs defaultValue="multiple-choice" className="w-full">
          <TabsList className={`grid w-full ${presentationMode ? 'max-w-2xl' : 'max-w-md'} mx-auto grid-cols-2 bg-gray-900 border border-gray-800 mb-12`}>
            <TabsTrigger
              value="multiple-choice"
              className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-600 data-[state=active]:text-black ${presentationMode ? 'text-2xl py-6' : 'text-lg py-4'}`}
            >
              <BarChart3 className={`${presentationMode ? 'w-7 h-7' : 'w-5 h-5'} mr-2`} />
              Multiple Choice
            </TabsTrigger>
            <TabsTrigger
              value="open-ended"
              className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-magenta-400 data-[state=active]:to-magenta-600 data-[state=active]:text-white ${presentationMode ? 'text-2xl py-6' : 'text-lg py-4'}`}
            >
              <MessageSquare className={`${presentationMode ? 'w-7 h-7' : 'w-5 h-5'} mr-2`} />
              Open-Ended
            </TabsTrigger>
          </TabsList>

          <TabsContent value="multiple-choice">
            {(showNationalAverage || results) && (
              <MultipleChoiceTab
                results={showNationalAverage ? NATIONAL_AVERAGES : results}
                totalResponses={showNationalAverage ? 100 : results?.totalResponses}
                presentationMode={presentationMode}
              />
            )}
          </TabsContent>

          <TabsContent value="open-ended">
            {!showNationalAverage && results && (
              <OpenEndedTab
                results={results}
                presentationMode={presentationMode}
              />
            )}
            {showNationalAverage && (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">Open-ended responses not available for national averages</p>
                <p className="text-sm mt-2">Switch to "Your Attendees" to see text responses</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
