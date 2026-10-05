import { apiClient, ApiError } from "@/lib/apiClient";

/**
 * Service for the new Dashboard Statistics APIs:
 * - GET /dashboard/stats/overview/
 * - GET /dashboard/stats/timeline/
 * - GET /dashboard/stats/rankings/
 * - GET /dashboard/stats/distributions/
 *
 * Rules:
 * - Trailing slashes are mandatory on all endpoints.
 * - Allowed roles: SUPERUSER, MINISTRY_ADMIN, GOVERNORATE_ADMIN, LIBRARIAN.
 * - READER receives 403 PERMISSION_DENIED.
 * - period ('7d' | '30d') and date_from/date_to are mutually exclusive.
 * - limit applies only to rankings (default 5, max 10).
 */

function buildQueryParams({
  period = "30d",
  date_from = null,
  date_to = null,
  governorate = null,
  library = null,
  limit = null,
} = {}) {
  const params = new URLSearchParams();

  // Custom date range takes precedence if both dates are provided
  if (date_from && date_to) {
    params.append("date_from", String(date_from).trim());
    params.append("date_to", String(date_to).trim());
  } else if (period) {
    params.append("period", period === "7d" ? "7d" : "30d");
  }

  // Scope filters
  if (governorate !== null && governorate !== undefined && governorate !== "" && governorate !== "all") {
    params.append("governorate", String(governorate));
  }

  if (library !== null && library !== undefined && library !== "" && library !== "all") {
    params.append("library", String(library));
  }

  // Rankings limit
  if (limit !== null && limit !== undefined) {
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);
    params.append("limit", String(safeLimit));
  }

  return params.toString();
}

/**
 * Generate fallback mock data strictly adhering to backend contract
 * used when previewing or when offline / unauthenticated during dev.
 */
function getFallbackOverview(periodType = "30d") {
  const isSevenDays = periodType === "7d";
  const days = isSevenDays ? 7 : 30;
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const formatDate = (d) => d.toISOString().split("T")[0];

  return {
    scope: {
      level: "MINISTRY",
      governorate: null,
      library: null,
    },
    period: {
      type: periodType,
      date_from: formatDate(past),
      date_to: formatDate(now),
      days,
      timezone: "Asia/Damascus",
    },
    organization: {
      governorates_count: 14,
      active_governorates_count: 12,
      inactive_governorates_count: 2,
      libraries_count: 52,
      active_libraries_count: 48,
      inactive_libraries_count: 4,
    },
    users: {
      readers_count: 14250,
      active_readers_count: 13600,
      inactive_readers_count: 650,
      borrowing_blocked_readers_count: 42,
      librarians_count: 108,
      active_librarians_count: 104,
      inactive_librarians_count: 4,
    },
    catalog: {
      books_count: 24890,
      active_books_count: 23150,
      archived_books_count: 1740,
      total_copies: 48600,
      available_copies: 38920,
      borrowed_copies: 9680,
      unavailable_books_count: 64,
      authors_count: 2150,
      categories_count: 48,
    },
    borrowing: {
      current: {
        active_borrows: 3840,
        returned_borrows_total: 54200,
      },
      period: {
        borrows_created: isSevenDays ? 280 : 1150,
        direct_borrows: isSevenDays ? 160 : 690,
        request_borrows: isSevenDays ? 120 : 460,
        returns: isSevenDays ? 245 : 980,
      },
    },
    requests: {
      current: {
        pending_requests: 35,
      },
      period: {
        requests_created: isSevenDays ? 145 : 590,
        approved_requests: isSevenDays ? 120 : 485,
        rejected_requests: isSevenDays ? 18 : 72,
        decided_requests: isSevenDays ? 138 : 557,
        approval_rate: 87.1,
        rejection_rate: 12.9,
      },
    },
    favorites: {
      current: {
        favorites_count: 6840,
      },
      period: {
        favorites_added: isSevenDays ? 95 : 430,
      },
    },
  };
}

function getFallbackTimeline(daysCount = 30) {
  const list = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const borrows = Math.floor(15 + Math.sin(i * 0.5) * 10 + Math.random() * 8);
    const returns = Math.floor(12 + Math.cos(i * 0.4) * 8 + Math.random() * 6);
    const requests = Math.floor(18 + Math.sin(i * 0.6) * 12 + Math.random() * 7);
    const approved = Math.floor(requests * 0.82);
    const rejected = requests - approved;

    list.push({
      date: dateStr,
      borrows: Math.max(0, borrows),
      returns: Math.max(0, returns),
      requests: Math.max(0, requests),
      approved_requests: Math.max(0, approved),
      rejected_requests: Math.max(0, rejected),
    });
  }
  return list;
}

function getFallbackRankings() {
  return {
    most_borrowed_books: [
      {
        book_id: 101,
        title: "صحيح البخاري بشرح الكرماني",
        library_id: 1,
        library_name: "مكتبة الظاهرية الوطنية",
        count: 142,
      },
      {
        book_id: 102,
        title: "تفسير القرطبي - الجامع لأحكام القرآن",
        library_id: 2,
        library_name: "مكتبة الأسد الوطنية",
        count: 118,
      },
      {
        book_id: 103,
        title: "الموافقات في أصول الشريعة للشاطبي",
        library_id: 3,
        library_name: "دار الكتب الوطنية بحلب",
        count: 96,
      },
      {
        book_id: 104,
        title: "رياض الصالحين من كلام سيد المرسلين",
        library_id: 4,
        library_name: "مكتبة حمص المركزية الوقفية",
        count: 85,
      },
      {
        book_id: 105,
        title: "فتح الباري بشرح صحيح البخاري لابن حجر",
        library_id: 1,
        library_name: "مكتبة الظاهرية الوطنية",
        count: 74,
      },
      {
        book_id: 106,
        title: "تاريخ دمشق لابن عساكر",
        library_id: 2,
        library_name: "مكتبة الأسد الوطنية",
        count: 63,
      },
      {
        book_id: 107,
        title: "قواعد الأحكام في مصالح الأنام للعز بن عبد السلام",
        library_id: 5,
        library_name: "مكتبة حماة الوقفية",
        count: 58,
      },
    ],
    most_requested_books: [
      {
        book_id: 101,
        title: "صحيح البخاري بشرح الكرماني",
        library_id: 1,
        library_name: "مكتبة الظاهرية الوطنية",
        count: 165,
      },
      {
        book_id: 108,
        title: "إحياء علوم الدين للإمام الغزالي",
        library_id: 2,
        library_name: "مكتبة الأسد الوطنية",
        count: 134,
      },
      {
        book_id: 102,
        title: "تفسير القرطبي - الجامع لأحكام القرآن",
        library_id: 2,
        library_name: "مكتبة الأسد الوطنية",
        count: 122,
      },
      {
        book_id: 103,
        title: "الموافقات في أصول الشريعة للشاطبي",
        library_id: 3,
        library_name: "دار الكتب الوطنية بحلب",
        count: 104,
      },
      {
        book_id: 109,
        title: "الجامع لأحكام الصنائع الوقفية",
        library_id: 1,
        library_name: "مكتبة الظاهرية الوطنية",
        count: 91,
      },
    ],
    most_favorited_books: [
      {
        book_id: 101,
        title: "صحيح البخاري بشرح الكرماني",
        library_id: 1,
        library_name: "مكتبة الظاهرية الوطنية",
        count: 420,
      },
      {
        book_id: 102,
        title: "تفسير القرطبي - الجامع لأحكام القرآن",
        library_id: 2,
        library_name: "مكتبة الأسد الوطنية",
        count: 388,
      },
      {
        book_id: 108,
        title: "إحياء علوم الدين للإمام الغزالي",
        library_id: 2,
        library_name: "مكتبة الأسد الوطنية",
        count: 345,
      },
      {
        book_id: 104,
        title: "رياض الصالحين من كلام سيد المرسلين",
        library_id: 4,
        library_name: "مكتبة حمص المركزية الوقفية",
        count: 312,
      },
      {
        book_id: 110,
        title: "سير أعلام النبلاء للإمام الذهبي",
        library_id: 3,
        library_name: "دار الكتب الوطنية بحلب",
        count: 290,
      },
    ],
    favorites_window: "LIFETIME",
    most_active_libraries: [
      {
        library_id: 1,
        library_name: "مكتبة الظاهرية الوطنية",
        governorate_id: 1,
        governorate_name: "دمشق",
        borrows_count: 480,
      },
      {
        library_id: 2,
        library_name: "مكتبة الأسد الوطنية",
        governorate_id: 1,
        governorate_name: "دمشق",
        borrows_count: 410,
      },
      {
        library_id: 3,
        library_name: "دار الكتب الوطنية بحلب",
        governorate_id: 2,
        governorate_name: "حلب",
        borrows_count: 350,
      },
      {
        library_id: 4,
        library_name: "مكتبة حمص المركزية الوقفية",
        governorate_id: 3,
        governorate_name: "حمص",
        borrows_count: 280,
      },
      {
        library_id: 5,
        library_name: "مكتبة حماة الوقفية",
        governorate_id: 4,
        governorate_name: "حماة",
        borrows_count: 210,
      },
    ],
    most_active_governorates: [
      {
        governorate_id: 1,
        governorate_name: "دمشق",
        borrows_count: 890,
      },
      {
        governorate_id: 2,
        governorate_name: "حلب",
        borrows_count: 620,
      },
      {
        governorate_id: 3,
        governorate_name: "حمص",
        borrows_count: 450,
      },
      {
        governorate_id: 4,
        governorate_name: "حماة",
        borrows_count: 380,
      },
      {
        governorate_id: 5,
        governorate_name: "اللاذقية",
        borrows_count: 290,
      },
    ],
  };
}

function getFallbackDistributions() {
  return {
    governorates: [
      {
        governorate_id: 1,
        governorate_name: "دمشق",
        libraries_count: 12,
        readers_count: 4200,
        books_count: 9800,
        active_borrows_count: 1450,
        period_borrows_count: 890,
      },
      {
        governorate_id: 2,
        governorate_name: "حلب",
        libraries_count: 9,
        readers_count: 3100,
        books_count: 6500,
        active_borrows_count: 980,
        period_borrows_count: 620,
      },
      {
        governorate_id: 3,
        governorate_name: "حمص",
        libraries_count: 6,
        readers_count: 2200,
        books_count: 4200,
        active_borrows_count: 640,
        period_borrows_count: 450,
      },
      {
        governorate_id: 4,
        governorate_name: "حماة",
        libraries_count: 5,
        readers_count: 1800,
        books_count: 3400,
        active_borrows_count: 490,
        period_borrows_count: 380,
      },
      {
        governorate_id: 5,
        governorate_name: "اللاذقية",
        libraries_count: 4,
        readers_count: 1400,
        books_count: 2800,
        active_borrows_count: 390,
        period_borrows_count: 290,
      },
      {
        governorate_id: 6,
        governorate_name: "طرطوس",
        libraries_count: 3,
        readers_count: 950,
        books_count: 1900,
        active_borrows_count: 270,
        period_borrows_count: 195,
      },
      {
        governorate_id: 7,
        governorate_name: "درعا",
        libraries_count: 3,
        readers_count: 600,
        books_count: 1290,
        active_borrows_count: 120,
        period_borrows_count: 105,
      },
    ],
    libraries: [],
  };
}

export const dashboardStatsService = {
  /**
   * GET /dashboard/stats/overview/
   * Fetches Snapshot metrics + Period activity metrics.
   */
  async getOverview(filterOptions = {}) {
    const query = buildQueryParams(filterOptions);
    const endpoint = query
      ? `/dashboard/stats/overview/?${query}`
      : "/dashboard/stats/overview/";

    try {
      const response = await apiClient.get(endpoint);
      return {
        data: response?.data || null,
        meta: response?.meta || null,
        code: response?.code || "DASHBOARD_OVERVIEW_RETRIEVED",
        message: response?.message || "",
        isFallback: false,
      };
    } catch (err) {
      if (err?.status === 403) {
        throw err; // Let Reader 403 trigger permission denied view
      }
      // Return structured fallback if unauthenticated / offline
      return {
        data: getFallbackOverview(filterOptions.period || "30d"),
        meta: { requester_role: { code: "MINISTRY_ADMIN", label: "مسؤول الوزارة" } },
        code: "DASHBOARD_OVERVIEW_FALLBACK",
        message: "بيانات توضيحية للمنظومة",
        isFallback: true,
      };
    }
  },

  /**
   * GET /dashboard/stats/timeline/
   * Fetches daily activity array for line/area charts.
   */
  async getTimeline(filterOptions = {}) {
    const query = buildQueryParams(filterOptions);
    const endpoint = query
      ? `/dashboard/stats/timeline/?${query}`
      : "/dashboard/stats/timeline/";

    try {
      const response = await apiClient.get(endpoint);
      return {
        data: Array.isArray(response?.data) ? response.data : [],
        meta: response?.meta || null,
        code: response?.code || "DASHBOARD_TIMELINE_RETRIEVED",
        message: response?.message || "",
        isFallback: false,
      };
    } catch (err) {
      if (err?.status === 403) throw err;
      const days = filterOptions.period === "7d" ? 7 : 30;
      return {
        data: getFallbackTimeline(days),
        meta: null,
        code: "DASHBOARD_TIMELINE_FALLBACK",
        message: "بيانات توضيحية للخط الزمني",
        isFallback: true,
      };
    }
  },

  /**
   * GET /dashboard/stats/rankings/
   * Fetches top rankings for books, libraries, and governorates.
   * limit: default 5, max 10.
   */
  async getRankings(filterOptions = {}) {
    const query = buildQueryParams(filterOptions);
    const endpoint = query
      ? `/dashboard/stats/rankings/?${query}`
      : "/dashboard/stats/rankings/";

    try {
      const response = await apiClient.get(endpoint);
      return {
        data: response?.data || null,
        meta: response?.meta || null,
        code: response?.code || "DASHBOARD_RANKINGS_RETRIEVED",
        message: response?.message || "",
        isFallback: false,
      };
    } catch (err) {
      if (err?.status === 403) throw err;
      return {
        data: getFallbackRankings(),
        meta: null,
        code: "DASHBOARD_RANKINGS_FALLBACK",
        message: "بيانات توضيحية للوائح الصدارة",
        isFallback: true,
      };
    }
  },

  /**
   * GET /dashboard/stats/distributions/
   * Comparative distributions across governorates or libraries.
   */
  async getDistributions(filterOptions = {}) {
    const query = buildQueryParams(filterOptions);
    const endpoint = query
      ? `/dashboard/stats/distributions/?${query}`
      : "/dashboard/stats/distributions/";

    try {
      const response = await apiClient.get(endpoint);
      return {
        data: response?.data || null,
        meta: response?.meta || null,
        code: response?.code || "DASHBOARD_DISTRIBUTIONS_RETRIEVED",
        message: response?.message || "",
        isFallback: false,
      };
    } catch (err) {
      if (err?.status === 403) throw err;
      return {
        data: getFallbackDistributions(),
        meta: null,
        code: "DASHBOARD_DISTRIBUTIONS_FALLBACK",
        message: "بيانات توضيحية للتوزيع الجغرافي",
        isFallback: true,
      };
    }
  },
};
