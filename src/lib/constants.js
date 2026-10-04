export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://library-management-system-piim.onrender.com";

export const APP_CONFIG = {
  name: "المكتبة الإلكترونية",
  ministryName: "وزارة الأوقاف في الجمهورية العربية السورية",
  shortMinistryName: "وزارة الأوقاف السورية",
  description:
    "المنصة الرقمية الموحدة للمخطوطات والكتب والدراسات الإسلامية والتاريخية والوقفية لوزارة الأوقاف في الجمهورية العربية السورية.",
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "mow_library_access_token",
  USER_DATA: "mow_library_user",
};

export const ROLES = {
  SUPERUSER: {
    code: "SUPERUSER",
    label: "مدير النظام",
  },
  MINISTRY_ADMIN: {
    code: "MINISTRY_ADMIN",
    label: "مسؤول الوزارة",
  },
  GOVERNORATE_ADMIN: {
    code: "GOVERNORATE_ADMIN",
    label: "مسؤول المحافظة",
  },
  LIBRARIAN: {
    code: "LIBRARIAN",
    label: "أمين مكتبة",
  },
  READER: {
    code: "READER",
    label: "قارئ",
  },
};

export const NAVIGATION_LINKS = [
  { name: "الرئيسية", href: "/" },
  { name: "الكتب والمطبوعات", href: "/books" },
  { name: "المكتبات والمراكز", href: "/libraries" },
  { name: "المفضلة", href: "/favorites" },
];

export const SORT_OPTIONS = [
  { id: "latest", label: "الأحدث إضافةً" },
  { id: "popular", label: "الأكثر قراءة" },
  { id: "rating", label: "الأعلى تقييماً" },
  { id: "title_asc", label: "العنوان (أ - ي)" },
  { id: "year_desc", label: "سنة النشر (الأحدث)" },
];

export const LANGUAGE_OPTIONS = [
  { id: "all", label: "جميع اللغات" },
  { id: "ar", label: "العربية" },
  { id: "en", label: "الإنجليزية" },
  { id: "fr", label: "الفرنسية" },
];

export const FORMAT_OPTIONS = [
  { id: "all", label: "جميع الصيغ" },
  { id: "pdf", label: "كتاب مصور (PDF)" },
  { id: "text", label: "نسخة نصية رقمية" },
  { id: "manuscript", label: "مخطوطة نادرة" },
];
