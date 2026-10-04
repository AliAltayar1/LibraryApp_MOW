import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/ui/Button";
import { cn, formatArabicNumber } from "@/lib/utils";

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="صفحات التنقل"
      className={cn("flex items-center justify-center gap-1.5 my-8", className)}
    >
      {/* Previous Button (In RTL, Next icon points right) */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="الصفحة السابقة"
        className="px-2.5 h-9"
      >
        <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        <span className="hidden sm:inline text-xs">السابق</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 text-center text-foreground-subtle text-xs"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`انتقل إلى الصفحة ${page}`}
              className={cn(
                "w-9 h-9 rounded-gov text-xs font-semibold transition-all duration-150 flex items-center justify-center",
                isCurrent
                  ? "bg-primary text-white shadow-subtle"
                  : "bg-surface text-foreground hover:bg-primary-50 hover:text-primary border border-border"
              )}
            >
              {formatArabicNumber(page)}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="الصفحة التالية"
        className="px-2.5 h-9"
      >
        <span className="hidden sm:inline text-xs">التالي</span>
        <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
      </Button>
    </nav>
  );
}
