import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

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
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

let _checkAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      logout: () => set({ user: null, isAuthenticated: false }),
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
          } catch {
            set({ user: null, isAuthenticated: false });
          } finally {
            _checkAuthPromise = null;
          }
        })();
        return _checkAuthPromise;
      },
    }),
    { name: 'auth-storage' }
  )
);
