import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  maxXp: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateXpAndLevel: (newXp: number, newLevel: number) => void;
}

// TODO: Replace with real API calls
const mockUser: User = {
  id: 'user-1',
  username: 'devuser',
  email: 'dev@example.com',
  level: 12,
  xp: 2450,
  maxXp: 3000,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Login placeholder:', { email, password });
    set({ user: mockUser, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    set({ isLoading: true });
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  register: async (email: string, password: string, username: string) => {
    set({ isLoading: true });
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Register placeholder:', { email, password, username });
    const newUser: User = { ...mockUser, email, username };
    set({ user: newUser, isAuthenticated: true, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    // TODO: Check session/token validity
    await new Promise(resolve => setTimeout(resolve, 300));
    // For now, auto-login with mock user
    set({ user: mockUser, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  updateXpAndLevel: (newXp, newLevel) => {
    set(state => ({
      user: state.user ? {
        ...state.user,
        xp: newXp,
        level: newLevel,
        // Recalculate maxXp based on level (placeholder formula)
        maxXp: 1000 + (newLevel * 200),
      } : null,
    }));
  },
}));
