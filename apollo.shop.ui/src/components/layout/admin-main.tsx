"use client";

import { cn } from "@/lib/utils";

type AdminMainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  fluid?: boolean;
};

export function AdminMain({ fixed, className, fluid, ...props }: AdminMainProps) {
  return (
    <main
      data-layout={fixed ? "fixed" : "auto"}
      className={cn(
        "px-4 py-6",
        fixed && "flex min-h-0 grow flex-col overflow-hidden",
        !fluid && "mx-auto w-full max-w-7xl",
        className,
      )}
      {...props}
    />
  );
}
