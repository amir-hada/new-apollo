"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getClientTenantSlug } from "@/lib/tenant";
import type { AuthResponse, UserInfo } from "@/types/api";

function tenantKey(base: string) {
  if (typeof window === "undefined") return base;
  return `${base}:${getClientTenantSlug()}`;
}

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const GUEST_KEY = "guest_token";

let memoryAccessToken: string | null = null;

export function getAccessToken() {
  if (typeof window === "undefined") return memoryAccessToken;
  return memoryAccessToken ?? localStorage.getItem(tenantKey(ACCESS_KEY));
}

export function setAccessToken(token: string | null) {
  memoryAccessToken = token;
  if (typeof window === "undefined") return;
  const key = tenantKey(ACCESS_KEY);
  if (token) localStorage.setItem(key, token);
  else localStorage.removeItem(key);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(tenantKey(REFRESH_KEY));
}

export function setRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  const key = tenantKey(REFRESH_KEY);
  if (token) localStorage.setItem(key, token);
  else localStorage.removeItem(key);
}

export function getGuestToken() {
  if (typeof window === "undefined") return null;
  const key = tenantKey(GUEST_KEY);
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
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
  isPlatformAdmin: () => boolean;
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
      isPlatformAdmin: () => Boolean(get().user?.roles?.includes("PlatformAdmin")),
    }),
    {
      name: "apollo-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (typeof window !== "undefined") {
          memoryAccessToken = localStorage.getItem(tenantKey(ACCESS_KEY));
        }
      },
    },
  ),
);
