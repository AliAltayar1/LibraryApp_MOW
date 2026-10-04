import React from "react";
import { dashboardService } from "@/services/dashboardService";
import { booksService } from "@/services/booksService";
import { DashboardOverviewView } from "@/components/dashboard/overview/DashboardOverviewView";

export const metadata = {
  title: "لوحة المتابعة المركزية | وزارة الأوقاف السورية",
  description: "المؤشرات العامة وإحصائيات الرقمنة للمكتبة الإلكترونية الوقفية.",
};

export default async function DashboardPage() {
  const [stats, categories, activities, recentBooksRes] = await Promise.all([
    dashboardService.getOverviewStats(),
    dashboardService.getCategoriesDistribution(),
    dashboardService.getRecentActivities(),
    dashboardService.getDashboardBooks({ pageSize: 5 }),
  ]);

  return (
    <DashboardOverviewView
      stats={stats}
      categories={categories}
      activities={activities}
      recentBooks={recentBooksRes.items}
    />
  );
}
