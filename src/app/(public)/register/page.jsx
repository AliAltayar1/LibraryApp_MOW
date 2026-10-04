import React from "react";
import { Container } from "@/shared/Container";
import { Breadcrumbs } from "@/shared/Breadcrumbs";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "إنشاء حساب قارئ جديد | المكتبة الإلكترونية لوزارة الأوقاف",
  description:
    "بوابة تسجيل القراء في المنصة الرقمية لوزارة الأوقاف في الجمهورية العربية السورية.",
};

export default function RegisterPage() {
  return (
    <div className="w-full py-10 sm:py-16 min-h-[85vh] flex flex-col justify-center bg-background">
      <Container>
        <div className="mb-6 max-w-lg mx-auto">
          <Breadcrumbs items={[{ label: "إنشاء حساب قارئ" }]} />
        </div>
        <RegisterForm />
      </Container>
    </div>
  );
}
