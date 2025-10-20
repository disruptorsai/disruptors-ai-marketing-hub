// 🔍 DEBUG: Track chunk loading and React availability
console.log('🟢 [MAIN.JSX] Script executing - timestamp:', new Date().toISOString());
console.log('🟢 [MAIN.JSX] Window.React available?', typeof window.React !== 'undefined');
console.log('🟢 [MAIN.JSX] Attempting React import...');

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChunkErrorBoundary>
    <App />
  </ChunkErrorBoundary>
)

console.log('✅ [MAIN.JSX] App rendered successfully!');

// Register service worker for Presentation Mode
import { registerServiceWorker } from '@/lib/register-sw';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker().then((registered) => {
      if (registered) {
        console.log('📦 Presentation Mode available');
      }
    });
  });
} 