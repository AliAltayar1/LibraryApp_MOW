import React, { Suspense } from "react";
import { BooksHeader } from "@/books/BooksHeader";
import { BooksDiscoveryView } from "@/books/BooksDiscoveryView";

export const metadata = {
  title: "الكتب والمطبوعات | المكتبة الإلكترونية لوزارة الأوقاف",
  description:
    "فهرس شامل للكتب والدراسات الإسلامية والتاريخية والوقفية لوزارة الأوقاف في الجمهورية العربية السورية.",
};

export default function BooksPage({ searchParams }) {
  const query = searchParams?.q || "";
  const category = searchParams?.category || "all";

  return (
    <div className="w-full">
      <BooksHeader />
      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center text-xs text-foreground-muted">
            جاري تحميل الفهرس...
          </div>
        }
      >
        <BooksDiscoveryView initialQuery={query} initialCategory={category} />
      </Suspense>
    </div>
  );
}
