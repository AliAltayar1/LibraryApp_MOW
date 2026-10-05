"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Loader2,
  Search,
  RotateCw,
  BookmarkPlus,
  Layers,
  Sparkles,
  Inbox,
} from "lucide-react";
import { librariesService } from "@/services/librariesService";
import { booksService } from "@/services/booksService";
import { useAuth } from "@/hooks/useAuth";
import { Container } from "@/shared/Container";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Pagination } from "@/shared/Pagination";
import { BookCard } from "@/components/books/BookCard";
import { formatArabicNumber, cn } from "@/lib/utils";

export function LibraryDetailView({ libraryId }) {
  const { user, isAuthenticated } = useAuth();
  const requesterRole = user?.role?.code || "GUEST";
  const isStaff = ["MINISTRY_ADMIN", "GOVERNORATE_ADMIN", "LIBRARIAN", "SUPERUSER"].includes(
    requesterRole
  );

  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Library Books State (GET /dashboard/books/?library={libraryId}&page={page}&page_size=10)
  const [books, setBooks] = useState([]);
  const [booksCount, setBooksCount] = useState(0);
  const [booksPage, setBooksPage] = useState(1);
  const [booksTotalPages, setBooksTotalPages] = useState(1);
  const [isBooksLoading, setIsBooksLoading] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [booksError, setBooksError] = useState("");

  // Fetch Library Details
  useEffect(() => {
    async function loadLibrary() {
      setIsLoading(true);
      setErrorStatus(null);
      setErrorMessage("");

      try {
        const res = await librariesService.getLibraryById(libraryId);
        setLibrary(res.data);
      } catch (err) {
        setErrorStatus(err.status || 404);
        setErrorMessage(
          err.message ||
            "المكتبة المطلوبة غير موجودة أو غير متاحة ضمن نطاق الصلاحيات الحالي."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (libraryId) {
      loadLibrary();
    }
  }, [libraryId]);

  // Fetch Library Books
  const fetchLibraryBooks = useCallback(async () => {
    if (!libraryId) return;

    setIsBooksLoading(true);
    setBooksError("");

    try {
      const res = await booksService.getBooks({
        library: libraryId,
        query: bookSearch,
        isAvailable: availableOnly ? true : null,
        page: booksPage,
        pageSize: 10,
      });

      setBooks(res.results || []);
      setBooksCount(res.count || 0);
      setBooksTotalPages(res.totalPages || 1);
    } catch (err) {
      setBooksError(err.message || "تعذر جلب قائمة كتب المكتبة.");
    } finally {
      setIsBooksLoading(false);
    }
  }, [libraryId, bookSearch, availableOnly, booksPage]);

  useEffect(() => {
    if (library) {
      fetchLibraryBooks();
    }
  }, [library, fetchLibraryBooks]);

  return (
    <div className="py-8 sm:py-12 bg-background min-h-[calc(100vh-200px)]">
      <Container className="space-y-8 max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-foreground-subtle rtl:rotate-180" />
          <Link href="/libraries" className="hover:text-primary transition-colors">
            دليل المكتبات
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-foreground-subtle rtl:rotate-180" />
          <span className="text-foreground truncate max-w-[200px]">
            {library?.name || `مكتبة #${libraryId}`}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-foreground-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-semibold">
              جاري تحميل بيانات المكتبة...
            </span>
          </div>
        )}

        {/* Error / 404 State */}
        {!isLoading && errorStatus && (
          <Card className="p-8 sm:p-12 text-center border-border">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
              المكتبة غير متاحة
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted max-w-md mx-auto mb-6 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/libraries">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  <span>العودة إلى دليل المكتبات</span>
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/login">
                  <Button variant="primary" size="sm" className="text-xs">
                    <span>تسجيل الدخول للمنظومة</span>
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Loaded Content */}
        {!isLoading && library && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Main Header Card */}
            <Card className="p-6 sm:p-8 bg-surface border-border shadow-card relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-subtle shrink-0">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="gold" size="sm" className="font-bold">
                        محافظة {library.governorate_name || library.governorate}
                      </Badge>
                      {library.is_active ? (
                        <Badge variant="success" size="sm" className="font-bold gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                          <span>مفتوحة ومفعّلة للقراء</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm" className="font-bold">
                          غير مفعّلة
                        </Badge>
                      )}
                      <span className="text-[10px] font-mono text-foreground-subtle">
                        معرّف المكتبة #{library.id}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-foreground">
                      {library.name}
                    </h1>

                    {library.address && (
                      <p className="text-xs text-foreground-muted flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span>{library.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {isStaff && (
                  <Link href="/dashboard/libraries">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs whitespace-nowrap">
                      <span>إدارة المكتبة في اللوحة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border-subtle">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>معلومات التواصل والزيارة</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      رقم الهاتف المعتمد:
                    </span>
                    {library.phone ? (
                      <a
                        href={`tel:${library.phone}`}
                        className="font-mono text-primary font-bold hover:underline"
                        dir="ltr"
                      >
                        {library.phone}
                      </a>
                    ) : (
                      <span className="text-foreground-muted">غير محدد</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      البريد الإلكتروني:
                    </span>
                    {library.email ? (
                      <a
                        href={`mailto:${library.email}`}
                        className="text-primary font-semibold hover:underline"
                        dir="ltr"
                      >
                        {library.email}
                      </a>
                    ) : (
                      <span className="text-foreground-muted">غير محدد</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      العنوان الجغرافي:
                    </span>
                    <span className="text-foreground leading-relaxed">
                      {library.address || `محافظة ${library.governorate_name || library.governorate}`}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Administrative & Institutional Information */}
              <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border-subtle">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  <span>البيانات الإدارية والتوثيق</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      الجهة المشرفة:
                    </span>
                    <span className="text-foreground font-semibold">
                      وزارة الأوقاف — مديرية أوقاف {library.governorate_name || library.governorate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      حالة الاعتماد في المنظومة:
                    </span>
                    <span className="text-foreground font-semibold">
                      {library.is_active ? "معتمدة ونشطة في شبكة القراءة والخدمات" : "قيد الإجراء أو التحديث"}
                    </span>
                  </div>

                  {library.created_at && (
                    <div>
                      <span className="text-[11px] text-foreground-subtle block mb-0.5">
                        تاريخ التدشين الرقمي:
                      </span>
                      <span className="text-foreground font-mono" dir="ltr">
                        {new Date(library.created_at).toLocaleDateString("ar-SY")}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Books of this Library Section */}
            <div className="space-y-4 pt-4 border-t border-border-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-bold text-foreground font-arabic">
                      فهرس كتب ومخطوطات {library.name}
                    </h2>
                    <Badge variant="primary" size="sm" className="font-bold">
                      {formatArabicNumber(booksCount)} كتاب
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                    استعرض الكتب المتوفرة في هذه المكتبة وافتح تفاصيل الكتاب لتقديم طلب استعارة ورقية
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchLibraryBooks}
                  disabled={isBooksLoading}
                  className="gap-1.5 text-xs h-9 self-start sm:self-auto"
                >
                  <RotateCw className={cn("w-3.5 h-3.5", isBooksLoading && "animate-spin")} />
                  <span>تحديث الفهرس</span>
                </Button>
              </div>

              {/* Filter / Search Bar */}
              <div className="p-3.5 rounded-xl bg-surface border border-border shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    type="search"
                    placeholder="ابحث بالعنوان أو اسم المؤلف..."
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      setBooksPage(1);
                    }}
                    startIcon={Search}
                    className="text-xs h-9"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none text-foreground-muted hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => {
                      setAvailableOnly(e.target.checked);
                      setBooksPage(1);
                    }}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>عرض النسخ المتاحة للاستعارة فقط</span>
                </label>
              </div>

              {/* Books Content */}
              {isBooksLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-foreground-muted">
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                  <span className="text-xs font-semibold">جاري جلب كتب المكتبة...</span>
                </div>
              ) : booksError ? (
                <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs">
                  {booksError}
                </div>
              ) : books.length === 0 ? (
                <Card className="p-10 text-center border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center mx-auto mb-3">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">
                    لا توجد كتب مطابقة حالياً
                  </h3>
                  <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                    {bookSearch || availableOnly
                      ? "لم يتم العثور على كتب تطابق شروط التصفية الحالية. جرب إزالة الفلاتر."
                      : "لم يتم إدراج مصنفات بعد في هذه المكتبة أو لم تتم مزامنتها في قاعدة البيانات."}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map((b) => (
                    <Card
                      key={b.id}
                      className="p-4 bg-surface border-border hover:border-primary/40 hover:shadow-card transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="muted" size="sm" className="text-[10px]">
                            {b.category}
                          </Badge>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                              (b.available_copies ?? 0) > 0
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            )}
                          >
                            {(b.available_copies ?? 0) > 0
                              ? `${formatArabicNumber(b.available_copies)} نسخة متاحة`
                              : "غير متاح حالياً"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {b.title}
                          </h4>
                          <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1">
                            تأليف: {b.author}
                          </p>
                        </div>

                        {b.possition && (
                          <div className="text-[11px] text-foreground-subtle bg-surface-muted px-2 py-1 rounded border border-border-subtle inline-block">
                            مكان الحفظ / الرف: <span className="font-mono text-foreground font-semibold">{b.possition}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between">
                        <span className="text-[10px] text-foreground-subtle">
                          {b.publication_year ? `${b.publication_year} م` : "موثق"}
                        </span>
                        <Link href={`/books/${b.id}`}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs font-bold gap-1 h-8"
                          >
                            <span>تفاصيل وطلب استعارة</span>
                            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Books Pagination */}
              {!isBooksLoading && booksTotalPages > 1 && (
                <div className="pt-4 flex justify-center">
                  <Pagination
                    currentPage={booksPage}
                    totalPages={booksTotalPages}
                    onPageChange={(p) => setBooksPage(p)}
                  />
                </div>
              )}
            </div>

            {/* Back to Directory Button */}
            <div className="pt-2 flex justify-start">
              <Link href="/libraries">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  <span>العودة إلى دليل جميع المكتبات</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
