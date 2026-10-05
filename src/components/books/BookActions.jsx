"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/ui/Button";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  bookId,
  initialIsFavorite = false,
  size = "md",
  className,
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState(null); // { message, type: 'error' | 'info' }

  const active = isFavorite(bookId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication
    if (!isAuthenticated) {
      setFeedback({ message: "يرجى تسجيل الدخول لحفظ الكتاب", type: "info" });
      setTimeout(() => {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }, 1200);
      return;
    }

    // Role check: Only READER role is allowed by backend contract
    if (user?.role?.code && user.role.code !== "READER") {
      setFeedback({
        message: "المفضلة متاحة لحسابات القراء فقط",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsPending(true);
    setFeedback(null);

    try {
      await toggleFavorite(bookId);
    } catch (err) {
      const errMsg =
        err.code === "PERMISSION_DENIED"
          ? "المفضلة متاحة للقراء فقط."
          : err.code === "NOT_FOUND" || err.status === 404
          ? "المصنف خارج نطاق محافظتك أو غير متاح."
          : err.message || "تعذر تحديث المفضلة.";

      setFeedback({ message: errMsg, type: "error" });
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setIsPending(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-4.5 h-4.5",
    lg: "w-5 h-5",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={active ? "إزالة من قائمة المفضلة" : "إضافة إلى قائمة المفضلة"}
        aria-pressed={active}
        className={cn(
          "relative rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
          active
            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            : "bg-surface/90 text-foreground-subtle border border-border hover:text-red-500 hover:bg-surface hover:border-red-200",
          sizeClasses[size],
          className
        )}
      >
        {isPending ? (
          <Loader2 className={cn(iconSizes[size], "animate-spin text-red-500")} />
        ) : (
          <Heart
            className={cn(
              iconSizes[size],
              "transition-transform duration-200",
              active && "fill-current scale-110",
              isPending && "scale-90"
            )}
          />
        )}
      </button>

      {/* Floating feedback tooltip */}
      {feedback && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 bottom-full mb-1.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap shadow-md pointer-events-none transition-all animate-in fade-in zoom-in-95",
            feedback.type === "error"
              ? "bg-red-900 text-white border border-red-800"
              : "bg-primary-900 text-white border border-primary-800"
          )}
        >
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}

export function BookShareButton({ bookTitle, className }) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={cn("gap-1.5 text-xs", className)}
      aria-label="مشاركة رابط الكتاب"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Share2 className="w-3.5 h-3.5" />}
      <span>{copied ? "تم النسخ" : "مشاركة"}</span>
    </Button>
  );
}
