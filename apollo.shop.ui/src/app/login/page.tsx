"use client";

import { Suspense } from "react";
import { DigikalaAuthFlow } from "@/features/auth/DigikalaAuthFlow";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
      }
    >
      <DigikalaAuthFlow />
    </Suspense>
  );
}
