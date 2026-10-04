import React from "react";
import { DashboardBooksManager } from "@/components/dashboard/books/DashboardBooksManager";

export const metadata = {
  title: "إدارة المصنفات والكتب | لوحة التحكم",
  description: "فهرسة وتعديل وحذف المخطوطات والكتب في المكتبة الإلكترونية.",
};

export default function DashboardBooksPage() {
  return <DashboardBooksManager />;
}
