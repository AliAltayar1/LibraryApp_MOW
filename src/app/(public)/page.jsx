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

export const revalidate = 60; // Dynamic revalidation with live API data

export default async function HomePage() {
  const [categories, featuredBooks, recentBooks, popularBooks, booksData] =
    await Promise.all([
      categoriesService.getCategories(),
      booksService.getFeaturedBooks(4),
      booksService.getRecentBooks(4),
      booksService.getPopularBooks(4),
      booksService.getBooks({ pageSize: 1 }),
    ]);

  const totalBooks = booksData?.count ?? featuredBooks.length;
  const totalCategories = categories?.length ?? 0;
  const totalCopies = (featuredBooks || []).reduce(
    (acc, b) => acc + (b.total_copies || 1),
    0
  );
  const totalBorrowed = (featuredBooks || []).reduce(
    (acc, b) => acc + (b.count_borrowed || 0),
    0
  );

  const stats = {
    totalBooks,
    totalCategories,
    totalCopies: totalCopies > 0 ? totalCopies : totalBooks,
    totalBorrowed,
  };

  return (
    <div className="w-full space-y-0">
      <HeroSection />
      <QuickCategoriesSection categories={categories} />
      <FeaturedBooksSection books={featuredBooks} />
      <RecentBooksSection books={recentBooks} />
      <LibraryStatsSection stats={stats} />
      <PopularBooksSection books={popularBooks} />
      <CtaSection />
    </div>
  );
}
