import { MOCK_BOOKS } from "@/data/mockBooks";

const STORAGE_KEY = "mow_library_favorites";

export const favoritesService = {
  getFavoriteIds() {
    if (typeof window === "undefined") {
      return MOCK_BOOKS.filter((b) => b.isFavorite).map((b) => b.id);
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const initial = MOCK_BOOKS.filter((b) => b.isFavorite).map((b) => b.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch {
      return MOCK_BOOKS.filter((b) => b.isFavorite).map((b) => b.id);
    }
  },

  async getFavoriteBooks() {
    const ids = this.getFavoriteIds();
    return MOCK_BOOKS.filter((b) => ids.includes(b.id));
  },

  toggleFavorite(bookId) {
    if (typeof window === "undefined") return false;
    try {
      const current = this.getFavoriteIds();
      let updated;
      const isFav = current.includes(bookId);
      if (isFav) {
        updated = current.filter((id) => id !== bookId);
      } else {
        updated = [...current, bookId];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("favorites-updated", { detail: updated }));
      return !isFav;
    } catch {
      return false;
    }
  },

  isFavorite(bookId) {
    const current = this.getFavoriteIds();
    return current.includes(bookId);
  },
};
