import React from "react";
import { HeroSection } from "@/home/HeroSection";
import { QuickCategoriesSection } from "@/home/QuickCategoriesSection";
import { FeaturedBooksSection } from "@/home/FeaturedBooksSection";
import { RecentBooksSection } from "@/home/RecentBooksSection";
import { PopularBooksSection } from "@/home/PopularBooksSection";
import { LibraryStatsSection } from "@/home/LibraryStatsSection";
import { CtaSection } from "@/home/CtaSection";
import { booksService } from "@/services/booksService";
import { categoriesService } from "@/services/categoriesService";

export const revalidate = 3600; // Static revalidation ready for production

export default async function HomePage() {
  const [categories, featuredBooks, recentBooks, popularBooks] =
    await Promise.all([
      categoriesService.getCategories(),
      booksService.getFeaturedBooks(4),
      booksService.getRecentBooks(4),
      booksService.getPopularBooks(4),
    ]);

  return (
    <div className="w-full space-y-0">
      <HeroSection />
      <QuickCategoriesSection categories={categories} />
      <FeaturedBooksSection books={featuredBooks} />
      <RecentBooksSection books={recentBooks} />
      <LibraryStatsSection />
      <PopularBooksSection books={popularBooks} />
      <CtaSection />
    </div>
  );
}
