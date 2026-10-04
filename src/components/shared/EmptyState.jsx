import React from "react";
import { FolderSearch, BookOpen } from "lucide-react";
import { Button } from "@/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = FolderSearch,
  title = "لم يتم العثور على نتائج",
  description = "لم نجد أي كتب أو منشورات تطابق معايير البحث المحددة حالياً.",
  actionText,
  actionHref,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border bg-surface-muted/50 my-6",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary border border-primary-100 flex items-center justify-center mb-4 shadow-subtle">
        <Icon className="w-8 h-8 text-primary/80" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-foreground-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="md">
            {actionText}
          </Button>
        </Link>
      )}

      {actionText && onAction && !actionHref && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
