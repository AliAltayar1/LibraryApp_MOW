import React from "react";
import { User, Calendar, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/ui/Badge";
import { RatingStars } from "@/shared/RatingStars";
import { formatArabicNumber, cn } from "@/lib/utils";

export function BookMeta({
  book,
  showFull = false,
  className,
}) {
  if (!book) return null;

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary" size="sm">
          {book.category}
        </Badge>
        {book.formatLabel && (
          <Badge variant="secondary" size="sm">
            {book.formatLabel}
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-foreground-muted">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-foreground-subtle shrink-0" />
          <span className="font-medium text-foreground truncate">{book.author}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-foreground-subtle">
          {book.year && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{book.year}</span>
            </div>
          )}

          {book.pages && (
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{formatArabicNumber(book.pages)} صفحة</span>
            </div>
          )}
        </div>
      </div>

      {book.rating && (
        <div className="pt-1">
          <RatingStars rating={book.rating} reviewsCount={book.reviewsCount} size="xs" />
        </div>
      )}
    </div>
  );
}
