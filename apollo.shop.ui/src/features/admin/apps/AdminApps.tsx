"use client";

import { type ChangeEvent, useState } from "react";
import { SlidersHorizontal, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apps } from "./data/apps";

type AppType = "all" | "connected" | "notConnected";

const appText = new Map<AppType, string>([
  ["all", "همه اپ‌ها"],
  ["connected", "متصل"],
  ["notConnected", "متصل نیست"],
]);

export function AdminApps() {
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [appType, setAppType] = useState<AppType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApps = apps
    .slice()
    .sort((a, b) =>
      sort === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    )
    .filter((app) =>
      appType === "connected"
        ? app.connected
        : appType === "notConnected"
          ? !app.connected
          : true,
    )
    .filter((app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (value: string | null) => {
    if (!value) return;
    setAppType(value as AppType);
  };

  const handleSortChange = (value: string | null) => {
    if (value === "asc" || value === "desc") {
      setSort(value);
    }
  };

  return (
    <>
      <div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
        <div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
          <Input
            placeholder="فیلتر اپ‌ها..."
            className="h-9 w-40 lg:w-62.5"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Select value={appType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={appText.get(appType)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه اپ‌ها</SelectItem>
              <SelectItem value="connected">متصل</SelectItem>
              <SelectItem value="notConnected">متصل نیست</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-16">
            <SelectValue>
              <SlidersHorizontal size={18} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="asc">
              <div className="flex items-center gap-4">
                <ArrowUpAZ size={16} />
                <span>صعودی</span>
              </div>
            </SelectItem>
            <SelectItem value="desc">
              <div className="flex items-center gap-4">
                <ArrowDownAZ size={16} />
                <span>نزولی</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="shadow-sm" />
      <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
        {filteredApps.map((app) => (
          <li
            key={app.name}
            className="rounded-lg border p-4 hover:shadow-md"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2">
                {app.logo}
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`${app.connected ? "border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900" : ""}`}
              >
                {app.connected ? "متصل" : "اتصال"}
              </Button>
            </div>
            <div>
              <h2 className="mb-1 font-semibold">{app.name}</h2>
              <p className="line-clamp-2 text-gray-500">{app.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
