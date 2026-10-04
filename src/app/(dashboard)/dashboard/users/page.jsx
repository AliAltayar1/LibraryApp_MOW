import React from "react";
import { DashboardUsersManager } from "@/components/dashboard/users/DashboardUsersManager";

export const metadata = {
  title: "المستخدمون والصلاحيات | لوحة التحكم",
  description: "إدارة الحسابات الإشرافية والصلاحيات الممنوحة للمشرفين والباحثين.",
};

export default function DashboardUsersPage() {
  return <DashboardUsersManager />;
}
