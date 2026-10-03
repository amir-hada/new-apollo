"use client";

import { cn } from "@/lib/utils";

type SparklineProps = {
  points: number[];
  className?: string;
  positive?: boolean;
};

export function Sparkline({ points, className, positive = true }: SparklineProps) {
  const width = 72;
  const height = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);

  const d = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point - min) / range) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-7 w-[4.5rem]", className)}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={positive ? "oklch(0.65 0.17 155)" : "oklch(0.63 0.2 25)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
