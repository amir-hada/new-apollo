"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "داشبورد" },
  { href: "/account/profile", label: "پروفایل" },
  { href: "/account/orders", label: "سفارش‌ها" },
  { href: "/account/addresses", label: "آدرس‌ها" },
  { href: "/account/tickets", label: "تیکت‌ها" },
  { href: "/account/security", label: "امنیت" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <AuthGuard>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-border p-3">
          <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">حساب کاربری</p>
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm hover:bg-muted",
                  pathname === l.href && "bg-muted font-medium",
                )}
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-start text-sm text-destructive hover:bg-muted"
              onClick={() => {
                clearSession();
                router.push("/");
              }}
            >
              <LogOut className="size-4 shrink-0" />
              خروج از حساب
            </button>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </AuthGuard>
  );
}
