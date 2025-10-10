/**
 * Version check utility to detect new deployments
 * Periodically checks if a new version is available and prompts user to reload
 */

let lastEtag = null;
let checkInterval = null;

/**
 * Check if a new version is available by comparing ETags
 */
async function checkForNewVersion() {
  try {
    const response = await fetch('/index.html', {
      method: 'HEAD',
      cache: 'no-cache',
    });

    const currentEtag = response.headers.get('etag') || response.headers.get('last-modified');

    if (lastEtag === null) {
      // First check - just store the ETag
      lastEtag = currentEtag;
      return false;
    }

    // If ETag changed, new version is available
    if (currentEtag && currentEtag !== lastEtag) {
      console.log('New version detected!', { old: lastEtag, new: currentEtag });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking for new version:', error);
    return false;
  }
}

/**
 * Show a notification that a new version is available
 */
function showUpdateNotification() {
  // Check if we've already shown the notification
  if (sessionStorage.getItem('update-notification-shown')) {
    return;
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'version-update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <svg style="width: 24px; height: 24px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">New Version Available</div>
          <div style="font-size: 14px; opacity: 0.9;">Click to update and get the latest features</div>
        </div>
      </div>
      <button id="update-now-btn" style="
        margin-top: 12px;
        width: 100%;
        background: white;
        color: #667eea;
        border: none;
        padding: 10px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        Update Now
      </button>
    </div>
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      #update-now-btn:hover {
        transform: scale(1.02);
      }
    </style>
  `;

  document.body.appendChild(notification);

  // Add click handler
  document.getElementById('update-now-btn')?.addEventListener('click', () => {
    sessionStorage.setItem('update-notification-shown', 'true');
    window.location.reload();
  });

  // Mark as shown
  sessionStorage.setItem('update-notification-shown', 'true');

  // Auto-reload after 30 seconds if user doesn't click
  setTimeout(() => {
    if (document.getElementById('version-update-notification')) {
      window.location.reload();
    }
  }, 30000);
}

/**
 * Start checking for new versions periodically
 * @param {number} intervalMs - Check interval in milliseconds (default: 5 minutes)
 */
export function startVersionCheck(intervalMs = 5 * 60 * 1000) {
  // Clear any existing interval
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  // Check immediately on start
  checkForNewVersion();

  // Then check periodically
  checkInterval = setInterval(async () => {
    const newVersionAvailable = await checkForNewVersion();
    if (newVersionAvailable) {
      showUpdateNotification();
      // Stop checking after we've detected an update
      clearInterval(checkInterval);
    }
  }, intervalMs);

  // Clear interval on page unload
  window.addEventListener('beforeunload', () => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  });
}

/**
 * Stop checking for new versions
 */
export function stopVersionCheck() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

/**
 * Manually trigger a version check
 */
export async function checkVersion() {
  const newVersionAvailable = await checkForNewVersion();
  if (newVersionAvailable) {
    showUpdateNotification();
  }
  return newVersionAvailable;
}
