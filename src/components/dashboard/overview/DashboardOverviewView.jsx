"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Scroll,
  Users,
  Download,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { QuickActions } from "./QuickActions";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { ActivityFeed } from "./ActivityFeed";
import { RecentBooksTable } from "./RecentBooksTable";
import { DashboardBooksManager } from "../books/DashboardBooksManager";
import { formatArabicNumber } from "@/lib/utils";

export function DashboardOverviewView({
  stats,
  categories,
  activities,
  recentBooks,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Metrics */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground font-arabic">
            لوحة الإشراف ومتابعة الأداء المركزي
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            إحصائيات المنظومة الرقمية الشاملة لوزارة الأوقاف في الجمهورية العربية السورية
          </p>
        </div>

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={stats.totalBooks.label}
            value={stats.totalBooks.formatted}
            subtitle={stats.totalBooks.subLabel}
            change={stats.totalBooks.change}
            trend={stats.totalBooks.trend}
            icon={BookOpen}
            variant="primary"
          />

          <StatCard
            title={stats.manuscripts.label}
            value={stats.manuscripts.formatted}
            subtitle={stats.manuscripts.subLabel}
            change={stats.manuscripts.change}
            trend={stats.manuscripts.trend}
            icon={Scroll}
            variant="secondary"
          />

          <StatCard
            title={stats.registeredResearchers.label}
            value={stats.registeredResearchers.formatted}
            subtitle={stats.registeredResearchers.subLabel}
            change={stats.registeredResearchers.change}
            trend={stats.registeredResearchers.trend}
            icon={Users}
            variant="emerald"
          />

          <StatCard
            title={stats.totalDownloads.label}
            value={stats.totalDownloads.formatted}
            subtitle={stats.totalDownloads.subLabel}
            change={stats.totalDownloads.change}
            trend={stats.totalDownloads.trend}
            icon={Download}
            variant="blue"
          />
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <QuickActions onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Grid: Category Breakdown & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown categories={categories} />
        <ActivityFeed activities={activities} />
      </div>

      {/* Recent Books Data Table */}
      <RecentBooksTable books={recentBooks} />

      {/* Hidden container to provide modal triggers if needed */}
      {isAddModalOpen && (
        <div className="hidden">
          {/* Handled via routing or direct call */}
        </div>
      )}
    </div>
  );
}
