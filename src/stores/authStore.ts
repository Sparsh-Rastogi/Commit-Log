import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import { getCookie } from "@/lib/utils";
import {initCSRF} from "@/lib/api";
// import get from "node_modules/react-hook-form/dist/utils/get";
export interface User {
  id: number;
  username: string;
  email?: string;
  level: number;
  xp: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateXpAndLevel: (newXp: number, newLevel: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // 🔑 Called once on app load
  checkAuth: async () => {
    const {isAuthenticated,isLoading}= get();
    if(isAuthenticated && !isLoading) return; // already authenticated
    set({ isLoading: true });
    await initCSRF();
    try {
      const user = await apiFetch<User>("/auth/me/");
      // console.log("CSRF initialized in authStore");
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
        // 1. Perform Login
        // Ensure apiFetch includes { credentials: 'include' } in its internal config
        await apiFetch("/auth/login/", {
            method: "POST",
            body: JSON.stringify({ username, password }),
            // headers: { 'X-CSRFToken': getCookie('csrftoken') } // Essential for Django
        });

        // 2. Fetch User Data (only if login succeeded)
        const user = await apiFetch<User>("/auth/me/");

        set({
            user,
            isAuthenticated: true,
            isLoading: false,
        });
    } catch (error) {
        set({ isLoading: false, isAuthenticated: false });
        console.error("Login failed:", error);
        alert("Login failed. Please check your credentials and try again.");
        // Handle error (e.g., show a toast notification)
    }
},

  logout: async () => {
    set({ isLoading: true });

    await apiFetch("/auth/logout/", { method: "POST" });

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Optional (can be implemented later)
  register: async () => {
    throw new Error("Register not implemented yet");
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
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
