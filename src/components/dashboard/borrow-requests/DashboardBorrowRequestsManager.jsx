"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
  Building2,
  MapPin,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Badge } from "@/ui/Badge";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { useAuth } from "@/hooks/useAuth";
import {
  borrowingService,
  BORROW_REQUEST_STATUS,
  BORROW_REQUEST_STATUS_LABELS,
} from "@/services/borrowingService";
import { formatArabicNumber, cn } from "@/lib/utils";

export function DashboardBorrowRequestsManager() {
  const { user } = useAuth();

  // List State
  const [requests, setRequests] = useState([]);
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

  // Action Loading states
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);

  // Fetch Requests strictly adhering to GET /dashboard/borrow-requests/
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setGlobalError("");
      setGlobalErrorCode("");

      const params = {
        page: currentPage,
        pageSize: pageSize,
      };

      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const res = await borrowingService.getBorrowRequests(params);
      setRequests(res.results || []);
      setTotalCount(res.count || (res.results ? res.results.length : 0));
    } catch (err) {
      setGlobalError(err.message || "تعذر تحميل طلبات الاستعارة من الخادم.");
      setGlobalErrorCode(err.code || "");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle Approve (POST /dashboard/borrow-requests/{id}/approve/)
  const handleApprove = async (reqItem) => {
    try {
      setActionLoadingId(reqItem.id);
      setGlobalSuccess("");
      setGlobalError("");
      setGlobalErrorCode("");

      const res = await borrowingService.approveBorrowRequest(reqItem.id);
      setGlobalSuccess(
        res.message || `تمت الموافقة على طلب استعارة الكتاب بنجاح.`
      );
      fetchRequests();
    } catch (err) {
      setGlobalError(
        err.message || "فشلت الموافقة على طلب الاستعارة، تأكد من توفر نسخ متاحة وحالة القارئ."
      );
      setGlobalErrorCode(err.code || "");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  // Handle Reject Submit (POST /dashboard/borrow-requests/{id}/reject/)
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setIsRejecting(true);
      setGlobalSuccess("");
      setGlobalError("");
      setGlobalErrorCode("");

      const res = await borrowingService.rejectBorrowRequest(
        selectedRequest.id,
        rejectReason
      );

      setGlobalSuccess(res.message || "تم رفض طلب الاستعارة بنجاح.");
      setRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectReason("");
      fetchRequests();
    } catch (err) {
      setGlobalError(err.message || "تعذر رفض طلب الاستعارة.");
      setGlobalErrorCode(err.code || "");
    } finally {
      setIsRejecting(false);
    }
  };

  // Filter in-memory by search query (book title or reader name)
  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const bookTitle = (r.book_title || r.book?.title || "").toLowerCase();
    const readerName = (r.reader_name || r.reader?.username || r.reader?.first_name || "").toLowerCase();
    return bookTitle.includes(q) || readerName.includes(q) || String(r.id).includes(q);
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-50 text-primary border border-primary/20">
              <Inbox className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-arabic">
              إدارة طلبات الاستعارة
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
            متابعة واعتماد طلبات الاستعارة المقدمة من القراء وفق النطاق الإداري والصلاحيات المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            <span>تحديث البيانات</span>
          </Button>

          <Link href="/dashboard/borrows">
            <Button variant="primary" size="sm" className="text-xs gap-1.5 font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>سجل الاستعارات الجارية</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Notifications */}
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
          onClose={() => setGlobalError("")}
        />
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Buttons */}
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
                setStatusFilter(BORROW_REQUEST_STATUS.PENDING);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5",
                statusFilter === BORROW_REQUEST_STATUS.PENDING
                  ? "bg-amber-600 text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>قيد المراجعة</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter(BORROW_REQUEST_STATUS.APPROVED);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5",
                statusFilter === BORROW_REQUEST_STATUS.APPROVED
                  ? "bg-emerald-600 text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تمت الموافقة</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter(BORROW_REQUEST_STATUS.REJECTED);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5",
                statusFilter === BORROW_REQUEST_STATUS.REJECTED
                  ? "bg-red-600 text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>مرفوضة</span>
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

      {/* Requests Table / Cards */}
      <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-surface-muted animate-pulse" />
            ))}
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60 text-foreground-muted font-bold">
                  <th className="py-3 px-4 text-start">رقم الطلب</th>
                  <th className="py-3 px-4 text-start">الكتاب والمصنف</th>
                  <th className="py-3 px-4 text-start">القارئ المستفيد</th>
                  <th className="py-3 px-4 text-start">المكتبة / المحافظة</th>
                  <th className="py-3 px-4 text-start">تاريخ الطلب</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-end">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredRequests.map((reqItem) => {
                  const bookTitle =
                    reqItem.book_title || reqItem.book?.title || `كتاب #${reqItem.book || reqItem.book_id}`;
                  const readerLabel =
                    reqItem.reader_name ||
                    (reqItem.reader?.first_name
                      ? `${reqItem.reader.first_name} ${reqItem.reader.last_name || ""}`
                      : reqItem.reader?.username || reqItem.reader_username || `قارئ #${reqItem.reader_id || reqItem.reader}`);

                  const isPending = reqItem.status === BORROW_REQUEST_STATUS.PENDING;
                  const isApproved = reqItem.status === BORROW_REQUEST_STATUS.APPROVED;
                  const isRejected = reqItem.status === BORROW_REQUEST_STATUS.REJECTED;

                  const statusMeta =
                    BORROW_REQUEST_STATUS_LABELS[reqItem.status] || {
                      label: reqItem.status,
                      bgClass: "bg-surface-muted text-foreground border-border",
                    };

                  const formattedDate = reqItem.created_at
                    ? new Date(reqItem.created_at).toLocaleDateString("ar-SY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  const isCurrentActionLoading = actionLoadingId === reqItem.id;

                  return (
                    <tr
                      key={reqItem.id}
                      className="hover:bg-surface-muted/50 transition-colors"
                    >
                      {/* Request ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        #{reqItem.id}
                      </td>

                      {/* Book Details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-foreground truncate" title={bookTitle}>
                          {bookTitle}
                        </div>
                        {(reqItem.book || reqItem.book_id) && (
                          <div className="text-[11px] text-foreground-subtle flex items-center gap-1.5 mt-0.5">
                            <span>معرّف الكتاب: {reqItem.book_id || reqItem.book}</span>
                            <Link
                              href={`/books/${reqItem.book_id || reqItem.book}`}
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
                        {reqItem.reader?.email && (
                          <span className="text-[10px] text-foreground-muted block truncate font-mono">
                            {reqItem.reader.email}
                          </span>
                        )}
                      </td>

                      {/* Library / Governorate */}
                      <td className="py-3.5 px-4 text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-foreground-subtle" />
                          <span>{reqItem.library_name || "المكتبة التابعة"}</span>
                        </div>
                        {reqItem.governorate_name && (
                          <div className="flex items-center gap-1 text-[11px] text-foreground-subtle mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{reqItem.governorate_name}</span>
                          </div>
                        )}
                      </td>

                      {/* Request Date */}
                      <td className="py-3.5 px-4 text-foreground-muted whitespace-nowrap">
                        {formattedDate}
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
                        {isRejected && (reqItem.reason || reqItem.rejection_reason) && (
                          <span
                            className="block text-[10px] text-error mt-1 truncate max-w-[140px] mx-auto cursor-help"
                            title={reqItem.reason || reqItem.rejection_reason}
                          >
                            السبب: {reqItem.reason || reqItem.rejection_reason}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {isPending ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleApprove(reqItem)}
                                isLoading={isCurrentActionLoading}
                                disabled={isCurrentActionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold gap-1 px-2.5 py-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>قبول</span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRejectModal(reqItem)}
                                disabled={isCurrentActionLoading}
                                className="border-red-200 text-error hover:bg-red-50 text-[11px] font-bold gap-1 px-2.5 py-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>رفض</span>
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-foreground-subtle font-medium px-2 py-1 bg-surface-muted rounded">
                              تمت المعالجة
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Inbox className="w-12 h-12 text-foreground-subtle/40 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                لا توجد طلبات استعارة مطابقة
              </p>
              <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                {statusFilter !== "ALL"
                  ? `لا توجد طلبات بالحالة (${BORROW_REQUEST_STATUS_LABELS[statusFilter]?.label || statusFilter}).`
                  : "لم يتم تسجيل أي طلبات استعارة ضمن نطاق صلاحياتك الحالية."}
              </p>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
            <div>
              إجمالي الطلبات: <span className="font-bold text-foreground">{formatArabicNumber(totalCount)}</span>
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

      {/* Reject Request Modal */}
      {rejectModalOpen && selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown space-y-4">
            <div className="flex items-center gap-2.5 text-error">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-error flex items-center justify-center border border-red-200">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground font-arabic">
                  رفض طلب الاستعارة
                </h3>
                <p className="text-xs text-foreground-muted">
                  الطلب #{selectedRequest.id} — {selectedRequest.book_title || "الكتاب المطلوب"}
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  سبب الرفض (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="مثال: تجاوز الحد الأقصى للاستعارات أو وجود متأخرات..."
                  className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-foreground-subtle">
                  سيتمكن القارئ من الاطلاع على سبب الرفض عبر ملفه الشخصي.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={isRejecting}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isRejecting}
                  disabled={isRejecting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  تأكيد الرفض
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
