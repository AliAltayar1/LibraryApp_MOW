import { apiClient } from "@/lib/apiClient";

/**
 * Service for administrative user management endpoints under /dashboard/users/
 * strictly adhering to Frontend Integration Contract.
 * Note: All endpoints in this category MUST end with a trailing slash.
 */
export const userManagementService = {
  /**
   * Fetch users list scoped to current requester's role.
   * GET /dashboard/users/
   * Filter param: ?name=<text>
   */
  async getUsers(params = {}) {
    let endpoint = "/dashboard/users/";
    if (params.name && params.name.trim()) {
      endpoint += `?name=${encodeURIComponent(params.name.trim())}`;
    }
    const response = await apiClient.get(endpoint);
    return response.data || [];
  },

  /**
   * Retrieve single user details by ID.
   * GET /dashboard/users/{id}/
   */
  async getUserById(id) {
    const response = await apiClient.get(`/dashboard/users/${id}/`);
    return response.data;
  },

  /**
   * Limited Reader Search for borrowing selection and librarian reader lookup.
   * GET /dashboard/users/reader-search/?q=<text>&page=<number>&page_size=<number>
   * Requirements:
   * - q is required and must have at least 2 characters.
   */
  async searchReaders({ q, page = 1, pageSize = 20 }) {
    if (!q || q.trim().length < 2) {
      return { count: 0, next: null, previous: null, results: [] };
    }

    const queryParams = new URLSearchParams({
      q: q.trim(),
      page: String(page),
      page_size: String(Math.min(pageSize, 50)),
    });

    const response = await apiClient.get(
      `/dashboard/users/reader-search/?${queryParams.toString()}`
    );
    return (
      response.data || { count: 0, next: null, previous: null, results: [] }
    );
  },

  /**
   * Create a new user by an authorized administrator.
   * POST /dashboard/users/
   *
   * Rules by role (Section 8 of Contract):
   * 1. MINISTRY_ADMIN creating READER: requires governorate, no library.
   * 2. MINISTRY_ADMIN creating GOVERNORATE_ADMIN: requires governorate, no library.
   * 3. MINISTRY_ADMIN / GOVERNORATE_ADMIN creating LIBRARIAN: requires library, no governorate.
   * 4. GOVERNORATE_ADMIN creating READER: governorate auto-inferred (no library).
   * 5. LIBRARIAN creating READER: governorate auto-inferred from library (neither library nor governorate sent).
   */
  async createUser({
    username,
    password,
    role,
    library,
    governorate,
    email,
    first_name,
    last_name,
    requesterRole,
  }) {
    const payload = {
      username: username.trim().toLowerCase(),
      password,
      role, // string: "READER" | "LIBRARIAN" | "GOVERNORATE_ADMIN" | "MINISTRY_ADMIN"
    };

    if (email && email.trim()) payload.email = email.trim().toLowerCase();
    if (first_name && first_name.trim()) payload.first_name = first_name.trim();
    if (last_name && last_name.trim()) payload.last_name = last_name.trim();

    // Specific Scope Assignment Logic
    if (role === "READER") {
      if (requesterRole === "MINISTRY_ADMIN" || requesterRole === "SUPERUSER") {
        if (governorate) payload.governorate = parseInt(governorate, 10);
      } else if (requesterRole === "GOVERNORATE_ADMIN") {
        if (governorate) payload.governorate = parseInt(governorate, 10);
      }
      // If requester is LIBRARIAN, neither governorate nor library is sent!
    } else if (role === "GOVERNORATE_ADMIN") {
      if (governorate) payload.governorate = parseInt(governorate, 10);
    } else if (role === "LIBRARIAN") {
      if (library) payload.library = parseInt(library, 10);
    }

    const response = await apiClient.post("/dashboard/users/", payload);
    return response.data;
  },

  /**
   * Reset user password by an authorized admin.
   * POST /dashboard/users/{id}/reset-password/
   */
  async resetPassword(id, { new_password, new_password_confirm }) {
    const response = await apiClient.post(
      `/dashboard/users/${id}/reset-password/`,
      {
        new_password,
        new_password_confirm,
      }
    );
    return response;
  },

  /**
   * Deactivate user (Idempotent).
   * POST /dashboard/users/{id}/deactivate/
   */
  async deactivateUser(id) {
    const response = await apiClient.post(
      `/dashboard/users/${id}/deactivate/`,
      {}
    );
    return response;
  },

  /**
   * Reactivate user (Idempotent).
   * POST /dashboard/users/{id}/reactivate/
   */
  async reactivateUser(id) {
    const response = await apiClient.post(
      `/dashboard/users/${id}/reactivate/`,
      {}
    );
    return response;
  },

  /**
   * Block borrowing for user.
   * POST /dashboard/users/{id}/block-borrowing/
   */
  async blockBorrowing(id) {
    const response = await apiClient.post(
      `/dashboard/users/${id}/block-borrowing/`,
      {}
    );
    return response;
  },

  /**
   * Unblock borrowing for user.
   * POST /dashboard/users/{id}/unblock-borrowing/
   */
  async unblockBorrowing(id) {
    const response = await apiClient.post(
      `/dashboard/users/${id}/unblock-borrowing/`,
      {}
    );
    return response;
  },
};
