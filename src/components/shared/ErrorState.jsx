import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/ui/Button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "تعذر تحميل البيانات",
  description = "حدث خطأ غير متوقع أثناء استرجاع البيانات. يرجى إعادة المحاولة.",
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-red-200 bg-red-50/40 my-6",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-red-100 text-error flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-error" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-foreground-muted max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </Button>
      )}
    </div>
  );
}
