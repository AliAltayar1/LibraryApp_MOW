import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtitle,
  change,
  trend = "up",
  icon: Icon,
  variant = "primary",
}) {
  const isUp = trend === "up";

  const variantStyles = {
    primary: "border-primary/20 bg-surface hover:border-primary/40",
    secondary: "border-secondary/30 bg-surface hover:border-secondary/60",
    emerald: "border-emerald-200 bg-surface hover:border-emerald-400",
    blue: "border-blue-200 bg-surface hover:border-blue-400",
  };

  const iconStyles = {
    primary: "bg-primary-50 text-primary border-primary/20",
    secondary: "bg-secondary-50 text-secondary-hover border-secondary/20",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div
      className={cn(
        "p-5 rounded-2xl border transition-all duration-200 shadow-subtle hover:shadow-card flex flex-col justify-between",
        variantStyles[variant] || variantStyles.primary
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-semibold text-foreground-muted block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-subtle",
              iconStyles[variant] || iconStyles.primary
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle text-xs">
        <span className="text-foreground-subtle truncate text-[11px]">
          {subtitle}
        </span>

        {change && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] shrink-0",
              isUp
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}
          >
            {isUp ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{change}</span>
          </span>
        )}
      </div>
    </div>
  );
}
