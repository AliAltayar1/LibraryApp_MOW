import React from "react";
import { DashboardStatsManager } from "@/components/dashboard/stats/DashboardStatsManager";

export const metadata = {
  title: "لوحة المتابعة والإحصائيات المركزية | وزارة الأوقاف السورية",
  description:
    "مؤشرات الأداء الشاملة والخط الزمني للإعارات والطلبات والتوزيع الجغرافي للمكتبة الإلكترونية الوقفية.",
};

export default function DashboardPage() {
  return <DashboardStatsManager />;
}
