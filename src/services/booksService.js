import { apiClient, getAccessToken } from "@/lib/apiClient";

/**
 * Normalizes backend book object into unified application model.
 */
export function transformBackendBook(b) {
  if (!b) return null;

  const authorName =
    typeof b.author === "object" && b.author !== null
      ? b.author.name
      : typeof b.author === "string"
      ? b.author
      : "مؤلف غير محدد";

  const authorId =
    typeof b.author === "object" && b.author !== null ? b.author.id : null;

  const categoryName =
    typeof b.category === "object" && b.category !== null
      ? b.category.name
      : typeof b.category === "string"
      ? b.category
      : "عام";

  const categoryId =
    typeof b.category === "object" && b.category !== null ? b.category.id : null;

  const yearValue = b.publication_year ? `${b.publication_year} م` : "—";

  return {
    id: b.id,
    title: b.title || "بدون عنوان",
    author: authorName,
    authorId: authorId,
    category: categoryName,
    categoryId: categoryId,
    categorySlug: b.categorySlug || categoryName,
    year: yearValue,
    gregorianYear: b.publication_year || null,
    pages: b.pages || 0,
    isbn: b.isbn || "",
    publisher: b.publisher || b.library_name || "وزارة الأوقاف السورية",
    description: b.description || "مصنف مسجل في خزانة وزارة الأوقاف.",
    image: b.image || null,
    rating: b.rating || 5.0,
    reviewsCount: b.reviewsCount || 1,
    viewsCount: b.viewsCount || (b.count_borrowed ? b.count_borrowed * 12 : 15),
    downloadsCount: b.count_borrowed || 0,
    format: b.format || "pdf",
    formatLabel: b.formatLabel || "مطبوع موثق (PDF)",
    language: b.language || "العربية",
    coverTheme: b.coverTheme || {
      palette: "emerald",
      bgGradient: "from-[#0d4a37] to-[#06291e]",
      accentColor: "#c29b38",
      patternType: "arabesque",
    },
    tableOfContents: b.tableOfContents || [],
    total_copies: b.total_copies ?? 0,
    available_copies: b.available_copies ?? 0,
    count_borrowed: b.count_borrowed ?? 0,
    is_avaiable: b.is_avaiable ?? true,
    is_archived: b.is_archived ?? false,
    possition: b.possition || "",
    library: b.library || null,
    library_name: b.library_name || "",
    governorate: b.governorate || null,
    governorate_name: b.governorate_name || "",
    isFavorite: false,
  };
}

/**
 * Service layer for books querying live Backend APIs:
 * - Public catalog: GET /api/books/
 * - Single book: GET /api/books/{id}/
 * - Authenticated dashboard catalog: GET /dashboard/books/
 */
export const booksService = {
  /**
   * Fetch books with filtering, searching, and pagination support.
   */
  async getBooks({
    query = "",
    category = "all",
    author = "",
    library = null,
    governorate = null,
    isAvailable = null,
    sort = "latest",
    language = "all",
    format = "all",
    page = 1,
    pageSize = 10,
  } = {}) {
    const hasToken = typeof window !== "undefined" ? !!getAccessToken() : false;
    const safePageSize = Math.min(Math.max(Number(pageSize || 10), 1), 50);

    const params = new URLSearchParams();
    if (page && Number(page) > 1) {
      params.append("page", String(page));
    }

    params.append("page_size", String(safePageSize));

    if (library && library !== "all") {
      params.append("library", String(library));
    }

    if (governorate && governorate !== "all") {
      params.append("governorate", String(governorate));
    }

    if (author && author.trim()) {
      params.append("author", author.trim());
    }

    if (category && category !== "all" && category.trim()) {
      params.append("category", category.trim());
    }

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

    // 1. If user is authenticated, query /dashboard/books/
    if (hasToken) {
      try {
        const dashboardEndpoint = qs
          ? `/dashboard/books/?${qs}&is_archived=false`
          : "/dashboard/books/?is_archived=false";

        const response = await apiClient.get(dashboardEndpoint);
        const rawResults = response?.data?.results || response?.results || [];
        const count = response?.data?.count ?? response?.count ?? rawResults.length;
        let transformed = rawResults.map(transformBackendBook).filter(Boolean);

        if (query && query.trim()) {
          const q = query.trim().toLowerCase();
          transformed = transformed.filter(
            (b) =>
              b.title?.toLowerCase().includes(q) ||
              b.author?.toLowerCase().includes(q) ||
              b.description?.toLowerCase().includes(q)
          );
        }

        this._sortBooks(transformed, sort);

        const totalPages = Math.ceil(count / safePageSize) || 1;

        return {
          results: transformed,
          count: count,
          page: Number(page) || 1,
          totalPages,
          pageSize: safePageSize,
          isLive: true,
        };
      } catch (err) {
        // Fall through to public endpoint if dashboard fails
        console.warn("Dashboard books endpoint failed, trying public /api/books/:", err?.message);
      }
    }

    // 2. Query Public endpoint /api/books/
    try {
      const publicParams = new URLSearchParams();
      if (page && Number(page) > 1) {
        publicParams.append("page", String(page));
      }
      if (category && category !== "all" && category.trim()) {
        publicParams.append("category", category.trim());
      }
      if (query && query.trim()) {
        publicParams.append("search", query.trim());
      }

      const publicQs = publicParams.toString();
      const endpoint = publicQs ? `/api/books/?${publicQs}` : "/api/books/";

      const response = await apiClient.get(endpoint);
      let rawResults = [];
      let count = 0;

      if (Array.isArray(response)) {
        rawResults = response;
        count = response.length;
      } else if (response?.data?.results) {
        rawResults = response.data.results;
        count = response.data.count ?? rawResults.length;
      } else if (response?.results) {
        rawResults = response.results;
        count = response.count ?? rawResults.length;
      } else if (Array.isArray(response?.data)) {
        rawResults = response.data;
        count = response.data.length;
      }

      let transformed = rawResults.map(transformBackendBook).filter(Boolean);

      // Client-side text filter if needed
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        transformed = transformed.filter(
          (b) =>
            b.title?.toLowerCase().includes(q) ||
            b.author?.toLowerCase().includes(q) ||
            b.description?.toLowerCase().includes(q)
        );
      }

      // Client-side category filter if category slug was supplied
      if (category && category !== "all") {
        const catNorm = category.trim().toLowerCase();
        transformed = transformed.filter(
          (b) =>
            b.category?.toLowerCase() === catNorm ||
            b.categorySlug?.toLowerCase() === catNorm
        );
      }

      // Client-side author filter
      if (author && author.trim()) {
        const a = author.trim().toLowerCase();
        transformed = transformed.filter((b) =>
          b.author?.toLowerCase().includes(a)
        );
      }

      // Client-side availability filter
      if (
        isAvailable !== null &&
        isAvailable !== undefined &&
        isAvailable !== "" &&
        isAvailable !== "all"
      ) {
        const reqAvail =
          isAvailable === true || isAvailable === "true" || isAvailable === 1;
        transformed = transformed.filter((b) => b.is_avaiable === reqAvail);
      }

      this._sortBooks(transformed, sort);

      const totalPages = Math.ceil((count || transformed.length) / safePageSize) || 1;

      return {
        results: transformed,
        count: count || transformed.length,
        page: Number(page) || 1,
        totalPages,
        pageSize: safePageSize,
        isLive: true,
      };
    } catch (err) {
      console.error("Public books fetch failed:", err);
      return {
        results: [],
        count: 0,
        page: Number(page) || 1,
        totalPages: 1,
        pageSize: safePageSize,
        isLive: true,
      };
    }
  },

  /**
   * Sort helper for client-side sorting of results
   */
  _sortBooks(books, sort) {
    switch (sort) {
      case "popular":
        books.sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
        break;
      case "rating":
        books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "title_asc":
        books.sort((a, b) => (a.title || "").localeCompare(b.title || "", "ar"));
        break;
      case "year_desc":
        books.sort((a, b) => (b.gregorianYear || 0) - (a.gregorianYear || 0));
        break;
      case "latest":
      default:
        books.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        break;
    }
  },

  /**
   * Fetch single book by ID from live API.
   * Tries authenticated /dashboard/books/{id}/ then public /api/books/{id}/.
   */
  async getBookById(id) {
    if (!id) return null;

    const hasToken = typeof window !== "undefined" ? !!getAccessToken() : false;

    if (hasToken) {
      try {
        const response = await apiClient.get(`/dashboard/books/${id}/`);
        const b = response?.data || response;
        if (b && (b.id || b.title)) {
          return transformBackendBook(b);
        }
      } catch {
        // Fallback to public endpoint
      }
    }

    try {
      const response = await apiClient.get(`/api/books/${id}/`);
      const b = response?.data || response;
      if (b && (b.id || b.title)) {
        return transformBackendBook(b);
      }
    } catch (err) {
      console.warn(`Book fetch failed for id ${id}:`, err?.message);
    }

    return null;
  },

  /**
   * Fetch featured books for home showcase from live API
   */
  async getFeaturedBooks(limit = 4) {
    try {
      const res = await this.getBooks({ pageSize: limit });
      return (res.results || []).slice(0, limit);
    } catch {
      return [];
    }
  },

  /**
   * Fetch recent books from live API
   */
  async getRecentBooks(limit = 4) {
    try {
      const res = await this.getBooks({ sort: "latest", pageSize: limit });
      return (res.results || []).slice(0, limit);
    } catch {
      return [];
    }
  },

  /**
   * Fetch popular books from live API
   */
  async getPopularBooks(limit = 4) {
    try {
      const res = await this.getBooks({ sort: "popular", pageSize: limit });
      return (res.results || []).slice(0, limit);
    } catch {
      return [];
    }
  },

  /**
   * Fetch related books by category from live API
   */
  async getRelatedBooks(currentBookId, category, limit = 3) {
    try {
      const res = await this.getBooks({
        category: category && category !== "all" ? category : "",
        pageSize: limit + 2,
      });
      return (res.results || [])
        .filter((b) => String(b.id) !== String(currentBookId))
        .slice(0, limit);
    } catch {
      return [];
    }
  },
};
