import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

interface UserAuthState {
  user: User | null;
  token: string | null;
  setAuth: (payload: { user: User; token: string }) => void;
  clearAuth: () => void;
}

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (payload) => set(payload),
      clearAuth: () => set({ user: null, token: null })
    }),
    {
      name: 'hezak_user_session'
    }
  )
);


