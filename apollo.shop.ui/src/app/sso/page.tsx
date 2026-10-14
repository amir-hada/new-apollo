"use client";

import { Suspense } from "react";
import { SsoExchange } from "@/features/auth/SsoExchange";

export default function SsoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SsoExchange />
    </Suspense>
  );
}
