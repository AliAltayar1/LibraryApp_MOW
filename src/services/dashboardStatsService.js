import { apiClient, ApiError } from "@/lib/apiClient";

/**
 * Service for the Dashboard Statistics APIs:
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
  if (
    governorate !== null &&
    governorate !== undefined &&
    governorate !== "" &&
    governorate !== "all"
  ) {
    params.append("governorate", String(governorate));
  }

  if (
    library !== null &&
    library !== undefined &&
    library !== "" &&
    library !== "all"
  ) {
    params.append("library", String(library));
  }

  // Rankings limit
  if (limit !== null && limit !== undefined) {
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);
    params.append("limit", String(safeLimit));
  }

  return params.toString();
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
      return {
        data: null,
        meta: null,
        code: err?.code || "DASHBOARD_OVERVIEW_ERROR",
        message: err?.message || "تعذر جلب بيانات الإحصائيات",
        isFallback: false,
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
      return {
        data: [],
        meta: null,
        code: err?.code || "DASHBOARD_TIMELINE_ERROR",
        message: err?.message || "تعذر جلب الخط الزمني",
        isFallback: false,
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
        data: null,
        meta: null,
        code: err?.code || "DASHBOARD_RANKINGS_ERROR",
        message: err?.message || "تعذر جلب لوائح الصدارة",
        isFallback: false,
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
        data: null,
        meta: null,
        code: err?.code || "DASHBOARD_DISTRIBUTIONS_ERROR",
        message: err?.message || "تعذر جلب التوزيع الجغرافي",
        isFallback: false,
      };
    }
  },
};
