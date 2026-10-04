import React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full transition-colors border";

  const variants = {
    primary:
      "bg-primary-50 text-primary border-primary-100",
    secondary:
      "bg-secondary-50 text-[#856314] border-secondary/20",
    gold:
      "bg-[#fdf8eb] text-[#856314] border-[#e6cb85]",
    outline:
      "bg-transparent text-foreground-muted border-border",
    muted:
      "bg-surface-muted text-foreground-muted border-border-subtle",
    success:
      "bg-green-50 text-green-700 border-green-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
