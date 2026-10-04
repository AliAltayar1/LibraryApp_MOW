import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      error,
      startIcon: StartIcon,
      endIcon: EndIcon,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        {StartIcon && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-foreground-subtle">
            <StartIcon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-gov border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle transition-all duration-200",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10",
            "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-foreground-subtle",
            StartIcon && "ps-10",
            EndIcon && "pe-10",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        />
        {EndIcon && (
          <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-foreground-subtle">
            <EndIcon className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
