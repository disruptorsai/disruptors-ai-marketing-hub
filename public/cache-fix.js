// HOTFIX: Prevent infinite reload loop from cache buster
// This script removes the _v parameter that's causing reloads

(function() {
  const url = new URL(window.location.href);

  // If we have a _v parameter, remove it and replace state
  if (url.searchParams.has('_v')) {
    url.searchParams.delete('_v');

    // Use replaceState to update URL without reload
    window.history.replaceState({}, document.title, url.toString());

    console.log('🔧 [CACHE FIX] Removed _v parameter to prevent reload loop');
  }

  // Prevent any code from calling location.reload() or location.replace() with _v parameter
  const originalReplace = window.location.replace.bind(window.location);
  const originalReload = window.location.reload.bind(window.location);

  window.location.replace = function(url) {
    if (typeof url === 'string' && url.includes('_v=')) {
      console.warn('🚫 [CACHE FIX] Blocked reload with _v parameter');
      return;
    }
    return originalReplace(url);
  };

  window.location.reload = function() {
    console.log('🔄 [CACHE FIX] Reload called (allowing)');
    return originalReload();
  };
})();
