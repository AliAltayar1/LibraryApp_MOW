import React from "react";
import { Container } from "@/shared/Container";
import { SectionHeader } from "@/shared/SectionHeader";
import { FeaturedBookCard } from "@/books/FeaturedBookCard";
import { BookCard } from "@/books/BookCard";

export function FeaturedBooksSection({ books = [] }) {
  if (!books || books.length === 0) return null;

  const spotlightBook = books[0];
  const otherFeatured = books.slice(1, 4);

  return (
    <section className="py-12 sm:py-16 bg-background">
      <Container>
        <SectionHeader
          badge="مختارات الخزانة"
          title="أبرز إصدارات ومطبوعات الوزارة"
          subtitle="مجموعة من أمهات الكتب والمصنفات التي تمتاز بعمقها العلمي وأهميتها التراثية والوقفية"
          actionText="عرض كافة المطبوعات"
          actionHref="/books"
        />

        {/* Primary Spotlight Featured Book */}
        {spotlightBook && (
          <div className="mb-8">
            <FeaturedBookCard book={spotlightBook} />
          </div>
        )}

        {/* Secondary Featured Books Grid */}
        {otherFeatured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatured.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
