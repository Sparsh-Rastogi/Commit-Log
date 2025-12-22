import { create } from "zustand";
import { apiFetch } from "@/lib/api";

interface User {
  id: number;
  username: string;
  xp: number;
  level: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchMe: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  fetchMe: async () => {
    try {
      const user = await apiFetch<User>("/auth/me/");
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (username, password) => {
    await apiFetch("/auth/login/", {
      method: "POST",
      // console.log(username),
      body: JSON.stringify({ username, password }),
    });
    const user = await apiFetch<User>("/auth/me/");
    set({ user });
  },

  logout: async () => {
    await apiFetch("/auth/logout/", { method: "POST" });
    set({ user: null });
  },
}));
