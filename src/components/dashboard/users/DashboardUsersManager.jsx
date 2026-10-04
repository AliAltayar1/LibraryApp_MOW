"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  Mail,
  Building,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserX,
  UserCheck,
  Ban,
  Unlock,
  RotateCw,
  Phone,
  MapPin,
  Calendar,
  X,
  Loader2,
  BookOpen,
  UserCheck2,
  BookmarkCheck,
} from "lucide-react";
import { userManagementService } from "@/services/userManagementService";
import { authService } from "@/services/authService";
import { librariesService } from "@/services/librariesService";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { useAuth } from "@/hooks/useAuth";
import { formatArabicNumber, cn } from "@/lib/utils";

export function DashboardUsersManager() {
  const { user: currentUser } = useAuth();
  const requesterRole = currentUser?.role?.code || "READER";

  const isLibrarian = requesterRole === "LIBRARIAN";
  const isGeneralAdmin = ["MINISTRY_ADMIN", "GOVERNORATE_ADMIN", "SUPERUSER"].includes(
    requesterRole
  );

  // Active view tab: 'general' for admins, 'reader-search' for librarian
  const [activeTab, setActiveTab] = useState(isLibrarian ? "reader-search" : "general");

  // General Users State
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [searchNameQuery, setSearchNameQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Reader Search State
  const [readerQuery, setReaderQuery] = useState("");
  const [readerResults, setReaderResults] = useState([]);
  const [readerTotalCount, setReaderTotalCount] = useState(0);
  const [isSearchingReaders, setIsSearchingReaders] = useState(false);
  const [readerSearchError, setReaderSearchError] = useState("");
  const [selectedReader, setSelectedReader] = useState(null);

  // Governorates and Libraries for Admin Creation
  const [governorates, setGovernorates] = useState([]);
  const [availableLibraries, setAvailableLibraries] = useState([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createModalError, setCreateModalError] = useState("");
  const [createModalCode, setCreateModalCode] = useState("");
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetModalError, setResetModalError] = useState("");
  const [resetModalCode, setResetModalCode] = useState("");
  const [selectedUserForAction, setSelectedUserForAction] = useState(null);

  // Create User Form State
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    role: isLibrarian ? "READER" : "READER",
    library: "",
    governorate: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createFieldErrors, setCreateFieldErrors] = useState({});

  // Reset Password Form State
  const [resetPasswordForm, setResetPasswordForm] = useState({
    new_password: "",
    new_password_confirm: "",
  });
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetFieldErrors, setResetFieldErrors] = useState({});

  // Feedback notifications
  const [globalSuccessMsg, setGlobalSuccessMsg] = useState("");
  const [globalErrorMsg, setGlobalErrorMsg] = useState("");
  const [globalErrorCode, setGlobalErrorCode] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch general users list (only for General Admins)
  const fetchGeneralUsers = useCallback(async () => {
    if (!isGeneralAdmin) return;
    setIsLoadingUsers(true);
    setUsersError("");
    try {
      const data = await userManagementService.getUsers({
        name: searchNameQuery,
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsersError(
        err.message || "تعذر جلب قائمة المستخدمين. تأكد من صلاحيات الحساب."
      );
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isGeneralAdmin, searchNameQuery]);

  useEffect(() => {
    if (isGeneralAdmin) {
      fetchGeneralUsers();
    }
  }, [fetchGeneralUsers, isGeneralAdmin]);

  // Load governorates for user creation
  useEffect(() => {
    authService
      .getGovernorates()
      .then((data) => setGovernorates(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Load available libraries for librarian assignment
  useEffect(() => {
    if (isGeneralAdmin) {
      librariesService
        .getLibraries({ pageSize: 100 })
        .then((res) => setAvailableLibraries(res.results || []))
        .catch(() => {});
    }
  }, [isGeneralAdmin]);

  // Allowed roles for creation based on creator role (Section 2 & 8)
  const allowedCreateRoles = useMemo(() => {
    switch (requesterRole) {
      case "SUPERUSER":
        return [
          { code: "MINISTRY_ADMIN", label: "مسؤول الوزارة" },
          { code: "GOVERNORATE_ADMIN", label: "مسؤول المحافظة" },
          { code: "LIBRARIAN", label: "أمين مكتبة" },
          { code: "READER", label: "قارئ" },
        ];
      case "MINISTRY_ADMIN":
        return [
          { code: "GOVERNORATE_ADMIN", label: "مسؤول المحافظة" },
          { code: "LIBRARIAN", label: "أمين مكتبة" },
          { code: "READER", label: "قارئ" },
        ];
      case "GOVERNORATE_ADMIN":
        return [
          { code: "LIBRARIAN", label: "أمين مكتبة" },
          { code: "READER", label: "قارئ" },
        ];
      case "LIBRARIAN":
        return [{ code: "READER", label: "قارئ" }];
      default:
        return [];
    }
  }, [requesterRole]);

  const canCreate = allowedCreateRoles.length > 0;

  // Debounced Reader Search
  useEffect(() => {
    const trimmed = readerQuery.trim();
    if (trimmed.length < 2) {
      setReaderResults([]);
      setReaderTotalCount(0);
      setReaderSearchError("");
      setIsSearchingReaders(false);
      return;
    }

    setIsSearchingReaders(true);
    setReaderSearchError("");

    const timer = setTimeout(async () => {
      try {
        const res = await userManagementService.searchReaders({
          q: trimmed,
          pageSize: 20,
        });
        setReaderResults(res.results || []);
        setReaderTotalCount(res.count || 0);
      } catch (err) {
        setReaderSearchError(
          err.message || "حدث خطأ أثناء البحث عن القراء."
        );
      } finally {
        setIsSearchingReaders(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [readerQuery]);

  // Handle Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateFieldErrors({});
    setCreateModalError("");
    setCreateModalCode("");
    setGlobalErrorMsg("");
    setGlobalSuccessMsg("");

    if (!createForm.username.trim() || !createForm.password) {
      setCreateFieldErrors({
        username: !createForm.username.trim() ? ["اسم المستخدم مطلوب."] : null,
        password: !createForm.password ? ["كلمة المرور مطلوبة."] : null,
      });
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await userManagementService.createUser({
        ...createForm,
        requesterRole,
      });

      setGlobalSuccessMsg(
        `تم إنشاء حساب المستخدم "${createForm.username}" بنجاح.`
      );
      setIsCreateOpen(false);
      setCreateForm({
        username: "",
        password: "",
        role: allowedCreateRoles[0]?.code || "READER",
        library: "",
        governorate: "",
        email: "",
        first_name: "",
        last_name: "",
      });

      if (isGeneralAdmin) fetchGeneralUsers();
    } catch (err) {
      setCreateModalError(err.message || "فشل إنشاء المستخدم.");
      setCreateModalCode(err.code || "");
      if (err.errors && typeof err.errors === "object") {
        setCreateFieldErrors(err.errors);
      }
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Toggle Active (Deactivate / Reactivate)
  const handleToggleActive = async (targetUser) => {
    const isCurrentlyActive = targetUser.is_active !== false;
    const actionName = isCurrentlyActive ? "تعطيل" : "إعادة تفعيل";

    if (
      !confirm(
        `هل أنت متأكد من ${actionName} حساب المستخدم "${targetUser.username}"؟`
      )
    ) {
      return;
    }

    setActionLoadingId(targetUser.id);
    setGlobalErrorMsg("");
    setGlobalErrorCode("");
    setGlobalSuccessMsg("");

    try {
      if (isCurrentlyActive) {
        await userManagementService.deactivateUser(targetUser.id);
        setGlobalSuccessMsg(
          `تم تعطيل حساب المستخدم "${targetUser.username}" بنجاح.`
        );
      } else {
        await userManagementService.reactivateUser(targetUser.id);
        setGlobalSuccessMsg(
          `تمت إعادة تفعيل حساب المستخدم "${targetUser.username}" بنجاح.`
        );
      }
      fetchGeneralUsers();
    } catch (err) {
      setGlobalErrorMsg(err.message || `فشل ${actionName} الحساب.`);
      setGlobalErrorCode(err.code || "");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Borrowing Block
  const handleToggleBorrowing = async (targetUser) => {
    const isCurrentlyBlocked = !!targetUser.borrowing_blocked;
    setActionLoadingId(targetUser.id);
    setGlobalErrorMsg("");
    setGlobalErrorCode("");
    setGlobalSuccessMsg("");

    try {
      if (isCurrentlyBlocked) {
        await userManagementService.unblockBorrowing(targetUser.id);
        setGlobalSuccessMsg(
          `تم إلغاء حظر الاستعارة عن القارئ "${targetUser.username}".`
        );
      } else {
        await userManagementService.blockBorrowing(targetUser.id);
        setGlobalSuccessMsg(
          `تم حظر الاستعارة للمستخدم "${targetUser.username}".`
        );
      }
      fetchGeneralUsers();
    } catch (err) {
      setGlobalErrorMsg(err.message || "فشل تعديل حالة حظر الاستعارة.");
      setGlobalErrorCode(err.code || "");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetFieldErrors({});
    setResetModalError("");
    setResetModalCode("");

    if (!resetPasswordForm.new_password) {
      setResetFieldErrors({ new_password: ["كلمة المرور الجديدة مطلوبة."] });
      return;
    }
    if (
      resetPasswordForm.new_password !== resetPasswordForm.new_password_confirm
    ) {
      setResetFieldErrors({
        new_password_confirm: ["كلمتا المرور غير متطابقتين."],
      });
      return;
    }

    setIsSubmittingReset(true);
    try {
      await userManagementService.resetPassword(
        selectedUserForAction.id,
        resetPasswordForm
      );
      setGlobalSuccessMsg(
        `تم إعادة تعيين كلمة المرور للمستخدم "${selectedUserForAction.username}" بنجاح.`
      );
      setIsResetPasswordOpen(false);
      setSelectedUserForAction(null);
      setResetPasswordForm({ new_password: "", new_password_confirm: "" });
    } catch (err) {
      setResetModalError(err.message || "فشل إعادة تعيين كلمة المرور.");
      setResetModalCode(err.code || "");
      if (err.errors && typeof err.errors === "object") {
        setResetFieldErrors(err.errors);
      }
    } finally {
      setIsSubmittingReset(false);
    }
  };

  // Filtered users for table
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const roleCode = (u.role?.code || "").toLowerCase();
      return roleFilter === "all" || roleCode === roleFilter.toLowerCase();
    });
  }, [users, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-xl font-bold text-foreground">
              {isLibrarian
                ? "البحث عن القراء وتسجيل المستعيرين"
                : "إدارة المستخدمين وصلاحيات النطاق"}
            </h2>
            <Badge variant="gold" size="sm">
              {currentUser?.role?.label || "مشرف"}
            </Badge>
          </div>
          <p className="text-xs text-foreground-muted">
            {isLibrarian
              ? "البحث المحدود عن القراء التابعين لمحافظة المكتبة وتسجيل قراء جدد"
              : "إدارة حسابات المستفيدين والكوادر الإشرافية وفق النطاق التنظيمي للوزارة"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isGeneralAdmin && activeTab === "general" && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGeneralUsers}
              disabled={isLoadingUsers}
              className="text-xs"
            >
              <RotateCw
                className={cn("w-3.5 h-3.5", isLoadingUsers && "animate-spin")}
              />
              <span>تحديث</span>
            </Button>
          )}

          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCreateFieldErrors({});
                setIsCreateOpen(true);
              }}
              className="font-bold text-xs shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isLibrarian ? "تسجيل قارئ جديد" : "إضافة مستخدم جديد"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Global Notifications */}
      {globalSuccessMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-center justify-between gap-2.5 animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
            <span className="font-semibold">{globalSuccessMsg}</span>
          </div>
          <button
            onClick={() => setGlobalSuccessMsg("")}
            className="text-success hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ErrorAlert
        message={globalErrorMsg}
        code={globalErrorCode}
        onClose={() => setGlobalErrorMsg("")}
      />

      {/* Tabs navigation for General Admins */}
      {isGeneralAdmin && (
        <div className="flex border-b border-border-subtle gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "pb-3 px-4 transition-colors border-b-2 -mb-px flex items-center gap-2",
              activeTab === "general"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span>سجل المستخدمين العام</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reader-search")}
            className={cn(
              "pb-3 px-4 transition-colors border-b-2 -mb-px flex items-center gap-2",
              activeTab === "reader-search"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground"
            )}
          >
            <Search className="w-4 h-4" />
            <span>البحث السريع عن القراء (المستعيرين)</span>
          </button>
        </div>
      )}

      {/* TAB 1: GENERAL USERS TABLE (MINISTRY & GOVERNORATE ADMINS ONLY) */}
      {activeTab === "general" && isGeneralAdmin && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-subtle flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
              <input
                type="search"
                placeholder="البحث بالاسم أو اسم المستخدم..."
                value={searchNameQuery}
                onChange={(e) => setSearchNameQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-border bg-background ps-10 pe-4 py-2.5 text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none w-full sm:w-44"
              >
                <option value="all">جميع الأدوار</option>
                <option value="MINISTRY_ADMIN">مسؤول الوزارة</option>
                <option value="GOVERNORATE_ADMIN">مسؤول المحافظة</option>
                <option value="LIBRARIAN">أمين مكتبة</option>
                <option value="READER">قارئ</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface rounded-2xl border border-border shadow-subtle overflow-hidden">
            {isLoadingUsers ? (
              <div className="p-10 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-xs text-foreground-muted">
                  جاري تحميل سجل المستخدمين...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-foreground-subtle/40 mx-auto" />
                <p className="text-xs font-bold text-foreground">
                  لم يتم العثور على مستخدمين
                </p>
                <p className="text-[11px] text-foreground-muted max-w-sm mx-auto">
                  لا توجد حسابات تطابق خيارات التصفية ضمن نطاق صلاحيات حسابك.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-muted/60 text-foreground-subtle font-semibold">
                      <th className="py-3 px-4 text-start">المستخدم</th>
                      <th className="py-3 px-4 text-start">الدور التنظيمي</th>
                      <th className="py-3 px-4 text-start">حالة الاستعارة</th>
                      <th className="py-3 px-4 text-start">تاريخ التسجيل</th>
                      <th className="py-3 px-4 text-end">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredUsers.map((u) => {
                      const displayName =
                        u.first_name && u.last_name
                          ? `${u.first_name} ${u.last_name}`
                          : u.first_name || u.username;

                      const userInitial = (
                        u.first_name?.[0] ||
                        u.username?.[0] ||
                        "م"
                      ).toUpperCase();

                      const isBorrowingBlocked = !!u.borrowing_blocked;
                      const isSelf = currentUser?.id === u.id;
                      const isTargetSuperuser = u.role?.code === "SUPERUSER";
                      const isActionLoading = actionLoadingId === u.id;

                      const joinDate = u.date_joined
                        ? new Date(u.date_joined).toLocaleDateString("ar-SY")
                        : "—";

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-surface-muted/40 transition-colors"
                        >
                          {/* User info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                size="sm"
                                fallback={userInitial}
                                className="bg-primary-50 text-primary font-bold border-primary/20"
                              />
                              <div>
                                <div className="font-bold text-foreground flex items-center gap-1.5">
                                  <span>{displayName}</span>
                                  {isSelf && (
                                    <span className="text-[10px] text-secondary">
                                      (حسابك)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-foreground-subtle">
                                  @{u.username}
                                  {u.email && ` · ${u.email}`}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-50 text-secondary-hover border border-secondary/20">
                              {u.role?.label || u.role?.code}
                            </span>
                          </td>

                          {/* Borrowing status */}
                          <td className="py-3.5 px-4">
                            {isBorrowingBlocked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-error border border-red-200">
                                <Ban className="w-3 h-3" />
                                <span>محظور استعارة</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <BookOpen className="w-3 h-3 text-emerald-600" />
                                <span>مؤهل للاستعارة</span>
                              </span>
                            )}
                            {u.borrowed_books_count > 0 && (
                              <span className="ms-1.5 text-[10px] text-foreground-subtle">
                                ({formatArabicNumber(u.borrowed_books_count)} مستعار)
                              </span>
                            )}
                          </td>

                          {/* Date joined */}
                          <td className="py-3.5 px-4 text-foreground-muted">
                            {joinDate}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-end">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Toggle Borrowing */}
                              {!isSelf && !isTargetSuperuser && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={isActionLoading}
                                  onClick={() => handleToggleBorrowing(u)}
                                  title={
                                    isBorrowingBlocked
                                      ? "إلغاء حظر الاستعارة"
                                      : "حظر الاستعارة"
                                  }
                                  className={cn(
                                    "text-xs",
                                    isBorrowingBlocked
                                      ? "hover:text-success hover:bg-emerald-50"
                                      : "hover:text-amber-600 hover:bg-amber-50"
                                  )}
                                >
                                  {isBorrowingBlocked ? (
                                    <Unlock className="w-3.5 h-3.5" />
                                  ) : (
                                    <Ban className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              )}

                              {/* Reset Password */}
                              {!isSelf && !isTargetSuperuser && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={isActionLoading}
                                  onClick={() => {
                                    setSelectedUserForAction(u);
                                    setResetPasswordForm({
                                      new_password: "",
                                      new_password_confirm: "",
                                    });
                                    setResetFieldErrors({});
                                    setIsResetPasswordOpen(true);
                                  }}
                                  title="إعادة تعيين كلمة المرور"
                                  className="hover:text-primary hover:bg-primary-50"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </Button>
                              )}

                              {/* Deactivate / Reactivate */}
                              {!isSelf && !isTargetSuperuser && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={isActionLoading}
                                  onClick={() => handleToggleActive(u)}
                                  title={
                                    u.is_active !== false
                                      ? "تعطيل الحساب"
                                      : "إعادة التفعيل"
                                  }
                                  className="hover:text-error hover:bg-red-50"
                                >
                                  {isActionLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : u.is_active !== false ? (
                                    <UserX className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: READER SEARCH VIEW (ALL ADMINS, AND PRIMARY VIEW FOR LIBRARIAN) */}
      {(activeTab === "reader-search" || isLibrarian) && (
        <div className="space-y-4">
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-subtle space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                البحث المحدود عن القراء
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                ابحث عن القراء المسجلين بالاسم، اسم المستخدم، البريد، أو رقم الهاتف لاختيار المستعير
              </p>
            </div>

            <div className="relative w-full">
              <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
              <input
                type="search"
                autoFocus
                placeholder="أدخل حرفين على الأقل للبحث (مثال: أحمد، ahmad)..."
                value={readerQuery}
                onChange={(e) => setReaderQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-border bg-background ps-10 pe-10 py-2.5 text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
              />
              {isSearchingReaders && (
                <Loader2 className="w-4 h-4 animate-spin text-primary absolute end-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {readerSearchError && (
              <ErrorAlert
                message={readerSearchError}
                onClose={() => setReaderSearchError("")}
              />
            )}

            {selectedReader && (
              <div className="p-3 rounded-xl bg-primary-50 border border-primary/20 flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <BookmarkCheck className="w-4 h-4 text-secondary" />
                  <span>
                    القارئ المختار: {selectedReader.full_name || selectedReader.username} (#{selectedReader.id})
                  </span>
                  <span className="text-[11px] font-normal text-foreground-muted">
                    - {selectedReader.governorate?.name || "المحافظة"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReader(null)}
                  className="text-primary hover:underline text-[11px]"
                >
                  إلغاء التحديد
                </button>
              </div>
            )}
          </div>

          {/* Reader Search Results */}
          <div className="bg-surface rounded-2xl border border-border shadow-subtle overflow-hidden">
            {readerQuery.trim().length < 2 ? (
              <div className="p-8 text-center text-xs text-foreground-subtle">
                أدخل حرفين على الأقل في شريط البحث لعرض النتائج المطابقة.
              </div>
            ) : isSearchingReaders ? (
              <div className="p-8 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-foreground-muted">جاري البحث في قاعدة البيانات...</p>
              </div>
            ) : readerResults.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <p className="text-xs font-bold text-foreground">لم يتم العثور على أي قراء</p>
                <p className="text-[11px] text-foreground-muted">
                  تأكد من كتابة الاسم أو اسم المستخدم بشكل صحيح ضمن نطاق المحافظة المتاح لك.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                <div className="p-3 bg-surface-muted/60 text-xs font-bold text-foreground-muted flex items-center justify-between">
                  <span>نتائج البحث ({formatArabicNumber(readerTotalCount)} قارئ)</span>
                  <span className="text-[10px] font-normal text-foreground-subtle">
                    ترتيب حسب اسم المستخدم
                  </span>
                </div>

                {readerResults.map((r) => {
                  const isChosen = selectedReader?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        "p-4 flex items-center justify-between gap-4 transition-colors",
                        isChosen ? "bg-primary-50/50" : "hover:bg-surface-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          fallback={r.first_name?.[0] || r.username?.[0] || "ق"}
                          className="bg-primary text-white font-bold"
                        />
                        <div>
                          <div className="font-bold text-foreground text-xs">
                            {r.full_name || `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.username}
                          </div>
                          <div className="text-[11px] font-mono text-foreground-subtle">
                            @{r.username} · معرّف #{r.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {r.governorate?.name && (
                          <Badge variant="gold" size="sm" className="text-[10px] gap-1">
                            <MapPin className="w-3 h-3 text-secondary" />
                            <span>{r.governorate.name}</span>
                          </Badge>
                        )}

                        <Button
                          variant={isChosen ? "primary" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedReader(r);
                            setGlobalSuccessMsg(
                              `تم اختيار القارئ "${r.full_name || r.username}" بنجاح لاستخدامه في العمليات.`
                            );
                          }}
                          className="text-xs"
                        >
                          <UserCheck2 className="w-3.5 h-3.5" />
                          <span>{isChosen ? "تم الاختيار" : "اختيار القارئ"}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-surface w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isLibrarian
                    ? "تسجيل قارئ جديد في المكتبة"
                    : "إنشاء حساب مستخدم جديد"}
                </h3>
                <p className="text-xs text-foreground-muted mt-0.5">
                  وفق النطاق الإداري المصرح به لحسابك
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-foreground-subtle hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ErrorAlert
              message={createModalError}
              code={createModalCode}
              errors={createFieldErrors}
              onClose={() => setCreateModalError("")}
            />

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Username */}
                <div className="space-y-1 text-start">
                  <label className="block text-xs font-semibold text-foreground">
                    اسم المستخدم (المعرف) *
                  </label>
                  <Input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="reader_01"
                    value={createForm.username}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, username: e.target.value })
                    }
                    error={!!createFieldErrors.username}
                  />
                  {createFieldErrors.username && (
                    <p className="text-[11px] text-error">
                      {Array.isArray(createFieldErrors.username)
                        ? createFieldErrors.username.join("، ")
                        : String(createFieldErrors.username)}
                    </p>
                  )}
                </div>

                {/* Password (Admin create uses single password) */}
                <div className="space-y-1 text-start">
                  <label className="block text-xs font-semibold text-foreground">
                    كلمة المرور *
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    error={!!createFieldErrors.password}
                  />
                  {createFieldErrors.password && (
                    <p className="text-[11px] text-error">
                      {Array.isArray(createFieldErrors.password)
                        ? createFieldErrors.password.join("، ")
                        : String(createFieldErrors.password)}
                    </p>
                  )}
                </div>

                {/* Role selection (Only if multiple roles available) */}
                {!isLibrarian && allowedCreateRoles.length > 1 && (
                  <div className="space-y-1 text-start">
                    <label className="block text-xs font-semibold text-foreground">
                      الدور الوظيفي *
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, role: e.target.value })
                      }
                      className="w-full h-10 rounded-gov border border-border bg-surface px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      {allowedCreateRoles.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.label} ({r.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Governorate Selection (Required for Ministry Admin when creating Reader or Governorate Admin) */}
                {(requesterRole === "MINISTRY_ADMIN" || requesterRole === "SUPERUSER") &&
                  (createForm.role === "READER" ||
                    createForm.role === "GOVERNORATE_ADMIN") && (
                    <div className="space-y-1 text-start">
                      <label className="block text-xs font-semibold text-foreground">
                        المحافظة التابع لها *
                      </label>
                      <select
                        required
                        value={createForm.governorate}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            governorate: e.target.value,
                          })
                        }
                        className="w-full h-10 rounded-gov border border-border bg-surface px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="">-- اختر المحافظة --</option>
                        {governorates.map((gov) => (
                          <option key={gov.id} value={gov.id}>
                            {gov.name}
                          </option>
                        ))}
                      </select>
                      {createFieldErrors.governorate && (
                        <p className="text-[11px] text-error">
                          {Array.isArray(createFieldErrors.governorate)
                            ? createFieldErrors.governorate.join("، ")
                            : String(createFieldErrors.governorate)}
                        </p>
                      )}
                    </div>
                  )}

                {/* Library ID (Required only when creating LIBRARIAN) */}
                {createForm.role === "LIBRARIAN" && (
                  <div className="space-y-1 text-start">
                    <label className="block text-xs font-semibold text-foreground">
                      المكتبة المكلّف بإدارتها *
                    </label>
                    {availableLibraries.length > 0 ? (
                      <select
                        required
                        value={createForm.library}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, library: e.target.value })
                        }
                        className={cn(
                          "w-full rounded-gov border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10",
                          createFieldErrors.library && "border-error focus:border-error"
                        )}
                      >
                        <option value="">-- اختر المكتبة الوقفية --</option>
                        {availableLibraries.map((lib) => (
                          <option key={lib.id} value={lib.id}>
                            {lib.name} ({lib.governorate_name || `محافظة #${lib.governorate}`})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type="number"
                        required
                        placeholder="معرّف المكتبة (مثال: 1)"
                        value={createForm.library}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, library: e.target.value })
                        }
                        error={!!createFieldErrors.library}
                      />
                    )}
                    {createFieldErrors.library && (
                      <p className="text-[11px] text-error">
                        {Array.isArray(createFieldErrors.library)
                          ? createFieldErrors.library.join("، ")
                          : String(createFieldErrors.library)}
                      </p>
                    )}
                  </div>
                )}

                {/* First Name */}
                <div className="space-y-1 text-start">
                  <label className="block text-xs font-semibold text-foreground">
                    الاسم الأول (اختياري)
                  </label>
                  <Input
                    type="text"
                    placeholder="أحمد"
                    value={createForm.first_name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, first_name: e.target.value })
                    }
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1 text-start">
                  <label className="block text-xs font-semibold text-foreground">
                    اسم العائلة / الكنية (اختياري)
                  </label>
                  <Input
                    type="text"
                    placeholder="محمد"
                    value={createForm.last_name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, last_name: e.target.value })
                    }
                  />
                </div>

                {/* Email */}
                <div className="space-y-1 text-start sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <Input
                    type="email"
                    dir="ltr"
                    placeholder="ahmad@example.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    error={!!createFieldErrors.email}
                  />
                  {createFieldErrors.email && (
                    <p className="text-[11px] text-error">
                      {Array.isArray(createFieldErrors.email)
                        ? createFieldErrors.email.join("، ")
                        : String(createFieldErrors.email)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingCreate}
                  disabled={isSubmittingCreate}
                  className="font-bold min-w-[120px]"
                >
                  تأكيد الإنشاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPasswordOpen && selectedUserForAction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  إعادة تعيين كلمة المرور
                </h3>
                <p className="text-xs text-foreground-muted mt-0.5">
                  للمستخدم: <span className="font-mono text-primary">@{selectedUserForAction.username}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResetPasswordOpen(false)}
                className="p-1 rounded-lg text-foreground-subtle hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ErrorAlert
              message={resetModalError}
              code={resetModalCode}
              errors={resetFieldErrors}
              onClose={() => setResetModalError("")}
            />

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  كلمة المرور الجديدة *
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetPasswordForm.new_password}
                  onChange={(e) =>
                    setResetPasswordForm({
                      ...resetPasswordForm,
                      new_password: e.target.value,
                    })
                  }
                  error={!!resetFieldErrors.new_password}
                />
                {resetFieldErrors.new_password && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(resetFieldErrors.new_password)
                      ? resetFieldErrors.new_password.join("، ")
                      : String(resetFieldErrors.new_password)}
                  </p>
                )}
              </div>

              <div className="space-y-1 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetPasswordForm.new_password_confirm}
                  onChange={(e) =>
                    setResetPasswordForm({
                      ...resetPasswordForm,
                      new_password_confirm: e.target.value,
                    })
                  }
                  error={!!resetFieldErrors.new_password_confirm}
                />
                {resetFieldErrors.new_password_confirm && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(resetFieldErrors.new_password_confirm)
                      ? resetFieldErrors.new_password_confirm.join("، ")
                      : String(resetFieldErrors.new_password_confirm)}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResetPasswordOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingReset}
                  disabled={isSubmittingReset}
                  className="font-bold min-w-[120px]"
                >
                  تحديث كلمة المرور
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
