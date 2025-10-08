import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateUrl } from '@/lib/growth-audit/utils';
import { ArrowRight, Zap, Target, TrendingUp, Sparkles } from 'lucide-react';

/**
 * Growth Audit Demo Landing Page
 * Allows users to input a URL and start a growth audit
 */
export default function GrowthAuditDemo() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/.netlify/functions/growth-audit-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: validation.normalized }),
      });

      if (!response.ok) {
        throw new Error('Failed to start audit');
      }

      const { jobId } = await response.json();
      navigate(`/demos/growth-audit/${jobId}`);
    } catch (err) {
      setError('Failed to start audit. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Growth Analysis
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
            Instant Growth Audit
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl">
            Drop your URL → Get a branded, AI-powered growth report with prioritized opportunities and a 30/60/90 day plan
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-16">
            <Card className="border-2 border-[#FFD700]/30 bg-slate-800/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="https://yourbusiness.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 h-12 text-lg bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-slate-900 font-bold">
                    {isLoading ? (
                      'Starting...'
                    ) : (
                      <>
                        Scan My Business
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                <p className="text-sm text-slate-400 mt-3">
                  No email required • Results in ~30 seconds • 100% free
                </p>
              </CardContent>
            </Card>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card className="border-[#FFD700]/30 bg-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <Zap className="w-8 h-8 text-[#FFD700] mb-2" />
                <CardTitle className="text-lg text-white">Live Brand Detection</CardTitle>
                <CardDescription className="text-slate-400">Auto-extracts logo, colors, and brand identity</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#FFA500]/30 bg-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <Target className="w-8 h-8 text-[#FFA500] mb-2" />
                <CardTitle className="text-lg text-white">8-15 Opportunities</CardTitle>
                <CardDescription className="text-slate-400">AI-identified growth gaps with impact scoring</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-400/30 bg-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-lg text-white">30/60/90 Plan</CardTitle>
                <CardDescription className="text-slate-400">Actionable roadmap mapped to service packages</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-12 flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-500">Try examples:</span>
            {['shopify.com', 'airbnb.com', 'stripe.com'].map((example) => (
              <button
                key={example}
                onClick={() => setUrl(`https://${example}`)}
                className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
