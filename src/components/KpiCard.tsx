import React from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "blue" | "emerald" | "amber" | "rose" | "indigo" | "purple";
  badgeText?: string;
}

export function KpiCard({ title, value, subtitle, icon, variant = "blue", badgeText }: KpiCardProps) {
  const colorMap = {
    blue: "border-sky-200 bg-white hover:border-sky-400 text-sky-700",
    emerald: "border-emerald-200 bg-white hover:border-emerald-400 text-emerald-700",
    amber: "border-amber-200 bg-white hover:border-amber-400 text-amber-700",
    rose: "border-rose-200 bg-white hover:border-rose-400 text-rose-700",
    indigo: "border-indigo-200 bg-white hover:border-indigo-400 text-indigo-700",
    purple: "border-purple-200 bg-white hover:border-purple-400 text-purple-700",
  };

  const iconBgMap = {
    blue: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-all duration-200",
        colorMap[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className={cn("rounded-lg p-2.5", iconBgMap[variant])}>{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {badgeText && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

