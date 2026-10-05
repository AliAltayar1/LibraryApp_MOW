"use client";

import React from "react";
import { Filter, RotateCcw, Building2, Check, UserCheck } from "lucide-react";
import { SORT_OPTIONS, LANGUAGE_OPTIONS, FORMAT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BookFilters({
  categories = [],
  libraries = [],
  activeCategory = "all",
  activeLibrary = "all",
  activeSort = "latest",
  activeLanguage = "all",
  activeFormat = "all",
  activeAvailableOnly = false,
  onCategoryChange,
  onLibraryChange,
  onSortChange,
  onLanguageChange,
  onFormatChange,
  onAvailableOnlyChange,
  onResetFilters,
  className,
}) {
  const categoryList = Array.isArray(categories)
    ? categories
    : categories?.results && Array.isArray(categories.results)
    ? categories.results
    : [];

  const libraryList = Array.isArray(libraries)
    ? libraries
    : libraries?.results && Array.isArray(libraries.results)
    ? libraries.results
    : [];

  const hasActiveFilters =
    activeCategory !== "all" ||
    activeLibrary !== "all" ||
    activeSort !== "latest" ||
    activeLanguage !== "all" ||
    activeFormat !== "all" ||
    activeAvailableOnly;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-subtle space-y-4",
        className
      )}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <Filter className="w-4 h-4 text-primary" />
          <span>تصفية وتصنيف النتائج</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Availability Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-foreground font-medium select-none bg-surface-muted hover:bg-surface-muted/80 px-2.5 py-1 rounded-lg border border-border-subtle transition-colors">
            <input
              type="checkbox"
              checked={activeAvailableOnly}
              onChange={(e) => onAvailableOnlyChange && onAvailableOnlyChange(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>المتاحة للاستعارة فقط</span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs text-secondary-hover hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة تعيين</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Library Filter (for reader scope) */}
        {libraryList.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground-muted block">
              المكتبة في محافظتك
            </label>
            <select
              value={activeLibrary}
              onChange={(e) => onLibraryChange && onLibraryChange(e.target.value)}
              className="w-full text-xs rounded-gov border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              aria-label="تصفية حسب المكتبة"
            >
              <option value="all">كافة مكتبات المحافظة</option>
              {libraryList.map((lib) => (
                <option key={lib.id} value={lib.id}>
                  {lib.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Select */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground-muted block">
            التصنيف العلمي
          </label>
          <select
            value={activeCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full text-xs rounded-gov border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            aria-label="تصفية حسب التصنيف العلمي"
          >
            <option value="all">كافة التصنيفات العلمية</option>
            {categoryList.map((c) => (
              <option key={c.slug || c.id || c.name} value={c.name || c.slug}>
                {c.name} {c.count !== undefined ? `(${c.count})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground-muted block">
            ترتيب النتائج
          </label>
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full text-xs rounded-gov border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            aria-label="ترتيب النتائج"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Format Select */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground-muted block">
            نوع الوثيقة / الصيغة
          </label>
          <select
            value={activeFormat}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-full text-xs rounded-gov border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            aria-label="تصفية حسب الصيغة"
          >
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
