"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/shared/SearchInput";
import { Container } from "@/shared/Container";
import { BookOpen, Sparkles, Compass, ShieldCheck } from "lucide-react";

export function HeroSection() {
  const router = useRouter();

  const handleHeroSearch = (query) => {
    if (query && query.trim()) {
      router.push(`/books?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/books");
    }
  };

  const quickBadges = [
    { label: "أصول الفقه والمقاصد", query: "أصول الفقه" },
    { label: "تفسير ابن كثير", query: "تفسير" },
    { label: "رياض الصالحين", query: "رياض الصالحين" },
    { label: "الوثائق الوقفية", query: "الأوقاف" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-background to-background py-14 sm:py-20 lg:py-24 border-b border-border-subtle">
      {/* Subtle Islamic Geometric Watermark Pattern */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-60 pointer-events-none" />

      {/* Decorative Gold & Green Ambient Glows */}
      <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

      <Container className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Official Tag Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-secondary/30 shadow-subtle mb-6 text-xs font-semibold text-secondary-hover">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span>المنصة الرقمية المعتمدة لوزارة الأوقاف</span>
          <span className="w-1 h-1 rounded-full bg-secondary" />
          <span className="text-foreground-muted font-normal">إصدار تجريبي</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.2] mb-6 font-arabic">
          اكتشف المعرفة بين يديك
        </h1>

        {/* Supporting Paragraph */}
        <p className="text-base sm:text-lg text-foreground-muted max-w-2xl mx-auto leading-relaxed mb-10">
          بوابة شاملة تتيح للباحثين والمطالعين استكشاف وتصفح نفائس التراث الإسلامي،
          والدراسات الفقهية والتاريخية، والمخطوطات الوقفية المحفوظة في خزانة وزارة الأوقاف السورية.
        </p>

        {/* Prominent Large Search Box */}
        <div className="max-w-2xl mx-auto mb-6">
          <SearchInput
            size="lg"
            placeholder="ابحث عن كتاب، مؤلف، مصطلح، أو موضوع في المكتبة..."
            onSearch={handleHeroSearch}
          />
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-foreground-subtle flex items-center gap-1 font-medium">
            <Compass className="w-3.5 h-3.5 text-secondary" />
            <span>مواضيع شائعة:</span>
          </span>
          {quickBadges.map((badge) => (
            <button
              key={badge.label}
              type="button"
              onClick={() => handleHeroSearch(badge.query)}
              className="px-2.5 py-1 rounded-full bg-surface border border-border text-foreground-muted hover:text-primary hover:border-primary/40 hover:bg-primary-50 transition-all font-medium text-[11px]"
            >
              {badge.label}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
