"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  Loader2,
  Eye,
  Edit3,
  Power,
  PowerOff,
  ShieldCheck,
  Building,
  Info,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { librariesService } from "@/services/librariesService";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Card, CardContent } from "@/ui/Card";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { Pagination } from "@/shared/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { formatArabicNumber, cn } from "@/lib/utils";

export function DashboardLibrariesManager() {
  const { user: currentUser } = useAuth();
  const requesterRole = currentUser?.role?.code || "READER";

  const isSuperOrMinistry =
    requesterRole === "MINISTRY_ADMIN" || requesterRole === "SUPERUSER";
  const isGovAdmin = requesterRole === "GOVERNORATE_ADMIN";
  const isLibrarian = requesterRole === "LIBRARIAN";
  const isReader = requesterRole === "READER";

  // Permission Flags
  const canCreate = isSuperOrMinistry || isGovAdmin;
  const canEdit = isSuperOrMinistry || isGovAdmin || isLibrarian;
  const canToggleStatus = isSuperOrMinistry || isGovAdmin;

  // Data & State
  const [libraries, setLibraries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [governoratesList, setGovernoratesList] = useState([]);

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);

  // Forms State
  const [createForm, setCreateForm] = useState({
    name: "",
    governorate: "",
    address: "",
    phone: "",
    email: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  // Action Loading & Errors
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createErrors, setCreateErrors] = useState(null);
  const [createErrorMessage, setCreateErrorMessage] = useState("");
  const [createErrorCode, setCreateErrorCode] = useState("");

  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState(null);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [editErrorCode, setEditErrorCode] = useState("");

  const [togglingId, setTogglingId] = useState(null);
  const [globalFeedback, setGlobalFeedback] = useState(null); // { type: 'success' | 'error', message, code }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Governorates list for Ministry / Superuser
  useEffect(() => {
    if (isSuperOrMinistry) {
      librariesService
        .getGovernorates()
        .then((data) => {
          setGovernoratesList(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    }
  }, [isSuperOrMinistry]);

  // Fetch Libraries from API
  const fetchLibraries = useCallback(async () => {
    if (isReader) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError("");

    try {
      const res = await librariesService.getLibraries({
        search: debouncedSearch,
        governorate:
          isSuperOrMinistry && selectedGovernorate !== "all"
            ? selectedGovernorate
            : null,
        isActive:
          selectedStatus === "all"
            ? null
            : selectedStatus === "active"
            ? true
            : false,
        page: currentPage,
        pageSize,
      });

      setLibraries(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      setFetchError(
        err.message || "تعذر جلب بيانات المكتبات من الخادم. يرجى إعادة المحاولة."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    isReader,
    debouncedSearch,
    isSuperOrMinistry,
    selectedGovernorate,
    selectedStatus,
    currentPage,
  ]);

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  // Auto clear global feedback after 5 seconds
  useEffect(() => {
    if (globalFeedback) {
      const timer = setTimeout(() => setGlobalFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [globalFeedback]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = totalCount;
    const activeInPage = libraries.filter((lib) => lib.is_active).length;
    const inactiveInPage = libraries.filter((lib) => !lib.is_active).length;
    const distinctGovs = new Set(libraries.map((lib) => lib.governorate)).size;
    return {
      total,
      activeInPage,
      inactiveInPage,
      distinctGovs,
    };
  }, [totalCount, libraries]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateForm({
      name: "",
      governorate: "",
      address: "",
      phone: "",
      email: "",
    });
    setCreateErrors(null);
    setCreateErrorMessage("");
    setCreateErrorCode("");
    setIsCreateOpen(true);
  };

  // Submit Create Library
  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setCreateErrors(null);
    setCreateErrorMessage("");
    setCreateErrorCode("");

    // Client-side quick check
    if (!createForm.name.trim()) {
      setCreateErrorMessage("يرجى إدخال اسم المكتبة.");
      return;
    }
    if (isSuperOrMinistry && !createForm.governorate) {
      setCreateErrorMessage("يرجى اختيار المحافظة التابعة لها المكتبة.");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const res = await librariesService.createLibrary({
        name: createForm.name,
        governorate: createForm.governorate,
        address: createForm.address,
        phone: createForm.phone,
        email: createForm.email,
        requesterRole,
      });

      setIsCreateOpen(false);
      setGlobalFeedback({
        type: "success",
        message: res.message || "تم إنشاء المكتبة وتفعيلها بنجاح.",
        code: res.code || "LIBRARY_CREATED",
      });
      fetchLibraries();
    } catch (err) {
      setCreateErrorMessage(
        err.message || "فشل إنشاء المكتبة. يرجى التحقق من البيانات المدخلة."
      );
      setCreateErrorCode(err.code || "VALIDATION_ERROR");
      setCreateErrors(err.errors || null);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (lib) => {
    setSelectedLibrary(lib);
    setEditForm({
      name: lib.name || "",
      address: lib.address || "",
      phone: lib.phone || "",
      email: lib.email || "",
    });
    setEditErrors(null);
    setEditErrorMessage("");
    setEditErrorCode("");
    setIsEditOpen(true);
  };

  // Submit Edit Library
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedLibrary) return;

    setEditErrors(null);
    setEditErrorMessage("");
    setEditErrorCode("");

    if (!editForm.name.trim()) {
      setEditErrorMessage("اسم المكتبة لا يمكن أن يكون فارغاً.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await librariesService.updateLibrary(selectedLibrary.id, {
        name: editForm.name,
        address: editForm.address,
        phone: editForm.phone,
        email: editForm.email,
      });

      setIsEditOpen(false);
      setGlobalFeedback({
        type: "success",
        message: res.message || "تم تحديث بيانات المكتبة بنجاح.",
        code: res.code || "LIBRARY_UPDATED",
      });

      // Update selected library if details modal is open
      if (selectedLibrary && isDetailsOpen) {
        setSelectedLibrary(res.data);
      }
      fetchLibraries();
    } catch (err) {
      setEditErrorMessage(
        err.message || "تعذر تحديث بيانات المكتبة. يرجى مراجعة الحقول."
      );
      setEditErrorCode(err.code || "VALIDATION_ERROR");
      setEditErrors(err.errors || null);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = async (lib) => {
    setSelectedLibrary(lib);
    setIsDetailsOpen(true);
    // Optionally re-fetch full fresh details from API
    try {
      const fresh = await librariesService.getLibraryById(lib.id);
      if (fresh?.data) {
        setSelectedLibrary(fresh.data);
      }
    } catch {
      // Keep existing
    }
  };

  // Toggle Library Active Status
  const handleToggleStatus = async (lib) => {
    if (!canToggleStatus) return;
    setTogglingId(lib.id);
    try {
      let res;
      if (lib.is_active) {
        res = await librariesService.deactivateLibrary(lib.id);
        setGlobalFeedback({
          type: "success",
          message: res.message || "تم إلغاء تفعيل المكتبة بنجاح.",
          code: res.code || "LIBRARY_DEACTIVATED",
        });
      } else {
        res = await librariesService.activateLibrary(lib.id);
        setGlobalFeedback({
          type: "success",
          message: res.message || "تم تفعيل المكتبة بنجاح.",
          code: res.code || "LIBRARY_ACTIVATED",
        });
      }

      // Update local state directly
      setLibraries((prev) =>
        prev.map((item) =>
          item.id === lib.id
            ? { ...item, is_active: !lib.is_active, updated_at: new Date().toISOString() }
            : item
        )
      );

      if (selectedLibrary?.id === lib.id) {
        setSelectedLibrary((prev) =>
          prev ? { ...prev, is_active: !lib.is_active } : null
        );
      }
    } catch (err) {
      setGlobalFeedback({
        type: "error",
        message: err.message || "تعذر تغيير حالة المكتبة.",
        code: err.code || "ACTION_FAILED",
      });
    } finally {
      setTogglingId(null);
    }
  };

  // If current user is a Reader, redirect/guide them
  if (isReader) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-4 shadow-subtle">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          دليل المكتبات والمراكز الوقفية
        </h2>
        <p className="text-sm text-foreground-muted mb-6 leading-relaxed">
          صفحة الإدارة مخصصة لمدراء المنظومة وأمناء المكتبات. بصفتك قارئاً مسجلاً،
          يمكنك استعراض المكتبات والمراكز التابعة لمحافظتك عبر الدليل العام الموحد.
        </p>
        <Link href="/libraries">
          <Button variant="primary" size="lg" className="gap-2">
            <span>استعراض مكتبات محافظتي</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-secondary tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              وزارة الأوقاف السورية
            </span>
            <span className="text-foreground-subtle text-xs">/</span>
            <span className="text-xs font-semibold text-foreground-muted">
              إدارة المنشآت
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            إدارة المكتبات والمراكز الثقافية الوقفية
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-0.5">
            {isLibrarian
              ? "بيانات وإعدادات المكتبة الوقفية المكلف بإدارتها"
              : isGovAdmin
              ? "إدارة المكتبات والمراكز التابعة لمحافظتك وتحديث بياناتها"
              : "السجل المركزي الموحد لجميع المكتبات والمراكز الوقفية بالجمهورية"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLibraries}
            disabled={isLoading}
            className="gap-1.5 h-9"
          >
            <RotateCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            <span className="text-xs font-semibold">تحديث</span>
          </Button>

          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="gap-1.5 h-9 shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold">إضافة مكتبة جديدة</span>
            </Button>
          )}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {globalFeedback && (
        <div
          className={cn(
            "p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2",
            globalFeedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-error/10 border-error/30 text-error"
          )}
        >
          <div className="flex items-center gap-2">
            {globalFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-error shrink-0" />
            )}
            <span className="font-semibold">{globalFeedback.message}</span>
            {globalFeedback.code && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 font-bold">
                {globalFeedback.code}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setGlobalFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Libraries */}
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground-muted">
              إجمالي النتائج
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {formatArabicNumber(stats.total)}
          </div>
          <div className="text-[10px] text-foreground-subtle mt-1 font-medium">
            ضمن نطاق الصلاحيات
          </div>
        </Card>

        {/* Active Libraries */}
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground-muted">
              مكتبات مفعّلة
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-green-700">
            {formatArabicNumber(stats.activeInPage)}
          </div>
          <div className="text-[10px] text-green-600 mt-1 font-medium">
            متاحة للقراء والباحثين
          </div>
        </Card>

        {/* Inactive Libraries */}
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground-muted">
              مكتبات معلّقة / متوقفة
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <PowerOff className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {formatArabicNumber(stats.inactiveInPage)}
          </div>
          <div className="text-[10px] text-amber-600 mt-1 font-medium">
            محجوبة عن القراء حالياً
          </div>
        </Card>

        {/* Scope Coverage */}
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground-muted">
              النطاق الجغرافي
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-50 text-secondary-hover flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-secondary-hover">
            {isGovAdmin
              ? currentUser?.governorate_name || "محافظتك"
              : isLibrarian
              ? "مكتبتك المعتمدة"
              : `${formatArabicNumber(governoratesList.length || 14)} محافظة`}
          </div>
          <div className="text-[10px] text-secondary font-medium mt-1 truncate">
            {currentUser?.role?.label || "صلاحية معتمدة"}
          </div>
        </Card>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="p-4 bg-surface border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="ابحث باسم المكتبة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={Search}
              className="text-xs h-10"
            />
          </div>

          {/* Governorate Filter (for Ministry / Superuser) */}
          {isSuperOrMinistry && (
            <div className="w-full md:w-56">
              <select
                value={selectedGovernorate}
                onChange={(e) => {
                  setSelectedGovernorate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs h-10 rounded-gov border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                aria-label="تصفية حسب المحافظة"
              >
                <option value="all">جميع المحافظات</option>
                {governoratesList.map((gov) => (
                  <option key={gov.id} value={gov.id}>
                    {gov.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs h-10 rounded-gov border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              aria-label="تصفية حسب حالة التفعيل"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">مفعّلة فقط</option>
              <option value="inactive">غير مفعّلة فقط</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery ||
            selectedGovernorate !== "all" ||
            selectedStatus !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedGovernorate("all");
                setSelectedStatus("all");
                setCurrentPage(1);
              }}
              className="text-xs text-foreground-muted hover:text-primary whitespace-nowrap h-10"
            >
              إعادة ضبط
            </Button>
          )}
        </div>
      </Card>

      {/* Fetch Error Display */}
      {fetchError && (
        <ErrorAlert
          message={fetchError}
          onClose={() => setFetchError("")}
        />
      )}

      {/* Libraries Table */}
      <Card className="border-border overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/60 text-foreground-muted font-bold">
                <th className="py-3 px-4 text-start">اسم المكتبة</th>
                <th className="py-3 px-4 text-start">المحافظة</th>
                <th className="py-3 px-4 text-start">الهاتف والتواصل</th>
                <th className="py-3 px-4 text-start">الحالة</th>
                <th className="py-3 px-4 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-surface">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-foreground-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs">جاري جلب بيانات المكتبات...</span>
                    </div>
                  </td>
                </tr>
              ) : libraries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-foreground-muted">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Building2 className="w-10 h-10 text-foreground-subtle/50" />
                      <p className="font-bold text-sm text-foreground">
                        لا توجد مكتبات مطابقة
                      </p>
                      <p className="text-xs text-foreground-subtle">
                        لم يتم العثور على مكتبات تطابق معايير البحث أو الفلترة المحددة.
                      </p>
                      {canCreate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenCreate}
                          className="mt-2 text-xs gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          إضافة مكتبة الآن
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                libraries.map((lib) => (
                  <tr
                    key={lib.id}
                    className="hover:bg-primary-50/30 transition-colors group"
                  >
                    {/* Library Name */}
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                            {lib.name}
                          </span>
                          {lib.address && (
                            <span className="text-[11px] text-foreground-muted flex items-center gap-1 font-normal mt-0.5">
                              <MapPin className="w-3 h-3 text-foreground-subtle shrink-0" />
                              <span className="truncate max-w-[200px] sm:max-w-xs">
                                {lib.address}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Governorate */}
                    <td className="py-3.5 px-4">
                      <Badge variant="gold" size="sm" className="font-bold">
                        {lib.governorate_name || `محافظة #${lib.governorate}`}
                      </Badge>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-xs text-foreground-muted">
                      <div className="space-y-0.5">
                        {lib.phone ? (
                          <div className="flex items-center gap-1 font-mono text-[11px] text-foreground font-medium">
                            <Phone className="w-3 h-3 text-secondary shrink-0" />
                            <span dir="ltr">{lib.phone}</span>
                          </div>
                        ) : (
                          <span className="text-foreground-subtle text-[11px]">
                            غير محدد
                          </span>
                        )}
                        {lib.email && (
                          <div className="flex items-center gap-1 text-[10px] text-foreground-subtle truncate max-w-[160px]">
                            <Mail className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate" dir="ltr">
                              {lib.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {lib.is_active ? (
                        <Badge
                          variant="success"
                          size="sm"
                          className="gap-1 font-bold bg-green-50 text-green-700 border-green-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                          <span>مفعّلة</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          size="sm"
                          className="gap-1 font-bold bg-slate-50 text-slate-600 border-slate-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>غير مفعّلة</span>
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDetails(lib)}
                          title="عرض التفاصيل الكاملة"
                          aria-label={`عرض تفاصيل ${lib.name}`}
                          className="text-foreground-muted hover:text-primary hover:bg-primary-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Edit */}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(lib)}
                            title="تعديل بيانات المكتبة"
                            aria-label={`تعديل ${lib.name}`}
                            className="text-foreground-muted hover:text-secondary-hover hover:bg-secondary-50 rounded-lg"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Toggle Status: Activate / Deactivate */}
                        {canToggleStatus && (
                          <Button
                            variant={lib.is_active ? "ghost" : "goldOutline"}
                            size="icon-sm"
                            disabled={togglingId === lib.id}
                            onClick={() => handleToggleStatus(lib)}
                            title={
                              lib.is_active
                                ? "إلغاء تفعيل المكتبة (حجبها عن القراء)"
                                : "تفعيل المكتبة (إتاحتها للقراء)"
                            }
                            aria-label={
                              lib.is_active
                                ? `إلغاء تفعيل ${lib.name}`
                                : `تفعيل ${lib.name}`
                            }
                            className={cn(
                              "rounded-lg transition-colors",
                              lib.is_active
                                ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                : "text-green-700 hover:bg-green-50"
                            )}
                          >
                            {togglingId === lib.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-current" />
                            ) : lib.is_active ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between">
            <span className="text-xs text-foreground-muted">
              عرض{" "}
              <strong className="text-foreground font-mono">
                {formatArabicNumber(libraries.length)}
              </strong>{" "}
              من أصل{" "}
              <strong className="text-foreground font-mono">
                {formatArabicNumber(totalCount)}
              </strong>{" "}
              مكتبة
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              className="my-0"
            />
          </div>
        )}
      </Card>

      {/* ============================================================== */}
      {/* CREATE LIBRARY MODAL                                           */}
      {/* ============================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border shadow-dropdown max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-subtle">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    إنشاء مكتبة وقفية جديدة
                  </h3>
                  <p className="text-[11px] text-foreground-muted">
                    تسجيل منشأة جديدة في شبكة الأوقاف الرقمية
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:bg-surface-muted"
                aria-label="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              {createErrorMessage && (
                <ErrorAlert
                  message={createErrorMessage}
                  code={createErrorCode}
                  errors={createErrors}
                  onClose={() => setCreateErrorMessage("")}
                />
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  اسم المكتبة <span className="text-error">*</span>
                </label>
                <Input
                  required
                  maxLength={150}
                  placeholder="مثال: مكتبة حمص المركزية، مكتبة دار الحديث..."
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="text-xs"
                />
                <div className="flex justify-between items-center text-[10px] text-foreground-subtle mt-1">
                  <span>إلزامي، بحد أقصى 150 حرفاً.</span>
                  <span>{createForm.name.length} / 150</span>
                </div>
              </div>

              {/* Governorate Selection */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  المحافظة <span className="text-error">*</span>
                </label>

                {isSuperOrMinistry ? (
                  <select
                    required
                    value={createForm.governorate}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        governorate: e.target.value,
                      })
                    }
                    className="w-full text-xs h-10 rounded-gov border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="">-- اختر المحافظة --</option>
                    {governoratesList.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {gov.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-surface-muted border border-border text-xs text-foreground flex items-center justify-between">
                    <span className="font-semibold">
                      {currentUser?.governorate_name || "محافظتك المعتمدة"}
                    </span>
                    <Badge variant="gold" size="sm">
                      تحديد تلقائي
                    </Badge>
                  </div>
                )}
                <p className="text-[10px] text-foreground-subtle mt-1">
                  {isSuperOrMinistry
                    ? "تحدد المحافظة التي تتبع لها هذه المكتبة ولا يمكن تعديلها لاحقاً."
                    : "يتم ربط المكتبة تلقائياً بنطاق محافظتك المسجلة في حسابك الإداري."}
                </p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  العنوان والتفاصيل المكانية
                </label>
                <Input
                  maxLength={255}
                  placeholder="مثال: حمص - مركز المدينة - جوار الجامع الكبير"
                  value={createForm.address}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, address: e.target.value })
                  }
                  className="text-xs"
                  startIcon={MapPin}
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    رقم الهاتف للتواصل
                  </label>
                  <Input
                    type="tel"
                    maxLength={30}
                    placeholder="مثال: 0991234567"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    className="text-xs font-mono"
                    startIcon={Phone}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    placeholder="library@example.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    className="text-xs"
                    startIcon={Mail}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-primary-50/60 border border-primary/20 text-[11px] text-primary flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>
                  ستكون المكتبة مفعّلة تلقائياً عند الإنشاء ومتاحة للقراء في
                  نطاق المحافظة المحددة.
                </span>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmittingCreate}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingCreate}
                  disabled={isSubmittingCreate}
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>تأكيد الإنشاء</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT LIBRARY MODAL                                             */}
      {/* ============================================================== */}
      {isEditOpen && selectedLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border shadow-dropdown max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary-50 text-secondary-hover border border-secondary/20 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    تعديل بيانات المكتبة
                  </h3>
                  <p className="text-[11px] text-foreground-muted">
                    {selectedLibrary.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:bg-surface-muted"
                aria-label="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              {editErrorMessage && (
                <ErrorAlert
                  message={editErrorMessage}
                  code={editErrorCode}
                  errors={editErrors}
                  onClose={() => setEditErrorMessage("")}
                />
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  اسم المكتبة <span className="text-error">*</span>
                </label>
                <Input
                  required
                  maxLength={150}
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="text-xs"
                />
              </div>

              {/* Governorate (Read-only as per contract) */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  المحافظة التابعة لها
                </label>
                <div className="p-3 rounded-xl bg-surface-muted border border-border text-xs text-foreground flex items-center justify-between">
                  <span className="font-semibold">
                    {selectedLibrary.governorate_name ||
                      `محافظة #${selectedLibrary.governorate}`}
                  </span>
                  <span className="text-[10px] text-foreground-subtle font-medium">
                    ثابتة وغير قابلة للتغيير
                  </span>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  العنوان
                </label>
                <Input
                  maxLength={255}
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="text-xs"
                  startIcon={MapPin}
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    رقم الهاتف
                  </label>
                  <Input
                    type="tel"
                    maxLength={30}
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="text-xs font-mono"
                    startIcon={Phone}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="text-xs"
                    startIcon={Mail}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmittingEdit}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingEdit}
                  disabled={isSubmittingEdit}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DETAILS MODAL                                                  */}
      {/* ============================================================== */}
      {isDetailsOpen && selectedLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-2xl border border-border shadow-dropdown max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary/20 text-primary flex items-center justify-center shadow-subtle">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    بطاقة تعريف المكتبة
                  </h3>
                  <span className="text-[10px] font-mono text-foreground-subtle">
                    معرف المنشأة: #{selectedLibrary.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:bg-surface-muted"
                aria-label="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Library Name & Status */}
              <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-surface-muted border border-border">
                <div>
                  <h4 className="text-base font-extrabold text-foreground">
                    {selectedLibrary.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted mt-1">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>
                      محافظة {selectedLibrary.governorate_name || selectedLibrary.governorate}
                    </span>
                  </div>
                </div>

                <div>
                  {selectedLibrary.is_active ? (
                    <Badge variant="success" size="sm" className="font-bold">
                      مفعّلة ونشطة
                    </Badge>
                  ) : (
                    <Badge variant="outline" size="sm" className="font-bold">
                      غير مفعّلة
                    </Badge>
                  )}
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border-subtle bg-surface">
                  <span className="text-[10px] text-foreground-subtle block mb-1">
                    العنوان والمقر
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedLibrary.address || "غير مسجل"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-border-subtle bg-surface">
                  <span className="text-[10px] text-foreground-subtle block mb-1">
                    رقم الهاتف
                  </span>
                  <span className="font-semibold font-mono text-foreground" dir="ltr">
                    {selectedLibrary.phone || "غير مسجل"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-border-subtle bg-surface sm:col-span-2">
                  <span className="text-[10px] text-foreground-subtle block mb-1">
                    البريد الإلكتروني المعتمد
                  </span>
                  <span className="font-semibold text-foreground" dir="ltr">
                    {selectedLibrary.email || "غير مسجل"}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="pt-2 border-t border-border-subtle text-[11px] text-foreground-subtle flex flex-wrap items-center justify-between gap-2">
                {selectedLibrary.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاريخ التسجيل:</span>
                    <span className="font-mono" dir="ltr">
                      {new Date(selectedLibrary.created_at).toLocaleDateString(
                        "ar-SY"
                      )}
                    </span>
                  </div>
                )}
                {selectedLibrary.updated_at && (
                  <div className="flex items-center gap-1">
                    <span>آخر تحديث:</span>
                    <span className="font-mono" dir="ltr">
                      {new Date(selectedLibrary.updated_at).toLocaleDateString(
                        "ar-SY"
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons in Details */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                {canToggleStatus && (
                  <Button
                    variant={selectedLibrary.is_active ? "ghost" : "goldOutline"}
                    size="sm"
                    disabled={togglingId === selectedLibrary.id}
                    onClick={() => handleToggleStatus(selectedLibrary)}
                    className="gap-1.5 text-xs"
                  >
                    {selectedLibrary.is_active ? (
                      <>
                        <PowerOff className="w-3.5 h-3.5 text-amber-600" />
                        <span>إلغاء التفعيل</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-3.5 h-3.5 text-green-600" />
                        <span>تفعيل المكتبة</span>
                      </>
                    )}
                  </Button>
                )}

                <div className="flex items-center gap-2 ms-auto">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleOpenEdit(selectedLibrary);
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل البيانات</span>
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsDetailsOpen(false)}
                    className="text-xs"
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
