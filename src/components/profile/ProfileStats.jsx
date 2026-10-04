import React from "react";
import { Bookmark, BookOpen, Clock, Library } from "lucide-react";
import { formatArabicNumber } from "@/lib/utils";

export function ProfileStats({ profile, stats }) {
  // Support both new profile API and legacy stats structure
  const favCount = profile?.favorites_count ?? stats?.savedBooks ?? 0;
  const borrowedCount = profile?.borrowed_books_count ?? stats?.recentlyViewed ?? 0;
  const overdueCount = profile?.overdue_books_count ?? stats?.contributions ?? 0;
  const availableCount = profile?.available_books ?? stats?.downloads ?? 0;

  const items = [
    {
      label: "كتب محفوظة في المفضلة",
      value: favCount,
      icon: Bookmark,
      color: "text-secondary",
      bg: "bg-secondary-50",
      description: "المراجع المحفوظة للقراءة لاحقاً",
    },
    {
      label: "كتب قيد الاستعارة حالياً",
      value: borrowedCount,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary-50",
      description: "المصنفات المستعارة قيد المطالعة",
    },
    {
      label: "كتب متأخرة عن الإرجاع",
      value: overdueCount,
      icon: Clock,
      color: overdueCount > 0 ? "text-error" : "text-foreground-muted",
      bg: overdueCount > 0 ? "bg-red-50" : "bg-surface-muted",
      description: overdueCount > 0 ? "يرجى تسليمها للمكتبة" : "لا توجد كتب متأخرة",
    },
    {
      label: "الحد المتاح للاستعارة",
      value: availableCount,
      icon: Library,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "رصيد الكتب المسموح باستعارتها",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, idx) => {
        const Icon = item.icon;

        return (
          <div
            key={idx}
            className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-subtle text-start space-y-2 hover:border-primary/30 transition-colors"
          >
            <div
              className={`w-9 h-9 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-foreground font-arabic">
              {formatArabicNumber(item.value)}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">
                {item.label}
              </p>
              <p className="text-[10px] text-foreground-subtle mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
