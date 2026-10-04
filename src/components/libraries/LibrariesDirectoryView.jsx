"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LogIn,
  RotateCw,
  Loader2,
  ChevronLeft,
  Calendar,
  Building,
} from "lucide-react";
import { librariesService } from "@/services/librariesService";
import { useAuth } from "@/hooks/useAuth";
import { Container } from "@/shared/Container";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import { Pagination } from "@/shared/Pagination";
import { formatArabicNumber, cn } from "@/lib/utils";

export function LibrariesDirectoryView() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const requesterRole = user?.role?.code || "GUEST";
  const isStaff = ["MINISTRY_ADMIN", "GOVERNORATE_ADMIN", "LIBRARIAN", "SUPERUSER"].includes(
    requesterRole
  );

  const [libraries, setLibraries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch libraries
  const fetchLibraries = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      // For reader, backend automatically scopes to user's governorate and only returns active libraries.
      // We don't send governorate or is_active query params.
      const res = await librariesService.getLibraries({
        search: debouncedSearch,
        page: currentPage,
        pageSize,
      });

      setLibraries(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      setErrorMsg(
        err.message || "تعذر جلب قائمة المكتبات في محافظتك. يرجى المحاولة مجدداً."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, debouncedSearch, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLibraries();
    }
  }, [isAuthenticated, fetchLibraries]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="py-8 sm:py-12 bg-background min-h-[calc(100vh-200px)]">
      <Container className="space-y-8">
        {/* Breadcrumb & Institutional Header */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-secondary">
            <ShieldCheck className="w-4 h-4" />
            <span>الجمهورية العربية السورية — وزارة الأوقاف</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                دليل المكتبات والمراكز الوقفية
              </h1>
              <p className="text-xs sm:text-sm text-foreground-muted mt-1 max-w-2xl leading-relaxed">
                الشبكة الوطنية للمكتبات والمراكز الثقافية ودور المخطوطات التابعة
                لوزارة الأوقاف، لخدمة القراء والباحثين في مختلف المحافظات.
              </p>
            </div>

            {/* Staff Quick Link */}
            {isStaff && (
              <Link href="/dashboard/libraries">
                <Button variant="secondary" size="sm" className="gap-2 text-xs font-bold shadow-subtle">
                  <span>لوحة إدارة المكتبات</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Unauthenticated State: Requires Login */}
        {!isAuthLoading && !isAuthenticated && (
          <Card className="p-8 sm:p-12 text-center max-w-xl mx-auto border-secondary/30 bg-gradient-to-b from-surface to-secondary-50/20 shadow-md">
            <div className="w-16 h-16 rounded-2xl bg-secondary-50 border border-secondary/30 text-secondary-hover flex items-center justify-center mx-auto mb-4 shadow-subtle">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              تسجيل الدخول مطلوب لاستعراض المكتبات
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted mb-6 leading-relaxed">
              وفق نظام المنظومة الرقمية لوزارة الأوقاف، يتم تخصيص واستعراض
              المكتبات والمراكز الوقفية والمصادر تلقائياً وفق النطاق الإداري
              والمحافظة المسجلة بحسابك.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto gap-2 text-xs font-bold">
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول للمنصة</span>
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full sm:w-auto text-xs font-bold">
                  <span>إنشاء حساب قارئ جديد</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Authenticated State */}
        {isAuthenticated && (
          <>
            {/* Search and Scope Banner */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border shadow-subtle">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Input
                  type="search"
                  placeholder="ابحث عن مكتبة في منطقتك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startIcon={Search}
                  className="text-xs h-10"
                />
              </div>

              {/* Scope & Refresh */}
              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-foreground-muted">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span>
                    النطاق:{" "}
                    <strong className="text-foreground">
                      {user?.governorate_name || "محافظتك"}
                    </strong>
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchLibraries}
                  disabled={isLoading}
                  className="gap-1.5 h-10"
                >
                  <RotateCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                  <span>تحديث</span>
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs">
                {errorMsg}
              </div>
            )}

            {/* Libraries Grid */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-foreground-muted">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-semibold">
                  جاري استرجاع المكتبات المعتمدة...
                </span>
              </div>
            ) : libraries.length === 0 ? (
              <Card className="p-12 text-center border-border">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  لا توجد مكتبات مطابقة حالياً
                </h3>
                <p className="text-xs text-foreground-muted max-w-md mx-auto">
                  {searchQuery
                    ? "لم يتم العثور على نتائج تطابق نص البحث. يرجى تجربة كلمات أخرى."
                    : "لا تتوفر مكتبات نشطة مسجلة في نطاق محافظتك حالياً."}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {libraries.map((lib) => (
                  <Card
                    key={lib.id}
                    className="p-5 sm:p-6 bg-surface border-border hover:border-primary/40 hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Tag & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="gold" size="sm" className="font-bold text-[10px]">
                          {lib.governorate_name || "محافظة"}
                        </Badge>
                        <Badge
                          variant="success"
                          size="sm"
                          className="text-[10px] gap-1 font-bold"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                          <span>مفتوحة للقراء</span>
                        </Badge>
                      </div>

                      {/* Name */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors shadow-subtle">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                            {lib.name}
                          </h3>
                          <span className="text-[10px] font-mono text-foreground-subtle">
                            رمز المنشأة #{lib.id}
                          </span>
                        </div>
                      </div>

                      {/* Contact & Location Info */}
                      <div className="space-y-2 text-xs text-foreground-muted pt-2 border-t border-border-subtle">
                        {lib.address ? (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                            <span className="leading-relaxed line-clamp-2">
                              {lib.address}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-foreground-subtle text-[11px]">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>المقر مسجل في مركز المحافظة</span>
                          </div>
                        )}

                        {lib.phone && (
                          <div className="flex items-center gap-2 font-mono text-[11px]" dir="ltr">
                            <Phone className="w-3.5 h-3.5 text-foreground-subtle shrink-0" />
                            <span className="text-foreground font-semibold">
                              {lib.phone}
                            </span>
                          </div>
                        )}

                        {lib.email && (
                          <div className="flex items-center gap-2 text-[11px] truncate" dir="ltr">
                            <Mail className="w-3.5 h-3.5 text-foreground-subtle shrink-0" />
                            <span className="truncate text-foreground-muted">
                              {lib.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between">
                      <span className="text-[10px] text-foreground-subtle">
                        الشبكة الرقمية للأوقاف
                      </span>
                      <Link href={`/libraries/${lib.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary font-bold group-hover:text-primary-hover p-0 h-auto gap-1"
                        >
                          <span>عرض بطاقة المكتبة</span>
                          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
