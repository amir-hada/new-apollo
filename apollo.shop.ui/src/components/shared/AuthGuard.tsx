"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children, admin }: { children: React.ReactNode; admin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated()) {
      if (user) useAuthStore.getState().clearSession();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (admin && !isAdmin()) {
      router.replace("/account");
    }
  }, [admin, hydrated, isAdmin, isAuthenticated, pathname, router, user]);

  if (!hydrated || !isAuthenticated() || (admin && !isAdmin())) {
    return (
      <div className="mx-auto max-w-6xl space-y-3 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
