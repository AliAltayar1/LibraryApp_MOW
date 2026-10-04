import { MOCK_BOOKS } from "@/data/mockBooks";
import { apiClient } from "@/lib/apiClient";

/**
 * Service layer for books.
 * Designed to seamlessly transition to Django REST Framework / Ninja endpoints later.
 */
export const booksService = {
  /**
   * Fetch all books with filtering, searching, and pagination support.
   */
  async getBooks({
    query = "",
    category = "all",
    sort = "latest",
    language = "all",
    format = "all",
    page = 1,
    pageSize = 9,
  } = {}) {
    let filtered = [...MOCK_BOOKS];

    // Search query filter (title, author, description)
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

    // Category filter
    if (category && category !== "all") {
      filtered = filtered.filter(
        (b) => b.categorySlug === category || b.category === category
      );
    }

    // Language filter
    if (language && language !== "all") {
      const langMap = { ar: "العربية", en: "الإنجليزية", fr: "الفرنسية" };
      filtered = filtered.filter(
        (b) => b.language === (langMap[language] || language)
      );
    }

    // Format filter
    if (format && format !== "all") {
      filtered = filtered.filter((b) => b.format === format);
    }

    // Sorting
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
        // By default, sort by ID descending or recent
        filtered.sort((a, b) => (b.isRecent ? 1 : 0) - (a.isRecent ? 1 : 0));
        break;
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedBooks = filtered.slice(startIndex, startIndex + pageSize);

    return {
      results: paginatedBooks,
      count: totalCount,
      page: currentPage,
      totalPages,
      pageSize,
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
        return {
          id: b.id,
          title: b.title,
          author: typeof b.author === "object" ? b.author?.name : (b.author || "مجهول"),
          category: typeof b.category === "object" ? b.category?.name : (b.category || "عام"),
          categorySlug: b.categorySlug || "general",
          year: b.publication_year ? `${b.publication_year} م` : "—",
          pages: b.pages || 0,
          isbn: b.isbn || "",
          publisher: b.publisher || b.library_name || "وزارة الأوقاف السورية",
          description: b.description || "مصنف رقمي مسجل في قاعدة بيانات الوزارة.",
          rating: b.rating || 5.0,
          reviewsCount: b.reviewsCount || 1,
          viewsCount: b.viewsCount || 0,
          downloadsCount: b.count_borrowed || 0,
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
          possition: b.possition || "",
          library_name: b.library_name || "",
          governorate_name: b.governorate_name || "",
          isFavorite: false,
        };
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
