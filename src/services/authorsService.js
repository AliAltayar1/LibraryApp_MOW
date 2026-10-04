import { apiClient } from "@/lib/apiClient";

/**
 * Service for Author Management endpoints under /dashboard/author/
 * strictly adhering to the Backend Integration Contract:
 * - Base endpoint: /dashboard/author/
 * - All trailing slashes required.
 * - Authenticated with Bearer token.
 * - Supported methods: GET, POST, PATCH, DELETE (PUT is NOT supported).
 * - Permissions:
 *   - SUPERUSER, MINISTRY_ADMIN, GOVERNORATE_ADMIN: List, Retrieve, Create, Update, Delete.
 *   - LIBRARIAN: List, Retrieve only (needed when adding/editing books).
 *   - READER: List only (for book filters).
 *   - Anonymous: 401.
 * - Search: GET /dashboard/author/?search=... (case-insensitive partial match on name).
 * - Pagination: page (default 1), page_size (default 20, max 100).
 * - Safe Delete: Author cannot be deleted if associated with books (returns 400 VALIDATION_ERROR).
 */
export const authorsService = {
  /**
   * Fetch paginated list of authors with search support.
   * GET /dashboard/author/
   */
  async getAuthors({ search = "", page = 1, pageSize = 20 } = {}) {
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
    const endpoint = qs ? `/dashboard/author/?${qs}` : "/dashboard/author/";
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
  },

  /**
   * Retrieve single author by ID.
   * GET /dashboard/author/{id}/
   */
  async getAuthorById(id) {
    if (!id) throw new Error("معرّف المؤلف مطلوب.");
    const response = await apiClient.get(`/dashboard/author/${id}/`);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Create a new author.
   * POST /dashboard/author/
   *
   * Allowed for: SUPERUSER, MINISTRY_ADMIN, GOVERNORATE_ADMIN.
   * Forbidden for: LIBRARIAN (403), READER (403).
   *
   * Validation:
   * - name: required, non-empty, max 100 chars, trimmed.
   */
  async createAuthor({ name }) {
    if (!name || !name.trim()) {
      throw new Error("اسم المؤلف مطلوب ولا يمكن تركه فارغاً.");
    }

    const cleanName = name.trim();
    if (cleanName.length > 100) {
      throw new Error("اسم المؤلف يجب ألا يتجاوز 100 حرف.");
    }

    const response = await apiClient.post("/dashboard/author/", {
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
   * Update author name via PATCH.
   * PATCH /dashboard/author/{id}/
   *
   * Allowed for: SUPERUSER, MINISTRY_ADMIN, GOVERNORATE_ADMIN.
   * PUT is NOT supported.
   */
  async updateAuthor(id, { name }) {
    if (!id) throw new Error("معرّف المؤلف مطلوب.");
    if (!name || !name.trim()) {
      throw new Error("اسم المؤلف مطلوب.");
    }

    const cleanName = name.trim();
    if (cleanName.length > 100) {
      throw new Error("اسم المؤلف يجب ألا يتجاوز 100 حرف.");
    }

    const response = await apiClient.patch(`/dashboard/author/${id}/`, {
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
   * Delete an author.
   * DELETE /dashboard/author/{id}/
   *
   * Allowed for: SUPERUSER, MINISTRY_ADMIN, GOVERNORATE_ADMIN.
   * If associated with books, backend returns 400 VALIDATION_ERROR.
   */
  async deleteAuthor(id) {
    if (!id) throw new Error("معرّف المؤلف مطلوب.");
    const response = await apiClient.delete(`/dashboard/author/${id}/`);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },
};
