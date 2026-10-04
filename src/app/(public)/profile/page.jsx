import React from "react";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = {
  title: "الملف الشخصي والنشاط الأكاديمي | المكتبة الإلكترونية لوزارة الأوقاف",
  description:
    "بيانات المستخدم وسجل القراءة والمطالعة في المكتبة الإلكترونية لوزارة الأوقاف السورية.",
};

export default function ProfilePage() {
  return (
    <div className="w-full min-h-[75vh] bg-background">
      <ProfileView />
    </div>
  );
}
