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
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl blur opacity-50" />
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-white text-lg">Presentation Mode Control</CardTitle>
                <CardDescription className="text-white/60">
                  Download and activate PWA for offline tablet presentations
                </CardDescription>
              </div>
            </div>

            {/* Status Badge */}
            <Badge
              variant="outline"
              className={`${
                isPresentationActive
                  ? 'border-emerald-400/50 text-emerald-400 bg-emerald-400/10'
                  : 'border-amber-400/50 text-amber-400 bg-amber-400/10'
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
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm font-medium">Service Worker</span>
              {swStatus === 'active' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {swStatus === 'active' ? 'Active' : swStatus === 'inactive' ? 'Inactive' : 'Unsupported'}
            </div>
            <p className="text-sm text-white/50">
              {swStatus === 'active' ? 'Ready for caching' : 'Not available'}
            </p>
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm font-medium">Cache Status</span>
              <HardDrive className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {cacheStatus?.itemCount || 0} items
            </div>
            <p className="text-sm text-white/50">
              {cacheStatus?.exists ? `Version ${cacheStatus.version}` : 'No cache'}
            </p>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm font-medium">Storage Used</span>
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {storageEstimate?.usage || '0'} MB
            </div>
            <p className="text-sm text-white/50">
              {storageEstimate?.percent || '0'}% of quota
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Download Progress */}
      {isDownloading && (
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Downloading assets...</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2 bg-white/10" />
              <p className="text-sm text-white/50">This may take a few moments...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Actions */}
      <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-white text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Download PWA Assets */}
            <Button
              onClick={downloadPWAAssets}
              disabled={isDownloading || swStatus !== 'active'}
              className="w-full bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-auto py-6 flex flex-col items-center space-y-3 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download className="w-7 h-7" />
              <div>
                <div className="font-bold text-base">Download Latest Assets</div>
                <div className="text-xs opacity-90">Cache site for offline use</div>
              </div>
            </Button>

            {/* Activate Presentation Mode */}
            <Button
              onClick={isPresentationActive ? deactivatePresentationMode : activatePresentationMode}
              disabled={!cacheStatus?.exists}
              className={`w-full h-auto py-6 flex flex-col items-center space-y-3 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isPresentationActive
                  ? 'bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/20'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20'
              } text-white`}
            >
              <Play className="w-7 h-7" />
              <div>
                <div className="font-bold text-base">
                  {isPresentationActive ? 'Deactivate' : 'Activate'} Presentation Mode
                </div>
                <div className="text-xs opacity-90">
                  {isPresentationActive ? 'Exit tablet mode' : 'Optimize for tablet'}
                </div>
              </div>
            </Button>

            {/* Clear Cache */}
            <Button
              onClick={clearCache}
              disabled={!cacheStatus?.exists}
              variant="outline"
              className="w-full border-amber-400/50 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>

            {/* Force Update */}
            <Button
              onClick={forceUpdate}
              disabled={swStatus !== 'active'}
              variant="outline"
              className="w-full border-blue-400/50 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Force Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-white text-lg">Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4 text-sm text-white/80">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <WifiOff className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-white mb-1">Offline Capability</div>
                <div className="text-white/60">Once downloaded, the site will work without internet connection</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Smartphone className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="font-medium text-white mb-1">Tablet Optimized</div>
                <div className="text-white/60">Presentation Mode adjusts UI for large touchscreen displays</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="font-medium text-white mb-1">Auto-Update</div>
                <div className="text-white/60">Service Worker checks for updates on page load</div>
              </div>
            </div>
            {lastUpdate && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-white mb-1">Last Updated</div>
                  <div className="text-white/60">{lastUpdate.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {cacheStatus && (
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-white text-lg">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <pre className="text-xs text-white/70 font-supply bg-slate-950/50 p-4 rounded-lg overflow-x-auto border border-white/5">
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
