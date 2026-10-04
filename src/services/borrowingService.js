import { apiClient } from "@/lib/apiClient";

/**
 * Status constants according to backend contract
 */
export const BORROW_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const BORROW_STATUS = {
  ACTIVE: "ACTIVE",
  RETURNED: "RETURNED",
};

export const BORROW_REQUEST_STATUS_LABELS = {
  [BORROW_REQUEST_STATUS.PENDING]: {
    label: "قيد المراجعة",
    badgeVariant: "warning",
    bgClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  [BORROW_REQUEST_STATUS.APPROVED]: {
    label: "تمت الموافقة",
    badgeVariant: "success",
    bgClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  [BORROW_REQUEST_STATUS.REJECTED]: {
    label: "مرفوض",
    badgeVariant: "danger",
    bgClass: "bg-red-50 text-red-800 border-red-200",
  },
};

export const BORROW_STATUS_LABELS = {
  [BORROW_STATUS.ACTIVE]: {
    label: "قيد الاستعارة",
    badgeVariant: "primary",
    bgClass: "bg-blue-50 text-blue-800 border-blue-200",
  },
  [BORROW_STATUS.RETURNED]: {
    label: "تم الإرجاع",
    badgeVariant: "neutral",
    bgClass: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

/**
 * Service for Borrowing System strictly adhering to the Backend Integration Contract:
 * - Base routers: /dashboard/borrow-requests/ and /dashboard/borrows/ and /dashboard/books/{book_id}/borrow-requests/
 * - ALL endpoints MUST end with a trailing slash (/).
 * - No legacy endpoints (never POST /api/books/{id}/borrow/ or POST /dashboard/borrow-requests/).
 * - Strictly use reader_id and book_id for direct borrowing.
 * - Authenticated with Bearer token.
 */
export const borrowingService = {
  /**
   * 1. Reader requests to borrow a book.
   * POST /dashboard/books/{book_id}/borrow-requests/
   *
   * Rules:
   * - Reader inferred automatically from JWT.
   * - DO NOT send reader_id or book_id in body.
   * - Body must be empty: {}
   * - Available even if available_copies = 0.
   */
  async createBorrowRequest(bookId) {
    if (!bookId) {
      throw new Error("معرّف الكتاب مطلوب لتقديم طلب الاستعارة.");
    }

    const response = await apiClient.post(
      `/dashboard/books/${bookId}/borrow-requests/`,
      {}
    );

    return {
      success: response?.success ?? true,
      code: response?.code ?? "BORROW_REQUEST_CREATED",
      message: response?.message ?? "تم إرسال طلب الاستعارة بنجاح.",
      data: response?.data ?? null,
    };
  },

  /**
   * 2. View borrow requests list scoped to user's role.
   * GET /dashboard/borrow-requests/
   *
   * Role scope applied automatically by backend:
   * - READER: own requests only
   * - LIBRARIAN: requests for books in their library
   * - GOVERNORATE_ADMIN: requests in their governorate
   * - MINISTRY_ADMIN / SUPERUSER: all requests
   *
   * Query params:
   * - status: "PENDING" | "APPROVED" | "REJECTED"
   * - reader: reader_id
   * - book: book_id
   * - library: library_id
   * - governorate: governorate_id
   * - page: integer (default 1)
   * - page_size: integer (default 20)
   */
  async getBorrowRequests({
    status = "",
    reader = null,
    book = null,
    library = null,
    governorate = null,
    page = 1,
    pageSize = 20,
  } = {}) {
    const params = new URLSearchParams();

    if (status && status !== "ALL") {
      params.append("status", status.trim().toUpperCase());
    }

    if (reader) {
      params.append("reader", String(reader).trim());
    }

    if (book) {
      params.append("book", String(book).trim());
    }

    if (library && library !== "all") {
      params.append("library", String(library).trim());
    }

    if (governorate && governorate !== "all") {
      params.append("governorate", String(governorate).trim());
    }

    if (page && Number(page) > 1) {
      params.append("page", String(page));
    }

    if (pageSize && Number(pageSize) !== 20) {
      params.append("page_size", String(pageSize));
    }

    const qs = params.toString();
    const endpoint = qs
      ? `/dashboard/borrow-requests/?${qs}`
      : "/dashboard/borrow-requests/";

    const response = await apiClient.get(endpoint);

    return {
      count: response?.data?.count ?? 0,
      next: response?.data?.next ?? null,
      previous: response?.data?.previous ?? null,
      results: response?.data?.results ?? (Array.isArray(response?.data) ? response.data : []),
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * 3. View single borrow request detail.
   * GET /dashboard/borrow-requests/{request_id}/
   */
  async getBorrowRequestById(requestId) {
    if (!requestId) {
      throw new Error("معرّف طلب الاستعارة مطلوب.");
    }

    const response = await apiClient.get(
      `/dashboard/borrow-requests/${requestId}/`
    );

    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * 4. Approve borrow request (Admin/Librarian).
   * POST /dashboard/borrow-requests/{request_id}/approve/
   *
   * Body: {}
   * Success code: BORROW_REQUEST_APPROVED
   */
  async approveBorrowRequest(requestId) {
    if (!requestId) {
      throw new Error("معرّف طلب الاستعارة مطلوب للموافقة.");
    }

    const response = await apiClient.post(
      `/dashboard/borrow-requests/${requestId}/approve/`,
      {}
    );

    return {
      success: response?.success ?? true,
      code: response?.code ?? "BORROW_REQUEST_APPROVED",
      message: response?.message ?? "تمت الموافقة على طلب الاستعارة بنجاح.",
      data: response?.data ?? null,
    };
  },

  /**
   * 5. Reject borrow request (Admin/Librarian).
   * POST /dashboard/borrow-requests/{request_id}/reject/
   *
   * Body: { reason?: string }
   * Success code: BORROW_REQUEST_REJECTED
   */
  async rejectBorrowRequest(requestId, reason = "") {
    if (!requestId) {
      throw new Error("معرّف طلب الاستعارة مطلوب للرفض.");
    }

    const payload = {};
    if (reason && reason.trim()) {
      payload.reason = reason.trim();
    }

    const response = await apiClient.post(
      `/dashboard/borrow-requests/${requestId}/reject/`,
      payload
    );

    return {
      success: response?.success ?? true,
      code: response?.code ?? "BORROW_REQUEST_REJECTED",
      message: response?.message ?? "تم رفض طلب الاستعارة.",
      data: response?.data ?? null,
    };
  },

  /**
   * 6. Direct Borrow by Administration (Librarian, Governorate Admin, Ministry Admin, Superuser).
   * POST /dashboard/borrows/
   *
   * Body strictly requires:
   * {
   *   "reader_id": "USER_UUID",
   *   "book_id": 5
   * }
   * (Old fields reader / book are rejected)
   */
  async createDirectBorrow({ reader_id, book_id }) {
    if (!reader_id) {
      throw new Error("معرّف القارئ (reader_id) مطلوب لإتمام الاستعارة المباشرة.");
    }
    if (!book_id) {
      throw new Error("معرّف الكتاب (book_id) مطلوب لإتمام الاستعارة المباشرة.");
    }

    const payload = {
      reader_id: String(reader_id).trim(),
      book_id: parseInt(book_id, 10),
    };

    const response = await apiClient.post("/dashboard/borrows/", payload);

    return {
      success: response?.success ?? true,
      code: response?.code ?? "BORROW_CREATED",
      message: response?.message ?? "تم تسجيل الاستعارة المباشرة بنجاح.",
      data: response?.data ?? null,
    };
  },

  /**
   * 7. View borrows list scoped to user's role.
   * GET /dashboard/borrows/
   *
   * Role scope applied automatically by backend:
   * - READER: own borrows only
   * - LIBRARIAN: borrows from their library
   * - GOVERNORATE_ADMIN: borrows in their governorate
   * - MINISTRY_ADMIN / SUPERUSER: all borrows
   *
   * Query params:
   * - status: "ACTIVE" | "RETURNED"
   * - reader: reader_id
   * - book: book_id
   * - library: library_id
   * - governorate: governorate_id
   * - page: integer (default 1)
   * - page_size: integer (default 20)
   */
  async getBorrows({
    status = "",
    reader = null,
    book = null,
    library = null,
    governorate = null,
    page = 1,
    pageSize = 20,
  } = {}) {
    const params = new URLSearchParams();

    if (status && status !== "ALL") {
      params.append("status", status.trim().toUpperCase());
    }

    if (reader) {
      params.append("reader", String(reader).trim());
    }

    if (book) {
      params.append("book", String(book).trim());
    }

    if (library && library !== "all") {
      params.append("library", String(library).trim());
    }

    if (governorate && governorate !== "all") {
      params.append("governorate", String(governorate).trim());
    }

    if (page && Number(page) > 1) {
      params.append("page", String(page));
    }

    if (pageSize && Number(pageSize) !== 20) {
      params.append("page_size", String(pageSize));
    }

    const qs = params.toString();
    const endpoint = qs ? `/dashboard/borrows/?${qs}` : "/dashboard/borrows/";

    const response = await apiClient.get(endpoint);

    return {
      count: response?.data?.count ?? 0,
      next: response?.data?.next ?? null,
      previous: response?.data?.previous ?? null,
      results: response?.data?.results ?? (Array.isArray(response?.data) ? response.data : []),
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * 8. View single borrow detail.
   * GET /dashboard/borrows/{borrow_id}/
   */
  async getBorrowById(borrowId) {
    if (!borrowId) {
      throw new Error("معرّف سجل الاستعارة مطلوب.");
    }

    const response = await apiClient.get(`/dashboard/borrows/${borrowId}/`);

    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * 9. Register return of a borrowed book.
   * POST /dashboard/borrows/{borrow_id}/return/
   *
   * Body: {}
   * Success code: BORROW_RETURNED
   */
  async returnBorrow(borrowId) {
    if (!borrowId) {
      throw new Error("معرّف سجل الاستعارة مطلوب لتسجيل الإرجاع.");
    }

    const response = await apiClient.post(
      `/dashboard/borrows/${borrowId}/return/`,
      {}
    );

    return {
      success: response?.success ?? true,
      code: response?.code ?? "BORROW_RETURNED",
      message: response?.message ?? "تم تسجيل إرجاع الكتاب بنجاح.",
      data: response?.data ?? null,
    };
  },

  /**
   * 10. Block reader from borrowing.
   * POST /dashboard/users/{user_id}/block-borrowing/
   *
   * Body: {}
   * Success code: USER_BORROWING_BLOCKED
   */
  async blockBorrowing(userId) {
    if (!userId) {
      throw new Error("معرّف المستخدم مطلوب للحظر.");
    }

    const response = await apiClient.post(
      `/dashboard/users/${userId}/block-borrowing/`,
      {}
    );

    return {
      success: response?.success ?? true,
      code: response?.code ?? "USER_BORROWING_BLOCKED",
      message: response?.message ?? "تم حظر المستخدم من الاستعارة.",
      data: response?.data ?? null,
    };
  },

  /**
   * 11. Unblock reader borrowing.
   * POST /dashboard/users/{user_id}/unblock-borrowing/
   *
   * Body: {}
   * Success code: USER_BORROWING_UNBLOCKED
   */
  async unblockBorrowing(userId) {
    if (!userId) {
      throw new Error("معرّف المستخدم مطلوب لفك الحظر.");
    }

    const response = await apiClient.post(
      `/dashboard/users/${userId}/unblock-borrowing/`,
      {}
    );

    return {
      success: response?.success ?? true,
      code: response?.code ?? "USER_BORROWING_UNBLOCKED",
      message: response?.message ?? "تم فك حظر الاستعارة عن المستخدم.",
      data: response?.data ?? null,
    };
  },
};
