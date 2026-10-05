import React from "react";
import { Bookmark, BookOpen, Clock, CheckCircle2, Inbox } from "lucide-react";
import { formatArabicNumber } from "@/lib/utils";

export function ProfileStats({
  activeBorrowsCount = 0,
  pendingRequestsCount = 0,
  returnedBorrowsCount = 0,
  favoritesCount = 0,
}) {
  const items = [
    {
      label: "استعارات نشطة حالياً",
      value: activeBorrowsCount,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary-50",
      description: "المصنفات قيد المطالعة بحوزتك حالياً",
    },
    {
      label: "طلبات استعارة قيد المراجعة",
      value: pendingRequestsCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "طلبات بانتظار موافقة أمين المكتبة",
    },
    {
      label: "الكتب المُرجعة للمكتبة",
      value: returnedBorrowsCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "السجل التراكمي للمصنفات المعادة بنجاح",
    },
    {
      label: "المحفوظات في المفضلة",
      value: favoritesCount,
      icon: Bookmark,
      color: "text-secondary",
      bg: "bg-secondary-50",
      description: "المراجع المحفوظة للقراءة والمتابعة",
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
