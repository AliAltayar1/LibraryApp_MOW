"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Feather,
} from "lucide-react";
import { authorsService } from "@/services/authorsService";
import { useAuth } from "@/context/AuthContext";
import { formatArabicNumber, cn } from "@/lib/utils";

export function DashboardAuthorsManager() {
  const { user } = useAuth();

  // Role Resolution
  const roleCode = user?.role?.code || (typeof user?.role === "string" ? user.role : "") || "";
  const isMinistryOrSuper = roleCode === "MINISTRY_ADMIN" || roleCode === "SUPERUSER";
  const isGovAdmin = roleCode === "GOVERNORATE_ADMIN";
  const isLibrarian = roleCode === "LIBRARIAN";
  const isReader = roleCode === "READER";
  const canManageAuthors = isMinistryOrSuper || isGovAdmin;

  // Data State
  const [authors, setAuthors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [authorToEdit, setAuthorToEdit] = useState(null);
  const [authorToDelete, setAuthorToDelete] = useState(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAuthors = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authorsService.getAuthors({
        search: searchQuery,
        page: currentPage,
        pageSize,
      });
      setAuthors(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      setErrorMessage(err.message || "تعذر جلب قائمة المؤلفين.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, pageSize]);

  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Open Create Modal
  const handleOpenAddModal = () => {
    setFormName("");
    setFormError("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (author) => {
    setAuthorToEdit(author);
    setFormName(author.name || "");
    setFormError("");
    setIsEditModalOpen(true);
  };

  // Submit Create Author
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const trimmed = formName.trim();
    if (!trimmed) {
      setFormError("اسم المؤلف مطلوب ولا يمكن تركه فارغاً.");
      return;
    }
    if (trimmed.length > 100) {
      setFormError("اسم المؤلف يجب ألا يتجاوز 100 حرف.");
      return;
    }

    try {
      setActionLoading(true);
      await authorsService.createAuthor({ name: trimmed });
      setIsAddModalOpen(false);
      showToast(`تم إنشاء المؤلف "${trimmed}" بنجاح.`);
      loadAuthors();
    } catch (err) {
      setFormError(err.message || "فشلت عملية إنشاء المؤلف.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Edit Author
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!authorToEdit) return;
    setFormError("");

    const trimmed = formName.trim();
    if (!trimmed) {
      setFormError("اسم المؤلف مطلوب ولا يمكن تركه فارغاً.");
      return;
    }
    if (trimmed.length > 100) {
      setFormError("اسم المؤلف يجب ألا يتجاوز 100 حرف.");
      return;
    }

    try {
      setActionLoading(true);
      await authorsService.updateAuthor(authorToEdit.id, { name: trimmed });
      setIsEditModalOpen(false);
      setAuthorToEdit(null);
      showToast(`تم تحديث اسم المؤلف إلى "${trimmed}" بنجاح.`);
      loadAuthors();
    } catch (err) {
      setFormError(err.message || "فشلت عملية تعديل المؤلف.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Delete Author
  const handleConfirmDelete = async () => {
    if (!authorToDelete) return;
    try {
      setActionLoading(true);
      await authorsService.deleteAuthor(authorToDelete.id);
      showToast(`تم حذف المؤلف "${authorToDelete.name}" بنجاح.`);
      setAuthorToDelete(null);
      loadAuthors();
    } catch (err) {
      alert(err.message || "لا يمكن حذف المؤلف لأنه مرتبط بكتب موجودة.");
      setAuthorToDelete(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-6 z-50 p-4 rounded-2xl bg-primary text-white shadow-card flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-secondary" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-bold text-foreground">
              فهرس المؤلفين والعلماء
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary border border-primary/20">
              بيانات عامة (Global)
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            إدارة وتوثيق أسماء المؤلفين والمحققين والباحثين المعتمدين في المكتبة الرقمية
          </p>
        </div>

        {canManageAuthors && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover shadow-subtle active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مؤلف جديد</span>
          </button>
        )}
      </div>

      {/* Notice for Librarians & Readers */}
      {(isLibrarian || isReader) && (
        <div className="bg-surface-muted border border-border rounded-2xl p-4 flex items-center gap-3 text-xs text-foreground-muted">
          <ShieldAlert className="w-4 h-4 text-secondary flex-shrink-0" />
          <span>
            {isLibrarian
              ? "بصفتك أمين مكتبة، يمكنك استعراض المؤلفين لاختيارهم أثناء فهرسة الكتب. إدارة وإضافة المؤلفين مقتصرة على مسؤولي المحافظات والوزارة."
              : "بصفتك قارئاً، تتاح قائمة المؤلفين للبحث وتصفية الكتب."}
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-subtle flex items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
          <input
            type="search"
            placeholder="البحث باسم المؤلف..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs rounded-xl border border-border bg-background ps-10 pe-4 py-2.5 text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-error flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Authors Grid */}
      <div className="bg-surface rounded-2xl border border-border shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            إجمالي المؤلفين:{" "}
            <span className="text-primary font-bold">{formatArabicNumber(totalCount)}</span> مؤلف
          </span>
          <span className="text-foreground-subtle text-[11px]">
            الصفحة {formatArabicNumber(currentPage)} من {formatArabicNumber(totalPages)}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-foreground-muted flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل قائمة المؤلفين...</span>
          </div>
        ) : authors.length === 0 ? (
          <div className="p-16 text-center">
            <Feather className="w-10 h-10 text-foreground-subtle mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-foreground">لا يوجد مؤلفون مطابقون</h4>
            <p className="text-xs text-foreground-muted mt-1">
              لم يتم العثور على أي مؤلفين يطابقون معايير البحث.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {authors.map((author) => (
              <div
                key={author.id}
                className="p-5 rounded-2xl bg-surface-muted/30 border border-border hover:border-primary/40 hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-hover border border-secondary/20 flex items-center justify-center font-bold">
                      <Feather className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-foreground-subtle bg-surface px-2 py-0.5 rounded-border border border-border">
                      ID: {author.id}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {author.name}
                  </h3>
                </div>

                <div className="pt-4 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                  <Link
                    href={`/dashboard/books?author=${encodeURIComponent(author.name)}`}
                    className="text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1 transition-colors text-[11px]"
                  >
                    <span>استعراض مصنفاته</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  {/* Actions (Hidden for Librarian / Reader) */}
                  {canManageAuthors && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(author)}
                        title="تعديل اسم المؤلف"
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthorToDelete(author)}
                        title="حذف المؤلف"
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-error hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border-subtle flex items-center justify-between text-xs">
            <span className="text-foreground-muted">
              الصفحة {formatArabicNumber(currentPage)} من {formatArabicNumber(totalPages)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== ADD AUTHOR MODAL ===================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                إضافة مؤلف أو محقق جديد
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  اسم المؤلف أو المحقق <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="مثال: غسان كنفاني"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
                <span className="text-[10px] text-foreground-subtle">الحد الأقصى 100 حرف.</span>
                {formError && <p className="text-error text-[11px] font-semibold">{formError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-surface-muted font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold shadow-subtle disabled:opacity-50"
                >
                  {actionLoading ? "جاري الحفظ..." : "حفظ المؤلف"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT AUTHOR MODAL ===================== */}
      {isEditModalOpen && authorToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                تعديل اسم المؤلف (معرف: {authorToEdit.id})
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  اسم المؤلف <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
                <span className="text-[10px] text-foreground-subtle">الحد الأقصى 100 حرف.</span>
                {formError && <p className="text-error text-[11px] font-semibold">{formError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-surface-muted font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-subtle disabled:opacity-50"
                >
                  {actionLoading ? "جاري الحفظ..." : "تحديث"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {authorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-50 text-error border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  تأكيد حذف المؤلف
                </h3>
                <p className="text-xs text-foreground-muted">فحص الارتباط بالكتب</p>
              </div>
            </div>

            <p className="text-xs text-foreground-muted leading-relaxed">
              هل أنت متأكد من رغبتك في حذف المؤلف{" "}
              <strong className="text-foreground">"{authorToDelete.name}"</strong>؟
            </p>

            <div className="p-3 bg-red-50/60 border border-red-200/60 rounded-xl text-[11px] text-red-800">
              ملاحظة أمان: إذا كان المؤلف مرتبطاً بأي كتاب في النظام، سيتم رفض الحذف تلقائياً بواسطة الخادم لحماية سلامة الفهرس.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAuthorToDelete(null)}
                className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-surface-muted font-medium text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-xs shadow-subtle disabled:opacity-50"
              >
                {actionLoading ? "جاري الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
