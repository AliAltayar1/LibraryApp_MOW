"use client";

import React from "react";
import Link from "next/link";
import { Plus, BookOpen, FolderTree, Users, Building2, Sparkles, Inbox, BookmarkCheck } from "lucide-react";

export function QuickActions({ onOpenAddModal }) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            إجراءات سريعة ومعاملات فورية
          </h3>
          <p className="text-xs text-foreground-muted">
            الوصول المباشر لأكثر المهام الإدارية تكراراً في المكتبة
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-hover border border-secondary/20">
          مسؤول النظام
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Add Book */}
        {onOpenAddModal ? (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-primary/40 bg-primary-50/50 hover:bg-primary-50 hover:border-primary text-primary transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-2 shadow-subtle group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-foreground">
              إضافة كتاب جديد
            </span>
            <span className="text-[10px] text-foreground-subtle mt-0.5">
              فهرسة ونشر مصنف
            </span>
          </button>
        ) : (
          <Link
            href="/dashboard/books"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-primary/40 bg-primary-50/50 hover:bg-primary-50 hover:border-primary text-primary transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-2 shadow-subtle group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-foreground">
              إضافة كتاب جديد
            </span>
            <span className="text-[10px] text-foreground-subtle mt-0.5">
              فهرسة ونشر مصنف
            </span>
          </Link>
        )}

        {/* View All Books */}
        <Link
          href="/dashboard/books"
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-hover border border-secondary/20 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-foreground">
            جدول المصنفات
          </span>
          <span className="text-[10px] text-foreground-subtle mt-0.5">
            تعديل وفهرسة
          </span>
        </Link>

        {/* Borrow Requests */}
        <Link
          href="/dashboard/borrow-requests"
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Inbox className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-foreground">
            طلبات الاستعارة
          </span>
          <span className="text-[10px] text-foreground-subtle mt-0.5">
            مراجعة وقبول
          </span>
        </Link>

        {/* Borrows Management */}
        <Link
          href="/dashboard/borrows"
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-foreground">
            سجل الاستعارات
          </span>
          <span className="text-[10px] text-foreground-subtle mt-0.5">
            إرجاع وإعارة مباشرة
          </span>
        </Link>

        {/* Users & Permissions */}
        <Link
          href="/dashboard/users"
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-foreground">
            سجل المستخدمين
          </span>
          <span className="text-[10px] text-foreground-subtle mt-0.5">
            الصلاحيات وحظر الاستعارة
          </span>
        </Link>

        {/* Libraries Management */}
        <Link
          href="/dashboard/libraries"
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-foreground">
            إدارة المكتبات
          </span>
          <span className="text-[10px] text-foreground-subtle mt-0.5">
            المراكز والمنشآت
          </span>
        </Link>
      </div>
    </div>
  );
}
