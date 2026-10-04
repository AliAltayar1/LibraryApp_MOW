"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Heart,
  BookOpen,
  LogOut,
  LogIn,
  ChevronDown,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { formatArabicNumber, cn } from "@/lib/utils";

export function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();
  const { count: favoritesCount } = useFavorites();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  // Loading skeleton placeholder
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-1.5">
        <div className="w-8 h-8 rounded-full bg-surface-muted animate-pulse border border-border" />
      </div>
    );
  }

  // Unauthenticated State: Show Login Button
  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary bg-primary-50 border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-subtle select-none"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>تسجيل الدخول</span>
      </Link>
    );
  }

  // Display name resolution
  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name || user.username;

  const roleLabel = user.role?.label || "عضو مسجل";
  const userInitial = (user.first_name?.[0] || user.username?.[0] || "م").toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="قائمة حساب المستخدم"
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
          <span className="text-[10px] text-secondary-hover font-medium leading-tight">
            {roleLabel}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-foreground-subtle transition-transform duration-200 hidden sm:block",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute end-0 mt-2 w-60 rounded-xl border border-border bg-surface p-1.5 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* User Preview */}
          <div className="px-3 py-2.5 border-b border-border-subtle mb-1 text-start">
            <div className="flex items-center justify-between gap-1 mb-1">
              <p className="text-xs font-bold text-foreground truncate">
                {displayName}
              </p>
              <Badge variant="gold" size="sm" className="text-[9px] px-1.5 py-0">
                {roleLabel}
              </Badge>
            </div>
            <p className="text-[11px] text-foreground-subtle truncate">
              {user.email || `@${user.username}`}
            </p>
          </div>

          <div className="space-y-0.5">
            {user.role?.code !== "READER" && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs font-bold text-primary bg-primary-50/50 hover:bg-primary hover:text-white rounded-lg transition-colors group"
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary group-hover:text-white" />
                  <span>لوحة التحكم الإدارية</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-primary-900 group-hover:bg-white group-hover:text-primary">
                  إدارة
                </span>
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-primary-50 hover:text-primary transition-colors"
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-foreground-subtle" />
                <span>الملف الشخصي والنشاط</span>
              </div>
            </Link>

            <Link
              href="/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-primary-50 hover:text-primary transition-colors"
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-foreground-subtle" />
                <span>الكتب المحفوظة</span>
              </div>
              {favoritesCount > 0 && (
                <span className="text-[10px] font-bold bg-secondary-50 text-secondary-hover px-1.5 py-0.5 rounded-full border border-secondary/20">
                  {formatArabicNumber(favoritesCount)}
                </span>
              )}
            </Link>

            <Link
              href="/books"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-primary-50 hover:text-primary transition-colors"
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-foreground-subtle" />
                <span>استكشاف الكتب والمطبوعات</span>
              </div>
            </Link>
          </div>

          <div className="pt-1 mt-1 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-red-50 rounded-lg transition-colors text-start"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
