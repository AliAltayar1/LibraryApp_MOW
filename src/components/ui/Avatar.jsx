import React from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  src,
  alt = "الصورة الشخصية",
  fallback = "م",
  size = "md",
  ...props
}) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full border border-border-strong bg-primary-50 font-bold text-primary shadow-subtle shrink-0 select-none",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
