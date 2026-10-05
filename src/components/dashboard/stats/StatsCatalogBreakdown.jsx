"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Layers, PieChart as PieIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatArabicNumber } from "@/lib/utils";

const COPIES_COLORS = ["#0d4a37", "#c29b38"];
const BOOKS_COLORS = ["#10b981", "#d97706", "#ef4444"];
const REQUESTS_COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export function StatsCatalogBreakdown({ overviewData }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!overviewData) return null;

  const { catalog = {}, requests = {} } = overviewData;

  const totalCopies = catalog.total_copies || 0;
  const availableCopies = catalog.available_copies || 0;
  const borrowedCopies = catalog.borrowed_copies || (totalCopies - availableCopies);

  const copiesData = [
    { name: "نسخ متاحة للإعارة", value: availableCopies },
    { name: "نسخ معارة حالياً", value: borrowedCopies },
  ];

  const booksData = [
    { name: "مصنفات نشطة", value: catalog.active_books_count || 0 },
    { name: "مصنفات مؤرشفة", value: catalog.archived_books_count || 0 },
    { name: "غير متوفرة حالياً", value: catalog.unavailable_books_count || 0 },
  ].filter((d) => d.value > 0);

  const reqPeriod = requests.period || {};
  const reqCurrent = requests.current || {};
  const requestsData = [
    { name: "طلبات مقبولة", value: reqPeriod.approved_requests || 0 },
    { name: "طلبات مرفوضة", value: reqPeriod.rejected_requests || 0 },
    { name: "طلبات معلقة قيد النظر", value: reqCurrent.pending_requests || 0 },
  ].filter((d) => d.value > 0);

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];

    return (
      <div className="bg-surface/95 backdrop-blur-md border border-border p-2.5 rounded-xl shadow-dropdown text-start text-xs space-y-1">
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.payload.fill || item.color }}
          />
          <span>{item.name}:</span>
        </div>
        <div className="font-bold text-primary font-arabic text-sm">
          {formatArabicNumber(item.value)}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Copies Donut */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">
              توزيع النسخ الورقية
            </span>
            <div className="p-1.5 rounded-lg bg-primary-50 text-primary">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-[11px] text-foreground-muted">
            نسبة النسخ المتاحة للطلب الفوري مقارنة بالنسخ المعارة
          </p>
        </div>

        <div className="h-56 relative my-2">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={copiesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {copiesData.map((entry, index) => (
                    <Cell
                      key={`cell-copies-${index}`}
                      fill={COPIES_COLORS[index % COPIES_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex items-center justify-around text-xs pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-foreground-muted text-[11px]">متاحة:</span>
            <span className="font-bold text-foreground">
              {formatArabicNumber(availableCopies)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <span className="text-foreground-muted text-[11px]">معارة:</span>
            <span className="font-bold text-foreground">
              {formatArabicNumber(borrowedCopies)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Books Status Donut */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">
              حالة الفهرس والمصنفات
            </span>
            <div className="p-1.5 rounded-lg bg-secondary-50 text-secondary-hover">
              <PieIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-[11px] text-foreground-muted">
            توزيع الكتب حسب حالة التفعيل والأرشفة والتوفر
          </p>
        </div>

        <div className="h-56 relative my-2">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={booksData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {booksData.map((entry, index) => (
                    <Cell
                      key={`cell-books-${index}`}
                      fill={BOOKS_COLORS[index % BOOKS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-around gap-2 text-xs pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-foreground-muted text-[11px]">نشطة:</span>
            <span className="font-bold text-foreground">
              {formatArabicNumber(catalog.active_books_count ?? 0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-foreground-muted text-[11px]">مؤرشفة:</span>
            <span className="font-bold text-foreground">
              {formatArabicNumber(catalog.archived_books_count ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Requests Decisions Donut */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">
              مخرجات معالجة طلبات الاستعارة
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-[11px] text-foreground-muted">
            القرارات المتخذة بشأن طلبات القراء (مقبول / مرفوض / معلق)
          </p>
        </div>

        <div className="h-56 relative my-2">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {requestsData.map((entry, index) => (
                    <Cell
                      key={`cell-reqs-${index}`}
                      fill={REQUESTS_COLORS[index % REQUESTS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-around gap-2 text-xs pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-foreground-muted text-[11px]">مقبول:</span>
            <span className="font-bold text-success">
              {formatArabicNumber(reqPeriod.approved_requests ?? 0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-foreground-muted text-[11px]">مرفوض:</span>
            <span className="font-bold text-error">
              {formatArabicNumber(reqPeriod.rejected_requests ?? 0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-foreground-muted text-[11px]">معلق:</span>
            <span className="font-bold text-amber-700">
              {formatArabicNumber(reqCurrent.pending_requests ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
