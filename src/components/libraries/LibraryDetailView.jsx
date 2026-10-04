"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { librariesService } from "@/services/librariesService";
import { useAuth } from "@/hooks/useAuth";
import { Container } from "@/shared/Container";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import { formatArabicNumber } from "@/lib/utils";

export function LibraryDetailView({ libraryId }) {
  const { user, isAuthenticated } = useAuth();
  const requesterRole = user?.role?.code || "GUEST";
  const isStaff = ["MINISTRY_ADMIN", "GOVERNORATE_ADMIN", "LIBRARIAN", "SUPERUSER"].includes(
    requesterRole
  );

  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLibrary() {
      setIsLoading(true);
      setErrorStatus(null);
      setErrorMessage("");

      try {
        const res = await librariesService.getLibraryById(libraryId);
        setLibrary(res.data);
      } catch (err) {
        setErrorStatus(err.status || 404);
        setErrorMessage(
          err.message ||
            "المكتبة المطلوبة غير موجودة أو غير متاحة ضمن نطاق الصلاحيات الحالي."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (libraryId) {
      loadLibrary();
    }
  }, [libraryId]);

  return (
    <div className="py-8 sm:py-12 bg-background min-h-[calc(100vh-200px)]">
      <Container className="space-y-6 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-foreground-subtle rtl:rotate-180" />
          <Link href="/libraries" className="hover:text-primary transition-colors">
            دليل المكتبات
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-foreground-subtle rtl:rotate-180" />
          <span className="text-foreground truncate max-w-[200px]">
            {library?.name || `مكتبة #${libraryId}`}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-foreground-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-semibold">
              جاري تحميل بيانات المكتبة...
            </span>
          </div>
        )}

        {/* Error / 404 State */}
        {!isLoading && errorStatus && (
          <Card className="p-8 sm:p-12 text-center border-border">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
              المكتبة غير متاحة
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted max-w-md mx-auto mb-6 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/libraries">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  <span>العودة إلى دليل المكتبات</span>
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/login">
                  <Button variant="primary" size="sm" className="text-xs">
                    <span>تسجيل الدخول للمنظومة</span>
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Loaded Content */}
        {!isLoading && library && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Main Header Card */}
            <Card className="p-6 sm:p-8 bg-surface border-border shadow-card relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-subtle shrink-0">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="gold" size="sm" className="font-bold">
                        محافظة {library.governorate_name || library.governorate}
                      </Badge>
                      {library.is_active ? (
                        <Badge variant="success" size="sm" className="font-bold gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                          <span>مفتوحة ومفعّلة</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm" className="font-bold">
                          غير مفعّلة
                        </Badge>
                      )}
                      <span className="text-[10px] font-mono text-foreground-subtle">
                        رمز: #{library.id}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-foreground">
                      {library.name}
                    </h1>

                    {library.address && (
                      <p className="text-xs text-foreground-muted flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span>{library.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {isStaff && (
                  <Link href="/dashboard/libraries">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs whitespace-nowrap">
                      <span>إدارة المكتبة في اللوحة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border-subtle">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>معلومات التواصل والزيارة</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      رقم الهاتف المعتمد:
                    </span>
                    {library.phone ? (
                      <a
                        href={`tel:${library.phone}`}
                        className="font-mono text-primary font-bold hover:underline"
                        dir="ltr"
                      >
                        {library.phone}
                      </a>
                    ) : (
                      <span className="text-foreground-muted">غير محدد</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      البريد الإلكتروني:
                    </span>
                    {library.email ? (
                      <a
                        href={`mailto:${library.email}`}
                        className="text-primary font-semibold hover:underline"
                        dir="ltr"
                      >
                        {library.email}
                      </a>
                    ) : (
                      <span className="text-foreground-muted">غير محدد</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      العنوان الجغرافي:
                    </span>
                    <span className="text-foreground leading-relaxed">
                      {library.address || `محافظة ${library.governorate_name || library.governorate}`}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Administrative & Institutional Information */}
              <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border-subtle">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  <span>البيانات الإدارية والتوثيق</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      الجهة المشرفة:
                    </span>
                    <span className="text-foreground font-semibold">
                      وزارة الأوقاف — مديرية أوقاف {library.governorate_name || library.governorate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-foreground-subtle block mb-0.5">
                      حالة الاعتماد في المنظومة:
                    </span>
                    <span className="text-foreground font-semibold">
                      {library.is_active ? "معتمدة ونشطة في شبكة القراءة والخدمات" : "قيد الإجراء أو التحديث"}
                    </span>
                  </div>

                  {library.created_at && (
                    <div>
                      <span className="text-[11px] text-foreground-subtle block mb-0.5">
                        تاريخ التدشين الرقمي:
                      </span>
                      <span className="text-foreground font-mono" dir="ltr">
                        {new Date(library.created_at).toLocaleDateString("ar-SY")}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Next Phase Notice Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50/50 border border-primary/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-foreground-muted">
                <strong className="block text-primary font-bold mb-1">
                  فهرس الكتب والمخطوطات التابع لهذه المكتبة
                </strong>
                يجري حالياً ربط فهارس المصنفات والكتب المادية والمخطوطات الخاصة بهذه
                المكتبة وإتاحة خدمات الإعارة الرقمية في المرحلة القادمة.
              </div>
            </div>

            {/* Back to Directory Button */}
            <div className="pt-2 flex justify-start">
              <Link href="/libraries">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  <span>العودة إلى دليل جميع المكتبات</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
