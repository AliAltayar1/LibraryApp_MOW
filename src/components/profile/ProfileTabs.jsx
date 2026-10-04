"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/Tabs";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Badge } from "@/ui/Badge";
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
} from "lucide-react";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { useAuth } from "@/hooks/useAuth";
import {
  borrowingService,
  BORROW_REQUEST_STATUS_LABELS,
  BORROW_STATUS_LABELS,
} from "@/services/borrowingService";
import { formatArabicNumber, cn } from "@/lib/utils";

export function ProfileTabs({ user, profile }) {
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
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  // Borrows State (Reader Scope: GET /dashboard/borrows/)
  const [borrows, setBorrows] = useState([]);
  const [isLoadingBorrows, setIsLoadingBorrows] = useState(false);
  const [borrowsError, setBorrowsError] = useState("");

  const fetchRequests = async () => {
    try {
      setIsLoadingRequests(true);
      setRequestsError("");
      const res = await borrowingService.getBorrowRequests();
      setBorrowRequests(res.results || []);
    } catch (err) {
      setRequestsError(err.message || "تعذر تحميل طلبات الاستعارة.");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchBorrowsList = async () => {
    try {
      setIsLoadingBorrows(true);
      setBorrowsError("");
      const res = await borrowingService.getBorrows();
      setBorrows(res.results || []);
    } catch (err) {
      setBorrowsError(err.message || "تعذر تحميل سجل الاستعارات.");
    } finally {
      setIsLoadingBorrows(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchBorrowsList();
  }, []);

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
    profile?.borrowing_blocked || profile?.profile?.borrowing_blocked;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-subtle">
      <Tabs defaultValue="edit-profile">
        <TabsList className="w-full sm:w-auto flex-wrap mb-6">
          <TabsTrigger value="edit-profile">البيانات الشخصية وتحديث الملف</TabsTrigger>
          <TabsTrigger value="my-requests" className="relative">
            <span>طلبات الاستعارة</span>
            {borrowRequests.length > 0 && (
              <span className="ms-1.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-bold">
                {formatArabicNumber(borrowRequests.length)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-borrows" className="relative">
            <span>الكتب المستعارة</span>
            {borrows.length > 0 && (
              <span className="ms-1.5 px-1.5 py-0.5 bg-secondary-50 text-secondary-hover border border-secondary/20 text-[10px] rounded-full font-bold">
                {formatArabicNumber(borrows.length)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="change-password">تغيير كلمة المرور</TabsTrigger>
          <TabsTrigger value="activity">سجل النشاط والقراءة</TabsTrigger>
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
          <div className="p-4 rounded-xl bg-surface-muted border border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-foreground-subtle block mb-1">اسم المستخدم (المعرف):</span>
              <span className="font-mono font-bold text-foreground">@{user?.username}</span>
            </div>
            <div>
              <span className="text-foreground-subtle block mb-1">الدور المؤسسي الحالي:</span>
              <span className="font-semibold text-primary">{user?.role?.label || "عضو"}</span>
            </div>
            <div>
              <span className="text-foreground-subtle block mb-1">حالة الاستعارة:</span>
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
                  error={!!profileFieldErrors.phone}
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5 text-start">
                <label className="block text-xs font-semibold text-foreground">
                  مكان الإقامة / العنوان
                </label>
                <Input
                  type="text"
                  placeholder="دمشق - الميدان..."
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  startIcon={MapPin}
                  error={!!profileFieldErrors.address}
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
                    error={!!profileFieldErrors.age}
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

        {/* Tab: My Borrow Requests (Reader Scope: GET /dashboard/borrow-requests/) */}
        <TabsContent value="my-requests" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                طلبات الاستعارة الشخصية
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                متابعة حالة طلبات استعارة المصنفات والكتب الموجهة للمكتبات
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              disabled={isLoadingRequests}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoadingRequests && "animate-spin")} />
              <span>تحديث</span>
            </Button>
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

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">
                          {bookTitle}
                        </span>
                        {(req.book || req.book_id) && (
                          <Link
                            href={`/books/${req.book_id || req.book}`}
                            className="text-primary hover:underline inline-flex items-center gap-0.5 text-[11px]"
                          >
                            <span>عرض الكتاب</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-foreground-muted text-[11px]">
                        <span>تاريخ الطلب: {requestDate}</span>
                        {req.library_name && <span>المكتبة: {req.library_name}</span>}
                        {req.governorate_name && <span>المحافظة: {req.governorate_name}</span>}
                      </div>

                      {/* Display rejection reason if rejected */}
                      {req.status === "REJECTED" && (req.reason || req.rejection_reason) && (
                        <div className="mt-1.5 p-2 rounded-lg bg-red-50/70 border border-red-200 text-error text-[11px] flex items-start gap-1.5">
                          <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            <strong>سبب الرفض:</strong> {req.reason || req.rejection_reason}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-bold border",
                          statusMeta.bgClass
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Inbox className="w-12 h-12 text-foreground-subtle/40 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">
                  لا توجد طلبات استعارة مسجلة
                </p>
                <p className="text-[11px] text-foreground-muted max-w-sm mx-auto">
                  يمكنك تصفح مكتبة الوزارة وطلب استعارة أي مصنف ورقي متاح.
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

        {/* Tab: My Borrows (Reader Scope: GET /dashboard/borrows/) */}
        <TabsContent value="my-borrows" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                سجل الكتب المستعارة
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                قائمة الكتب المستعارة حالياً وتاريخ إرجاعها وفق النظام الموحد
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBorrowsList}
              disabled={isLoadingBorrows}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoadingBorrows && "animate-spin")} />
              <span>تحديث</span>
            </Button>
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
                const dueDate = b.due_date
                  ? new Date(b.due_date).toLocaleDateString("ar-SY", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : null;
                const returnDate = b.returned_at
                  ? new Date(b.returned_at).toLocaleDateString("ar-SY", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">
                          {bookTitle}
                        </span>
                        {(b.book || b.book_id) && (
                          <Link
                            href={`/books/${b.book_id || b.book}`}
                            className="text-primary hover:underline inline-flex items-center gap-0.5 text-[11px]"
                          >
                            <span>عرض الكتاب</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-foreground-muted text-[11px]">
                        <span>تاريخ الاستعارة: {borrowDate}</span>
                        {dueDate && <span>تاريخ الإرجاع المتوقع: {dueDate}</span>}
                        {returnDate && <span>تم الإرجاع في: {returnDate}</span>}
                        {b.library_name && <span>المكتبة: {b.library_name}</span>}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-bold border",
                          statusMeta.bgClass
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <BookmarkCheck className="w-12 h-12 text-foreground-subtle/40 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">
                  لا توجد كتب مستعارة حالياً
                </p>
                <p className="text-[11px] text-foreground-muted max-w-sm mx-auto">
                  عند موافقة أمين المكتبة على طلباتك، ستظهر المصنفات المستعارة هنا.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab: Change Password */}
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

        {/* Tab 3: Recent Activity */}
        <TabsContent value="activity" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-foreground">
              سجل النشاط والقراءة الأخير
            </h3>
            <span className="text-xs text-foreground-subtle">
              يتم تحديث السجل تلقائياً
            </span>
          </div>

          {profile?.activities && profile.activities.length > 0 ? (
            <div className="space-y-3">
              {profile.activities.map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle bg-surface-muted/60 hover:bg-surface-muted transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground-muted block mb-0.5">
                        {act.action || act.activity_type || "نشاط مكتبة"}
                      </span>
                      <span className="font-bold text-foreground">
                        {act.target || act.description || act.book_title || "عملية مطالعة"}
                      </span>
                    </div>
                  </div>

                  {act.created_at && (
                    <div className="flex items-center gap-1.5 text-foreground-subtle shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(act.created_at).toLocaleDateString("ar-SY")}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <FileText className="w-10 h-10 text-foreground-subtle/50 mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                لا توجد أنشطة مسجلة حتى الآن
              </p>
              <p className="text-[11px] text-foreground-muted max-w-sm mx-auto">
                عند قيامك بقراءة كتب أو حفظ مراجع في المفضلة، ستظهر الأنشطة في هذا السجل.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Credentials & Scope */}
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
                الدور الوظيفي المعتمد في الهيكلية:
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
                حالة الحساب والنفاذ:
              </span>
              <span className="font-semibold text-success flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>حساب نشط ومعتمد لدى وزارة الأوقاف السورية</span>
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
