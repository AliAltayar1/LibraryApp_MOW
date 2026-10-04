import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  badge,
  title,
  subtitle,
  actionText,
  actionHref,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-border-subtle",
        className
      )}
    >
      <div className="space-y-1.5 max-w-2xl">
        {badge && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-hover bg-secondary-50 px-2.5 py-0.5 rounded-full border border-secondary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {badge}
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-primary inline-block" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm text-foreground-muted leading-relaxed pe-2">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors shrink-0"
        >
          <span>{actionText}</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 duration-200" />
        </Link>
      )}
    </div>
  );
}
