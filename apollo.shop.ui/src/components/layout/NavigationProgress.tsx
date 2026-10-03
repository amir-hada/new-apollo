"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function isInternalNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    return url.pathname !== window.location.pathname;
  } catch {
    return false;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const activeRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const hideRef = useRef<number | null>(null);
  const firstRender = useRef(true);

  function clearTimers() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (hideRef.current) window.clearTimeout(hideRef.current);
    timerRef.current = null;
    hideRef.current = null;
  }

  function start() {
    clearTimers();
    activeRef.current = true;
    setVisible(true);
    setProgress(12);
    timerRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 86) return current;
        const step = current < 40 ? 12 : current < 70 ? 5 : 2;
        return Math.min(86, current + step);
      });
    }, 160);
  }

  function finish() {
    if (!activeRef.current) return;
    clearTimers();
    setProgress(100);
    hideRef.current = window.setTimeout(() => {
      activeRef.current = false;
      setVisible(false);
      setProgress(0);
    }, 220);
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigation(anchor)) return;
      start();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    finish();
  }, [pathname]);

  useEffect(() => () => clearTimers(), []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2.5px] overflow-hidden transition-opacity duration-200",
        !visible && "opacity-0",
      )}
    >
      <div
        className="h-full origin-right rounded-full bg-primary shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_55%,transparent)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
