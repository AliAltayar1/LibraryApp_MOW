import { ROLES } from "@/lib/constants";
import { userManagementService } from "./userManagementService";
import { dashboardBooksService } from "./dashboardBooksService";
import { dashboardStatsService } from "./dashboardStatsService";
import { categoriesService } from "./categoriesService";

export const dashboardService = {
  /**
   * Fetch core KPI metrics for dashboard home from live statistics service
   */
  async getOverviewStats() {
    try {
      const res = await dashboardStatsService.getOverview();
      if (res?.data) {
        const cat = res.data.catalog || {};
        const usr = res.data.users || {};
        const brw = res.data.borrowing?.current || {};
        return {
          totalBooks: {
            value: cat.books_count || 0,
            formatted: String(cat.books_count || 0),
            change: "+0%",
            trend: "up",
            label: "إجمالي المصنفات الرقمية",
            subLabel: "شاملة المطبوعات والرسائل",
          },
          manuscripts: {
            value: cat.available_copies || 0,
            formatted: String(cat.available_copies || 0),
            change: "+0%",
            trend: "up",
            label: "النسخ المتاحة",
            subLabel: "متاحة للمطالعة والاستعارة",
          },
          registeredResearchers: {
            value: usr.readers_count || 0,
            formatted: String(usr.readers_count || 0),
            change: "+0%",
            trend: "up",
            label: "الباحثون وطلاب العلم",
            subLabel: "مستفيدون مسجلون وموثقون",
          },
          totalDownloads: {
            value: brw.returned_borrows_total || 0,
            formatted: String(brw.returned_borrows_total || 0),
            change: "+0%",
            trend: "up",
            label: "عمليات الاستعارة المنفذة",
            subLabel: "سجل العمليات المعتمدة",
          },
          storageUsedGb: 0,
          storageTotalGb: 100,
        };
      }
    } catch {
      // Return null when unauthenticated or unavailable
    }
    return null;
  },

  /**
   * Fetch categories breakdown
   */
  async getCategoriesDistribution() {
    try {
      const cats = await categoriesService.getCategories();
      const list = Array.isArray(cats) ? cats : [];
      return list.map((cat) => ({
        ...cat,
        percentage: 0,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Fetch system recent activities
   */
  async getRecentActivities() {
    return [];
  },

  /**
   * Fetch books with dashboard-specific pagination and search
   */
  async getDashboardBooks({
    query = "",
    category = "all",
    format = "all",
    status = "all",
    page = 1,
    pageSize = 10,
  } = {}) {
    try {
      const res = await dashboardBooksService.getBooks({
        page,
        pageSize: Math.min(pageSize, 10),
        category: category !== "all" ? category : "",
      });

      if (res && Array.isArray(res.results)) {
        return {
          items: res.results.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author?.name || b.author || "مجهول",
            category: b.category?.name || b.category || "عام",
            categorySlug: "general",
            year: b.publication_year ? `${b.publication_year} م` : "—",
            format: "pdf",
            viewsCount: 0,
            downloadsCount: b.count_borrowed || 0,
            isbn: b.isbn || "",
            possition: b.possition || "",
            total_copies: b.total_copies,
            available_copies: b.available_copies,
            count_borrowed: b.count_borrowed,
            is_avaiable: b.is_avaiable,
            is_archived: b.is_archived,
            library_name: b.library_name,
            governorate_name: b.governorate_name,
          })),
          total: res.count,
          page,
          totalPages: Math.ceil(res.count / pageSize) || 1,
        };
      }
    } catch (err) {
      console.error("Dashboard books fetch error:", err);
    }

    return {
      items: [],
      total: 0,
      page,
      totalPages: 1,
    };
  },

  /**
   * Add a new book to the library via dashboardBooksService
   */
  async addBook(newBook) {
    return await dashboardBooksService.createBook(newBook);
  },

  /**
   * Delete / archive a book by ID
   */
  async deleteBook(id) {
    return await dashboardBooksService.archiveBook(id);
  },

  /**
   * Fetch registered system users
   */
  async getUsers(params = {}) {
    try {
      const liveUsers = await userManagementService.getUsers(params);
      return Array.isArray(liveUsers) ? liveUsers : liveUsers?.results || [];
    } catch {
      return [];
    }
  },

  /**
   * Analytics breakdown by Syrian governorates & reading trends
   */
  async getAnalyticsData() {
    try {
      const [timelineRes, distRes] = await Promise.all([
        dashboardStatsService.getTimeline({ period: "30d" }),
        dashboardStatsService.getDistributions(),
      ]);
      return {
        monthlyActivity: timelineRes?.data || [],
        governorateDistribution: distRes?.data?.governorates || [],
        manuscriptsDigitizationGoal: {
          target: 0,
          completed: 0,
          inProgress: 0,
          percentage: 0,
        },
      };
    } catch {
      return {
        monthlyActivity: [],
        governorateDistribution: [],
        manuscriptsDigitizationGoal: {
          target: 0,
          completed: 0,
          inProgress: 0,
          percentage: 0,
        },
      };
    }
  },
};
