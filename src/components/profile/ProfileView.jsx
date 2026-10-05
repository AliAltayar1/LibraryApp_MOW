"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lock, LogIn, ArrowRight } from "lucide-react";
import { Container } from "@/shared/Container";
import { Breadcrumbs } from "@/shared/Breadcrumbs";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ProfileTabs } from "./ProfileTabs";
import { Skeleton } from "@/ui/Skeleton";
import { Button } from "@/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { borrowingService } from "@/services/borrowingService";
import { favoritesService } from "@/services/favoritesService";

export function ProfileView() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  const [activeBorrowsCount, setActiveBorrowsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [returnedBorrowsCount, setReturnedBorrowsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Fetch live counts strictly adhering to backend contract
  const fetchCounts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // 1. Active borrows count: GET /dashboard/borrows/?status=ACTIVE
      // 2. Pending requests count: GET /dashboard/borrow-requests/?status=PENDING
      // 3. Returned borrows count: GET /dashboard/borrows/?status=RETURNED
      const [activeRes, pendingRes, returnedRes] = await Promise.all([
        borrowingService.getBorrows({ status: "ACTIVE", pageSize: 1 }).catch(() => ({ count: 0 })),
        borrowingService.getBorrowRequests({ status: "PENDING", pageSize: 1 }).catch(() => ({ count: 0 })),
        borrowingService.getBorrows({ status: "RETURNED", pageSize: 1 }).catch(() => ({ count: 0 })),
      ]);

      setActiveBorrowsCount(activeRes?.count ?? 0);
      setPendingRequestsCount(pendingRes?.count ?? 0);
      setReturnedBorrowsCount(returnedRes?.count ?? 0);

      // Favorites count
      setFavoritesCount(favoritesService.getCachedCount());
    } catch {
      // Ignore background count errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCounts();

    const handleFavUpdate = (e) => {
      if (typeof e.detail?.count === "number") {
        setFavoritesCount(e.detail.count);
      } else {
        setFavoritesCount(favoritesService.getCachedCount());
      }
    };

    window.addEventListener("favorites-updated", handleFavUpdate);
    return () => {
      window.removeEventListener("favorites-updated", handleFavUpdate);
    };
  }, [fetchCounts]);

  // Loading State
  if (isLoading) {
    return (
      <Container className="py-8 space-y-6">
        <Breadcrumbs items={[{ label: "الملف الشخصي" }]} />
        <div className="h-44 rounded-2xl bg-surface border border-border p-6 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-surface border border-border p-4 animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-surface border border-border p-6 animate-pulse" />
      </Container>
    );
  }

  // Unauthenticated State: Prompt user to log in
  if (!isAuthenticated || !user) {
    return (
      <Container className="py-12 sm:py-16">
        <Breadcrumbs items={[{ label: "الملف الشخصي" }]} />
        <div className="max-w-md mx-auto mt-8 bg-surface rounded-2xl border border-border p-8 text-center space-y-5 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-secondary-50 text-secondary-hover border border-secondary/20 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7 text-secondary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-arabic">
              تسجيل الدخول مطلوب
            </h2>
            <p className="text-xs text-foreground-muted leading-relaxed">
              يرجى تسجيل الدخول إلى حسابك المعتمد في المنصة الرقمية لوزارة الأوقاف لعرض الملف الشخصي، وإدارة الكتب المستعارة والنشاط.
            </p>
          </div>

          <Link href="/login?redirect=/profile" className="block w-full">
            <Button variant="primary" size="lg" className="w-full font-bold">
              <LogIn className="w-4 h-4" />
              <span>الانتقال إلى صفحة الدخول</span>
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  // Authenticated Profile State
  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "الملف الشخصي" }]} />
      <ProfileHeader user={user} profile={profile} />
      <ProfileStats
        activeBorrowsCount={activeBorrowsCount}
        pendingRequestsCount={pendingRequestsCount}
        returnedBorrowsCount={returnedBorrowsCount}
        favoritesCount={favoritesCount}
      />
      <ProfileTabs
        user={user}
        profile={profile}
        onCountsRefresh={fetchCounts}
      />
    </Container>
  );
}
