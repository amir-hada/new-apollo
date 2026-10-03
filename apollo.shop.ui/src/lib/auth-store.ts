"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, UserInfo } from "@/types/api";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const GUEST_KEY = "guest_token";

let memoryAccessToken: string | null = null;

export function getAccessToken() {
  if (typeof window === "undefined") return memoryAccessToken;
  return memoryAccessToken ?? localStorage.getItem(ACCESS_KEY);
}

export function setAccessToken(token: string | null) {
  memoryAccessToken = token;
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ACCESS_KEY, token);
  else localStorage.removeItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(REFRESH_KEY, token);
  else localStorage.removeItem(REFRESH_KEY);
}

export function getGuestToken() {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem(GUEST_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, token);
  }
  return token;
}

interface AuthState {
  user: UserInfo | null;
  hydrated: boolean;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,
      setSession: (auth) => {
        setAccessToken(auth.accessToken);
        setRefreshToken(auth.refreshToken);
        set({ user: auth.user });
      },
      clearSession: () => {
        setAccessToken(null);
        setRefreshToken(null);
        set({ user: null });
      },
      setHydrated: (value) => set({ hydrated: value }),
      isAuthenticated: () => Boolean(get().user && getAccessToken()),
      isAdmin: () => Boolean(get().user?.roles?.includes("Admin")),
    }),
    {
      name: "apollo-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
        memoryAccessToken = token;
      },
    },
  ),
);
