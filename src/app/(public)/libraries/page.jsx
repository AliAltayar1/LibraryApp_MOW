import React from "react";
import { LibrariesDirectoryView } from "@/components/libraries/LibrariesDirectoryView";

export const metadata = {
  title: "دليل المكتبات والمراكز الوقفية | وزارة الأوقاف السورية",
  description:
    "استعراض شبكة المكتبات والمراكز الثقافية ودور المخطوطات التابعة لوزارة الأوقاف في الجمهورية العربية السورية.",
};

export default function LibrariesPage() {
  return <LibrariesDirectoryView />;
}
