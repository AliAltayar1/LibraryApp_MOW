import { DashboardLayoutShell } from "@/components/dashboard/layout/DashboardLayoutShell";

export const metadata = {
  title: "لوحة التحكم المركزية | وزارة الأوقاف السورية",
  description: "لوحة الإشراف والمتابعة للمكتبة الإلكترونية والمخطوطات الوقفية لوزارة الأوقاف.",
};

export default function DashboardLayout({ children }) {
  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
