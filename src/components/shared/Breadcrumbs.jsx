import React from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs({ items = [], className }) {
  return (
    <nav
      aria-label="مسار التنقل"
      className={cn("flex items-center text-xs text-foreground-muted mb-6 overflow-x-auto py-1", className)}
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors py-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronLeft className="w-3 h-3 text-border-strong rtl:rotate-0 ltr:rotate-180" />
              {isLast || !item.href ? (
                <span
                  className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
