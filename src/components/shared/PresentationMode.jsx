/**
 * Presentation Mode Component
 * Allows users to download all site assets for instant offline access
 *
 * Features:
 * - One-click download of all videos, images, and pages
 * - Progress tracking
 * - Cache status display
 * - Offline-ready indicator
 * - High-resolution asset caching
 */

import React, { useState, useEffect } from 'react';
import { Download, Check, X, Trash2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PresentationMode() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [cacheStatus, setCacheStatus] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check if service worker is supported and registered
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setServiceWorkerReady(true);
        checkCacheStatus();
      });
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if PWA is installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  /**
   * Check cache status
   */
  const checkCacheStatus = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) return;

      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_STATUS') {
          setCacheStatus(event.data);
        }
      };

      registration.active.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      );
    } catch (error) {
      console.error('Failed to check cache status:', error);
    }
  };

  /**
   * Download all presentation assets
   */
  const downloadPresentationAssets = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Service Worker not supported in this browser');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Initializing download...');

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) {
        throw new Error('Service Worker not active');
      }

      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'DOWNLOAD_PROGRESS') {
          setDownloadProgress(event.data.progress);
          setDownloadStatus(
            `Downloading... ${event.data.downloaded}/${event.data.total} assets`
          );
        }

        if (event.data.type === 'DOWNLOAD_COMPLETE') {
          setIsDownloading(false);
          if (event.data.success) {
            setDownloadStatus(`✅ Complete! ${event.data.cached} assets cached`);
            setTimeout(() => {
              setDownloadStatus('');
              checkCacheStatus();
            }, 3000);
          } else {
            setDownloadStatus(`❌ Failed: ${event.data.error}`);
          }
        }
      };

      registration.active.postMessage(
        { type: 'DOWNLOAD_PRESENTATION_ASSETS' },
        [messageChannel.port2]
      );
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setDownloadStatus(`❌ Error: ${error.message}`);
    }
  };

  /**
   * Clear cache
   */
  const clearCache = async () => {
    if (!confirm('Clear all cached assets? You will need to re-download for offline access.')) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) return;

      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          if (event.data.success) {
            alert('Cache cleared successfully');
            setCacheStatus(null);
            checkCacheStatus();
          }
        }
      };

      registration.active.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  if (!serviceWorkerReady) {
    return null; // Don't show until service worker is ready
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating button */}
      {!showPanel && (
        <Button
          onClick={() => setShowPanel(true)}
          className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Presentation Mode
          {cacheStatus?.ready && (
            <Check className="w-4 h-4 ml-2 text-green-300" />
          )}
        </Button>
      )}

      {/* Expanded panel */}
      {showPanel && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6 w-96">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Presentation Mode
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Download all assets for instant offline access
              </p>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status indicators */}
          <div className="space-y-3 mb-4">
            {/* Online/Offline */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <span className="text-sm text-gray-300">Connection</span>
              <div className="flex items-center">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm text-green-400">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-400 mr-2" />
                    <span className="text-sm text-orange-400">Offline</span>
                  </>
                )}
              </div>
            </div>

            {/* Cache status */}
            {cacheStatus && (
              <div className="p-3 bg-gray-800 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Cached Assets</span>
                  <span className="text-sm text-white font-mono">
                    {cacheStatus.total}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-400">Videos</div>
                    <div className="text-white font-mono">{cacheStatus.videos || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Images</div>
                    <div className="text-white font-mono">{cacheStatus.images || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Pages</div>
                    <div className="text-white font-mono">{cacheStatus.pages || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Ready indicator */}
            {cacheStatus?.ready && (
              <div className="p-3 bg-green-900/30 border border-green-500/50 rounded">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-sm text-green-300 font-medium">
                    Ready for presentations
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Download button */}
          <div className="space-y-3">
            <Button
              onClick={downloadPresentationAssets}
              disabled={isDownloading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {cacheStatus?.ready ? 'Re-download Assets' : 'Download for Offline'}
                </>
              )}
            </Button>

            {/* Progress bar */}
            {isDownloading && downloadProgress > 0 && (
              <div className="space-y-1">
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                    style={{ width: `${downloadProgress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  {Math.round(downloadProgress * 100)}%
                </p>
              </div>
            )}

            {/* Status message */}
            {downloadStatus && (
              <p className="text-xs text-center text-gray-300">
                {downloadStatus}
              </p>
            )}

            {/* Clear cache button */}
            {cacheStatus && cacheStatus.total > 0 && (
              <Button
                onClick={clearCache}
                variant="outline"
                size="sm"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            )}
          </div>

          {/* Help text */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
            <p className="text-xs text-blue-200">
              💡 <strong>Tip:</strong> Download once, load instantly forever. Perfect for presentations on large displays!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
