import { openDB } from 'idb';

const DB_NAME = 'disruptors-connect-queue';
const STORE_NAME = 'pending-actions';
const DB_VERSION = 1;

// Initialize IndexedDB
export async function initOfflineQueue() {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('type', 'type');
          console.log('[Offline Queue] 🗄️ Database initialized');
        }
      }
    });
  } catch (error) {
    console.error('[Offline Queue] Failed to initialize:', error);
    throw error;
  }
}

// Add action to queue
export async function enqueueAction(action) {
  try {
    const db = await initOfflineQueue();
    const id = await db.add(STORE_NAME, {
      ...action,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
    console.log('[Offline Queue] ➕ Enqueued:', id, action.type);
    return id;
  } catch (error) {
    console.error('[Offline Queue] Enqueue failed:', error);
    throw error;
  }
}

// Get all pending actions
export async function getPendingActions() {
  try {
    const db = await initOfflineQueue();
    const actions = await db.getAllFromIndex(STORE_NAME, 'timestamp');
    return actions.filter(a => a.status === 'pending');
  } catch (error) {
    console.error('[Offline Queue] Get pending failed:', error);
    return [];
  }
}

// Remove action from queue
export async function dequeueAction(id) {
  try {
    const db = await initOfflineQueue();
    await db.delete(STORE_NAME, id);
    console.log('[Offline Queue] ➖ Dequeued:', id);
  } catch (error) {
    console.error('[Offline Queue] Dequeue failed:', error);
  }
}

// Update action status
export async function updateActionStatus(id, status, error = null) {
  try {
    const db = await initOfflineQueue();
    const action = await db.get(STORE_NAME, id);
    if (action) {
      action.status = status;
      action.lastError = error;
      action.lastAttempt = Date.now();
      await db.put(STORE_NAME, action);
    }
  } catch (error) {
    console.error('[Offline Queue] Update status failed:', error);
  }
}

// Sync all pending actions
export async function syncPendingActions() {
  if (!navigator.onLine) {
    console.warn('[Offline Queue] Cannot sync: offline');
    return { success: 0, failed: 0 };
  }

  const actions = await getPendingActions();
  console.log(`[Offline Queue] 🔄 Syncing ${actions.length} pending actions`);

  let success = 0;
  let failed = 0;

  for (const action of actions) {
    try {
      const response = await fetch(action.url, {
        method: action.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...action.headers
        },
        body: JSON.stringify(action.payload)
      });

      if (response.ok) {
        await dequeueAction(action.id);
        success++;
        console.log('[Offline Queue] ✅ Synced:', action.id);
      } else {
        const errorText = await response.text();
        console.error('[Offline Queue] ❌ Sync failed:', action.id, response.status, errorText);

        // Update retry count
        const db = await initOfflineQueue();
        const currentAction = await db.get(STORE_NAME, action.id);
        currentAction.retries = (currentAction.retries || 0) + 1;

        if (currentAction.retries >= 5) {
          console.error('[Offline Queue] Max retries exceeded, removing:', action.id);
          await updateActionStatus(action.id, 'failed', errorText);
          await dequeueAction(action.id);
          failed++;
        } else {
          await db.put(STORE_NAME, currentAction);
        }
      }
    } catch (error) {
      console.error('[Offline Queue] Sync error:', action.id, error);
      await updateActionStatus(action.id, 'error', error.message);
      failed++;
    }
  }

  console.log(`[Offline Queue] Sync complete: ${success} success, ${failed} failed`);
  return { success, failed };
}

// Listen for online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Offline Queue] 🌐 Network restored, syncing...');
    syncPendingActions();
  });

  window.addEventListener('offline', () => {
    console.log('[Offline Queue] 📵 Network lost');
  });
}

// Background Sync registration (if supported)
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-pending-actions');
      console.log('[Background Sync] ✅ Registered');
      return true;
    } catch (error) {
      console.error('[Background Sync] ❌ Registration failed:', error);
      return false;
    }
  }
  return false;
}
