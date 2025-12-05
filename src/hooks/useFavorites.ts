import { useState, useCallback, useEffect } from 'react';
import { FavoriteChart } from '@/types';

const STORAGE_KEY = 'aurora-vibe-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteChart[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed.map((item: FavoriteChart) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })));
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  }, [favorites]);

  const addFavorite = useCallback((
    name: string,
    prompt: string,
    vegaLiteSpec: object,
    datasetName: string
  ) => {
    const newFavorite: FavoriteChart = {
      id: Date.now().toString(),
      name,
      prompt,
      vegaLiteSpec,
      createdAt: new Date(),
      datasetName,
    };

    setFavorites(prev => [newFavorite, ...prev]);
    return newFavorite;
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateFavorite = useCallback((id: string, updates: Partial<FavoriteChart>) => {
    setFavorites(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    updateFavorite,
    clearFavorites,
  };
}
