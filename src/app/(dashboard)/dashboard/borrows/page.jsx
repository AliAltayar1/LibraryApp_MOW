import React from "react";
import { DashboardBorrowsManager } from "@/components/dashboard/borrows/DashboardBorrowsManager";

export const metadata = {
  title: "سجل وإدارة الاستعارات | لوحة المتابعة لوزارة الأوقاف",
  description:
    "متابعة إعارة واسترجاع الكتب وتسجيل الاستعارات المباشرة وفق النظام الموحد لوزارة الأوقاف السورية.",
};

export default function DashboardBorrowsPage() {
  return <DashboardBorrowsManager />;
}
