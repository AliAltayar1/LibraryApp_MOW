"use client";

import React from "react";
import Link from "next/link";
import { BookCover } from "./BookCover";
import { FavoriteButton } from "./BookActions";
import { RatingStars } from "@/shared/RatingStars";
import { Badge } from "@/ui/Badge";
import { Skeleton } from "@/ui/Skeleton";
import { cn } from "@/lib/utils";

export function BookCard({
  book,
  layout = "vertical", // 'vertical' | 'compact'
  className,
}) {
  if (!book) return null;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-surface p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover",
        className
      )}
    >
      {/* Top Cover Container */}
      <div className="relative flex justify-center items-center p-3 rounded-lg bg-surface-muted/60 mb-3.5 overflow-hidden">
        <Link
          href={`/books/${book.id}`}
          className="outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
          tabIndex={0}
          aria-label={`تصفح تفاصيل كتاب ${book.title}`}
        >
          <BookCover
            title={book.title}
            author={book.author}
            category={book.category}
            coverTheme={book.coverTheme}
            size="md"
          />
        </Link>

        {/* Floating Favorite Button */}
        <div className="absolute top-2.5 end-2.5 z-20">
          <FavoriteButton bookId={book.id} initialIsFavorite={book.isFavorite} size="sm" />
        </div>

        {/* Format Badge */}
        {book.format === "manuscript" && (
          <div className="absolute bottom-2.5 start-2.5 z-20">
            <Badge variant="gold" size="sm">
              مخطوطة نادرة
            </Badge>
          </div>
        )}
      </div>

      {/* Book Content Details */}
      <div className="flex flex-col flex-1">
        {/* Category & Year */}
        <div className="flex items-center justify-between gap-2 text-xs text-foreground-subtle mb-1.5">
          <span className="text-secondary-hover font-medium truncate">
            {book.category}
          </span>
          {book.year && (
            <span className="shrink-0 text-[11px] bg-surface-muted px-1.5 py-0.5 rounded border border-border-subtle">
              {book.year}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">
          <Link href={`/books/${book.id}`} className="focus:outline-none focus:underline">
            {book.title}
          </Link>
        </h3>

        {/* Author & Library */}
        <div className="mb-3 space-y-1">
          <p className="text-xs text-foreground-muted font-medium line-clamp-1">
            {book.author}
          </p>
          {book.library_name && (
            <p className="text-[11px] text-foreground-subtle truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              <span>{book.library_name}</span>
            </p>
          )}
        </div>

        {/* Bottom Bar: Availability / Rating & Link CTA */}
        <div className="mt-auto pt-2.5 border-t border-border-subtle flex items-center justify-between">
          {book.available_copies !== undefined ? (
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                book.available_copies > 0
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              )}
            >
              {book.available_copies > 0 ? "متاح للاستعارة" : "طلب انتظار"}
            </span>
          ) : (
            <RatingStars rating={book.rating} size="xs" />
          )}

          <Link
            href={`/books/${book.id}`}
            className="text-xs font-semibold text-primary hover:text-primary-hover group-hover:underline flex items-center gap-1"
          >
            <span>التفاصيل</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 space-y-3.5">
      <Skeleton className="w-full h-52 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
      <div className="pt-2 border-t border-border-subtle flex justify-between">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-12" />
      </div>
    </div>
  );
}
