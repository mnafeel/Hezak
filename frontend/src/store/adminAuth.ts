import { create } from 'zustand';

interface AdminAuthState {
  token: string | null;
  email: string | null;
  setAuth: (payload: { token: string; email: string }) => void;
  clearAuth: () => void;
}

const storageKey = 'hezak_admin_session';

const getInitialState = (): Pick<AdminAuthState, 'token' | 'email'> => {
  if (typeof window === 'undefined') {
    return { token: null, email: null };
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { token: null, email: null };
    return JSON.parse(raw) as { token: string; email: string };
  } catch {
    return { token: null, email: null };
  }
};

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  ...getInitialState(),
  setAuth: (payload) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
    }
    set(payload);
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
    set({ token: null, email: null });
  }
}));


