import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api, ApiError } from "../lib/api";

// Only the token is persisted; the profile is re-fetched from the server on load.
export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      status: "idle",

      async checkSession() {
        const { token } = get();
        if (!token) return set({ user: null, status: "ready" });
        set({ status: "checking" });
        try {
          const { user } = await api("/auth/me", { token });
          set({ user, status: "ready" });
        } catch (err) {
          // Drop the token only on a 401, not on network blips or a cold-starting server.
          if (err instanceof ApiError && err.status === 401) set({ token: null, user: null });
          set({ status: "ready" });
        }
      },

      async signIn(email, password) {
        const { token, user } = await api("/auth/signin", { method: "POST", body: { email, password } });
        set({ token, user, status: "ready" });
      },

      async signUp(name, email, password) {
        const { token, user } = await api("/auth/signup", { method: "POST", body: { name, email, password } });
        set({ token, user, status: "ready" });
      },

      async signOut() {
        const { token } = get();
        set({ token: null, user: null });
        if (token) await api("/auth/signout", { method: "POST", token }).catch(() => {});
      },

      setUser(user) {
        if (get().token) set({ user });
      },

      async recordAiGame({ winner, moves, difficulty }) {
        const { token } = get();
        if (!token) return null;
        const { user } = await api("/games/ai", { method: "POST", token, body: { winner, moves, difficulty } });
        set({ user });
        return user;
      },
    }),
    {
      name: "shift-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Clear out localStorage keys left behind by the previous auth setup.
try {
  ["isLoggedIn", "sessionId", "username", "userId", "gameBoard", "moves"].forEach((k) => localStorage.removeItem(k));
} catch {
  // storage unavailable
}
