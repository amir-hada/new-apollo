"use client";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getGuestToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  useAuthStore,
} from "@/lib/auth-store";
import { API_URL, TENANT_HEADER, getClientTenantSlug } from "@/lib/tenant";
import type { AuthResponse } from "@/types/api";

export { API_URL };

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const guest = getGuestToken();
  if (guest) {
    config.headers["X-Guest-Token"] = guest;
  }
  config.headers[TENANT_HEADER] = getClientTenantSlug();
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<AuthResponse>(
      `${API_URL}/api/auth/refresh`,
      { accessToken, refreshToken },
      {
        withCredentials: true,
        headers: { [TENANT_HEADER]: getClientTenantSlug() },
      },
    );
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    useAuthStore.getState().setSession(data);
    return data.accessToken;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    if (original.url?.includes("/api/auth/")) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const token = await refreshing;
    if (!token) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "خطایی رخ داد") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { title?: string; detail?: string; message?: string }
      | undefined;
    return data?.detail || data?.title || data?.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
