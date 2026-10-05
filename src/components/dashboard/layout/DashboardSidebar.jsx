"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  FolderTree,
  Users,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  X,
  Sparkles,
  Feather,
  Inbox,
  BookmarkCheck,
} from "lucide-react";
import { MinistryLogo } from "@/shared/MinistryLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const DASHBOARD_NAV_ITEMS = [
  {
    name: "لوحة المتابعة",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "إدارة المكتبات",
    href: "/dashboard/libraries",
    icon: Building2,
    badge: null,
  },
  {
    name: "إدارة المصنفات والكتب",
    href: "/dashboard/books",
    icon: BookOpen,
    badge: null,
  },
  {
    name: "طلبات الاستعارة",
    href: "/dashboard/borrow-requests",
    icon: Inbox,
    badge: null,
  },
  {
    name: "سجل الاستعارات",
    href: "/dashboard/borrows",
    icon: BookmarkCheck,
    badge: null,
  },
  {
    name: "المؤلفون والعلماء",
    href: "/dashboard/authors",
    icon: Feather,
    badge: null,
  },
  {
    name: "التصنيفات والعلوم",
    href: "/dashboard/categories",
    icon: FolderTree,
    badge: null,
  },
  {
    name: "المستخدمون والصلاحيات",
    href: "/dashboard/users",
    icon: Users,
    badge: null,
  },
  {
    name: "التقارير والإحصائيات",
    href: "/dashboard/analytics",
    icon: BarChart3,
    badge: null,
  },
];

export function DashboardSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const userRole = user?.role?.label || "مدير النظام المعتمد";
  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.username || "إدارة المنصة";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 start-0 z-50 w-72 bg-surface border-e border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shadow-card lg:shadow-none",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        {/* Top Header & Branding */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary/20 flex items-center justify-center text-primary shadow-subtle shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-primary tracking-wide">
                  وزارة الأوقاف السورية
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              </div>
              <h2 className="text-sm font-extrabold text-foreground">
                لوحة الإدارة والمتابعة
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة الجانبية"
            className="lg:hidden p-1.5 rounded-lg text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tag */}
        <div className="px-5 pt-4 pb-2">
          <span className="text-[11px] font-bold text-foreground-subtle uppercase tracking-wider">
            القائمة الرئيسية للمنظومة
          </span>
        </div>

        {/* Navigation Items */}
        <nav
          className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto"
          aria-label="تنقل لوحة التحكم"
        >
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-subtle"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-muted",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-surface-muted text-foreground-muted group-hover:text-primary group-hover:bg-primary-50",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        isActive
                          ? "bg-secondary text-primary-900"
                          : "bg-secondary-50 text-secondary-hover border border-secondary/20",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronLeft className="w-4 h-4 text-white/70" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Institutional Digital Verification Banner */}
        <div className="px-4 py-3 mx-3 my-2 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50/50 border border-primary/10">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-foreground-muted">
              <span className="font-bold text-primary block text-xs mb-0.5">
                المنظومة المركزية الموحدة
              </span>
              بيانات موثوقة ومربوطة بشبكة الأوقاف الحكومية الآمنة.
            </div>
          </div>
        </div>

        {/* Bottom Section: Return to Public Library & User Profile */}
        <div className="p-3 border-t border-border-subtle bg-surface-muted/60 space-y-2">
          {/* Direct Link to Public Library */}
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-primary bg-surface border border-border hover:border-primary/40 hover:bg-primary-50 transition-all shadow-subtle group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-secondary group-hover:rotate-12 transition-transform" />
              <span>المكتبة العامة (واجهة القراء)</span>
            </div>
            <span className="text-[10px] text-foreground-subtle group-hover:text-primary">
              زيارة
            </span>
          </Link>

          {/* User mini badge */}
          <div className="px-3 py-2 rounded-xl bg-surface border border-border-subtle flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-foreground truncate">
                {userName}
              </p>
              <p className="text-[10px] text-secondary font-semibold truncate">
                {userRole}
              </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-success ring-4 ring-success/15" />
          </div>
        </div>
      </aside>
    </>
  );
}
