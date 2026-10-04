import React from "react";
import { DashboardAnalyticsManager } from "@/components/dashboard/analytics/DashboardAnalyticsManager";

export const metadata = {
  title: "التقارير والإحصائيات | لوحة التحكم",
  description: "تقارير شاملة حول أداء المكتبة الرقمية وإنجاز مشاريع الأرشفة الوقفية.",
};

export default function DashboardAnalyticsPage() {
  return <DashboardAnalyticsManager />;
}
