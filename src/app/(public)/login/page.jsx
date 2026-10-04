import React, { Suspense } from "react";
import { Container } from "@/shared/Container";
import { LoginForm } from "@/components/auth/LoginForm";
import { Breadcrumbs } from "@/shared/Breadcrumbs";

export const metadata = {
  title: "تسجيل الدخول | المكتبة الإلكترونية لوزارة الأوقاف",
  description:
    "بوابة الدخول الموحدة للمنصة الرقمية لوزارة الأوقاف في الجمهورية العربية السورية.",
};

export default function LoginPage() {
  return (
    <div className="w-full py-10 sm:py-16 min-h-[80vh] flex flex-col justify-center bg-background">
      <Container>
        <div className="mb-6 max-w-md mx-auto">
          <Breadcrumbs items={[{ label: "تسجيل الدخول" }]} />
        </div>
        <Suspense
          fallback={
            <div className="max-w-md mx-auto h-96 flex items-center justify-center text-xs text-foreground-muted">
              جاري تحميل نموذج الدخول...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </Container>
    </div>
  );
}
