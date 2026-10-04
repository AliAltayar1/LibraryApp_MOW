"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { MinistryLogo } from "@/shared/MinistryLogo";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

export function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    governorate: "",
    password: "",
    password2: "",
  });

  const [governorates, setGovernorates] = useState([]);
  const [loadingGovs, setLoadingGovs] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile");
    }
  }, [isAuthenticated, router]);

  // Load active governorates from backend
  useEffect(() => {
    let isMounted = true;
    authService
      .getGovernorates()
      .then((data) => {
        if (isMounted) {
          setGovernorates(Array.isArray(data) ? data : []);
          setLoadingGovs(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingGovs(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    // Client-side validations
    if (!form.username.trim()) {
      setErrorMsg("يرجى إدخال اسم المستخدم.");
      return;
    }
    if (!form.email.trim()) {
      setErrorMsg("يرجى إدخال البريد الإلكتروني.");
      return;
    }
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setErrorMsg("يرجى إدخال الاسم الأول واسم العائلة.");
      return;
    }
    if (!form.governorate) {
      setErrorMsg("يرجى اختيار المحافظة التابع لها.");
      return;
    }
    if (!form.password) {
      setErrorMsg("يرجى إدخال كلمة المرور.");
      return;
    }
    if (form.password !== form.password2) {
      setFieldErrors({ password2: ["كلمتا المرور غير متطابقتين."] });
      setErrorMsg("كلمتا المرور غير متطابقتين.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(form);
      // Redirect to login with query param indicating successful registration
      router.push("/login?registered=1");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(
        err.message ||
          "فشل تسجيل الحساب، يرجى مراجعة البيانات المدخلة والمحاولة ثانيةً."
      );
      setErrorCode(err.code || "");
      if (err.errors && typeof err.errors === "object") {
        setFieldErrors(err.errors);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {/* Top Institutional Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary w-full" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <MinistryLogo variant="vertical" asLink={false} />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground font-arabic">
                إنشاء حساب قارئ جديد
              </h1>
              <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                انضم إلى المنصة الرقمية الموحدة لوزارة الأوقاف في الجمهورية
                العربية السورية
              </p>
            </div>
          </div>

          {/* Error Banner */}
          <ErrorAlert
            message={errorMsg}
            code={errorCode}
            errors={fieldErrors}
            onClose={() => setErrorMsg("")}
          />

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* First Name */}
              <div className="space-y-1 text-start">
                <label
                  htmlFor="first_name"
                  className="block text-xs font-semibold text-foreground"
                >
                  الاسم الأول *
                </label>
                <Input
                  id="first_name"
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="أحمد"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  startIcon={User}
                  error={!!fieldErrors.first_name}
                />
                {fieldErrors.first_name && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(fieldErrors.first_name)
                      ? fieldErrors.first_name.join(", ")
                      : fieldErrors.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1 text-start">
                <label
                  htmlFor="last_name"
                  className="block text-xs font-semibold text-foreground"
                >
                  اسم العائلة / الكنية *
                </label>
                <Input
                  id="last_name"
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="محمد"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  startIcon={User}
                  error={!!fieldErrors.last_name}
                />
                {fieldErrors.last_name && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(fieldErrors.last_name)
                      ? fieldErrors.last_name.join(", ")
                      : fieldErrors.last_name}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-1 text-start">
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold text-foreground"
                >
                  اسم المستخدم (المعرف) *
                </label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  dir="ltr"
                  disabled={isLoading}
                  placeholder="ahmad_reader"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  error={!!fieldErrors.username}
                />
                {fieldErrors.username && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(fieldErrors.username)
                      ? fieldErrors.username.join(", ")
                      : fieldErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1 text-start">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-foreground"
                >
                  البريد الإلكتروني *
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  dir="ltr"
                  disabled={isLoading}
                  placeholder="ahmad@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  startIcon={Mail}
                  error={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(fieldErrors.email)
                      ? fieldErrors.email.join(", ")
                      : fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Governorate Dropdown */}
              <div className="space-y-1 text-start sm:col-span-2">
                <label
                  htmlFor="governorate"
                  className="block text-xs font-semibold text-foreground"
                >
                  المحافظة *
                </label>
                <div className="relative">
                  <select
                    id="governorate"
                    name="governorate"
                    required
                    disabled={isLoading || loadingGovs}
                    value={form.governorate}
                    onChange={(e) =>
                      setForm({ ...form, governorate: e.target.value })
                    }
                    className={`w-full h-10 rounded-gov border bg-surface px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 ${
                      fieldErrors.governorate
                        ? "border-error focus:border-error"
                        : "border-border"
                    }`}
                  >
                    <option value="">
                      {loadingGovs
                        ? "جاري تحميل قائمة المحافظات..."
                        : governorates.length === 0
                        ? "-- لا توجد محافظات فعالة في السيرفر حالياً --"
                        : "-- اختر المحافظة التابع لها --"}
                    </option>
                    {governorates.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {gov.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!loadingGovs && governorates.length === 0 && (
                  <p className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 flex items-start gap-2 mt-1.5 leading-relaxed">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      قاعدة بيانات الخادم لا تحتوي على محافظات فعّالة حالياً (data: []). بمجرد إضافتها في لوحة الإدارة ستظهر في القائمة مباشرةً.
                    </span>
                  </p>
                )}
                {fieldErrors.governorate && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(fieldErrors.governorate)
                      ? fieldErrors.governorate.join(", ")
                      : fieldErrors.governorate}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1 text-start">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground"
                >
                  كلمة المرور *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    startIcon={Lock}
                    error={!!fieldErrors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-foreground-subtle hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(fieldErrors.password)
                      ? fieldErrors.password.join(", ")
                      : fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Password2 (Confirm) */}
              <div className="space-y-1 text-start">
                <label
                  htmlFor="password2"
                  className="block text-xs font-semibold text-foreground"
                >
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <Input
                    id="password2"
                    type={showPassword2 ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    value={form.password2}
                    onChange={(e) =>
                      setForm({ ...form, password2: e.target.value })
                    }
                    startIcon={Lock}
                    error={!!fieldErrors.password2}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-foreground-subtle hover:text-foreground"
                  >
                    {showPassword2 ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password2 && (
                  <p className="text-[11px] text-error">
                    {Array.isArray(fieldErrors.password2)
                      ? fieldErrors.password2.join(", ")
                      : fieldErrors.password2}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-sm font-bold shadow-card"
                isLoading={isLoading}
                disabled={isLoading}
              >
                <span>إنشاء الحساب</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </form>

          {/* Institutional note */}
          <div className="pt-4 border-t border-border-subtle text-[11px] text-foreground-muted space-y-1.5 text-start">
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
              <span>حساب قارئ معتمد لدى وزارة الأوقاف</span>
            </div>
            <p className="text-foreground-subtle leading-relaxed">
              يمنحك الحساب إمكانية تصفح المخطوطات والكتب، وحفظ مراجعك المفضلة،
              والمطالعة الأكاديمية ضمن نطاق المحافظة المحددة.
            </p>
          </div>
        </div>
      </div>

      {/* Already have an account link */}
      <div className="text-center mt-6">
        <Link
          href="/login"
          className="text-xs text-foreground-muted hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <span>لديك حساب مسجل بالفعل؟</span>
          <span className="font-bold text-primary underline">تسجيل الدخول</span>
        </Link>
      </div>
    </div>
  );
}
