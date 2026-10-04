import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({
  title = "جاري تحميل البيانات...",
  description = "يرجى الانتظار بينما نقوم باسترجاع المحتوى الرقمي.",
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 my-6",
        className
      )}
    >
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary-50 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-secondary" />
        </div>
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-foreground-muted">{description}</p>
    </div>
  );
}
