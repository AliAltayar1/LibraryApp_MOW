"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  BookOpen,
  Inbox,
  Heart,
  Building2,
  MapPin,
  ExternalLink,
  Flame,
  Award,
  Layers,
} from "lucide-react";
import { formatArabicNumber, cn } from "@/lib/utils";

export function StatsRankingsSection({
  rankingsData = {},
  currentLimit = 5,
  onLimitChange,
  isLoading = false,
  scopeLevel = "MINISTRY",
}) {
  const [activeTab, setActiveTab] = useState("borrowed");

  const {
    most_borrowed_books = [],
    most_requested_books = [],
    most_favorited_books = [],
    most_active_libraries = [],
    most_active_governorates = [],
    favorites_window = "LIFETIME",
  } = rankingsData || {};

  const tabs = [
    {
      id: "borrowed",
      label: "الكتب الأكثر استعارة",
      icon: BookOpen,
      count: most_borrowed_books.length,
      available: true,
    },
    {
      id: "requested",
      label: "الكتب الأكثر طلباً",
      icon: Inbox,
      count: most_requested_books.length,
      available: true,
    },
    {
      id: "favorited",
      label: "الأكثر بالمفضلة",
      icon: Heart,
      count: most_favorited_books.length,
      badge: "LIFETIME",
      available: true,
    },
    {
      id: "libraries",
      label: "المكتبات الأكثر نشاطاً",
      icon: Building2,
      count: most_active_libraries.length,
      available: scopeLevel !== "LIBRARY" && most_active_libraries.length > 0,
    },
    {
      id: "governorates",
      label: "المحافظات الأكثر نشاطاً",
      icon: MapPin,
      count: most_active_governorates.length,
      available: scopeLevel === "MINISTRY" && most_active_governorates.length > 0,
    },
  ].filter((t) => t.available);

  // Fallback tab if current activeTab became unavailable
  const currentTab = tabs.find((t) => t.id === activeTab) ? activeTab : "borrowed";

  const getRankBadge = (index) => {
    if (index === 0) {
      return {
        bg: "bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30",
        label: "١",
        icon: "🥇",
      };
    }
    if (index === 1) {
      return {
        bg: "bg-slate-200 text-slate-800 border-slate-300",
        label: "٢",
        icon: "🥈",
      };
    }
    if (index === 2) {
      return {
        bg: "bg-amber-700/10 text-amber-800 border-amber-600/30",
        label: "٣",
        icon: "🥉",
      };
    }
    return {
      bg: "bg-surface-muted text-foreground-muted border-border",
      label: formatArabicNumber(index + 1),
      icon: null,
    };
  };

  // Helper to render ranking item
  const renderList = (items, type) => {
    if (!items || items.length === 0) {
      return (
        <div className="p-12 text-center text-xs text-foreground-muted">
          لا توجد بيانات متاحة للتصنيف في هذا النطاق خلال الفترة المحددة.
        </div>
      );
    }

    const maxVal = Math.max(...items.map((i) => i.count || i.borrows_count || 1));

    return (
      <div className="space-y-3">
        {items.map((item, idx) => {
          const count = item.count ?? item.borrows_count ?? 0;
          const percentage = maxVal > 0 ? Math.round((count / maxVal) * 100) : 0;
          const rank = getRankBadge(idx);

          return (
            <div
              key={item.book_id || item.library_id || item.governorate_id || idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-surface border border-border hover:border-secondary/50 transition-all shadow-subtle hover:shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                {/* Rank Badge */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0",
                    rank.bg
                  )}
                >
                  {rank.icon ? (
                    <span className="text-sm">{rank.icon}</span>
                  ) : (
                    <span>{rank.label}</span>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title || item.library_name || item.governorate_name}
                    </h4>
                  </div>

                  {/* Sub-meta tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-foreground-subtle">
                    {item.library_name && type !== "libraries" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-muted text-foreground-muted">
                        <Building2 className="w-3 h-3 text-secondary" />
                        <span>{item.library_name}</span>
                      </span>
                    )}

                    {item.governorate_name && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-muted text-foreground-muted">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{item.governorate_name}</span>
                      </span>
                    )}

                    {type === "favorited" && (
                      <span className="text-[10px] text-rose-600 font-semibold">
                        إجمالي تاريخي تراكمي
                      </span>
                    )}
                  </div>

                  {/* Relative Visual Bar */}
                  <div className="w-full h-1.5 rounded-full bg-surface-muted mt-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        idx === 0
                          ? "bg-secondary"
                          : idx === 1
                          ? "bg-primary"
                          : "bg-primary-light"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Count & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border-subtle">
                <div className="text-end">
                  <span className="text-sm sm:text-base font-extrabold text-foreground font-arabic block leading-none">
                    {formatArabicNumber(count)}
                  </span>
                  <span className="text-[10px] text-foreground-subtle">
                    {type === "borrowed"
                      ? "إعارة"
                      : type === "requested"
                      ? "طلب"
                      : type === "favorited"
                      ? "تفضيل"
                      : "حركة إعارة"}
                  </span>
                </div>

                {item.book_id && (
                  <Link
                    href={`/books/${item.book_id}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-foreground-subtle hover:text-primary hover:bg-primary-50 transition-colors"
                    title="معاينة الكتاب"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-subtle space-y-5">
      {/* Header & Limit Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-secondary-50 text-secondary-hover border border-secondary/20">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              لوائح الصدارة ومؤشرات التميز (Rankings)
            </h3>
            <p className="text-xs text-foreground-muted">
              المصنفات والمؤسسات الأكثر طلباً ونشاطاً استناداً إلى سجلات النظام الفعلي
            </p>
          </div>
        </div>

        {/* Limit Toggle (5 or 10) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-foreground-subtle font-semibold">
            عدد العناصر:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-surface-muted border border-border-subtle text-xs font-bold">
            <button
              type="button"
              onClick={() => onLimitChange(5)}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all",
                currentLimit === 5
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              ٥ عناصر
            </button>
            <button
              type="button"
              onClick={() => onLimitChange(10)}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all",
                currentLimit === 10
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              ١٠ عناصر
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-surface-muted/80 border border-border-subtle">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
                isActive
                  ? "bg-surface text-primary shadow-subtle border border-border"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary-50 text-secondary-hover border border-secondary/20">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Rankings List Content */}
      <div className="pt-2">
        {currentTab === "borrowed" && renderList(most_borrowed_books, "borrowed")}
        {currentTab === "requested" && renderList(most_requested_books, "requested")}
        {currentTab === "favorited" && renderList(most_favorited_books, "favorited")}
        {currentTab === "libraries" && renderList(most_active_libraries, "libraries")}
        {currentTab === "governorates" && renderList(most_active_governorates, "governorates")}
      </div>
    </div>
  );
}
