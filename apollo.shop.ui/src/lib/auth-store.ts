"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getClientTenantSlug } from "@/lib/tenant";
import type { AuthResponse, UserInfo } from "@/types/api";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const GUEST_KEY = "guest_token";
const AUTH_PERSIST_NAME = "apollo-auth";

function tenantKey(base: string) {
  if (typeof window === "undefined") return base;
  return `${base}:${getClientTenantSlug()}`;
}

/** In-memory access tokens keyed by tenant slug (avoids cross-tenant leaks). */
const memoryAccessByTenant: Record<string, string | null> = {};

function currentSlug() {
  if (typeof window === "undefined") return "ssr";
  return getClientTenantSlug();
}

export function getAccessToken() {
  const slug = currentSlug();
  if (typeof window === "undefined") return memoryAccessByTenant[slug] ?? null;
  return memoryAccessByTenant[slug] ?? localStorage.getItem(tenantKey(ACCESS_KEY));
}

export function setAccessToken(token: string | null) {
  const slug = currentSlug();
  memoryAccessByTenant[slug] = token;
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

/** Drop session for the current tenant only. */
export function clearCurrentTenantSession() {
  setAccessToken(null);
  setRefreshToken(null);
  useAuthStore.setState({ user: null });
}

interface AuthState {
  user: UserInfo | null;
  hydrated: boolean;
  tenantSlug: string | null;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isPlatformAdmin: () => boolean;
}

const tenantScopedStorage = createJSONStorage(() => ({
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`${name}:${getClientTenantSlug()}`);
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${name}:${getClientTenantSlug()}`, value);
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${name}:${getClientTenantSlug()}`);
  },
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,
      tenantSlug: null,
      setSession: (auth) => {
        setAccessToken(auth.accessToken);
        setRefreshToken(auth.refreshToken);
        set({ user: auth.user, tenantSlug: getClientTenantSlug() });
      },
      clearSession: () => {
        setAccessToken(null);
        setRefreshToken(null);
        set({ user: null, tenantSlug: getClientTenantSlug() });
      },
      setHydrated: (value) => set({ hydrated: value }),
      isAuthenticated: () => Boolean(get().user && getAccessToken()),
      isAdmin: () => Boolean(get().user?.roles?.includes("Admin")),
      isPlatformAdmin: () => Boolean(get().user?.roles?.includes("PlatformAdmin")),
    }),
    {
      name: AUTH_PERSIST_NAME,
      storage: tenantScopedStorage,
      partialize: (state) => ({
        user: state.user,
        tenantSlug: state.tenantSlug,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined") {
          const slug = getClientTenantSlug();
          memoryAccessByTenant[slug] = localStorage.getItem(tenantKey(ACCESS_KEY));
          // Stale user without a token for this tenant → treat as logged out.
          if (state?.user && !memoryAccessByTenant[slug]) {
            state.clearSession();
          }
          // Persist was for another slug (shouldn't happen with scoped storage, but belt+suspenders).
          if (state?.tenantSlug && state.tenantSlug !== slug) {
            state.clearSession();
          }
        }
        state?.setHydrated(true);
      },
    },
  ),
);
