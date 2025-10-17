import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Play,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  HardDrive,
  Globe,
  Smartphone
} from 'lucide-react';

const PresentationModeControl = () => {
  const [swStatus, setSwStatus] = useState('checking');
  const [cacheStatus, setCacheStatus] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPresentationActive, setIsPresentationActive] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Check service worker and cache status on mount
  useEffect(() => {
    checkServiceWorkerStatus();
    checkCacheStatus();
    checkStorageEstimate();
    checkPresentationModeStatus();
  }, []);

  const checkServiceWorkerStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setSwStatus('active');
          console.log('✅ Service Worker active');
        } else {
          setSwStatus('inactive');
          console.log('⚠️ Service Worker not registered');
        }
      } else {
        setSwStatus('unsupported');
        console.log('❌ Service Worker not supported');
      }
    } catch (error) {
      console.error('Error checking service worker:', error);
      setSwStatus('error');
    }
  };

  const checkCacheStatus = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const presentationCache = cacheNames.find(name => name.includes('presentation-v'));

        if (presentationCache) {
          const cache = await caches.open(presentationCache);
          const cachedRequests = await cache.keys();

          setCacheStatus({
            exists: true,
            name: presentationCache,
            itemCount: cachedRequests.length,
            version: presentationCache.split('-v')[1] || '1'
          });

          // Get last update from cache metadata if available
          const metaResponse = await cache.match('/cache-metadata.json');
          if (metaResponse) {
            const metadata = await metaResponse.json();
            setLastUpdate(new Date(metadata.timestamp));
          }
        } else {
          setCacheStatus({ exists: false, itemCount: 0 });
        }
      }
    } catch (error) {
      console.error('Error checking cache:', error);
      setCacheStatus({ exists: false, error: error.message });
    }
  };

  const checkStorageEstimate = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setStorageEstimate({
          usage: (estimate.usage / 1024 / 1024).toFixed(2), // MB
          quota: (estimate.quota / 1024 / 1024).toFixed(2), // MB
          percent: ((estimate.usage / estimate.quota) * 100).toFixed(1)
        });
      }
    } catch (error) {
      console.error('Error checking storage:', error);
    }
  };

  const checkPresentationModeStatus = () => {
    const isActive = sessionStorage.getItem('presentationMode') === 'true';
    setIsPresentationActive(isActive);
  };

  const downloadPWAAssets = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Send message to service worker to cache all assets
      const registration = await navigator.serviceWorker.ready;

      if (registration.active) {
        // Create a message channel for progress updates
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_PROGRESS') {
            setDownloadProgress(event.data.progress);
          } else if (event.data.type === 'CACHE_COMPLETE') {
            setDownloadProgress(100);
            setTimeout(() => {
              setIsDownloading(false);
              setDownloadProgress(0);
              checkCacheStatus();
              checkStorageEstimate();
              alert('✅ Presentation Mode assets downloaded successfully!');
            }, 1000);
          } else if (event.data.type === 'CACHE_ERROR') {
            console.error('Cache error:', event.data.error);
            setIsDownloading(false);
            alert('❌ Error downloading assets: ' + event.data.error);
          }
        };

        // Send cache request to service worker
        registration.active.postMessage(
          {
            type: 'CACHE_ASSETS',
            timestamp: Date.now()
          },
          [messageChannel.port2]
        );

        console.log('📦 Caching request sent to service worker');
      } else {
        throw new Error('Service Worker not active');
      }
    } catch (error) {
      console.error('Error downloading PWA assets:', error);
      setIsDownloading(false);
      alert('❌ Error: ' + error.message);
    }
  };

  const activatePresentationMode = () => {
    // Check if assets are cached
    if (!cacheStatus?.exists) {
      alert('⚠️ Please download PWA assets first before activating Presentation Mode');
      return;
    }

    // Activate presentation mode
    sessionStorage.setItem('presentationMode', 'true');
    setIsPresentationActive(true);

    // Trigger presentation mode UI
    window.dispatchEvent(new CustomEvent('activatePresentationMode'));

    alert('✅ Presentation Mode activated! The site is now optimized for offline presentation on the tablet.');
  };

  const deactivatePresentationMode = () => {
    sessionStorage.removeItem('presentationMode');
    setIsPresentationActive(false);
    window.dispatchEvent(new CustomEvent('deactivatePresentationMode'));
    alert('Presentation Mode deactivated');
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached presentation assets?')) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const presentationCaches = cacheNames.filter(name => name.includes('presentation'));

      for (const cacheName of presentationCaches) {
        await caches.delete(cacheName);
        console.log('🗑️ Deleted cache:', cacheName);
      }

      setCacheStatus({ exists: false, itemCount: 0 });
      setLastUpdate(null);
      checkStorageEstimate();
      alert('✅ Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('❌ Error clearing cache: ' + error.message);
    }
  };

  const forceUpdate = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        alert('✅ Service Worker update check initiated');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating service worker:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-black/70 border-green-400/30">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-400 text-base">Presentation Mode Control</CardTitle>
                <CardDescription className="text-green-400/80 text-sm">
                  Download and activate PWA for offline tablet presentations
                </CardDescription>
              </div>
            </div>

            {/* Status Badge */}
            <Badge
              variant="outline"
              className={`${
                isPresentationActive
                  ? 'border-green-400 text-green-400'
                  : 'border-yellow-400 text-yellow-400'
              }`}
            >
              {isPresentationActive ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Service Worker Status */}
        <Card className="bg-black/70 border-green-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-mono">Service Worker</span>
              {swStatus === 'active' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-green-400">
              {swStatus === 'active' ? 'Active' : swStatus === 'inactive' ? 'Inactive' : 'Unsupported'}
            </div>
            <p className="text-xs text-green-400/80 mt-1">
              {swStatus === 'active' ? 'Ready for caching' : 'Not available'}
            </p>
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card className="bg-black/70 border-green-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-mono">Cache Status</span>
              <HardDrive className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">
              {cacheStatus?.itemCount || 0} items
            </div>
            <p className="text-xs text-green-400/80 mt-1">
              {cacheStatus?.exists ? `Version ${cacheStatus.version}` : 'No cache'}
            </p>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card className="bg-black/70 border-green-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-mono">Storage Used</span>
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">
              {storageEstimate?.usage || '0'} MB
            </div>
            <p className="text-xs text-green-400/80 mt-1">
              {storageEstimate?.percent || '0'}% of quota
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Download Progress */}
      {isDownloading && (
        <Card className="bg-black/70 border-green-400/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400 font-mono">Downloading assets...</span>
                <span className="text-green-400 font-bold">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Actions */}
      <Card className="bg-black/70 border-green-400/30">
        <CardHeader className="p-4">
          <CardTitle className="text-green-400 text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Download PWA Assets */}
            <Button
              onClick={downloadPWAAssets}
              disabled={isDownloading || swStatus !== 'active'}
              className="w-full bg-blue-500/20 border border-blue-400 text-blue-400 hover:bg-blue-500/30 h-auto py-4 flex flex-col items-center space-y-2"
            >
              <Download className="w-6 h-6" />
              <div>
                <div className="font-bold">Download Latest Assets</div>
                <div className="text-xs opacity-80">Cache site for offline use</div>
              </div>
            </Button>

            {/* Activate Presentation Mode */}
            <Button
              onClick={isPresentationActive ? deactivatePresentationMode : activatePresentationMode}
              disabled={!cacheStatus?.exists}
              className={`w-full h-auto py-4 flex flex-col items-center space-y-2 ${
                isPresentationActive
                  ? 'bg-red-500/20 border border-red-400 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 border border-green-400 text-green-400 hover:bg-green-500/30'
              }`}
            >
              <Play className="w-6 h-6" />
              <div>
                <div className="font-bold">
                  {isPresentationActive ? 'Deactivate' : 'Activate'} Presentation Mode
                </div>
                <div className="text-xs opacity-80">
                  {isPresentationActive ? 'Exit tablet mode' : 'Optimize for tablet'}
                </div>
              </div>
            </Button>

            {/* Clear Cache */}
            <Button
              onClick={clearCache}
              disabled={!cacheStatus?.exists}
              variant="outline"
              className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>

            {/* Force Update */}
            <Button
              onClick={forceUpdate}
              disabled={swStatus !== 'active'}
              variant="outline"
              className="w-full border-purple-400 text-purple-400 hover:bg-purple-400/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Force Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="bg-black/70 border-green-400/30">
        <CardHeader className="p-4">
          <CardTitle className="text-green-400 text-base">Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3 text-sm text-green-400 font-mono">
            <div className="flex items-start space-x-2">
              <WifiOff className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Offline Capability:</strong> Once downloaded, the site will work without internet connection
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Tablet Optimized:</strong> Presentation Mode adjusts UI for large touchscreen displays
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RefreshCw className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Auto-Update:</strong> Service Worker checks for updates on page load
              </div>
            </div>
            {lastUpdate && (
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Last Updated:</strong> {lastUpdate.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {cacheStatus && (
        <Card className="bg-black/70 border-green-400/30">
          <CardHeader className="p-4">
            <CardTitle className="text-green-400 text-base">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <pre className="text-xs text-green-400 font-mono bg-black/50 p-3 rounded overflow-x-auto">
              {JSON.stringify({
                serviceWorker: swStatus,
                cache: cacheStatus,
                storage: storageEstimate,
                presentationActive: isPresentationActive,
                lastUpdate: lastUpdate
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PresentationModeControl;
