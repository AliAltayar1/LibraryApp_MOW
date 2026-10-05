"use client";

import React from "react";
import {
  BookOpen,
  Layers,
  BookmarkCheck,
  Inbox,
  Users,
  Building2,
  TrendingUp,
  RotateCcw,
  FileCheck2,
  Heart,
  Feather,
  FolderTree,
  ShieldCheck,
  AlertOctagon,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatArabicNumber, cn } from "@/lib/utils";

export function StatsOverviewCards({ overviewData, periodInfo }) {
  if (!overviewData) return null;

  const {
    scope,
    organization,
    users,
    catalog = {},
    borrowing = {},
    requests = {},
    favorites = {},
  } = overviewData;

  const isLibraryLevel = scope?.level === "LIBRARY";
  const isGovLevel = scope?.level === "GOVERNORATE";
  const isMinistryLevel = scope?.level === "MINISTRY";

  // Copies calculations
  const totalCopies = catalog.total_copies ?? 0;
  const availableCopies = catalog.available_copies ?? 0;
  const borrowedCopies = catalog.borrowed_copies ?? (totalCopies - availableCopies);
  const availablePercentage = totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0;

  // Requests calculations
  const reqCurrent = requests.current || {};
  const reqPeriod = requests.period || {};
  const approvalRate = Number(reqPeriod.approval_rate || 0).toFixed(1);
  const rejectionRate = Number(reqPeriod.rejection_rate || 0).toFixed(1);

  // Borrowing calculations
  const borrowCurrent = borrowing.current || {};
  const borrowPeriod = borrowing.period || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. SNAPSHOT METRICS SECTION (الحالة الراهنة للمنظومة) */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-50 border border-primary/20 flex items-center justify-center text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                الحالة الراهنة للمنظومة (Snapshot)
              </h3>
              <p className="text-xs text-foreground-muted">
                إحصائيات آنية تعكس الواقع الفعلي للمكتبة حالياً، ولا تتأثر باختيار الفترة الزمنية
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-surface-muted text-foreground-subtle border border-border-subtle self-start sm:self-auto">
            تحديث لحظي مباشر
          </span>
        </div>

        {/* Snapshot KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Catalog Books */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  إجمالي المصنفات والكتب
                </span>
                <div className="p-2 rounded-xl bg-primary-50 text-primary group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(catalog.books_count ?? 0)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-foreground-subtle">كتب نشطة (متاحة):</span>
                <span className="font-bold text-success">
                  {formatArabicNumber(catalog.active_books_count ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-subtle">كتب مؤرشفة:</span>
                <span className="font-bold text-amber-700">
                  {formatArabicNumber(catalog.archived_books_count ?? 0)}
                </span>
              </div>
              {catalog.unavailable_books_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">غير متوفرة حالياً:</span>
                  <span className="font-bold text-error">
                    {formatArabicNumber(catalog.unavailable_books_count)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Copies Breakdown */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  النسخ الورقية والمتاحة
                </span>
                <div className="p-2 rounded-xl bg-secondary-50 text-secondary-hover group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(totalCopies)}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-primary h-full transition-all duration-700"
                  style={{ width: `${availablePercentage}%` }}
                  title={`متاح: ${availablePercentage}%`}
                />
                <div
                  className="bg-secondary h-full transition-all duration-700"
                  style={{ width: `${100 - availablePercentage}%` }}
                  title={`معار: ${100 - availablePercentage}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground-subtle">متاحة:</span>
                  <span className="font-bold text-primary">
                    {formatArabicNumber(availableCopies)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-foreground-subtle">معارة:</span>
                  <span className="font-bold text-secondary-hover">
                    {formatArabicNumber(borrowedCopies)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Active Borrows Currently */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  الاستعارات النشطة حالياً
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(borrowCurrent.active_borrows ?? 0)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px]">
              <span className="text-foreground-subtle">إجمالي الإرجاعات السابقة:</span>
              <span className="font-bold text-foreground">
                {formatArabicNumber(borrowCurrent.returned_borrows_total ?? 0)}
              </span>
            </div>
          </div>

          {/* Card 4: Pending Requests */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  طلبات استعارة بانتظار البت
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(reqCurrent.pending_requests ?? 0)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-foreground-muted flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>تتطلب مراجعة واعتماد أمين المكتبة</span>
            </div>
          </div>
        </div>

        {/* Extended Snapshot Row: Users, Organization, Authors & Favorites */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Users Card */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground-muted">
                المستفيدون والكوادر
              </span>
              <Users className="w-4 h-4 text-primary" />
            </div>

            {isLibraryLevel ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-2xl bg-surface-muted text-[11px] text-foreground-muted leading-relaxed">
                  القراء مرتبطون بالمحافظة وليس بالمكتبة مباشرةً.
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle">
                  <span className="text-foreground-subtle">أمناء المكتبة:</span>
                  <span className="font-bold text-primary">
                    {formatArabicNumber(users?.librarians_count ?? 0)} ({formatArabicNumber(users?.active_librarians_count ?? 0)} نشط)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">إجمالي القراء:</span>
                  <span className="font-bold text-foreground">
                    {formatArabicNumber(users?.readers_count ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-success">
                  <span>قراء نشطون:</span>
                  <span className="font-bold">
                    {formatArabicNumber(users?.active_readers_count ?? 0)}
                  </span>
                </div>
                {users?.borrowing_blocked_readers_count > 0 && (
                  <div className="flex items-center justify-between text-error">
                    <span>محظورون عن الاستعارة:</span>
                    <span className="font-bold">
                      {formatArabicNumber(users?.borrowing_blocked_readers_count)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                  <span className="text-foreground-subtle">أمناء المكتبات:</span>
                  <span className="font-bold text-primary">
                    {formatArabicNumber(users?.librarians_count ?? 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Organization Card */}
          {organization ? (
            <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-foreground-muted">
                  الهيكل التنظيمي
                </span>
                <Building2 className="w-4 h-4 text-secondary-hover" />
              </div>

              <div className="space-y-2 text-[11px]">
                {organization.governorates_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-subtle">المحافظات:</span>
                    <span className="font-bold text-foreground">
                      {formatArabicNumber(organization.governorates_count)} (
                      <span className="text-success">{formatArabicNumber(organization.active_governorates_count)} نشطة</span>)
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">المكتبات والمراكز:</span>
                  <span className="font-bold text-foreground">
                    {formatArabicNumber(organization.libraries_count)} (
                    <span className="text-success">{formatArabicNumber(organization.active_libraries_count)} مفعّلة</span>)
                  </span>
                </div>
                {organization.inactive_libraries_count > 0 && (
                  <div className="flex items-center justify-between text-amber-700">
                    <span>مكتبات معطلة:</span>
                    <span className="font-bold">
                      {formatArabicNumber(organization.inactive_libraries_count)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-foreground-muted">
                  حالة المكتبة
                </span>
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs text-foreground-muted">
                {scope?.library?.name || "المكتبة التابعة لوزارة الأوقاف"}
              </div>
              <div className="pt-2 border-t border-border-subtle text-[11px] text-success font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>مكتبة معتمدة رسمياً</span>
              </div>
            </div>
          )}

          {/* Authors & Categories Card */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground-muted">
                التنوع المعرفي والمؤلفون
              </span>
              <Feather className="w-4 h-4 text-emerald-700" />
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-foreground-subtle">العلماء والمؤلفون:</span>
                <span className="font-bold text-foreground">
                  {formatArabicNumber(catalog.authors_count ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-subtle">التصنيفات والعلوم:</span>
                <span className="font-bold text-foreground">
                  {formatArabicNumber(catalog.categories_count ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Current Favorites Card */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground-muted">
                المصنفات في المفضلة
              </span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>

            <div>
              <div className="text-2xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(favorites.current?.favorites_count ?? 0)}
              </div>
              <p className="text-[11px] text-foreground-subtle mt-1">
                إجمالي مرات الحفظ في المفضلة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. PERIOD ACTIVITY METRICS SECTION (نشاط الفترة المحددة) */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary-50 border border-secondary/20 flex items-center justify-center text-secondary-hover">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                نشاط الفترة المحددة (Period Activity)
              </h3>
              <p className="text-xs text-foreground-muted">
                الحركات والمعاملات المسجلة خلال الفترة (
                {periodInfo?.date_from} إلى {periodInfo?.date_to})
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-secondary-50 text-secondary-hover border border-secondary/20 self-start sm:self-auto">
            مرتبط بالفترة المحددة
          </span>
        </div>

        {/* Period KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Period 1: Borrows Created */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  استعارات بدأت بالفترة
                </span>
                <div className="p-2 rounded-xl bg-primary-50 text-primary">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(borrowPeriod.borrows_created ?? 0)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-foreground-subtle">مباشرة من موظف:</span>
                <span className="font-bold text-foreground">
                  {formatArabicNumber(borrowPeriod.direct_borrows ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-subtle">عبر طلب إلكتروني:</span>
                <span className="font-bold text-primary">
                  {formatArabicNumber(borrowPeriod.request_borrows ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Period 2: Returns Completed */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  عمليات الإرجاع المنجزة
                </span>
                <div className="p-2 rounded-xl bg-secondary-50 text-secondary-hover">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(borrowPeriod.returns ?? 0)}
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              كتب مستردة تم إعادتها إلى الأرفف
            </p>
          </div>

          {/* Period 3: New Requests Created */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  طلبات استعارة جديدة
                </span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(reqPeriod.requests_created ?? 0)}
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              طلبات وردت من القراء والباحثين
            </p>
          </div>

          {/* Period 4: Approval & Decisions */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  نسبة قبول الطلبات
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-success tracking-tight">
                %{formatArabicNumber(approvalRate)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-success font-semibold">مقبول:</span>
                <span className="font-bold">
                  {formatArabicNumber(reqPeriod.approved_requests ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-error font-semibold">مرفوض:</span>
                <span className="font-bold">
                  {formatArabicNumber(reqPeriod.rejected_requests ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-foreground-subtle pt-1 border-t border-border-subtle">
                <span>المحسومة:</span>
                <span>{formatArabicNumber(reqPeriod.decided_requests ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Period 5: Favorites Added in Period */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground-muted">
                  أضيفت للمفضلة بالفترة
                </span>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatArabicNumber(favorites.period?.favorites_added ?? 0)}
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              إقبال اهتمام القراء خلال الفترة
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
