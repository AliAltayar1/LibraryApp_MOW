"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard Error Alert for Syrian Ministry of Endowments Digital Library.
 * Fully compatible with the Backend Unified Error Response contract:
 * {
 *   success: false,
 *   code: "ERROR_CODE",
 *   message: "رسالة الخطأ بالعربية",
 *   data: null,
 *   errors: { field: ["error1", "error2"] } | null,
 *   meta: { requester_role: null }
 * }
 */
export function ErrorAlert({
  message,
  code,
  errors,
  onClose,
  className,
}) {
  if (!message && (!errors || Object.keys(errors).length === 0)) {
    return null;
  }

  // Format field-level errors safely into { id, label, text }
  const formattedFieldErrors = React.useMemo(() => {
    if (!errors) return [];
    if (Array.isArray(errors)) {
      return errors.map((msg, idx) => ({
        id: `err-${idx}`,
        label: null,
        text: String(msg),
      }));
    }
    if (typeof errors === "object") {
      const list = [];
      for (const [field, val] of Object.entries(errors)) {
        if (!val) continue;
        let text = "";
        if (Array.isArray(val)) {
          text = val.map(String).join("، ");
        } else if (typeof val === "string") {
          text = val;
        } else if (val && typeof val === "object") {
          text = Object.values(val).flat().map(String).join("، ");
        }
        if (text) {
          list.push({
            id: field,
            label: field === "non_field_errors" || field === "detail" ? null : field,
            text,
          });
        }
      }
      return list;
    }
    return [{ id: "general", label: null, text: String(errors) }];
  }, [errors]);

  return (
    <div
      role="alert"
      className={cn(
        "p-3.5 sm:p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs animate-in fade-in transition-all",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-error" />
        <div className="flex-1 space-y-1.5 text-start">
          <div className="flex flex-wrap items-center gap-2">
            {message && (
              <p className="font-semibold text-xs text-error leading-relaxed">
                {message}
              </p>
            )}
            {code && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-error/15 text-error border border-error/25">
                {code}
              </span>
            )}
          </div>

          {formattedFieldErrors.length > 0 && (
            <ul className="space-y-1 text-[11px] list-disc list-inside text-error/90 pt-0.5">
              {formattedFieldErrors.map((item) => (
                <li key={item.id} className="leading-normal">
                  {item.label && (
                    <span className="font-semibold font-mono text-[10px] me-1 underline">
                      {item.label}:
                    </span>
                  )}
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق التنبيه"
            className="p-1 -me-1 rounded-md text-error hover:bg-error/15 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
