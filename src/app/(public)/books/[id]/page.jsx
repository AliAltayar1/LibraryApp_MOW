import React from "react";
import { Container } from "@/shared/Container";
import { BookDetails } from "@/books/BookDetails";

export const metadata = {
  title: "تفاصيل الكتاب والمطالعة | المكتبة الإلكترونية لوزارة الأوقاف",
  description: "عرض تفاصيل المصنف والكتب والمراجع وتقديم طلبات الاستعارة الرقمية.",
};

export default function BookDetailPage({ params }) {
  const { id } = params;

  return (
    <div className="w-full bg-background min-h-screen">
      <Container>
        <BookDetails bookId={id} />
      </Container>
    </div>
  );
}
