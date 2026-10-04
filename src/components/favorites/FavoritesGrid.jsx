"use client";

import React, { useState } from "react";
import { BookCard } from "@/books/BookCard";
import { EmptyState } from "@/shared/EmptyState";
import { SearchInput } from "@/shared/SearchInput";
import { useFavorites } from "@/hooks/useFavorites";
import { MOCK_BOOKS } from "@/data/mockBooks";
import { Heart, BookOpen, Search } from "lucide-react";

export function FavoritesGrid() {
  const { favoriteIds, isLoaded } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");

  const favoriteBooks = MOCK_BOOKS.filter((b) => favoriteIds.includes(b.id));

  const filteredBooks = searchQuery.trim()
    ? favoriteBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : favoriteBooks;

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-80 rounded-xl bg-surface-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (favoriteBooks.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="لم تحفظ أي كتب بعد"
        description="يمكنك حفظ الكتب والمصنفات بالضغط على أيقونة القلب أثناء استعراض المكتبة للرجوع إليها في أي وقت."
        actionText="استكشف الكتب والمطبوعات"
        actionHref="/books"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search in favorites */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchInput
            placeholder="ابحث داخل كتبك المحفوظة..."
            defaultValue={searchQuery}
            onSearch={setSearchQuery}
            size="sm"
          />
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <EmptyState
          icon={Search}
          title="لا توجد نتائج مطابقة في المفضلة"
          description={`لم نجد أي كتاب يطابق "${searchQuery}" ضمن قائمة الكتب المحفوظة.`}
          actionText="إلغاء البحث"
          onAction={() => setSearchQuery("")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
