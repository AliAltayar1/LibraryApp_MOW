import React from "react";
import { DashboardAuthorsManager } from "@/components/dashboard/authors/DashboardAuthorsManager";

export const metadata = {
  title: "إدارة المؤلفين والعلماء | لوحة التحكم",
  description: "توثيق وفهرسة أسماء المؤلفين والمحققين في المنصة الرقمية الموحدة.",
};

export default function DashboardAuthorsPage() {
  return <DashboardAuthorsManager />;
}
