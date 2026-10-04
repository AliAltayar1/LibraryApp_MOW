"use client";

import { useState, useEffect, useCallback } from "react";
import { favoritesService } from "@/services/favoritesService";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initial sync
    setFavoriteIds(favoritesService.getFavoriteIds());
    setIsLoaded(true);

    const handleSync = (event) => {
      if (event.detail) {
        setFavoriteIds(event.detail);
      }
    };

    window.addEventListener("favorites-updated", handleSync);
    return () => {
      window.removeEventListener("favorites-updated", handleSync);
    };
  }, []);

  const isFavorite = useCallback(
    (bookId) => favoriteIds.includes(bookId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((bookId) => {
    return favoritesService.toggleFavorite(bookId);
  }, []);

  return {
    favoriteIds,
    count: favoriteIds.length,
    isLoaded,
    isFavorite,
    toggleFavorite,
  };
}
