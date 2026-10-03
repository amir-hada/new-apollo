import { cn } from "@/lib/utils";

type LongTextProps = {
  children: string;
  className?: string;
};

export function LongText({ children, className }: LongTextProps) {
  return (
    <div className={cn("truncate", className)} title={children}>
      {children}
    </div>
  );
}
