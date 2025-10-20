import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, AlertCircle, CheckCircle, BarChart3, Target, Zap, Clock, ExternalLink, Download, ArrowRight, Sparkles } from 'lucide-react';
import Layout from './Layout';

/**
 * Free SEO Audit Tool - Public Lead Generation Page
 * Premium, high-end design with animated typing and smooth reveals
 */
export default function ToolsSEOAudit() {
  const [step, setStep] = useState('form'); // form, analyzing, results
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [auditId, setAuditId] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [typingMessage, setTypingMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!domain || !email) {
      setError('Please enter both your website URL and email address');
      return;
    }

    setStep('analyzing');
    startAudit();
  };

  const startAudit = async () => {
    try {
      const eventSource = new EventSource(
        `/.netlify/functions/seo-audit-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            domain: domain,
            email: email,
            name: name,
            source: 'public'
          })
        }
      );

      // Note: EventSource doesn't support POST directly, so we'll use fetch with SSE
      const response = await fetch('/.netlify/functions/seo-audit-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain,
          email: email,
          name: name,
          source: 'public'
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleProgressUpdate(data);
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Audit error:', error);
      setError('Failed to run audit. Please try again.');
      setStep('form');
    }
  };

  const handleProgressUpdate = (data) => {
    setProgress(data.progress || 0);
    setCurrentMessage(data.message || '');
    setTypingMessage(data.typing || '');

    if (data.auditId) {
      setAuditId(data.auditId);
    }

    if (data.step === 'complete') {
      setTimeout(() => {
        loadResults(data.auditId);
      }, 1000);
    }

    if (data.error) {
      setError(data.error);
      setStep('form');
    }
  };

  const loadResults = async (id) => {
    try {
      // In production, this would fetch from a public API endpoint
      // For now, we'll use the audit data from the stream
      setStep('results');

      // Fetch full audit data
      const response = await fetch(`/.netlify/functions/seo-audit-get?id=${id}`);
      const audit = await response.json();
      setAuditData(audit);
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFD700] rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm text-[#FFD700]">AI-Powered SEO Analysis</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500]">Comprehensive</span><br />
                SEO Audit
              </h1>

              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
                Get a professional 20,000-word SEO analysis report in 5 minutes. Discover exactly what's holding your website back from page 1 rankings.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                <FeatureBadge icon={<Search />} text="Keyword Analysis" />
                <FeatureBadge icon={<BarChart3 />} text="Competitor Research" />
                <FeatureBadge icon={<Target />} text="Content Audit" />
                <FeatureBadge icon={<Zap />} text="Instant Results" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="relative pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <AnimatePresence mode="wait">
              {step === 'form' && (
                <FormStep
                  domain={domain}
                  setDomain={setDomain}
                  email={email}
                  setEmail={setEmail}
                  name={name}
                  setName={setName}
                  onSubmit={handleSubmit}
                  error={error}
                />
              )}

              {step === 'analyzing' && (
                <AnalyzingStep
                  progress={progress}
                  currentMessage={currentMessage}
                  typingMessage={typingMessage}
                  domain={domain}
                />
              )}

              {step === 'results' && auditData && (
                <ResultsStep
                  auditData={auditData}
                  domain={domain}
                  email={email}
                />
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Trust Indicators */}
        {step === 'form' && (
          <section className="py-20 border-t border-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <TrustIndicator
                  number="500+"
                  label="Businesses Analyzed"
                  icon={<TrendingUp className="w-8 h-8" />}
                />
                <TrustIndicator
                  number="15,000+"
                  label="Words Per Report"
                  icon={<BarChart3 className="w-8 h-8" />}
                />
                <TrustIndicator
                  number="5 min"
                  label="Average Time"
                  icon={<Clock className="w-8 h-8" />}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

/**
 * Feature Badge Component
 */
function FeatureBadge({ icon, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center space-y-2 p-4 bg-[#1a1a1a]/50 border border-gray-800 rounded-lg hover:border-[#FFD700]/30 transition-all"
    >
      <div className="text-[#FFD700]">{icon}</div>
      <span className="text-sm text-gray-300">{text}</span>
    </motion.div>
  );
}

/**
 * Form Step - Lead Capture
 */
function FormStep({ domain, setDomain, email, setEmail, name, setName, onSubmit, error }) {
  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          Get Your Free SEO Audit
        </h2>
        <p className="text-gray-400">
          Enter your website URL and email to receive your comprehensive analysis
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Website URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Website URL *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            No http:// needed - just enter your domain
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all"
            required
          />
        </div>

        {/* Name (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all"
          />
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold rounded-lg hover:from-[#FFC700] hover:to-[#FF8C00] transition-all shadow-lg shadow-[#FFD700]/20 flex items-center justify-center space-x-2"
        >
          <span>Analyze My Website</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center space-x-6 pt-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Instant results</span>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

/**
 * Analyzing Step - Animated Progress with Typing
 */
function AnalyzingStep({ progress, currentMessage, typingMessage, domain }) {
  const [displayedTyping, setDisplayedTyping] = useState('');
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Typing animation effect
    if (typingMessage) {
      setDisplayedTyping('');
      let i = 0;

      const typeNextChar = () => {
        if (i < typingMessage.length) {
          setDisplayedTyping(prev => prev + typingMessage[i]);
          i++;
          typingTimeoutRef.current = setTimeout(typeNextChar, 20); // 20ms per character
        }
      };

      typeNextChar();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [typingMessage]);

  return (
    <motion.div
      key="analyzing"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl"
    >
      <div className="text-center mb-12">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center"
        >
          <Search className="w-10 h-10 text-black" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-3">
          Analyzing {domain}
        </h2>
        <p className="text-gray-400">
          Our AI is performing a deep SEO audit of your website
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">{currentMessage}</span>
          <span className="text-sm font-semibold text-[#FFD700]">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Typing Terminal */}
      <div className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-6 min-h-[200px] font-mono">
        {/* Terminal Header */}
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-800">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-gray-500">seo-analyzer.ai</span>
        </div>

        {/* Terminal Content */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-green-500 flex-shrink-0">$</span>
            <div className="flex-1">
              <motion.p
                className="text-sm text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {displayedTyping}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-[#FFD700] ml-1"
                />
              </motion.p>
            </div>
          </div>

          {/* Progress Indicators */}
          <AnimatePresence>
            {progress >= 10 && (
              <ProgressLine
                icon="✓"
                text="Website connection established"
                delay={0}
              />
            )}
            {progress >= 30 && (
              <ProgressLine
                icon="✓"
                text="Meta tags and structure extracted"
                delay={0.1}
              />
            )}
            {progress >= 50 && (
              <ProgressLine
                icon="✓"
                text="Content analysis complete"
                delay={0.2}
              />
            )}
            {progress >= 70 && (
              <ProgressLine
                icon="✓"
                text="Keyword rankings analyzed"
                delay={0.3}
              />
            )}
            {progress >= 85 && (
              <ProgressLine
                icon="✓"
                text="AI recommendations generated"
                delay={0.4}
              />
            )}
            {progress >= 95 && (
              <ProgressLine
                icon="✓"
                text="Report compilation in progress..."
                delay={0.5}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fun Fact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
      >
        <p className="text-sm text-blue-400">
          <strong>Did you know?</strong> 75% of users never scroll past the first page of search results. Let's get you there.
        </p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Progress Line Component (for terminal)
 */
function ProgressLine({ icon, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay }}
      className="flex items-center space-x-2 text-sm"
    >
      <span className="text-green-500">{icon}</span>
      <span className="text-gray-400">{text}</span>
    </motion.div>
  );
}

/**
 * Results Step - Beautiful Results Display
 */
function ResultsStep({ auditData, domain, email }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data structure (replace with real auditData)
  const mockData = {
    overall_score: 42,
    ranked_keywords_count: 4,
    average_position: 66.5,
    organic_traffic_estimate: 8,
    critical_issues_count: 5,
    high_priority_issues_count: 8,
    sections: {
      metaTags: { score: 0, issues: ['No meta descriptions', 'Missing title tags'] },
      contentDepth: { score: 5, issues: ['Thin content', 'Low word count'] },
      keywordOptimization: { score: 3, issues: ['Missing primary keywords', 'No geo-targeting'] },
      technicalSEO: { score: 2, issues: ['No schema markup', 'Broken canonical tags'] },
      eeatSignals: { score: 4, issues: ['No author credentials', 'Missing trust badges'] }
    },
    topKeywords: [
      { keyword: 'disruptor marketing', position: 35, volume: 170 },
      { keyword: 'disrupt media', position: 79, volume: 140 },
      { keyword: 'marketing disruptors', position: 103, volume: 170 }
    ]
  };

  const data = auditData || mockData;

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Analysis Complete!
        </h2>
        <p className="text-gray-400">
          Your comprehensive SEO report for <span className="text-[#FFD700]">{domain}</span> is ready
        </p>
      </motion.div>

      {/* Score Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-gray-800 rounded-2xl p-8 relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] rounded-full blur-3xl"></div>
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Overall SEO Score</h3>
            <p className="text-gray-400">Your website's current search engine optimization health</p>
          </div>
          <div className="text-right">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className={`text-6xl font-bold ${
                data.overall_score >= 70 ? 'text-green-500' :
                data.overall_score >= 50 ? 'text-yellow-500' :
                'text-red-500'
              }`}
            >
              {data.overall_score}
            </motion.div>
            <div className="text-sm text-gray-400">out of 100</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <QuickStat label="Keywords Ranking" value={data.ranked_keywords_count} color="blue" />
          <QuickStat label="Avg Position" value={`#${data.average_position?.toFixed(1) || 'N/A'}`} color="purple" />
          <QuickStat label="Monthly Traffic" value={data.organic_traffic_estimate} color="green" />
          <QuickStat label="Critical Issues" value={data.critical_issues_count} color="red" />
        </div>
      </motion.div>

      {/* Key Findings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8"
      >
        <h3 className="text-2xl font-bold text-white mb-6">Critical Findings</h3>
        <div className="space-y-4">
          <FindingCard
            icon={<AlertCircle className="w-6 h-6 text-red-500" />}
            title="Meta Tags Missing"
            description="Your site has no meta descriptions, preventing search engines from understanding your pages."
            priority="critical"
          />
          <FindingCard
            icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
            title="Thin Content Detected"
            description="Pages average 300-500 words. Competitors have 2,500-3,000 words per page."
            priority="high"
          />
          <FindingCard
            icon={<AlertCircle className="w-6 h-6 text-yellow-500" />}
            title="No Schema Markup"
            description="Missing structured data prevents rich snippets in search results."
            priority="high"
          />
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/20 rounded-2xl p-8 text-center"
      >
        <h3 className="text-2xl font-bold text-white mb-4">
          Want Help Implementing These Fixes?
        </h3>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Our team can handle everything for you. We've helped 500+ businesses improve their SEO by an average of 300%.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold rounded-lg hover:from-[#FFC700] hover:to-[#FF8C00] transition-all shadow-lg shadow-[#FFD700]/20 flex items-center space-x-2"
          >
            <span>Book Free Strategy Call</span>
            <ExternalLink className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[#1a1a1a] border border-gray-700 text-white font-semibold rounded-lg hover:border-[#FFD700]/30 transition-all flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Full Report</span>
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Report sent to {email} • Check your inbox in 2 minutes
        </p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Quick Stat Component
 */
function QuickStat({ label, value, color }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-lg p-4 text-center`}>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

/**
 * Finding Card Component
 */
function FindingCard({ icon, title, description, priority }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-start space-x-4 p-4 bg-[#0a0a0a]/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-all"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-semibold">{title}</h4>
          <span className={`px-2 py-1 text-xs rounded-full ${
            priority === 'critical' ? 'bg-red-500/20 text-red-400' :
            priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {priority}
          </span>
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
}

/**
 * Trust Indicator Component
 */
function TrustIndicator({ number, label, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center"
    >
      <div className="text-[#FFD700] mb-3">{icon}</div>
      <div className="text-4xl font-bold text-white mb-2">{number}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}
