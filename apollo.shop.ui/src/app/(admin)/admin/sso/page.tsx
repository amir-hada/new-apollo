"use client";

import { Suspense } from "react";
import { SsoExchange } from "@/features/auth/SsoExchange";

/** Rendered outside the admin shell/auth guard (see admin layout bypass). */
export default function AdminSsoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SsoExchange />
    </Suspense>
  );
}
