import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-hover shadow-subtle hover:shadow-md border border-primary-light/30",
      secondary:
        "bg-secondary text-primary-900 hover:bg-secondary-hover hover:text-white font-semibold shadow-subtle",
      outline:
        "border border-border-strong bg-surface text-foreground hover:bg-primary-50 hover:text-primary hover:border-primary/40",
      ghost:
        "text-foreground hover:bg-primary-50 hover:text-primary",
      goldOutline:
        "border border-secondary/60 text-secondary-hover bg-secondary-50/50 hover:bg-secondary hover:text-white",
      danger:
        "bg-error text-white hover:bg-red-700 shadow-subtle",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-gov gap-1.5",
      md: "h-10 px-4 text-sm rounded-gov gap-2",
      lg: "h-12 px-6 text-base rounded-gov gap-2.5",
      icon: "h-10 w-10 p-0 rounded-gov justify-center",
      "icon-sm": "h-8 w-8 p-0 rounded-gov justify-center",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
