import React from "react";
import Link from "next/link";
import { FolderTree, ArrowLeft } from "lucide-react";
import { formatArabicNumber } from "@/lib/utils";

export function CategoryBreakdown({ categories = [] }) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-secondary-50 text-secondary-hover border border-secondary/20">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                توزيع المصنفات حسب التصنيف الشرعي
              </h3>
              <p className="text-xs text-foreground-muted">
                نسبة المصنفات المرقمنة لكل علم وتخصص
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/categories"
            className="text-xs font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-colors"
          >
            <span>التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Progress List */}
        <div className="space-y-3.5">
          {categories.slice(0, 6).map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground truncate max-w-[200px]">
                  {cat.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground-subtle text-[11px]">
                    {formatArabicNumber(cat.count)} كتاب
                  </span>
                  <span className="font-bold text-primary text-xs w-8 text-end">
                    %{formatArabicNumber(cat.percentage || 12)}
                  </span>
                </div>
              </div>

              {/* Progress bar track */}
              <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden border border-border-subtle">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage || 12}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-foreground-subtle">
        <span>المجموع الإجمالي للتصنيفات: ٢٨ تصنيفاً معتمداً</span>
        <span className="font-semibold text-secondary">تحديث فوري</span>
      </div>
    </div>
  );
}
