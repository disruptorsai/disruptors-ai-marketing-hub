// 🔍 DEBUG: Track chunk loading and React availability
console.log('🟢 [MAIN.JSX] Script executing - timestamp:', new Date().toISOString());
console.log('🟢 [MAIN.JSX] Window.React available?', typeof window.React !== 'undefined');
console.log('🟢 [MAIN.JSX] Attempting React import...');

// ⚡ CRITICAL: Initialize cache buster FIRST
import { initCacheBuster } from '@/utils/cacheBuster';

console.log('🚀 [MAIN.JSX] Initializing cache buster...');
initCacheBuster();

// ⚡ CRITICAL: Check build version BEFORE importing anything else
import { checkBuildVersion } from '@/utils/versionCheck';

console.log('🔍 [MAIN.JSX] Checking build version...');
const versionCheckPassed = checkBuildVersion();

if (!versionCheckPassed) {
  console.log('🔄 [MAIN.JSX] Version mismatch - reload initiated');
  throw new Error('Version mismatch - reload in progress');
}

console.log('✅ [MAIN.JSX] Version check passed - proceeding with app load');

import React from 'react'

console.log('✅ [MAIN.JSX] React imported successfully!');
console.log('✅ [MAIN.JSX] React.version:', React.version);
console.log('✅ [MAIN.JSX] React.forwardRef:', typeof React.forwardRef);

import ReactDOM from 'react-dom/client'

console.log('✅ [MAIN.JSX] ReactDOM imported successfully!');

import App from '@/App.jsx'

console.log('✅ [MAIN.JSX] App imported successfully!');

import ChunkErrorBoundary from '@/components/ChunkErrorBoundary'

console.log('✅ [MAIN.JSX] ChunkErrorBoundary imported successfully!');

import '@/index.css'

console.log('✅ [MAIN.JSX] CSS imported successfully!');
console.log('✅ [MAIN.JSX] All imports complete, rendering app...');

const rootElement = document.getElementById('root');

const appTree = (
  <ChunkErrorBoundary>
    <App />
  </ChunkErrorBoundary>
);

// Prerendered marketing routes (see scripts/prerender.js) ship real HTML inside #root.
// Hydrate those snapshots; fall back to a fresh client render for non-prerendered routes.
if (rootElement.hasChildNodes()) {
  console.log('💧 [MAIN.JSX] Prerendered HTML detected — hydrating...');
  ReactDOM.hydrateRoot(rootElement, appTree);
} else {
  ReactDOM.createRoot(rootElement).render(appTree);
}

console.log('✅ [MAIN.JSX] App rendered successfully!');

// Register service worker for Presentation Mode
import { registerServiceWorker } from '@/lib/register-sw';

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      registerServiceWorker().then((registered) => {
        if (registered) {
          console.log('📦 Presentation Mode available');
        }
      });
    });
  } else {
    // In dev, the presentation service worker caches JS modules cache-first and serves
    // stale Vite dev bundles — this breaks HMR and causes "does not provide an export
    // named X" errors. Tear down any previously-registered SW and clear its caches so
    // the dev server is always the source of truth.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  }
}