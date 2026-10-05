"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  Share2,
  Calendar,
  Layers,
  Building,
  FileText,
  Eye,
  CheckCircle2,
  Info,
  ChevronLeft,
  BookmarkPlus,
  AlertOctagon,
  LogIn,
  Clock,
  MapPin,
  Building2,
  Loader2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { BookCover } from "./BookCover";
import { FavoriteButton, BookShareButton } from "./BookActions";
import { RatingStars } from "@/shared/RatingStars";
import { Breadcrumbs } from "@/shared/Breadcrumbs";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import { BookCard } from "./BookCard";
import { formatArabicNumber, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { borrowingService } from "@/services/borrowingService";
import { booksService } from "@/services/booksService";
import { ErrorAlert } from "@/shared/ErrorAlert";

export function BookDetails({ book: propBook, bookId, relatedBooks: propRelatedBooks = [] }) {
  const { user, profile, isAuthenticated } = useAuth();
  const id = bookId || propBook?.id;

  const [book, setBook] = useState(propBook || null);
  const [relatedBooks, setRelatedBooks] = useState(propRelatedBooks);
  const [isLoading, setIsLoading] = useState(!propBook);
  const [fetchError, setFetchError] = useState("");

  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [readModalOpen, setReadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Borrow Request State
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowSuccessMsg, setBorrowSuccessMsg] = useState("");
  const [borrowErrorMsg, setBorrowErrorMsg] = useState("");
  const [borrowErrorCode, setBorrowErrorCode] = useState("");
  const [hasRequested, setHasRequested] = useState(false);

  // Client-side fetch for live authenticated backend data
  useEffect(() => {
    let isMounted = true;

    async function loadBookData() {
      if (!id) return;

      // If we don't have book data or if we might have more accurate live backend data
      try {
        const liveBook = await booksService.getBookById(id);
        if (isMounted) {
          if (liveBook) {
            setBook(liveBook);
            if (relatedBooks.length === 0 && liveBook.categorySlug) {
              booksService
                .getRelatedBooks(liveBook.id, liveBook.categorySlug, 3)
                .then((rel) => {
                  if (isMounted) setRelatedBooks(rel);
                })
                .catch(() => {});
            }
          } else if (!book) {
            setFetchError("لم يتم العثور على الكتاب المطلوب.");
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          if (!book) {
            setFetchError(err.message || "تعذر جلب تفاصيل الكتاب.");
          }
          setIsLoading(false);
        }
      }
    }

    loadBookData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-foreground-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-semibold">جاري تحميل بيانات المصنف والكتاب...</span>
      </div>
    );
  }

  if (!book && fetchError) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">الكتاب غير متاح</h2>
        <p className="text-xs text-foreground-muted leading-relaxed">
          {fetchError || "المصنف المطلوب غير موجود أو غير متاح ضمن نطاق محافظتك ومكتباتك المعتمدة."}
        </p>
        <Link href="/books">
          <Button variant="primary" size="sm" className="gap-2">
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            <span>العودة إلى فهرس الكتب</span>
          </Button>
        </Link>
      </div>
    );
  }

  if (!book) return null;

  const isBorrowingBlocked =
    profile?.borrowing_blocked || profile?.profile?.borrowing_blocked || user?.borrowing_blocked;

  const availableCopies = book.available_copies ?? 0;
  const totalCopies = book.total_copies ?? 0;

  const handleBorrowRequest = async () => {
    setBorrowErrorMsg("");
    setBorrowErrorCode("");
    setBorrowSuccessMsg("");

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (isBorrowingBlocked) {
      setBorrowErrorMsg(
        "حسابك محظور من الاستعارة حالياً وفق توجيهات إدارة المكتبة. يرجى مراجعة الإدارة المختصة."
      );
      setBorrowErrorCode("USER_BORROWING_BLOCKED");
      return;
    }

    try {
      setIsBorrowing(true);
      // Strictly calls POST /dashboard/books/{book_id}/borrow-requests/ with empty body
      const res = await borrowingService.createBorrowRequest(book.id);
      setBorrowSuccessMsg(
        res.message || "تم إرسال طلب الاستعارة بنجاح. يمكنك متابعة حالة الطلب في ملفك الشخصي."
      );
      setHasRequested(true);
    } catch (err) {
      setBorrowErrorMsg(
        err.message || "تعذر إرسال طلب الاستعارة. يرجى المحاولة مجدداً لاحقاً."
      );
      setBorrowErrorCode(err.code || "");
    } finally {
      setIsBorrowing(false);
    }
  };

  return (
    <div className="py-6 sm:py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: "الكتب والمطبوعات", href: "/books" },
          { label: book.category, href: `/books?category=${encodeURIComponent(book.category)}` },
          { label: book.title },
        ]}
      />

      {/* Main Book Presentation Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:p-10 shadow-subtle">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Book Cover & Quick CTAs (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative group mb-6">
              <BookCover
                title={book.title}
                author={book.author}
                category={book.category}
                coverTheme={book.coverTheme}
                size="xl"
                className="w-56 sm:w-64 h-80 sm:h-96"
              />
              <div className="absolute top-3 end-3 z-20">
                <FavoriteButton bookId={book.id} initialIsFavorite={book.isFavorite} size="md" />
              </div>
            </div>

            {/* CTAs */}
            <div className="w-full max-w-xs space-y-2.5">
              {/* Borrow Request Button (New Borrowing API contract) */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleBorrowRequest}
                isLoading={isBorrowing}
                disabled={isBorrowing || hasRequested}
                className={cn(
                  "w-full font-bold shadow-md gap-2",
                  hasRequested
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                    : "bg-primary hover:bg-primary-hover text-white"
                )}
              >
                {hasRequested ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span>تم إرسال طلب الاستعارة</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-5 h-5 text-secondary" />
                    <span>طلب استعارة ورقية</span>
                  </>
                )}
              </Button>

              {/* Availability Notice */}
              <div className="p-3 rounded-xl bg-surface-muted border border-border-subtle text-xs text-center space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">النسخ المتاحة بالمكتبة:</span>
                  <span
                    className={cn(
                      "font-bold px-2 py-0.5 rounded-md text-[11px]",
                      availableCopies > 0
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    )}
                  >
                    {formatArabicNumber(availableCopies)} متاحة
                    {totalCopies > 0 && ` من أصل ${formatArabicNumber(totalCopies)}`}
                  </span>
                </div>
                {availableCopies === 0 ? (
                  <p className="text-[11px] text-amber-700 leading-relaxed text-start">
                    جميع النسخ مستعارة حالياً. يمكنك تقديم طلب استعارة وسينتظر في قائمة المراجعة ريثما تتوفر نسخة بعد الإرجاع.
                  </p>
                ) : (
                  <p className="text-[11px] text-foreground-subtle leading-relaxed text-start">
                    المصنف متوفر للاستعارة والمطالعة المباشرة وفق سياسة المكتبة.
                  </p>
                )}
              </div>

              {/* Feedback messages */}
              {borrowSuccessMsg && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-start animate-in fade-in"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">نجحت العملية!</span>
                      <span>{borrowSuccessMsg}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-emerald-200/60">
                    <Link
                      href="/profile"
                      className="text-primary hover:underline font-bold inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>الانتقال لمتابعة حالة الطلب في ملفك الشخصي</span>
                      <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                    </Link>
                  </div>
                </div>
              )}

              {borrowErrorMsg && (
                <ErrorAlert
                  message={borrowErrorMsg}
                  code={borrowErrorCode}
                  onClose={() => setBorrowErrorMsg("")}
                />
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={() => setReadModalOpen(true)}
                className="w-full font-bold gap-2 border-primary/30 hover:border-primary text-primary"
              >
                <BookOpen className="w-4 h-4 text-secondary" />
                <span>قراءة إلكترونية مباشرة</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setDownloadModalOpen(true)}
                className="w-full gap-2 border-border hover:border-foreground-muted text-foreground-muted"
              >
                <Download className="w-4 h-4" />
                <span>تحميل المطبوع (PDF)</span>
              </Button>

              <div className="pt-2 flex items-center justify-between gap-2">
                <BookShareButton bookTitle={book.title} className="w-full" />
              </div>
            </div>

            {/* Governmental Verification Notice */}
            <div className="w-full max-w-xs mt-6 p-3 rounded-lg bg-primary-50/70 border border-primary-100 flex items-start gap-2.5 text-xs text-primary-900">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                نسخة محققة وموثقة ضمن قاعدة بيانات وزارة الأوقاف في الجمهورية العربية السورية.
              </p>
            </div>
          </div>

          {/* Right Column: Information, Metadata & Description (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Header / Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Link href={`/books?category=${encodeURIComponent(book.category)}`}>
                <Badge variant="primary" size="md">
                  {book.category}
                </Badge>
              </Link>
              {book.governorate_name && (
                <Badge variant="gold" size="md">
                  محافظة {book.governorate_name}
                </Badge>
              )}
              {book.library_name && (
                <Link href={book.library ? `/libraries/${book.library}` : "/libraries"}>
                  <Badge variant="secondary" size="md" className="gap-1 hover:border-primary">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{book.library_name}</span>
                  </Badge>
                </Link>
              )}
              {book.language && (
                <Badge variant="muted" size="md">
                  اللغة: {book.language}
                </Badge>
              )}
            </div>

            {/* Book Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-snug mb-2 font-arabic">
              {book.title}
            </h1>

            {/* Author */}
            <div className="text-base sm:text-lg text-primary font-semibold mb-4">
              تأليف: <span className="underline decoration-secondary/50 underline-offset-4">{book.author}</span>
            </div>

            {/* Rating Bar */}
            <div className="flex items-center gap-4 pb-4 mb-6 border-b border-border-subtle">
              <RatingStars rating={book.rating} reviewsCount={book.reviewsCount} size="sm" />
              <span className="text-xs text-foreground-subtle">|</span>
              <span className="text-xs text-foreground-muted flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-secondary" />
                <span>{formatArabicNumber(book.viewsCount)} تصفح</span>
              </span>
              <span className="text-xs text-foreground-subtle">|</span>
              <span className="text-xs text-foreground-muted flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-secondary" />
                <span>{formatArabicNumber(book.downloadsCount)} تنزيل</span>
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-muted border border-border-subtle mb-6 text-xs">
              <div>
                <span className="text-foreground-subtle block mb-0.5">المكتبة الحاضنة:</span>
                {book.library ? (
                  <Link
                    href={`/libraries/${book.library}`}
                    className="font-semibold text-primary hover:underline truncate block"
                  >
                    {book.library_name || "المكتبة المركزية"}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground truncate block">
                    {book.library_name || "وزارة الأوقاف"}
                  </span>
                )}
              </div>
              <div>
                <span className="text-foreground-subtle block mb-0.5">مكان الحفظ / الرف:</span>
                <span className="font-semibold text-foreground font-mono">
                  {book.possition || "القسم العام"}
                </span>
              </div>
              <div>
                <span className="text-foreground-subtle block mb-0.5">سنة النشر:</span>
                <span className="font-semibold text-foreground">{book.year}</span>
              </div>
              <div>
                <span className="text-foreground-subtle block mb-0.5">عدد الصفحات:</span>
                <span className="font-semibold text-foreground">{formatArabicNumber(book.pages)} صفحة</span>
              </div>
              <div>
                <span className="text-foreground-subtle block mb-0.5">الرقم المعياري (ISBN):</span>
                <span className="font-semibold text-foreground font-mono">{book.isbn || "غير متوفر"}</span>
              </div>
              <div>
                <span className="text-foreground-subtle block mb-0.5">المحافظة:</span>
                <span className="font-semibold text-foreground">{book.governorate_name || "المركز العام"}</span>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3 mb-8">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>نبذة تعريفية عن الكتاب</span>
              </h2>
              <p className="text-sm leading-relaxed text-foreground-muted text-justify">
                {book.description}
              </p>
            </div>

            {/* Table of Contents Preview */}
            {book.tableOfContents && book.tableOfContents.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-border-subtle">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  فهرس الأبواب والموضوعات الرئيسية
                </h3>
                <ul className="space-y-2">
                  {book.tableOfContents.map((chapter, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground-muted p-2 rounded-lg hover:bg-surface-muted transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-secondary-50 text-secondary-hover font-bold text-[11px] flex items-center justify-center shrink-0 border border-secondary/20">
                        {formatArabicNumber(idx + 1)}
                      </span>
                      <span>{chapter}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-secondary inline-block" />
              <span>كتب ومراجع ذات صلة</span>
            </h2>
            <Link
              href={`/books?category=${encodeURIComponent(book.category)}`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>المزيد في {book.category}</span>
              <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}

      {/* Reader Modal Simulation */}
      {readModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-dropdown text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">قارئ الكتب الرقمي</h3>
            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
              سيتم دمج القارئ التفاعلي المباشر (PDF / Interactive Viewer) المتصل بخوادم الأرشيف الرقمي لوزارة الأوقاف عند إتاحة التصفح الكامل.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button variant="primary" size="md" onClick={() => setReadModalOpen(false)}>
                حسناً، فهمت
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal Simulation */}
      {downloadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-secondary-50 text-secondary mx-auto flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">تحميل النسخة الرقمية</h3>
            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
              ملف الكتاب ({book.formatLabel}) محضر للتحميل ومحمي برخصة الاستخدام البحثي والطلابي غير التجاري.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button variant="primary" size="md" onClick={() => setDownloadModalOpen(false)}>
                إغلاق النافذة
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Prompt Modal for Borrow Request */}
      {authModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 sm:p-7 shadow-dropdown text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary border border-primary/20 mx-auto flex items-center justify-center">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-arabic">
              تسجيل الدخول مطلوب
            </h3>
            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
              لإتمام طلب استعارة هذا المصنف، يرجى تسجيل الدخول إلى حسابك المعتمد أو إنشاء حساب قارئ جديد.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
              <Link href={`/login?redirect=/books/${book.id}`} className="flex-1">
                <Button variant="primary" size="md" className="w-full font-bold">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="outline" size="md" className="w-full">
                  حساب جديد
                </Button>
              </Link>
            </div>
            <div className="pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAuthModalOpen(false)}
                className="text-foreground-subtle text-xs"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
