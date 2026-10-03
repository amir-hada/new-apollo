"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { NavCollapsible, NavGroup as NavGroupType, NavItem, NavLink } from "./types";

export function NavGroup({ title, items }: NavGroupType) {
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return (
    <SidebarGroup>
      {title ? <SidebarGroupLabel>{title}</SidebarGroupLabel> : null}
      <SidebarMenu className="border-s border-border group-data-[collapsible=icon]:border-transparent">
        {items.map((item) => {
          const key = `${item.title}-${"url" in item ? item.url : item.title}`;

          if (!item.items) {
            return (
              <SidebarMenuLink
                key={key}
                item={item}
                pathname={pathname}
                search={search}
              />
            );
          }

          if (state === "collapsed" && !isMobile) {
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                pathname={pathname}
                search={search}
              />
            );
          }

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item}
              pathname={pathname}
              search={search}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
  );
}

function SidebarMenuLink({
  item,
  pathname,
  search,
}: {
  item: NavLink;
  pathname: string;
  search: string;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
        isActive={checkIsActive(pathname, search, item)}
        tooltip={item.title}
      >
        {item.icon && <item.icon />}
        <span className={cn(checkIsActive(pathname, search, item) && "text-primary")}>
          {item.title}
        </span>
        {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuCollapsible({
  item,
  pathname,
  search,
}: {
  item: NavCollapsible;
  pathname: string;
  search: string;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <Collapsible
      defaultOpen={
        item.defaultOpen || checkIsActive(pathname, search, item, true)
      }
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
          <ChevronLeft className="ms-auto transition-transform duration-200 group-data-open/collapsible:-rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  render={
                    <Link
                      href={subItem.url}
                      onClick={() => setOpenMobile(false)}
                    />
                  }
                  isActive={checkIsActive(pathname, search, subItem)}
                >
                  {subItem.icon && <subItem.icon />}
                  <span
                    className={cn(
                      checkIsActive(pathname, search, subItem) && "text-primary",
                    )}
                  >
                    {subItem.title}
                  </span>
                  {subItem.badge ? <NavBadge>{subItem.badge}</NavBadge> : null}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarMenuCollapsedDropdown({
  item,
  pathname,
  search,
}: {
  item: NavCollapsible;
  pathname: string;
  search: string;
}) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              tooltip={item.title}
              isActive={checkIsActive(pathname, search, item)}
            />
          }
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
          <ChevronLeft className="ms-auto" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start" sideOffset={4}>
          <DropdownMenuGroupLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuGroupLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem
              key={`${sub.title}-${sub.url}`}
              render={<Link href={sub.url} />}
              className={
                checkIsActive(pathname, search, sub) ? "bg-secondary" : ""
              }
            >
              {sub.icon && <sub.icon className="text-primary" />}
              <span className="max-w-52 text-wrap">{sub.title}</span>
              {sub.badge ? (
                <span className="ms-auto text-xs">{sub.badge}</span>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function DropdownMenuGroupLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DropdownMenuLabel>{children}</DropdownMenuLabel>;
}

function checkIsActive(
  pathname: string,
  search: string,
  item: NavItem | { url?: string; items?: { url: string }[] },
  mainNav = false,
) {
  const url = "url" in item ? item.url : undefined;
  if (url) {
    const [itemPath, itemQuery] = url.split("?");

    if (itemQuery) {
      if (pathname !== itemPath) return false;
      const itemParams = new URLSearchParams(itemQuery);
      const currentParams = new URLSearchParams(search);
      for (const [key, value] of itemParams.entries()) {
        const current = currentParams.get(key);
        // `/admin/settings` without tab defaults to profile in the page
        if (key === "tab" && !current && value === "profile") continue;
        if (current !== value) return false;
      }
      return true;
    }

    if (pathname === itemPath) return true;
    if (itemPath !== "/admin" && pathname.startsWith(`${itemPath}/`)) return true;
  }

  if (item.items?.some((i) => checkIsActive(pathname, search, i))) return true;

  if (mainNav && url) {
    const a = pathname.split("/")[2];
    const b = url.split("/")[2];
    if (a && b && a === b) return true;
  }

  return false;
}
