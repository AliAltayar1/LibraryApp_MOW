import React from "react";
import Link from "next/link";
import { BookCover } from "./BookCover";
import { FavoriteButton } from "./BookActions";
import { RatingStars } from "@/shared/RatingStars";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { formatArabicNumber } from "@/lib/utils";
import { BookOpen, Calendar, Layers, Eye } from "lucide-react";

export function FeaturedBookCard({ book }) {
  if (!book) return null;

  return (
    <div className="relative rounded-2xl border border-secondary/30 bg-gradient-to-r from-surface via-surface to-secondary-50/40 p-5 sm:p-7 shadow-card overflow-hidden">
      {/* Subtle top gold accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-secondary/60 via-secondary to-secondary/30" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
        {/* Book Cover with subtle 3D highlight */}
        <div className="shrink-0 relative group">
          <Link href={`/books/${book.id}`} aria-label={`تصفح كتاب ${book.title}`}>
            <BookCover
              title={book.title}
              author={book.author}
              category={book.category}
              coverTheme={book.coverTheme}
              size="lg"
            />
          </Link>
          <div className="absolute top-3 end-3 z-20">
            <FavoriteButton bookId={book.id} initialIsFavorite={book.isFavorite} size="sm" />
          </div>
        </div>

        {/* Content Details */}
        <div className="flex flex-col flex-1 text-start">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-xs font-bold text-secondary-hover bg-secondary-50 px-2.5 py-1 rounded-md border border-secondary/20">
              مؤلف بارز ومختار
            </span>
            <Badge variant="primary" size="sm">
              {book.category}
            </Badge>
            {book.formatLabel && (
              <Badge variant="muted" size="sm">
                {book.formatLabel}
              </Badge>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 leading-snug">
            <Link
              href={`/books/${book.id}`}
              className="hover:text-primary transition-colors focus:outline-none focus:underline"
            >
              {book.title}
            </Link>
          </h3>

          <p className="text-sm font-semibold text-primary mb-3">
            بقلم: {book.author}
          </p>

          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed line-clamp-3 mb-5">
            {book.description}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-foreground-subtle pb-5 mb-5 border-b border-border-subtle">
            <RatingStars rating={book.rating} reviewsCount={book.reviewsCount} size="sm" />

            {book.year && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                <span>{book.year}</span>
              </div>
            )}

            {book.pages && (
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-secondary" />
                <span>{formatArabicNumber(book.pages)} صفحة</span>
              </div>
            )}

            {book.viewsCount && (
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-secondary" />
                <span>{formatArabicNumber(book.viewsCount)} قراءة</span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-auto">
            <Link href={`/books/${book.id}`}>
              <Button variant="primary" size="md" className="gap-2 font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>تصفح محتويات الكتاب</span>
              </Button>
            </Link>
            <Link href={`/books/${book.id}#downloads`}>
              <Button variant="outline" size="md" className="gap-1.5">
                <span>خيارات التحميل والقراءة</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
