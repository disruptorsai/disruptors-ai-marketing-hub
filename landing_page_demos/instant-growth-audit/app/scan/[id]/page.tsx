'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StreamEvent, BusinessProfile } from '@/lib/types';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ScanPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/stream?jobId=${jobId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;

        setEvents((prev) => [...prev, data]);

        if (data.type === 'complete') {
          setProfile(data.payload);
          setIsComplete(true);
          eventSource.close();
        }

        if (data.type === 'error') {
          setError(data.message || 'An error occurred');
          eventSource.close();
        }
      } catch (err) {
        console.error('Failed to parse event:', err);
      }
    };

    eventSource.onerror = () => {
      setError('Connection lost');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <CardTitle>Analysis Failed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete && profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Success Header */}
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Analysis Complete!</h1>
          </div>

          {/* Brand Section */}
          {profile.brand && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Name</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.brand.name || 'Not detected'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tagline</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.brand.tagline || 'Not detected'}</p>
                  </div>
                  {profile.brand.palette && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold mb-2">Color Palette</h3>
                      <div className="flex gap-2">
                        <div
                          className="w-16 h-16 rounded-lg border"
                          style={{ backgroundColor: profile.brand.palette.primary }}
                          title="Primary"
                        />
                        {profile.brand.palette.secondary && (
                          <div
                            className="w-16 h-16 rounded-lg border"
                            style={{ backgroundColor: profile.brand.palette.secondary }}
                            title="Secondary"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opportunities */}
          {profile.quickWins && profile.quickWins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities ({profile.quickWins.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.quickWins.slice(0, 10).map((opportunity) => (
                    <div key={opportunity.id} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold">{opportunity.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{opportunity.whyItMatters}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-green-600">
                          Impact: {opportunity.impactBand.likely}/10
                        </span>
                        <span className="text-orange-600">Effort: {opportunity.effort}</span>
                        <span className="text-blue-600">
                          Confidence: {Math.round(opportunity.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <CardTitle>Analyzing Your Business...</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {event.status === 'ready' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  )}
                  <span className="text-gray-600 dark:text-gray-400">{event.message || event.tileId}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
