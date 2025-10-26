import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useConnectStore = create(
  persist(
    (set, get) => ({
      // Event context
      eventId: null,
      kioskId: null,
      sessionId: null,

      // Check-in state
      contact: null,
      attendance: null,
      pollAnswers: {},

      // Offline queue
      pendingActions: [],
      syncStatus: 'idle', // idle | syncing | error

      // UI state
      currentStep: 'welcome', // welcome | intake | poll | success
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      wakeLockActive: false,

      // Actions
      setEventContext: (eventId, kioskId) => set({ eventId, kioskId }),

      startSession: () => set({ sessionId: crypto.randomUUID() }),

      setContact: (contact) => set({ contact }),

      updatePollAnswers: (answers) => set((state) => ({
        pollAnswers: { ...state.pollAnswers, ...answers }
      })),

      addPendingAction: (action) => set((state) => ({
        pendingActions: [...state.pendingActions, { ...action, id: crypto.randomUUID(), timestamp: Date.now() }]
      })),

      removePendingAction: (id) => set((state) => ({
        pendingActions: state.pendingActions.filter((a) => a.id !== id)
      })),

      setSyncStatus: (status) => set({ syncStatus: status }),

      setOnlineStatus: (isOnline) => set({ isOnline }),

      setWakeLock: (active) => set({ wakeLockActive: active }),

      reset: () => set({
        contact: null,
        attendance: null,
        pollAnswers: {},
        sessionId: null,
        currentStep: 'welcome'
      })
    }),
    {
      name: 'disruptors-connect-storage',
      partialize: (state) => ({
        eventId: state.eventId,
        kioskId: state.kioskId,
        sessionId: state.sessionId,
        contact: state.contact,
        attendance: state.attendance,
        pollAnswers: state.pollAnswers,
        pendingActions: state.pendingActions
      })
    }
  )
);

// Subscribe to online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useConnectStore.getState().setOnlineStatus(true);
    console.log('[Connect Store] Network restored');
  });

  window.addEventListener('offline', () => {
    useConnectStore.getState().setOnlineStatus(false);
    console.log('[Connect Store] Network lost');
  });
}
