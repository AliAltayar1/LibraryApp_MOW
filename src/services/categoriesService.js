import { apiClient } from "@/lib/apiClient";

/**
 * Normalizes backend category object into standard application model.
 */
export function transformBackendCategory(c) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name || "تصنيف غير مسمى",
    slug: c.slug || c.name || String(c.id),
    count: c.count ?? c.book_count ?? 0,
    description:
      c.description ||
      `المؤلفات والكتب التخصصية والمصنفات التابعة لـ ${c.name}.`,
    icon: c.icon || "BookOpenText",
  };
}

/**
 * Service for Categories connecting to live Backend APIs:
 * 1. Public catalog showcase categories (GET /api/category/)
 * 2. Authenticated Dashboard Category Management (GET/POST/PATCH/DELETE /dashboard/category/)
 */
export const categoriesService = {
  /**
   * Public category list for Home showcase and Public Catalog Filters.
   * Fetches real categories from /api/category/.
   * Always returns an Array for safe mapping in UI components.
   */
  async getCategories(options = null) {
    try {
      const response = await apiClient.get("/api/category/");
      let rawList = [];

      if (Array.isArray(response)) {
        rawList = response;
      } else if (Array.isArray(response?.data)) {
        rawList = response.data;
      } else if (Array.isArray(response?.data?.results)) {
        rawList = response.data.results;
      } else if (Array.isArray(response?.results)) {
        rawList = response.results;
      }

      let transformed = rawList.map(transformBackendCategory).filter(Boolean);

      // Search filter if options.search is specified
      if (options && typeof options === "object" && options.search) {
        const q = options.search.toLowerCase().trim();
        transformed = transformed.filter((c) =>
          c.name.toLowerCase().includes(q)
        );
      }

      return transformed;
    } catch (err) {
      console.warn("Public categories fetch failed:", err);
      return [];
    }
  },

  /**
   * Authenticated Category Management endpoint.
   * GET /dashboard/category/
   */
  async getDashboardCategories({ search = "", page = 1, pageSize = 20 } = {}) {
    try {
      const params = new URLSearchParams();

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      if (page && Number(page) > 1) {
        params.append("page", String(page));
      }

      if (pageSize && Number(pageSize) !== 20) {
        const safePageSize = Math.min(Math.max(Number(pageSize), 1), 100);
        params.append("page_size", String(safePageSize));
      }

      const qs = params.toString();
      const endpoint = qs ? `/dashboard/category/?${qs}` : "/dashboard/category/";
      const response = await apiClient.get(endpoint);

      return {
        count: response?.data?.count ?? 0,
        next: response?.data?.next ?? null,
        previous: response?.data?.previous ?? null,
        results: response?.data?.results ?? [],
        meta: response?.meta ?? null,
        message: response?.message ?? "",
        code: response?.code ?? "",
      };
    } catch (err) {
      console.error("Dashboard categories fetch error:", err);
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
        meta: null,
        message: err?.message || "تعذر جلب التصنيفات",
        code: err?.code || "ERROR",
      };
    }
  },

  /**
   * Retrieve single category by ID.
   * GET /dashboard/category/{id}/ or /api/category/{id}/
   */
  async getCategoryById(id) {
    if (!id) throw new Error("معرّف التصنيف مطلوب.");
    try {
      const response = await apiClient.get(`/dashboard/category/${id}/`);
      return {
        data: response?.data ?? null,
        meta: response?.meta ?? null,
        message: response?.message ?? "",
        code: response?.code ?? "",
      };
    } catch {
      const response = await apiClient.get(`/api/category/${id}/`);
      return {
        data: response?.data || response || null,
        meta: null,
        message: "",
        code: "SUCCESS",
      };
    }
  },

  /**
   * Create a new category.
   * POST /dashboard/category/
   *
   * Allowed for: SUPERUSER, MINISTRY_ADMIN, GOVERNORATE_ADMIN.
   * Forbidden for: LIBRARIAN (403), READER (403).
   */
  async createCategory({ name }) {
    if (!name || !name.trim()) {
      throw new Error("اسم التصنيف مطلوب ولا يمكن تركه فارغاً.");
    }

    const cleanName = name.trim();
    if (cleanName.length > 100) {
      throw new Error("اسم التصنيف يجب ألا يتجاوز 100 حرف.");
    }

    const response = await apiClient.post("/dashboard/category/", {
      name: cleanName,
    });

    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Update category name via PATCH.
   * PATCH /dashboard/category/{id}/
   *
   * Allowed for: SUPERUSER, MINISTRY_ADMIN, GOVERNORATE_ADMIN.
   * PUT is NOT supported.
   */
  async updateCategory(id, { name }) {
    if (!id) throw new Error("معرّف التصنيف مطلوب.");
    if (!name || !name.trim()) {
      throw new Error("اسم التصنيف مطلوب.");
    }

    const cleanName = name.trim();
    if (cleanName.length > 100) {
      throw new Error("اسم التصنيف يجب ألا يتجاوز 100 حرف.");
    }

    const response = await apiClient.patch(`/dashboard/category/${id}/`, {
      name: cleanName,
    });

    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Delete a category.
   * DELETE /dashboard/category/{id}/
   *
   * Allowed for: SUPERUSER, MINISTRY_ADMIN, GOVERNORATE_ADMIN.
   * If associated with books, backend returns 400 VALIDATION_ERROR.
   */
  async deleteCategory(id) {
    if (!id) throw new Error("معرّف التصنيف مطلوب.");
    const response = await apiClient.delete(`/dashboard/category/${id}/`);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Method for category lookup by slug or name
   */
  async getCategoryBySlug(slug) {
    if (!slug) return null;
    const categories = await this.getCategories();
    return (
      categories.find(
        (c) =>
          c.slug === slug ||
          c.name === slug ||
          String(c.id) === String(slug)
      ) || null
    );
  },
};
