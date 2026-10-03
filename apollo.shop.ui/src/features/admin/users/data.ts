import { Shield, UserCheck } from "lucide-react";
import type { UserStatus } from "./types";

export const callTypes = new Map<UserStatus, string>([
  ["active", "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"],
  ["inactive", "bg-neutral-300/40 border-neutral-300"],
]);

export const roles = [
  {
    label: "مدیر",
    value: "admin",
    icon: Shield,
  },
  {
    label: "مشتری",
    value: "customer",
    icon: UserCheck,
  },
] as const;

export const statusLabels: Record<UserStatus, string> = {
  active: "فعال",
  inactive: "غیرفعال",
};
