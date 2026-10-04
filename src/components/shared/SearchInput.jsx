"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/ui/Button";
import { cn } from "@/lib/utils";

export function SearchInput({
  defaultValue = "",
  placeholder = "ابحث عن كتاب، مؤلف، أو موضوع...",
  onSearch,
  size = "md",
  autoFocus = false,
  className,
}) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setValue("");
    if (onSearch) {
      onSearch("");
    }
  };

  const isLarge = size === "lg";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center w-full shadow-subtle rounded-xl bg-surface border border-border transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
        isLarge ? "p-1.5 sm:p-2" : "p-1",
        className
      )}
    >
      <div className="ps-3 text-foreground-subtle flex items-center pointer-events-none">
        <Search className={cn("text-primary/70", isLarge ? "w-5 h-5" : "w-4 h-4")} />
      </div>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "w-full bg-transparent border-none text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-0 text-start",
          isLarge ? "px-3 py-2 text-sm sm:text-base" : "px-2.5 py-1.5 text-xs sm:text-sm"
        )}
        aria-label="حقل البحث"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="مسح نص البحث"
          className="p-1 rounded-full text-foreground-subtle hover:text-foreground hover:bg-surface-muted transition-colors me-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <Button
        type="submit"
        variant="primary"
        size={isLarge ? "md" : "sm"}
        className={cn("shrink-0 font-semibold px-4", isLarge ? "h-11" : "h-8")}
      >
        <span>بحث</span>
      </Button>
    </form>
  );
}
