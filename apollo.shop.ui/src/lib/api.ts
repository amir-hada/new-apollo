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

function isAuthPublicPath(url?: string) {
  if (!url) return false;
  // Login/OTP/register must not carry a stale cross-tenant Bearer token.
  return (
    url.includes("/api/auth/otp/") ||
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/phone-login") ||
    url.includes("/api/auth/register") ||
    url.includes("/api/auth/forgot") ||
    url.includes("/api/auth/reset")
  );
}

function isTenantMismatchError(error: AxiosError) {
  const status = error.response?.status;
  if (status !== 401 && status !== 403) return false;
  const data = error.response?.data as
    | { detail?: string; title?: string; code?: string }
    | undefined;
  const detail = (data?.detail ?? "").toLowerCase();
  const code = (data?.code ?? "").toLowerCase();
  return (
    code === "tenant_mismatch" ||
    detail.includes("does not belong to the current tenant")
  );
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = config.url ?? "";
  if (!isAuthPublicPath(url)) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    delete config.headers.Authorization;
  }

  const guest = getGuestToken();
  if (guest) {
    config.headers["X-Guest-Token"] = guest;
  }
  config.headers[TENANT_HEADER] = getClientTenantSlug();

  // Let the browser set multipart boundary for FormData uploads.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete?.("Content-Type");
    delete (config.headers as Record<string, unknown>)["Content-Type"];
  }

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
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean; _tenantCleared?: boolean })
      | undefined;

    if (!original) return Promise.reject(error);

    // Stale token from another shop → drop session and, for public auth calls, retry once.
    if (isTenantMismatchError(error) && !original._tenantCleared) {
      original._tenantCleared = true;
      useAuthStore.getState().clearSession();
      delete original.headers.Authorization;
      if (isAuthPublicPath(original.url)) {
        return api(original);
      }
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || original._retry) {
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
    if (isTenantMismatchError(error)) {
      return "نشست این فروشگاه منقضی شده است. دوباره وارد شوید.";
    }

    const data = error.response?.data as
      | {
          title?: string;
          detail?: string;
          message?: string;
          errors?: Record<string, string[] | string>;
        }
      | undefined;

    const fromErrors = firstValidationError(data?.errors);
    if (fromErrors) return fromErrors;

    const detail = data?.detail?.trim();
    if (detail && !isGenericValidationMessage(detail) && !isEnglishTenantError(detail)) {
      return detail;
    }

    const message = data?.message?.trim();
    if (message && !isGenericValidationMessage(message) && !isEnglishTenantError(message)) {
      return message;
    }

    return fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function isEnglishTenantError(message: string) {
  return message.toLowerCase().includes("does not belong to the current tenant");
}

function firstValidationError(errors: Record<string, string[] | string> | undefined): string | null {
  if (!errors) return null;
  for (const value of Object.values(errors)) {
    if (Array.isArray(value)) {
      const msg = value.find((item) => typeof item === "string" && item.trim());
      if (msg) return msg.trim();
    } else if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function isGenericValidationMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("one or more validation") ||
    normalized === "validation failed" ||
    normalized === "bad request"
  );
}
