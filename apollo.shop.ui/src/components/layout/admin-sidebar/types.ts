import type { ElementType } from "react";

export type NavLink = {
  title: string;
  url: string;
  icon?: ElementType;
  badge?: string;
  items?: never;
};

export type NavCollapsible = {
  title: string;
  icon?: ElementType;
  badge?: string;
  defaultOpen?: boolean;
  items: {
    title: string;
    url: string;
    icon?: ElementType;
    badge?: string;
  }[];
  url?: never;
};

export type NavItem = NavLink | NavCollapsible;

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type SidebarData = {
  teams: {
    name: string;
    logo: ElementType;
    plan: string;
  }[];
  navGroups: NavGroup[];
};
