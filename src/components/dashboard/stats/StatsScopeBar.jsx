"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Calendar,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  Layers,
} from "lucide-react";
import { librariesService } from "@/services/librariesService";
import { cn, formatArabicNumber } from "@/lib/utils";

export function StatsScopeBar({
  userRole = "MINISTRY_ADMIN",
  resolvedScope = null,
  periodInfo = null,
  selectedPeriod = "30d",
  customDateFrom = "",
  customDateTo = "",
  selectedGovernorate = "",
  selectedLibrary = "",
  onPeriodChange,
  onCustomDatesApply,
  onGovernorateChange,
  onLibraryChange,
  onRefresh,
  isLoading = false,
}) {
  // Lists for dropdowns
  const [governoratesList, setGovernoratesList] = useState([]);
  const [librariesList, setLibrariesList] = useState([]);
  const [isCustomMode, setIsCustomMode] = useState(selectedPeriod === "custom");
  const [tempDateFrom, setTempDateFrom] = useState(customDateFrom);
  const [tempDateTo, setTempDateTo] = useState(customDateTo);
  const [dateError, setDateError] = useState("");

  const isMinistry = userRole === "MINISTRY_ADMIN" || userRole === "SUPERUSER";
  const isGovAdmin = userRole === "GOVERNORATE_ADMIN";
  const isLibrarian = userRole === "LIBRARIAN";

  // Load Governorates if Ministry
  useEffect(() => {
    if (isMinistry) {
      async function loadGovs() {
        try {
          const govs = await librariesService.getGovernorates();
          if (Array.isArray(govs)) {
            setGovernoratesList(govs);
          }
        } catch {
          // Ignore
        }
      }
      loadGovs();
    }
  }, [isMinistry]);

  // Load Libraries
  useEffect(() => {
    async function loadLibs() {
      try {
        const filter = { pageSize: 100 };
        if (selectedGovernorate && selectedGovernorate !== "all") {
          filter.governorate = selectedGovernorate;
        }
        const res = await librariesService.getLibraries(filter);
        if (res && Array.isArray(res.results)) {
          setLibrariesList(res.results);
        }
      } catch {
        // Ignore
      }
    }
    if (isMinistry || isGovAdmin) {
      loadLibs();
    }
  }, [isMinistry, isGovAdmin, selectedGovernorate]);

  // Validate and submit custom date range
  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    setDateError("");

    if (!tempDateFrom || !tempDateTo) {
      setDateError("يرجى تحديد تاريخ البداية وتاريخ النهاية معاً.");
      return;
    }

    const fromDate = new Date(tempDateFrom);
    const toDate = new Date(tempDateTo);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (fromDate > toDate) {
      setDateError("تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية.");
      return;
    }

    if (toDate > today) {
      setDateError("تاريخ النهاية لا يمكن أن يكون في المستقبل.");
      return;
    }

    const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 366) {
      setDateError("الحد الأقصى للنطاق الزمني المخصص هو 366 يوماً.");
      return;
    }

    onCustomDatesApply({ date_from: tempDateFrom, date_to: tempDateTo });
  };

  const handlePeriodSelect = (type) => {
    if (type === "custom") {
      setIsCustomMode(true);
      // Auto initialize default 30 days back if empty
      if (!tempDateFrom || !tempDateTo) {
        const end = new Date();
        const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        const f = (d) => d.toISOString().split("T")[0];
        setTempDateFrom(f(start));
        setTempDateTo(f(end));
      }
    } else {
      setIsCustomMode(false);
      onPeriodChange(type);
    }
  };

  const levelLabel =
    resolvedScope?.level === "MINISTRY"
      ? "وزارة الأوقاف (كامل المنظومة)"
      : resolvedScope?.level === "GOVERNORATE"
      ? `محافظة ${resolvedScope?.governorate?.name || ""}`
      : resolvedScope?.level === "LIBRARY"
      ? `مكتبة ${resolvedScope?.library?.name || ""} (${resolvedScope?.governorate?.name || ""})`
      : "النطاق الإداري";

  return (
    <div className="bg-surface rounded-3xl border border-border p-4 sm:p-6 shadow-subtle space-y-4">
      {/* Top Bar: Scope Status Badge & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Scope Identification Tag */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-primary-50 border border-primary/20 text-primary">
            <Layers className="w-4 h-4 text-primary shrink-0" />
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span>النطاق النشط:</span>
              <span className="text-primary-900">{levelLabel}</span>
            </div>
          </div>

          {/* Inactive Warnings if any */}
          {resolvedScope?.governorate && resolvedScope.governorate.is_active === false && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>المحافظة غير مفعّلة حالياً (تاريخية)</span>
            </span>
          )}

          {resolvedScope?.library && resolvedScope.library.is_active === false && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>المكتبة غير مفعّلة حالياً (تاريخية)</span>
            </span>
          )}

          {/* Timezone & Period Days Badge */}
          {periodInfo && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-foreground-muted bg-surface-muted px-3 py-1.5 rounded-2xl border border-border-subtle">
              <Clock className="w-3.5 h-3.5 text-secondary" />
              <span>
                {formatArabicNumber(periodInfo.days)} يوماً ({periodInfo.date_from} إلى {periodInfo.date_to})
              </span>
            </div>
          )}
        </div>

        {/* Refresh & Period Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Period Buttons */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-surface-muted border border-border-subtle text-xs font-semibold">
            <button
              type="button"
              onClick={() => handlePeriodSelect("7d")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all",
                selectedPeriod === "7d" && !isCustomMode
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              آخر ٧ أيام
            </button>
            <button
              type="button"
              onClick={() => handlePeriodSelect("30d")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all",
                selectedPeriod === "30d" && !isCustomMode
                  ? "bg-primary text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              آخر ٣٠ يوماً (الافتراضي)
            </button>
            <button
              type="button"
              onClick={() => handlePeriodSelect("custom")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1",
                isCustomMode
                  ? "bg-secondary text-primary-900 font-bold shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Calendar className="w-3 h-3" />
              <span>فترة مخصصة</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-surface border border-border hover:bg-surface-muted text-foreground-muted hover:text-primary transition-all flex items-center gap-1.5 text-xs font-bold shadow-subtle disabled:opacity-50"
            title="تحديث كافة الإحصائيات"
          >
            <RefreshCw
              className={cn("w-4 h-4 text-primary", isLoading && "animate-spin")}
            />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* Scope Dropdowns Filter Bar (for Ministry / Governorate Admin) */}
      {(isMinistry || isGovAdmin) && (
        <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Governorate Dropdown (Ministry Only) */}
          {isMinistry && (
            <div>
              <label className="block text-[11px] font-bold text-foreground-muted mb-1">
                تصفية حسب المحافظة:
              </label>
              <div className="relative">
                <select
                  value={selectedGovernorate}
                  onChange={(e) => onGovernorateChange(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-surface border border-border focus:border-secondary focus:ring-1 focus:ring-secondary text-foreground appearance-none pe-8"
                >
                  <option value="">جميع المحافظات (الجمهورية)</option>
                  {governoratesList.map((gov) => (
                    <option key={gov.id} value={gov.id}>
                      {gov.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-foreground-subtle absolute end-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Library Dropdown (Ministry & Governorate Admin) */}
          <div>
            <label className="block text-[11px] font-bold text-foreground-muted mb-1">
              تصفية حسب المكتبة:
            </label>
            <div className="relative">
              <select
                value={selectedLibrary}
                onChange={(e) => onLibraryChange(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-surface border border-border focus:border-secondary focus:ring-1 focus:ring-secondary text-foreground appearance-none pe-8"
              >
                <option value="">
                  {selectedGovernorate ? "جميع مكتبات المحافظة المختارة" : "جميع المكتبات"}
                </option>
                {librariesList.map((lib) => (
                  <option key={lib.id} value={lib.id}>
                    {lib.name} {!lib.is_active ? "(غير مفعّلة)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-foreground-subtle absolute end-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Range Panel (Expanded when isCustomMode) */}
      {isCustomMode && (
        <form
          onSubmit={handleApplyCustomDates}
          className="pt-3 border-t border-border-subtle bg-surface-muted/60 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row md:items-end gap-3 animate-in fade-in duration-150"
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-foreground-muted mb-1">
                من تاريخ (date_from):
              </label>
              <input
                type="date"
                value={tempDateFrom}
                onChange={(e) => setTempDateFrom(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface border border-border focus:border-secondary text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-foreground-muted mb-1">
                إلى تاريخ (date_to):
              </label>
              <input
                type="date"
                value={tempDateTo}
                onChange={(e) => setTempDateTo(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface border border-border focus:border-secondary text-foreground"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-subtle transition-all"
            >
              تطبيق النطاق
            </button>
            <button
              type="button"
              onClick={() => handlePeriodSelect("30d")}
              className="px-3 py-2 rounded-xl border border-border text-xs text-foreground-muted hover:bg-surface transition-all"
            >
              إلغاء
            </button>
          </div>

          {dateError && (
            <p className="w-full text-xs text-error font-semibold mt-1">
              {dateError}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
