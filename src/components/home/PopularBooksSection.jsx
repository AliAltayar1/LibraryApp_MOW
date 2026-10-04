import React from "react";
import { Container } from "@/shared/Container";
import { SectionHeader } from "@/shared/SectionHeader";
import { BookCard } from "@/books/BookCard";

export function PopularBooksSection({ books = [] }) {
  if (!books || books.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-background">
      <Container>
        <SectionHeader
          badge="الأكثر تداولاً"
          title="الكتب الأكثر قراءة وإقبالاً"
          subtitle="المصنفات الأكثر إقبالاً وقراءة من قبل الباحثين وطلاب العلم في مختلف العلوم"
          actionText="عرض قائمة الأكثر قراءة"
          actionHref="/books?sort=popular"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {books.slice(0, 4).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </Container>
    </section>
  );
}
