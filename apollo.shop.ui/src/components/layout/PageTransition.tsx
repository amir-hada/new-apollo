"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const [enterClass, setEnterClass] = useState("animate-page-enter");
  const prevPath = useRef(pathname);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      prevPath.current = pathname;
      return;
    }
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    setEnterClass("");
    const frame = window.requestAnimationFrame(() => {
      setEnterClass("animate-page-enter");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className={cn(enterClass, className)}>
      {children}
    </div>
  );
}
