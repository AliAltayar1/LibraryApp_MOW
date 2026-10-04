import React from "react";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { ShieldCheck, Mail, Calendar, User, Phone, MapPin, AlertOctagon, CheckCircle2 } from "lucide-react";

export function ProfileHeader({ user, profile }) {
  if (!user) return null;

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name || user.username;

  const roleLabel = user.role?.label || profile?.tier || "عضو معتمد";
  const userInitial = (user.first_name?.[0] || user.username?.[0] || "م").toUpperCase();

  // Format date_joined
  const joinDateRaw = profile?.date_joined || user.date_joined;
  let formattedJoinDate = "عضو مسجل";
  if (joinDateRaw) {
    try {
      formattedJoinDate = new Date(joinDateRaw).toLocaleDateString("ar-SY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      formattedJoinDate = joinDateRaw;
    }
  }

  const phone = profile?.profile?.phone || "غير محدد";
  const address = profile?.profile?.address || "الجمهورية العربية السورية";
  const isBorrowingBlocked =
    profile?.borrowing_blocked ||
    profile?.profile?.borrowing_blocked ||
    user?.borrowing_blocked;

  return (
    <div className="relative rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-subtle mb-8 overflow-hidden">
      {/* Subtle top gold highlight */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-start">
        <Avatar
          size="xl"
          fallback={userInitial}
          alt={displayName}
          className="border-2 border-secondary/40 shadow-card bg-primary text-white font-bold text-xl"
        />

        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-arabic">
              {displayName}
            </h1>
            <Badge variant="gold" size="sm" className="gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>{roleLabel}</span>
            </Badge>

            {isBorrowingBlocked ? (
              <Badge variant="danger" size="sm" className="gap-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>حظر استعارة</span>
              </Badge>
            ) : (
              <Badge variant="success" size="sm" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>مؤهل للاستعارة</span>
              </Badge>
            )}
          </div>

          <p className="text-xs sm:text-sm font-semibold text-primary">
            معرف الحساب: <span className="font-mono text-foreground font-normal">@{user.username}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-xs text-foreground-muted pt-1">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="truncate">{user.email || profile?.email || "البريد غير متوفر"}</span>
            </div>

            {phone && phone !== "غير محدد" && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span dir="ltr">{phone}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{address}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>تاريخ الانضمام: {formattedJoinDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
