"use client";

import { useState, useEffect } from "react";

export interface FavoriteAnime {
  id: number;
  name: string;
  russian: string;
  image: {
    original: string;
    preview: string;
  };
  score: number;
  status: string;
  episodes: number;
  addedAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка избранных из localStorage при монтировании
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem("anime-favorites");
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = (newFavorites: FavoriteAnime[]) => {
    try {
      localStorage.setItem("anime-favorites", JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  const addToFavorites = (anime: any) => {
    const favorite: FavoriteAnime = {
      id: anime.id,
      name: anime.name,
      russian: anime.russian,
      image: anime.image,
      score: anime.score,
      status: anime.status,
      episodes: anime.episodes || anime.episodes_aired || 0,
      addedAt: new Date().toISOString(),
    };

    const exists = favorites.some(fav => fav.id === anime.id);
    if (!exists) {
      const newFavorites = [...favorites, favorite];
      saveFavorites(newFavorites);
      return true;
    }
    return false;
  };

  const removeFromFavorites = (animeId: number) => {
    const newFavorites = favorites.filter(fav => fav.id !== animeId);
    saveFavorites(newFavorites);
    return true;
  };

  const toggleFavorite = (anime: any) => {
    const exists = favorites.some(fav => fav.id === anime.id);
    if (exists) {
      return removeFromFavorites(anime.id);
    } else {
      return addToFavorites(anime);
    }
  };

  const isFavorite = (animeId: number) => {
    return favorites.some(fav => fav.id === animeId);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  const clearFavorites = () => {
    saveFavorites([]);
  };

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    clearFavorites,
    loadFavorites,
  };
}