"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Lock,
  LogIn,
  RotateCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/shared/Container";
import { SearchInput } from "@/shared/SearchInput";
import { BookFilters } from "@/books/BookFilters";
import { BookGrid } from "@/books/BookGrid";
import { Pagination } from "@/shared/Pagination";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { booksService } from "@/services/booksService";
import { librariesService } from "@/services/librariesService";
import { categoriesService } from "@/services/categoriesService";
import { useAuth } from "@/hooks/useAuth";
import { formatArabicNumber } from "@/lib/utils";

export function BooksDiscoveryView({
  initialCategories = [],
  initialQuery = "",
  initialCategory = "all",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Read URL params or fallback to props
  const [query, setQuery] = useState(searchParams.get("q") || initialQuery || "");
  const [category, setCategory] = useState(searchParams.get("category") || initialCategory || "all");
  const [library, setLibrary] = useState(searchParams.get("library") || "all");
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("available") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [language, setLanguage] = useState(searchParams.get("language") || "all");
  const [format, setFormat] = useState(searchParams.get("format") || "all");
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState(initialCategories);
  const [libraries, setLibraries] = useState([]);
  const [booksData, setBooksData] = useState({
    results: [],
    count: 0,
    page: 1,
    totalPages: 1,
    isLive: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync state when URL params change
  useEffect(() => {
    const qParam = searchParams.get("q");
    const catParam = searchParams.get("category");
    const libParam = searchParams.get("library");
    const sortParam = searchParams.get("sort");
    const availParam = searchParams.get("available");

    if (qParam !== null && qParam !== query) setQuery(qParam);
    if (catParam !== null && catParam !== category) setCategory(catParam);
    if (libParam !== null && libParam !== library) setLibrary(libParam);
    if (sortParam !== null && sortParam !== sort) setSort(sortParam);
    if (availParam !== null) setAvailableOnly(availParam === "true");
  }, [searchParams]);

  // Load active libraries & categories
  useEffect(() => {
    let isMounted = true;

    // Fetch live categories from public API
    categoriesService
      .getCategories()
      .then((cats) => {
        if (isMounted && Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch(() => {});

    if (isAuthenticated) {
      // Fetch reader's governorate libraries
      librariesService
        .getLibraries({ pageSize: 50 })
        .then((res) => {
          if (isMounted) setLibraries(res.results || []);
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Load books dynamically based on active filter state
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await booksService.getBooks({
        query,
        category: category !== "all" ? category : "",
        library: library !== "all" ? library : null,
        isAvailable: availableOnly ? true : null,
        sort,
        language,
        format,
        page,
        pageSize: 10,
      });

      setBooksData(data);
    } catch {
      // Error handled inside booksService fallback
    } finally {
      setIsLoading(false);
    }
  }, [query, category, library, availableOnly, sort, language, format, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handleResetFilters = () => {
    setQuery("");
    setCategory("all");
    setLibrary("all");
    setAvailableOnly(false);
    setSort("latest");
    setLanguage("all");
    setFormat("all");
    setPage(1);
    router.push("/books");
  };

  return (
    <Container className="py-8 space-y-6">
      {/* Top Banner for Reader Scope or Guest */}
      {isAuthenticated ? (
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-foreground-muted block">نطاق الاستعارة المعتمد لحسابك:</span>
              <strong className="text-foreground text-sm font-arabic">
                محافظة {user?.governorate_name || "المسجلة بحسابك"}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Link href="/libraries">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <Building2 className="w-3.5 h-3.5 text-secondary" />
                <span>دليل مكتبات المحافظة</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchBooks}
              disabled={isLoading}
              className="gap-1 text-xs h-8"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>تحديث</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50/40 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-subtle">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-primary font-bold text-sm mb-0.5 font-arabic">
                المنصة الرقمية الموحدة لوزارة الأوقاف
              </strong>
              <p className="text-foreground-muted text-[11px] leading-relaxed">
                سجل دخولك كقارئ لاستعراض فهارس مكتبات محافظتك وتقديم طلبات الاستعارة الورقية المباشرة.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login">
              <Button variant="primary" size="sm" className="text-xs font-bold gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="sm" className="text-xs font-bold">
                <span>حساب جديد</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

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
        categories={categories}
        libraries={libraries}
        activeCategory={category}
        activeLibrary={library}
        activeSort={sort}
        activeLanguage={language}
        activeFormat={format}
        activeAvailableOnly={availableOnly}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
        onLibraryChange={(val) => {
          setLibrary(val);
          setPage(1);
        }}
        onAvailableOnlyChange={(val) => {
          setAvailableOnly(val);
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
          {library !== "all" && (
            <span className="ms-2 text-primary">
              (مكتبة محددة)
            </span>
          )}
          {availableOnly && (
            <span className="ms-2 text-emerald-700 font-semibold">
              — المتاحة للاستعارة فقط
            </span>
          )}
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
        emptyDescription="لم نجد أي مراجع أو مطبوعات تطابق معايير البحث والتصفية المحددة. جرب استخدام كلمات بحث مختلفة أو تغيير خيارات التصفية."
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
