import React from "react";
import { Container } from "@/shared/Container";
import { MOCK_STATS } from "@/data/mockStats";
import { BookMarked, Scroll, Layers, Users } from "lucide-react";

const STAT_ICONS = {
  books: BookMarked,
  manuscripts: Scroll,
  categories: Layers,
  readers: Users,
};

export function LibraryStatsSection() {
  return (
    <section className="relative py-14 sm:py-20 bg-primary-900 text-white overflow-hidden border-y border-secondary/30">
      {/* Subtle Islamic Geometry Watermark */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />

      <Container className="relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-secondary-light tracking-widest uppercase mb-2 inline-block">
            إحصائيات المنصة الرقمية
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 font-arabic">
            أرقام تعكس غنى التراث الوقفي والعلمي
          </h2>
          <p className="text-xs sm:text-sm text-primary-100/80 leading-relaxed">
            جهود مستمرة في أرشفة وفهرسة ورقمنة التراث الديني والوقفي وإتاحته للجميع بأحدث التقنيات.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {MOCK_STATS.map((stat) => {
            const Icon = STAT_ICONS[stat.id] || BookMarked;

            return (
              <div
                key={stat.id}
                className="relative rounded-2xl bg-white/5 border border-white/10 p-6 text-center hover:border-secondary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary-light mx-auto flex items-center justify-center mb-4 border border-secondary/20">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1.5 font-arabic">
                  {stat.formattedValue}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-secondary-light mb-1">
                  {stat.label}
                </div>
                <p className="text-[11px] text-primary-100/60 leading-tight">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
