import React from "react";
import { Clock, CheckCircle2, FileUp, ShieldAlert, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActivityFeed({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "upload":
        return <FileUp className="w-3.5 h-3.5 text-primary" />;
      case "audit":
        return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      case "user":
        return <ShieldAlert className="w-3.5 h-3.5 text-secondary-hover" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-foreground-muted" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-50 text-primary border border-primary/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                سجل الأنشطة والمعاملات الأخيرة
              </h3>
              <p className="text-xs text-foreground-muted">
                متابعة حركة الإدراج والتدقيق في النظام
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-foreground-subtle bg-surface-muted px-2 py-0.5 rounded-md">
            محدث آنياً
          </span>
        </div>

        <div className="space-y-3">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-surface-muted/50 border border-border-subtle hover:bg-surface-muted transition-colors flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-surface border border-border shrink-0 mt-0.5 shadow-subtle">
                {getIcon(act.type)}
              </div>

              <div className="flex-1 min-w-0 text-start">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-xs font-bold text-foreground truncate">
                    {act.title}
                  </p>
                  <span className="text-[10px] text-foreground-subtle shrink-0">
                    {act.time}
                  </span>
                </div>

                <p className="text-xs text-primary font-medium truncate mb-1">
                  {act.target}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-foreground-subtle">
                  <span>المسؤول: {act.user}</span>
                  <span>•</span>
                  <span>{act.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle text-center">
        <span className="text-xs text-foreground-subtle">
          يتم تسجيل كافة العمليات الإدارية في السجل الأمني الموحد تلقائياً
        </span>
      </div>
    </div>
  );
}
