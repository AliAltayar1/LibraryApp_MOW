import React from "react";
import { notFound } from "next/navigation";
import { Container } from "@/shared/Container";
import { BookDetails } from "@/books/BookDetails";
import { booksService } from "@/services/booksService";

export async function generateMetadata({ params }) {
  const book = await booksService.getBookById(params.id);

  if (!book) {
    return {
      title: "الكتاب غير موجود | المكتبة الإلكترونية لوزارة الأوقاف",
    };
  }

  return {
    title: `${book.title} - ${book.author} | المكتبة الإلكترونية`,
    description: book.description.slice(0, 160),
  };
}

export default async function BookDetailPage({ params }) {
  const book = await booksService.getBookById(params.id);

  if (!book) {
    notFound();
  }

  const relatedBooks = await booksService.getRelatedBooks(
    book.id,
    book.categorySlug,
    3
  );

  return (
    <div className="w-full bg-background min-h-screen">
      <Container>
        <BookDetails book={book} relatedBooks={relatedBooks} />
      </Container>
    </div>
  );
}
