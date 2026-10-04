import React from "react";
import Link from "next/link";
import { Container } from "@/shared/Container";
import { Button } from "@/ui/Button";
import { BookX, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-20 sm:py-28 flex items-center justify-center">
      <Container className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-secondary-50 text-secondary-hover mx-auto flex items-center justify-center mb-6 border border-secondary/20 shadow-subtle">
          <BookX className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-1 block">
          رمز الخطأ ٤٠٤
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 font-arabic">
          الصفحة أو المصنف غير موجود
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed mb-8">
          عذراً، المرجع أو الصفحة التي تحاول الوصول إليها قد تكون نُقلت أو حُذفت أو أن الرابط غير صحيح.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="md" className="gap-2">
              <Home className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </Button>
          </Link>
          <Link href="/books">
            <Button variant="outline" size="md" className="gap-2">
              <Search className="w-4 h-4" />
              <span>فهرس الكتب</span>
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
