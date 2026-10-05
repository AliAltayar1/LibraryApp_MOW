"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Activity,
  Trophy,
  BarChart2,
  PieChart,
  RefreshCw,
  Sparkles,
  Layers,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { dashboardStatsService } from "@/services/dashboardStatsService";
import { StatsScopeBar } from "./StatsScopeBar";
import { StatsOverviewCards } from "./StatsOverviewCards";
import { StatsTimelineChart } from "./StatsTimelineChart";
import { StatsRankingsSection } from "./StatsRankingsSection";
import { StatsDistributionsSection } from "./StatsDistributionsSection";
import { StatsCatalogBreakdown } from "./StatsCatalogBreakdown";
import { StatsReaderDenied } from "./StatsReaderDenied";
import { QuickActions } from "@/components/dashboard/overview/QuickActions";
import { cn } from "@/lib/utils";

export function DashboardStatsManager() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Role detection
  const roleCode = user?.role?.code || (typeof user?.role === "string" ? user.role : "") || "";
  const isReader = roleCode === "READER";

  // Filter States
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [customDates, setCustomDates] = useState({ date_from: null, date_to: null });
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState("");
  const [rankingsLimit, setRankingsLimit] = useState(5);

  // Active View Tab ('all' | 'overview' | 'timeline' | 'rankings' | 'distributions')
  const [activeTab, setActiveTab] = useState("all");

  // Data States
  const [overviewData, setOverviewData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [rankingsData, setRankingsData] = useState(null);
  const [distributionsData, setDistributionsData] = useState(null);

  // Loading States
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(true);
  const [loadingDistributions, setLoadingDistributions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Permission Denied state (403)
  const [permissionDenied, setPermissionDenied] = useState(isReader);

  // Helper to build current active filter payload
  const getCurrentFilters = useCallback(() => {
    const filters = {};
    if (customDates.date_from && customDates.date_to) {
      filters.date_from = customDates.date_from;
      filters.date_to = customDates.date_to;
    } else {
      filters.period = selectedPeriod;
    }

    if (selectedGovernorate) filters.governorate = selectedGovernorate;
    if (selectedLibrary) filters.library = selectedLibrary;

    return filters;
  }, [customDates, selectedPeriod, selectedGovernorate, selectedLibrary]);

  // 1. Fetch Overview
  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await dashboardStatsService.getOverview(getCurrentFilters());
      setOverviewData(res.data);
    } catch (err) {
      if (err?.status === 403 || err?.code === "PERMISSION_DENIED") {
        setPermissionDenied(true);
      }
    } finally {
      setLoadingOverview(false);
    }
  }, [getCurrentFilters]);

  // 2. Fetch Timeline
  const fetchTimeline = useCallback(async () => {
    setLoadingTimeline(true);
    try {
      const res = await dashboardStatsService.getTimeline(getCurrentFilters());
      setTimelineData(res.data || []);
    } catch (err) {
      if (err?.status === 403 || err?.code === "PERMISSION_DENIED") {
        setPermissionDenied(true);
      }
    } finally {
      setLoadingTimeline(false);
    }
  }, [getCurrentFilters]);

  // 3. Fetch Rankings
  const fetchRankings = useCallback(
    async (limit = rankingsLimit) => {
      setLoadingRankings(true);
      try {
        const filters = { ...getCurrentFilters(), limit };
        const res = await dashboardStatsService.getRankings(filters);
        setRankingsData(res.data);
      } catch (err) {
        if (err?.status === 403 || err?.code === "PERMISSION_DENIED") {
          setPermissionDenied(true);
        }
      } finally {
        setLoadingRankings(false);
      }
    },
    [getCurrentFilters, rankingsLimit]
  );

  // 4. Fetch Distributions
  const fetchDistributions = useCallback(async () => {
    setLoadingDistributions(true);
    try {
      const res = await dashboardStatsService.getDistributions(getCurrentFilters());
      setDistributionsData(res.data);
    } catch (err) {
      if (err?.status === 403 || err?.code === "PERMISSION_DENIED") {
        setPermissionDenied(true);
      }
    } finally {
      setLoadingDistributions(false);
    }
  }, [getCurrentFilters]);

  // Initial and reactive load on filter changes
  useEffect(() => {
    if (isReader) {
      setPermissionDenied(true);
      return;
    }

    // Launch all 4 independent requests in parallel
    fetchOverview();
    fetchTimeline();
    fetchRankings();
    fetchDistributions();
  }, [
    isReader,
    fetchOverview,
    fetchTimeline,
    fetchRankings,
    fetchDistributions,
  ]);

  // Handle Refresh All
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchOverview(),
      fetchTimeline(),
      fetchRankings(),
      fetchDistributions(),
    ]);
    setIsRefreshing(false);
  };

  // Handle Limit Change
  const handleLimitChange = (newLimit) => {
    setRankingsLimit(newLimit);
    fetchRankings(newLimit);
  };

  // Handle Preset Period Change ('7d' | '30d')
  const handlePeriodChange = (type) => {
    setCustomDates({ date_from: null, date_to: null });
    setSelectedPeriod(type);
  };

  // Handle Custom Dates Apply
  const handleCustomDatesApply = ({ date_from, date_to }) => {
    setCustomDates({ date_from, date_to });
  };

  // Handle Governorate Change
  const handleGovernorateChange = (govId) => {
    setSelectedGovernorate(govId);
    setSelectedLibrary(""); // reset library when gov changes
  };

  // If not authenticated and done loading auth
  if (!isAuthenticated && !isAuthLoading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground font-arabic">تسجيل الدخول مطلوب</h2>
        <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
          لوحة الإحصائيات المركزية مخصصة لإدارة الوزارة وأمناء المكتبات. يرجى تسجيل الدخول بحساب مصرح به للوصول إلى المؤشرات.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-subtle"
        >
          الانتقال إلى تسجيل الدخول
        </a>
      </div>
    );
  }

  // If user is a Reader or API returned 403
  if (permissionDenied) {
    return <StatsReaderDenied />;
  }

  const resolvedScope = overviewData?.scope;
  const periodInfo = overviewData?.period;
  const scopeLevel = resolvedScope?.level || "MINISTRY";

  const isGlobalLoading =
    loadingOverview && loadingTimeline && loadingRankings && loadingDistributions;

  return (
    <div className="space-y-6">
      {/* Scope, Filters & Period Bar */}
      <StatsScopeBar
        userRole={roleCode}
        resolvedScope={resolvedScope}
        periodInfo={periodInfo}
        selectedPeriod={customDates.date_from ? "custom" : selectedPeriod}
        customDateFrom={customDates.date_from || ""}
        customDateTo={customDates.date_to || ""}
        selectedGovernorate={selectedGovernorate}
        selectedLibrary={selectedLibrary}
        onPeriodChange={handlePeriodChange}
        onCustomDatesApply={handleCustomDatesApply}
        onGovernorateChange={handleGovernorateChange}
        onLibraryChange={setSelectedLibrary}
        onRefresh={handleRefreshAll}
        isLoading={isRefreshing || loadingOverview}
      />

      {/* Main Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTab === "all"
              ? "bg-primary text-white shadow-subtle"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          )}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>العرض التنفيذي الشامل (الكل)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTab === "overview"
              ? "bg-primary text-white shadow-subtle"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>المؤشرات العامة (Overview)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTab === "timeline"
              ? "bg-primary text-white shadow-subtle"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          )}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>الخط الزمني (Timeline)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rankings")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            activeTab === "rankings"
              ? "bg-primary text-white shadow-subtle"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          )}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>لوائح الصدارة (Rankings)</span>
        </button>

        {scopeLevel !== "LIBRARY" && (
          <button
            type="button"
            onClick={() => setActiveTab("distributions")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === "distributions"
                ? "bg-primary text-white shadow-subtle"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            )}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>التوزيع الجغرافي (Distributions)</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton if all loading on mount */}
      {isGlobalLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-surface-muted border border-border-subtle" />
            ))}
          </div>
          <div className="h-96 rounded-3xl bg-surface-muted border border-border-subtle" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: OVERVIEW KPIS */}
          {(activeTab === "all" || activeTab === "overview") && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {overviewData ? (
                <>
                  <StatsOverviewCards
                    overviewData={overviewData}
                    periodInfo={periodInfo}
                  />
                  <StatsCatalogBreakdown overviewData={overviewData} />
                </>
              ) : (
                <div className="p-8 text-center bg-surface border border-border rounded-2xl text-xs text-foreground-muted">
                  لا تتوفر مؤشرات إحصائية حالياً لهذه الفترة أو جاري المزامنة مع الخادم.
                </div>
              )}
              <QuickActions />
            </div>
          )}

          {/* SECTION 2: TIMELINE CHART */}
          {(activeTab === "all" || activeTab === "timeline") && (
            <div className="animate-in fade-in duration-200">
              <StatsTimelineChart
                timelineData={timelineData}
                isLoading={loadingTimeline}
              />
            </div>
          )}

          {/* SECTION 3: RANKINGS SECTION */}
          {(activeTab === "all" || activeTab === "rankings") && (
            <div className="animate-in fade-in duration-200">
              <StatsRankingsSection
                rankingsData={rankingsData}
                currentLimit={rankingsLimit}
                onLimitChange={handleLimitChange}
                isLoading={loadingRankings}
                scopeLevel={scopeLevel}
              />
            </div>
          )}

          {/* SECTION 4: DISTRIBUTIONS SECTION */}
          {(activeTab === "all" || activeTab === "distributions") && (
            <div className="animate-in fade-in duration-200">
              <StatsDistributionsSection
                distributionsData={distributionsData}
                scopeLevel={scopeLevel}
                isLoading={loadingDistributions}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
