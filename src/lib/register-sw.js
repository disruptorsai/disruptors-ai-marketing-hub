/**
 * Service Worker Registration
 * Registers the presentation mode service worker
 */

/**
 * Register the service worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/presentation-sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registered:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('🔄 New service worker available. Refresh to update.');

          // Optionally notify user
          if (confirm('New version available! Refresh to update?')) {
            window.location.reload();
          }
        }
      });
    });

    return true;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return false;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      await registration.unregister();
      console.log('Service Worker unregistered');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
    return false;
  }
}
