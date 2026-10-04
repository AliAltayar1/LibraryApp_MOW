import React from "react";
import { DashboardLibrariesManager } from "@/components/dashboard/libraries/DashboardLibrariesManager";

export const metadata = {
  title: "إدارة المكتبات والمراكز الوقفية | لوحة التحكم",
  description:
    "السجل المركزي الموحد لإدارة وتفعيل ومتابعة المكتبات والمراكز الثقافية الوقفية لوزارة الأوقاف.",
};

export default function DashboardLibrariesPage() {
  return <DashboardLibrariesManager />;
}
