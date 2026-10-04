"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { MinistryLogo } from "@/shared/MinistryLogo";
import { ErrorAlert } from "@/shared/ErrorAlert";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/profile";
  const justRegistered = searchParams.get("registered") === "1";

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(
    justRegistered
      ? "تم إنشاء حساب القارئ بنجاح! يمكنك الآن تسجيل الدخول مباشرة باستخدام اسم المستخدم أو البريد الإلكتروني."
      : ""
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, authLoading, redirectPath, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    if (!identifier.trim()) {
      setErrorMessage("يرجى إدخال اسم المستخدم أو البريد الإلكتروني.");
      return;
    }
    if (!password) {
      setErrorMessage("يرجى إدخال كلمة المرور.");
      return;
    }

    setIsLoading(true);

    try {
      await login({
        identifier: identifier.trim(),
        password,
      });

      setSuccessMessage("تم تسجيل الدخول بنجاح، جاري تحويلك...");
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 500);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(
        err.message || "اسم المستخدم أو كلمة المرور غير صحيحة."
      );
      setErrorCode(err.code || "");
      if (err.errors && typeof err.errors === "object") {
        setFieldErrors(err.errors);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Decorative Government Header Card */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {/* Institutional Top Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary w-full" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <MinistryLogo variant="vertical" asLink={false} />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground font-arabic">
                تسجيل الدخول الموحد
              </h1>
              <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                المنصة الرقمية لإدارة المراجع والمخطوطات
                <br />
                وزارة الأوقاف — الجمهورية العربية السورية
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          <ErrorAlert
            message={errorMessage}
            code={errorCode}
            errors={fieldErrors}
            onClose={() => setErrorMessage("")}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Identifier Input */}
            <div className="space-y-1.5 text-start">
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-foreground"
              >
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                disabled={isLoading}
                placeholder="مثال: ahmad أو ahmad@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                startIcon={User}
                error={!!fieldErrors.identifier || !!fieldErrors.username}
              />
              {(fieldErrors.identifier || fieldErrors.username) && (
                <p className="text-[11px] text-error">
                  {Array.isArray(fieldErrors.identifier || fieldErrors.username)
                    ? (fieldErrors.identifier || fieldErrors.username).join(", ")
                    : fieldErrors.identifier || fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-start">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground"
                >
                  كلمة المرور
                </label>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  startIcon={Lock}
                  error={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-foreground-subtle hover:text-foreground transition-colors"
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm font-bold shadow-card"
              isLoading={isLoading}
              disabled={isLoading}
            >
              <span>تسجيل الدخول</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Button>
          </form>

          {/* Registration Link Card */}
          <div className="pt-3 border-t border-border-subtle text-center space-y-2">
            <p className="text-xs text-foreground-muted">
              ليس لديك حساب بعد؟
            </p>
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-secondary/40 bg-secondary-50/50 text-secondary-hover hover:bg-secondary hover:text-white transition-all text-xs font-bold shadow-subtle"
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب قارئ جديد</span>
            </Link>
          </div>

          {/* Institutional Note */}
          <div className="pt-3 border-t border-border-subtle text-[11px] text-foreground-muted space-y-1.5 text-start">
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
              <span>نظام الدخول الموحد (JWT / HttpOnly)</span>
            </div>
            <p className="leading-relaxed text-foreground-subtle text-[10px]">
              المنصة مخصصة لخدمة الباحثين والقراء والكوادر الإشرافية في وزارة الأوقاف السورية.
            </p>
          </div>
        </div>
      </div>

      {/* Return to Home link */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs text-foreground-muted hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <span>العودة إلى الصفحة الرئيسية للمكتبة</span>
        </Link>
      </div>
    </div>
  );
}
