import React from "react";
import Link from "next/link";
import { Container } from "@/shared/Container";
import { Button } from "@/ui/Button";
import { BookOpen, Search, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-14 sm:py-20 bg-surface">
      <Container>
        <div className="relative rounded-3xl bg-gradient-to-r from-primary via-primary-light to-primary-900 text-white p-8 sm:p-12 lg:p-14 overflow-hidden shadow-card border border-primary-light/40">
          {/* Subtle gold decorative glow */}
          <div className="absolute top-0 end-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl text-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-secondary-light text-xs font-semibold mb-4 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>خدمة الباحثين وطلاب العلم</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight font-arabic">
              ابدأ رحلتك المعرفية في خزانة الكتب والوثائق الوقفية
            </h2>

            <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed mb-8">
              تصفح آلاف المصنفات والأطروحات المحققة بدقة عالية وبشكل مجاني، واحفظ المراجع المفضلة في حسابك الأكاديمي للرجوع إليها في أي وقت.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/books">
                <Button
                  variant="secondary"
                  size="lg"
                  className="font-bold text-primary-900 shadow-md gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>استكشف فهرس الكتب الكامل</span>
                </Button>
              </Link>
              <Link href="/favorites">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  <span>عرض الكتب المحفوظة</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
