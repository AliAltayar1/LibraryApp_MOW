"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Sparkles, MapPin, Download, Eye, Award } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { formatArabicNumber } from "@/lib/utils";

export function DashboardAnalyticsManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await dashboardService.getAnalyticsData();
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-foreground-muted">
        جاري تجميع المؤشرات الإحصائية...
      </div>
    );
  }

  const { monthlyActivity, governorateDistribution, manuscriptsDigitizationGoal } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-subtle">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-foreground">
            التقارير الإحصائية ومؤشرات الرقمنة
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            رصد حركة الإقبال العلمي ونسب إنجاز أرشفة التراث الوقفي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-secondary-50 text-secondary-hover border border-secondary/20">
            تقرير رسمي معتمد للعام الحالي
          </span>
        </div>
      </div>

      {/* Target Progress Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary via-primary-light to-primary-900 text-white shadow-card border border-primary-light/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-secondary-light text-xs font-semibold mb-3 border border-white/15">
              <Award className="w-3.5 h-3.5" />
              <span>الخطة الاستراتيجية للرقمنة الشاملة</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">
              مشروع رقمنة نفائس المخطوطات والوثائق الوقفية
            </h3>
            <p className="text-xs sm:text-sm text-primary-100/90 leading-relaxed">
              تم إنجاز أرشفة {formatArabicNumber(manuscriptsDigitizationGoal.completed)} مخطوطة نادرة من أصل المستهدف البالغ {formatArabicNumber(manuscriptsDigitizationGoal.target)} مخطوطة.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 min-w-[180px]">
            <span className="text-3xl sm:text-4xl font-extrabold text-secondary">
              %{formatArabicNumber(manuscriptsDigitizationGoal.percentage)}
            </span>
            <span className="text-xs text-white/80 font-medium mt-1">
              نسبة الإنجاز المحققة
            </span>
          </div>
        </div>

        {/* Progress bar inside banner */}
        <div className="mt-6 pt-4 border-t border-white/15">
          <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-secondary-light to-secondary rounded-full transition-all duration-1000"
              style={{ width: `${manuscriptsDigitizationGoal.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Bars */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary-50 text-primary border border-primary/20">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    معدل القراءة والتنزيل الشهري
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    مقارنة إحصائية لآخر ٦ أشهر
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {monthlyActivity.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{item.month}</span>
                    <div className="flex items-center gap-4 text-foreground-subtle text-[11px]">
                      <span className="flex items-center gap-1 text-primary">
                        <Eye className="w-3 h-3" />
                        {formatArabicNumber(item.views)} قراءة
                      </span>
                      <span className="flex items-center gap-1 text-secondary-hover">
                        <Download className="w-3 h-3" />
                        {formatArabicNumber(item.downloads)} تحميل
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-surface-muted overflow-hidden flex gap-0.5">
                    <div
                      className="h-full bg-primary rounded-s-full"
                      style={{ width: `${(item.views / 50000) * 100}%` }}
                    />
                    <div
                      className="h-full bg-secondary rounded-e-full"
                      style={{ width: `${(item.downloads / 50000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-border-subtle flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-foreground-muted font-medium">المطالعة والتصفح الرقمي</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-foreground-muted font-medium">تحميل ملفات المخطوطات والـ PDF</span>
            </div>
          </div>
        </div>

        {/* Syrian Governorates Distribution */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-secondary-50 text-secondary-hover border border-secondary/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    التوزيع الجغرافي للمستفيدين والباحثين
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    نسبة الوصول والمطالعة حسب المحافظات السورية
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {governorateDistribution.map((gov, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{gov.governorate}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground-subtle text-[11px]">
                        {formatArabicNumber(gov.count)} باحث
                      </span>
                      <span className="font-bold text-primary w-8 text-end">
                        %{formatArabicNumber(gov.percentage)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden border border-border-subtle">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${gov.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-border-subtle text-xs text-foreground-subtle text-center">
            تحديث البيانات يتم بصورة دورية استناداً إلى سجلات الخادم الآمنة
          </div>
        </div>
      </div>
    </div>
  );
}
