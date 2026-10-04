"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, Heart } from "lucide-react";
import { MinistryLogo } from "@/shared/MinistryLogo";
import { Container } from "@/shared/Container";
import { UserMenu } from "./UserMenu";
import { MobileNavigation } from "./MobileNavigation";
import { NAVIGATION_LINKS } from "@/lib/constants";
import { useFavorites } from "@/hooks/useFavorites";
import { formatArabicNumber, cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count: favoritesCount } = useFavorites();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-md transition-all shadow-subtle">
        {/* Top Institutional Syrian Government Ribbon */}
        <div className="w-full bg-primary-900 text-white text-[11px] py-1 px-4 border-b border-primary/40 hidden sm:block">
          <Container className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-secondary-light font-medium">
                الجمهورية العربية السورية
              </span>
              <span className="text-white/30">|</span>
              <span className="text-white/80">وزارة الأوقاف</span>
            </div>
            <div className="flex items-center gap-4 text-white/70">
              <span className="hover:text-white transition-colors">البوابة الرقمية الموحدة</span>
              <span className="text-secondary text-[10px]">●</span>
              <span>نسخة تجريبية معتمدة</span>
            </div>
          </Container>
        </div>

        {/* Main Navigation Header */}
        <div className="h-16 sm:h-20 flex items-center">
          <Container className="flex items-center justify-between gap-4">
            {/* RIGHT (in RTL): Ministry & Digital Library Logo */}
            <div className="flex items-center">
              <MinistryLogo />
            </div>

            {/* CENTER: Main Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-surface-muted border border-border-subtle"
              aria-label="القائمة الرئيسية"
            >
              {NAVIGATION_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-subtle"
                        : "text-foreground-muted hover:text-foreground hover:bg-surface/70"
                    )}
                  >
                    <span>{link.name}</span>
                    {link.href === "/favorites" && favoritesCount > 0 && (
                      <span
                        className={cn(
                          "ms-2 inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-secondary-50 text-secondary-hover border border-secondary/20"
                        )}
                      >
                        {formatArabicNumber(favoritesCount)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* LEFT (in RTL): Search, User Menu & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Quick Search Input */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative hidden md:flex items-center w-52 xl:w-64"
              >
                <input
                  type="search"
                  placeholder="ابحث عن كتاب، مؤلف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs rounded-full border border-border bg-surface px-3.5 py-2 pe-9 text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  aria-label="البحث السريع في المكتبة"
                />
                <button
                  type="submit"
                  aria-label="تنفيذ البحث"
                  className="absolute end-1.5 p-1 rounded-full text-foreground-subtle hover:text-primary transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Mobile Quick Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="فتح شريط البحث"
                className="md:hidden p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Favorites Shortcut (Tablet/Desktop) */}
              <Link
                href="/favorites"
                aria-label="الانتقال إلى المفضلة"
                className="hidden sm:flex relative p-2 rounded-xl text-foreground-muted hover:text-primary hover:bg-surface-muted transition-colors"
              >
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute top-1 end-1 w-4 h-4 rounded-full bg-secondary text-primary-900 text-[10px] font-bold flex items-center justify-center border-2 border-surface">
                    {formatArabicNumber(favoritesCount)}
                  </span>
                )}
              </Link>

              {/* User / Profile Menu */}
              <UserMenu />

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="فتح القائمة الرئيسية"
                className="lg:hidden p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </Container>
        </div>

        {/* Mobile Search Dropdown Bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-border-subtle bg-surface-muted p-3 animate-in slide-in-from-top-2 duration-150">
            <Container>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="search"
                  placeholder="ابحث عن كتاب، مؤلف، أو موضوع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-xs rounded-xl border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  aria-label="البحث في المكتبة"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover"
                >
                  بحث
                </button>
              </form>
            </Container>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
