import React, { Suspense } from "react";
import { BooksHeader } from "@/books/BooksHeader";
import { BooksDiscoveryView } from "@/books/BooksDiscoveryView";
import { categoriesService } from "@/services/categoriesService";
import { booksService } from "@/services/booksService";

export const metadata = {
  title: "الكتب والمطبوعات | المكتبة الإلكترونية لوزارة الأوقاف",
  description: "فهرس شامل للكتب والدراسات الإسلامية والتاريخية والوقفية لوزارة الأوقاف في الجمهورية العربية السورية.",
};

export default async function BooksPage({ searchParams }) {
  const [categories, initialBooksData] = await Promise.all([
    categoriesService.getCategories(),
    booksService.getBooks({ pageSize: 1 }), // for total count
  ]);

  const query = searchParams?.q || "";
  const category = searchParams?.category || "all";

  return (
    <div className="w-full">
      <BooksHeader totalCount={initialBooksData.count} />
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-xs">جاري التحميل...</div>}>
        <BooksDiscoveryView
          initialCategories={categories}
          initialQuery={query}
          initialCategory={category}
        />
      </Suspense>
    </div>
  );
}
