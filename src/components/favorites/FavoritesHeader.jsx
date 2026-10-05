"use client";

import React from "react";
import { Heart, BookmarkCheck } from "lucide-react";
import { formatArabicNumber } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoritesHeader({ count: propCount }) {
  const { count: hookCount } = useFavorites();
  const count = typeof propCount === "number" ? propCount : hookCount;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle mb-8">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-hover bg-secondary-50 px-2.5 py-0.5 rounded-full border border-secondary/20">
          <BookmarkCheck className="w-3.5 h-3.5 text-secondary" />
          <span>قائمة القراءة المحفوظة</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2 font-arabic">
          <span>الكتب المحفوظة والمفضلة</span>
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
          جميع الكتب والمراجع التي قمت بحفظها لتسهيل الرجوع إليها والمطالعة لاحقاً.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl bg-surface border border-border shadow-subtle text-xs">
        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        <span className="text-foreground-muted">إجمالي المحفوظات:</span>
        <span className="font-bold text-foreground text-sm">
          {formatArabicNumber(count)} كتاب
        </span>
      </div>
    </div>
  );
}
