import React from "react";
import { DashboardCategoriesManager } from "@/components/dashboard/categories/DashboardCategoriesManager";

export const metadata = {
  title: "التصنيفات والعلوم الشرعية | لوحة التحكم",
  description: "إدارة الهيكلية والتصنيفات للمكتبة الإلكترونية.",
};

export default function DashboardCategoriesPage() {
  return <DashboardCategoriesManager />;
}
