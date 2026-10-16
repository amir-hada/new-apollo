"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { SsoExchange } from "@/features/auth/SsoExchange";
import { getAdminPageTitle } from "@/lib/admin-page-title";

/**
 * The Apollo platform redirects to `{adminUrl}?sso_code=...` (i.e. /admin).
 * The user has no session yet, so skip AuthGuard and exchange the code first.
 */
function AdminSsoGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();

  if (pathname === "/admin/sso") return <>{children}</>;
  if (pathname === "/admin" && search.get("sso_code")) return <SsoExchange />;

  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminSsoGate>{children}</AdminSsoGate>
    </Suspense>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChats = pathname.startsWith("/admin/chats");
  const isSettings = pathname.startsWith("/admin/settings");
  const isProductEdit = /^\/admin\/products\/[^/]+$/.test(pathname);
  const pageTitle = getAdminPageTitle(pathname);
  const useFixedMain = isChats || isProductEdit;

  return (
    <AuthGuard admin>
      <AdminShell
        fixedMain={useFixedMain}
        fluidMain
        mainClassName={
          isSettings
            ? "flex flex-1 flex-col gap-0 !p-0"
            : useFixedMain
              ? "flex flex-1 flex-col overflow-hidden !px-3 !py-3 sm:!px-4 sm:!py-4"
              : "flex flex-1 flex-col gap-4 sm:gap-6"
        }
        headerExtra={
          pageTitle ? (
            <h1 className="me-auto min-w-0 truncate text-sm font-semibold tracking-tight sm:text-base">
              {pageTitle}
            </h1>
          ) : undefined
        }
      >
        {children}
      </AdminShell>
    </AuthGuard>
  );
}
