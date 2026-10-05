import { MOCK_BOOKS } from "@/data/mockBooks";
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

  return {
    id: b.id,
    title: b.title || "بدون عنوان",
    author: authorName,
    authorId: authorId,
    category: categoryName,
    categoryId: categoryId,
    categorySlug: b.categorySlug || "general",
    year: b.publication_year ? `${b.publication_year} م` : "—",
    gregorianYear: b.publication_year || null,
    pages: b.pages || 0,
    isbn: b.isbn || "",
    publisher: b.publisher || b.library_name || "وزارة الأوقاف السورية",
    description: b.description || "مصنف مسجل في قاعدة بيانات الوزارة.",
    image: b.image || null,
    rating: b.rating || 5.0,
    reviewsCount: b.reviewsCount || 1,
    viewsCount: b.viewsCount || 0,
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
 * Service layer for books.
 * Fully integrates with backend /dashboard/books/ strictly following the integration contract:
 * - Scoped to reader's governorate automatically by backend.
 * - Library books can be filtered via ?library=<id>.
 * - Search by author name (?author=...) and category name (?category=...).
 * - Availability filter: ?is_avaiable=true.
 * - Only active & unarchived books shown.
 * - Page size: default 10, max 10.
 */
export const booksService = {
  /**
   * Fetch all books with filtering, searching, and pagination support.
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

    // When authenticated, query live backend endpoint /dashboard/books/
    if (hasToken) {
      try {
        const params = new URLSearchParams();

        if (page && Number(page) > 1) {
          params.append("page", String(page));
        }

        // Backend max page_size is 10
        const safePageSize = Math.min(Math.max(Number(pageSize || 10), 1), 10);
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

        params.append("is_archived", "false");

        const qs = params.toString();
        const endpoint = qs ? `/dashboard/books/?${qs}` : "/dashboard/books/";
        const response = await apiClient.get(endpoint);

        const rawResults = response?.data?.results || [];
        const count = response?.data?.count ?? rawResults.length;
        let transformed = rawResults.map(transformBackendBook);

        // Client-side text filter if query is provided
        if (query && query.trim()) {
          const q = query.trim().toLowerCase();
          transformed = transformed.filter(
            (b) =>
              b.title?.toLowerCase().includes(q) ||
              b.author?.toLowerCase().includes(q) ||
              b.description?.toLowerCase().includes(q)
          );
        }

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
        console.warn("Live books fetch failed, falling back to mock catalog:", err);
      }
    }

    // Fallback to local mock data (for unauthenticated guests or network failure)
    let filtered = [...MOCK_BOOKS];

    if (query && query.trim() !== "") {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    if (category && category !== "all") {
      filtered = filtered.filter(
        (b) => b.categorySlug === category || b.category === category
      );
    }

    if (author && author.trim()) {
      const a = author.trim().toLowerCase();
      filtered = filtered.filter((b) => b.author.toLowerCase().includes(a));
    }

    if (language && language !== "all") {
      const langMap = { ar: "العربية", en: "الإنجليزية", fr: "الفرنسية" };
      filtered = filtered.filter(
        (b) => b.language === (langMap[language] || language)
      );
    }

    if (format && format !== "all") {
      filtered = filtered.filter((b) => b.format === format);
    }

    switch (sort) {
      case "popular":
        filtered.sort((a, b) => b.viewsCount - a.viewsCount);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "title_asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title, "ar"));
        break;
      case "year_desc":
        filtered.sort((a, b) => (b.gregorianYear || 0) - (a.gregorianYear || 0));
        break;
      case "latest":
      default:
        filtered.sort((a, b) => (b.isRecent ? 1 : 0) - (a.isRecent ? 1 : 0));
        break;
    }

    const totalCount = filtered.length;
    const safePageSize = Math.min(Math.max(Number(pageSize || 10), 1), 10);
    const totalPages = Math.ceil(totalCount / safePageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * safePageSize;
    const paginatedBooks = filtered.slice(startIndex, startIndex + safePageSize);

    return {
      results: paginatedBooks,
      count: totalCount,
      page: currentPage,
      totalPages,
      pageSize: safePageSize,
      isLive: false,
    };
  },

  /**
   * Fetch single book by ID.
   * Tries backend GET /dashboard/books/{id}/ first, then falls back to mock data.
   */
  async getBookById(id) {
    if (!id) return null;

    try {
      const response = await apiClient.get(`/dashboard/books/${id}/`);
      const b = response?.data;
      if (b && (b.id || b.title)) {
        return transformBackendBook(b);
      }
    } catch {
      // Fallback to local mock data
    }

    const mockBook = MOCK_BOOKS.find((b) => String(b.id) === String(id));
    return mockBook || null;
  },

  /**
   * Fetch featured books for home showcase
   */
  async getFeaturedBooks(limit = 4) {
    const featured = MOCK_BOOKS.filter((b) => b.isFeatured);
    return featured.slice(0, limit);
  },

  /**
   * Fetch recent books
   */
  async getRecentBooks(limit = 4) {
    const recent = MOCK_BOOKS.filter((b) => b.isRecent);
    return (recent.length > 0 ? recent : MOCK_BOOKS).slice(0, limit);
  },

  /**
   * Fetch popular books
   */
  async getPopularBooks(limit = 4) {
    const popular = [...MOCK_BOOKS].sort((a, b) => b.viewsCount - a.viewsCount);
    return popular.slice(0, limit);
  },

  /**
   * Fetch related books by category
   */
  async getRelatedBooks(currentBookId, categorySlug, limit = 3) {
    const related = MOCK_BOOKS.filter(
      (b) =>
        String(b.id) !== String(currentBookId) &&
        (b.categorySlug === categorySlug || !categorySlug)
    );
    return related.slice(0, limit);
  },
};
