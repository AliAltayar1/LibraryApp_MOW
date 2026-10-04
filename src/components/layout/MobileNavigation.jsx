"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  Home,
  BookOpen,
  Heart,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { MinistryLogo } from "@/shared/MinistryLogo";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { NAVIGATION_LINKS, APP_CONFIG } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { formatArabicNumber, cn } from "@/lib/utils";

export function MobileNavigation({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { count: favCount } = useFavorites();

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.username;

  const userInitial = (user?.first_name?.[0] || user?.username?.[0] || "م").toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="القائمة المتنقلة"
      className="fixed inset-0 z-50 lg:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 end-0 w-full max-w-xs bg-surface border-s border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Header with Logo and Close Button */}
          <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
            <MinistryLogo variant="compact" asLink={false} />
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق القائمة"
              className="p-2 rounded-xl text-foreground-subtle hover:text-foreground hover:bg-surface-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Card */}
          <div className="pt-4 pb-2">
            {isAuthenticated && user ? (
              <div className="p-3 rounded-xl bg-surface-muted border border-border-subtle space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar
                    size="sm"
                    fallback={userInitial}
                    className="bg-primary text-white font-bold"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-foreground-subtle truncate">
                      {user.email || `@${user.username}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50 text-[11px]">
                  <Badge variant="gold" size="sm" className="text-[10px] py-0 px-2">
                    {user.role?.label || "عضو معتمد"}
                  </Badge>
                  <button
                    onClick={handleLogout}
                    className="text-error hover:underline text-[11px] inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>خروج</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-subtle hover:bg-primary-hover transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول للمنصة</span>
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="py-4 space-y-1.5" aria-label="التنقل الرئيسي">
            {NAVIGATION_LINKS.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all",
                    isActive
                      ? "bg-primary text-white shadow-subtle"
                      : "text-foreground hover:bg-primary-50 hover:text-primary"
                  )}
                >
                  <span>{link.name}</span>
                  {link.href === "/favorites" && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-bold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-secondary-50 text-secondary-hover border border-secondary/20"
                      )}
                    >
                      {formatArabicNumber(favCount)}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                {user.role?.code !== "READER" && (
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all bg-primary-50/70 text-primary border border-primary/20 hover:bg-primary hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-primary group-hover:text-white" />
                      <span>لوحة التحكم الإدارية</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-primary-900">
                      إدارة
                    </span>
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all",
                    pathname === "/profile"
                      ? "bg-primary text-white shadow-subtle"
                      : "text-foreground hover:bg-primary-50 hover:text-primary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>الملف الشخصي والنشاط</span>
                  </div>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Footer info within mobile drawer */}
        <div className="pt-6 border-t border-border-subtle text-xs text-foreground-subtle space-y-3">
          <div className="flex items-center gap-2 text-primary font-medium">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>بوابة وزارة الأوقاف السورية</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            المنصة الرقمية الموحدة للمخطوطات والمراجع الإسلامية. جميع الحقوق محفوظة لوزارة الأوقاف في الجمهورية العربية السورية.
          </p>
        </div>
      </div>
    </div>
  );
}
