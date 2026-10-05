"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  BarChart2,
  Table as TableIcon,
  MapPin,
  Building2,
  BookOpen,
  Users,
  BookmarkCheck,
  TrendingUp,
  Info,
} from "lucide-react";
import { formatArabicNumber, cn } from "@/lib/utils";

const MINISTRY_METRICS = [
  { key: "books_count", label: "عدد الكتب", color: "#0d4a37" },
  { key: "period_borrows_count", label: "استعارات الفترة", color: "#c29b38" },
  { key: "active_borrows_count", label: "الاستعارات النشطة", color: "#10b981" },
  { key: "libraries_count", label: "عدد المكتبات", color: "#2563eb" },
  { key: "readers_count", label: "عدد القراء", color: "#8b5cf6" },
];

const GOV_METRICS = [
  { key: "books_count", label: "عدد الكتب", color: "#0d4a37" },
  { key: "period_borrows_count", label: "استعارات الفترة", color: "#c29b38" },
  { key: "active_borrows_count", label: "الاستعارات النشطة", color: "#10b981" },
  { key: "librarians_count", label: "أمناء المكتبات", color: "#2563eb" },
];

export function StatsDistributionsSection({
  distributionsData = {},
  scopeLevel = "MINISTRY",
  isLoading = false,
}) {
  const [viewMode, setViewMode] = useState("chart"); // 'chart' | 'table'
  const [selectedMetric, setSelectedMetric] = useState("books_count");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMinistry = scopeLevel === "MINISTRY";
  const isGov = scopeLevel === "GOVERNORATE";
  const isLibrarian = scopeLevel === "LIBRARY";

  const rawList = isMinistry
    ? distributionsData?.governorates || []
    : isGov
    ? distributionsData?.libraries || []
    : [];

  const metricsConfig = isMinistry ? MINISTRY_METRICS : GOV_METRICS;
  const currentMetricConf =
    metricsConfig.find((m) => m.key === selectedMetric) || metricsConfig[0];

  // If Librarian level
  if (isLibrarian) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-subtle flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-surface-muted text-foreground-muted">
          <Info className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">
            المقارنات الجغرافية والتنظيمية
          </h4>
          <p className="text-xs text-foreground-muted mt-0.5">
            هذا القسم مخصص لمقارنة أداء المحافظات والمكتبات المتعددة، وغير منطبق على مستوى المكتبة الواحدة المستقلة.
          </p>
        </div>
      </div>
    );
  }

  // Chart data formatting
  const chartData = rawList.map((item) => ({
    name: item.governorate_name || item.library_name || "مجهول",
    val: item[currentMetricConf.key] || 0,
    item,
  }));

  // Custom Chart Tooltip
  const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-surface/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-dropdown text-start text-xs space-y-1">
        <div className="font-bold text-foreground border-b border-border-subtle pb-1">
          {data.name}
        </div>
        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-foreground-muted">{currentMetricConf.label}:</span>
          <span className="font-extrabold text-primary font-arabic">
            {formatArabicNumber(data.val)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-subtle space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary-50 text-primary border border-primary/20">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {isMinistry
                ? "التوزيع والمقارنة بين المحافظات السورية"
                : "التوزيع والمقارنة بين مكتبات المحافظة"}
            </h3>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            مقارنة المؤشرات والنشاط العلمي عبر الوحدات التنظيمية التابعة لوزارة الأوقاف
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="inline-flex p-1 rounded-2xl bg-surface-muted border border-border-subtle text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
                viewMode === "chart"
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>مخطط بياني</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
                viewMode === "table"
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>جدول مقارنة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === "chart" ? (
        <div className="space-y-4">
          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-subtle">
            <span className="text-xs font-bold text-foreground-subtle me-1">
              المؤشر للمقارنة:
            </span>
            {metricsConfig.map((m) => {
              const isSelected = selectedMetric === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMetric(m.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                    isSelected
                      ? "bg-primary text-white border-primary shadow-subtle"
                      : "bg-surface-muted/70 text-foreground-muted border-transparent hover:border-border hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Bar Chart Container */}
          <div className="w-full h-80 sm:h-96 relative pt-2">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e3e6de"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: "#e3e6de" }}
                    tick={{ fill: "#4e6054", fontSize: 11, fontWeight: 600 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: "#e3e6de" }}
                    tick={{ fill: "#798d81", fontSize: 11 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="val"
                    name={currentMetricConf.label}
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={900}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#0d4a37" : "#c29b38"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted/60 text-foreground-muted font-bold">
                <th className="p-3 text-start">
                  {isMinistry ? "المحافظة" : "المكتبة"}
                </th>
                <th className="p-3 text-center">عدد الكتب</th>
                {isMinistry && <th className="p-3 text-center">المكتبات</th>}
                {isMinistry && <th className="p-3 text-center">القراء</th>}
                {!isMinistry && <th className="p-3 text-center">أمناء المكتبة</th>}
                <th className="p-3 text-center">الاستعارات النشطة</th>
                <th className="p-3 text-center">استعارات الفترة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rawList.map((item, idx) => (
                <tr
                  key={item.governorate_id || item.library_id || idx}
                  className="hover:bg-primary-50/40 transition-colors"
                >
                  <td className="p-3 font-bold text-foreground flex items-center gap-2">
                    {isMinistry ? (
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>{item.governorate_name || item.library_name}</span>
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {formatArabicNumber(item.books_count ?? 0)}
                  </td>
                  {isMinistry && (
                    <td className="p-3 text-center font-semibold">
                      {formatArabicNumber(item.libraries_count ?? 0)}
                    </td>
                  )}
                  {isMinistry && (
                    <td className="p-3 text-center font-semibold text-primary">
                      {formatArabicNumber(item.readers_count ?? 0)}
                    </td>
                  )}
                  {!isMinistry && (
                    <td className="p-3 text-center font-semibold text-primary">
                      {formatArabicNumber(item.librarians_count ?? 0)}
                    </td>
                  )}
                  <td className="p-3 text-center font-semibold text-emerald-700">
                    {formatArabicNumber(item.active_borrows_count ?? 0)}
                  </td>
                  <td className="p-3 text-center font-bold text-secondary-hover">
                    {formatArabicNumber(item.period_borrows_count ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
