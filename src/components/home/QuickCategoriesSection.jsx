import React from "react";
import Link from "next/link";
import { Container } from "@/shared/Container";
import { SectionHeader } from "@/shared/SectionHeader";
import {
  BookOpen,
  Scroll,
  Scale,
  Compass,
  Landmark,
  Building2,
  Feather,
  Lightbulb,
} from "lucide-react";
import { formatArabicNumber } from "@/lib/utils";

const ICON_MAP = {
  BookOpenText: BookOpen,
  Scroll: Scroll,
  Scale: Scale,
  Compass: Compass,
  Landmark: Landmark,
  Building2: Building2,
  Feather: Feather,
  Lightbulb: Lightbulb,
};

export function QuickCategoriesSection({ categories = [] }) {
  const categoryList = Array.isArray(categories)
    ? categories
    : categories?.results && Array.isArray(categories.results)
    ? categories.results
    : [];

  return (
    <section className="py-12 sm:py-16 bg-surface">
      <Container>
        <SectionHeader
          badge="التصنيفات العلمية"
          title="تصفح حسب فروع المعرفة الإسلامية"
          subtitle="مجموعة منتقاة من العلوم الشرعية واللغوية والتاريخية والدراسات الوقفية المحققة"
          actionText="عرض كافة الكتب"
          actionHref="/books"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categoryList.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || BookOpen;

            return (
              <Link
                key={cat.id}
                href={`/books?category=${encodeURIComponent(cat.name || cat.slug)}`}
                className="group relative flex flex-col p-5 rounded-xl border border-border bg-background hover:bg-surface hover:border-primary/40 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground-subtle bg-surface-muted px-2 py-0.5 rounded-full border border-border-subtle">
                    {cat.count > 0 ? `${formatArabicNumber(cat.count)} مصنف` : "مصنفات معتمدة"}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors mb-1.5">
                  {cat.name}
                </h3>

                <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Subtle bottom indicator */}
                <div className="mt-4 pt-2 border-t border-border-subtle flex items-center text-[11px] font-semibold text-secondary-hover group-hover:underline">
                  <span>استعراض المراجع ←</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
