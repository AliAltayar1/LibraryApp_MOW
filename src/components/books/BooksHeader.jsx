import React from "react";
import { Container } from "@/shared/Container";
import { Breadcrumbs } from "@/shared/Breadcrumbs";
import { BookOpen } from "lucide-react";
import { formatArabicNumber } from "@/lib/utils";

export function BooksHeader({ totalCount = 0 }) {
  return (
    <div className="bg-surface border-b border-border-subtle py-8">
      <Container>
        <Breadcrumbs items={[{ label: "الكتب والمطبوعات" }]} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-hover bg-secondary-50 px-2.5 py-0.5 rounded-full border border-secondary/20">
              <BookOpen className="w-3.5 h-3.5 text-secondary" />
              <span>فهرس الخزانة الرقمية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-arabic">
              استكشاف الكتب والمصنفات التراثية
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
              ابحث في آلاف المراجع والمطبوعات والمخطوطات النادرة المعتمدة من وزارة الأوقاف.
            </p>
          </div>

          <div className="text-xs text-foreground-subtle self-start md:self-auto bg-surface-muted px-3.5 py-2 rounded-xl border border-border">
            <span>إجمالي المتاح في الفهرس:</span>{" "}
            <span className="font-bold text-foreground">
              {formatArabicNumber(totalCount)} مصنف
            </span>
          </div>
        </div>
      </Container>
    </div>
  );
}
