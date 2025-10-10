import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, FileText, ChevronDown } from 'lucide-react';

/**
 * Public AI Content Writer Demo Page
 *
 * Lead magnet offering 3 free content generations per day.
 * Showcases the AI Content Writer module with public access.
 *
 * Access Level: Public
 * Daily Limit: 3 generations
 * Word Limit: 300 words (capped)
 *
 * After first generation, users see upgrade CTA.
 */
const AIContentWriterDemo = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  const DAILY_LIMIT = 3;

  /**
   * Get or create session ID for telemetry
   */
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('demo_session_id');
    if (!sessionId) {
      sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('demo_session_id', sessionId);
    }
    return sessionId;
  };

  /**
   * Load quota from localStorage on mount
   */
  useEffect(() => {
    const usageKey = 'ai_content_writer_demo_usage';
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(usageKey) || '{}');

    if (stored.date === today) {
      setQuotaUsed(stored.count || 0);
    } else {
      // Reset for new day
      localStorage.setItem(usageKey, JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  /**
   * Execute content generation
   */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError({ message: 'Please enter a topic' });
      return;
    }

    if (quotaUsed >= DAILY_LIMIT) {
      setError({ message: 'Daily limit reached. Sign up for unlimited access!' });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const functionUrl = process.env.NODE_ENV === 'production'
        ? '/.netlify/functions/module-ai-content-writer'
        : 'http://localhost:8888/.netlify/functions/module-ai-content-writer';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId()
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone: tone,
          length: length,
          content_type: 'blog_post'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Content generation failed');
      }

      setResult(data.data);

      // Increment quota
      const newCount = quotaUsed + 1;
      setQuotaUsed(newCount);

      // Store in localStorage
      const usageKey = 'ai_content_writer_demo_usage';
      const today = new Date().toDateString();
      localStorage.setItem(usageKey, JSON.stringify({
        date: today,
        count: newCount
      }));

      // Show CTA after first generation
      if (newCount === 1) {
        setShowCTA(true);
      }

    } catch (err) {
      console.error('Content generation error:', err);
      setError({ message: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy content to clipboard
   */
  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Calculate quota color
   */
  const getQuotaColor = () => {
    if (quotaUsed >= DAILY_LIMIT) return 'text-red-400';
    if (quotaUsed >= DAILY_LIMIT - 1) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-block">
            <span className="bg-green-400/20 text-green-400 px-4 py-2 rounded-full text-sm font-mono border border-green-400/30">
              FREE DEMO
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-green-400 font-mono">
            AI Content Writer
          </h1>

          <p className="text-xl text-green-400/80 max-w-3xl mx-auto">
            Generate professional blog posts, articles, and marketing copy in seconds.
            Powered by Claude Sonnet 4.5 with intelligent content optimization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-green-400/60">
              <Sparkles className="w-5 h-5" />
              <span>3 free generations per day</span>
            </div>
            <div className="flex items-center gap-2 text-green-400/60">
              <FileText className="w-5 h-5" />
              <span>AI-powered writing</span>
            </div>
            <div className="flex items-center gap-2 text-green-400/60">
              <Check className="w-5 h-5" />
              <span>No signup required</span>
            </div>
          </div>

          {/* Quota Counter */}
          <div className={`text-center font-mono ${getQuotaColor()}`}>
            {quotaUsed}/{DAILY_LIMIT} generations used today
            {quotaUsed >= DAILY_LIMIT && (
              <span className="ml-2 text-sm text-green-400/60">
                (Resets at midnight)
              </span>
            )}
          </div>
        </div>

        {/* Content Form */}
        <div className="max-w-4xl mx-auto bg-gray-900/50 border border-green-400/30 rounded-lg p-8">
          <div className="space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-green-400 font-mono text-sm mb-2">
                What do you want to write about?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Benefits of AI in marketing for small businesses'"
                className="w-full bg-black/50 border border-green-400/30 rounded-lg px-4 py-3 text-green-400 placeholder-green-400/40 focus:border-green-400 focus:outline-none font-mono"
                disabled={loading || quotaUsed >= DAILY_LIMIT}
              />
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-green-400 font-mono text-sm mb-2">
                Tone
              </label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-black/50 border border-green-400/30 rounded-lg px-4 py-3 text-green-400 focus:border-green-400 focus:outline-none font-mono appearance-none cursor-pointer"
                  disabled={loading || quotaUsed >= DAILY_LIMIT}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="conversational">Conversational</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60 pointer-events-none" />
              </div>
            </div>

            {/* Length Selection */}
            <div>
              <label className="block text-green-400 font-mono text-sm mb-2">
                Length <span className="text-green-400/60 text-xs">(Demo capped at 300 words)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['short', 'medium', 'long'].map((len) => (
                  <button
                    key={len}
                    onClick={() => setLength(len)}
                    disabled={loading || quotaUsed >= DAILY_LIMIT}
                    className={`px-4 py-3 rounded-lg font-mono text-sm transition-colors ${
                      length === len
                        ? 'bg-green-400 text-black'
                        : 'bg-black/50 border border-green-400/30 text-green-400 hover:border-green-400'
                    } ${(loading || quotaUsed >= DAILY_LIMIT) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {len.charAt(0).toUpperCase() + len.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || quotaUsed >= DAILY_LIMIT || !topic.trim()}
              className="w-full bg-green-400 hover:bg-green-500 text-black px-6 py-4 rounded-lg font-mono font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : quotaUsed >= DAILY_LIMIT ? (
                'Daily Limit Reached'
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-mono text-sm">{error.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Content */}
        {result && (
          <div className="max-w-4xl mx-auto mt-8 bg-gray-900/50 border border-green-400/30 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-400 font-mono">
                  Generated Content
                </h2>
                <p className="text-green-400/60 text-sm font-mono mt-1">
                  {result.word_count} words • {result.model}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-green-400/20 hover:bg-green-400/30 text-green-400 px-4 py-2 rounded-lg font-mono text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="prose prose-invert prose-green max-w-none">
              <div className="text-green-400/90 whitespace-pre-wrap font-sans leading-relaxed">
                {result.content}
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA (shown after first generation) */}
        {showCTA && (
          <div className="max-w-4xl mx-auto mt-8 bg-gradient-to-r from-green-400/10 to-blue-400/10 border border-green-400/30 rounded-lg p-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-green-400 font-mono">
                Like what you see?
              </h3>
              <p className="text-green-400/80">
                Sign up for free to unlock 10 generations per day, longer content (up to 1,500 words),
                Business Brain integration, and save content to your library.
              </p>
              <button className="bg-green-400 hover:bg-green-500 text-black px-8 py-3 rounded-lg font-mono font-bold transition-colors">
                Sign Up for Free →
              </button>
              <p className="text-sm text-green-400/60">
                No credit card required • 10 generations/day • Full access to all features
              </p>
            </div>
          </div>
        )}

        {/* Benefits Section (shown before first generation) */}
        {!result && (
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-400 font-mono">AI-Powered</h3>
              <p className="text-green-400/70">
                Advanced Claude Sonnet 4.5 model generates high-quality, natural-sounding content
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-400 font-mono">SEO Optimized</h3>
              <p className="text-green-400/70">
                Content structured for readability and search engines with natural keyword integration
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-400 font-mono">Brand Consistent</h3>
              <p className="text-green-400/70">
                Authenticated users get content personalized to their Business Brain and brand voice
              </p>
            </div>
          </div>
        )}

        {/* Final CTA Section */}
        <div className="mt-20 text-center space-y-6 bg-gradient-to-r from-green-400/10 to-blue-400/10 border border-green-400/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-green-400 font-mono">
            Ready for Unlimited Content?
          </h2>
          <p className="text-green-400/80 max-w-2xl mx-auto">
            Create a free account to unlock the full power of AI Content Writer with Business Brain integration,
            unlimited daily generations, and advanced content management features.
          </p>
          <button className="bg-green-400 hover:bg-green-500 text-black px-8 py-4 rounded-lg font-mono font-bold text-lg transition-colors">
            Get Started Free →
          </button>
          <p className="text-sm text-green-400/60">
            Join 1,000+ businesses using Disruptors AI • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIContentWriterDemo;
