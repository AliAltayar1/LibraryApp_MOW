"use client";

import React, { useState } from "react";
import { Heart, BookOpen, Download, Share2, Check } from "lucide-react";
import { Button } from "@/ui/Button";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  bookId,
  initialIsFavorite = false,
  size = "md",
  className,
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isPending, setIsPending] = useState(false);
  const active = isFavorite(bookId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsPending(true);
    toggleFavorite(bookId);
    setTimeout(() => {
      setIsPending(false);
    }, 150);
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-4.5 h-4.5",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={active ? "إزالة من قائمة المفضلة" : "إضافة إلى قائمة المفضلة"}
      aria-pressed={active}
      className={cn(
        "relative rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        active
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          : "bg-surface/90 text-foreground-subtle border border-border hover:text-red-500 hover:bg-surface hover:border-red-200",
        sizeClasses[size],
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-transform duration-200",
          active && "fill-current scale-110",
          isPending && "scale-90"
        )}
      />
    </button>
  );
}

export function BookShareButton({ bookTitle, className }) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={cn("gap-1.5 text-xs", className)}
      aria-label="مشاركة رابط الكتاب"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Share2 className="w-3.5 h-3.5" />}
      <span>{copied ? "تم النسخ" : "مشاركة"}</span>
    </Button>
  );
}
