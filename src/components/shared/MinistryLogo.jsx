import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * MinistryLogo Component
 *
 * Uses the official Syrian Ministry of Endowments emblem and typography
 * paired with the Digital Library platform identity.
 */
export function MinistryLogo({
  variant = "default", // 'default' | 'compact' | 'footer'
  className,
  asLink = true,
}) {
  const isFooter = variant === "footer";

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 select-none text-start transition-opacity hover:opacity-95",
        className
      )}
    >
      {/* Official Syrian Ministry of Endowments SVG Asset */}
      <div
        className={cn(
          "flex items-center gap-2.5",
          isFooter && "brightness-0 invert opacity-90"
        )}
      >
        <img
          src="/images/logo-mow-ar.svg"
          alt="وزارة الأوقاف - الجمهورية العربية السورية"
          className={cn(
            "object-contain transition-all",
            variant === "compact" ? "h-9 w-auto" : "h-11 sm:h-12 w-auto"
          )}
        />
      </div>

      {/* Digital Library Sub-Brand Separator & Label */}
      {variant !== "compact" && (
        <div className="flex items-center gap-2 ps-2 border-s border-border">
          <div className="flex flex-col">
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isFooter ? "text-primary-100/70" : "text-foreground-subtle"
              )}
            >
              المنصة الرقمية
            </span>
            <span
              className={cn(
                "text-xs sm:text-sm font-bold tracking-tight mt-0.5 flex items-center gap-1",
                isFooter ? "text-secondary-light" : "text-primary"
              )}
            >
              المكتبة الإلكترونية
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" aria-label="الصفحة الرئيسية - المكتبة الإلكترونية لوزارة الأوقاف">
        {content}
      </Link>
    );
  }

  return content;
}
