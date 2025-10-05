'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateUrl } from '@/lib/utils';
import { Sparkles, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: validation.normalized }),
      });

      if (!response.ok) {
        throw new Error('Failed to start audit');
      }

      const { jobId } = await response.json();
      router.push(`/scan/${jobId}`);
    } catch (err) {
      setError('Failed to start audit. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Growth Analysis
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Instant Growth Audit
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
            Drop your URL → Get a branded, AI-powered growth report with prioritized opportunities and a 30/60/90 day plan
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-16">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="https://yourbusiness.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 h-12 text-lg"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-8">
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
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  No email required • Results in ~30 seconds • 100% free
                </p>
              </CardContent>
            </Card>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader>
                <Zap className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Live Brand Detection</CardTitle>
                <CardDescription>Auto-extracts logo, colors, and brand identity</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-100 dark:border-purple-900">
              <CardHeader>
                <Target className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">8-15 Opportunities</CardTitle>
                <CardDescription>AI-identified growth gaps with impact scoring</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-indigo-100 dark:border-indigo-900">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle className="text-lg">30/60/90 Plan</CardTitle>
                <CardDescription>Actionable roadmap mapped to service packages</CardDescription>
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
