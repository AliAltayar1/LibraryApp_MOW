"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Plus,
  RotateCcw,
  User,
  Building2,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  AlertOctagon,
  Calendar,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Badge } from "@/ui/Badge";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { useAuth } from "@/hooks/useAuth";
import {
  borrowingService,
  BORROW_STATUS,
  BORROW_STATUS_LABELS,
} from "@/services/borrowingService";
import { userManagementService } from "@/services/userManagementService";
import { dashboardBooksService } from "@/services/dashboardBooksService";
import { formatArabicNumber, cn } from "@/lib/utils";

export function DashboardBorrowsManager() {
  const { user } = useAuth();

  // List State
  const [borrows, setBorrows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Global Alerts
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [globalErrorCode, setGlobalErrorCode] = useState("");
  const [globalFieldErrors, setGlobalFieldErrors] = useState(null);

  // Action Loading
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Direct Borrow Modal State
  const [directBorrowModalOpen, setDirectBorrowModalOpen] = useState(false);
  const [directForm, setDirectForm] = useState({
    reader_id: "",
    book_id: "",
  });
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);
  const [directErrors, setDirectErrors] = useState({});

  // Reader Quick Search State in Modal
  const [readerSearchQuery, setReaderSearchQuery] = useState("");
  const [readerSearchResults, setReaderSearchResults] = useState([]);
  const [isSearchingReaders, setIsSearchingReaders] = useState(false);
  const [selectedReaderLabel, setSelectedReaderLabel] = useState("");

  // Book Quick Search State in Modal
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [bookSearchResults, setBookSearchResults] = useState([]);
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);
  const [selectedBookLabel, setSelectedBookLabel] = useState("");

  // Fetch Borrows (strictly GET /dashboard/borrows/)
  const fetchBorrowsList = useCallback(async () => {
    try {
      setIsLoading(true);
      setGlobalError("");
      setGlobalErrorCode("");
      setGlobalFieldErrors(null);

      const params = {
        page: currentPage,
        pageSize: pageSize,
      };

      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const res = await borrowingService.getBorrows(params);
      setBorrows(res.results || []);
      setTotalCount(res.count || (res.results ? res.results.length : 0));
    } catch (err) {
      setGlobalError(err.message || "تعذر تحميل سجل الاستعارات من الخادم.");
      setGlobalErrorCode(err.code || "");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter]);

  useEffect(() => {
    fetchBorrowsList();
  }, [fetchBorrowsList]);

  // Handle Book Return (POST /dashboard/borrows/{borrow_id}/return/)
  const handleReturn = async (borrowItem) => {
    try {
      setActionLoadingId(borrowItem.id);
      setGlobalSuccess("");
      setGlobalError("");
      setGlobalErrorCode("");
      setGlobalFieldErrors(null);

      const res = await borrowingService.returnBorrow(borrowItem.id);
      setGlobalSuccess(
        res.message || `تم تسجيل إرجاع الكتاب #${borrowItem.book_id || borrowItem.id} بنجاح.`
      );
      fetchBorrowsList();
    } catch (err) {
      setGlobalError(err.message || "فشل تسجيل إرجاع الكتاب.");
      setGlobalErrorCode(err.code || "");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reader Search Handler
  const handleReaderSearch = async (query) => {
    setReaderSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setReaderSearchResults([]);
      return;
    }

    try {
      setIsSearchingReaders(true);
      const res = await userManagementService.searchReaders({ q: query.trim() });
      setReaderSearchResults(res.results || []);
    } catch {
      setReaderSearchResults([]);
    } finally {
      setIsSearchingReaders(false);
    }
  };

  // Book Search Handler
  const handleBookSearch = async (query) => {
    setBookSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setBookSearchResults([]);
      return;
    }

    try {
      setIsSearchingBooks(true);
      const res = await dashboardBooksService.getBooks({ author: query.trim(), pageSize: 10 });
      setBookSearchResults(res.results || []);
    } catch {
      setBookSearchResults([]);
    } finally {
      setIsSearchingBooks(false);
    }
  };

  // Handle Direct Borrow Submit (POST /dashboard/borrows/)
  const handleDirectBorrowSubmit = async (e) => {
    e.preventDefault();
    setDirectErrors({});
    setGlobalError("");

    const errors = {};
    if (!directForm.reader_id || !String(directForm.reader_id).trim()) {
      errors.reader_id = "يرجى اختيار القارئ أو إدخال معرّفه (reader_id).";
    }
    if (!directForm.book_id || isNaN(Number(directForm.book_id))) {
      errors.book_id = "يرجى اختيار الكتاب أو إدخال رقم المعرف (book_id).";
    }

    if (Object.keys(errors).length > 0) {
      setDirectErrors(errors);
      return;
    }

    try {
      setIsSubmittingDirect(true);
      // Strictly pass reader_id and book_id
      const res = await borrowingService.createDirectBorrow({
        reader_id: String(directForm.reader_id).trim(),
        book_id: parseInt(directForm.book_id, 10),
      });

      setGlobalSuccess(
        res.message || "تم تسجيل الاستعارة المباشرة بنجاح."
      );
      setDirectBorrowModalOpen(false);
      setDirectForm({ reader_id: "", book_id: "" });
      setSelectedReaderLabel("");
      setSelectedBookLabel("");
      fetchBorrowsList();
    } catch (err) {
      if (err.errors && typeof err.errors === "object") {
        setDirectErrors(err.errors);
      }
      setGlobalError(
        err.message || "تعذر إتمام الاستعارة المباشرة، يرجى مراجعة البيانات."
      );
      setGlobalErrorCode(err.code || "");
    } finally {
      setIsSubmittingDirect(false);
    }
  };

  // Filter in-memory for fast search
  const filteredBorrows = borrows.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const bookTitle = (b.book_title || b.book?.title || "").toLowerCase();
    const readerName = (
      b.reader_name ||
      b.reader?.username ||
      b.reader?.first_name ||
      ""
    ).toLowerCase();
    return bookTitle.includes(q) || readerName.includes(q) || String(b.id).includes(q);
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Check if current user role can perform Direct Borrow
  const userRoleCode = user?.role?.code || user?.role;
  const canDirectBorrow =
    userRoleCode === "LIBRARIAN" ||
    userRoleCode === "GOVERNORATE_ADMIN" ||
    userRoleCode === "MINISTRY_ADMIN" ||
    userRoleCode === "SUPERUSER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-secondary-50 text-secondary-hover border border-secondary/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-arabic">
              إدارة وسجل الاستعارات
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
            متابعة إعارة واسترجاع الكتب الورقية، وتسجيل الاستعارة المباشرة للقراء المؤهلين
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBorrowsList}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            <span>تحديث</span>
          </Button>

          {canDirectBorrow && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDirectBorrowModalOpen(true);
                setDirectErrors({});
                setGlobalError("");
              }}
              className="text-xs gap-1.5 font-bold shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل استعارة مباشرة</span>
            </Button>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {globalSuccess && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{globalSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalSuccess("")}
            className="text-success hover:underline text-xs"
          >
            إغلاق
          </button>
        </div>
      )}

      {globalError && (
        <ErrorAlert
          message={globalError}
          code={globalErrorCode}
          errors={globalFieldErrors}
          onClose={() => setGlobalError("")}
        />
      )}

      {/* Filter Tabs & Search */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-surface-muted p-1 rounded-xl border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all",
                statusFilter === "ALL"
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter(BORROW_STATUS.ACTIVE);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5",
                statusFilter === BORROW_STATUS.ACTIVE
                  ? "bg-blue-600 text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>قيد الاستعارة</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter(BORROW_STATUS.RETURNED);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5",
                statusFilter === BORROW_STATUS.RETURNED
                  ? "bg-emerald-600 text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>معادة</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72">
            <Input
              type="text"
              placeholder="بحث باسم الكتاب أو القارئ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={Search}
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Borrows Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-surface-muted animate-pulse" />
            ))}
          </div>
        ) : filteredBorrows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60 text-foreground-muted font-bold">
                  <th className="py-3 px-4 text-start">رقم الاستعارة</th>
                  <th className="py-3 px-4 text-start">الكتاب المستعار</th>
                  <th className="py-3 px-4 text-start">القارئ المستعير</th>
                  <th className="py-3 px-4 text-start">المكتبة</th>
                  <th className="py-3 px-4 text-start">تاريخ الاستعارة</th>
                  <th className="py-3 px-4 text-start">تاريخ الإرجاع</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-end">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredBorrows.map((b) => {
                  const bookTitle =
                    b.book_title || b.book?.title || `كتاب #${b.book || b.book_id}`;
                  const readerLabel =
                    b.reader_name ||
                    (b.reader?.first_name
                      ? `${b.reader.first_name} ${b.reader.last_name || ""}`
                      : b.reader?.username || b.reader_username || `قارئ #${b.reader_id || b.reader}`);

                  const isActive = b.status === BORROW_STATUS.ACTIVE;
                  const isReturned = b.status === BORROW_STATUS.RETURNED;

                  const statusMeta =
                    BORROW_STATUS_LABELS[b.status] || {
                      label: b.status,
                      bgClass: "bg-surface-muted text-foreground border-border",
                    };

                  const borrowDate = b.borrowed_at || b.created_at
                    ? new Date(b.borrowed_at || b.created_at).toLocaleDateString("ar-SY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  const returnDate = b.returned_at
                    ? new Date(b.returned_at).toLocaleDateString("ar-SY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : b.due_date
                    ? `مستحق: ${new Date(b.due_date).toLocaleDateString("ar-SY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}`
                    : "—";

                  const isCurrentActionLoading = actionLoadingId === b.id;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-surface-muted/50 transition-colors"
                    >
                      {/* Borrow ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        #{b.id}
                      </td>

                      {/* Book Details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-foreground truncate" title={bookTitle}>
                          {bookTitle}
                        </div>
                        {(b.book || b.book_id) && (
                          <div className="text-[11px] text-foreground-subtle flex items-center gap-1.5 mt-0.5">
                            <span>معرّف الكتاب: {b.book_id || b.book}</span>
                            <Link
                              href={`/books/${b.book_id || b.book}`}
                              target="_blank"
                              className="text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>معاينة</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        )}
                      </td>

                      {/* Reader Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">{readerLabel}</span>
                        </div>
                        {b.reader?.username && (
                          <span className="text-[10px] text-foreground-muted block font-mono">
                            @{b.reader.username}
                          </span>
                        )}
                      </td>

                      {/* Library */}
                      <td className="py-3.5 px-4 text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-foreground-subtle" />
                          <span>{b.library_name || "المكتبة التابعة"}</span>
                        </div>
                        {b.governorate_name && (
                          <div className="flex items-center gap-1 text-[11px] text-foreground-subtle mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{b.governorate_name}</span>
                          </div>
                        )}
                      </td>

                      {/* Borrow Date */}
                      <td className="py-3.5 px-4 text-foreground-muted whitespace-nowrap">
                        {borrowDate}
                      </td>

                      {/* Return Date / Due Date */}
                      <td className="py-3.5 px-4 text-foreground-muted whitespace-nowrap">
                        {returnDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block",
                            statusMeta.bgClass
                          )}
                        >
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end whitespace-nowrap">
                        {isActive ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReturn(b)}
                            isLoading={isCurrentActionLoading}
                            disabled={isCurrentActionLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold gap-1 px-2.5 py-1"
                            title="تسجيل إرجاع الكتاب المستعار إلى المكتبة"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>تسجيل إرجاع</span>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-foreground-subtle font-medium px-2 py-1 bg-surface-muted rounded">
                            معاد للمكتبة
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <BookmarkCheck className="w-12 h-12 text-foreground-subtle/40 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                لا توجد سجلات استعارة مطابقة
              </p>
              <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                {statusFilter !== "ALL"
                  ? `لا توجد استعارات بالحالة (${BORROW_STATUS_LABELS[statusFilter]?.label || statusFilter}).`
                  : "لم يتم تسجيل أي استعارات ضمن نطاقك الإداري حتى الآن."}
              </p>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
            <div>
              إجمالي السجلات: <span className="font-bold text-foreground">{formatArabicNumber(totalCount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="gap-1 text-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </Button>
              <span className="font-bold text-foreground">
                {formatArabicNumber(currentPage)} من {formatArabicNumber(totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="gap-1 text-xs"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Direct Borrow Modal */}
      {directBorrowModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center border border-primary/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground font-arabic">
                    تسجيل استعارة مباشرة (الإدارة)
                  </h3>
                  <p className="text-[11px] text-foreground-muted">
                    وفق الـAPI Contract الجديد: reader_id و book_id
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDirectBorrowModalOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:bg-surface-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectBorrowSubmit} className="space-y-4">
              {/* Field 1: Reader Selection / Input */}
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  القارئ المستعير (reader_id) *
                </label>
                <div className="space-y-1.5">
                  <Input
                    type="text"
                    placeholder="ابحث باسم المستخدم أو البريد، أو أدخل المعرف (UUID)..."
                    value={readerSearchQuery || directForm.reader_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDirectForm({ ...directForm, reader_id: val });
                      handleReaderSearch(val);
                    }}
                    startIcon={User}
                    error={!!directErrors.reader_id}
                  />

                  {/* Reader Search Results dropdown */}
                  {readerSearchResults.length > 0 && (
                    <div className="max-h-36 overflow-y-auto rounded-xl border border-border bg-background p-1 space-y-0.5 text-xs">
                      {readerSearchResults.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setDirectForm({ ...directForm, reader_id: String(r.id) });
                            setSelectedReaderLabel(`${r.first_name || ""} ${r.last_name || ""} (@${r.username})`);
                            setReaderSearchResults([]);
                            setReaderSearchQuery(r.username);
                          }}
                          className="w-full text-start p-2 rounded-lg hover:bg-surface-muted flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-foreground">
                              {r.first_name} {r.last_name}
                            </span>
                            <span className="text-foreground-muted font-mono ms-1.5">
                              @{r.username}
                            </span>
                          </div>
                          <span className="text-[10px] text-foreground-subtle font-mono">
                            ID: {r.id}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedReaderLabel && (
                    <div className="p-2 rounded-lg bg-primary-50/60 border border-primary/20 text-primary text-xs flex items-center justify-between">
                      <span>القارئ المحدد: {selectedReaderLabel}</span>
                      <span className="font-mono text-[10px]">ID: {directForm.reader_id}</span>
                    </div>
                  )}

                  {directErrors.reader_id && (
                    <p className="text-error text-[11px] font-semibold">
                      {Array.isArray(directErrors.reader_id) ? directErrors.reader_id.join("، ") : directErrors.reader_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Field 2: Book Selection / Input */}
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  الكتاب المطلوب (book_id) *
                </label>
                <div className="space-y-1.5">
                  <Input
                    type="number"
                    min="1"
                    placeholder="أدخل رقم معرّف الكتاب (book_id) أو ابحث بالعنوان..."
                    value={directForm.book_id}
                    onChange={(e) => {
                      setDirectForm({ ...directForm, book_id: e.target.value });
                    }}
                    startIcon={BookOpen}
                    error={!!directErrors.book_id}
                  />

                  {directErrors.book_id && (
                    <p className="text-error text-[11px] font-semibold">
                      {Array.isArray(directErrors.book_id) ? directErrors.book_id.join("، ") : directErrors.book_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-surface-muted border border-border-subtle text-[11px] text-foreground-muted space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                  <span>ضوابط الاستعارة المباشرة:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-foreground-subtle">
                  <li>يشترط توفر نسخة مطبوعة واحدة على الأقل في المكتبة (available_copies &gt; 0).</li>
                  <li>يشترط ألا يكون القارئ محظوراً من الاستعارة (borrowing_blocked = false).</li>
                  <li>يمنع النظام وجود استعارة نشطة مكررة لنفس القارئ والكتاب.</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDirectBorrowModalOpen(false)}
                  disabled={isSubmittingDirect}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingDirect}
                  disabled={isSubmittingDirect}
                  className="font-bold"
                >
                  تأكيد الاستعارة
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
