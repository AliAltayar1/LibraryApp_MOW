import React from "react";
import { Container } from "@/shared/Container";
import { SectionHeader } from "@/shared/SectionHeader";
import { BookCard } from "@/books/BookCard";

export function RecentBooksSection({ books = [] }) {
  if (!books || books.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-surface border-y border-border-subtle">
      <Container>
        <SectionHeader
          badge="الرقمنة الحديثة"
          title="أضيف حديثاً إلى المكتبة الرقمية"
          subtitle="أحدث ما تمت رقمنته وفهرسته وإتاحته للجمهور من كتب ومصنفات حديثة ووثائق وقفية"
          actionText="تصفح كافة الإضافات"
          actionHref="/books?sort=latest"
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
