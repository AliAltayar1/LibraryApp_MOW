import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS resolution
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numbers into Arabic locale digits
 */
export function formatArabicNumber(number) {
  if (number === undefined || number === null) return "";
  // return new Intl.NumberFormat("ar-SY").format(number);
  return number;
}

/**
 *
 * Truncates text cleanly with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
