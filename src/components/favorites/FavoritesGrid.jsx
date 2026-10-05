"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookCard } from "@/books/BookCard";
import { EmptyState } from "@/shared/EmptyState";
import { SearchInput } from "@/shared/SearchInput";
import { Pagination } from "@/shared/Pagination";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { favoritesService } from "@/services/favoritesService";
import { Heart, Search, LogIn, ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/ui/Button";

export function FavoritesGrid() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { favoriteIds, count: globalCount } = useFavorites();

  const [books, setBooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isReader = !user?.role?.code || user?.role?.code === "READER";

  const fetchFavorites = useCallback(async (page = 1) => {
    if (!isAuthenticated || !isReader) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const res = await favoritesService.getFavorites({ page });
      setBooks(res.results || []);
      setTotalCount(res.count || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(
        err.message || "تعذر جلب قائمة الكتب المفضلة، يرجى المحاولة مجدداً."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isReader]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && isReader) {
      fetchFavorites(currentPage);
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [isAuthLoading, isAuthenticated, isReader, currentPage, fetchFavorites]);

  // If a book is unfavorited from outside or via BookCard, immediately remove it from view
  useEffect(() => {
    setBooks((prevBooks) => {
      const remaining = prevBooks.filter((b) =>
        favoriteIds.some((id) => Number(id) === Number(b.id))
      );
      if (remaining.length !== prevBooks.length) {
        // If all books on current page were removed and page > 1, go to previous page
        if (remaining.length === 0 && currentPage > 1) {
          setCurrentPage((p) => Math.max(1, p - 1));
        }
      }
      return remaining;
    });
  }, [favoriteIds, currentPage]);

  // Loading skeleton while waiting for auth or initial data
  if (isAuthLoading || (isLoading && books.length === 0 && !error)) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full max-w-md bg-surface-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-xl bg-surface-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Unauthenticated user prompt
  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={LogIn}
        title="تسجيل الدخول مطلوب"
        description="يرجى تسجيل الدخول إلى حسابك المعتمد في المنصة الرقمية لوزارة الأوقاف لعرض قائمة الكتب المحفوظة في مفضلتك."
        actionText="تسجيل الدخول"
        actionHref="/login?redirect=/favorites"
      />
    );
  }

  // Non-reader role warning (favorites restricted by contract to READER role only)
  if (!isReader) {
    return (
      <div className="max-w-xl mx-auto my-8 p-6 rounded-2xl bg-surface border border-border shadow-subtle text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-foreground font-arabic">
            الميزة متاحة لدور القارئ فقط
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
            وفق الصلاحيات المؤسسية المعتمدة في منصة وزارة الأوقاف، ميزة قائمة المفضلة متاحة لحسابات القراء (READER) فقط، ولا يمكن استخدامها من قبل مسؤولي النظام أو الإدارات أو أمناء المكتبات.
          </p>
          <div className="pt-2 text-xs text-foreground-subtle">
            دورك الحالي: <span className="font-bold text-primary">{user?.role?.label || user?.role?.code}</span>
          </div>
        </div>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="primary" size="md">
              الانتقال إلى لوحة التحكم الإدارية
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error alert with retry
  if (error) {
    return (
      <div className="space-y-4 max-w-lg mx-auto my-8 text-center">
        <ErrorAlert message={error} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchFavorites(currentPage)}
          className="gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </Button>
      </div>
    );
  }

  // Filter books locally by search query
  const filteredBooks = searchQuery.trim()
    ? books.filter(
        (b) =>
          b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : books;

  // Empty state: no favorites saved at all
  if (books.length === 0 && !searchQuery.trim()) {
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
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchInput
            placeholder="ابحث داخل كتبك المحفوظة..."
            defaultValue={searchQuery}
            onSearch={setSearchQuery}
            size="sm"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchFavorites(currentPage)}
          disabled={isLoading}
          className="text-xs text-foreground-muted gap-1.5 self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>تحديث</span>
        </Button>
      </div>

      {/* No matching results for search filter */}
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

      {/* Pagination (Page size 10) */}
      {totalPages > 1 && !searchQuery.trim() && (
        <div className="pt-6 flex justify-center border-t border-border-subtle">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}
    </div>
  );
}
