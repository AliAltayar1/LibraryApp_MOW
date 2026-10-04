"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/shared/Container";
import { SearchInput } from "@/shared/SearchInput";
import { BookFilters } from "@/books/BookFilters";
import { BookGrid } from "@/books/BookGrid";
import { Pagination } from "@/shared/Pagination";
import { booksService } from "@/services/booksService";
import { formatArabicNumber } from "@/lib/utils";

export function BooksDiscoveryView({
  initialCategories = [],
  initialQuery = "",
  initialCategory = "all",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params or fallback to props
  const [query, setQuery] = useState(searchParams.get("q") || initialQuery || "");
  const [category, setCategory] = useState(searchParams.get("category") || initialCategory || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [language, setLanguage] = useState(searchParams.get("language") || "all");
  const [format, setFormat] = useState(searchParams.get("format") || "all");
  const [page, setPage] = useState(1);

  const [booksData, setBooksData] = useState({
    results: [],
    count: 0,
    page: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync state when URL params change
  useEffect(() => {
    const qParam = searchParams.get("q");
    const catParam = searchParams.get("category");
    const sortParam = searchParams.get("sort");

    if (qParam !== null && qParam !== query) setQuery(qParam);
    if (catParam !== null && catParam !== category) setCategory(catParam);
    if (sortParam !== null && sortParam !== sort) setSort(sortParam);
  }, [searchParams]);

  // Load books dynamically based on active filter state
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    booksService
      .getBooks({
        query,
        category,
        sort,
        language,
        format,
        page,
        pageSize: 9,
      })
      .then((data) => {
        if (isMounted) {
          setBooksData(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query, category, sort, language, format, page]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handleResetFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("latest");
    setLanguage("all");
    setFormat("all");
    setPage(1);
    router.push("/books");
  };

  return (
    <Container className="py-8 space-y-6">
      {/* Top Search Bar */}
      <div className="max-w-3xl mx-auto">
        <SearchInput
          size="lg"
          defaultValue={query}
          onSearch={handleSearch}
          placeholder="ابحث بالعنوان، اسم المؤلف، أو موضوع البحث..."
        />
      </div>

      {/* Filters Toolbar */}
      <BookFilters
        categories={initialCategories}
        activeCategory={category}
        activeSort={sort}
        activeLanguage={language}
        activeFormat={format}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
        onSortChange={(val) => {
          setSort(val);
          setPage(1);
        }}
        onLanguageChange={(val) => {
          setLanguage(val);
          setPage(1);
        }}
        onFormatChange={(val) => {
          setFormat(val);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* Results Header / Counter */}
      <div className="flex items-center justify-between text-xs text-foreground-muted px-1">
        <div>
          <span>نتائج البحث والتصفية: </span>
          <span className="font-bold text-foreground">
            {formatArabicNumber(booksData.count)} كتاب
          </span>
        </div>
        {query && (
          <span className="text-secondary-hover">
            تصفية بكلمة: "{query}"
          </span>
        )}
      </div>

      {/* Books Grid */}
      <BookGrid
        books={booksData.results}
        isLoading={isLoading}
        emptyTitle="لم يتم العثور على كتب مطابقة"
        emptyDescription="لم نجد أي مراجع أو مطبوعات تطابق معايير البحث والتصفية المحددة. جرب استخدام كلمات بحث مختلفة أو إعادة ضبط الفلاتر."
        emptyActionText="إعادة ضبط خيارات البحث"
        onAction={handleResetFilters}
      />

      {/* Pagination */}
      {!isLoading && booksData.totalPages > 1 && (
        <Pagination
          currentPage={booksData.page}
          totalPages={booksData.totalPages}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 300, behavior: "smooth" });
          }}
        />
      )}
    </Container>
  );
}
