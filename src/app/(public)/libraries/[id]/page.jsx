import React from "react";
import { LibraryDetailView } from "@/components/libraries/LibraryDetailView";

export const metadata = {
  title: "تفاصيل المكتبة الوقفية | وزارة الأوقاف السورية",
  description: "بيانات التواصل والمقر الإداري للمكتبة الوقفية المعتمدة.",
};

export default function LibraryDetailPage({ params }) {
  const { id } = params;
  return <LibraryDetailView libraryId={id} />;
}
