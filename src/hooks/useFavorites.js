"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { favoritesService } from "@/services/favoritesService";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(() => favoritesService.getCachedFavoriteIds());
  const [count, setCount] = useState(() => favoritesService.getCachedCount());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef(null);

  const isReader = isAuthenticated && user?.role?.code === "READER";

  // Sync with backend when authenticated as READER
  const syncWithBackend = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      setCount(0);
      setIsLoaded(true);
      return;
    }

    // Role check: Only READER can use favorites
    if (user?.role?.code && user.role.code !== "READER") {
      setFavoriteIds([]);
      setCount(0);
      setIsLoaded(true);
      return;
    }

    try {
      setIsSyncing(true);
      const liveIds = await favoritesService.fetchAllFavoriteIds();
      setFavoriteIds(liveIds);
      setCount(favoritesService.getCachedCount());
    } catch (err) {
      // Fallback to cached state
    } finally {
      setIsSyncing(false);
      setIsLoaded(true);
    }
  }, [isAuthenticated, user?.role?.code]);

  useEffect(() => {
    // Initial sync from cache
    setFavoriteIds(favoritesService.getCachedFavoriteIds());
    setCount(favoritesService.getCachedCount());

    // Listen to custom cross-component events
    const handleSync = (event) => {
      if (event.detail) {
        if (Array.isArray(event.detail.ids)) {
          setFavoriteIds(event.detail.ids);
        }
        if (typeof event.detail.count === "number") {
          setCount(event.detail.count);
        }
      }
    };

    window.addEventListener("favorites-updated", handleSync);

    // Trigger backend sync after mount
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncWithBackend();
    }, 50);

    return () => {
      window.removeEventListener("favorites-updated", handleSync);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [syncWithBackend]);

  const isFavorite = useCallback(
    (bookId) => {
      if (!bookId) return false;
      const numId = Number(bookId);
      return favoriteIds.some((id) => Number(id) === numId);
    },
    [favoriteIds]
  );

  const addFavorite = useCallback(
    async (bookId) => {
      if (!isAuthenticated) {
        const error = new Error("يرجى تسجيل الدخول بحساب قارئ لإضافة الكتب إلى المفضلة.");
        error.code = "AUTH_REQUIRED";
        throw error;
      }

      if (user?.role?.code && user.role.code !== "READER") {
        const error = new Error("ميزة المفضلة متاحة لحسابات القراء فقط.");
        error.code = "PERMISSION_DENIED";
        throw error;
      }

      const numId = Number(bookId);

      // Optimistic update
      setFavoriteIds((prev) => (prev.includes(numId) ? prev : [...prev, numId]));
      setCount((prev) => (favoriteIds.includes(numId) ? prev : prev + 1));

      try {
        const result = await favoritesService.addFavorite(numId);
        return result;
      } catch (err) {
        // Rollback on failure
        const cached = favoritesService.getCachedFavoriteIds();
        setFavoriteIds(cached);
        setCount(favoritesService.getCachedCount());
        throw err;
      }
    },
    [isAuthenticated, user?.role?.code, favoriteIds]
  );

  const removeFavorite = useCallback(
    async (bookId) => {
      if (!isAuthenticated) {
        const error = new Error("يرجى تسجيل الدخول لإدارة المفضلة.");
        error.code = "AUTH_REQUIRED";
        throw error;
      }

      const numId = Number(bookId);

      // Optimistic update
      setFavoriteIds((prev) => prev.filter((id) => Number(id) !== numId));
      setCount((prev) => Math.max(0, prev - 1));

      try {
        const result = await favoritesService.removeFavorite(numId);
        return result;
      } catch (err) {
        // Rollback on failure
        const cached = favoritesService.getCachedFavoriteIds();
        setFavoriteIds(cached);
        setCount(favoritesService.getCachedCount());
        throw err;
      }
    },
    [isAuthenticated]
  );

  const toggleFavorite = useCallback(
    async (bookId) => {
      const active = isFavorite(bookId);
      if (active) {
        await removeFavorite(bookId);
        return { success: true, isFavorite: false, action: "removed" };
      } else {
        const res = await addFavorite(bookId);
        return { success: true, isFavorite: true, action: "added", code: res.code };
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favoriteIds,
    count,
    isLoaded,
    isSyncing,
    isReader,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refreshFavorites: syncWithBackend,
  };
}
