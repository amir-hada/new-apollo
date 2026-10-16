"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { AccountSidebar } from "@/features/account/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-[70vh] w-full bg-[#f0f0f1] dark:bg-background">
        <div className="mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
          <div className="grid w-full gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5">
            <AccountSidebar />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
