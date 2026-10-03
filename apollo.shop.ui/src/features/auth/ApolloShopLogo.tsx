import { cn } from "@/lib/utils";

export function ApolloShopLogo({ className }: { className?: string }) {
  return (
    <div className={cn("text-center", className)}>
      <p className="text-2xl font-bold tracking-tight text-primary">فروشگاه آپولو</p>
    </div>
  );
}
