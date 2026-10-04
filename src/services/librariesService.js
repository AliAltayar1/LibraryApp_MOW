import { apiClient } from "@/lib/apiClient";
import { authService } from "./authService";

/**
 * Service for Library Management endpoints under /accounts/libraries/
 * strictly adhering to the Backend Integration Contract:
 * - All library endpoints MUST end with a trailing slash (/).
 * - No /api/v1/ prefix.
 * - Authenticated with Bearer token.
 * - Libraries are never deleted; activate/deactivate only.
 */
export const librariesService = {
  /**
   * Fetch paginated list of libraries scoped to user's role.
   * GET /accounts/libraries/
   *
   * Query params:
   * - search: partial match on library name
   * - governorate: integer ID (for ministry admin / superuser)
   * - is_active: boolean (true | false)
   * - page: integer (default 1)
   * - page_size: integer (default 20, max 100)
   */
  async getLibraries({
    search = "",
    governorate = null,
    isActive = null,
    page = 1,
    pageSize = 20,
  } = {}) {
    const params = new URLSearchParams();

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    if (governorate !== null && governorate !== undefined && governorate !== "" && governorate !== "all") {
      params.append("governorate", String(governorate));
    }

    if (isActive !== null && isActive !== undefined && isActive !== "" && isActive !== "all") {
      params.append("is_active", String(isActive));
    }

    if (page && Number(page) > 1) {
      params.append("page", String(page));
    }

    if (pageSize && Number(pageSize) !== 20) {
      const safePageSize = Math.min(Math.max(Number(pageSize), 1), 100);
      params.append("page_size", String(safePageSize));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/accounts/libraries/?${queryString}`
      : "/accounts/libraries/";

    const response = await apiClient.get(endpoint);

    // Backend contract response:
    // { success: true, code: "LIBRARIES_RETRIEVED", message: "...", data: { count, next, previous, results }, meta: { requester_role } }
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
   * Fetch single library details by ID.
   * GET /accounts/libraries/{library_id}/
   *
   * Scoped to user's permissions:
   * - Out of scope returns 404.
   * - Reader requesting inactive library returns 404.
   */
  async getLibraryById(id) {
    if (!id) throw new Error("معرّف المكتبة مطلوب.");
    const response = await apiClient.get(`/accounts/libraries/${id}/`);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Create a new library.
   * POST /accounts/libraries/
   *
   * Available to: MINISTRY_ADMIN (and SUPERUSER) and GOVERNORATE_ADMIN only.
   *
   * Rules:
   * - name: required, non-empty, max 150 chars.
   * - governorate: required for MINISTRY_ADMIN / SUPERUSER.
   *   For GOVERNORATE_ADMIN: backend auto-determines governorate; do not send different governorate.
   * - address: optional, max 255 chars.
   * - phone: optional, max 30 chars.
   * - email: optional, valid email format.
   * - DO NOT send: is_active, id, governorate_name, created_at, updated_at.
   */
  async createLibrary({
    name,
    governorate,
    address = "",
    phone = "",
    email = "",
    requesterRole = "",
  }) {
    const payload = {
      name: name.trim(),
    };

    // Governorate is required for MINISTRY_ADMIN / SUPERUSER.
    // For GOVERNORATE_ADMIN, backend automatically sets it from user account.
    if (requesterRole === "MINISTRY_ADMIN" || requesterRole === "SUPERUSER") {
      if (governorate) {
        payload.governorate = parseInt(governorate, 10);
      }
    } else if (governorate) {
      // If provided by governorate admin, must match their governorate
      payload.governorate = parseInt(governorate, 10);
    }

    if (address && address.trim()) {
      payload.address = address.trim();
    }

    if (phone && phone.trim()) {
      payload.phone = phone.trim();
    }

    if (email && email.trim()) {
      payload.email = email.trim();
    }

    const response = await apiClient.post("/accounts/libraries/", payload);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Update library details.
   * PATCH /accounts/libraries/{library_id}/
   *
   * Modifiable fields: name, address, phone, email.
   * Rules:
   * - Send only fields to update.
   * - Governorate is immutable after creation; do NOT alter governorate.
   * - DO NOT send is_active; status is modified via activate/deactivate endpoints.
   * - No PUT allowed.
   */
  async updateLibrary(id, fields = {}) {
    if (!id) throw new Error("معرّف المكتبة مطلوب.");

    const payload = {};

    if (fields.name !== undefined) {
      payload.name = fields.name.trim();
    }
    if (fields.address !== undefined) {
      payload.address = fields.address.trim();
    }
    if (fields.phone !== undefined) {
      payload.phone = fields.phone.trim();
    }
    if (fields.email !== undefined) {
      payload.email = fields.email.trim();
    }

    const response = await apiClient.patch(`/accounts/libraries/${id}/`, payload);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Activate library.
   * POST /accounts/libraries/{library_id}/activate/
   *
   * Available to: MINISTRY_ADMIN, GOVERNORATE_ADMIN (within scope), SUPERUSER.
   * Response codes: LIBRARY_ACTIVATED | LIBRARY_ALREADY_ACTIVE.
   * No body.
   */
  async activateLibrary(id) {
    if (!id) throw new Error("معرّف المكتبة مطلوب.");
    const response = await apiClient.post(
      `/accounts/libraries/${id}/activate/`,
      {}
    );
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Deactivate library.
   * POST /accounts/libraries/{library_id}/deactivate/
   *
   * Available to: MINISTRY_ADMIN, GOVERNORATE_ADMIN (within scope), SUPERUSER.
   * Response codes: LIBRARY_DEACTIVATED | LIBRARY_ALREADY_INACTIVE.
   * No body.
   */
  async deactivateLibrary(id) {
    if (!id) throw new Error("معرّف المكتبة مطلوب.");
    const response = await apiClient.post(
      `/accounts/libraries/${id}/deactivate/`,
      {}
    );
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Fetch active governorates list for select dropdowns.
   * Public endpoint: GET /accounts/governorates (NO trailing slash).
   */
  async getGovernorates() {
    return await authService.getGovernorates();
  },
};
