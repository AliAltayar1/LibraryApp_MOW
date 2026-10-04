import React from "react";
import { DashboardBorrowRequestsManager } from "@/components/dashboard/borrow-requests/DashboardBorrowRequestsManager";

export const metadata = {
  title: "إدارة طلبات الاستعارة | لوحة المتابعة لوزارة الأوقاف",
  description:
    "متابعة واعتماد طلبات الاستعارة المقدمة من الباحثين والقراء وفق النظام الموحد لوزارة الأوقاف السورية.",
};

export default function DashboardBorrowRequestsPage() {
  return <DashboardBorrowRequestsManager />;
}
