"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AdminHeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export function AdminHeader({ className, fixed, children, ...props }: AdminHeaderProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "z-50 h-16 border-b border-border",
        fixed && "sticky top-0 w-[inherit] bg-background",
        offset > 10 && fixed && "shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="relative flex h-full items-center gap-3 bg-background p-4 sm:gap-4">
        <SidebarTrigger variant="outline" className="max-md:scale-125" />
        <Separator orientation="vertical" className="h-6" />
        {children}
      </div>
    </header>
  );
}
