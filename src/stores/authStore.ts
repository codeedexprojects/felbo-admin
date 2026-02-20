import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Admin } from '@/types/api';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  updateToken: (token: string, admin: Admin) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      login: (token, admin) => set({ token, admin, isAuthenticated: true }),
      logout: () => {
        set({ token: null, admin: null, isAuthenticated: false });
      },
      updateToken: (token, admin) => set({ token, admin }),
    }),
    {
      name: 'felbo-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
