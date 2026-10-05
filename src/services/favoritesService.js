import { apiClient, getAccessToken } from "@/lib/apiClient";
import { transformBackendBook } from "@/services/booksService";

const CACHE_STORAGE_KEY = "mow_library_favorites_cache";
const PAGE_SIZE = 10;

/**
 * Service for reader favorites strictly adhering to the Backend API Contract:
 * - Reader role only (READER). Other roles get 403 PERMISSION_DENIED.
 * - POST /dashboard/books/{book_id}/favorite/ (empty body {}, idempotent, 201 FAVORITE_CREATED or 200 FAVORITE_ALREADY_EXISTS)
 * - GET /dashboard/favorites/ (paginated by 10, latest first, returns Book objects)
 * - DELETE /dashboard/books/{book_id}/favorite/ (idempotent, 200 FAVORITE_REMOVED or 200 FAVORITE_ALREADY_ABSENT)
 * - Trailing slashes are strictly enforced.
 */
export const favoritesService = {
  /**
   * Get cached IDs synchronously from localStorage (for immediate zero-flicker UI rendering).
   */
  getCachedFavoriteIds() {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CACHE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.ids)) return parsed.ids;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  /**
   * Get cached total count synchronously.
   */
  getCachedCount() {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem(CACHE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.count === "number") return parsed.count;
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      // Fallback
    }
    return 0;
  },

  /**
   * Update cached IDs in localStorage and notify listeners.
   */
  setCachedFavorites(ids = [], count = null) {
    if (typeof window === "undefined") return;
    try {
      const safeIds = Array.isArray(ids) ? ids.map(Number) : [];
      const safeCount = typeof count === "number" ? count : safeIds.length;
      const cacheData = {
        ids: safeIds,
        count: safeCount,
        updatedAt: Date.now(),
      };
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheData));
      window.dispatchEvent(
        new CustomEvent("favorites-updated", {
          detail: { ids: safeIds, count: safeCount },
        })
      );
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Clear cache (e.g. on logout or user role change).
   */
  clearCache() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent("favorites-updated", {
          detail: { ids: [], count: 0 },
        })
      );
    } catch {
      // Ignore
    }
  },

  /**
   * Fetch paginated favorite books from GET /dashboard/favorites/
   * Returns transformed Book objects with isFavorite: true.
   *
   * @param {Object} options
   * @param {number} options.page - Page number (defaults to 1)
   */
  async getFavorites({ page = 1 } = {}) {
    const pageNum = Math.max(1, Number(page) || 1);
    const endpoint = pageNum > 1 ? `/dashboard/favorites/?page=${pageNum}` : "/dashboard/favorites/";

    const response = await apiClient.get(endpoint);
    const envelopeData = response?.data || {};
    const rawResults = envelopeData.results || [];
    const count = envelopeData.count ?? rawResults.length;

    const transformedBooks = rawResults.map((rawBook) => {
      const book = transformBackendBook(rawBook);
      return {
        ...book,
        isFavorite: true,
      };
    });

    const totalPages = Math.ceil(count / PAGE_SIZE) || 1;

    return {
      results: transformedBooks,
      count,
      next: envelopeData.next || null,
      previous: envelopeData.previous || null,
      page: pageNum,
      totalPages,
      raw: envelopeData,
    };
  },

  /**
   * Fetches all favorite IDs for the reader to build an in-memory/cache Set.
   * Fetches page 1, and if count > 10, loads remaining pages in parallel.
   */
  async fetchAllFavoriteIds() {
    const hasToken = typeof window !== "undefined" ? !!getAccessToken() : false;
    if (!hasToken) {
      return [];
    }

    try {
      // Fetch page 1
      const firstPage = await this.getFavorites({ page: 1 });
      let allIds = (firstPage.results || []).map((b) => Number(b.id));
      const totalCount = firstPage.count || allIds.length;
      const totalPages = firstPage.totalPages || 1;

      // If more than 1 page exists, fetch remaining pages in parallel (up to 10 pages for safety)
      if (totalPages > 1) {
        const remainingPagePromises = [];
        const maxPagesToFetch = Math.min(totalPages, 15);
        for (let p = 2; p <= maxPagesToFetch; p++) {
          remainingPagePromises.push(
            this.getFavorites({ page: p }).catch(() => ({ results: [] }))
          );
        }
        const remainingPages = await Promise.all(remainingPagePromises);
        remainingPages.forEach((res) => {
          if (res?.results) {
            res.results.forEach((b) => {
              const numId = Number(b.id);
              if (!allIds.includes(numId)) {
                allIds.push(numId);
              }
            });
          }
        });
      }

      this.setCachedFavorites(allIds, totalCount);
      return allIds;
    } catch (err) {
      // Return cached IDs if live fetch fails (e.g. offline)
      return this.getCachedFavoriteIds();
    }
  },

  /**
   * Add a book to favorites via POST /dashboard/books/{book_id}/favorite/
   * Strictly passes empty object {} in the request body (no fields allowed).
   *
   * Responses:
   * - 201 FAVORITE_CREATED
   * - 200 FAVORITE_ALREADY_EXISTS
   * - 403 PERMISSION_DENIED
   * - 404 NOT_FOUND
   *
   * @param {number|string} bookId
   */
  async addFavorite(bookId) {
    if (!bookId) {
      throw new Error("معرف الكتاب مطلوب.");
    }

    const numId = Number(bookId);
    // Explicit empty body {} with trailing slash
    const response = await apiClient.post(`/dashboard/books/${numId}/favorite/`, {});

    // Update local cache and notify listeners
    const currentIds = this.getCachedFavoriteIds();
    const updatedIds = currentIds.includes(numId) ? currentIds : [...currentIds, numId];
    const currentCount = this.getCachedCount();
    const updatedCount = currentIds.includes(numId) ? currentCount : currentCount + 1;
    this.setCachedFavorites(updatedIds, updatedCount);

    return {
      success: true,
      code: response?.code || "FAVORITE_CREATED",
      message: response?.message || "تمت إضافة الكتاب إلى المفضلة بنجاح.",
      data: response?.data ? transformBackendBook(response.data) : null,
    };
  },

  /**
   * Remove a book from favorites via DELETE /dashboard/books/{book_id}/favorite/
   * No body sent. Idempotent.
   *
   * Responses:
   * - 200 FAVORITE_REMOVED
   * - 200 FAVORITE_ALREADY_ABSENT
   *
   * @param {number|string} bookId
   */
  async removeFavorite(bookId) {
    if (!bookId) {
      throw new Error("معرف الكتاب مطلوب.");
    }

    const numId = Number(bookId);
    // Trailing slash enforced
    const response = await apiClient.delete(`/dashboard/books/${numId}/favorite/`);

    // Update local cache and notify listeners
    const currentIds = this.getCachedFavoriteIds();
    const updatedIds = currentIds.filter((id) => Number(id) !== numId);
    const currentCount = this.getCachedCount();
    const updatedCount = Math.max(0, currentIds.length !== updatedIds.length ? currentCount - 1 : currentCount);
    this.setCachedFavorites(updatedIds, updatedCount);

    return {
      success: true,
      code: response?.code || "FAVORITE_REMOVED",
      message: response?.message || "تمت إزالة الكتاب من المفضلة بنجاح.",
    };
  },

  /**
   * Check if a book ID is in favorites cache.
   *
   * @param {number|string} bookId
   */
  isFavorite(bookId) {
    const ids = this.getCachedFavoriteIds();
    return ids.some((id) => Number(id) === Number(bookId));
  },
};
