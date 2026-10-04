import React from "react";
import { cn } from "@/lib/utils";

/**
 * Institutional Book Cover Component
 * Renders a dignified, traditional academic binding with gold-leaf accents,
 * fine borders, and Syrian Endowment aesthetic.
 */
export function BookCover({
  title,
  author,
  category,
  coverTheme,
  aspectRatio = "3/4",
  size = "md",
  className,
}) {
  const sizeClasses = {
    sm: "w-24 h-36 text-[10px]",
    md: "w-36 sm:w-44 h-52 sm:h-64 text-xs",
    lg: "w-52 sm:w-64 h-72 sm:h-92 text-sm",
    xl: "w-64 sm:w-80 h-96 sm:h-[440px] text-base",
  };

  const bgGradient =
    coverTheme?.bgGradient || "from-[#0d4a37] via-[#093829] to-[#041d15]";
  const accentGold = coverTheme?.accentColor || "#c29b38";

  return (
    <div
      className={cn(
        "relative rounded-md overflow-hidden shadow-card transition-all duration-300 select-none group-hover:shadow-card-hover group-hover:-translate-y-1",
        "border border-primary-900/40 bg-gradient-to-bl",
        bgGradient,
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow:
          "2px 4px 12px rgba(0,0,0,0.18), inset 4px 0 8px rgba(0,0,0,0.35), inset -2px 0 4px rgba(255,255,255,0.05)",
      }}
      aria-hidden="true"
    >
      {/* Book Spine Shadow / Crease */}
      <div className="absolute inset-y-0 end-0 w-3 bg-gradient-to-s from-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 start-0 w-2.5 bg-gradient-to-e from-white/10 via-black/20 to-transparent pointer-events-none z-10" />

      {/* Decorative Gold Filigree Border Frame */}
      <div
        className="absolute inset-2 sm:inset-3 rounded-sm border border-secondary/40 pointer-events-none z-10 flex flex-col justify-between p-2 sm:p-3"
        style={{ borderColor: `${accentGold}66` }}
      >
        {/* Top Gold Corner Motifs */}
        <div className="flex justify-between items-center opacity-80">
          <span className="w-1.5 h-1.5 rotate-45 border-t border-s" style={{ borderColor: accentGold }} />
          <span className="text-[9px] font-medium tracking-widest uppercase opacity-70" style={{ color: accentGold }}>
            مكتبة الأوقاف
          </span>
          <span className="w-1.5 h-1.5 rotate-45 border-t border-e" style={{ borderColor: accentGold }} />
        </div>

        {/* Center Content: Title & Author */}
        <div className="text-center px-1 py-2 flex flex-col items-center justify-center my-auto">
          {category && (
            <span
              className="text-[9px] sm:text-[10px] font-medium tracking-wide mb-2 opacity-85 px-1.5 py-0.5 rounded border border-white/10"
              style={{ color: accentGold }}
            >
              {category}
            </span>
          )}

          <h4 className="font-bold text-white leading-snug line-clamp-3 mb-2 drop-shadow-sm font-arabic">
            {title}
          </h4>

          <div
            className="w-10 h-0.5 my-1.5 opacity-60 rounded-full"
            style={{ backgroundColor: accentGold }}
          />

          <p className="text-[11px] sm:text-xs text-primary-100/90 font-medium line-clamp-1">
            {author}
          </p>
        </div>

        {/* Bottom Gold Corner Motifs */}
        <div className="flex justify-between items-center opacity-80">
          <span className="w-1.5 h-1.5 rotate-45 border-b border-s" style={{ borderColor: accentGold }} />
          <div className="w-4 h-0.5 opacity-40" style={{ backgroundColor: accentGold }} />
          <span className="w-1.5 h-1.5 rotate-45 border-b border-e" style={{ borderColor: accentGold }} />
        </div>
      </div>

      {/* Subtle background parchment / geometric watermark */}
      <div className="absolute inset-0 bg-pattern-ornament opacity-15 pointer-events-none" />

      {/* Bookmark Ribbon Placeholder */}
      <div
        className="absolute top-0 start-4 w-3.5 h-7 shadow-sm z-20"
        style={{
          backgroundColor: accentGold,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
        }}
      />
    </div>
  );
}
