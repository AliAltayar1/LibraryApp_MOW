import { apiClient } from "@/lib/apiClient";
import { MOCK_CATEGORIES } from "@/data/mockCategories";

/**
 * Service for Categories.
 * Supports:
 * 1. Public catalog showcase categories (rich objects with icon, slug, count, description)
 * 2. Authenticated Dashboard Category Management (/dashboard/category/)
 */
export const categoriesService = {
  /**
   * Public category list for Home showcase and Public Catalog Filters.
   * Always returns an Array for safe mapping in UI components.
   */
  async getCategories(options) {
    if (!options) {
      return MOCK_CATEGORIES;
    }

    // If options was passed (e.g., search filter for public list)
    if (typeof options === "object" && options.search) {
      const q = options.search.toLowerCase().trim();
      return MOCK_CATEGORIES.filter((c) =>
        c.name.toLowerCase().includes(q)
      );
    }

    return MOCK_CATEGORIES;
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
    } catch {
      // Fallback if offline or token not present
      const filtered = search
        ? MOCK_CATEGORIES.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          )
        : MOCK_CATEGORIES;

      return {
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
        meta: null,
        message: "",
        code: "FALLBACK",
      };
    }
  },

  /**
   * Retrieve single category by ID.
   * GET /dashboard/category/{id}/
   */
  async getCategoryById(id) {
    if (!id) throw new Error("معرّف التصنيف مطلوب.");
    const response = await apiClient.get(`/dashboard/category/${id}/`);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
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
   * Compatibility method for public page lookup
   */
  async getCategoryBySlug(slug) {
    return MOCK_CATEGORIES.find((c) => c.slug === slug) || null;
  },
};
