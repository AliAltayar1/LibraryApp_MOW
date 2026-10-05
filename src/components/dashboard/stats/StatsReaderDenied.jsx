"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, BookOpen, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function StatsReaderDenied() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface rounded-3xl border border-border shadow-card p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-subtle">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 mb-3">
          403 - صلاحية غير مصرح بها
        </span>

        <h2 className="text-xl font-extrabold text-foreground mb-2">
          لوحة الإحصائيات مخصصة للكوادر الإدارية
        </h2>

        <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed mb-6">
          أهلاً بك {user?.first_name || user?.username || "عزيزنا القارئ"}. هذه اللوحة الإحصائية
          مخصصة حصراً لمسؤولي وزارة الأوقاف والمحافظات وأمناء المكتبات.
          بصفتك قارئاً، تتوفر لك كامل خدمات البحث، والمطالعة، وطلب الاستعارة عبر واجهة المكتبة العامة.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-subtle hover:bg-primary-hover transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>الانتقال إلى واجهة المكتبة العامة</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground-muted hover:text-error hover:bg-red-50 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج والتبديل لحساب إداري</span>
          </button>
        </div>
      </div>
    </div>
  );
}
