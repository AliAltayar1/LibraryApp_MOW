import React from "react";
import { BookCard, BookCardSkeleton } from "./BookCard";
import { EmptyState } from "@/shared/EmptyState";
import { cn } from "@/lib/utils";

export function BookGrid({
  books = [],
  isLoading = false,
  skeletonCount = 6,
  emptyTitle,
  emptyDescription,
  emptyActionText,
  emptyActionHref,
  columns = 3, // 2 | 3 | 4
  className,
}) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6",
          columns === 4 && "lg:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={emptyActionText}
        actionHref={emptyActionHref}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6",
        columns === 4 && "lg:grid-cols-4",
        className
      )}
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
