"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/Tabs";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Badge } from "@/ui/Badge";
import { Pagination } from "@/shared/Pagination";
import {
  Clock,
  BookOpen,
  Heart,
  CheckCircle2,
  AlertCircle,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  KeyRound,
  FileText,
  AlertOctagon,
  RefreshCw,
  BookmarkCheck,
  XCircle,
  Inbox,
  ExternalLink,
  ChevronLeft,
  Filter,
} from "lucide-react";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { useAuth } from "@/hooks/useAuth";
import {
  borrowingService,
  BORROW_REQUEST_STATUS_LABELS,
  BORROW_STATUS_LABELS,
} from "@/services/borrowingService";
import { formatArabicNumber, cn } from "@/lib/utils";

export function ProfileTabs({ user, profile, onCountsRefresh }) {
  const { updateProfile, changePassword } = useAuth();

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || profile?.first_name || "",
    last_name: user?.last_name || profile?.last_name || "",
    email: user?.email || profile?.email || "",
    phone: profile?.profile?.phone || "",
    address: profile?.profile?.address || "",
    gender: profile?.profile?.gender || "",
    age: profile?.profile?.age ?? "",
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [profileErrorCode, setProfileErrorCode] = useState("");
  const [profileFieldErrors, setProfileFieldErrors] = useState({});

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [passwordErrorCode, setPasswordErrorCode] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});

  // Borrow Requests State (Reader Scope: GET /dashboard/borrow-requests/)
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [requestsTotalCount, setRequestsTotalCount] = useState(0);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsStatusFilter, setRequestsStatusFilter] = useState("ALL");
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  // Borrows State (Reader Scope: GET /dashboard/borrows/)
  const [borrows, setBorrows] = useState([]);
  const [borrowsTotalCount, setBorrowsTotalCount] = useState(0);
  const [borrowsPage, setBorrowsPage] = useState(1);
  const [borrowsStatusFilter, setBorrowsStatusFilter] = useState("ALL");
  const [isLoadingBorrows, setIsLoadingBorrows] = useState(false);
  const [borrowsError, setBorrowsError] = useState("");

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoadingRequests(true);
      setRequestsError("");
      const res = await borrowingService.getBorrowRequests({
        status: requestsStatusFilter !== "ALL" ? requestsStatusFilter : "",
        page: requestsPage,
        pageSize: 20,
      });
      setBorrowRequests(res.results || []);
      setRequestsTotalCount(res.count || 0);
      if (onCountsRefresh) onCountsRefresh();
    } catch (err) {
      setRequestsError(err.message || "تعذر تحميل طلبات الاستعارة.");
    } finally {
      setIsLoadingRequests(false);
    }
  }, [requestsStatusFilter, requestsPage, onCountsRefresh]);

  // Fetch Borrows
  const fetchBorrowsList = useCallback(async () => {
    try {
      setIsLoadingBorrows(true);
      setBorrowsError("");
      const res = await borrowingService.getBorrows({
        status: borrowsStatusFilter !== "ALL" ? borrowsStatusFilter : "",
        page: borrowsPage,
        pageSize: 20,
      });
      setBorrows(res.results || []);
      setBorrowsTotalCount(res.count || 0);
      if (onCountsRefresh) onCountsRefresh();
    } catch (err) {
      setBorrowsError(err.message || "تعذر تحميل سجل الاستعارات.");
    } finally {
      setIsLoadingBorrows(false);
    }
  }, [borrowsStatusFilter, borrowsPage, onCountsRefresh]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchBorrowsList();
  }, [fetchBorrowsList]);

  // Handle Profile Update Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    setProfileErrorCode("");
    setProfileFieldErrors({});
    setIsUpdatingProfile(true);

    try {
      await updateProfile(profileForm);
      setProfileSuccessMsg("تم حفظ وتحديث بيانات الملف الشخصي بنجاح.");
      if (onCountsRefresh) onCountsRefresh();
    } catch (err) {
      setProfileErrorMsg(
        err.message || "فشل تحديث البيانات، يرجى مراجعة الحقول وإعادة المحاولة."
      );
      setProfileErrorCode(err.code || "");
      if (err.errors && typeof err.errors === "object") {
        setProfileFieldErrors(err.errors);
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg("");
    setPasswordErrorMsg("");
    setPasswordErrorCode("");
    setPasswordFieldErrors({});

    if (!passwordForm.current_password) {
      setPasswordErrorMsg("يرجى إدخال كلمة المرور الحالية.");
      return;
    }
    if (!passwordForm.new_password) {
      setPasswordErrorMsg("يرجى إدخال كلمة المرور الجديدة.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setPasswordErrorMsg("كلمتا المرور الجديدتان غير متطابقتين.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(passwordForm);
      setPasswordSuccessMsg("تم تغيير كلمة المرور بنجاح.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirm: "",
      });
    } catch (err) {
      setPasswordErrorMsg(
        err.message || "فشل تغيير كلمة المرور، تحقق من صحة كلمة المرور الحالية وقوة الكلمة الجديدة."
      );
      setPasswordErrorCode(err.code || "");
      if (err.errors && typeof err.errors === "object") {
        setPasswordFieldErrors(err.errors);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isBorrowingBlocked =
    profile?.borrowing_blocked || profile?.profile?.borrowing_blocked || user?.borrowing_blocked;

  const requestsTotalPages = Math.ceil(requestsTotalCount / 20) || 1;
  const borrowsTotalPages = Math.ceil(borrowsTotalCount / 20) || 1;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-subtle">
      <Tabs defaultValue="edit-profile">
        <TabsList className="w-full sm:w-auto flex-wrap mb-6">
          <TabsTrigger value="edit-profile">البيانات الشخصية وتحديث الملف</TabsTrigger>
          <TabsTrigger value="my-requests" className="relative">
            <span>طلبات الاستعارة</span>
            {requestsTotalCount > 0 && (
              <span className="ms-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
                {formatArabicNumber(requestsTotalCount)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-borrows" className="relative">
            <span>الكتب المستعارة</span>
            {borrowsTotalCount > 0 && (
              <span className="ms-1.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-bold">
                {formatArabicNumber(borrowsTotalCount)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="change-password">تغيير كلمة المرور</TabsTrigger>
          <TabsTrigger value="credentials">بيانات التوثيق والاعتماد</TabsTrigger>
        </TabsList>

        {/* Tab 1: Edit Profile */}
        <TabsContent value="edit-profile" className="space-y-6">
          <div className="border-b border-border-subtle pb-4">
            <h3 className="text-sm font-bold text-foreground">
              تعديل المعلومات الشخصية
            </h3>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              الحقول التالية متاحة للتعديل المباشر من قبلك، بينما تُدار الصلاحيات والدور المؤسسي مركزياً من قبل الوزارة.
            </p>
          </div>

          {/* Success Notification */}
          {profileSuccessMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Error Notification */}
          <ErrorAlert
            message={profileErrorMsg}
            code={profileErrorCode}
            errors={profileFieldErrors}
            onClose={() => setProfileErrorMsg("")}
          />

          {/* Non-editable system fields banner */}
          <div className="p-4 rounded-xl bg-surface-muted border border-border-subtle grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-foreground-subtle block mb-1">اسم المستخدم (المعرف):</span>
              <span className="font-mono font-bold text-foreground">@{user?.username}</span>
            </div>
            <div>
              <span className="text-foreground-subtle block mb-1">الدور المؤسسي:</span>
              <span className="font-semibold text-primary">{user?.role?.label || "قارئ"}</span>
            </div>
            <div>
              <span className="text-foreground-subtle block mb-1">المحافظة المسجلة:</span>
              <span className="font-bold text-foreground">
                محافظة {user?.governorate_name || profile?.governorate || "المعتمدة"}
              </span>
            </div>
            <div>
              <span className="text-foreground-subtle block mb-1">أهلية الاستعارة:</span>
              {isBorrowingBlocked ? (
                <span className="font-semibold text-error flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>محظور من الاستعارة</span>
                </span>
              ) : (
                <span className="font-semibold text-success flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مؤهل للاستعارة</span>
                </span>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  الاسم الأول
                </label>
                <Input
                  type="text"
                  placeholder="الاسم الأول"
                  value={profileForm.first_name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, first_name: e.target.value })
                  }
                  startIcon={User}
                  error={!!profileFieldErrors.first_name}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  الكنية / اسم العائلة
                </label>
                <Input
                  type="text"
                  placeholder="الكنية"
                  value={profileForm.last_name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, last_name: e.target.value })
                  }
                  startIcon={User}
                  error={!!profileFieldErrors.last_name}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  dir="ltr"
                  placeholder="name@example.com"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  startIcon={Mail}
                  error={!!profileFieldErrors.email}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  رقم الهاتف للتواصل
                </label>
                <Input
                  type="tel"
                  dir="ltr"
                  placeholder="0999999999"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  startIcon={Phone}
                  error={!!profileFieldErrors["profile.phone"]}
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  مكان الإقامة / العنوان
                </label>
                <Input
                  type="text"
                  placeholder="حمص - المركز..."
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  startIcon={MapPin}
                  error={!!profileFieldErrors["profile.address"]}
                />
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5 text-start">
                  <label className="block text-xs font-semibold text-foreground">
                    الجنس
                  </label>
                  <select
                    value={profileForm.gender || ""}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, gender: e.target.value })
                    }
                    className="w-full h-10 rounded-gov border border-border bg-surface px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">غير محدد</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-start">
                  <label className="block text-xs font-semibold text-foreground">
                    العمر
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="العمر"
                    value={profileForm.age}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, age: e.target.value })
                    }
                    error={!!profileFieldErrors["profile.age"]}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUpdatingProfile}
                disabled={isUpdatingProfile}
                className="font-bold min-w-[140px]"
              >
                <span>حفظ التعديلات</span>
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 2: My Borrow Requests (Reader Scope: GET /dashboard/borrow-requests/) */}
        <TabsContent value="my-requests" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                طلبات الاستعارة الشخصية
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                متابعة حالة طلبات استعارة المصنفات والكتب الموجهة لمكتبات محافظتك
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRequests}
                disabled={isLoadingRequests}
                className="text-xs gap-1.5 h-8"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoadingRequests && "animate-spin")} />
                <span>تحديث</span>
              </Button>
            </div>
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
            <span className="text-xs text-foreground-muted flex items-center gap-1 me-1">
              <Filter className="w-3.5 h-3.5 text-secondary" />
              <span>الحالة:</span>
            </span>
            {[
              { id: "ALL", label: "جميع الطلبات" },
              { id: "PENDING", label: "قيد المراجعة" },
              { id: "APPROVED", label: "تمت الموافقة" },
              { id: "REJECTED", label: "مرفوض" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setRequestsStatusFilter(st.id);
                  setRequestsPage(1);
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all border",
                  requestsStatusFilter === st.id
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface-muted text-foreground-muted border-border hover:border-primary/30"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>

          {requestsError && (
            <ErrorAlert
              message={requestsError}
              onClose={() => setRequestsError("")}
            />
          )}

          {isLoadingRequests ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-surface-muted animate-pulse" />
              ))}
            </div>
          ) : borrowRequests.length > 0 ? (
            <div className="space-y-3">
              {borrowRequests.map((req) => {
                const bookTitle = req.book_title || req.book?.title || `كتاب #${req.book || req.book_id}`;
                const statusMeta =
                  BORROW_REQUEST_STATUS_LABELS[req.status] || {
                    label: req.status,
                    bgClass: "bg-surface-muted text-foreground border-border",
                  };
                const requestDate = req.created_at
                  ? new Date(req.created_at).toLocaleDateString("ar-SY", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—";

                const rejectionReasonText = req.rejection_reason || req.reason;

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-border bg-surface hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">
                          {bookTitle}
                        </span>
                        {(req.book || req.book_id) && (
                          <Link
                            href={`/books/${req.book_id || req.book}`}
                            className="text-primary hover:underline inline-flex items-center gap-0.5 text-[11px]"
                          >
                            <span>عرض بطاقة الكتاب</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-foreground-muted text-[11px]">
                        <span>تاريخ تقديم الطلب: {requestDate}</span>
                        {req.library_name && <span>المكتبة: {req.library_name}</span>}
                        {req.governorate_name && <span>المحافظة: {req.governorate_name}</span>}
                      </div>

                      {/* Display rejection reason if rejected */}
                      {req.status === "REJECTED" && rejectionReasonText && (
                        <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-error text-[11px] flex items-start gap-2">
                          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block font-bold">سبب الرفض المسجل من إدارة المكتبة:</strong>
                            <span>{rejectionReasonText}</span>
                          </div>
                        </div>
                      )}

                      {/* Approved notice */}
                      {req.status === "APPROVED" && (
                        <div className="mt-1.5 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تمت الموافقة من أمين المكتبة، ويمكنك متابعة حالة الإعارة في تبويب الكتب المستعارة.</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border",
                          statusMeta.bgClass
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Requests Pagination */}
              {requestsTotalPages > 1 && (
                <div className="pt-3 flex justify-center">
                  <Pagination
                    currentPage={requestsPage}
                    totalPages={requestsTotalPages}
                    onPageChange={(p) => setRequestsPage(p)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Inbox className="w-12 h-12 text-foreground-subtle/40 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">
                  لا توجد طلبات استعارة مسجلة حالياً
                </p>
                <p className="text-[11px] text-foreground-muted max-w-sm mx-auto">
                  {requestsStatusFilter !== "ALL"
                    ? "لا توجد طلبات تطابق الفلتر المحدد."
                    : "يمكنك تصفح فهارس مكتبات محافظتك وتقديم طلب استعارة لأي مصنف ترغب بمطالعته."}
                </p>
              </div>
              <Link href="/books">
                <Button variant="primary" size="sm" className="font-bold">
                  تصفح الكتب المتاحة
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: My Borrows (Reader Scope: GET /dashboard/borrows/) */}
        <TabsContent value="my-borrows" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                سجل الكتب المستعارة
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                سجل الاستعارات النشطة وسجل المصنفات المعادة لمكتبات الوزارة
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBorrowsList}
                disabled={isLoadingBorrows}
                className="text-xs gap-1.5 h-8"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoadingBorrows && "animate-spin")} />
                <span>تحديث</span>
              </Button>
            </div>
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
            <span className="text-xs text-foreground-muted flex items-center gap-1 me-1">
              <Filter className="w-3.5 h-3.5 text-secondary" />
              <span>الحالة:</span>
            </span>
            {[
              { id: "ALL", label: "جميع الاستعارات" },
              { id: "ACTIVE", label: "قيد الاستعارة (النشطة)" },
              { id: "RETURNED", label: "تم الإرجاع" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setBorrowsStatusFilter(st.id);
                  setBorrowsPage(1);
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all border",
                  borrowsStatusFilter === st.id
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface-muted text-foreground-muted border-border hover:border-primary/30"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>

          {borrowsError && (
            <ErrorAlert
              message={borrowsError}
              onClose={() => setBorrowsError("")}
            />
          )}

          {isLoadingBorrows ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-surface-muted animate-pulse" />
              ))}
            </div>
          ) : borrows.length > 0 ? (
            <div className="space-y-3">
              {borrows.map((b) => {
                const bookTitle = b.book_title || b.book?.title || `كتاب #${b.book || b.book_id}`;
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
                  : null;

                const isDirect = b.source === "DIRECT";

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-border bg-surface hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">
                          {bookTitle}
                        </span>
                        {(b.book || b.book_id) && (
                          <Link
                            href={`/books/${b.book_id || b.book}`}
                            className="text-primary hover:underline inline-flex items-center gap-0.5 text-[11px]"
                          >
                            <span>عرض بطاقة الكتاب</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-foreground-muted text-[11px]">
                        <span>تاريخ الاستعارة: {borrowDate}</span>
                        {b.library_name && <span>المكتبة: {b.library_name}</span>}
                        {b.governorate_name && <span>المحافظة: {b.governorate_name}</span>}
                        <span className="text-[10px] bg-surface-muted px-2 py-0.5 rounded border border-border-subtle">
                          المصدر: {isDirect ? "إعارة مباشرة من الإدارة" : "ناتجة عن موافقة على طلب"}
                        </span>
                      </div>

                      {returnDate && (
                        <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تم تسجيل الإرجاع بتاريخ: {returnDate}</span>
                          {b.returned_by_username && <span>(بواسطة: {b.returned_by_username})</span>}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border",
                          statusMeta.bgClass
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Borrows Pagination */}
              {borrowsTotalPages > 1 && (
                <div className="pt-3 flex justify-center">
                  <Pagination
                    currentPage={borrowsPage}
                    totalPages={borrowsTotalPages}
                    onPageChange={(p) => setBorrowsPage(p)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <BookmarkCheck className="w-12 h-12 text-foreground-subtle/40 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">
                  لا توجد استعارات مسجلة
                </p>
                <p className="text-[11px] text-foreground-muted max-w-sm mx-auto">
                  {borrowsStatusFilter !== "ALL"
                    ? "لا توجد استعارات تطابق الفلتر المحدد."
                    : "عند موافقة إدارة المكتبة على طلبك أو تسجيل إعارة مباشرة لك، ستظهر تفاصيلها وسجل إرجاعها هنا."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Change Password */}
        <TabsContent value="change-password" className="space-y-6">
          <div className="border-b border-border-subtle pb-4">
            <h3 className="text-sm font-bold text-foreground">
              تغيير كلمة المرور الشخصية
            </h3>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              يرجى إدخال كلمة المرور الحالية متبوعة بكلمة المرور الجديدة للتأكيد والحفظ الآمن.
            </p>
          </div>

          {passwordSuccessMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {/* Error Notification */}
          <ErrorAlert
            message={passwordErrorMsg}
            code={passwordErrorCode}
            errors={passwordFieldErrors}
            onClose={() => setPasswordErrorMsg("")}
          />

          <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-semibold text-foreground">
                كلمة المرور الحالية
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                startIcon={Lock}
                error={!!passwordFieldErrors.current_password}
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-semibold text-foreground">
                كلمة المرور الجديدة
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                startIcon={KeyRound}
                error={!!passwordFieldErrors.new_password}
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-semibold text-foreground">
                تأكيد كلمة المرور الجديدة
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={passwordForm.new_password_confirm}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password_confirm: e.target.value,
                  })
                }
                startIcon={KeyRound}
                error={!!passwordFieldErrors.new_password_confirm}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isChangingPassword}
                disabled={isChangingPassword}
                className="font-bold w-full"
              >
                <span>تحديث كلمة المرور</span>
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 5: Credentials & Scope */}
        <TabsContent value="credentials" className="space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h3 className="text-sm font-bold text-foreground">
              بيانات الاعتماد والتوثيق المؤسسي
            </h3>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              تفاصيل النطاق التنظيمي والتبعية الإدارية المعتمدة في قاعدة بيانات وزارة الأوقاف.
            </p>
          </div>

          <div className="space-y-3 max-w-xl text-xs">
            <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-muted">
              <span className="text-foreground-subtle block mb-1">
                المعرف الرقمي للمستخدم:
              </span>
              <span className="font-mono font-bold text-foreground">
                ID-{user?.id || profile?.id || "N/A"} (@{user?.username})
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-muted">
              <span className="text-foreground-subtle block mb-1">
                الدور المعتمد:
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="gold" size="sm">
                  {user?.role?.label || "قارئ"}
                </Badge>
                <span className="text-[11px] font-mono text-foreground-subtle">
                  ({user?.role?.code || "READER"})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-muted">
              <span className="text-foreground-subtle block mb-1">
                نطاق المحافظة المعتمد:
              </span>
              <span className="font-bold text-foreground">
                محافظة {user?.governorate_name || profile?.governorate || "المسجلة"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-muted">
              <span className="text-foreground-subtle block mb-1">
                أهلية الاستعارة:
              </span>
              {isBorrowingBlocked ? (
                <span className="font-semibold text-error flex items-center gap-1.5 mt-0.5">
                  <AlertOctagon className="w-4 h-4" />
                  <span>محظور من الاستعارة (يرجى مراجعة إدارة المكتبة)</span>
                </span>
              ) : (
                <span className="font-semibold text-success flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>مؤهل للاستعارة من مكتبات المحافظة</span>
                </span>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
