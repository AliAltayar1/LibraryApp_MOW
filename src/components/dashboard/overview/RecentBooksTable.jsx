import React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, ArrowLeft, Eye, Download } from "lucide-react";
import { formatArabicNumber } from "@/lib/utils";

export function RecentBooksTable({ books = [] }) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-50 text-primary border border-primary/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              أحدث المصنفات والمخطوطات المدرجة
            </h3>
            <p className="text-xs text-foreground-muted">
              قائمة بالمصنفات التي تم فهرستها وإضافتها للمنصة مؤخراً
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/books"
          className="text-xs font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-colors"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-foreground-subtle bg-surface-muted/40">
              <th className="py-2.5 px-3 text-start font-semibold rounded-s-lg">المصنف</th>
              <th className="py-2.5 px-3 text-start font-semibold">المؤلف</th>
              <th className="py-2.5 px-3 text-start font-semibold">التصنيف</th>
              <th className="py-2.5 px-3 text-start font-semibold">الصيغة</th>
              <th className="py-2.5 px-3 text-start font-semibold">المطالعة</th>
              <th className="py-2.5 px-3 text-start font-semibold rounded-e-lg">معاينة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {books.slice(0, 5).map((book) => (
              <tr key={book.id} className="hover:bg-surface-muted/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-bold text-foreground hover:text-primary transition-colors max-w-xs truncate">
                    {book.title}
                  </div>
                  <div className="text-[10px] text-foreground-subtle">
                    الرقم الدولي: {book.isbn || "غير متوفر"}
                  </div>
                </td>
                <td className="py-3 px-3 text-foreground-muted font-medium">
                  {book.author}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary border border-primary/10">
                    {book.category}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[11px] font-semibold text-secondary-hover">
                    {book.format === "manuscript" ? "مخطوطة نادرة" : "PDF محقق"}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3 text-foreground-subtle text-[11px]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-foreground-muted" />
                      {formatArabicNumber(book.viewsCount || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-foreground-muted" />
                      {formatArabicNumber(book.downloadsCount || 0)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Link
                    href={`/books/${book.id}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-primary hover:bg-primary-50 inline-flex items-center gap-1 transition-colors"
                    title="معاينة في المكتبة العامة"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[10px]">عرض</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
