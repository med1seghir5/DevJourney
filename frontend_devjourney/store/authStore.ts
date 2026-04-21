import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { setApiToken } from '@/lib/api';

interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  role: string;
  xp?: number;
  completedChallenges?: number;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  setAuthenticated: (status: boolean) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

let _checkAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token = null) => {
        if (token) {
          set({ user, token, isAuthenticated: true });
          setApiToken(token);
        } else set({ user });
      },
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        setApiToken(null);
        localStorage.removeItem('auth-storage');
      },
      checkAuth: async () => {
        if (_checkAuthPromise) return _checkAuthPromise;
        _checkAuthPromise = (async () => {
          try {
            const response = await api.get('/auth/me');
            const { user } = response.data;
            set({
              user: {
                _id: user._id,
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                xp: user.xp ?? 0,
                completedChallenges: user.completedChallenges ?? 0,
                createdAt: user.createdAt,
              },
              isAuthenticated: true,
            });
          } catch (error) {
            console.error("Check auth failed:", error);
            // If token exists, we might want to keep authenticated state temporarily 
            // or let the interceptor handle refresh.
            // But if /auth/me fails, we usually aren't authenticated.
            set({ user: null, token: null, isAuthenticated: false });
          } finally {
            _checkAuthPromise = null;
          }
        })();
        return _checkAuthPromise;
      },
    }),
    { 
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) setApiToken(state.token);
      }
    }
  )
);
