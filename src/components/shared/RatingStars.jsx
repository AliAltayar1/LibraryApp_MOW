import React from "react";
import { Star } from "lucide-react";
import { cn, formatArabicNumber } from "@/lib/utils";

export function RatingStars({
  rating = 5,
  reviewsCount,
  size = "sm",
  showValue = true,
  className,
}) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5 text-secondary" aria-label={`التقييم: ${rating} من 5`}>
        {stars.map((star) => {
          const isFilled = rating >= star;
          const isHalf = !isFilled && rating >= star - 0.5;

          return (
            <Star
              key={star}
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-secondary text-secondary"
                  : isHalf
                  ? "fill-secondary/50 text-secondary"
                  : "fill-transparent text-border-strong"
              )}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold text-foreground">
          {formatArabicNumber(rating)}
        </span>
      )}

      {reviewsCount !== undefined && (
        <span className="text-[11px] text-foreground-subtle">
          ({formatArabicNumber(reviewsCount)})
        </span>
      )}
    </div>
  );
}
