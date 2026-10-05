"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Activity,
  Layers,
  TrendingUp,
  BookmarkCheck,
  RotateCcw,
  Inbox,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatArabicNumber, cn } from "@/lib/utils";

const SERIES_CONFIG = [
  {
    key: "borrows",
    name: "الاستعارات",
    color: "#0d4a37",
    gradientId: "colorBorrows",
    icon: BookmarkCheck,
    defaultActive: true,
  },
  {
    key: "returns",
    name: "عمليات الإرجاع",
    color: "#c29b38",
    gradientId: "colorReturns",
    icon: RotateCcw,
    defaultActive: true,
  },
  {
    key: "requests",
    name: "طلبات الاستعارة",
    color: "#2563eb",
    gradientId: "colorRequests",
    icon: Inbox,
    defaultActive: true,
  },
  {
    key: "approved_requests",
    name: "الطلبات المقبولة",
    color: "#10b981",
    gradientId: "colorApproved",
    icon: CheckCircle2,
    defaultActive: false,
  },
  {
    key: "rejected_requests",
    name: "الطلبات المرفوضة",
    color: "#ef4444",
    gradientId: "colorRejected",
    icon: XCircle,
    defaultActive: false,
  },
];

export function StatsTimelineChart({ timelineData = [], isLoading = false }) {
  const [chartType, setChartType] = useState("area"); // 'area' | 'line'
  const [activeSeries, setActiveSeries] = useState({
    borrows: true,
    returns: true,
    requests: true,
    approved_requests: false,
    rejected_requests: false,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSeries = (key) => {
    setActiveSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Compute summary totals for timeline
  const totals = (timelineData || []).reduce(
    (acc, curr) => ({
      borrows: acc.borrows + (curr.borrows || 0),
      returns: acc.returns + (curr.returns || 0),
      requests: acc.requests + (curr.requests || 0),
      approved: acc.approved + (curr.approved_requests || 0),
      rejected: acc.rejected + (curr.rejected_requests || 0),
    }),
    { borrows: 0, returns: 0, requests: 0, approved: 0, rejected: 0 }
  );

  // Custom Arabic Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-surface/95 backdrop-blur-md border border-border p-3.5 rounded-2xl shadow-dropdown text-start min-w-[200px] text-xs space-y-2">
        <div className="font-bold text-foreground border-b border-border-subtle pb-1.5 flex items-center justify-between">
          <span>التاريخ:</span>
          <span className="text-primary font-mono">{label}</span>
        </div>

        <div className="space-y-1.5">
          {payload.map((item) => {
            const conf = SERIES_CONFIG.find((s) => s.key === item.dataKey);
            return (
              <div
                key={item.dataKey}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-foreground-muted">
                    {conf?.name || item.name}:
                  </span>
                </div>
                <span className="font-bold text-foreground font-arabic">
                  {formatArabicNumber(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-subtle space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary-50 text-primary border border-primary/20">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              الخط الزمني للحركة والعمليات (Timeline)
            </h3>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            مخطط بياني يومي دقيق لرصد وتيرة الاستعارات والإرجاعات والطلبات خلال كامل الفترة
          </p>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="inline-flex p-1 rounded-2xl bg-surface-muted border border-border-subtle text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all",
                chartType === "area"
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              مساحي متدرج (Area)
            </button>
            <button
              type="button"
              onClick={() => setChartType("line")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all",
                chartType === "line"
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              خطي ناعم (Line)
            </button>
          </div>
        </div>
      </div>

      {/* Series Filter Checkboxes */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-subtle">
        <span className="text-xs font-bold text-foreground-subtle me-1">
          إظهار السلاسل:
        </span>
        {SERIES_CONFIG.map((conf) => {
          const isActive = activeSeries[conf.key];
          const Icon = conf.icon;
          return (
            <button
              key={conf.key}
              type="button"
              onClick={() => toggleSeries(conf.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                isActive
                  ? "bg-surface shadow-subtle border-border text-foreground"
                  : "bg-surface-muted/60 border-transparent text-foreground-subtle opacity-60 hover:opacity-100"
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: isActive ? conf.color : "#9ca3af",
                }}
              />
              <Icon className="w-3.5 h-3.5" style={{ color: isActive ? conf.color : undefined }} />
              <span>{conf.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Chart Container */}
      <div className="w-full h-80 sm:h-96 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-surface/70 backdrop-blur-xs flex items-center justify-center rounded-2xl">
            <span className="text-xs font-bold text-primary animate-pulse">
              جاري تحديث المخطط البياني...
            </span>
          </div>
        )}

        {isMounted && (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  {SERIES_CONFIG.map((s) => (
                    <linearGradient
                      key={s.gradientId}
                      id={s.gradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e3e6de"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#e3e6de" }}
                  tick={{ fill: "#798d81", fontSize: 11 }}
                  tickFormatter={(val) => {
                    if (!val) return "";
                    // Show MM-DD
                    const parts = val.split("-");
                    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "#e3e6de" }}
                  tick={{ fill: "#798d81", fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {SERIES_CONFIG.map(
                  (s) =>
                    activeSeries[s.key] && (
                      <Area
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.name}
                        stroke={s.color}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill={`url(#${s.gradientId})`}
                        isAnimationActive={true}
                        animationDuration={1000}
                      />
                    )
                )}
              </AreaChart>
            ) : (
              <LineChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e3e6de"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#e3e6de" }}
                  tick={{ fill: "#798d81", fontSize: 11 }}
                  tickFormatter={(val) => {
                    if (!val) return "";
                    const parts = val.split("-");
                    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "#e3e6de" }}
                  tick={{ fill: "#798d81", fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {SERIES_CONFIG.map(
                  (s) =>
                    activeSeries[s.key] && (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.name}
                        stroke={s.color}
                        strokeWidth={2.5}
                        dot={{ r: 2.5, fill: s.color }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={true}
                        animationDuration={1000}
                      />
                    )
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Metrics Bar below Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-subtle text-xs">
        <div className="p-3 rounded-2xl bg-surface-muted/60 border border-border-subtle">
          <span className="text-foreground-subtle block text-[11px] mb-1">
            إجمالي استعارات الفترة:
          </span>
          <span className="text-base font-extrabold text-primary font-arabic">
            {formatArabicNumber(totals.borrows)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-surface-muted/60 border border-border-subtle">
          <span className="text-foreground-subtle block text-[11px] mb-1">
            إجمالي عمليات الإرجاع:
          </span>
          <span className="text-base font-extrabold text-secondary-hover font-arabic">
            {formatArabicNumber(totals.returns)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-surface-muted/60 border border-border-subtle">
          <span className="text-foreground-subtle block text-[11px] mb-1">
            إجمالي الطلبات المقدمة:
          </span>
          <span className="text-base font-extrabold text-blue-700 font-arabic">
            {formatArabicNumber(totals.requests)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-surface-muted/60 border border-border-subtle">
          <span className="text-foreground-subtle block text-[11px] mb-1">
            الطلبات المقبولة / المرفوضة:
          </span>
          <span className="text-base font-extrabold text-foreground font-arabic">
            <span className="text-success">{formatArabicNumber(totals.approved)}</span>
            {" / "}
            <span className="text-error">{formatArabicNumber(totals.rejected)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
