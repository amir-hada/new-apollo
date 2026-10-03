"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type TopNavLink = {
  title: string;
  href: string;
  isActive?: boolean;
  disabled?: boolean;
};

export function AdminTopNav({
  links,
  className,
}: {
  links: TopNavLink[];
  className?: string;
}) {
  return (
    <>
      <div className={cn("hidden items-center gap-4 lg:flex", className)}>
        {links.map((link) =>
          link.disabled ? (
            <span
              key={link.title}
              className="text-sm font-medium text-muted-foreground/60"
            >
              {link.title}
            </span>
          ) : (
            <Link
              key={link.title}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                link.isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {link.title}
            </Link>
          ),
        )}
      </div>
      <div className={cn("lg:hidden", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
            <Menu className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {links.map((link) => (
              <DropdownMenuItem
                key={link.title}
                disabled={link.disabled}
                render={link.disabled ? undefined : <Link href={link.href} />}
              >
                {link.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
