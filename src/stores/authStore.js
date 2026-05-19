import { create } from 'zustand';
import { tokenStorage, onLogout } from '../api/client';
import { fetchMe } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true, // true on startup until we know if there's a saved session

  // Called once on app startup. Checks for stored tokens and restores the session.
  bootstrap: async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }
      try {
        const user = await fetchMe();
        set({ user, isLoading: false });
      } catch {
        // Token invalid even after refresh attempts in interceptor.
        await tokenStorage.clearTokens();
        set({ user: null, isLoading: false });
      }
    } catch (e) {
      if (__DEV__) console.log('Bootstrap failed:', e);
      set({ user: null, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

  signOut: async () => {
    await tokenStorage.clearTokens();
    set({ user: null });
  },
}));

// When the axios interceptor decides the session is dead, clear the store too.
onLogout(() => {
  useAuthStore.setState({ user: null });
});