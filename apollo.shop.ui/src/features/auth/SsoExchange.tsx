"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { ApolloShopLogo } from "@/features/auth/ApolloShopLogo";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { API_URL, TENANT_HEADER, getClientTenantSlug } from "@/lib/tenant";
import type { AuthResponse } from "@/types/api";

/**
 * One-time codes can only be exchanged once, and React Strict Mode runs effects twice in dev.
 * Cache the in-flight request per code so the exchange is never sent twice.
 */
const exchanges = new Map<string, Promise<AuthResponse>>();

function exchangeCode(code: string) {
  let pending = exchanges.get(code);
  if (!pending) {
    // No provisioning key here: the one-time code itself is the credential.
    pending = axios
      .post<AuthResponse>(
        `${API_URL}/api/internal/sso/exchange`,
        { code },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            [TENANT_HEADER]: getClientTenantSlug(),
          },
        },
      )
      .then((response) => response.data);
    exchanges.set(code, pending);
  }
  return pending;
}

export function SsoExchange() {
  const router = useRouter();
  const search = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const code = (search.get("sso_code") ?? search.get("code") ?? "").trim();

  const [error, setError] = useState<string | null>(
    code ? null : "کد ورود یافت نشد. لطفاً دوباره از پنل اپولو وارد شوید.",
  );

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    exchangeCode(code)
      .then((auth) => {
        if (cancelled) return;
        setSession(auth);
        router.replace("/admin");
      })
      .catch((err) => {
        exchanges.delete(code);
        if (cancelled) return;
        setError(
          getApiErrorMessage(err, "ورود با کد یکبار مصرف ناموفق بود. کد نامعتبر یا منقضی شده است."),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [code, router, setSession]);

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center"
    >
      <ApolloShopLogo />
      {error ? (
        <div className="max-w-sm space-y-4">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
          <Link
            href="/login?next=/admin"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            رفتن به صفحه ورود
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          در حال ورود به پنل فروشگاه...
        </div>
      )}
    </div>
  );
}
