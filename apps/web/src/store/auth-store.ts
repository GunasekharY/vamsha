import { create } from 'zustand';
import type { User } from '@vamsha/shared-types';

// UI-only mock auth for local preview. The real SSO / JWT flow is intentionally
// disabled here so the interface can be viewed and tested without the backend.
const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'demo@vamsha.local',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
};

const MOCK_SESSION = {
  user: MOCK_USER,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: { user: User; accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
}

const STORAGE_KEY = 'vamsha_auth';

function loadPersisted(): Pick<AuthState, 'user' | 'accessToken' | 'refreshToken'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_SESSION;
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ?? MOCK_USER,
      accessToken: parsed.accessToken ?? MOCK_SESSION.accessToken,
      refreshToken: parsed.refreshToken ?? MOCK_SESSION.refreshToken,
    };
  } catch {
    return MOCK_SESSION;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadPersisted(),
  setSession: (session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    set(session);
  },
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
