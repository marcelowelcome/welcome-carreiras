import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="rounded-wt-md border border-wt-gray-300/60 bg-white p-6 shadow-wt-sm">
      <div className="flex items-center justify-between">
        <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.08em] text-wt-gray-500">
          {title}
        </p>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wt-primary-light text-wt-primary">
          {icon}
        </div>
      </div>
      <p className="mt-3 font-wt-heading text-3xl font-black tracking-tight text-wt-teal-deep">
        {value}
      </p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend.positive ? "text-wt-teal-mid" : "text-wt-red"
          )}
        >
          {trend.positive ? "+" : ""}
          {trend.value}
        </p>
      )}
    </div>
  );
}
