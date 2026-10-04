"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  User,
  LogOut,
  ChevronDown,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { cn } from "@/lib/utils";

const PAGE_TITLES = {
  "/dashboard": "نظرة عامة ومؤشرات الأداء",
  "/dashboard/libraries": "إدارة وتوزيع المكتبات",
  "/dashboard/books": "إدارة المصنفات والكتب والمخطوطات",
  "/dashboard/authors": "فهرس المؤلفين والعلماء",
  "/dashboard/categories": "التصنيفات والعلوم الشرعية",
  "/dashboard/users": "إدارة المستخدمين وصلاحيات الوصول",
  "/dashboard/analytics": "التقارير والإحصائيات الرقمية",
};

export function DashboardNavbar({ onMenuToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const currentTitle = PAGE_TITLES[pathname] || "لوحة التحكم";

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.username || "مدير النظام";

  const userRole = user?.role?.label || "مسؤول النظام";
  const userInitial = (user?.first_name?.[0] || user?.username?.[0] || "م").toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full h-16 sm:h-20 bg-surface/95 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Right side: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="فتح القائمة الجانبية"
          className="lg:hidden p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-start">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-wider">
              بوابة الإدارة
            </span>
            <span className="text-foreground-subtle text-xs">/</span>
            <span className="text-[10px] sm:text-xs text-foreground-subtle hidden sm:inline">
              المكتبة الإلكترونية
            </span>
          </div>
          <h1 className="text-sm sm:text-lg font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Left side (in RTL): Search, Public Site Link, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Link back to public library */}
        <Link
          href="/"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-primary bg-primary-50 border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-subtle select-none"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>زيارة المكتبة العامة</span>
        </Link>

        {/* System Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="الإشعارات الإدارية"
            className="relative p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute end-0 mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-surface p-3 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100 text-start">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
                <span className="text-xs font-bold text-foreground">
                  تنبيهات النظام الحكومي
                </span>
                <span className="text-[10px] font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-full">
                  ٣ تنبيهات جديدة
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-surface-muted/60 border border-border-subtle flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">
                      تم استكمال أرشفة مخطوطة وقفية
                    </p>
                    <p className="text-[10px] text-foreground-subtle">
                      منذ ١٥ دقيقة بواسطة الشيخ نور الدين قاسم
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-surface-muted/60 border border-border-subtle flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">
                      طلب توثيق باحث جديد من جامعة دمشق
                    </p>
                    <p className="text-[10px] text-foreground-subtle">
                      منذ ساعتين بانتظار الاعتماد
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-label="قائمة المستخدم"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Avatar
              size="sm"
              fallback={userInitial}
              alt={displayName}
              className="border-primary/20 bg-primary-50 text-primary font-bold"
            />
            <div className="hidden xl:flex flex-col text-start">
              <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] text-secondary font-medium leading-tight">
                {userRole}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-foreground-subtle transition-transform duration-200 hidden sm:block",
                userDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {userDropdownOpen && (
            <div className="absolute end-0 mt-2 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100 text-start">
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <p className="text-xs font-bold text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-secondary font-medium truncate">
                  {userRole}
                </p>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  <User className="w-4 h-4 text-foreground-subtle" />
                  <span>الملف الشخصي للمشرف</span>
                </Link>

                <Link
                  href="/"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-foreground-subtle" />
                  <span>الانتقال للمكتبة العامة</span>
                </Link>
              </div>

              <div className="pt-1 mt-1 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-red-50 rounded-lg transition-colors text-start"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
