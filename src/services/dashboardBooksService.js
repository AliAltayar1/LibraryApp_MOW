import { apiClient } from "@/lib/apiClient";
import { authorsService } from "./authorsService";
import { categoriesService } from "./categoriesService";

/**
 * Service for Book Management endpoints under /dashboard/books/
 * strictly adhering to the Backend Integration Contract:
 * - Base path: /dashboard/books/
 * - All trailing slashes required (GET/POST/PATCH/DELETE /dashboard/books/ and /dashboard/books/{id}/).
 * - Authenticated with Bearer token.
 * - Soft Archive only (DELETE /dashboard/books/{id}/).
 * - Restore (POST /dashboard/books/{id}/restore/).
 * - No PUT allowed; PATCH for updates.
 * - Server managed fields (MUST NOT be sent on create/patch):
 *   available_copies, is_avaiable, count_borrowed, is_archived, created_at
 * - Immutable fields:
 *   library cannot be changed via PATCH after creation.
 */
export const dashboardBooksService = {
  /**
   * Fetch paginated list of books scoped to user's role.
   * GET /dashboard/books/
   *
   * Query params:
   * - page: integer (default 1)
   * - page_size: integer (default 10, max 10)
   * - author: search partial author name
   * - category: search partial category name
   * - governorate: integer ID (positive integer)
   * - library: integer ID (positive integer)
   * - is_archived: boolean (true | false)
   * - is_avaiable: boolean (true | false)
   */
  async getBooks({
    page = 1,
    pageSize = 10,
    author = "",
    category = "",
    governorate = null,
    library = null,
    isArchived = null,
    isAvailable = null,
  } = {}) {
    const params = new URLSearchParams();

    if (page && Number(page) > 1) {
      params.append("page", String(page));
    }

    if (pageSize) {
      // Backend max page_size is 10
      const safePageSize = Math.min(Math.max(Number(pageSize), 1), 10);
      params.append("page_size", String(safePageSize));
    }

    if (author && author.trim()) {
      params.append("author", author.trim());
    }

    if (category && category.trim() && category !== "all") {
      params.append("category", category.trim());
    }

    // Filter by Governorate (positive integer validation)
    if (
      governorate !== null &&
      governorate !== undefined &&
      governorate !== "" &&
      governorate !== "all"
    ) {
      const govId = Number(governorate);
      if (Number.isInteger(govId) && govId > 0 && govId <= 9223372036854775807) {
        params.append("governorate", String(govId));
      }
    }

    // Filter by Library (positive integer validation)
    if (
      library !== null &&
      library !== undefined &&
      library !== "" &&
      library !== "all"
    ) {
      const libId = Number(library);
      if (Number.isInteger(libId) && libId > 0 && libId <= 9223372036854775807) {
        params.append("library", String(libId));
      }
    }

    // Filter by Archived Status
    if (
      isArchived !== null &&
      isArchived !== undefined &&
      isArchived !== "" &&
      isArchived !== "all"
    ) {
      params.append(
        "is_archived",
        String(isArchived === true || isArchived === "true" || isArchived === 1)
      );
    }

    // Filter by Availability (field name is strictly is_avaiable)
    if (
      isAvailable !== null &&
      isAvailable !== undefined &&
      isAvailable !== "" &&
      isAvailable !== "all"
    ) {
      params.append(
        "is_avaiable",
        String(isAvailable === true || isAvailable === "true" || isAvailable === 1)
      );
    }

    const qs = params.toString();
    const endpoint = qs ? `/dashboard/books/?${qs}` : "/dashboard/books/";
    const response = await apiClient.get(endpoint);

    // Backend envelope:
    // { success: true, code: "BOOKS_RETRIEVED", message: "...", data: { count, next, previous, results }, meta: { requester_role } }
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
   * Retrieve single book details by ID.
   * GET /dashboard/books/{id}/
   *
   * Scoped to user's permissions:
   * - Out of scope returns 404 NOT_FOUND.
   */
  async getBookById(id) {
    if (!id) throw new Error("معرّف الكتاب مطلوب.");
    const response = await apiClient.get(`/dashboard/books/${id}/`);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Create a new book.
   * POST /dashboard/books/
   *
   * Allowed input fields:
   * title, description, image, author_id, category_id, possition, total_copies, pages, publication_year, isbn, library
   *
   * Server managed fields (MUST NOT BE SENT):
   * available_copies, is_avaiable, count_borrowed, is_archived, created_at
   */
  async createBook(data) {
    const hasFile = data.image instanceof File || data.image instanceof Blob;

    if (hasFile) {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title.trim());
      if (data.description !== undefined) formData.append("description", data.description.trim());
      if (data.author_id) formData.append("author_id", String(data.author_id));
      if (data.category_id) formData.append("category_id", String(data.category_id));
      if (data.possition) formData.append("possition", data.possition.trim());
      if (data.total_copies !== undefined && data.total_copies !== null && data.total_copies !== "") {
        formData.append("total_copies", String(Math.max(0, parseInt(data.total_copies, 10))));
      }
      if (data.pages) formData.append("pages", String(parseInt(data.pages, 10)));
      if (data.publication_year) formData.append("publication_year", String(parseInt(data.publication_year, 10)));
      if (data.isbn) formData.append("isbn", data.isbn.trim());
      if (data.library) formData.append("library", String(data.library));
      if (data.image) formData.append("image", data.image);

      const response = await apiClient.post("/dashboard/books/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return {
        data: response?.data ?? null,
        meta: response?.meta ?? null,
        message: response?.message ?? "",
        code: response?.code ?? "",
      };
    } else {
      const payload = {
        title: data.title?.trim(),
        description: data.description?.trim() || "",
        author_id: parseInt(data.author_id, 10),
        category_id: parseInt(data.category_id, 10),
        total_copies: Math.max(0, parseInt(data.total_copies ?? 0, 10)),
      };

      if (data.possition && data.possition.trim()) {
        payload.possition = data.possition.trim();
      }
      if (data.pages) {
        payload.pages = parseInt(data.pages, 10);
      }
      if (data.publication_year) {
        payload.publication_year = parseInt(data.publication_year, 10);
      }
      if (data.isbn && data.isbn.trim()) {
        payload.isbn = data.isbn.trim();
      }
      if (data.library) {
        payload.library = parseInt(data.library, 10);
      }
      if (typeof data.image === "string" && data.image.trim()) {
        payload.image = data.image.trim();
      }

      const response = await apiClient.post("/dashboard/books/", payload);
      return {
        data: response?.data ?? null,
        meta: response?.meta ?? null,
        message: response?.message ?? "",
        code: response?.code ?? "",
      };
    }
  },

  /**
   * Update book details via PATCH.
   * PATCH /dashboard/books/{id}/
   *
   * Allowed fields:
   * title, description, image, author_id, category_id, possition, total_copies, pages, publication_year, isbn
   *
   * FORBIDDEN (immutable or server-managed):
   * id, library, library_name, governorate, governorate_name, available_copies, count_borrowed, is_avaiable, is_archived, created_at
   */
  async updateBook(id, fields = {}) {
    if (!id) throw new Error("معرّف الكتاب مطلوب.");

    const hasFile = fields.image instanceof File || fields.image instanceof Blob;

    if (hasFile) {
      const formData = new FormData();
      if (fields.title !== undefined) formData.append("title", fields.title.trim());
      if (fields.description !== undefined) formData.append("description", fields.description.trim());
      if (fields.author_id !== undefined && fields.author_id !== "") formData.append("author_id", String(fields.author_id));
      if (fields.category_id !== undefined && fields.category_id !== "") formData.append("category_id", String(fields.category_id));
      if (fields.possition !== undefined) formData.append("possition", fields.possition.trim());
      if (fields.total_copies !== undefined && fields.total_copies !== "") {
        formData.append("total_copies", String(Math.max(0, parseInt(fields.total_copies, 10))));
      }
      if (fields.pages !== undefined && fields.pages !== "") formData.append("pages", String(parseInt(fields.pages, 10)));
      if (fields.publication_year !== undefined && fields.publication_year !== "") formData.append("publication_year", String(parseInt(fields.publication_year, 10)));
      if (fields.isbn !== undefined) formData.append("isbn", fields.isbn.trim());
      if (fields.image) formData.append("image", fields.image);

      const response = await apiClient.patch(`/dashboard/books/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return {
        data: response?.data ?? null,
        meta: response?.meta ?? null,
        message: response?.message ?? "",
        code: response?.code ?? "",
      };
    } else {
      const payload = {};
      if (fields.title !== undefined) payload.title = fields.title.trim();
      if (fields.description !== undefined) payload.description = fields.description.trim();
      if (fields.author_id !== undefined && fields.author_id !== "") payload.author_id = parseInt(fields.author_id, 10);
      if (fields.category_id !== undefined && fields.category_id !== "") payload.category_id = parseInt(fields.category_id, 10);
      if (fields.possition !== undefined) payload.possition = fields.possition.trim();
      if (fields.total_copies !== undefined && fields.total_copies !== "") {
        payload.total_copies = Math.max(0, parseInt(fields.total_copies, 10));
      }
      if (fields.pages !== undefined && fields.pages !== "") payload.pages = parseInt(fields.pages, 10);
      if (fields.publication_year !== undefined && fields.publication_year !== "") payload.publication_year = parseInt(fields.publication_year, 10);
      if (fields.isbn !== undefined) payload.isbn = fields.isbn.trim();
      if (typeof fields.image === "string" && fields.image) payload.image = fields.image.trim();

      const response = await apiClient.patch(`/dashboard/books/${id}/`, payload);
      return {
        data: response?.data ?? null,
        meta: response?.meta ?? null,
        message: response?.message ?? "",
        code: response?.code ?? "",
      };
    }
  },

  /**
   * Soft archive book.
   * DELETE /dashboard/books/{id}/
   *
   * Sets is_archived = true.
   * Does NOT remove book from database.
   */
  async archiveBook(id) {
    if (!id) throw new Error("معرّف الكتاب مطلوب.");
    const response = await apiClient.delete(`/dashboard/books/${id}/`);
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Restore archived book.
   * POST /dashboard/books/{id}/restore/
   *
   * Sets is_archived = false.
   */
  async restoreBook(id) {
    if (!id) throw new Error("معرّف الكتاب مطلوب.");
    const response = await apiClient.post(`/dashboard/books/${id}/restore/`, {});
    return {
      data: response?.data ?? null,
      meta: response?.meta ?? null,
      message: response?.message ?? "",
      code: response?.code ?? "",
    };
  },

  /**
   * Fetch authors list from /dashboard/author/
   */
  async getAuthors(search = "", page = 1, pageSize = 50) {
    const res = await authorsService.getAuthors({ search, page, pageSize });
    return res.results || [];
  },

  /**
   * Quick create author (Superuser, Ministry Admin, Governorate Admin)
   */
  async createAuthor(name) {
    const res = await authorsService.createAuthor({ name });
    return res.data || res;
  },

  /**
   * Fetch categories list from /dashboard/category/
   */
  async getCategories(search = "", page = 1, pageSize = 50) {
    const res = await categoriesService.getDashboardCategories({ search, page, pageSize });
    return res.results || [];
  },

  /**
   * Quick create category (Superuser, Ministry Admin, Governorate Admin)
   */
  async createCategory(name) {
    const res = await categoriesService.createCategory({ name });
    return res.data || res;
  },
};
